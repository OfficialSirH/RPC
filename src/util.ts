export let register: (scheme: string) => boolean = () => false;
try {
	const { app } = require('electron');
	register = app.setAsDefaultProtocolClient.bind(app);
} catch (err) {
	try {
		register = require('register-scheme');
	} catch (e) {} // eslint-disable-line no-empty
}

export function getPid() {
	if (typeof globalThis.process !== 'undefined') {
		return process.pid;
	}

	return null;
}
