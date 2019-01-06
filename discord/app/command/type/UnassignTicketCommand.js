const DiscordJS = require("discord.js");

const CommandBase = require(__root + "/app/command/CommandBase.js");
const Ticket = require(__root + "/app/ticket/Ticket.js");

module.exports = class UnassignTicketCommand extends CommandBase {

	constructor(ticketController) {
		super("unassign", CommandBase.PermissionLevel.Support, true);
	
		this.ticketController = ticketController;
		this.assignableController = ticketController.assignableController;
	}

	async executeCommand(msg, args) {

		if(args.length < 1)
			return this.error(msg, "Invalid arguments! Refer to: -unassign <assignable>..");

		let toAssign = [];
		for(let arg of args) {

			let assignable = this.assignableController.getAssignableByResolveable(arg);

			if(!assignable)
				return this.error(msg, `You can not remove ${arg} from a ticket!`);

			toAssign.push(assignable);
		}

		let ticket = await this.ticketController.getTicketByChannel(msg.channel);
		
		if(!ticket)
			return;

		if(ticket.state !== Ticket.TicketState.OpenManualSetup)
			return this.error(msg, "Ticket can only be modified in the setup state.");

		let assignVerbose = [];

		for(let assign of toAssign) {

			let val = await ticket.removeRole(assign);

			if(val)
				assignVerbose.push("<@&" + assign.roleId + ">");

		}

		if(assignVerbose.length == 0)
			return this.error(msg, "None of the provided roles were assigned to the ticket.");

		let embed = new DiscordJS.RichEmbed();

		embed.setTitle("Removed from ticket");
		embed.setDescription("Roles were removed from the ticket");
		embed.addField("Removed", assignVerbose.join("\n"));
		embed.setColor("AQUA");

		msg.channel.send(embed);

	}

}