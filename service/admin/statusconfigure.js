'use strict';

// public api
var statusconfigure = {
  find: function (req, res, next) {
    req.app.db.models.StatusType.find({
    }, function (err, results) {
      if (err) {
        return next(err);
      }
      res.status(200).json(results);
    });
  },


  create: function (req, res, next) {
    var workflow = req.app.utility.workflow(req, res);
    workflow.on('validate', function () {
      workflow.emit('createStatusType');
    });
    workflow.on('createStatusType', function () {
      var fieldsToSet = {        
       statusName: req.body.statusName,
       statusDetail: req.body.statusDetail
      };
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
          return workflow.emit('exception', err);
        }
        workflow.outcome.property = currentStatus;
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