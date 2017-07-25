'use strict';

exports = module.exports = function(app, schedule) {
	var rule_week = new schedule.RecurrenceRule();
	
	rule_week.dayOfWeek = [new schedule.Range(0, 6)];
	rule_week.hour = 8;
	rule_week.minute = 0;
	
	var email_schedule = schedule.scheduleJob(rule_week, function() {
		// query users table from MongoDB where not completed Profile.
		app.db.models.User.find({ $or: [{"phone": ''}, {"address": ''}, {"city": ''}, {"zip": ''}, {"state": ''}, {"firstName": ''}, {"lastName": ''}, ]}).exec(function(err, result) {
			if (err) throw err;
			for(var i = 0; i < result.length; i++) {
				if(result[i].sendMailCounts < 7) {
					app.utility.sendmailSchedule(app, {
						from : app.config.smtp.from.name + ' <' + app.config.smtp.from.address + '>',
						to : result[i].email,
						subject : 'Your ' + app.config.projectName + ' Account',
						textPath : 'signup/email-text',
						htmlPath : 'signup/email-html',
						locals : {
							username : "Administrator",
							email : "griswaldyan@email.com",
							loginURL : "http://127.0.0.1:3000/",
							projectName : app.config.projectName
						},
						success : function(message) {
							console.log("Send SMTP Mail from Administrator");
							app.db.models.User.findOneAndUpdate({"email": result[i].email}, {"sendMailCounts": result[i].sendMailCounts + 1}).exec(function(err, result) {
								if(err) throw err;
								console.log("OKOKOKOKOKOKOKOK");
							});
						},
						error : function(err) {
							console.log('Error Send Email: ' + err);
						}
					});
				}
			}
		});
	});
};