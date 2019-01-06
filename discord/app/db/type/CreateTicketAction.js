const DatabaseAction = require(__root + "/app/db/DatabaseAction.js");

module.exports = class CreateTicketAction extends DatabaseAction {

	constructor(channel, owner) {
		super();

		this.channel = channel;
		this.owner = owner;
	}

	async execute(con) {

		try {
			let result = await con.query(`INSERT INTO ticket (state, channel, owner) VALUES ("0", "${this.channel}", "${this.owner}")`);
			return result.insertId;
		} catch(ex) {
			console.error(ex);
			return false;
		}
	}

}