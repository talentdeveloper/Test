'use strict';

exports = module.exports = function(app, mongoose) {
  var downloadMaterialSchema = new mongoose.Schema({
    fileURL: { type: String, default: '' },
    fileName: { type: String, default: '' },
    fileDescription: {type: String, default: ''}
  });
  app.db.model('DownloadMaterial', downloadMaterialSchema);
};
