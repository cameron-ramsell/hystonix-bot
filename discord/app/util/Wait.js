module.exports = {
	untilTime: (time, returnValue) => {
		return new Promise((res, rej) => {
			setTimeout(() => { res(returnValue) }, time);
		});
	},
	
	untilTrue(call) {
		return new Promise(async (res, rej) => {
			while(!call()) { await module.exports.untilTime(200); }
			res();
		});
	}
}