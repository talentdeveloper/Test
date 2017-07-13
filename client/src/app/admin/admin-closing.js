angular.module('admin.closing', ['ngRoute', 'security.authorization', 'services.adminResource']);
angular.module('admin.closing').config(['$routeProvider', function($routeProvider){
  $routeProvider
    .when('/admin/closing', {
      templateUrl: 'admin/admin-closing.tpl.html',
      controller: 'ClosingCtrl',
      title: 'Closing Stats Area',
      resolve: {
        closingStats: ['$q', '$location', 'securityAuthorization', 'adminResource', function($q, $location, securityAuthorization, adminResource){
          //get app stats only for admin-user, otherwise redirect to /account
          var redirectUrl;
          var promise = securityAuthorization.requireAdminUser()
            .then(adminResource.getClosingStats, function(reason){
              //rejected either user is un-authorized or un-authenticated
              redirectUrl = reason === 'unauthorized-client'? '/account': '/login';
              return $q.reject();
            })
            .catch(function(){
              redirectUrl = redirectUrl || '/account';
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
angular.module('admin.closing').controller('ClosingCtrl', ['$scope', '$log', 'closingStats',
  function($scope, $log, closingStats){
    
  }]);