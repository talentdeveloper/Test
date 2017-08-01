angular.module('account.properties.list', ['config', 'security.service', 'security.authorization', 'services.accountResource', 'services.utility','ui.bootstrap', 'directives.serverError']);
angular.module('account.properties.list').config(['$routeProvider', 'securityAuthorizationProvider', function($routeProvider){
  $routeProvider
    .when('/account/propertylist', {
      templateUrl: 'account/properties/account-properties.tpl.html',
      controller: 'AccountPropertyListCtrl',
      title: 'Account Property List',
      resolve: {
        propertyList: ['$q', '$location', 'securityAuthorization', 'accountResource' ,function($q, $location, securityAuthorization, accountResource){
          //get account details only for verified-user, otherwise redirect to /account/verification
          var redirectUrl;
          var promise = securityAuthorization.requireVerifiedUser()
            .then(accountResource.getAccountProperties, function(reason){
              //rejected either user is unverified or un-authenticated
              redirectUrl = reason === 'unverified-client'? '/account/verification': '/login';
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


angular.module('account.properties.list').controller('AccountPropertyListCtrl', [ '$scope', '$route', '$location', '$log', 'security', 'utility', 'accountResource', 'propertyList',
  function($scope, $route, $location, $log, security, utility, restResource, data){
    var user = data.user;
    restResource.findPropertyList(user._id).then(function(list){
      $scope.properties = list;
    });
    $scope.deleteProperty = function(id) {
      $scope.deleteAlerts =[];
      if(confirm('Are you sure?')){
        restResource.deleteProperty(id).then(function(result) {
        
          if(result.success){
            // redirect to admin users index page
            $location.path('/account/propertylist');
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
    restResource.getAccountDetails().then(function(result){
      if (result.user.isCompletedProfile == 'no'){
            // $location.path('/account/settings');
      }
    });
  }
]);
