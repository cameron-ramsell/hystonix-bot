module.exports = {

	/*
		Accepts a raw number or mention and converts to twitter snowflake.
	*/
	resolve: (input) => {
		// Check for null
		if(!input)
			return false;

		// Check if the input is a number
		if(!isNaN(input))
			return input;

		// Check if the input is a twitter snowflake, if so convert it.
		let mentionSnowflake = input.substring(2, input.length-1);
		if(input.startsWith("<@") && input.endsWith(">") && !isNaN(mentionSnowflake))
			return mentionSnowflake;

		// For whatever reason, the mention sometimes has a & in
		mentionSnowflake = input.substring(3, input.length-1);
		if(input.startsWith("<@&") && input.endsWith(">") && !isNaN(mentionSnowflake))
			return mentionSnowflake;

		return false;
	}

}