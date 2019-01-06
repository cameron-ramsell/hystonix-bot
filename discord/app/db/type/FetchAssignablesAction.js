const DatabaseAction = require(__root + "/app/db/DatabaseAction.js");
const Ticket = require(__root + "/app/ticket/Ticket.js");

module.exports = class FetchAssignablesAction extends DatabaseAction {

	constructor() {
		super();
	}

	async execute(con) {

		let row = await con.query(`SELECT * FROM assignable`);

		return row;

	}

}