'use strict';

exports = module.exports = function(app, mongoose) {
  var closingTitleSchema = new mongoose.Schema({
    title: { type: String, default: '' },
    isTitle: {type: String, default: ''},
    isShow: {type: Number, default: 0}
  });

  app.db.model('ClosingTitle', closingTitleSchema);
};
