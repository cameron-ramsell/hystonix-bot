const DatabaseAction = require(__root + "/app/db/DatabaseAction.js");

module.exports = class CreateAssignedRoleAction extends DatabaseAction {

	constructor(ticketId, assignedId) {
		super();

		this.ticketId = ticketId;
		this.assignedId = assignedId;
	}

	async execute(con) {

		try {

			let result = await con.query(`INSERT INTO assigned (ticket_id, assigned_id) VALUES ("${this.ticketId}", "${this.assignedId}")`);
			return true;

		} catch(ex) {
			return false;
		}
	}

}