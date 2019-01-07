const DiscordJS = require("discord.js");

const CommandBase = require(__root + "/app/command/CommandBase.js");
const Ticket = require(__root + "/app/ticket/Ticket.js");

const Wait = require(__root + "/app/util/Wait.js");

module.exports = class DescribeTicketCommand extends CommandBase {

	constructor(ticketController) {
		super("describe", CommandBase.PermissionLevel.Support, true);
	
		this.ticketController = ticketController;
		this.assignableController = ticketController.assignableController;
	}

	async executeCommand(msg, args) {

		if(args.length < 1)
			return this.error(msg, "Invalid arguments! Refer to: -describe <message>");

		let ticket = await this.ticketController.getTicketByChannel(msg.channel);
		
		if(!ticket)
			return;

		if(ticket.state !== Ticket.TicketState.OpenManualSetup)
			return this.error(msg, "Ticket can only be modified in the setup state.");
		
		let message = args.join(" ");

		let success = await ticket.updateDescription(message);

		if(!success)
			return this.error(msg, "Updating the description failed");

		let embed = new DiscordJS.RichEmbed();

		embed.setTitle("Description updated");
		embed.setDescription(`The description for the ticket was updated \`\`\`${message}\`\`\``);
		embed.setColor("AQUA");

		embed = await msg.channel.send(embed);

		await Wait.untilTime(5000);

		embed.delete();
		msg.delete();

	}

}