const fs = require("fs");

const DatabaseController = require(__root + "/app/db/DatabaseController.js");
const DiscordController = require(__root + "/app/discord/DiscordController.js");
const TicketController = require(__root + "/app/ticket/TicketController.js");
const IpcController = require(__root + "/app/ipc/IpcController.js");

module.exports = class TicketBot {

	constructor(mainInstance) {

		this.mainInstance = mainInstance;

		this.initializeBot();

	}

	async initializeBot() {

		let dbConf;
		try {
			dbConf = JSON.parse(fs.readFileSync(__root + "/data/conf.json"));
		} catch(ex) {
			throw new Error("Fatal error while loading db configuration! " + ex);
		}

		this.databaseController = new DatabaseController(dbConf);
		this.discordController = new DiscordController(this.databaseController);
		this.ticketController = new TicketController(this.databaseController);
		this.ipcController = new IpcController();

		await this.databaseController.initialize();
		
		await Promise.all([ this.discordController.initialize(this.ticketController),
							this.ticketController.initialize(this.discordController, this.ipcController),
							this.ipcController.initialize() ]);

		this.ticketController.precacheActiveTickets();

	}

}