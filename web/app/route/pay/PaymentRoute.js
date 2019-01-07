const Express = require("express");
const BodyParser = require("body-parser");

module.exports = class PaymentRoute {

	constructor(ipcController) {
		this.ipcController = ipcController
	}

	createRouter() {

		this.router = Express.Router();

		this.router.get('/', (req, res) => this.handleRoot(req, res));

		return this.router;

	}

	handleRoot(req, res) {

		res.render('pay/index');

	}

}