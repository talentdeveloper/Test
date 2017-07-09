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
  }
]);