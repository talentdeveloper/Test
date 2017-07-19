'use strict';

exports = module.exports = function(app, mongoose) {
  var siteLinkSchema = new mongoose.Schema({
    siteURL: { type: String, default: '' },
    siteName: { type: String, default: '' },
    siteDescription: { type: String, default: '' }
  });

  app.db.model('SiteLink', siteLinkSchema);
};
