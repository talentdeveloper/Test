'use strict';

var Zillow  = require('node-zillow'); 

var getCallbackUrl = function(hostname, provider){
  return 'http://' + hostname + '/account/properties/' + provider + '/callback';
};

var property = {
  getAccountProperties: function(req, res, next){
    var outcome = {};

    var getPropertyData = function(callback) {
      req.app.db.models.Property.findById(req.user.roles.account.id, 'user propertyType submittedOn propertyAddress propertyCity propertyState propertyZip propertyCounty ownerFirstName ownerLastName ownerPhone ownerCell ownerEmail beds baths askingPrice repairs repairNeed otherRepairDetail occupancy listedOnMLS propertyDetail taxRecordLink zillowLink offerAmountAccepted approxARV status photoURL').exec(function(err, property) {
        if (err) {
          return callback(err, null);
        }

        outcome.property = property;
        callback(null, 'done');
      });
    };

    var getUserData = function(callback) {
      req.app.db.models.User.findById(req.user.id, 'username email').exec(function(err, user) {
        if (err) {
          callback(err, null);
        }

        outcome.user = user;
        return callback(null, 'done');
      });
    };

    var asyncFinally = function(err, results) {
      if (err) {
        return next(err);
      }
      res.status(200).json(outcome);

      //res.render('account/settings/index', {
      //  data: {
      //    account: escape(JSON.stringify(outcome.account)),
      //    user: escape(JSON.stringify(outcome.user))
      //  },
      //  oauthMessage: oauthMessage,
      //  oauthTwitter: !!req.app.config.oauth.twitter.key,
      //  oauthTwitterActive: outcome.user.twitter ? !!outcome.user.twitter.id : false,
      //  oauthGitHub: !!req.app.config.oauth.github.key,
      //  oauthGitHubActive: outcome.user.github ? !!outcome.user.github.id : false,
      //  oauthFacebook: !!req.app.config.oauth.facebook.key,
      //  oauthFacebookActive: outcome.user.facebook ? !!outcome.user.facebook.id : false,
      //  oauthGoogle: !!req.app.config.oauth.google.key,
      //  oauthGoogleActive: outcome.user.google ? !!outcome.user.google.id : false,
      //  oauthTumblr: !!req.app.config.oauth.tumblr.key,
      //  oauthTumblrActive: outcome.user.tumblr ? !!outcome.user.tumblr.id : false
      //});
    };

    require('async').parallel([getPropertyData, getUserData], asyncFinally);
  },

  getAccountProperty: function (req, res, next) {
    req.app.db.models.Property.findById(req.params.id).exec(function(err, user) {
      if (err) {
        return next(err);
      }
      res.status(200).json(user);
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

    workflow.on('createProperty', function () {
      
      var zwsid ="X1-ZWz1fwa3vw3aq3_1vfab";
      var zillow = new Zillow(zwsid);


      zillow.get('GetSearchResults', {address: req.body.propertyAddress, citystatezip: req.body.propertyState})
      .then(function(results) {
       console.log(results.response.results.result[0].links[0].homedetails);
        return results;
      });
      var fieldsToSet = {
        
        user: {
          id: req.user._id,
          name: req.user.username, 
          email: req.user.email         
        },
        propertyType: req.body.propertyType,
        multiFamilyUnit: req.body.multiFamilyUnit,
        commercialContent: req.body.commercialContent,
        commercialComplex: req.body.commercialComplex,
        commercialOther: req.body.commercialOther,
        landBuild: req.body.landBuild,
        submittedOn: req.body.submittedOn,
        propertyAddress: req.body.propertyAddress,
        propertyCity: req.body.propertyCity,
        propertyState: req.body.propertyState,
        propertyZip: req.body.propertyZip,
        propertyCounty: req.body.propertyCounty,
        ownerFirstName: req.body.ownerFirstName,
        ownerLastName: req.body.ownerLastName,
        ownerPhone: req.body.ownerPhone,
        ownerCell: req.body.ownerCell,
        ownerEmail: req.body.ownerEmail,
        beds: req.body.beds,
        baths: req.body.baths,
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
        otherRepairDetail: req.body.otherRepairDetail,
        occupancy: req.body.occupancy,
        listedOnMLS: req.body.listedOnMLS,
        propertyOnMLS: req.body.propertyOnMLS,
        propertyDetail: req.body.propertyDetail,
        taxRecordLink: req.body.taxRecordLink,
        zillowLink: req.body.zillowLink,
        offerAmountAccepted: req.body.offerAmountAccepted,    
        approxARV: req.body.approxARV,
        selectCalculate: req.body.selectCalculate,
        propertyCalculate: req.body.propertyCalculate,
        status: 'new',
        search: [
          req.body.user,
          req.body.propertyType,
          req.body.submittedOn,
          req.body.propertyAddress,
          req.body.propertyCity,
          req.body.propertyState,
          req.body.propertyZip,
          req.body.propertyCounty,
          req.body.ownerFirstName,
          req.body.ownerLastName,
          req.body.ownerPhone,
          req.body.ownerCell,
          req.body.ownerEmail,
          req.body.beds,
          req.body.baths,
          req.body.askingPrice,
          req.body.repairs,
          req.body.repairNeed,
          req.body.otherRepairDetail,
          req.body.occupancy,
          req.body.listedOnMLS,
          req.body.propertyDetail,
          req.body.taxRecordLink,
          req.body.zillowLink,
          req.body.offerAmountAccepted, 
          req.body.approxARV,
          req.body.status,
        ],
        photoURL: req.body.photoURL,
        sumPoint: req.body.sumPoint
      };
      console.log(req.body.beds);
      console.log(req.body.photoURL);
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
  findPropertyList: function (req, res, next) {
    //req.query.user = req.query.user ? req.query.user : '';
    // req.query.limit = req.query.limit ? parseInt(req.query.limit, null) : 20;
    // req.query.page = req.query.page ? parseInt(req.query.page, null) : 1;
    // req.query.sort = req.query.sort ? req.query.sort : '_id';
    // req.query.status = req.query.status ? req.query.status : '';

    // var filters = {};
    // if (req.query.user) {
    //   filters.user = new RegExp('^.*?' + req.query.user + '.*$', 'i');
    // }

    // if (req.query.status) {
    //     filters['status.id'] = req.query.status;
    // }
    req.app.db.models.Property.find({ "user.id" : req.params.id }).exec(function(err, user) {
      if (err) {
        return next(err);
      }
      console.log("id:" + req.params.id);
      console.log("user:" + user);
      res.status(200).json(user);
    });
    // { "user": { "id" : req.params.id } }
    // req.app.db.models.Property.pagedFind({
    //   filters: filters,
    //   keys: 'user propertyAddress propertyCity status submittedOn',
    //   limit: req.query.limit,
    //   page: req.query.page,
    //   sort: req.query.sort,
    //   //user.id: req.param.id 
    // }, function (err, results) {
    //   if (err) {
    //     return next(err);
    //   }
    //   results.filters = req.query;

    //   res.status(200).json(results);
    // });
    


      //res.render('account/settings/index', {
      //  data: {
      //    account: escape(JSON.stringify(outcome.account)),
      //    user: escape(JSON.stringify(outcome.user))
      //  },
      //  oauthMessage: oauthMessage,
      //  oauthTwitter: !!req.app.config.oauth.twitter.key,
      //  oauthTwitterActive: outcome.user.twitter ? !!outcome.user.twitter.id : false,
      //  oauthGitHub: !!req.app.config.oauth.github.key,
      //  oauthGitHubActive: outcome.user.github ? !!outcome.user.github.id : false,
      //  oauthFacebook: !!req.app.config.oauth.facebook.key,
      //  oauthFacebookActive: outcome.user.facebook ? !!outcome.user.facebook.id : false,
      //  oauthGoogle: !!req.app.config.oauth.google.key,
      //  oauthGoogleActive: outcome.user.google ? !!outcome.user.google.id : false,
      //  oauthTumblr: !!req.app.config.oauth.tumblr.key,
      //  oauthTumblrActive: outcome.user.tumblr ? !!outcome.user.tumblr.id : false
      //});
    
    

  },

  deleteProperty: function(req, res, next){

    console.log("try to deleteProperty in nodejs");
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
  },

  updateProperty: function(req, res, next) {
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
        multiFamilyUnit: req.body.multiFamilyUnit,
        commercialContent: req.body.commercialContent,
        commercialComplex: req.body.commercialComplex,
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
        photoURL: req.body.photoURL,
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

  identity: function(req, res, next){
    var workflow = req.app.utility.workflow(req, res);

    workflow.on('validate', function() {
      if (!req.body.username) {
        workflow.outcome.errfor.username = 'required';
      }
      else if (!/^[a-zA-Z0-9\-\_]+$/.test(req.body.username)) {
        workflow.outcome.errfor.username = 'only use letters, numbers, \'-\', \'_\'';
      }

      if (!req.body.email) {
        workflow.outcome.errfor.email = 'required';
      }
      else if (!/^[a-zA-Z0-9\-\_\.\+]+@[a-zA-Z0-9\-\_\.]+\.[a-zA-Z0-9\-\_]+$/.test(req.body.email)) {
        workflow.outcome.errfor.email = 'invalid email format';
      }

      if (workflow.hasErrors()) {
        return workflow.emit('response');
      }

      workflow.emit('duplicateUsernameCheck');
    });

    workflow.on('duplicateUsernameCheck', function() {
      req.app.db.models.User.findOne({ username: req.body.username, _id: { $ne: req.user.id } }, function(err, user) {
        if (err) {
          return workflow.emit('exception', err);
        }

        if (user) {
          workflow.outcome.errfor.username = 'username already taken';
          return workflow.emit('response');
        }

        workflow.emit('duplicateEmailCheck');
      });
    });

    workflow.on('duplicateEmailCheck', function() {
      req.app.db.models.User.findOne({ email: req.body.email.toLowerCase(), _id: { $ne: req.user.id } }, function(err, user) {
        if (err) {
          return workflow.emit('exception', err);
        }

        if (user) {
          workflow.outcome.errfor.email = 'email already taken';
          return workflow.emit('response');
        }

        workflow.emit('patchUser');
      });
    });

    workflow.on('patchUser', function() {
      var fieldsToSet = {
        username: req.body.username,
        email: req.body.email.toLowerCase(),
        search: [
          req.body.username,
          req.body.email
        ]
      };
      var options = { select: 'username email twitter.id github.id facebook.id google.id' };

      req.app.db.models.User.findByIdAndUpdate(req.user.id, fieldsToSet, options, function(err, user) {
        if (err) {
          return workflow.emit('exception', err);
        }

        workflow.emit('patchAdmin', user);
      });
    });

    workflow.on('patchAdmin', function(user) {
      if (user.roles.admin) {
        var fieldsToSet = {
          user: {
            id: req.user.id,
            name: user.username
          }
        };
        req.app.db.models.Admin.findByIdAndUpdate(user.roles.admin, fieldsToSet, function(err, admin) {
          if (err) {
            return workflow.emit('exception', err);
          }

          workflow.emit('patchAccount', user);
        });
      }
      else {
        workflow.emit('patchAccount', user);
      }
    });

    workflow.on('patchAccount', function(user) {
      if (user.roles.account) {
        var fieldsToSet = {
          user: {
            id: req.user.id,
            name: user.username
          }
        };
        req.app.db.models.Account.findByIdAndUpdate(user.roles.account, fieldsToSet, function(err, account) {
          if (err) {
            return workflow.emit('exception', err);
          }

          workflow.emit('populateRoles', user);
        });
      }
      else {
        workflow.emit('populateRoles', user);
      }
    });

    workflow.on('populateRoles', function(user) {
      user.populate('roles.admin roles.account', 'name.full', function(err, populatedUser) {
        if (err) {
          return workflow.emit('exception', err);
        }

        workflow.outcome.user = populatedUser;
        workflow.emit('response');
      });
    });

    workflow.emit('validate');
  },
  password: function(req, res, next){
    var workflow = req.app.utility.workflow(req, res);

    workflow.on('validate', function() {
      if (!req.body.newPassword) {
        workflow.outcome.errfor.newPassword = 'required';
      }

      if (!req.body.confirm) {
        workflow.outcome.errfor.confirm = 'required';
      }

      if (req.body.newPassword !== req.body.confirm) {
        workflow.outcome.errors.push('Passwords do not match.');
      }

      if (workflow.hasErrors()) {
        return workflow.emit('response');
      }

      workflow.emit('patchUser');
    });

    workflow.on('patchUser', function() {
      req.app.db.models.User.encryptPassword(req.body.newPassword, function(err, hash) {
        if (err) {
          return workflow.emit('exception', err);
        }

        var fieldsToSet = { password: hash };
        req.app.db.models.User.findByIdAndUpdate(req.user.id, fieldsToSet, function(err, user) {
          if (err) {
            return workflow.emit('exception', err);
          }

          user.populate('roles.admin roles.account', 'name.full', function(err, user) {
            if (err) {
              return workflow.emit('exception', err);
            }

            workflow.outcome.newPassword = '';
            workflow.outcome.confirm = '';
            workflow.emit('response');
          });
        });
      });
    });

    workflow.emit('validate');
  },
  upsertVerification: function(req, res, next){
    var workflow = req.app.utility.workflow(req, res);

    workflow.on('generateTokenOrSkip', function() {
      if (req.user.roles.account.isVerified === 'yes') {
        workflow.outcome.errors.push('account already verified');
        return workflow.emit('response');
      }
      if (req.user.roles.account.verificationToken !== '') {
        //token generated already
        return workflow.emit('response');
      }

      workflow.emit('generateToken');
    });

    workflow.on('generateToken', function() {
      var crypto = require('crypto');
      crypto.randomBytes(21, function(err, buf) {
        if (err) {
          return next(err);
        }

        var token = buf.toString('hex');
        req.app.db.models.User.encryptPassword(token, function(err, hash) {
          if (err) {
            return next(err);
          }

          workflow.emit('patchAccount', token, hash);
        });
      });
    });

    workflow.on('patchAccount', function(token, hash) {
      var fieldsToSet = { verificationToken: hash };
      req.app.db.models.Account.findByIdAndUpdate(req.user.roles.account.id, fieldsToSet, function(err, account) {
        if (err) {
          return workflow.emit('exception', err);
        }

        sendVerificationEmail(req, res, {
          email: req.user.email,
          verificationToken: token,
          onSuccess: function() {
            return workflow.emit('response');
          },
          onError: function(err) {
            return next(err);
          }
        });
      });
    });

    workflow.emit('generateTokenOrSkip');
  },
  resendVerification: function(req, res, next){
    var workflow = req.app.utility.workflow(req, res);

    if (req.user.roles.account.isVerified === 'yes') {
      workflow.outcome.errors.push('account already verified');
      return workflow.emit('response');
    }

    workflow.on('validate', function() {
      if (!req.body.email) {
        workflow.outcome.errfor.email = 'required';
      }
      else if (!/^[a-zA-Z0-9\-\_\.\+]+@[a-zA-Z0-9\-\_\.]+\.[a-zA-Z0-9\-\_]+$/.test(req.body.email)) {
        workflow.outcome.errfor.email = 'invalid email format';
      }

      if (workflow.hasErrors()) {
        return workflow.emit('response');
      }

      workflow.emit('duplicateEmailCheck');
    });

    workflow.on('duplicateEmailCheck', function() {
      req.app.db.models.User.findOne({ email: req.body.email.toLowerCase(), _id: { $ne: req.user.id } }, function(err, user) {
        if (err) {
          return workflow.emit('exception', err);
        }

        if (user) {
          workflow.outcome.errfor.email = 'email already taken';
          return workflow.emit('response');
        }

        workflow.emit('patchUser');
      });
    });

    workflow.on('patchUser', function() {
      var fieldsToSet = { email: req.body.email.toLowerCase() };
      var options = { new: true };
      req.app.db.models.User.findByIdAndUpdate(req.user.id, fieldsToSet, options, function(err, user) {
        if (err) {
          return workflow.emit('exception', err);
        }

        workflow.user = user;
        workflow.emit('generateToken');
      });
    });

    workflow.on('generateToken', function() {
      var crypto = require('crypto');
      crypto.randomBytes(21, function(err, buf) {
        if (err) {
          return next(err);
        }

        var token = buf.toString('hex');
        req.app.db.models.User.encryptPassword(token, function(err, hash) {
          if (err) {
            return next(err);
          }

          workflow.emit('patchAccount', token, hash);
        });
      });
    });

    workflow.on('patchAccount', function(token, hash) {
      var fieldsToSet = { verificationToken: hash };
      req.app.db.models.Account.findByIdAndUpdate(req.user.roles.account.id, fieldsToSet, function(err, account) {
        if (err) {
          return workflow.emit('exception', err);
        }

        sendVerificationEmail(req, res, {
          email: workflow.user.email,
          verificationToken: token,
          onSuccess: function() {
            workflow.emit('response');
          },
          onError: function(err) {
            workflow.outcome.errors.push('Error Sending: '+ err);
            workflow.emit('response');
          }
        });
      });
    });

    workflow.emit('validate');
  },
  verify: function(req, res, next){
    var outcome = {};
    req.app.db.models.User.validatePassword(req.params.token, req.user.roles.account.verificationToken, function(err, isValid) {
      if (!isValid) {
        outcome.errors = ['invalid verification token'];
        outcome.success = false;
        return res.status(200).json(outcome);
      }

      var fieldsToSet = { isVerified: 'yes', verificationToken: '' };
      req.app.db.models.Account.findByIdAndUpdate(req.user.roles.account._id, fieldsToSet, function(err, account) {
        if (err) {
          return next(err);
        }
        outcome.success = true;
        outcome.user = {
          id: req.user._id,
          email: req.user.email,
          admin: !!(req.user.roles && req.user.roles.admin),
          isVerified: true
        };
        return res.status(200).json(outcome);
      });
    });
  },

  disconnectGoogle: function (req, res, next) {
    return disconnectSocial('google', req, res, next);
  },

  disconnectFacebook: function(req, res, next){
    return disconnectSocial('facebook', req, res, next);
  },

  connectGoogle: function(req, res, next){
    return connectSocial('google', req, res, next);
  },

  connectFacebook: function(req, res, next){
    return connectSocial('facebook', req, res, next);
  }
  
};
module.exports = property;