const DatabaseAction = require(__root + "/app/db/DatabaseAction.js");

module.exports = class UpdateTicketStateAction extends DatabaseAction {

	constructor(ticketId, state) {
		super();

		this.ticketId = ticketId;
		this.state = state;
	}

	async execute(con) {

		try {
			await con.query(`UPDATE ticket SET state=${this.state} WHERE id=${this.ticketId}`);
			return true;
		} catch(ex) {
			return false;
		}
	}

}