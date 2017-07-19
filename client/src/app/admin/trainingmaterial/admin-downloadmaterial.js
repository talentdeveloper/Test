angular.module('admin.downloadmaterial.detail', ['ngRoute', 'security.authorization', 'services.utility', 'services.adminResource', 'directives.serverError', 'ui.bootstrap']);
angular.module('admin.downloadmaterial.detail').config(['$routeProvider', function($routeProvider){
  $routeProvider
    .when('/admin/downloadmaterials/:id', {
      templateUrl: 'admin/trainingmaterial/admin-downloadmaterial.tpl.html',
      controller: 'downloadMaterialDetailCtrl',
      title: 'SiteLink / Details',
      resolve: {
        downloadmaterials: ['$q', '$route', '$location', 'securityAuthorization', 'adminResource', function($q, $route, $location, securityAuthorization, adminResource){
          //get app stats only for admin-user, otherwise redirect to /account
          var redirectUrl;
          var promise = securityAuthorization.requireAdminUser()
            .then(function(){
              var id = $route.current.params.id || '';
              if(id){
                return adminResource.findDownloadMaterial(id);
              }else{
                redirectUrl = '/admin/downloadmaterials';
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
angular.module('admin.downloadmaterial.detail').controller('downloadMaterialDetailCtrl', ['$scope', '$route', '$location', 'utility', 'adminResource', 'downloadMaterial',
  function($scope, $route, $location, utility, adminResource, downloadMaterial) {
    // local vars
    //var property = propertyDetails.property;

    $scope.submitDetailForm = function(){
      $scope.alerts.detail = [];
      adminResource.updateDownloadMaterial(downloadMaterial._id, $scope.downloadMaterial).then(function(result){
         $scope.alerts.detail.push({
            type: 'success',
            msg: 'Status is updated.'
          });
        if(result.success){
          $scope.alerts.detail.push({
            type: 'success',
            msg: 'Status is updated.'
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
    $scope.downloadMaterial = {
      fileURL: downloadMaterial.fileURL,
      fileName: downloadMaterial.fileName,
      
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