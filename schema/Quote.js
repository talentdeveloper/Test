'use strict';

exports = module.exports = function(app, mongoose) {
  var quoteSchema = new mongoose.Schema({
    quoteText: { type: String, default: '' },
    authorBy: { type: String, default: '' }
  });

  app.db.model('Quote', quoteSchema);
  console.log("passed schema");
};
