angular.module('admin.trainingmaterial.index', ['ngRoute', 'security.authorization', 'services.utility', 'services.adminResource']);
angular.module('admin.trainingmaterial.index').config(['$routeProvider', function($routeProvider){
  $routeProvider
    .when('/admin/trainingmaterial', {
      templateUrl: 'admin/trainingmaterial/admin-trainingmaterial.tpl.html',
      controller: 'trainingCtrl',
      title: 'Training',
      resolve: {
        trainingmaterial: ['$q', '$location', '$log', 'securityAuthorization', 'adminResource', function($q, $location, $log, securityAuthorization, adminResource){
          //get app stats only for admin-user, otherwise redirect to /account
          var redirectUrl;
          var promise = securityAuthorization.requireAdminUser()
            .then(function(){
              //handles url with query(search) parameter
              return adminResource.findVideoURL();
            }, function(reason){
              //rejected either user is un-authorized or un-authenticated
              redirectUrl = reason === 'unauthorized-client'? '/account': '/login';
              return $q.reject();
            })
            .catch(function(){
              redirectUrl = redirectUrl || '/account';
              $location.search({});
              $location.path(redirectUrl);
              return $q.reject();
            });
          return promise;
        }]
      },
      reloadOnSearch: false
    });
}]);
angular.module('admin.trainingmaterial.index').controller('trainingCtrl', ['$scope', '$route', '$location', '$log', 'utility', 'adminResource', 'trainingmaterial',
  function($scope, $route, $location, $log, utility, adminResource, data) {
	// youtube Welcome Video URL passing
	var parseWelcomeVideoURL = function () {
		var welcomeURL = $scope.videoURL.welcomePageURL;
		var regex = new RegExp(/(?:\?v=)([^&]+)(?:\&)*/);
		
		var matches = regex.exec(welcomeURL);
		if(welcomeURL != '') {
  			if(matches == null) {
  				url = welcomeURL;
  				return url;
  			}
  		}
		var welcomeID = matches[1];
		var url = 'https://www.youtube.com/embed/' + welcomeID + '?rel=0&show-info=0';
		
		return url;
	};
	
	// youtube Instruction Video URL parssing
	var instructID = '';
	var parseInstructVideoURL = function() {
		var instructURL = $scope.newVideo.videoURL;
		var regex = new RegExp(/(?:\?v=)([^&]+)(?:\&)*/);
		
		var matches = regex.exec(instructURL);
		
		instructID = matches[1];
		var url = 'https://www.youtube.com/embed/' + instructID + '?rel=0&show-info=0';
		
		return url;
	};

  var advInstructID = '';
  var parseAdvInstructVideoURL = function() {
    var instructURL = $scope.newAdvVideo.videoURL;
    var regex = new RegExp(/(?:\?v=)([^&]+)(?:\&)*/);
    
    var matches = regex.exec(instructURL);
    advInstructID = matches[1];
    var url = 'https://www.youtube.com/embed/' + advInstructID + '?rel=0&show-info=0';
    
    return url;
  };
	// youtube Instruction Video Thumbnail URL parsing
	var getThumbURL = function() {
		var url = 'http://img.youtube.com/vi/' + instructID + '/default.jpg';
		
		return url;
	};

  var getAdvThumbURL = function() {
    var url = 'http://img.youtube.com/vi/' + advInstructID + '/default.jpg';
    
    return url;
  };
	
  $scope.submitVideoForm = function(){
  	$scope.videoURL.welcomePageURL = parseWelcomeVideoURL();
//    	$scope.videoURL.instructionURL = parseInstructVideoURL();
  	adminResource.updateVideo($scope.videoURL).then(function(result){
  		if(result.success){
  		}
    }, function(x) {
      
    });
  };

  $scope.videoURL = {
    welcomePageURL: data.welcomePageURL,
    instructionURL: data.instructionURL,
    description: data.description
  };

  $scope.submit = function(ngFormCtrl){
    switch (ngFormCtrl.$name){
      case 'videoForm':
        submitVideoForm();
        break;
      default:
        return;
    }
  };

  var getInstructionVideos = function() {
    adminResource.findInstructionVideos().then(function(result) {
      $scope.instructionVideos = result;
    });
  };

  var getAdvInstructionVideos = function() {
    adminResource.findAdvInstructionVideos().then(function(result) {
      $scope.advInstructionVideos = result;
    });
  };

  $scope.addVideo = function(){
    $scope.newVideo.videoURL = parseInstructVideoURL();
    $scope.newVideo.thumbnailURL = getThumbURL();
    adminResource.addVideo($scope.newVideo).then(function(data){
      $scope.newVideo = '';
      if(data.success){
        $route.reload();
      }else if (data.errors && data.errors.length > 0){
        alert(data.errors[0]);
      }else {
        alert('unknown error.');
      }
    }, function(e){
      $scope.statusConfigures = '';
      $log.error(e);
    });
  };

  $scope.addAdvVideo = function(){
    $scope.newAdvVideo.videoURL = parseAdvInstructVideoURL();
    $scope.newAdvVideo.thumbnailURL = getAdvThumbURL();
    adminResource.addAdvVideo($scope.newAdvVideo).then(function(data){
      $scope.newAdvVideo = '';
      if(data.success){
        $route.reload();
      }else if (data.errors && data.errors.length > 0){
        alert(data.errors[0]);
      }else {
        alert('unknown error.');
      }
    }, function(e){
      $scope.statusConfigures = '';
      $log.error(e);
    });
  };  
  
  // $scope vars
  //select elements and their associating optio
  $scope.deleteVideo = function(id){
    $scope.deleteAlerts =[];
    if(confirm('Are you sure?')){
      adminResource.deleteVideo(id).then(function(result){
        if(result.success){
          // redirect to admin users index page
          $location.path('/admin/trainingmaterial');
          $route.reload();
        }else{
          //error due to server side validation
          angular.forEach(result.errors, function(err, index){
            $scope.deleteAlerts.push({ type: 'danger', msg: err});
          });
        }
      }, function(x){
        $scope.deleteAlerts.push({ type: 'danger', msg: 'Error deleting user: ' + x });
      });
    }
  };

  $scope.deleteAdvVideo = function(id){
    $scope.deleteAlerts =[];
    if(confirm('Are you sure?')){
      adminResource.deleteAdvVideo(id).then(function(result){
        if(result.success){
          // redirect to admin users index page
          $location.path('/admin/trainingmaterial');
          $route.reload();
        }else{
          //error due to server side validation
          angular.forEach(result.errors, function(err, index){
            $scope.deleteAlerts.push({ type: 'danger', msg: err});
          });
        }
      }, function(x){
        $scope.deleteAlerts.push({ type: 'danger', msg: 'Error deleting user: ' + x });
      });
    }
  };
    getInstructionVideos();
    getAdvInstructionVideos();
  }
]);