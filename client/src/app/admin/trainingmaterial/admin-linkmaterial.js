angular.module('admin.linkmaterial.detail', ['ngRoute', 'security.authorization', 'services.utility', 'services.adminResource', 'directives.serverError', 'ui.bootstrap']);
angular.module('admin.linkmaterial.detail').config(['$routeProvider', function($routeProvider){
  $routeProvider
    .when('/admin/linkmaterials/:id', {
      templateUrl: 'admin/trainingmaterial/admin-linkmaterial.tpl.html',
      controller: 'linkmaterialDetailCtrl',
      title: 'SiteLink / Details',
      resolve: {
        linkmaterial: ['$q', '$route', '$location', 'securityAuthorization', 'adminResource', function($q, $route, $location, securityAuthorization, adminResource){
          //get app stats only for admin-user, otherwise redirect to /account
          var redirectUrl;
          var promise = securityAuthorization.requireAdminUser()
            .then(function(){
              var id = $route.current.params.id || '';
              if(id){
                return adminResource.findSiteLink(id);
              }else{
                redirectUrl = '/admin/linkmaterials';
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
angular.module('admin.linkmaterial.detail').controller('linkmaterialDetailCtrl', ['$scope', '$route', '$location', 'utility', 'adminResource', 'linkmaterial',
  function($scope, $route, $location, utility, adminResource, linkmaterial) {
    // local vars
    $scope.submitDetailForm = function(){
      $scope.alerts.detail = [];
      adminResource.updateSiteLink(linkmaterial._id, $scope.linkmaterial).then(function(result){
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
    $scope.linkmaterial = {
      siteURL: linkmaterial.siteURL,
      siteName: linkmaterial.siteName,
      siteDescription: linkmaterial.siteDescription
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