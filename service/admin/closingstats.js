'use strict';

// public api
var closingstats = {
  
  find: function (req, res, next) {
    req.app.db.models.ClosingStats.find({}, function (err, results) {
      if (err) {
        return next(err);
      }
      res.status(200).json(results);
    });
  },

  create: function (req, res, next) {
    var workflow = req.app.utility.workflow(req, res);
    workflow.on('validate', function () {
      workflow.emit('createClosingStats');
    });
    workflow.on('createClosingStats', function () {
      var fieldsToSet = {        
       username: req.body.username
      };
      req.app.db.models.ClosingStats.create(fieldsToSet, function (err, result) {
        if (err) {
          return workflow.emit('exception', err);
        }
        workflow.outcome.record = result;
        return workflow.emit('response');
      });
    });
    workflow.emit('validate');
  },

  read: function(req, res, next){
    req.app.db.models.ClosingStats.findById(req.params.id).exec(function(err, result) {
      if (err) {
        return next(err);
      }
      res.status(200).json(result);
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

      workflow.emit('patchClosingStats');
    });

    workflow.on('patchClosingStats', function() {
      var fieldsToSet = {
        username: req.body.username,
        explanation: req.body.explanation
      };
      var options = { new: true };

      req.app.db.models.ClosingStats.findByIdAndUpdate(req.params.id, fieldsToSet, options, function(err, result) {
        if (err) {
          console.log("has some errors");
          return workflow.emit('exception', err);
        }

        workflow.outcome.property = result;
        console.log(result);
        
        return workflow.emit('response');
      });
    });

    workflow.emit('validate');
  },
  delete: function(req, res, next){
    var workflow = req.app.utility.workflow(req, res);

    workflow.on('validate', function() {

      workflow.emit('deleteClosingStats');
    });

    workflow.on('deleteClosingStats', function(err) {
      req.app.db.models.Property.findByIdAndRemove(req.params.id, function(err, result) {
        if (err) {
          return workflow.emit('exception', err);
        }
        workflow.emit('response');
      });
    });

    workflow.emit('validate');
    
  }
};
module.exports = closingstats;