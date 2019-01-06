const Express = require('express');

const TermsOfServiceRoute = require(__root + "/app/route/tos/TermsOfServiceRoute.js");
const IpcController = require(__root + "/app/ipc/IpcController.js");

module.exports = class WebInstance {

	constructor() {

		this.startApplication();

	}

	async startApplication() {

		this.ipcController = new IpcController();

		await this.ipcController.initialize();

		this.express = Express();

		this.express.set('view engine', 'ejs');

		this.express.get('/', (req, res) => res.send("Nothing to see here"));
		this.express.use('/tos', new TermsOfServiceRoute(this.ipcController).createRouter());

		this.express.use("/static/", Express.static(__root + "/static/"))

		this.express.listen(80);

	}

}