const DatabaseAction = require(__root + "/app/db/DatabaseAction.js");

module.exports = class FetchTicketIdByTokenAction extends DatabaseAction {

	constructor(token) {
		super();

		this.token = token;
	}

	async execute(con) {

		let row = await con.query(`SELECT ticket_id FROM tos_token WHERE token="${this.token}" LIMIT 1`);
		row = row[0];

		return row;

	}

}