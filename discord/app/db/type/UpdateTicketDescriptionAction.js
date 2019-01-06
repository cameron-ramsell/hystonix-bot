const DatabaseAction = require(__root + "/app/db/DatabaseAction.js");

module.exports = class UpdateTicketDescriptionAction extends DatabaseAction {

	constructor(ticketId, description) {
		super();

		this.ticketId = ticketId;
		this.description = description;
	}

	async execute(con) {

		try {
			await con.query(`UPDATE ticket SET description="${this.description}" WHERE id=${this.ticketId}`);
			return true;
		} catch(ex) {
			console.error(ex);
			return false;
		}
	}

}