'use strict';

exports = module.exports = function(app, mongoose) {
  var instructionVideoSchema = new mongoose.Schema({
    videoURL: { type: String, default: '' },
    thumbnailURL: { type: String, default: '' },
    videoDescription: { type: String, default: '' },
    videoTitle: {type: String, default: ''}
  });

  app.db.model('InstructionVideo', instructionVideoSchema);
};
