global.__root = __dirname;
const TicketBot = require(__root + "/app/TicketBot.js");

process.on('unhandledRejection', up => { throw up });

new TicketBot();