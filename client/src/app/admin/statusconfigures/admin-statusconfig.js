angular.module('admin.statusconfigures.detail', ['ngRoute', 'security.authorization', 'services.utility', 'services.adminResource', 'directives.serverError', 'ui.bootstrap']);
angular.module('admin.statusconfigures.detail').config(['$routeProvider', function($routeProvider){
  $routeProvider
    .when('/admin/statusconfigures/:id', {
      templateUrl: 'admin/statusconfigures/admin-statusconfig.tpl.html',
      controller: 'statusconfiguresDetailCtrl',
      title: 'StatusConfigures / Details',
      resolve: {
        statusConfigDetails: ['$q', '$route', '$location', 'securityAuthorization', 'adminResource', function($q, $route, $location, securityAuthorization, adminResource){
          //get app stats only for admin-user, otherwise redirect to /account
          var redirectUrl;
          var promise = securityAuthorization.requireAdminUser()
            .then(function(){
              var id = $route.current.params.id || '';
              console.log(id);
              if(id){
                return adminResource.findStatusConfigure(id);
              }else{
                redirectUrl = '/admin/statusconfigures';
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
angular.module('admin.statusconfigures.detail').controller('statusconfiguresDetailCtrl', ['$scope', '$route', '$location', 'utility', 'adminResource', 'statusConfigDetails',
  function($scope, $route, $location, utility, adminResource, statusConfigDetails) {
    // local vars
    //var property = propertyDetails.property;
    var statusName = statusConfigDetails.statusName;
    console.log(statusName);
    $scope.submitDetailForm = function(){
      $scope.alerts.detail = [];
      adminResource.updateStatusConfig(statusConfigDetails._id, $scope.statusDetail).then(function(result){
        console.log(result);
         $scope.alerts.detail.push({
            type: 'success',
            msg: 'Status is updated.'
          });
        if(result.success){

          console.log("trying to alert show");
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
    $scope.statusDetail = {

      statusName: statusConfigDetails.statusName,
      statusDetail: statusConfigDetails.statusDetail

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

    $scope.deleteStatus = function(){
      $scope.deleteAlerts =[];
      if(confirm('Are you sure?')){
        adminResource.deleteStatusConfig(statusConfigDetails._id).then(function(result){
          if(result.success){
            // redirect to admin users index page
            $location.path('/admin/statusconfigures');
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