const DiscordJS = require("discord.js");

const Ticket = require(__root + "/app/ticket/Ticket.js");
const AssignableController = require(__root + "/app/ticket/AssignableController.js");

const FetchConfigurationAction = require(__root + "/app/db/type/FetchConfigurationAction.js");
const FetchActiveTicketsAction = require(__root + "/app/db/type/FetchActiveTicketsAction.js");
const FetchTicketIdByTokenAction = require(__root + "/app/db/type/FetchTicketIdByTokenAction.js");
const FetchTicketIdByChannelIdAction = require(__root + "/app/db/type/FetchTicketIdByChannelIdAction.js");
const CreateTicketAction = require(__root + "/app/db/type/CreateTicketAction.js");

module.exports = class TicketController {

	constructor(databaseController) {

		this.databaseController = databaseController;

		this.ticketCache = {};
		this.channelTicketMap = {};

		this.assignableController = new AssignableController(databaseController);
	}

	async initialize(discordController, ipcController) {

		this.discordController = discordController;
		this.ipcController = ipcController;

		await this.loadConfiguration();
		await this.assignableController.loadData();

		this.ipcController.on("tosAccepted", async (data, socket, respond) => {

			let dbRes = await this.databaseController.executeAction(new FetchTicketIdByTokenAction(data.token));

			if(!dbRes)
				return respond({ error: "Invalid token" });

			let ticket = await this.getTicketById(dbRes.ticket_id);

			if(ticket.state != Ticket.TicketState.OpenAwaitingTermsOfServiceResponse)
				return respond({ error: "Ticket is in invalid state" });

			try {
				await ticket.switchState(Ticket.TicketState.OpenTermsOfServiceAccepted);
			} catch(ex) {
				return respond({ error: "An internal error has occured" });
			}

			return respond({ success: true });
		});
	}

	async precacheActiveTickets() {
		// Pre-caching all active tickets, I didn't want to have to do this, but it is critical for certain states where a collector of some sort is required (like a reaction collector)

		let activeTickets = await this.databaseController.executeAction(new FetchActiveTicketsAction());

		for(let ticket of activeTickets) {
			let cachedTicket = await this.getTicketById(ticket.id);

			if(!cachedTicket)
				continue;

			if(cachedTicket.state === Ticket.TicketState.Unknown) {

				cachedTicket.switchState(Ticket.TicketState.Opened);

			}
		}
	}

	async loadConfiguration() {

		this.conf = await this.databaseController.executeAction(new FetchConfigurationAction("ticket"));

	}

	async getTicketById(id) {

		let cacheTicket = this.ticketCache[id];
		if(cacheTicket)
			return cacheTicket;

		let ticket = new Ticket(id, this, this.discordController, this.conf);
		await ticket.loadData();

		if(!ticket.channel) {
			console.log("[Ticket] Refusing to cache Ticket#" + id + " because it's channel failed to load.\n\tPlease resolve this issue or purge it from the database.");
			return;
		}

		this.channelTicketMap[ticket.channelId] = ticket;

		return this.ticketCache[id] = ticket;

	}

	async getTicketByChannel(channel) {

		let res = await this.databaseController.executeAction(new FetchTicketIdByChannelIdAction(channel.id));

		return this.getTicketById(res.id);

	}

	async createNewTicket(owner) {
		let guild = this.discordController.guild;

		let permissables = [
			{ 
				id: guild.defaultRole.id, 
				denied: ['VIEW_CHANNEL']
			}
		];

		let channel = await guild.createChannel("#ticket-" + owner.username, "text", permissables);
		
		let id;
		try {
			id = await this.databaseController.executeAction(new CreateTicketAction(channel.id, owner.id));
		} catch(ex) {
			channel.delete();
			return false;
		}

		await channel.setTopic("Senior Team Ticket -- Ticket ID: " + id);
		await channel.setParent(this.conf.ticketParent);
		
		channel.overwritePermissions(owner, {
			VIEW_CHANNEL: true
		});

		let ticket = await this.getTicketById(id);

		ticket.switchState(Ticket.TicketState.Opened);

		return channel;
	}

	decache(ticket) {

		delete this.ticketCache[ticket.id];

	}

	async pushTicket(ticket) {
		let guild = this.discordController.guild;

		let embed = new DiscordJS.RichEmbed();
		embed.setTitle(`Commission from <@${ticket.ownerId}>`);
		embed.setDescription("A commission is awaiting a freelancer");
		embed.setColor("AQUA");

		embed.addField("Department", ticket.getVerboseAssigned().join(" "), true);
		embed.addField("Support Member", "Dave", true);

		embed.addField("Description", ticket.description);
		embed.setFooter("React with your intended action");

		let msg = await guild.channels.get(this.discordController.conf.commissionsChannel).send(embed);

		await msg.react("✅");
		await msg.react("❎");
		await msg.react("👁");

		ticket.switchState(Ticket.TicketState.OpenPushed);
		ticket.registerStoredMessage(Ticket.StoredMessageType.CommissionAd, msg);

	}

}