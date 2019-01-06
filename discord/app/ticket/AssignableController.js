const FetchAssignablesAction = require(__root + "/app/db/type/FetchAssignablesAction.js");
const DiscordResolver = require(__root + "/app/util/DiscordResolver.js");

module.exports = class AssignableController {

	constructor(databaseController) {

		this.databaseController = databaseController;

	}

	async loadData() {

		let dbData = await this.databaseController.executeAction(new FetchAssignablesAction());

		if(!dbData)
			throw new Error("FATAL: Failed to load assignables.");

		this.assignableIdMap = {};
		this.assignableRoleMap = {};
		this.assignableNameMap = {};

		for(let assignable of dbData) {

			let obj = {

				id: assignable.id,

				name: assignable.name,
				displayName: assignable.display_name,

				roleId: assignable.role_id

			};

			// To allow both values to be assignable to.
			this.assignableIdMap[assignable.id] = obj;
			this.assignableRoleMap[assignable.role_id] = obj;
			this.assignableNameMap[assignable.name] = obj;

		}

		console.log(`[Assignable] Loaded ${ Object.keys(this.assignableIdMap).length} assignables!`);
		for(let assignable of Object.values(this.assignableIdMap)) {
			console.log("\t- " + assignable.displayName);
		}
	}

	getAssignableByResolveable(resolveable) {
		return this.getAssignableById(resolveable) || this.getAssignableByName(resolveable) || this.getAssignableByRoleId(resolveable);
	}

	getAssignableById(id) {
		return this.assignableIdMap[id];
	}

	getAssignableByName(name) {
		return this.assignableNameMap[name];
	}

	getAssignableByRoleId(id) {
		let resolved = DiscordResolver.resolve(id);
		
		return this.assignableRoleMap[resolved];
	}

}