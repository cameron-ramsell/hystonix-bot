const ipc = require("node-ipc");

module.exports = class IpcController {

	constructor() {

	}

	async initialize() {

		ipc.config.id = "master";
		ipc.config.silent = true;

		let startPromise = new Promise((res, rej) => {
			ipc.serve(() => res());
		});

		ipc.server.start();

		await startPromise;
	}

	on(id, callback) {

		ipc.server.on(id, (data, socket) => {

			callback(data, socket, (sendToRespond) => {

				ipc.server.emit(socket, id + "_response", sendToRespond);

			})

		});

	}

}