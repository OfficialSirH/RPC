let register;
try {
	const { app } = require('electron');
	register = app.setAsDefaultProtocolClient.bind(app);
} catch (err) {
	try {
		register = require('register-scheme');
	} catch (e) {} // eslint-disable-line no-empty
}

if (typeof register !== 'function') {
	register = () => false;
}

export function getPid() {
	if (typeof globalThis.process !== 'undefined') {
		return process.pid;
	}

	return null;
}
