import { AsyncEventEmitter } from '@vladfrangu/async_event_emitter';
import {
	RESTPostOAuth2AccessTokenResult,
	RESTPostOAuth2AccessTokenURLEncodedData,
	Routes,
	type APIUser,
	type OAuth2Scopes,
	type Snowflake,
} from 'discord-api-types/v10';
import { randomUUID } from 'node:crypto';
import { clearTimeout, setTimeout } from 'node:timers';
import type {
	LobbyType,
	MappedRPCCommandsArgs,
	MappedRPCCommandsResultsData,
	MappedRPCEventsDispatchData,
	NullableFields,
	RPCCallableCommands,
	RPCCertifiedDevice,
	RPCGetChannelResultData,
	RPCGetChannelsResultData,
	RPCGetGuildResultData,
	RPCGetGuildsResultData,
	RPCGetVoiceSettingsResultData,
	RPCLobbyMetadata,
	RPCMessage,
	RPCMessagePayload,
	RPCOAuth2Application,
	RPCSelectTextChannelArgs,
	RPCSelectTextChannelResultData,
	RPCSelectVoiceChannelArgs,
	RPCSelectVoiceChannelResultData,
	RPCSetActivityArgs,
	RPCSetCertifiedDevicesResultData,
	RPCSetUserVoiceSettingsArgs,
	RPCSetUserVoiceSettingsResultData,
	RPCSetVoiceSettingsArgs,
	RPCSubscribeArgs,
	RPCUnsubscribeResultData,
	RPCUpdateLobbyArgs,
} from './constants.js';
import { Events, RPCCaptureShortcutAction, RPCCommands, RPCEvents } from './constants.js';
import { IPCTransport } from './ipc.js';
import { RPCEventError } from './RPCEventError.js';
import { getPid, mergeRPCLoginOptions } from './util.js';

export interface RPCLoginOptions {
	accessToken: string;
	clientId: string;
	clientSecret: string;
	/**
	 * https://discord.com/developers/docs/topics/oauth2#authorization-code-grant
	 *
	 * for authorization requests
	 */
	prompt?: 'consent' | 'none';
	/**
	 * https://discord.com/developers/docs/topics/oauth2#authorization-code-grant
	 *
	 * for authorization requests
	 */
	redirectUri?: string;
	scopes: OAuth2Scopes[];
	username: string;
}

function subKey(event: RPCEvents, args?: RPCSubscribeArgs) {
	return `${event}${JSON.stringify(args)}`;
}

/**
 * The client for interacting with Discord RPC
 */
export class RPCClient extends AsyncEventEmitter<MappedRPCEventsDispatchData> {
	public options: Partial<RPCLoginOptions>;

	public accessToken: string | null;

	public clientId: string | null;

	public application: RPCOAuth2Application | null;

	public user: APIUser | null;

	public transport: IPCTransport;

	/**
	 * Map of nonces being expected from the transport
	 */
	readonly #expected_nonces: Map<
		string,
		{ reject(this: void, reason?: unknown): void; resolve(this: void, value: unknown): void }
	>;

	/**
	 * Promise for connection
	 */
	#connectPromise: Promise<RPCClient> | undefined;

	#subscriptions: Map<string, Function> = new Map();

	public constructor(options: Partial<RPCLoginOptions> = {}) {
		super();

		this.options = options;

		this.accessToken = null;
		this.clientId = null;
		this.application = null;
		this.user = null;

		this.transport = new IPCTransport(this);
		this.transport.on('message', this.#onRpcMessage.bind(this));

		this.#expected_nonces = new Map();

		this.#connectPromise = undefined;
	}

	/**
	 * Search and connect to RPC
	 */
	public async connect(clientId: string): Promise<RPCClient> {
		if (this.#connectPromise) {
			return this.#connectPromise;
		}

		const { promise, resolve, reject } = Promise.withResolvers<RPCClient>();
		this.#connectPromise = promise;
		this.clientId = clientId;
		const timeout = setTimeout(() => reject(new Error('RPC_CONNECTION_TIMEOUT')), 10e3);
		timeout.unref();
		this.once(RPCEvents.Ready, () => {
			clearTimeout(timeout);
			resolve(this);
		});

		this.transport.once('close', () => {
			for (const exp_nonce of this.#expected_nonces.values()) {
				exp_nonce.reject(new RPCEventError('connection closed'));
			}

			this.emit(Events.Disconnected);
			reject(new Error('connection closed'));
		});

		try {
			await this.transport.connect();
		} catch (error) {
			reject(error);
		}

		return this.#connectPromise;
	}

	/**
	 * Performs authentication flow. Automatically calls Client#connect if needed.
	 *
	 * @param options - Options for authentication.
	 * @example
	 * logging in with a client id and secret
	 * ```ts
	 * client.login({ clientId: '1234567', clientSecret: 'abcdef123' });
	 * ```
	 */
	public async login(options: Partial<RPCLoginOptions> = {}): Promise<RPCClient> {
		const finalizedOptions = mergeRPCLoginOptions(options, this.options);
		const { clientId } = finalizedOptions;
		if (!clientId) {
			throw new Error('A client id must be provided to login');
		}

		await this.connect(clientId);

		const { scopes } = finalizedOptions;
		if (!scopes) {
			this.emit(Events.ApplicationReady);
			return this;
		}

		let { accessToken } = finalizedOptions;
		if (!accessToken) {
			accessToken = await this.authorize(finalizedOptions);
		}
		return this.authenticate(accessToken!);
	}

	/**
	 * Request
	 *
	 * @param cmd - Command
	 * @param args - Arguments
	 * @param evt - Event
	 */
	async #request<Cmd extends RPCCallableCommands = RPCCallableCommands>(
		cmd: Cmd,
		args: MappedRPCCommandsArgs[Cmd] = {} as MappedRPCCommandsArgs[Cmd],
		evt?: RPCEvents,
	) {
		return new Promise(
			(resolve: (value: MappedRPCCommandsResultsData[Cmd]) => void, reject: (reason: RPCEventError) => void) => {
				const nonce = randomUUID();
				const payload: { cmd: Cmd; args: MappedRPCCommandsArgs[Cmd]; nonce: string; evt?: RPCEvents } = {
					cmd,
					args,
					nonce,
				};
				if (cmd === RPCCommands.Subscribe || cmd === RPCCommands.Unsubscribe) {
					payload.evt = evt!;
				}
				this.transport.send(payload as RPCMessagePayload);
				this.#expected_nonces.set(nonce, { resolve, reject });
			},
		);
	}

	/**
	 * Message handler
	 *
	 * @param message - message
	 */
	#onRpcMessage(message: RPCMessage): void {
		if (message.cmd === RPCCommands.Dispatch && message.evt === RPCEvents.Ready) {
			if (message.data.user) {
				this.user = message.data.user;
			}

			this.emit(RPCEvents.Ready, message.data);
		} else if (message.cmd !== RPCCommands.Dispatch) {
			if (!this.#expected_nonces.has(message.nonce)) {
				return;
			}
			const { resolve, reject } = this.#expected_nonces.get(message.nonce)!;
			if ('evt' in message && message.evt === RPCEvents.Error) {
				const e = new RPCEventError(message.data);
				reject(e);
			} else {
				resolve(message.data);
			}

			this.#expected_nonces.delete(message.nonce);
		} else {
			this.emit(message.evt, message.data);
		}
	}

	/**
	 * Authorize
	 *
	 * @param options - authorization options
	 */
	private async authorize({
		scopes,
		clientId,
		clientSecret,
		redirectUri,
	}: Partial<RPCLoginOptions> = {}): Promise<string> {
		const { code } = await this.#request(RPCCommands.Authorize, {
			scopes: scopes!,
			client_id: clientId!,
		});

		const response = (await fetch(`https://discord.com/api${Routes.oauth2TokenExchange()}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			body: new URLSearchParams({
				client_id: this.clientId!,
				client_secret: clientSecret!,
				code,
				grant_type: 'authorization_code',
				redirect_uri: redirectUri!,
			} satisfies RESTPostOAuth2AccessTokenURLEncodedData),
		}).then((res) => res.json())) as RESTPostOAuth2AccessTokenResult;

		if (!('access_token' in response)) {
			throw new Error(response);
		}

		return response.access_token;
	}

	/**
	 * Authenticate
	 *
	 * @param accessToken access token
	 * @private
	 */
	async authenticate(accessToken: string): Promise<this> {
		return this.#request(RPCCommands.Authenticate, { access_token: accessToken }).then(({ application, user }) => {
			this.accessToken = accessToken;
			this.application = application;
			this.user = user;
			this.emit(Events.ApplicationReady);
			return this;
		});
	}

	/**
	 * Fetch a guild
	 *
	 * @param id Guild Id
	 * @param timeout Timeout request
	 */
	async getGuild(id: Snowflake, timeout: number): Promise<RPCGetGuildResultData> {
		return this.#request(RPCCommands.GetGuild, { guild_id: id, timeout });
	}

	/**
	 * Fetch all guilds
	 *
	 * @param timeout Timeout request
	 */
	async getGuilds(timeout: number): Promise<RPCGetGuildsResultData> {
		return this.#request(RPCCommands.GetGuilds, { timeout });
	}

	/**
	 * Get a channel
	 *
	 * @param id Channel Id
	 */
	async getChannel(id: Snowflake): Promise<RPCGetChannelResultData> {
		return this.#request(RPCCommands.GetChannel, { channel_id: id });
	}

	/**
	 * Get all channels
	 *
	 * @param id Guild Id
	 */
	async getChannels(id: Snowflake): Promise<RPCGetChannelsResultData['channels']> {
		const { channels } = await this.#request(RPCCommands.GetChannels, { guild_id: id });
		return channels;
	}

	/**
	 * Tell discord which devices are certified
	 *
	 * @param devices Certified devices to send to discord
	 */
	async setCertifiedDevices(devices: RPCCertifiedDevice[]): Promise<RPCSetCertifiedDevicesResultData> {
		return this.#request(RPCCommands.SetCertifiedDevices, {
			devices,
		});
	}

	/**
	 * Set the voice settings for a user, by id
	 *
	 * @param id Id of the user to set
	 * @param settings Settings to set
	 */
	async setUserVoiceSettings(
		id: Snowflake,
		settings: Omit<Partial<RPCSetUserVoiceSettingsArgs>, 'user_id'>,
	): Promise<RPCSetUserVoiceSettingsResultData> {
		return this.#request(RPCCommands.SetUserVoiceSettings, {
			user_id: id,
			...settings,
		});
	}

	/**
	 * Move the user to a voice channel
	 *
	 * @param id Id of the voice channel
	 * @param options Options
	 * @param options.timeout Timeout for the command
	 * @param options.force Force this move. This should only be done if you
	 *
	 * have explicit permission from the user.
	 */
	async selectVoiceChannel(
		id: Snowflake,
		{ timeout, force = false }: Omit<RPCSelectVoiceChannelArgs, 'channel_id'> = {},
	): Promise<RPCSelectVoiceChannelResultData> {
		const args: RPCSelectVoiceChannelArgs = { channel_id: id, force };
		if (timeout) {
			args.timeout = timeout;
		}
		return this.#request(RPCCommands.SelectVoiceChannel, args);
	}

	/**
	 * Move the user to a text channel
	 *
	 * @param id Id of the voice channel
	 * @param options Options
	 * @param options.timeout Timeout for the command
	 *
	 * have explicit permission from the user.
	 */
	async selectTextChannel(
		id: Snowflake,
		{ timeout }: Omit<RPCSelectTextChannelArgs, 'channel_id'> = {},
	): Promise<RPCSelectTextChannelResultData> {
		const args: RPCSelectTextChannelArgs = { channel_id: id };
		if (timeout) {
			args.timeout = timeout;
		}
		return this.#request(RPCCommands.SelectTextChannel, args);
	}

	/**
	 * Get current voice settings
	 *
	 */
	async getVoiceSettings(): Promise<RPCGetVoiceSettingsResultData> {
		return this.#request(RPCCommands.GetVoiceSettings);
	}

	/**
	 * Set current voice settings, overriding the current settings until this session disconnects.
	 * This also locks the settings for any other rpc sessions which may be connected.
	 *
	 * @param args Settings
	 */
	async setVoiceSettings(args: RPCSetVoiceSettingsArgs): Promise<unknown> {
		return this.#request(RPCCommands.SetVoiceSettings, args);
	}

	/**
	 * @unstable
	 * Capture a shortcut using the client
	 * The callback takes (key, stop) where `stop` is a function that will stop capturing.
	 * This `stop` function must be called before disconnecting or else the user will have
	 * to restart their client.
	 *
	 * @param {Function} callback Callback handling keys
	 * @returns {Promise<Function>}
	 */
	async captureShortcut(callback: Function): Promise<Function> {
		const subid = subKey(RPCEvents.CaptureShortcutChange);
		const stop = async () => {
			this.#subscriptions.delete(subid);
			return this.#request(RPCCommands.CaptureShortcut, { action: RPCCaptureShortcutAction.Stop });
		};

		this.#subscriptions.set(subid, ({ shortcut }: { shortcut: unknown }) => {
			callback(shortcut, stop);
		});
		return this.#request(RPCCommands.CaptureShortcut, { action: RPCCaptureShortcutAction.Start }).then(() => stop);
	}

	/**
	 * Sets the presence for the logged in user.
	 *
	 * @param args The rich presence to pass.
	 * @param pid The application's process ID. Defaults to the executing process' PID.
	 */
	public async setActivity(args: RPCSetActivityArgs['activity'] = {}, pid: number | null = getPid()): Promise<unknown> {
		const newActivity: NullableFields<RPCSetActivityArgs['activity']> = {
			details: args.details,
			state: args.state,
			instance: Boolean(args.instance),
			buttons: args?.buttons,
		};

		if (args.timestamps) {
			newActivity.timestamps = args.timestamps;
			if ('start' in newActivity.timestamps && newActivity.timestamps.start > 2_147_483_647_000) {
				throw new RangeError('timestamps.start must fit into a unix timestamp');
			}

			if ('end' in newActivity.timestamps && newActivity.timestamps.end > 2_147_483_647_000) {
				throw new RangeError('timestamps.end must fit into a unix timestamp');
			}
		}

		if ('assets' in args) {
			newActivity.assets = args.assets;
		}

		if ('party' in args) {
			newActivity.party = args.party;
		}

		if ('secrets' in args) {
			newActivity.secrets = args.secrets;
		}

		return this.#request(RPCCommands.SetActivity, {
			pid: pid ?? 0,
			activity: newActivity as Exclude<RPCSetActivityArgs['activity'], undefined>,
		});
	}

	/**
	 * Clears the currently set presence, if any. This will hide the "Playing X" message
	 * displayed below the user's name.
	 *
	 * @param {number} [pid] The application's process ID. Defaults to the executing process' PID.
	 * @returns {Promise}
	 */
	public async clearActivity(pid: number | null = getPid()): Promise<unknown> {
		return this.#request(RPCCommands.SetActivity, {
			pid: pid ?? 0,
		});
	}

	/**
	 * Invite a user to join the game the RPC user is currently playing
	 *
	 * @param userId The id of the user to invite
	 */
	public async sendJoinInvite(userId: Snowflake): Promise<unknown> {
		return this.#request(RPCCommands.SendActivityJoinInvite, {
			user_id: userId,
		});
	}

	/**
	 * Request to join the game the user is playing
	 *
	 * @param userId The id of the user whose game you want to request to join
	 * @returns {Promise}
	 */
	public async sendJoinRequest(userId: Snowflake): Promise<unknown> {
		return this.#request(RPCCommands.SendActivityJoinRequest, {
			user_id: userId,
		});
	}

	/**
	 * Reject a join request from a user
	 *
	 * @param userId The id of the user whose request you wish to reject
	 */
	public async closeJoinRequest(userId: Snowflake): Promise<unknown> {
		return this.#request(RPCCommands.CloseActivityRequest, {
			user_id: userId,
		});
	}

	/**
	 * @unstable
	 * @param type
	 * @param capacity
	 * @param metadata
	 * @returns
	 */
	public async createLobby(type: LobbyType, capacity: number, metadata: RPCLobbyMetadata) {
		return this.#request(RPCCommands.CreateLobby, {
			type,
			capacity,
			metadata,
		});
	}

	/**
	 * @unstable
	 * @param id lobby id
	 * @param updateLobbyArgs arguments to update the lobby
	 * @returns
	 */
	public async updateLobby(
		id: string,
		{ type, owner_id, capacity, metadata }: Omit<RPCUpdateLobbyArgs, 'id'> = {} as RPCUpdateLobbyArgs,
	) {
		return this.#request(RPCCommands.UpdateLobby, {
			id,
			type,
			owner_id,
			capacity,
			metadata,
		});
	}

	/**
	 * @unstable
	 * @param id lobby id
	 * @returns deleted lobby
	 */
	public async deleteLobby(id: string) {
		return this.#request(RPCCommands.DeleteLobby, {
			id,
		});
	}

	/**
	 * @unstable
	 * @param id lobby id
	 * @param secret secret to access the lobby
	 * @returns connected lobby
	 */
	public async connectToLobby(id: string, secret: string) {
		return this.#request(RPCCommands.ConnectToLobby, {
			id,
			secret,
		});
	}

	/**
	 * @unstable
	 * @param lobbyId id of the lobby
	 * @param data data to send
	 */
	public async sendToLobby(lobbyId: string, data: unknown) {
		return this.#request(RPCCommands.SendToLobby, {
			id: lobbyId,
			data,
		});
	}

	/**
	 * @unstable
	 * @param lobbyId id of the lobby
	 */
	public async disconnectFromLobby(lobbyId: string) {
		return this.#request(RPCCommands.DisconnectFromLobby, {
			id: lobbyId,
		});
	}

	/**
	 * @unstable
	 * @param lobbyId id of the lobby
	 * @param userId id of the user
	 * @param metadata metadata to update
	 */
	public async updateLobbyMember(lobbyId: string, userId: Snowflake, metadata: RPCLobbyMetadata) {
		return this.#request(RPCCommands.UpdateLobbyMember, {
			lobby_id: lobbyId,
			user_id: userId,
			metadata,
		});
	}

	/**
	 * @unstable
	 */
	public async getRelationships() {
		return this.#request(RPCCommands.GetRelationships);
	}

	/**
	 * Subscribe to an event
	 *
	 * @param event - Name of event e.g. `MESSAGE_CREATE`
	 * @param args - Args for event e.g. `{ channel_id: '1234' }`
	 */
	public async subscribe<Evt extends RPCEvents>(
		event: Evt,
		args?: RPCSubscribeArgs,
	): Promise<{ unsubscribe: () => Promise<RPCUnsubscribeResultData> }> {
		await this.#request(RPCCommands.Subscribe, args, event);
		return {
			unsubscribe: async () => this.#request(RPCCommands.Unsubscribe, args, event),
		};
	}

	/**
	 * Destroy the client
	 */
	public async destroy() {
		await this.transport.close();
	}
}
