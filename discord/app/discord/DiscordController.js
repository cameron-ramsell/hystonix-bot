const DiscordJS = require("discord.js");

const FetchConfigurationAction = require(__root + "/app/db/type/FetchConfigurationAction.js");
const CommandBase = require(__root + "/app/command/CommandBase.js");

const CreateTicketCommand = require(__root + "/app/command/type/CreateTicketCommand.js");
const AssignTicketCommand = require(__root + "/app/command/type/AssignTicketCommand.js");
const UnassignTicketCommand = require(__root + "/app/command/type/UnassignTicketCommand.js");
const DescribeTicketCommand = require(__root + "/app/command/type/DescribeTicketCommand.js");
const PushTicketCommand = require(__root + "/app/command/type/PushTicketCommand.js");

module.exports = class DiscordController {

	constructor(databaseController) {

		this.databaseController = databaseController;
		this.registeredCommands = {};

	}

	async initialize(ticketController) {

		this.ticketController = ticketController;

		await this.loadConfiguration();

		this.discordClient = new DiscordJS.Client();

		this.discordClient.on('message', msg => this.handleMessage(msg));

		let readyPromise = new Promise((res, rej) => {
			this.discordClient.on('ready', () => {

				this.handleReady();
				res();

			});
		})

		this.discordClient.login(this.conf.token);

		this.registerCommand(new CreateTicketCommand(this.ticketController));
		this.registerCommand(new AssignTicketCommand(this.ticketController));
		this.registerCommand(new UnassignTicketCommand(this.ticketController));
		this.registerCommand(new DescribeTicketCommand(this.ticketController));
		this.registerCommand(new PushTicketCommand(this.ticketController));

		await readyPromise;
	}

	handleReady() {

		let user = this.discordClient.user;

		user.setPresence({ game: { name: this.conf.game }, status: 'dnd'})

		if(!this.guild)
			throw new Error("Error: Failed to fetch discord guild during ready phase. Please ensure correct configuration");

		console.log("[Discord] Discord Controller Ready!");
		console.log("\t\t- Account: " + user.username + "#" + user.discriminator);
		console.log("\t\t-   Guild: " + this.guild);

	}

	registerCommand(cmd) {

		this.registeredCommands[cmd.name] = cmd;
		console.log("[Discord] Command registered: " + cmd.name);

	}

	async handleMessage(msg) {
		let content = msg.content;

		if(!content.startsWith(this.conf.commandPrefix))
			return;

		let args = content.split(" ");
		let commandLabel = args[0].slice(this.conf.commandPrefix.length);

		let command = this.registeredCommands[commandLabel];

		if(!command)
			return;

		if(command.ticketOnly && !this.ticketController.channelTicketMap[msg.channel.id]) {
			let embed = new DiscordJS.RichEmbed();

			embed.setColor("RED");

			embed.setTitle("Error");
			embed.setDescription("This command can only be executed from within a ticket");

			msg.channel.send(embed);
			return;
		}

		let member = await this.guild.fetchMember(msg.author);

		if(this.calculatePermissionLevel(member) < command.permissableLevel) {
			let embed = new DiscordJS.RichEmbed();

			embed.setColor("RED");

			embed.setTitle("Error");
			embed.setDescription("You lack the permission to execute this command");

			msg.channel.send(embed);
			return;
		}

		args.shift();

		let i = 0;
		for(let arg of args) {
			if(!arg)
				args.splice(i, 1);
			i++;
		}

		command.executeCommand(msg, args);		

	}

	async loadConfiguration() {

		this.conf = await this.databaseController.executeAction(new FetchConfigurationAction("discord"));

	}

	get guild() {
		return this.discordClient.guilds.get(this.conf.guild);
	}

	calculatePermissionLevel(guildMember) {

		let highestPermissable = CommandBase.PermissionLevel.All;

		for(let role of guildMember.roles.array()) {

			let permissionLevel;

			switch(role.id) {
				case this.conf.freelancerRole: permissionLevel = CommandBase.PermissionLevel.Freelancer; break;
				case this.conf.supportRole: permissionLevel = CommandBase.PermissionLevel.Support; break;
				case this.conf.administratorRole: permissionLevel = CommandBase.PermissionLevel.Administrator; break;
				default: continue;
			}

			if(permissionLevel > highestPermissable)
				highestPermissable = permissionLevel;
			
		}

		return highestPermissable;

	}

}