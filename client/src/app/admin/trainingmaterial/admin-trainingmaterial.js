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
          console.log('passted');
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
          console.log(promise);
          return promise;
        }]
      },
      reloadOnSearch: false
    });
}]);
angular.module('admin.trainingmaterial.index').controller('trainingCtrl', ['$scope', '$route', '$location', '$log', 'utility', 'adminResource', 'trainingmaterial',
  function($scope, $route, $location, $log, utility, adminResource, data){
    // local var
    
    console.log(data);
    $scope.submitVideoForm = function(){
     
      console.log('update');
      adminResource.updateVideo($scope.videoURL).then(function(result){
        if(result.success){
          console.log('success');
           
        }else{
         
          
        }
      }, function(x){
        
      });
    };

    $scope.videoURL = {
      welcomePageURL: data.welcomePageURL,
      instructionURL: data.instructionURL,
      description: data.description
    };

    $scope.submit = function(ngFormCtrl){
      console.log("update submit");
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
        console.log(result);
      });
    };

    $scope.addVideo = function(){
      adminResource.addVideo($scope.newVideo).then(function(data){
        console.log("trying to add videos");  
        console.log($scope.newVideo);
        $scope.newVideo = '';
        if(data.success){
          console.log('complete add clked');
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
      console.log(id);
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

    getInstructionVideos();
  }
]);