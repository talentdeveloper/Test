angular.module('admin.closingdetail', ['ngRoute', 'security.authorization', 'services.utility', 'services.adminResource', 'directives.serverError', 'ui.bootstrap']);
angular.module('admin.closingdetail').config(['$routeProvider', function($routeProvider){
  $routeProvider
    .when('/admin/closing/:id', {
      templateUrl: 'admin/admin-closing-edit.tpl.html',
      controller: 'closingDetailCtrl',
      title: 'Trainingmaterial / Details',
      resolve: {
        closingStatsDetails: ['$q', '$route', '$location', 'securityAuthorization', 'adminResource', function($q, $route, $location, securityAuthorization, adminResource){
          //get app stats only for admin-user, otherwise redirect to /account
          var redirectUrl;
          var promise = securityAuthorization.requireAdminUser()
            .then(function(){
              var id = $route.current.params.id || '';
              console.log(id);
              if(id){
                return adminResource.findClosingStats(id);
              }else{
                redirectUrl = '/admin/closing';
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
angular.module('admin.closingdetail').controller('closingDetailCtrl', ['$scope', '$route', '$location', 'utility', 'adminResource', 'closingStatsDetails',
  function($scope, $route, $location, utility, adminResource, closingStatsDetails) {
    // local vars
   // var statusName = statusConfigDetails.statusName;
   console.log(closingStatsDetails);
    $scope.submitDetailForm = function(){
      $scope.alerts.detail = [];
      adminResource.updateClosingStats(closingStatsDetails._id, $scope.closingStats).then(function(result){
        console.log(result);
         $scope.alerts.detail.push({
            type: 'success',
            msg: 'Closing Stats is updated.'
          });
        if(result.success){

          console.log("trying to alert show");
          $scope.alerts.detail.push({
            type: 'success',
            msg: 'ClosingStats is updated.'
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
    $scope.closingStats = {

      usernameforclosing: closingStatsDetails.usernameforclosing,
      explanation: closingStatsDetails.explanation

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