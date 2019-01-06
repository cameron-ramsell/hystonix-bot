const ipc = require("node-ipc");

module.exports = class IpcController {

	constructor() {

	}

	async initialize() {

		ipc.config.id = "web";
		ipc.config.silent = true;

		let startPromise = new Promise((res, rej) => {
			ipc.connectTo('master', () => {
				ipc.of.master.on('connect', () => res());
			});
		});

		await startPromise;
	}

	send(id, data) {

		ipc.of.master.emit(id, data);

	}

	async sendAndAwaitResponse(id, data) {

		ipc.of.master.emit(id, data);


		return await new Promise((res, rej) => {
			ipc.of.master.on(id + "_response", (data) => {
				res(data);
			});
		});

	}

}