const DatabaseAction = require(__root + "/app/db/DatabaseAction.js");

module.exports = class FetchTicketIdByChannelIdAction extends DatabaseAction {

	constructor(channelId) {
		super();

		this.channelId = channelId;
	}

	async execute(con) {

		let row = await con.query(`SELECT id FROM ticket WHERE channel="${this.channelId}" LIMIT 1`);
		row = row[0];

		return row;

	}

}