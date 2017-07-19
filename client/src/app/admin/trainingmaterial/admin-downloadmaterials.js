angular.module('admin.downloadmaterial.index', ['ngRoute', 'security.authorization', 'services.utility', 'services.adminResource']);
angular.module('admin.downloadmaterial.index').config(['$routeProvider', function($routeProvider){
  $routeProvider
    .when('/admin/downloadmaterial', {
      templateUrl: 'admin/trainingmaterial/admin-downloadmaterials.tpl.html',
      controller: 'downloadCtrl',
      title: 'Links',
      resolve: {
        downloadmaterial: ['$q', '$location', '$log', 'securityAuthorization', 'adminResource', function($q, $location, $log, securityAuthorization, adminResource){
          //get app stats only for admin-user, otherwise redirect to /account
          var redirectUrl;
          var promise = securityAuthorization.requireAdminUser()
            .then(function(){
              //handles url with query(search) parameter
              return adminResource.findDownloadMaterials();
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
angular.module('admin.downloadmaterial.index').controller('downloadCtrl', ['$scope', '$route', '$location', '$log', 'utility', 'adminResource', 'downloadmaterial',
  function($scope, $route, $location, $log, utility, adminResource, data){
    // local var
    
 
    $scope.addDownloadMaterial = function(){
      adminResource.addDownloadMaterial($scope.newDownload).then(function(data){
        $scope.newDownload = '';
        if(data.success){
          $route.reload();
        }else if (data.errors && data.errors.length > 0){
          alert(data.errors[0]);
        }else {
          alert('unknown error.');
        }
      }, function(e){
        $scope.newDownload = '';
        $log.error(e);
      });
    };

    $scope.downloadMaterials = data;
    // $scope vars
    //select elements and their associating optio
    $scope.deleteDownloadMaterial = function(id){
      $scope.deleteAlerts =[];
      if(confirm('Are you sure?')){
        adminResource.deleteDownloadMaterial(id).then(function(result){
          if(result.success){
            // redirect to admin users index page
            $location.path('/admin/downloadmaterial');
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


  }
]);