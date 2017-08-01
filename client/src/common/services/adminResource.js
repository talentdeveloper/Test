angular.module('services.adminResource', []).factory('adminResource', ['$http', '$q', function ($http, $q) {
  // local variable
  var baseUrl = '/api';
  var userUrl = baseUrl + '/admin/users';
  var accountUrl = baseUrl + '/admin/accounts';
  var administratorUrl = baseUrl + '/admin/administrators';
  var adminGroupUrl = baseUrl + '/admin/admin-groups';
  var adminStatusesUrl = baseUrl + '/admin/statuses';
  var adminCategoriesUrl = baseUrl + '/admin/categories';
  var adminPropertiesUrl = baseUrl + '/admin/properties';
  var adminTrainingURL = baseUrl + '/admin/trainingmaterial';
  var adminStatusConfiguresURL = baseUrl + '/admin/statusconfigures';
  var adminInstructionVideosURL = baseUrl + '/admin/instructionvideos';
  var adminAdvInstructionVideosURL = baseUrl + '/admin/advinstructionvideos';
  var adminClosingStatsURL = baseUrl + '/admin/closing';
  var adminAnnouncement = baseUrl + '/admin/announcement';



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
  resource.getStats = function(){
    return $http.get(baseUrl + '/admin').then(processResponse, processError);
  };
  resource.search = function(query){
    return $http.get(baseUrl + '/admin/search', { params: { q: query }} ).then(processResponse, processError);
  };

  // ----- users api -----
  resource.findUsers = function(filters){
    if(angular.equals({}, filters)){
      filters = undefined;
    }
    return $http.get(userUrl, { params: filters }).then(processResponse, processError);
  };
  resource.addUser = function(username){
    return $http.post(userUrl, { username: username }).then(processResponse, processResponse);
  };
  resource.findUser = function(_id){
    var url = userUrl + '/' + _id;
    return $http.get(url).then(processResponse, processError);
  };
  resource.updateUser = function(_id, data){
    var url = userUrl + '/' + _id;
    return $http.put(url, data).then(processResponse, processError);
  };
  resource.setPassword = function(_id, data){
    var url = userUrl + '/' + _id + '/password';
    return $http.put(url, data).then(processResponse, processError);
  };
  resource.linkAdmin = function(_id, data){
    var url = userUrl + '/' + _id + '/role-admin';
    return $http.put(url, data).then(processResponse, processError);
  };
  resource.unlinkAdmin = function(_id){
    var url = userUrl + '/' + _id + '/role-admin';
    return $http.delete(url).then(processResponse, processError);
  };
  resource.linkAccount = function(_id, data){
    var url = userUrl + '/' + _id + '/role-account';
    return $http.put(url, data).then(processResponse, processError);
  };
  resource.unlinkAccount = function(_id){
    var url = userUrl + '/' + _id + '/role-account';
    return $http.delete(url).then(processResponse, processError);
  };
  resource.deleteUser = function(_id){
    var url = userUrl + '/' + _id;
    return $http.delete(url).then(processResponse, processError);
  };
  resource.getAccountPropertyStats = function(_id){
    var url = userUrl + '/stat/' + _id;
    return $http.get(url).then(processResponse, processError);
  }
  resource.strikeUser = function(_id){
    var url = userUrl + '/strike/' + _id;
    return $http.put(url).then(processResponse, processError);
  }

  // ----- accounts api -----
  resource.findAccounts = function(filters){
    if(angular.equals({}, filters)){
      filters = undefined;
    }
    return $http.get(accountUrl, { params: filters }).then(processResponse, processError);
  };
  resource.addAccount = function(fullname){
    return $http.post(accountUrl, { 'name.full': fullname }).then(processResponse, processResponse);
  };
  resource.findAccount = function(_id){
    var url = accountUrl + '/' + _id;
    return $http.get(url).then(processResponse, processError);
  };
  resource.updateAccount = function(_id, data){
    var url = accountUrl + '/' + _id;
    return $http.put(url, data).then(processResponse, processError);
  };
  resource.linkUser = function(_id, data){
    var url = accountUrl + '/' + _id + '/user';
    return $http.put(url, data).then(processResponse, processError);
  };
  resource.unlinkUser = function(_id){
    var url = accountUrl + '/' + _id + '/user';
    return $http.delete(url).then(processResponse, processError);
  };
  resource.newAccountNote = function(_id, data){
    var url = accountUrl + '/' + _id + '/notes';
    return $http.post(url, data).then(processResponse, processError);
  };
  resource.newAccountStatus = function(_id, data){
    var url = accountUrl + '/' + _id + '/status';
    return $http.post(url, data).then(processResponse, processError);
  };
  resource.deleteAccount = function(_id){
    var url = accountUrl + '/' + _id;
    return $http.delete(url).then(processResponse, processError);
  };

  // ----- administrators api -----
  resource.findAdministrators = function(filters){
    if(angular.equals({}, filters)){
      filters = undefined;
    }
    return $http.get(administratorUrl, { params: filters }).then(processResponse, processError);
  };
  resource.addAdministrator = function(fullname){
    return $http.post(administratorUrl, { 'name.full': fullname }).then(processResponse, processResponse);
  };
  resource.findAdministrator = function(_id){
    var url = administratorUrl + '/' + _id;
    return $http.get(url).then(processResponse, processError);
  };
  resource.updateAdministrator = function(_id, data){
    var url = administratorUrl + '/' + _id;
    return $http.put(url, data).then(processResponse, processError);
  };
  resource.adminLinkUser = function(_id, data){
    var url = administratorUrl + '/' + _id + '/user';
    return $http.put(url, data).then(processResponse, processError);
  };
  resource.adminUnlinkUser = function(_id){
    var url = administratorUrl + '/' + _id + '/user';
    return $http.delete(url).then(processResponse, processError);
  };
  resource.saveAdminGroups = function(_id, data){
    var url = administratorUrl + '/' + _id + '/groups';
    return $http.put(url, data).then(processResponse, processError);
  };
  resource.saveAdminPermissions = function(_id, data){
    var url = administratorUrl + '/' + _id + '/permissions';
    return $http.put(url, data).then(processResponse, processError);
  };
  resource.deleteAdministrator = function(_id){
    var url = administratorUrl + '/' + _id;
    return $http.delete(url).then(processResponse, processError);
  };
  resource.updateVideo = function(data){
    return $http.put(adminTrainingURL, data).then(processResponse, processError);
  };
  resource.findVideoURL = function() {
    return $http.get(adminTrainingURL).then(processResponse, processError);
  };
  resource.findInstructionVideos = function() {
    return $http.get(adminInstructionVideosURL).then(processResponse, processError);
  };
  resource.findAdvInstructionVideos = function() {
    return $http.get(adminAdvInstructionVideosURL).then(processResponse, processError);
  };
  resource.addVideo = function(data) {
    return $http.post(adminInstructionVideosURL, data).then(processResponse, processError);
  };
  resource.addAdvVideo = function(data) {
    return $http.post(adminAdvInstructionVideosURL, data).then(processResponse, processError);
  };
  resource.deleteVideo = function(_id) {
    return $http.delete(adminInstructionVideosURL + '/' + _id).then(processResponse, processError);
  };
  resource.deleteAdvVideo = function(_id) {
    return $http.delete(adminAdvInstructionVideosURL + '/' + _id).then(processResponse, processError);
  };
  resource.findInstructionVideo = function(_id) {
    return $http.get(adminInstructionVideosURL + '/' + _id).then(processResponse, processError);
  };
  resource.findAdvInstructionVideo = function(_id) {
    return $http.get(adminAdvInstructionVideosURL + '/' + _id).then(processResponse, processError);
  };
  resource.updateInstructionVideo = function(_id, data) {
    return $http.put(adminInstructionVideosURL + '/' + _id, data).then(processResponse, processError);
  };
  resource.updateAdvInstructionVideo = function(_id, data) {
    return $http.put(adminAdvInstructionVideosURL + '/' + _id, data).then(processResponse, processError);
  };
  resource.getClosingStats = function() {
	  return $http.get(adminClosingStatsURL).then(processResponse, processError);
  };
  resource.getClosingStatsTitle = function() {
    return $http.get(adminClosingStatsURL + 'title').then(processResponse, processError);
  };
  resource.updateClosingStatsTitle = function(data) {
    return $http.put(adminClosingStatsURL + 'title', data).then(processResponse, processError);
  };
  resource.updateClosingStatsTitleShow = function(data) {
    return $http.put(adminClosingStatsURL + 'titleshow', data).then(processResponse, processError);
  };
  resource.findClosingStats = function(_id) {
    return $http.get(adminClosingStatsURL + '/' + _id).then(processResponse, processError);
  };
  resource.addNewClosingStats = function(data) {
    return $http.put(adminClosingStatsURL, data).then(processResponse, processError);
  };
  resource.deleteClosingStats = function(_id) {
    return $http.delete(adminClosingStatsURL + '/' + _id).then(processResponse, processError);
  };
  resource.updateClosingStats = function(_id, data) {
    return $http.put(adminClosingStatsURL + '/' + _id, data).then(processResponse, processError);
  };
  resource.findStatusConfigures = function() {

    return $http.get(adminStatusConfiguresURL).then(processResponse, processError);
  };
  resource.addStatusConfig = function(data) {
    return $http.post(adminStatusConfiguresURL, {statusName: data.name, statusDetail: data.detail}).then(processResponse, processError);
  };
  resource.findStatusConfigure = function(_id) {
    var url = adminStatusConfiguresURL + '/' + _id;
    return $http.get(url).then(processResponse, processError);
  };
  resource.updateStatusConfig = function(_id, data) {
    var url = adminStatusConfiguresURL + '/' + _id;
    return $http.put(url, data).then(processResponse, processError);
  };
  resource.deleteStatusConfig = function(_id) {
    var url = adminStatusConfiguresURL + '/' + _id;
    return $http.delete(url).then(processResponse, processError);
  };

  resource.recentlyAddedProperties = function() {
    var url = '/api/admin/recentlyadded';
    return $http.get(url).then(processResponse, processError);
  };

  resource.findLinkMaterials = function() {
    var url = '/api/admin/linkmaterials';
    return $http.get(url).then(processResponse, processError)
  };
  resource.addSiteLink = function(data) {
    var url = '/api/admin/linkmaterials';
    return $http.post(url, data).then(processResponse, processError)
  };
  resource.deleteSiteLink = function(_id) {
    var url = '/api/admin/linkmaterials';
    return $http.delete(url + '/' + _id).then(processResponse, processError)
  };
  resource.updateSiteLink = function(_id, data) {
    var url = '/api/admin/linkmaterials';
    return $http.put(url + '/' + _id, data).then(processResponse, processError)
  };
  resource.findSiteLink = function(_id) {
    var url = '/api/admin/linkmaterials';
    return $http.get(url + '/' + _id).then(processResponse, processError)
  };

  resource.findDownloadMaterials = function(data) {
    var url = '/api/admin/downloadMaterials';
    return $http.get(url).then(processResponse, processError)
  };
  resource.addDownloadMaterial = function(data) {
    var url = '/api/admin/downloadMaterials';
    return $http.post(url, data).then(processResponse, processError)
  };
  resource.findDownloadMaterial = function(_id) {
    var url = '/api/admin/downloadMaterials';
    return $http.get(url + '/' + _id).then(processResponse, processError)
  };
  resource.deleteDownloadMaterial = function(_id) {
    var url = '/api/admin/downloadMaterials';
    return $http.delete(url + '/' + _id).then(processResponse, processError)
  };
  resource.updateDownloadMaterial = function(_id, data) {
    var url = '/api/admin/downloadMaterials';
    return $http.put(url + '/' + _id, data).then(processResponse, processError)
  };
  resource.getAnnouncement = function() {
    return $http.get(adminAnnouncement).then(processResponse, processError)
  };
  resource.updateAnnouncement = function(data) {
    return $http.put(adminAnnouncement, data).then(processResponse, processError)
  };
  // ----- admin-groups api -----
  resource.findAdminGroups = function(filters){
    if(angular.equals({}, filters)){
      filters = undefined;
    }
    return $http.get(adminGroupUrl, { params: filters }).then(processResponse, processError);
  };
  resource.addAdminGroup = function(name){
    return $http.post(adminGroupUrl, { name: name }).then(processResponse, processResponse);
  };
  resource.findAdminGroup = function(_id){
    var url = adminGroupUrl + '/' + _id;
    return $http.get(url).then(processResponse, processError);
  };
  resource.updateAdminGroup = function(_id, data){
    var url = adminGroupUrl + '/' + _id;
    return $http.put(url, data).then(processResponse, processError);
  };
  resource.saveAdminGroupPermissions = function(_id, data){
    var url = adminGroupUrl + '/' + _id + '/permissions';
    return $http.put(url, data).then(processResponse, processError);
  };
  resource.deleteAdminGroup = function(_id){
    var url = adminGroupUrl + '/' + _id;
    return $http.delete(url).then(processResponse, processError);
  };

  // ----- statuses api -----
  resource.findStatuses = function(filters){
    if(angular.equals({}, filters)){
      filters = undefined;
    }
    return $http.get(adminStatusesUrl, { params: filters }).then(processResponse, processError);
  };
  resource.addStatus = function(data){
    return $http.post(adminStatusesUrl, data).then(processResponse, processResponse);
  };
  resource.findStatus = function(_id){
    var url = adminStatusesUrl + '/' + _id;
    return $http.get(url).then(processResponse, processError);
  };
  resource.updateStatus = function(_id, data){
    var url = adminStatusesUrl + '/' + _id;
    return $http.put(url, data).then(processResponse, processError);
  };
  resource.deleteStatus = function(_id){
    var url = adminStatusesUrl + '/' + _id;
    return $http.delete(url).then(processResponse, processError);
  };

  // ----- categories api -----
  resource.findCategories = function(filters){
    if(angular.equals({}, filters)){
      filters = undefined;
    }
    return $http.get(adminCategoriesUrl, { params: filters }).then(processResponse, processError);
  };
  resource.addCategory = function(data){
    return $http.post(adminCategoriesUrl, data).then(processResponse, processResponse);
  };
  resource.findCategory = function(_id){
    var url = adminCategoriesUrl + '/' + _id;
    return $http.get(url).then(processResponse, processError);
  };
  resource.updateCategory = function(_id, data){
    var url = adminCategoriesUrl + '/' + _id;
    return $http.put(url, data).then(processResponse, processError);
  };
  resource.deleteCategory = function(_id){
    var url = adminCategoriesUrl + '/' + _id;
    return $http.delete(url).then(processResponse, processError);
  };

  // ------------- properties api --------------
  resource.findProperties = function(filters){
    if(angular.equals({}, filters)){
      filters = undefined;
    }
    return $http.get(adminPropertiesUrl, { params: filters }).then(processResponse, processError);
  };
  resource.addProperty = function(data){
    return $http.post(adminPropertiesUrl, data).then(processResponse, processResponse);
  };
  resource.findProperty = function(_id){
    var url = adminPropertiesUrl + '/' + _id;
    return $http.get(url).then(processResponse, processError);
  };
  resource.updateProperty = function(_id, data){
    var url = adminPropertiesUrl + '/' + _id;
    return $http.put(url, data).then(processResponse, processError);
  };
  resource.deleteProperty = function(_id){
    var url = adminPropertiesUrl + '/' + _id;
    return $http.delete(url).then(processResponse, processError);
  };

  resource.getSubmittedProperties = function(_id) {
    var url = userUrl + '/' + _id + '/submitted';
    return $http.get(url).then(processResponse, processError);
  };
  
  resource.upload = function(file) {
    var fd = new FormData();
    fd.append('myfile', file.upload);
    return $http.post('/upload', fd, {
      transformRequest: angular.identity,
      headers: { 'Content-Type': undefined }
    });
  };

  resource.uploadDist = function(file) {
    var fd = new FormData();
    fd.append('myfileDist', file.upload);
    return $http.post('/uploadDist', fd, {
      transformRequest: angular.identity,
      headers: { 'Content-Type': undefined }
    });
  };

  resource.propertyUpload = function(file) {
    var fd = new FormData();
    fd.append('propertyImage', file.upload);
    return $http.post('/propertyupload', fd, {
      transformRequest: angular.identity,
      headers: { 'Content-Type': undefined }
    });
  };

  resource.propertyUploadDist = function(file) {
    var fd = new FormData();
    fd.append('propertyImageDist', file.upload);
    return $http.post('/propertyuploadist', fd, {
      transformRequest: angular.identity,
      headers: { 'Content-Type': undefined }
    });
  };

  resource.remarkSystem = function(){
    return $http.get('/api/remark').then(processResponse, processError);
  };

  resource.uploadFile = function(file) {
    var fd = new FormData();
    angular.forEach(file, function(val, key) {
      fd.append('uploadFile', val.file);
    });
    return $http.post('/uploadfile', fd, {
      transformRequest: angular.identity,
      headers: { 'Content-Type': undefined }
    });
  };

  resource.uploadFileDist = function(file) {
    var fd = new FormData();
    angular.forEach(file, function(val, key) {
      fd.append('uploadFileDist', val.file);
    });
    return $http.post('/uploadfiledist', fd, {
      transformRequest: angular.identity,
      headers: { 'Content-Type': undefined }
    });
  };

	  
  return resource;
}]);
