const DiscordJS = require("discord.js");

module.exports = class CommandBase {

	constructor(name, permissableLevel, ticketOnly = false) {

		this.name = name;
		this.permissableLevel = permissableLevel;

		this.ticketOnly = ticketOnly;

	}

	executeCommand(message, args) {

		throw new Error("CommandBase#runCommand not overridden by derirative class");

	}
	
	error(msg, content) {

		let embed = new DiscordJS.RichEmbed();

		embed.setColor("RED");
		embed.addField("Error", content);
		embed.setFooter(msg.author.username, msg.author.avatarURL);

		msg.channel.send(embed);

	}

}

module.exports.PermissionLevel = {

	All: 0,

	Freelancer: 5,
	Support: 10,

	Administrator: 15,
	SuperAdmin: 20

};