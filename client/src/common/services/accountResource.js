angular.module('services.accountResource', ['security.service']).factory('accountResource', ['$http', '$q', '$log', 'security', function ($http, $q, $log, security) {
  // local variable
  var baseUrl = '/api';
  var processResponse = function(res){
    return res.data;
  };
  var processError = function(e){
    var msg = [];
    if(e.status)         { msg.push(e.status); }
    if(e.statusText)     { msg.push(e.statusText); }
    if(msg.length === 0) { msg.push('Unknown Server Error'); }
    return $q.reject(msg.join(' '));
  };
  // public api
  var resource = {};
  resource.sendMessage = function(data){
    return $http.post(baseUrl + '/sendMessage', data).then(processResponse, processError);
  };

  resource.getAccountDetails = function(){
    return $http.get(baseUrl + '/account/settings').then(processResponse, processError);
  };
  resource.setAccountDetails = function(data){
    return $http.put(baseUrl + '/account/settings', data).then(processResponse, processError);
  };
  resource.setIdentity = function(data){
    return $http.put(baseUrl + '/account/settings/identity', data).then(processResponse, processError);
  };
  resource.setPassword = function(data){
    return $http.put(baseUrl + '/account/settings/password', data).then(processResponse, processError);
  };

  resource.getAccountProperties = function(){
    return $http.get(baseUrl + '/account/properties').then(processResponse, processError);
  };
  resource.setAccountProperty = function(data){
    return $http.put(baseUrl + '/account/properties', data).then(processResponse, processError);
  };
  resource.addAccountProperty = function(data){
    return $http.post(baseUrl + '/account/properties', data).then(processResponse, processError);
  };
  resource.findPropertyList = function(username){
    var url = baseUrl + '/account/propertylist/' + username;
    return $http.get(url).then(processResponse, processError);
  }; 
  resource.findVideoURL = function() {
    return $http.get(baseUrl + '/account').then(processResponse, processError);
  };
  resource.findTrainingVideoURL = function() {
    console.log('jojojojojojojojojo');
    return $http.get(baseUrl + '/resources/training').then(processResponse, processError);
  };

  resource.getPropertyStatuses = function() {
    return $http.get(baseUrl + '/account/propertystatuses').then(processResponse, processError);
  }

  resource.resendVerification = function(email){
    return $http.post(baseUrl + '/account/verification', {email: email}).then(processResponse, processError);
  };

  resource.upsertVerification = function(){
    return $http.get(baseUrl + '/account/verification').then(processResponse, processError);
  };

  resource.verifyAccount = function(token){
    return $http.get(baseUrl + '/account/verification/' + token)
      .then(processResponse, processError)
      .then(function(data){
        //this saves us another round trip to backend to retrieve the latest currentUser obj
        if(data.success && data.user){
          security.setCurrentUser(data.user);
        }
        return data;
      });
  };
  resource.getUserPropertyStats = function(_id) {
    return $http.get(baseUrl + '/account/getstats/' + _id).then(processResponse, processError);
  }

  resource.upload = function(file) {
    var fd = new FormData();
    fd.append('myfile', file.upload);
    console.log('passed upload accountResource');
    return $http.post('/upload', fd, {
      transformRequest: angular.identity,
      headers: { 'Content-Type': undefined }
    });
  };

  resource.uploadDist = function(file) {
    var fd = new FormData();
    fd.append('myfileDist', file.upload);
    console.log('passed uploadDist accountResource');
    return $http.post('/uploadDist', fd, {
      transformRequest: angular.identity,
      headers: { 'Content-Type': undefined }
    });
  };

  resource.propertyUpload = function(file) {
    var fd = new FormData();
    fd.append('propertyImage', file.upload);
    console.log('passed upload accountResource');
    return $http.post('/propertyupload', fd, {
      transformRequest: angular.identity,
      headers: { 'Content-Type': undefined }
    });
  };

  resource.propertyUploadDist = function(file) {
    var fd = new FormData();
    fd.append('propertyImageDist', file.upload);
    console.log('passed uploadDist accountResource');
    return $http.post('/propertyuploadDist', fd, {
      transformRequest: angular.identity,
      headers: { 'Content-Type': undefined }
    });
  };
  
  return resource;
}]);
