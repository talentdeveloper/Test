angular.module('admin.closing', ['ngRoute', 'security.authorization', 'services.adminResource']);
angular.module('admin.closing').config(['$routeProvider', function($routeProvider){
  $routeProvider
    .when('/admin/closing', {
      templateUrl: 'admin/admin-closing.tpl.html',
      controller: 'ClosingCtrl',
      title: 'Closing Stats Area',
      resolve: {
        closingStats: ['$q', '$location', 'securityAuthorization', 'adminResource', function($q, $location, securityAuthorization, adminResource){
          // get app stats only for admin-user, otherwise redirect to /account
          var redirectUrl;
          var promise = securityAuthorization.requireAdminUser()
            .then(adminResource.getClosingStats, function(reason){
              // rejected either user is un-authorized or un-authenticated
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
      },
      reloadOnSearch: false
    });
}]);
angular.module('admin.closing').controller('ClosingCtrl', ['$scope', '$route', '$location', '$log', 'closingStats', 'adminResource',
  function($scope, $route, $location, $log, closingStats, adminResource){
    $scope.closingStats = closingStats;

    var getTitle = function(){
      adminResource.getClosingStatsTitle().then(function(result) {
        $scope.closingStatsTitle = result;
      });
    };

    $scope.updateTitle = function() {
      adminResource.updateClosingStatsTitle($scope.closingStatsTitle).then(function(data){
        alert('Closing Stats Title Updated.');

        if(data.success){

        }else if (data.errors && data.errors.length > 0){
          alert(data.errors[0]);
        }else {
          // alert('unknown error.');
        }
      }, function(e){
       
        $log.error(e);
      });
    };
    $scope.addNewClosingStats = function(){
    
      adminResource.addNewClosingStats($scope.newClosingStatsUsername).then(function(data){
        $scope.newClosingStatsUsername = '';
        if(data.success){
          $route.reload();
        }else if (data.errors && data.errors.length > 0){
          alert(data.errors[0]);
        }else {
          alert('unknown error.');
        }
      }, function(e){
        $scope.newClosingStatsUsername = '';
        $log.error(e);
      });
    };
    $scope.deleteClosingStats = function(id){
      $scope.deleteAlerts =[];
      if(confirm('Are you sure?')){
        adminResource.deleteClosingStats(id).then(function(result){
          if(result.success){
            // redirect to admin users index page
            $location.path('/admin/closing');
            $route.reload();
          }else{
            // error due to server side validation
            angular.forEach(result.errors, function(err, index){
              $scope.deleteAlerts.push({ type: 'danger', msg: err});
            });
          }
        }, function(x){
          $scope.deleteAlerts.push({ type: 'danger', msg: 'Error deleting closing stats: ' + x });
        });
      }
    };
    getTitle();
  }]);