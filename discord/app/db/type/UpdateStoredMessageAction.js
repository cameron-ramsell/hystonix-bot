const DatabaseAction = require(__root + "/app/db/DatabaseAction.js");

module.exports = class UpdateStoredMessageAction extends DatabaseAction {

	constructor(ticketId, messageType, messageId) {
		super();

		this.ticketId = ticketId;
		this.messageType = messageType;
		this.messageId = messageId;
	}

	async execute(con) {

		try {
			await con.query(`INSERT INTO ticket_message (ticket_id, message_type, message_id) VALUES ("${this.ticketId}", "${this.messageType}", "${this.messageId}") ON DUPLICATE KEY UPDATE message_id="${this.messageId}"`);
			return true;
		} catch(ex) {
			console.error(ex);
			return false;
		}
	}

}