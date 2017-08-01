'use strict';

// public api
var announcement = {
  getAnnouncement: function(req, res, next) {
    console.log("logged here");
    req.app.db.models.Announcement.findOne({"isAnnouncement": 'yes'}, function (err, results) {
      if (err) {
        return next(err);
      }
      console.log(results);
      res.status(200).json(results);
    });
  },
  updateAnnouncement: function(req, res, next) {
    var fieldsToSet = {
      description: req.body.description
    };
    var options = { new: true };

    req.app.db.models.Announcement.findOneAndUpdate({"isAnnouncement": 'yes'}, fieldsToSet).exec(function(err, result) {
      if (err) return res.send(500, { error: err });
      return res.send("succesfully saved");
    });
  },
};
module.exports = announcement;