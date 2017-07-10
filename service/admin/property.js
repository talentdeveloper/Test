'use strict';

// public api
var property = {
  find: function (req, res, next) {
    req.query.user = req.query.user ? req.query.user : '';
    req.query.limit = req.query.limit ? parseInt(req.query.limit, null) : 20;
    req.query.page = req.query.page ? parseInt(req.query.page, null) : 1;
    req.query.sort = req.query.sort ? req.query.sort : '_id';
    req.query.status = req.query.status ? req.query.status : '';



    var filters = {};
    if (req.query.user) {
      filters['user.name'] = new RegExp('^.*?' + req.query.user + '.*$', 'i');
    }


    if (req.query.status && req.query.status === 'new') {
      filters['status'] = 'new';
    }

    if (req.query.status && req.query.status === 'activelyWorking') {
      filters['status'] = 'activelyWorking';
    }

    if (req.query.status && req.query.status === 'offerAccepted') {
      filters['status'] = 'offerAccepted';
    }

    if (req.query.status && req.query.status === 'offerRejected') {
      filters['status'] = 'offerRejected';
    }

    if (req.query.status && req.query.status === 'ucSeller') {
      filters['status'] = 'ucSeller';
    }

    if (req.query.status && req.query.status === 'ucBuyer') {
      filters['status'] = 'ucBuyer';
    }

    if (req.query.status && req.query.status === 'closed') {
      filters['status'] = 'closed';
    }

    if (req.query.status && req.query.status === 'dead') {
      filters['status'] = 'dead';
    }
    console.log(filters);
    req.app.db.models.Property.pagedFind({
      filters: filters,
      keys: 'user.name propertyAddress propertyCity status submittedOn photoURL',
      limit: req.query.limit,
      page: req.query.page,
      sort: req.query.sort
    }, function (err, results) {
      if (err) {
        return next(err);
      }
      results.filters = req.query;
      console.log(results.filters)
      console.log(results);
      res.status(200).json(results);
    });
  },

  create: function (req, res, next) {
    var workflow = req.app.utility.workflow(req, res);

    workflow.on('validate', function () {
      if (!req.body.ownerFirstName) {
        workflow.outcome.errors.push('Please enter a ownerFirstName.');
        return workflow.emit('response');
      }

      if (!req.body.ownerLastName) {
        workflow.outcome.errors.push('Please enter a ownerLastName.');
        return workflow.emit('response');
      }

      if (!/^[a-zA-Z0-9\-\_]+$/.test(req.body.ownerFirstName)) {
        workflow.outcome.errors.push('only use letters, numbers, -, _');
        return workflow.emit('response');
      }

      if (!/^[a-zA-Z0-9\-\_]+$/.test(req.body.ownerLastName)) {
        workflow.outcome.errors.push('only use letters, numbers, -, _');
        return workflow.emit('response');
      }

      //workflow.emit('duplicateUsernameCheck');
      workflow.emit('createProperty');
    });

    // workflow.on('duplicateUsernameCheck', function () {
    //   req.app.db.models.User.findOne({username: req.body.username}, function (err, user) {
    //     if (err) {
    //       return workflow.emit('exception', err);
    //     }

    //     if (user) {
    //       workflow.outcome.errors.push('That username is already taken.');
    //       return workflow.emit('response');
    //     }

    //     workflow.emit('createUser');
    //   });
    // });

    workflow.on('createProperty', function () {
      var fieldsToSet = {
        
        user: {
          id: req.user._id,
          name: req.user.username,          
        }
      };
      req.app.db.models.Property.create(fieldsToSet, function (err, property) {
        if (err) {
          return workflow.emit('exception', err);
        }

        workflow.outcome.record = property;
        return workflow.emit('response');
      });
    });

    workflow.emit('validate');
  },

  read: function(req, res, next){
    req.app.db.models.Property.findById(req.params.id).exec(function(err, user) {
      if (err) {
        return next(err);
      }
      res.status(200).json(user);
    });
  },

  update: function(req, res, next){
    var workflow = req.app.utility.workflow(req, res);
    console.log('passed update node part');
    workflow.on('validate', function() {
      if (!req.body.first) {
        workflow.outcome.errfor.first = 'required';
      }

      if (!req.body.last) {
        workflow.outcome.errfor.last = 'required';
      }

      if (workflow.hasErrors()) {
        //return workflow.emit('response');
      }

      workflow.emit('patchProperty');
    });

    workflow.on('patchProperty', function() {
      var fieldsToSet = {
        propertyType: req.body.propertyType,
        residentialUnit: req.body.residentialUnit,
        residentialContent: req.body.residentialContent,
        residentialOther: req.body.residentialOther,
        commercialContent: req.body.commercialContent,
        commercialOther: req.body.commercialOther,
        landBuild: req.body.landBuild,
        propertyAddress: req.body.propertyAddress,
        propertyCity: req.body.propertyCity,
        propertyState: req.body.propertyState,
        propertyZip: req.body.propertyZip,
        propertyCounty: req.body.propertyCounty,
        ownerFirstName: req.body.ownerFirstName,
        ownerLastName: req.body.ownerLastName,
        ownerPhone: req.body.ownerPhone,
        ownerEmail: req.body.ownerEmail,
        beds: req.body.beds,
        baths: req.body.baths,
        squreFootage: req.body.squreFootage,
        builtYear: req.body.builtYear,
        askingPrice: req.body.askingPrice,
        propertyPrice: req.body.propertyPrice,
        modifyPrice: req.body.modifyPrice,
        repairs: req.body.repairs,
        Roof: req.body.Roof,
        Kitchen: req.body.Kitchen,
        Bath: req.body.Bath,
        Paint: req.body.Paint,
        Carpet: req.body.Carpet,
        Windows: req.body.Windows,
        Furnance: req.body.Furnance,
        Drywall: req.body.Drywall,
        Plumbing: req.body.Plumbing,
        Electrical: req.body.Electrical,
        loanBalance: req.body.loanBalance,
        sellFor: req.body.sellFor,
        motivatedSell: req.body.motivatedSell,
        approxARV: req.body.approxARV,
        useLeadSheet: req.body.useLeadSheet,
        currentLive: req.body.currentLive,
        cashOffer: req.body.cashOffer,
        locatedCounty: req.body.locatedCounty,
        sellingReason: req.body.sellingReason,
        otherDetail: req.body.otherDetail,
        howFindThis: req.body.howFindThis,
        ownerCell: req.body.ownerCell,
        repairs: req.body.repairs,
        otherRepairDetail: req.body.otherRepairDetail,
        occupancy: req.body.occupancy,
        listedOnMLS: req.body.listedOnMLS,
        propertyOnMLS: req.body.propertyOnMLS,
        propertyDetail: req.body.propertyDetail,
        taxRecordLink: req.body.taxRecordLink,
        zillowLink: req.body.zillowLink,
        offerAmountAccepted: req.body.offerAmountAccepted,
        status: req.body.status,
        selectCalculate: req.body.selectCalculate,
        propertyCalculate: req.body.propertyCalculate,
        search: [
          req.body.propertyAddress,
          req.body.propertyCity,
          req.body.propertyState,
          req.body.propertyZip,
          req.body.preopertyCounty,
          req.body.ownerFirstName,
          req.body.ownerLastName,
          req.body.ownerPhone,
          req.body.ownerEmail,
          req.body.beds,
          req.body.baths,
          req.body.squreFootage,
          req.body.builtYear,
          req.body.askingPrice,
          req.body.loanBalance,
          req.body.sellFor,
          req.body.motivatedSell,
          req.body.approxARV,
          req.body.useLeadSheet,
          req.body.currentLive,
          req.body.cashOffer,
          req.body.locatedCounty,
          req.body.repairNeed,
          req.body.sellingReason,
          req.body.otherDetail,
          req.body.howFindThis,
        ]
      };
      var options = { new: true };

      req.app.db.models.Property.findByIdAndUpdate(req.params.id, fieldsToSet, options, function(err, property) {
        if (err) {
          return workflow.emit('exception', err);
        }

        workflow.outcome.property = property;
        return workflow.emit('response');
      });
    });

    workflow.emit('validate');
  },

  

  delete: function(req, res, next){
    var workflow = req.app.utility.workflow(req, res);

    workflow.on('validate', function() {

      workflow.emit('deleteProperty');
    });

    workflow.on('deleteProperty', function(err) {
      req.app.db.models.Property.findByIdAndRemove(req.params.id, function(err, property) {
        if (err) {
          return workflow.emit('exception', err);
        }

        workflow.emit('response');
      });
    });

    workflow.emit('validate');
  }
};
module.exports = property;