'use strict';

exports = module.exports = function(app, mongoose) {
  var closingStatsSchema = new mongoose.Schema({
    usernameforclosing: { type: String, default: '' },    
    explanation: { type: String, default: '' },
    photoURL: {type: String, default: ''}    
  });

  app.db.model('ClosingStats', closingStatsSchema);
};
