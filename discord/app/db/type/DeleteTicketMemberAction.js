const DatabaseAction = require(__root + "/app/db/DatabaseAction.js");

module.exports = class DeleteTicketMemberAction extends DatabaseAction {

	constructor(ticketId, snowflake) {
		super();

		this.ticketId = ticketId;
		this.snowflake = snowflake;
	}

	async execute(con) {

		try {

			let result = await con.query(`DELETE FROM memeber WHERE ticket_id=${this.ticketId} AND member=${this.snowflake}`);
			return true;

		} catch(ex) {
			console.error(ex);
			return false;
		}
	}

}