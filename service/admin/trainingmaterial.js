'use strict';

// public api
var trainingmaterial = {
  findVideoURL: function (req, res, next) {
  	req.app.db.models.Video.findOne({"videoURL": 'yes'}).exec(function(err, data) {
  		if (err) {
  			return err;
  		}
  		res.status(200).json(data);
  	})
  },

  updateVideo: function(req, res, next) {
  	var query = {"videoURL": 'yes'};
  	req.app.db.models.Video.findOneAndUpdate({"videoURL": 'yes'}, { "welcomePageURL": req.body.welcomePageURL, "instructionURL": req.body.instructionURL, "description": req.body.description}).exec(function(err, doc){
      if (err) return res.send(500, { error: err });
      return res.send("succesfully saved");
  	});
  },

  find: function (req, res, next) {
    req.query.user = req.query.user ? req.query.user : '';
    req.query.limit = req.query.limit ? parseInt(req.query.limit, null) : 20;
    req.query.page = req.query.page ? parseInt(req.query.page, null) : 1;
    req.query.sort = req.query.sort ? req.query.sort : '_id';
    req.query.status = req.query.status ? req.query.status : '';

    var filters = {};
    if (req.query.user) {
      filters.user = new RegExp('^.*?' + req.query.user + '.*$', 'i');
    }

    if (req.query.status) {
        filters['status.id'] = req.query.status;
      }

    req.app.db.models.InstructionVideo.find({
    }, function (err, results) {
      if (err) {
        return next(err);
      }
      results.filters = req.query;
      res.status(200).json(results);
    });
  },

  create: function (req, res, next) {
    var workflow = req.app.utility.workflow(req, res);

    workflow.on('validate', function () {
      workflow.emit('createVideoURL');
    });
    workflow.on('createVideoURL', function () {
      var fieldsToSet = {        
       videoURL: req.body.videoURL,
       videoTitle: req.body.videoTitle,
       thumbnailURL: req.body.thumbnailURL
      };
      req.app.db.models.InstructionVideo.create(fieldsToSet, function(err, instructionVideo) {
        if (err) {
          return workflow.emit('exception', err);
        }
        workflow.outcome.record = instructionVideo;
        return workflow.emit('response');
      });
    });

    workflow.emit('validate');
  },

  read: function(req, res, next){
    req.app.db.models.InstructionVideo.findById(req.params.id).exec(function(err, selectedVideo) {
      if (err) {
        return next(err);
      }

      res.status(200).json(selectedVideo);
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

      workflow.emit('updateInstructionVideo');
    });
    workflow.on('updateInstructionVideo', function() {
      var fieldsToSet = {
        videoURL: req.body.videoURL,
        videoTitle: req.body.videoTitle,
        videoDescription: req.body.videoDescription,
        thumbnailURL: req.body.thumbnailURL
      };
      var options = { new: true };

      req.app.db.models.InstructionVideo.findByIdAndUpdate(req.params.id, fieldsToSet, options, function(err, currentStatus) {
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

      workflow.emit('deleteInstrunctionVideo');
    });

    workflow.on('deleteInstrunctionVideo', function(err) {
      req.app.db.models.InstructionVideo.findByIdAndRemove(req.params.id, function(err, currentStatusConfigure) {
        if (err) {
          return workflow.emit('exception', err);
        }

        workflow.emit('response');
      });
    });

    workflow.emit('validate');
  },

  findAdv: function (req, res, next) {
    req.query.user = req.query.user ? req.query.user : '';
    req.query.limit = req.query.limit ? parseInt(req.query.limit, null) : 20;
    req.query.page = req.query.page ? parseInt(req.query.page, null) : 1;
    req.query.sort = req.query.sort ? req.query.sort : '_id';
    req.query.status = req.query.status ? req.query.status : '';

    var filters = {};
    if (req.query.user) {
      filters.user = new RegExp('^.*?' + req.query.user + '.*$', 'i');
    }

    if (req.query.status) {
        filters['status.id'] = req.query.status;
      }

    req.app.db.models.AdvInstructionVideo.find({
    }, function (err, results) {
      if (err) {
        return next(err);
      }
      results.filters = req.query;
      res.status(200).json(results);
    });
  },

  createAdv: function (req, res, next) {
    var workflow = req.app.utility.workflow(req, res);

    workflow.on('validate', function () {
      workflow.emit('createVideoURL');
    });
    workflow.on('createVideoURL', function () {
      var fieldsToSet = {        
       videoURL: req.body.videoURL,
       videoTitle: req.body.videoTitle,
       thumbnailURL: req.body.thumbnailURL
      };
      req.app.db.models.AdvInstructionVideo.create(fieldsToSet, function(err, instructionVideo) {
        if (err) {
          return workflow.emit('exception', err);
        }
        workflow.outcome.record = instructionVideo;
        return workflow.emit('response');
      });
    });

    workflow.emit('validate');
  },

  readAdv: function(req, res, next){
    req.app.db.models.AdvInstructionVideo.findById(req.params.id).exec(function(err, selectedVideo) {
      if (err) {
        return next(err);
      }

      res.status(200).json(selectedVideo);
    });
  },



  updateAdv: function(req, res, next){
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

      workflow.emit('updateInstructionVideo');
    });
    workflow.on('updateInstructionVideo', function() {
      var fieldsToSet = {
        videoURL: req.body.videoURL,
        videoTitle: req.body.videoTitle,
        videoDescription: req.body.videoDescription,
        thumbnailURL: req.body.thumbnailURL
      };
      var options = { new: true };

      req.app.db.models.AdvInstructionVideo.findByIdAndUpdate(req.params.id, fieldsToSet, options, function(err, currentStatus) {
        if (err) {
          return workflow.emit('exception', err);
        }

        workflow.outcome.property = currentStatus;
        return workflow.emit('response');
      });
    });

    workflow.emit('validate');
  },

  

  deleteAdv: function(req, res, next){
    var workflow = req.app.utility.workflow(req, res);

    workflow.on('validate', function() {

      workflow.emit('deleteInstrunctionVideo');
    });

    workflow.on('deleteInstrunctionVideo', function(err) {
      req.app.db.models.AdvInstructionVideo.findByIdAndRemove(req.params.id, function(err, currentStatusConfigure) {
        if (err) {
          return workflow.emit('exception', err);
        }

        workflow.emit('response');
      });
    });

    workflow.emit('validate');
  },

  findLinks: function (req, res, next) {
    req.query.user = req.query.user ? req.query.user : '';
    req.query.limit = req.query.limit ? parseInt(req.query.limit, null) : 20;
    req.query.page = req.query.page ? parseInt(req.query.page, null) : 1;
    req.query.sort = req.query.sort ? req.query.sort : '_id';
    req.query.status = req.query.status ? req.query.status : '';

    var filters = {};
    if (req.query.user) {
      filters.user = new RegExp('^.*?' + req.query.user + '.*$', 'i');
    }

    if (req.query.status) {
        filters['status.id'] = req.query.status;
      }

    req.app.db.models.SiteLink.find({
    }, function (err, results) {
      if (err) {
        return next(err);
      }
      results.filters = req.query;
      res.status(200).json(results);
    });
  },

  createLinks: function (req, res, next) {
    var workflow = req.app.utility.workflow(req, res);

    workflow.on('validate', function () {
      workflow.emit('createVideoURL');
    });
    workflow.on('createVideoURL', function () {
      var fieldsToSet = {        
       siteURL: req.body.siteURL,
       siteName: req.body.siteName,
      };
      req.app.db.models.SiteLink.create(fieldsToSet, function(err, result) {
        if (err) {
          return workflow.emit('exception', err);
        }
        workflow.outcome.record = result;
        return workflow.emit('response');
      });
    });

    workflow.emit('validate');
  },

  readLinks: function(req, res, next){
    req.app.db.models.SiteLink.findById(req.params.id).exec(function(err, result) {
      console.log("logged herere");
      if (err) {
        return next(err);
      }

      res.status(200).json(result);
    });
  },



  updateLinks: function(req, res, next){
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

      workflow.emit('updateInstructionVideo');
    });
    workflow.on('updateInstructionVideo', function() {
      var fieldsToSet = {
        siteURL: req.body.siteURL,
        siteName: req.body.siteName,
        siteDescription: req.body.siteDescription
      };
      var options = { new: true };

      req.app.db.models.SiteLink.findByIdAndUpdate(req.params.id, fieldsToSet, options, function(err, result) {
        if (err) {
          return workflow.emit('exception', err);
        }

        workflow.outcome.property = result;
        return workflow.emit('response');
      });
    });

    workflow.emit('validate');
  },

  

  deleteLinks: function(req, res, next){
    var workflow = req.app.utility.workflow(req, res);

    workflow.on('validate', function() {

      workflow.emit('deleteInstrunctionVideo');
    });

    workflow.on('deleteInstrunctionVideo', function(err) {
      req.app.db.models.SiteLink.findByIdAndRemove(req.params.id, function(err, result) {
        if (err) {
          return workflow.emit('exception', err);
        }

        workflow.emit('response');
      });
    });

    workflow.emit('validate');
  },


  findDownloads: function (req, res, next) {
    req.query.user = req.query.user ? req.query.user : '';
    req.query.limit = req.query.limit ? parseInt(req.query.limit, null) : 20;
    req.query.page = req.query.page ? parseInt(req.query.page, null) : 1;
    req.query.sort = req.query.sort ? req.query.sort : '_id';
    req.query.status = req.query.status ? req.query.status : '';

    var filters = {};
    if (req.query.user) {
      filters.user = new RegExp('^.*?' + req.query.user + '.*$', 'i');
    }

    if (req.query.status) {
        filters['status.id'] = req.query.status;
      }

    req.app.db.models.DownloadMaterial.find({
    }, function (err, results) {
      if (err) {
        return next(err);
      }
      results.filters = req.query;
      res.status(200).json(results);
    });
  },

  createDownloads: function (req, res, next) {
    var workflow = req.app.utility.workflow(req, res);

    workflow.on('validate', function () {
      workflow.emit('createVideoURL');
    });
    workflow.on('createVideoURL', function () {
      var fieldsToSet = {        
       videoURL: req.body.videoURL,
       videoTitle: req.body.videoTitle,
       thumbnailURL: req.body.thumbnailURL
      };
      req.app.db.models.DownloadMaterial.create(fieldsToSet, function(err, result) {
        if (err) {
          return workflow.emit('exception', err);
        }
        workflow.outcome.record = result;
        return workflow.emit('response');
      });
    });

    workflow.emit('validate');
  },

  readDownloads: function(req, res, next){
    req.app.db.models.DownloadMaterial.findById(req.params.id).exec(function(err, result) {
      if (err) {
        return next(err);
      }

      res.status(200).json(result);
    });
  },



  updateDownloads: function(req, res, next){
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

      workflow.emit('updateInstructionVideo');
    });
    workflow.on('updateInstructionVideo', function() {
      var fieldsToSet = {
        videoURL: req.body.videoURL,
        videoTitle: req.body.videoTitle,
        videoDescription: req.body.videoDescription,
        thumbnailURL: req.body.thumbnailURL
      };
      var options = { new: true };

      req.app.db.models.DownloadMaterial.findByIdAndUpdate(req.params.id, fieldsToSet, options, function(err, result) {
        if (err) {
          return workflow.emit('exception', err);
        }

        workflow.outcome.property = result;
        return workflow.emit('response');
      });
    });

    workflow.emit('validate');
  },

  

  deleteDownloads: function(req, res, next){
    var workflow = req.app.utility.workflow(req, res);

    workflow.on('validate', function() {

      workflow.emit('deleteInstrunctionVideo');
    });

    workflow.on('deleteInstrunctionVideo', function(err) {
      req.app.db.models.DownloadMaterial.findByIdAndRemove(req.params.id, function(err, result) {
        if (err) {
          return workflow.emit('exception', err);
        }

        workflow.emit('response');
      });
    });

    workflow.emit('validate');
  },
};
module.exports = trainingmaterial;