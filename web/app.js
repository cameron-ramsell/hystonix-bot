global.__root = __dirname;
const WebInstance = require(__root + "/app/WebInstance.js");

process.on('unhandledRejection', up => { throw up });

new WebInstance();