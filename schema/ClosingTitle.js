'use strict';

exports = module.exports = function(app, mongoose) {
  var closingTitleSchema = new mongoose.Schema({
    title: { type: String, default: '' },
    isTitle: {type: String, default: ''}
  });

  app.db.model('ClosingTitle', closingTitleSchema);
  console.log("passed schema");
};
