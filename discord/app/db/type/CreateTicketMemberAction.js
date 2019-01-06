const DatabaseAction = require(__root + "/app/db/DatabaseAction.js");

module.exports = class CreateTicketMemberAction extends DatabaseAction {

	constructor(ticketId, member) {
		super();

		this.ticketId = ticketId;
		this.member = member;
	}

	async execute(con) {

		try {

			let result = await con.query(`INSERT INTO member (ticket_id, member, type) VALUES ("${this.ticketId}", "${this.member.member}", "${this.member.type}") ON DUPLICATE KEY UPDATE type="${this.member.type}"`);
			return true;

		} catch(ex) {
			console.error(ex);
			return false;
		}
	}

}