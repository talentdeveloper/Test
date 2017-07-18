angular.module('admin.trainingmaterial.detail', ['ngRoute', 'security.authorization', 'services.utility', 'services.adminResource', 'directives.serverError', 'ui.bootstrap']);
angular.module('admin.trainingmaterial.detail').config(['$routeProvider', function($routeProvider){
  $routeProvider
    .when('/admin/trainingmaterial/:id', {
      templateUrl: 'admin/trainingmaterial/admin-trainingmaterial-edit.tpl.html',
      controller: 'trainingmaterialDetailCtrl',
      title: 'Trainingmaterial / Details',
      resolve: {
        trainingmaterialDetails: ['$q', '$route', '$location', 'securityAuthorization', 'adminResource', function($q, $route, $location, securityAuthorization, adminResource){
          //get app stats only for admin-user, otherwise redirect to /account
          var redirectUrl;
          var promise = securityAuthorization.requireAdminUser()
            .then(function(){
              var id = $route.current.params.id || '';
              if(id){
                return adminResource.findInstructionVideo(id);
              }else{
                redirectUrl = '/admin/trainingmaterial';
                return $q.reject();
              }
            }, function(reason){
              //rejected either user is un-authorized or un-authenticated
              redirectUrl = reason === 'unauthorized-client'? '/account': '/login';
              return $q.reject();
            })
            .catch(function(){
              redirectUrl = redirectUrl || '/account';
              $location.path(redirectUrl);
              return $q.reject();
            });

          return promise;
        }]
      }
    });
}]);
angular.module('admin.trainingmaterial.detail').controller('trainingmaterialDetailCtrl', ['$scope', '$route', '$location', 'utility', 'adminResource', 'trainingmaterialDetails',
  function($scope, $route, $location, utility, adminResource, trainingmaterialDetails) {
    // local vars
	// youtube Instruction Video URL parssing
	
  	var instructID = '';
  	var parseInstructVideoURL = function() {
  		var url = '';
  		var instructURL = $scope.instructionVideoDetail.videoURL;
  		var regex = new RegExp(/(?:\?v=)([^&]+)(?:\&)*/);
  		
  		var matches = regex.exec(instructURL);
  		if(instructURL != '') {
  			if(matches == null) {
  				url = instructURL;
  				var tempID = instructURL.split('?')[0];
  				instructID = tempID.split('https://www.youtube.com/embed/')[1];
  				return url;
  			}
  		}
  		instructID = matches[1];
  		url = 'https://www.youtube.com/embed/' + instructID + '?rel=0&show-info=0';
  		
  		return url;
  	};
  	// youtube Instruction Video Thumbnail URL parsing
  	var getThumbURL = function() {
  		var url = 'http://img.youtube.com/vi/' + instructID + '/default.jpg';
  		return url;
  	};
	
    $scope.submitDetailForm = function(){
      $scope.alerts.detail = [];
      $scope.instructionVideoDetail.videoURL = parseInstructVideoURL();
      $scope.instructionVideoDetail.thumbnailURL = getThumbURL();
      adminResource.updateInstructionVideo(trainingmaterialDetails._id, $scope.instructionVideoDetail).then(function(result){
         $scope.alerts.detail.push({
            type: 'success',
            msg: 'Current Video URL is updated.'
          });
        if(result.success){
          $scope.alerts.detail.push({
            type: 'success',
            msg: 'Current Video URL is updated.'
          });
        }else{
          angular.forEach(result.errors, function(err, index){
            $scope.alerts.detail.push({
              type: 'danger',
              msg: err
            });
          });
        }
      }, function(x){
        $scope.alerts.detail.push({
          type: 'danger',
          msg: 'Error updating account details: ' + x
        });
      });
    };
    //model def
    $scope.errfor = {}; //for identity server-side validation
    $scope.alerts = {
      detail: [], identity: [], pass: []
    };
    $scope.instructionVideoDetail = {
      videoURL: trainingmaterialDetails.videoURL,
      videoTitle: trainingmaterialDetails.videoTitle,
      videoDescription: trainingmaterialDetails.videoDescription

    };
    $scope.pass = {};
    //initial behavior
    var search = $location.search();
    // method def
    $scope.hasError = utility.hasError;
    $scope.showError = utility.showError;
    $scope.canSave = utility.canSave;
    $scope.closeAlert = function(key, ind){
      $scope.alerts[key].splice(ind, 1);
    };
  }
]);