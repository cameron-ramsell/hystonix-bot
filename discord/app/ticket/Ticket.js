const DiscordJS = require("discord.js");
const uniqid = require("uniqid");

const FetchTicketAction = require(__root + "/app/db/type/FetchTicketAction.js");
const UpdateTicketStateAction = require(__root + "/app/db/type/UpdateTicketStateAction.js");
const UpdateTicketDescriptionAction = require(__root + "/app/db/type/UpdateTicketDescriptionAction.js");
const UpdateStoredMessageAction = require(__root + "/app/db/type/UpdateStoredMessageAction.js");
const CreateTOSTokenAction = require(__root + "/app/db/type/CreateTOSTokenAction.js");
const CreateAssignedRoleAction = require(__root + "/app/db/type/CreateAssignedRoleAction.js");
const CreateTicketMemberAction = require(__root + "/app/db/type/CreateTicketMemberAction.js");
const DeleteAssignedRoleAction = require(__root + "/app/db/type/DeleteAssignedRoleAction.js");

const TicketState = {

	Unknown: 0,

	Opened: 1,
	OpenedAwaitingChoice: 2,

	Archived: 9999,

	OpenSupport: 100,

	OpenAutomatic: 105,
	OpenAutomaticAwaitingResponse: 106,

	OpenTermsOfService: 200,
	OpenAwaitingTermsOfServiceResponse: 201,
	OpenTermsOfServiceAccepted: 202,

	OpenManualSetup: 205,

	OpenPushed: 900,

	OpenAwaitingFreelancer: 1000,
	OpenFreelancerQuote: 1001,

	OpenPayment: 2000,
	OpenAwaitingPayment: 2002,
	OpenPaymentReceived: 2003,

	OpenInProgress: 1002,

	ClosingAwaitingClientConfirmation: 2001,
	ClosingAwaitingManagementConfirmation: 2002,

	GraceProjectComplete: 5000,
	GraceProjectCancelledByClient: 5001,
	GraceProjectCancelledByManagement: 5002,

};

const StoredMessageType = {

	InitialMessage: 0,
	TermsOfService: 1,
	CommissionAd: 2

};

const MemberType = {
	Viewer: 0,
	Participant: 1
};

module.exports = class Ticket {

	constructor(id, ticketController, discordController, conf) {

		this.id = id;

		this.ticketController = ticketController;
		this.discordController = discordController;

		this.databaseController = ticketController.databaseController;

		this.conf = conf;

		this.state = TicketState.Unknown;
	}

	async loadData() {

		let data = await this.databaseController.executeAction(new FetchTicketAction(this.id));

		this.state = data.state;
		this.channelId = data.channel;
		this.ownerId = data.owner;
		this.description = data.description;

		this.messages = data.messages;
		this.members = data.members;

		if(!this.channel)
			return;

		this.assignedRoles = [];

		for(let assigned of data.assigned) {
			this.assignedRoles.push(this.ticketController.assignableController.getAssignableById(assigned.assigned_id));
		}

		this.switchState(this.state);
		
	}

	registerStoredMessage(type, message) {
		this.messages[type] = message.id;

		return this.databaseController.executeAction(new UpdateStoredMessageAction(this.id, type, message.id));
	}

	async switchState(state) {

		if(this.state !== state)
			await this.databaseController.executeAction(new UpdateTicketStateAction(this.id, state));

		this.state = state;

		switch(state) {
			case TicketState.Opened:
			{
				let embed = new DiscordJS.RichEmbed();

				embed.setColor(this.conf.embedColour);
				embed.setDescription(this.conf.initialMessage);

				embed = await this.channel.send(embed);

				await embed.react("👨");
				//await embed.react("🤖");

				this.registerStoredMessage(StoredMessageType.InitialMessage, embed);

				this.switchState(TicketState.OpenedAwaitingChoice);
				break;
			}
			case TicketState.OpenedAwaitingChoice:
			{
				let message = await this.getStoredMessage(StoredMessageType.InitialMessage);

				if(!message)
					return this.switchState(TicketState.Opened);
				
				this.awaitInitialChoiceReaction(message);

				break;
			}
			case TicketState.OpenAutomatic:
			{
				let embed = new DiscordJS.RichEmbed();

				embed.setColor(this.conf.embedColour);
				embed.setDescription(this.conf.selectAutomatedMessage);

				await this.channel.send(embed);

				break;
			}
			case TicketState.OpenSupport:
			{
				this.switchState(TicketState.OpenTermsOfService);
				break;
			}
			case TicketState.OpenTermsOfService:
			{

				let token = await this.assignTOSToken();

				let embed = new DiscordJS.RichEmbed();

				embed.setTitle(this.conf.termsOfServiceMessageTitle);

				embed.setColor(this.conf.embedColour);
				embed.setDescription(this.conf.termsOfServiceMessage
												.replace("%url%", this.conf.tosLocation + "?token=" + token));

				embed = await this.channel.send(embed);

				this.registerStoredMessage(StoredMessageType.TermsOfService, embed);
				this.switchState(TicketState.OpenAwaitingTermsOfServiceResponse);
				break;
			}
			case TicketState.OpenAutomaticAwaitingResponse:
				this.switchState(TicketState.Opened);
				break;
			case TicketState.OpenTermsOfServiceAccepted:
			{
				let embed = new DiscordJS.RichEmbed();

				embed.setColor(this.conf.embedColour);
				embed.setDescription(this.conf.termsOfServiceAcceptedMessage);

				await this.channel.send(embed);

				let toRemove = await this.getStoredMessage(StoredMessageType.TermsOfService);
				await toRemove.delete();

				this.switchState(TicketState.OpenManualSetup);

				break;
			}
			case TicketState.OpenPushed:
			{
				this.switchState(TicketState.OpenAwaitingFreelancer);
				break;
			}
			case TicketState.OpenAwaitingFreelancer:
			{
				this.startCommissionMessageReactionCollector();
				break;
			}
		}

		this.updatePermissions();
	}

	async updatePermissions() {

		let discordConf = this.discordController.conf;
		let guild = this.discordController.guild;

		let permissable = [
			{ 
				id: guild.defaultRole.id, 
				denied: ['VIEW_CHANNEL', 'SEND_MESSAGES']
			},
			{
				id: this.ownerId,
				allowed: ['VIEW_CHANNEL', 'SEND_MESSAGES']
			},
			{
				id: discordConf.administratorRole,
				allowed: ['VIEW_CHANNEL', 'SEND_MESSAGES']
			}
		];

		for(let member of this.members) {

			permissable.push({
				id: member.member,

				allowed: member.type === MemberType.Participant ? ['VIEW_CHANNEL', 'SEND_MESSAGES'] : ['VIEW_CHANNEL']
			});

		}

		await this.channel.replacePermissionOverwrites({
			overwrites: permissable,
			reason: "Ticket state"
		});

		
	}

	async awaitInitialChoiceReaction(message) {

		let filter = (reaction, reactor) => reactor.id === this.ownerId && 
																			[ "👨", "🤖" ].indexOf(reaction.emoji.name) !== -1;
		let reactions = await message.awaitReactions(filter, { max: 1 });

		let reaction = reactions.firstKey();

		if(reaction === "👨") {
			this.switchState(TicketState.OpenSupport);
		}
		if(reaction === "🤖") {
			this.switchState(TicketState.OpenAutomatic);
		}

		message.clearReactions();

	}

	async startCommissionMessageReactionCollector() {

		let filter = (reaction, reactor) => ["✅", "❎", "👁"].indexOf(reaction.emoji.name) !== -1;
		let message = await this.getCommissionMessage();

		if(!message)
			return this.switchState(TicketState.OpenPushed);

		let collector = message.createReactionCollector(filter);

		collector.on("collect", async (element) => {

			let reaction = element.emoji.name;
			let user = await this.discordController.guild.fetchMember(element.users.lastKey());

			if(!user)
				return;

			if(reaction === "✅") {

				let response = await this.joinTicket(user);

				if(response.error) {

					let embed = new DiscordJS.RichEmbed();

					embed.setTitle("Failed to join ticket");
					embed.setColor("RED");

					embed.setDescription(response.error);

					user.send(embed);
					return;

				}

			}
			if(reaction === "👁") {

				await this.addToTicket(user, MemberType.Viewer);

			}

		});

	}

	async assignTOSToken() {

		let token = uniqid();

		await this.databaseController.executeAction(new CreateTOSTokenAction(this.id, token));

		return token;
	}

	get channel() {
		return this.discordController.guild.channels.find(channel => channel.id === this.channelId);
	}

	async resolveMessage(snowflake) {
		try {
			return await this.channel.fetchMessage(snowflake);
		} catch(ex) {
			return false;
		}
	}

	async getStoredMessage(type) {

		return this.resolveMessage(this.messages[type]);

	}

	async assignRole(role) {
		this.assignedRoles.push(role);

		return await this.databaseController.executeAction(new CreateAssignedRoleAction(this.id, role.id));
	}

	async removeRole(role) {
		this.assignedRoles.slice(this.assignRoles.indexOf(role), 1);

		return await this.databaseController.executeAction(new DeleteAssignedRoleAction(this.id, role.id));
	}

	async updateDescription(description) {
		this.description = description;

		return await this.databaseController.executeAction(new UpdateTicketDescriptionAction(this.id, description));
	}

	async joinTicket(user) {

		for(let assigned of this.assignedRoles) {

			if(!user.roles.get(assigned.roleId))
				return { error: `You lack the role **${assigned.displayName}**, which is required to join this ticket` };

		}

		await this.pushClaimedTicketMessage(user);
		await this.addToTicket(user, MemberType.Participant);

		let embed = new DiscordJS.RichEmbed();

		embed.setColor(this.conf.embedColour);
		embed.setDescription(`<@${user.id}> joined the ticket.`);

		await this.channel.send(embed);

		return { success: true };
	}

	async pushClaimedTicketMessage(user) {
		let commission = await this.getCommissionMessage();

		await commission.delete();
	}

	async addToTicket(user, type) {

		let member = {
			member: user.id,
			type: type
		}

		this.members.push(member);

		this.updatePermissions();
		return await this.databaseController.executeAction(new CreateTicketMemberAction(this.id, member));

	}

	getVerboseAssigned() {

		let toReturn = [];

		for(let assigned of this.assignedRoles) {
			toReturn.push(`<@&${assigned.roleId}>`);
		}

		return toReturn;

	}

	async getCommissionMessage() {

		let discordController = this.discordController;

		try {
			return await discordController.guild.channels.get(discordController.conf.commissionsChannel)
					.fetchMessage(this.messages[StoredMessageType.CommissionAd]);
		} catch(ex) {
			return false;
		}
	}

}

module.exports.TicketState = TicketState;
module.exports.StoredMessageType = StoredMessageType;
module.exports.MemberType = MemberType;