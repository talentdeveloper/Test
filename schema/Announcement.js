'use strict';

exports = module.exports = function(app, mongoose) {
  var announcementSchema = new mongoose.Schema({
    description: { type: String, default: '' },
    isAnnouncement: { type: String, default: ''}
  });

  app.db.model('Announcement', announcementSchema);
};
