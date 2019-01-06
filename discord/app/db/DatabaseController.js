const mysql = require("promise-mysql");
const DatabaseAction = require(__root + "/app/db/DatabaseAction.js");

module.exports = class DatabaseController {

	constructor(configuration) {

		this.configuration = configuration;

	}

	/*
		The initialize function is used to "set-up" the controller, by creating a connection pool. We do this here instead of the constructor to allow for
		an async/await system, meaning we can initialize different systems simultaneously - less so in this case, but it is useful in terms of being consistent. 
	*/
	async initialize() {

		let conf = this.configuration;

		this.connectionPool = mysql.createPool({

			connectionLimit: 10,
			host: conf.host,
			user: conf.username,
			password: conf.password,
			database: conf.database

		});

	}

	async executeAction(databaseAction) {
		
		if(!(databaseAction instanceof DatabaseAction))
			throw new Error("Value passed to DatabaseController#executeAction is not derived from class DatabaseAction");

		let con = await this.connectionPool.getConnection();

		let value;
		try {
			value = await databaseAction.execute(con);
		} catch(ex) {
			console.log("Uncatched error while executing database action! Inconsistencies may occur between instance and database, Please investigate");
			throw ex;
		}

		con.release();

		return value;
	}

}
