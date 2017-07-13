'use strict';

// public api
var statusconfigure = {
  find: function (req, res, next) {

    // console.log('accessed node service');
    // req.query.user = req.query.user ? req.query.user : '';
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
    //   }
    req.app.db.models.StatusType.find({
    }, function (err, results) {
      if (err) {
        return next(err);
      }
      // results.filters = req.query;
      res.status(200).json(results);
    });
  },


  create: function (req, res, next) {
    var workflow = req.app.utility.workflow(req, res);

    console.log(req.body);


    workflow.on('validate', function () {
      // if (!req.body.ownerFirstName) {
      //   workflow.outcome.errors.push('Please enter a ownerFirstName.');
      //   return workflow.emit('response');
      // }

      // if (!req.body.ownerLastName) {
      //   workflow.outcome.errors.push('Please enter a ownerLastName.');
      //   return workflow.emit('response');
      // }

      // if (!/^[a-zA-Z0-9\-\_]+$/.test(req.body.ownerFirstName)) {
      //   workflow.outcome.errors.push('only use letters, numbers, -, _');
      //   return workflow.emit('response');
      // }

      // if (!/^[a-zA-Z0-9\-\_]+$/.test(req.body.ownerLastName)) {
      //   workflow.outcome.errors.push('only use letters, numbers, -, _');
      //   return workflow.emit('response');
      // }

      //workflow.emit('duplicateUsernameCheck');
      workflow.emit('createStatusType');
    });


    workflow.on('createStatusType', function () {
      var fieldsToSet = {        
       statusName: req.body.statusName,
       statusDetail: req.body.statusDetail
      };
      console.log(req.body);
      req.app.db.models.StatusType.create(fieldsToSet, function (err, statusType) {
        if (err) {
          return workflow.emit('exception', err);
        }

        workflow.outcome.record = statusType;
        return workflow.emit('response');
      });
    });

    workflow.emit('validate');
  },

  read: function(req, res, next){
    req.app.db.models.StatusType.findById(req.params.id).exec(function(err, selectedStatus) {
      if (err) {
        return next(err);
      }

      res.status(200).json(selectedStatus);
    });
  },



  update: function(req, res, next){
    var workflow = req.app.utility.workflow(req, res);

    console.log(workflow);
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

      workflow.emit('patchStatusConfigures');
    });

    workflow.on('patchStatusConfigures', function() {
      var fieldsToSet = {
        statusName: req.body.statusName,
        statusDetail: req.body.statusDetail
      };
      var options = { new: true };

      req.app.db.models.StatusType.findByIdAndUpdate(req.params.id, fieldsToSet, options, function(err, currentStatus) {
        if (err) {
          console.log("has some errors");
          return workflow.emit('exception', err);
        }

        workflow.outcome.property = currentStatus;
        console.log(currentStatus);
        //console.log(response);
        return workflow.emit('response');
      });
    });

    workflow.emit('validate');
  },

  

  delete: function(req, res, next){
    var workflow = req.app.utility.workflow(req, res);

    workflow.on('validate', function() {

      workflow.emit('deleteStatusConfigure');
    });

    workflow.on('deleteStatusConfigure', function(err) {
      req.app.db.models.StatusType.findByIdAndRemove(req.params.id, function(err, currentStatusConfigure) {
        if (err) {
          return workflow.emit('exception', err);
        }

        workflow.emit('response');
      });
    });

    workflow.emit('validate');
  }
};
module.exports = statusconfigure;