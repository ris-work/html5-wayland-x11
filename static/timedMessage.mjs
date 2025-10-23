export class timedMessage {
	constructor(message) {
		this.Message = message;
		this.Timestamp = (new Date().getTime() + "000");
	}
	static checkAndReturn(timed) {
		let now = parseInt(new Date().getTime() + "000");
		if (Math.abs(parseInt(timed.Timestamp - now)) > 15 * 1000 * 1000)
			throw new Error("Message too old or too new.");
		else {
			return timed.Message;
		}
	}
}
