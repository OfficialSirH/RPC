import { AsyncEventEmitter } from '@vladfrangu/async_event_emitter';
import { RPCMessagePayload } from 'discord-api-types/v10';
import { Buffer } from 'node:buffer';
import { randomUUID } from 'node:crypto';
import { Dirent } from 'node:fs';
import { readdir, realpath } from 'node:fs/promises';
import { createConnection, type Socket } from 'node:net';
import { resolve } from 'node:path';
import process from 'node:process';
import type { RPCClient } from './client.js';

enum OPCodes {
	Handshake,
	Frame,
	Close,
	Ping,
	Pong,
}

interface HandshakePayload {
	v: number;
	client_id: string;
}

function isDiscordIPCDirectory(rootParent: string, parent: string, directory: string) {
	if (parent !== rootParent) {
		return true;
	}
	for (const prefix in ['snap.', '.flatpak']) {
		if (directory.startsWith(prefix)) {
			return true;
		}
	}
	return false;
}

function discordIpcFilePredicate(entry: Dirent): boolean {
	return (
		entry.isSocket() &&
		entry.name.startsWith('discord-ipc-') &&
		!isNaN(parseInt(entry.name.slice('discord-ipc-'.length)))
	);
}

async function getIPCPath(id: number) {
	if (process.platform === 'win32') {
		return `\\\\?\\pipe\\discord-ipc-${id}`;
	}

	const { XDG_RUNTIME_DIR, TMPDIR, TMP, TEMP } = process.env;
	let tempPath = await realpath(XDG_RUNTIME_DIR ?? TMPDIR ?? TMP ?? TEMP ?? '/tmp');

	// iterate recursively over directories to find 'snap.' or '.flatpak' pipe
	if (process.platform === 'linux') {
		const directoryQueue = [];
		let directory = await readdir(tempPath, { withFileTypes: true });
		while (directory.length > 0) {
			for (const entry of directory) {
				if (entry.isDirectory()) {
					if (entry.name === '.' || entry.name === '..') {
						continue;
					}
					const dirPath = resolve(entry.parentPath, entry.name);
					if (!isDiscordIPCDirectory(tempPath, dirPath, entry.name)) {
						continue;
					}
					directoryQueue.push(dirPath);
					continue;
				}
				if (discordIpcFilePredicate(entry)) {
					return resolve(entry.parentPath, entry.name);
				}
			}
			while (directory.length === 0 && directoryQueue.length > 0) {
				directory = await readdir(directoryQueue.shift()!, { withFileTypes: true });
			}
		}
	}

	return `${tempPath.replace(/\/$/, '')}/discord-ipc-${id}`;
}

async function getIPC(id = 0): Promise<Socket> {
	const { promise, resolve, reject } = Promise.withResolvers<Socket>();

	const path = await getIPCPath(id);

	const onError = async () => {
		if (id < 10) {
			return getIPC(id + 1);
		}

		reject(new Error('Could not connect'));
		return undefined;
	};

	const socket = createConnection(path, () => {
		socket.removeListener('error', onError);

		resolve(socket);
	});

	socket.once('error', onError);

	return promise;
}

// async function findEndpoint(tries = 0): Promise<string> {
// 	if (tries > 30) {
// 		throw new Error('Could not find endpoint');
// 	}

// 	const endpoint = `http://127.0.0.1:${6_463 + (tries % 10)}`;

// 	try {
// 		const response = await fetch(endpoint);

// 		if (response.status === 404) return endpoint;

// 		return await findEndpoint(tries + 1);
// 	} catch {
// 		return findEndpoint(tries + 1);
// 	}
// }

export function encode(op: number, data: RPCMessagePayload | string | HandshakePayload | Record<string, never>) {
	const stringifiedData = JSON.stringify(data);
	const length = Buffer.byteLength(stringifiedData);
	const packet = Buffer.alloc(8 + length);

	packet.writeInt32LE(op, 0);
	packet.writeInt32LE(length, 4);
	packet.write(stringifiedData, 8, length);

	return packet;
}

interface WorkingData {
	full: string;
	op: number | undefined;
}

const working: WorkingData = {
	full: '',
	op: undefined,
};

export function decode(socket: Socket, callback: (data: { op: OPCodes; data: RPCMessagePayload }) => void) {
	const packet = socket.read();
	if (!packet) {
		return;
	}

	let { op } = working;
	let raw;
	if (working.full === '') {
		op = working.op = packet.readInt32LE(0);
		const len = packet.readInt32LE(4);
		raw = packet.slice(8, len + 8);
	} else {
		raw = packet.toString();
	}

	try {
		const data = JSON.parse(working.full + raw);
		callback({ op: op!, data });
		working.full = '';
		working.op = undefined;
	} catch {
		working.full += raw;
	}

	decode(socket, callback);
}

export class IPCTransport extends AsyncEventEmitter {
	private socket: Socket | null;

	public constructor(public readonly client: RPCClient) {
		super();

		this.socket = null;
	}

	public async connect() {
		this.socket = await getIPC();

		const socket = this.socket;

		socket.on('close', this.onClose.bind(this));
		socket.on('error', this.onClose.bind(this));

		this.emit('open');

		socket.write(
			encode(OPCodes.Handshake, {
				v: 1,
				client_id: this.client.clientId!,
			}),
		);

		socket.pause();

		socket.on('readable', () => {
			decode(socket, ({ op, data }) => {
				switch (op) {
					case OPCodes.Ping:
						this.send(data, OPCodes.Pong);
						break;
					case OPCodes.Frame:
						if (!data) {
							return;
						}

						// if (data.cmd === RPCCommands.Authorize && !('evt' in data)) {
						// 	findEndpoint()
						// 		.then((endpoint) => {
						// 			this.client.request.endpoint = endpoint;
						// 		})
						// 		.catch((error) => {
						// 			this.client.emit('error', error);
						// 		});
						// }

						this.emit('message', data);
						break;
					case OPCodes.Close:
						this.emit('close', data);
						break;
					default:
						break;
				}
			});
		});
	}

	public onClose(error: boolean) {
		this.emit('close', error);
	}

	public send(data: string, op: OPCodes.Ping): void;
	public send(data: RPCMessagePayload, op?: OPCodes.Frame | OPCodes.Pong): void;
	public send(data: Record<string, never>, op: OPCodes.Close): void;
	public send(data: RPCMessagePayload | string | Record<string, never>, op = OPCodes.Frame) {
		this.socket!.write(encode(op, data));
	}

	public async close() {
		const { promise, resolve } = Promise.withResolvers();

		this.once('close', resolve);
		this.send({}, OPCodes.Close);
		this.socket?.end();

		return promise;
	}

	public ping() {
		this.send(randomUUID(), OPCodes.Ping);
	}
}
