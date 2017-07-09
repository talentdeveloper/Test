'use strict';

exports = module.exports = function(app, mongoose) {
  var statusTypeSchema = new mongoose.Schema({
    statusName: { type: String, default: '' },
    statusDetail: { type: String, default: '' }
  });

  app.db.model('StatusType', statusTypeSchema);
  console.log("passed schema");
};
