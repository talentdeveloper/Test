'use strict';

exports = module.exports = function(app, mongoose) {
  var videoSchema = new mongoose.Schema({
    welcomePageURL: { type: String, default: '' },
    instructionURL: { type: String, default: '' },
    description: { type: String, default: '' },
    videoURL: {type: String, default:'yes'}
  });

  app.db.model('Video', videoSchema);
  console.log("passed schema");
};
