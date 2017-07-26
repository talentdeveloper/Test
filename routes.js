'use strict';

var preAuth = require('./service/pre-auth');
var security = require('./service/security');
var account = require('./service/account');
var property = require('./service/property');
var admin = require('./service/admin/admin');
var adminUser = require('./service/admin/user');
var adminAccount = require('./service/admin/account');
var adminAdministrator = require('./service/admin/administrator');
var adminGroup = require('./service/admin/admin-group');
var adminStatus = require('./service/admin/status');
var adminCategory = require('./service/admin/category');
var adminProperty = require('./service/admin/property');
var adminTraining = require('./service/admin/trainingmaterial');
var adminStatusConfigures = require('./service/admin/statusconfigure');
var adminClosingStats = require('./service/admin/closingstats');
var commonFileName = '';
var commonPropertyFileName = '';
var commonUploadFileName = '';

var multer = require('multer');
var storage = multer.diskStorage({
      destination: function(req, file, cb) {
        cb(null, './upload/images/avatar/');
      },
      filename: function(req, file, cb) {
        if (!file.originalname.match(/\.(jpeg|jpg|png)$/)) {
          var err = new Error();
          err.code = 'filetype';
          return cb(err);
        } else {
          commonFileName = Date.now() + '_' + file.originalname; 
          cb(null, commonFileName);
        
        }
      }
    });
var storageDist = multer.diskStorage({
      destination: function(req, file, cb) {
        cb(null, './client/dist/upload/images/avatar/');
      },
      filename: function(req, file, cb) {
        if (!file.originalname.match(/\.(jpeg|jpg|png)$/)) {
          var err = new Error();
          err.code = 'filetype';
          return cb(err);
        } else {
          cb(null, commonFileName);
        }
      }
    });

var storageProperty = multer.diskStorage({
      destination: function(req, file, cb) {
        cb(null, './upload/images/property/');
      },
      filename: function(req, file, cb) {
        if (!file.originalname.match(/\.(jpeg|jpg|png)$/)) {
          var err = new Error();
          err.code = 'filetype';
          return cb(err);
        } else {
          commonPropertyFileName = Date.now() + '_' + file.originalname; 
          cb(null, commonPropertyFileName);
     
        }
      }
    });
var storagePropertyDist = multer.diskStorage({
      destination: function(req, file, cb) {
        cb(null, './client/dist/upload/images/property/');
      },
      filename: function(req, file, cb) {
        if (!file.originalname.match(/\.(jpeg|jpg|png)$/)) {
          var err = new Error();
          err.code = 'filetype';
          return cb(err);
        } else {
          cb(null, commonPropertyFileName);
        }
      }
    });
var storageFileUpload = multer.diskStorage({
      destination: function(req, file, cb) {
        cb(null, './upload/files/');
      },
      filename: function(req, file, cb) {
        
        commonUploadFileName = Date.now() + '_' + file.originalname; 
        cb(null, commonUploadFileName);
        
        
      }
    });
var storageFileUploadDist = multer.diskStorage({
      destination: function(req, file, cb) {
        cb(null, './client/dist/upload/files/');
      },
      filename: function(req, file, cb) {
        
        cb(null, commonUploadFileName);
        
      }
    });

function useAngular(req, res, next){
  res.sendFile(require('path').join(__dirname, './client/dist/index.html'));
}

function apiEnsureAuthenticated(req, res, next){
  if(req.isAuthenticated()){
    return next();
  }
  res.set('X-Auth-Required', 'true');
  //no need to store the originalUrl in session: caller knows the return url
  //req.session.returnUrl = req.originalUrl;
  res.status(401).send({errors: ['authentication required']});
}

function apiEnsureAccount(req, res, next){
  if(req.user.canPlayRoleOf('account')){
    return next();
  }
  res.status(401).send({errors: ['authorization required']});
}

function apiEnsureVerifiedAccount(req, res, next){
  if(!req.app.config.requireAccountVerification){
    return next();
  }
  req.user.isVerified(function(err, flag){
    if(err){
      return next(err);
    }
    if(flag){
      return next();
    }else{
      return res.status(401).send({errors: ['verification required']});
    }
  });
}

function apiEnsureAdmin(req, res, next){
  if(req.user.canPlayRoleOf('admin')){
    return next();
  }
  res.status(401).send({errors: ['authorization required']});
}

exports = module.exports = function(app, passport) {
  //******** NEW JSON API ********
  app.get('/api/current-user', security.sendCurrentUser);
  app.post('/api/sendMessage', preAuth.sendMessage);
  app.post('/api/signup', security.signup);
  app.post('/api/login', security.login);
  app.post('/api/login/forgot', security.forgotPassword);
  app.put('/api/login/reset/:email/:token', security.resetPassword);
  app.get('/api/login/facebook/callback', security.loginFacebook);
  app.get('/api/login/google/callback', security.loginGoogle);
  app.post('/api/logout', security.logout);

  //-----authentication required api-----
  app.all('/api/account*', apiEnsureAuthenticated);
  app.all('/api/account*', apiEnsureAccount);

  app.get('/api/account', account.findVideoURL);
  app.get('/api/resources/training', account.findTrainingVideoURL);
  app.get('/api/resource/advtraining', account.findAdvTrainingVideoURL);
  app.get('/api/resource/links', account.findLinks);
  

  app.get('/api/account/verification', account.upsertVerification);
  app.post('/api/account/verification', account.resendVerification);
  app.get('/api/account/verification/:token/', account.verify);

  app.all('/api/account/settings*', apiEnsureVerifiedAccount);

  app.get('/api/account/settings', account.getAccountDetails);
  app.put('/api/account/settings', account.update);
  app.put('/api/account/settings/identity', account.identity);
  app.put('/api/account/settings/password', account.password);
  app.get('/api/account/settings/google/callback', account.connectGoogle);
  app.get('/api/account/settings/google/disconnect', account.disconnectGoogle);
  app.get('/api/account/settings/facebook/callback', account.connectFacebook);
  app.get('/api/account/settings/facebook/disconnect', account.disconnectFacebook);
  

  app.post('/api/account/properties', property.create);
  app.get('/api/account/properties', property.getAccountProperties);
  app.get('/api/account/propertylist/:id', property.findPropertyList);
  app.delete('/api/account/propertylist/:id', property.deleteProperty);

  app.get('/api/account/propertyedit/:id', property.getAccountProperty);
  app.put('/api/account/propertyedit/:id', property.updateProperty);

  app.get('/api/account/propertystatuses', account.getPropertyStatuses);

  app.get('/api/account/getstats/:id', account.getUserPropertyStats);

  app.get('/api/getquote', account.getQuote);

  app.get('/api/account/getclosingtitle', account.getClosingStatsTitle);
  app.get('/api/account/getclosingstats', account.getClosingStats);

  app.get('/api/account/getcompleteinfo/:id', account.getCompleteInfo);
  app.put('/api/account/setprofilecompleted', account.setProfileCompleted);

  app.get('/api/account/downloadmaterial', account.getDownloadMaterials);


  
  
  //-----athorization required api-----
  app.all('/api/admin*', apiEnsureAuthenticated);
  app.all('/api/admin*', apiEnsureAdmin);
  app.get('/api/admin', admin.getStats);
  app.get('/api/admin/recentlyadded', admin.findRecent);

  //admin > users
  app.get('/api/admin/users', adminUser.find);
  app.post('/api/admin/users/', adminUser.create);
  app.get('/api/admin/users/:id', adminUser.read);
  app.put('/api/admin/users/:id', adminUser.update);
  app.put('/api/admin/users/:id/password', adminUser.password);
  app.put('/api/admin/users/:id/role-admin', adminUser.linkAdmin);
  app.delete('/api/admin/users/:id/role-admin', adminUser.unlinkAdmin);
  app.put('/api/admin/users/:id/role-account', adminUser.linkAccount);
  app.delete('/api/admin/users/:id/role-account', adminUser.unlinkAccount);
  app.delete('/api/admin/users/:id', adminUser.delete);
  app.get('/api/admin/users/stat/:id', adminUser.getAccountPropertyStats);
  app.get('/api/admin/users/:id/submitted', adminUser.getSubmittedProperties);
  app.put('/api/admin/users/strike/:id', adminUser.strikeUser);

  //admin > administrators
  app.get('/api/admin/administrators', adminAdministrator.find);
  app.post('/api/admin/administrators', adminAdministrator.create);
  app.get('/api/admin/administrators/:id', adminAdministrator.read);
  app.put('/api/admin/administrators/:id', adminAdministrator.update);
  app.put('/api/admin/administrators/:id/permissions', adminAdministrator.permissions);
  app.put('/api/admin/administrators/:id/groups', adminAdministrator.groups);
  app.put('/api/admin/administrators/:id/user', adminAdministrator.linkUser);
  app.delete('/api/admin/administrators/:id/user', adminAdministrator.unlinkUser);
  app.delete('/api/admin/administrators/:id', adminAdministrator.delete);

  //admin > admin groups
  app.get('/api/admin/admin-groups', adminGroup.find);
  app.post('/api/admin/admin-groups', adminGroup.create);
  app.get('/api/admin/admin-groups/:id', adminGroup.read);
  app.put('/api/admin/admin-groups/:id', adminGroup.update);
  app.put('/api/admin/admin-groups/:id/permissions', adminGroup.permissions);
  app.delete('/api/admin/admin-groups/:id', adminGroup.delete);

  //admin > accounts
  app.get('/api/admin/accounts', adminAccount.find);
  app.post('/api/admin/accounts', adminAccount.create);
  app.get('/api/admin/accounts/:id', adminAccount.read);
  app.put('/api/admin/accounts/:id', adminAccount.update);
  app.put('/api/admin/accounts/:id/user', adminAccount.linkUser);
  app.delete('/api/admin/accounts/:id/user', adminAccount.unlinkUser);
  app.post('/api/admin/accounts/:id/notes', adminAccount.newNote);
  app.post('/api/admin/accounts/:id/status', adminAccount.newStatus);
  app.delete('/api/admin/accounts/:id', adminAccount.delete);

  //admin > statuses
  app.get('/api/admin/statuses', adminStatus.find);
  app.post('/api/admin/statuses', adminStatus.create);
  app.get('/api/admin/statuses/:id', adminStatus.read);
  app.put('/api/admin/statuses/:id', adminStatus.update);
  app.delete('/api/admin/statuses/:id', adminStatus.delete);

  //admin > categories
  app.get('/api/admin/categories', adminCategory.find);
  app.post('/api/admin/categories', adminCategory.create);
  app.get('/api/admin/categories/:id', adminCategory.read);
  app.put('/api/admin/categories/:id', adminCategory.update);
  app.delete('/api/admin/categories/:id', adminCategory.delete);

  //admin > search
  app.get('/api/admin/search', admin.search);

  //admin > properties
  app.get('/api/admin/properties', adminProperty.find);
  app.post('/api/admin/properties', adminProperty.create);
  app.get('/api/admin/properties/:id', adminProperty.read);
  app.put('/api/admin/properties/:id', adminProperty.update);
  app.delete('/api/admin/properties/:id', adminProperty.delete);

  //admin > trainingmaterial
  app.get('/api/admin/trainingmaterial', adminTraining.findVideoURL);
  app.put('/api/admin/trainingmaterial', adminTraining.updateVideo);

  app.get('/api/admin/instructionvideos', adminTraining.find);
  app.get('/api/admin/instructionvideos/:id', adminTraining.read);
  app.put('/api/admin/instructionvideos/:id', adminTraining.update);
  app.post('/api/admin/instructionvideos', adminTraining.create);
  app.delete('/api/admin/instructionvideos/:id', adminTraining.delete);

  app.get('/api/admin/advinstructionvideos', adminTraining.findAdv);
  app.get('/api/admin/advinstructionvideos/:id', adminTraining.readAdv);
  app.put('/api/admin/advinstructionvideos/:id', adminTraining.updateAdv);
  app.post('/api/admin/advinstructionvideos', adminTraining.createAdv);
  app.delete('/api/admin/advinstructionvideos/:id', adminTraining.deleteAdv);

  app.get('/api/admin/linkmaterials', adminTraining.findLinks);
  app.get('/api/admin/linkmaterials/:id', adminTraining.readLinks);
  app.put('/api/admin/linkmaterials/:id', adminTraining.updateLinks);
  app.post('/api/admin/linkmaterials', adminTraining.createLinks);
  app.delete('/api/admin/linkmaterials/:id', adminTraining.deleteLinks);

  app.get('/api/admin/downloadMaterials', adminTraining.findDownloads);
  app.get('/api/admin/downloadMaterials/:id', adminTraining.readDownloads);
  app.put('/api/admin/downloadMaterials/:id', adminTraining.updateDownloads);
  app.post('/api/admin/downloadMaterials', adminTraining.createDownloads);
  app.delete('/api/admin/downloadMaterials/:id', adminTraining.deleteDownloads);



  //admin > statusconfigure
  app.get('/api/admin/statusconfigures', adminStatusConfigures.find);
  app.post('/api/admin/statusconfigures', adminStatusConfigures.create);
  app.get('/api/admin/statusconfigures/:id', adminStatusConfigures.read);
  app.put('/api/admin/statusconfigures/:id', adminStatusConfigures.update);
  app.delete('/api/admin/statusconfigures/:id', adminStatusConfigures.delete);
  
  //admin > statusconfigure
  app.get('/api/admin/closing', adminClosingStats.find);
  app.put('/api/admin/closing', adminClosingStats.create);
  app.get('/api/admin/closing/:id', adminClosingStats.read);
  app.put('/api/admin/closing/:id', adminClosingStats.update);
  app.delete('/api/admin/closing/:id', adminClosingStats.delete);
  app.get('/api/admin/closingtitle', adminClosingStats.getClosingTitle);
  app.put('/api/admin/closingtitle', adminClosingStats.updateClosingTitle);
  app.put('/api/admin/closingtitleshow', adminClosingStats.updateClosingTitleShow);
  

  //******** END OF NEW JSON API ********

  //******** Static routes handled by Angular ********
  //public
  app.get('/', useAngular);
  app.get('/about', useAngular);
  app.get('/contact', useAngular);

  //sign up
  app.get('/signup', useAngular);

  // remark Ranking and Badge for Users
  app.get('/api/remark', adminAdministrator.remarkSystem);

  //social sign up no-longer needed as user can login with their social account directly
  //this eliminates one more step (collecting email) before user login

  //login/out
  app.get('/login', useAngular);
  app.get('/login/forgot', useAngular);
  app.get('/login/reset', useAngular);
  app.get('/login/reset/:email/:token', useAngular);

  //social login
  app.get('/login/facebook', passport.authenticate('facebook', { callbackURL: 'http://' + app.config.hostname + '/login/facebook/callback', scope: ['email'] }));
  app.get('/login/facebook/callback', useAngular);
  app.get('/login/google', passport.authenticate('google', { callbackURL: 'http://' + app.config.hostname + '/login/google/callback', scope: ['profile email'] }));
  app.get('/login/google/callback', useAngular);

  //account
  app.get('/account', useAngular);
  

  
  

  //account > verification
  app.get('/account/verification', useAngular);
  app.get('/account/verification/:token', useAngular);

  //account > settings
  app.get('/account/settings', useAngular);

  //account > settings > social
  app.get('/account/settings/facebook/', passport.authenticate('facebook', { callbackURL: 'http://' + app.config.hostname + '/account/settings/facebook/callback', scope: [ 'email' ]}));
  app.get('/account/settings/facebook/callback', useAngular);
  app.get('/account/settings/google/', passport.authenticate('google', { callbackURL: 'http://' + app.config.hostname + '/account/settings/google/callback', scope: ['profile email'] }));
  app.get('/account/settings/google/callback', useAngular);

  //admin
  app.get('/admin', useAngular);

  //admin > users
  app.get('/admin/users', useAngular);
  app.get('/admin/users/:id', useAngular);

  //admin > administrators
  app.get('/admin/administrators', useAngular);
  app.get('/admin/administrators/:id', useAngular);

  //admin > admin groups
  app.get('/admin/admin-groups', useAngular);
  app.get('/admin/admin-groups/:id', useAngular);

  //admin > accounts
  app.get('/admin/accounts', useAngular);
  app.get('/admin/accounts/:id', useAngular);

  //admin > statuses
  app.get('/admin/statuses', useAngular);
  app.get('/admin/statuses/:id', useAngular);

  //admin > categories
  app.get('/admin/categories', useAngular);
  app.get('/admin/categories/:id', useAngular);

  //admin > properties
  app.get('/admin/properties', useAngular);
  app.get('/admin/properties/:id', useAngular);

  var upload = multer({
      storage: storage,
      limits: { fileSize: 100000000 }
    }).array('myfile', 1);

  var uploadDist = multer({
      storage: storageDist,
      limits: { fileSize: 100000000 }
  }).array('myfileDist', 1);

  var uploadProperty = multer({
      storage: storageProperty,
      limits: { fileSize: 50000000 }
    }).array('propertyImage', 20);

  var uploadPropertyDist = multer({
      storage: storagePropertyDist,
      limits: { fileSize: 500000000 }
  }).array('propertyImageDist', 20);

  var uploadFiles = multer({
      storage: storageFileUpload,
      limits: { fileSize: 20000000 }
  }).array('uploadFile', 1);

  var uploadFilesDist = multer({
      storage: storageFileUploadDist,
      limits: { fileSize: 20000000 }
  }).array('uploadFileDist', 1);

  

  app.post('/upload', function(req, res) {
    upload(req, res, function(err) {
      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          res.json({ success: false, message: 'File size is too large. Max limit is 10MB'});
        } else if (err.code === 'filetype') {
          res.json({ success: false, message: 'File type is invalid. Must be ..'});
        } else {
          res.json({ success: false, message: 'File was not able to be upload.'});
        }
      } else {
        if (!req.files) {
          res.json({ success: false, message:'No file was selected.'});
        } else {
          req.app.db.models.User.findByIdAndUpdate(req.user.id, { photoURL: '\\' + req.files[0].path }, function(err, user) {
          });
          res.json({ success: true, message: 'File was uploaded'});
        }
      }
    });
  });

  app.post('/uploaddist', function(req, res) {
    uploadDist(req, res, function(err) {
      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          res.json({ success: false, message: 'File size is too large. Max limit is 10MB'});
        } else if (err.code === 'filetype') {
          res.json({ success: false, message: 'File type is invalid. Must be ..'});
        } else {
          res.json({ success: false, message: 'File was not able to be upload.'});
        }
      } else {
        if (!req.files) {
          res.json({ success: false, message:'No file was selected.'});
        } else {
          res.json({ success: true, message: 'File was uploaded'});
        }
      }
    });
  });

  app.post('/propertyupload', function(req, res) {
    uploadProperty(req, res, function(err) {
      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          res.json({ success: false, message: 'File size is too large. Max limit is 10MB'});
        } else if (err.code === 'filetype') {
          res.json({ success: false, message: 'File type is invalid. Must be ..'});
        } else {
          res.json({ success: false, message: 'File was not able to be upload.'});
        }
      } else {
        if (!req.files) {
          res.json({ success: false, message:'No file was selected.'});
        } else {
           var results = [];
          for (var i = 0; i < req.files.length; i++) {
            results[i] = '\\' + req.files[i].path;
          }

        
          res.json({ success: true, message: 'File was uploaded', photoURL: results });
        }
      }
    });
  });

  app.post('/propertyuploaddist', function(req, res) {
    uploadPropertyDist(req, res, function(err) {
      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          res.json({ success: false, message: 'File size is too large. Max limit is 10MB'});
        } else if (err.code === 'filetype') {
          res.json({ success: false, message: 'File type is invalid. Must be ..'});
        } else {
          res.json({ success: false, message: 'File was not able to be upload.'});
        }
      } else {
        if (!req.files) {
          res.json({ success: false, message:'No file was selected.'});
        } else {
          res.json({ success: true, message: 'File was uploaded'});
        }
      }
    });
  });

    app.post('/uploadfile', function(req, res) {
    uploadFiles(req, res, function(err) {
      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          res.json({ success: false, message: 'File size is too large. Max limit is 20MB'});
        } else if (err.code === 'filetype') {
          res.json({ success: false, message: 'File type is invalid. Must be ..'});
        } else {
          res.json({ success: false, message: 'File was not able to be upload.'});
        }
      } else {
        if (!req.files) {
          res.json({ success: false, message:'No file was selected.'});
        } else {
          var fieldsToSet = {
            fileURL: '\\' + req.files[0].path,
            fileName: req.files[0].originalname
          };
          req.app.db.models.DownloadMaterial.create(fieldsToSet, function(err, user) {
          });
          res.json({ success: true, message: 'File was uploaded'});
        }
      }
    });
  });

  app.post('/uploadfiledist', function(req, res) {
    uploadFilesDist(req, res, function(err) {
      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          res.json({ success: false, message: 'File size is too large. Max limit is 20MB'});
        } else if (err.code === 'filetype') {
          res.json({ success: false, message: 'File type is invalid. Must be ..'});
        } else {
          res.json({ success: false, message: 'File was not able to be upload.'});
        }
      } else {
        if (!req.files) {
          res.json({ success: false, message:'No file was selected.'});
        } else {
          res.json({ success: true, message: 'File was uploaded'});
        }
      }
    });
  });

  //other routes not found nor begin with /api is handled by Angular
  app.all(/^(?!\/api).*$/, useAngular);

  //******** End OF static routes ********
};
