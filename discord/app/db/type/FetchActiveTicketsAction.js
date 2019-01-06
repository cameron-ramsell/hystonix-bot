const DatabaseAction = require(__root + "/app/db/DatabaseAction.js");
const Ticket = require(__root + "/app/ticket/Ticket.js");

module.exports = class FetchActiveTicketsAction extends DatabaseAction {

	constructor() {
		super();
	}

	async execute(con) {

		let row = await con.query(`SELECT id FROM ticket WHERE state <> ${Ticket.TicketState.Archived}`);

		return row;

	}

}