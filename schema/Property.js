'use strict';

exports = module.exports = function(app, mongoose) {
  var propertySchema = new mongoose.Schema({
    user: {
      id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      name: { type: String, default: '' },
      email: { type: String, defaul: ''}
    },
    propertyType: { type: String, default: '' },
    residentialUnit: { type: String, default: '' },
    residentialContent: { type: String, default: '' },
    residentialOther: { type: String, default: '' },
    commercialContent: { type: String, default: '' },
    commercialOther: { type: String, default: '' },
    landBuild: { type: String, default: '' },
    submittedOn: { type: Date, default: Date.now },
    propertyAddress: { type: String, default: '' },
    propertyCity: { type: String, default: '' },
    propertyState: { type: String, default: '' },
    propertyZip: { type: String, default: '' },
    propertyCounty: { type: String, default: '' },
    ownerFirstName: { type: String, default: '' },
    ownerLastName: { type: String, default: '' },
    ownerPhone: { type: String, default: '' },
    ownerCell: { type: String, default: '' },
    ownerEmail: { type: String, default: '' },
    beds: { type: String, default: '' },
    baths: { type: String, default: '' },
    askingPrice: { type: String, default: '' },
    repairs: { type: String, default: '' },
    repairNeed: { type: String, default: '' },
    otherRepairDetail: { type: String, default: '' },
    occupancy: { type: String, default: '' },
    listedOnMLS: { type: String, default: '' },
    propertyOnMLS: { type: String, default: '' },
    propertyDetail: { type: String, default: '' },
    taxRecordLink: { type: String, default: '' },
    zillowLink: { type: String, default: '' },
    offerAmountAccepted: { type: String, default: '' },    
    approxARV: { type: String, default: '' },
    status: { type: String, default: ''},
    photoURL: {type: String, default: ''}
    
    
    
  });

  propertySchema.plugin(require('./plugins/pagedFind'));
  propertySchema.set('autoIndex', (app.get('env') === 'development'));
  app.db.model('Property', propertySchema);
};
