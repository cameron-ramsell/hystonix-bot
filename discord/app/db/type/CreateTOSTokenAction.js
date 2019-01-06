const DatabaseAction = require(__root + "/app/db/DatabaseAction.js");

module.exports = class CreateTOSTokenAction extends DatabaseAction {

	constructor(ticketId, token) {
		super();

		this.ticketId = ticketId;
		this.token = token;
	}

	async execute(con) {

		try {

			let result = await con.query(`INSERT INTO tos_token (ticket_id, token) VALUES ("${this.ticketId}", "${this.token}")`);
			return true;

		} catch(ex) {
			console.error(ex);
			return false;
		}
	}

}