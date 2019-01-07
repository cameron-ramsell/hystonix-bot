const DiscordJS = require("discord.js");
const CommandBase = require(__root + "/app/command/CommandBase.js");

const Wait = require(__root + "/app/util/Wait.js");

module.exports = class CreateTicketCommand extends CommandBase {

	constructor(ticketController) {
		super("new", CommandBase.PermissionLevel.All);
	
		this.ticketController = ticketController;
	}

	async executeCommand(msg) {

		let ticket = await this.ticketController.createNewTicket(msg.author);

		let embed = new DiscordJS.RichEmbed();
		embed.setTitle("Ticket created");
		embed.setColor("AQUA");

		embed.setDescription("Your new ticket was created in the channel " + ticket);

		embed = await msg.channel.send(embed);
	
		await Wait.untilTime(5000);

		embed.delete();
		msg.delete();
	}

}