const DiscordJS = require("discord.js");

const CommandBase = require(__root + "/app/command/CommandBase.js");
const Ticket = require(__root + "/app/ticket/Ticket.js");

const Wait = require(__root + "/app/util/Wait.js");

module.exports = class PushTicketCommand extends CommandBase {

	constructor(ticketController) {
		super("push", CommandBase.PermissionLevel.Support, true);
	
		this.ticketController = ticketController;
	}

	async executeCommand(msg, args) {

		let ticket = await this.ticketController.getTicketByChannel(msg.channel);

		if(!ticket)
			return;

		if(ticket.state !== Ticket.TicketState.OpenManualSetup)
			return this.error(msg, "Push can only occur in setup state");

		if(!ticket.description)
			return this.error(msg, "Ticket must have a description to push");

		if(ticket.assignedRoles.length === 0)
			return this.error(msg, "Ticket must have an assigned role to push");

		this.ticketController.pushTicket(ticket);

		let embed = new DiscordJS.RichEmbed();

		embed.setTitle("Ticket pushed to online freelancers");
		embed.setDescription("The ticket was sent to online freelancers");
		embed.setColor("AQUA");

		embed = await msg.channel.send(embed);

		await Wait.untilTime(5000);

		embed.delete();
		msg.delete();

	}

}