const DatabaseAction = require(__root + "/app/db/DatabaseAction.js");

module.exports = class DeleteAssignedRoleAction extends DatabaseAction {

	constructor(ticketId, assignedId) {
		super();

		this.ticketId = ticketId;
		this.assignedId = assignedId;
	}

	async execute(con) {

		try {

			let result = await con.query(`DELETE FROM assigned WHERE ticket_id=${this.ticketId} AND assigned_id=${this.assignedId}`);
			return true;

		} catch(ex) {
			console.error(ex);
			return false;
		}
	}

}