'use strict';

exports = module.exports = function(app, mongoose) {
  var closingStatsSchema = new mongoose.Schema({
    username: { type: String, default: '' },    
    explanation: { type: String, default: '' }    
  });

  app.db.model('ClosingStats', closingStatsSchema);
  console.log("passed schema");
};