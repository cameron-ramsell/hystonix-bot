module.exports = class DatabaseAction {

	async execute(databaseConnection) {

		throw new Error(`${this.constructor.name}#execute is not overwritten, and is executed at some point elsewhere.`)

	}

}