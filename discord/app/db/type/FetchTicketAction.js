const DatabaseAction = require(__root + "/app/db/DatabaseAction.js");

module.exports = class FetchTicketAction extends DatabaseAction {

	constructor(ticketId) {
		super();

		this.ticketId = ticketId;
	}

	async execute(con) {

		let row = await con.query(`SELECT * FROM ticket WHERE id=${this.ticketId} LIMIT 1`);
		row = row[0];
		
		let messages = await con.query(`SELECT message_type,message_id FROM ticket_message WHERE ticket_id=${this.ticketId}`);

		let mesMap = {};
		for(let message of messages) {
			mesMap[message.message_type] = message.message_id;
		}

		row.messages = mesMap;

		row.assigned = await con.query(`SELECT assigned_id FROM assigned WHERE ticket_id=${ this.ticketId }`);

		row.members = await con.query(`SELECT * FROM member WHERE ticket_id=${ this.ticketId }`);

		return row;

	}

}