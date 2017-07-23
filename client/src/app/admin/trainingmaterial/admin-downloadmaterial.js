angular.module('admin.downloadmaterial.detail', ['ngRoute', 'security.authorization', 'services.utility', 'services.adminResource', 'directives.serverError', 'ui.bootstrap']);
angular.module('admin.downloadmaterial.detail').config(['$routeProvider', function($routeProvider){
  $routeProvider
    .when('/admin/downloadmaterial/:id', {
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
angular.module('admin.downloadmaterial.detail').controller('downloadMaterialDetailCtrl', ['$scope', '$route', '$location', 'utility', 'adminResource', 'downloadmaterials',
  function($scope, $route, $location, utility, adminResource, downloadmaterials) {
    // local vars
    //var property = propertyDetails.property;
    console.log(downloadmaterials);
    $scope.submitDetailForm = function(){
      $scope.alerts.detail = [];
      console.log($scope.downloadMaterial);
      adminResource.updateDownloadMaterial(downloadmaterials._id, $scope.downloadMaterial).then(function(result){
         // $scope.alerts.detail.push({
         //    type: 'success',
         //    msg: 'File description is updated.'
         //  });
        if(result.success){
          $scope.alerts.detail.push({
            type: 'success',
            msg: 'File description is updated.'
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
    $scope.downloadMaterial = {
      fileDescription: downloadmaterials.fileDescription
    };
    //model def
    $scope.errfor = {}; //for identity server-side validation
    $scope.alerts = {
      detail: [], identity: [], pass: []
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