'use strict';

// public api
var closingstats = {

  find: function (req, res, next) {
    req.app.db.models.User.find({"registeredClosingStats": 'yes'}, function (err, results) {
      if (err) {
        return next(err);
      }
      console.log(results);
      res.status(200).json(results);
    });
  },

  create: function (req, res, next) {
    var workflow = req.app.utility.workflow(req, res);
    workflow.on('validate', function () {
      workflow.emit('createClosingStats');
    });
    workflow.on('createClosingStats', function () {
      console.log(req.body);
      req.app.db.models.User.findOneAndUpdate({"username": req.body.username}, {"registeredClosingStats": 'yes'}, function(err, result){
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
    
    req.app.db.models.User.findById(req.params.id).exec(function(err, result) {
      if (err) {
        return next(err);
      }
      res.status(200).json(result);
    });
  },

  update: function(req, res, next){
    var workflow = req.app.utility.workflow(req, res);
    var fieldsToSet = {        
       username: req.body.username
    };
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
      
      var options = { new: true };
      req.app.db.models.User.findByIdAndUpdate(req.params.id, {"closingStatsExplanation": req.body.closingStatsExplanation}, function(err, result){
        if (err) {
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
      req.app.db.models.User.findByIdAndUpdate(req.params.id, {"closingStatsExplanation": '', "registeredClosingStats": 'no'}, function(err, result) {
        if (err) {
          return workflow.emit('exception', err);
        }
        workflow.emit('response');
      });
    });

    workflow.emit('validate');
    
  },

  getClosingTitle: function(req, res, next) {
    req.app.db.models.ClosingTitle.findOne({"isTitle": 'yes'}, function (err, results) {
      if (err) {
        return next(err);
      }
      res.status(200).json(results);
    });
  },
  updateClosingTitle: function(req, res, next) {
    console.log(req.body);  
    var fieldsToSet = {
      title: req.body.title
    };
    var options = { new: true };

    req.app.db.models.ClosingTitle.findOneAndUpdate({"isTitle": 'yes'}, fieldsToSet).exec(function(err, result) {
      if (err) return res.send(500, { error: err });
      return res.send("succesfully saved");
    });
  }
};
module.exports = closingstats;