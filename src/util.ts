import { RPCLoginOptions } from './client';

export let register: (scheme: string) => boolean = () => false;
try {
	const { app } = require('electron');
	register = app.setAsDefaultProtocolClient.bind(app);
} catch {
	try {
		register = require('register-scheme');
	} catch {} // eslint-disable-line no-empty
}

export function getPid() {
	if (typeof globalThis.process !== 'undefined') {
		return process.pid;
	}

	return null;
}

export function mergeRPCLoginOptions(
	options: Partial<RPCLoginOptions>,
	otheroptions: Partial<RPCLoginOptions>,
): RPCLoginOptions {
	return {
		clientId: options.clientId! ?? otheroptions.clientId!,
		scopes: options.scopes! ?? otheroptions.scopes!,
		clientSecret: options.clientSecret! ?? otheroptions.clientSecret!,
		redirectUri: options.redirectUri! ?? otheroptions.redirectUri!,
		accessToken: options.accessToken! ?? otheroptions.accessToken!,
		username: options.username! ?? otheroptions.username!,
	};
}
