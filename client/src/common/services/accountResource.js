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
  resource.getAccountProperty = function(_id) {
    return $http.get(baseUrl + '/account/propertyedit/' + _id).then(processResponse, processError);
  }
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
  resource.deleteProperty = function(_id){
    var url = baseUrl + '/account/propertylist/' + _id;
    return $http.delete(url).then(processResponse, processError);
  };

  resource.updateProperty = function(_id, data) {
    var url = baseUrl + '/account/propertyedit/' + _id;
    return $http.put(url, data).then(processResponse, processError);
  };
  resource.findVideoURL = function() {
    return $http.get(baseUrl + '/account').then(processResponse, processError);
  };
  resource.findTrainingVideoURL = function() {
    return $http.get(baseUrl + '/resources/training').then(processResponse, processError);
  };
  resource.findAdvTrainingVideoURL = function() {
    return $http.get(baseUrl + '/resource/advtraining').then(processResponse, processError);
  }
  resource.getLinkMaterials = function() {
    return $http.get(baseUrl + '/resource/links').then(processResponse, processError);
  }
  resource.getQuote = function() {
    return $http.get(baseUrl + '/getquote').then(processResponse, processError);
  };

  resource.getPropertyStatuses = function() {
    return $http.get(baseUrl + '/account/propertystatuses').then(processResponse, processError);
  };

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
  };
  resource.getClosingStatsTitle = function() {
    return $http.get(baseUrl + '/account/getclosingtitle').then(processResponse, processError);
  };
  resource.getClosingStats = function() {
    return $http.get(baseUrl + '/account/getclosingstats').then(processResponse, processError);
  };
  resource.getCompleteInfo = function(_id) {
    return $http.get(baseUrl + '/account/getcompleteinfo/' + _id).then(processResponse, processError);
  };
  resource.setProfileCompleted = function(data) {
    return $http.put(baseUrl + '/account/setprofilecompleted', data).then(processResponse, processError);
  };
  resource.getDownloadMaterials = function(_id) {
    return $http.get(baseUrl + '/account/downloadmaterial').then(processResponse, processError);
  }


  resource.upload = function(file) {
    var fd = new FormData();
    angular.forEach(file, function(val, key) {
		  fd.append('myfile', val.file);
	  });
    return $http.post('/upload', fd, {
      transformRequest: angular.identity,
      headers: { 'Content-Type': undefined }
    });
  };

  resource.uploadDist = function(file) {
    var fd = new FormData();
    angular.forEach(file, function(val, key) {
		  fd.append('myfileDist', val.file);
	  });
    return $http.post('/uploaddist', fd, {
      transformRequest: angular.identity,
      headers: { 'Content-Type': undefined }
    });
  };

  resource.propertyUpload = function(file) {
	  var fd = new FormData();
	  angular.forEach(file, function(val, key) {
		  fd.append('propertyImage', val.file);
	  });
	  return $http.post('/propertyupload', fd, {
		  transformRequest: angular.identity,
		  headers: { 'Content-Type': undefined }
	  });
  };

  resource.propertyUploadDist = function(file) {
	  var fd = new FormData();
	  angular.forEach(file, function(val, key) {
		  fd.append('propertyImageDist', val.file);
	  });
	  return $http.post('/propertyuploaddist', fd, {
		  transformRequest: angular.identity,
		  headers: { 'Content-Type': undefined }
	  });
  };
  
  return resource;
}]);
