'use strict';

exports = module.exports = function(app, schedule) {
	var workflow = new (require('events').EventEmitter)();
	var rule = new schedule.RecurrenceRule();
	
	rule.dayOfWeek = [new schedule.Range(0, 6)];
	rule.hour = 0;
	rule.minute = 50;
	app.db.models.User.find({}).exec(function(err, user){
		if(err) throw err;
		console.log(user);
	});
	
	var email_schedule = schedule.scheduleJob(rule, function() {
		// query users table from MongoDB where not completed Profile.
		app.db.models.User.find({ $or: [{"phone": ''}, {"address": ''}, {"city": ''}, {"zip": ''}, {"state": ''}, {"firstName": ''}, {"lastName": ''}, ]}).exec(function(err, result) {
			if (err) throw err;
			console.log("_________________________________________");
			console.log(result);
			console.log("_________________________________________");
		});
	});
};