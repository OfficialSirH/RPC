import { RPCErrorCodes, RPCErrorDispatchData } from './constants';

export class RPCEventError extends Error {
	code?: RPCErrorCodes;
	data?: RPCErrorDispatchData;

	constructor(data: RPCErrorDispatchData | string) {
		if (typeof data === 'string') {
			super(data);
			return;
		}
		super(data.message);
		this.name = 'RPCEventError';
		this.code = data.code;
		this.data = data;
	}
}
