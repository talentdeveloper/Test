'use strict';

// public api
var admin = {
  getStats: function(req, res, next){
    var counts = {};
    var statuses = ['PropertySubmitted', 'New', 'ActivelyWorking', 'OfferAccepted', 'OfferRejected', 'UCSeller', 'UCBuyer', 'Closed','DeadLeads'];
    var queries = [];

    // collections.forEach(function(collection, i, arr){
    //   queries.push(function(done){
    //     req.app.db.models[collection].count({}, function(err, count){
    //       if(err){
    //         return done(err);
    //       }
    //       counts[collection] = count;
    //       done();
    //     });
    //     console.log('here');
    //     // if(collection == 'Property'){
    //     //   console.log('getin');
    //     //   req.app.db.models[collection].count({}, function(err, count){
    //     //     if(err){
    //     //       return done(err);
    //     //     }
    //     //     counts[collection] = count;
    //     //     console.log(count);
    //     //     done();
    //     //   });
    //     // }
    //   });
    statuses.forEach(function(status, i, arr){
      queries.push(function(done){
        switch (status){
        case 'PropertySubmitted':
          req.app.db.models.Property.count({}, function(err, count){
            if(err){
              return done(err);
            }
            counts[status] = count;
            done();
          });
          break;
        case 'New':
          req.app.db.models.Property.find({ "status" : 'new' }).count({}, function(err, count){
            if(err){
              return done(err);
            }
            counts[status] = count;
            done();
          });
          break;
        case 'ActivelyWorking':
          req.app.db.models.Property.find({ "status": 'inProgress' }).count({}, function(err, count){
            if(err){
              return done(err);
            }
            counts[status] = count;
            done();
          });
          break;
        case 'OfferAccepted':
          req.app.db.models.Property.find({ "status": 'offerAccepted' }).count({}, function(err, count){
            if(err){
              return done(err);
            }
            counts[status] = count;
            done();
          });
          break;
        case 'OfferRejected':
          req.app.db.models.Property.find({ "status": 'offerRejected' }).count({}, function(err, count){
            if(err){
              return done(err);
            }
            counts[status] = count;
            done();
          });
          break;
        case 'UCSeller':
          req.app.db.models.Property.find({ "status": 'ucSeller' }).count({}, function(err, count){
            if(err){
              return done(err);
            }
            counts[status] = count;
            done();
          });
          break;
        case 'UCBuyer':
          req.app.db.models.Property.find({ "status": 'ucBuyer' }).count({}, function(err, count){
            if(err){
              return done(err);
            }
            counts[status] = count;
            done();
          });
          break;
        case 'Closed':
          req.app.db.models.Property.find({ "status": 'closed' }).count({}, function(err, count){
            if(err){
              return done(err);
            }
            counts[status] = count;
            done();
          });
          break;
        case 'DeadLeads':
          req.app.db.models.Property.find({ "status": 'deadLeads' }).count({}, function(err, count){
            if(err){
              return done(err);
            }
            counts[status] = count;
            done();
          });
          break;

        }
        
      });
    });
    // req.app.db.models.Property.count({}, function(err, count){
    //       if(err){
    //         return done(err);
    //       }
    //       //counts[Property] = count;
    //       res.status(200).json(count);
    //     });
    //     console.log('here');
   
    var asyncFinally = function(err, results){
      if(err){
        return next(err);
      }
      res.status(200).json(counts);
    };

    require('async').parallel(queries, asyncFinally);
  },
  search: function (req, res, next) {
    req.query.q = req.query.q ? req.query.q : '';
    var regexQuery = new RegExp('^.*?' + req.query.q + '.*$', 'i');
    var outcome = {};

    var searchUsers = function (done) {
      req.app.db.models.User.find({search: regexQuery}, 'username').sort('username').limit(10).lean().exec(function (err, results) {
        if (err) {
          return done(err, null);
        }

        outcome.users = results;
        done(null, 'searchUsers');
      });
    };

    var searchAccounts = function (done) {
      req.app.db.models.Account.find({search: regexQuery}, 'name.full').sort('name.full').limit(10).lean().exec(function (err, results) {
        if (err) {
          return done(err, null);
        }

        outcome.accounts = results;
        return done(null, 'searchAccounts');
      });
    };

    var searchAdministrators = function (done) {
      req.app.db.models.Admin.find({search: regexQuery}, 'name.full').sort('name.full').limit(10).lean().exec(function (err, results) {
        if (err) {
          return done(err, null);
        }

        outcome.administrators = results;
        return done(null, 'searchAdministrators');
      });
    };

    var asyncFinally = function (err, results) {
      if (err) {
        return next(err, null);
      }

      //res.send(outcome);
      res.status(200).json(outcome);
    };

    require('async').parallel([searchUsers, searchAccounts, searchAdministrators], asyncFinally);
  }
};
module.exports = admin;