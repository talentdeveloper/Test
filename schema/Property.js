'use strict';

exports = module.exports = function(app, mongoose) {
  var propertySchema = new mongoose.Schema({
    user: {
      id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      name: { type: String, default: '' },
      email: { type: String, defaul: ''}
    },
    propertyType: { type: String, default: '' },
    multiFamilyUnit: { type: String, default: '' },
    commercialContent: { type: String, default: '' },
    commercialComplex: { type: Number, default: '' },
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
    beds: { type: Number, default: '' },
    baths: { type: Number, default: '' },
    Roof: { type: Boolean, default: '' },
    Kitchen: { type: Boolean, default: '' },
    Bath: { type: Boolean, default: '' },
    Paint: { type: Boolean, default: '' },
    Carpet: { type: Boolean, default: '' },
    Windows: { type: Boolean, default: '' },
    Furnance: { type: Boolean, default: '' },
    Drywall: { type: Boolean, default: '' },
    Plumbing: { type: Boolean, default: '' },
    Electrical: { type: Boolean, default: '' },
    askingPrice: { type: String, default: '' },
    propertyPrice: { type: String, default: '' },
    modifyPrice: { type: String, default: '' },
    repairs: { type: Number, default: '' },
    otherRepairDetail: { type: String, default: '' },
    occupancy: { type: String, default: '' },
    listedOnMLS: { type: String, default: '' },
    propertyOnMLS: { type: String, default: '' },
    propertyDetail: { type: String, default: '' },
    taxRecordLink: { type: String, default: '' },
    zillowLink: { type: String, default: '' },
    offerAmountAccepted: { type: Number, default: '' },    
    approxARV: { type: Number, default: '' },
    selectCalculate: { type: String, default: '' },
    propertyCalculate: { type: String, default: '' },
    status: { type: String, default: ''},
    photoURL: [],
    sumPoint: {type: Number, default: ''}
  });

  propertySchema.plugin(require('./plugins/pagedFind'));
  propertySchema.set('autoIndex', (app.get('env') === 'development'));
  app.db.model('Property', propertySchema);
};
