'use strict';

exports = module.exports = function(app, mongoose) {
  var instructionVideoSchema = new mongoose.Schema({
    videoURL: { type: String, default: '' },
    videoDescription: { type: String, default: '' }
  });

  app.db.model('InstructionVideo', instructionVideoSchema);
  console.log("passed schema");
};
