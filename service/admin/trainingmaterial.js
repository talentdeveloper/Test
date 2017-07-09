'use strict';

// public api
var trainingmaterial = {
  findVideoURL: function (req, res, next) {
  	req.app.db.models.Video.findOne({"videoURL": 'yes'}).exec(function(err, data) {
  		console.log(data);
  		if (err) {
  			console.log('errorrrr');
  			return err;
  		}
  		res.status(200).json(data);
  	})
  },

  updateVideo: function(req, res, next) {
  	var query = {"videoURL": 'yes'};
  	console.log(req.body);
	req.app.db.models.Video.findOneAndUpdate({"videoURL": 'yes'}, { "welcomePageURL": req.body.welcomePageURL, "instructionURL": req.body.instructionURL, "description": req.body.description}).exec(function(err, doc){
    if (err) return res.send(500, { error: err });
    return res.send("succesfully saved");
	});
  }
};
module.exports = trainingmaterial;