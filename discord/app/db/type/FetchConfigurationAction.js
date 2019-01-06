const DatabaseAction = require(__root + "/app/db/DatabaseAction.js");

module.exports = class FetchConfigurationAction extends DatabaseAction {

	constructor(controllerId) {
		super();

		this.controllerId = controllerId;
	}

	async execute(con) {

		let results = await con.query(`SELECT \`key\`,\`value\` FROM conf WHERE controller="${this.controllerId}";`);

		let keyMap = {};

		for(let result of results) {

			keyMap[result.key] = result.value;

		}

		return keyMap;
	}

}