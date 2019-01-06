const Express = require("express");
const BodyParser = require("body-parser");

module.exports = class TermsOfServiceRoute {

	constructor(ipcController) {
		this.ipcController = ipcController
	}

	createRouter() {

		this.router = Express.Router();

		this.router.use(BodyParser.urlencoded({ extended: false }));
		this.router.use(BodyParser.json());

		this.router.get('/', (req, res) => this.handleRoot(req, res));
		this.router.post('/', (req, res) => this.handleRootPost(req, res));

		this.router.get("/success", (req, res) => this.handleSuccess(req, res));
		this.router.get("/error", (req, res) => this.handleError(req, res));
		
		return this.router;

	}

	handleRoot(req, res) {

		res.render("tos/index", {
			token: req.query.token,

			error: req.query.error
		})

	}

	async handleRootPost(req, res) {

		let agreed = req.body.agreement;
		let account = req.body.account;

		if(!agreed)
			return res.redirect("?error=0");

		if(!account)
			return res.redirect("?error=1");

		let response = await this.ipcController.sendAndAwaitResponse("tosAccepted", { token: account });

		if(!response)
			return res.redirect("/tos/error?error=timeout");

		if(!response.success)
			return res.redirect("/tos/error?error=" + response.error);

		res.redirect("/tos/success");

	}

	handleSuccess(req, res) {

		res.render("tos/success");

	}

	handleError(req, res) {

		res.render("tos/error", {
			error: req.query.error
		});

	}

}