angular.module('account.properties.propertystatuses', ['ngRoute', 'security.authorization']);
angular.module('account.properties.propertystatuses').config(['$routeProvider', 'securityAuthorizationProvider', function($routeProvider, securityAuthorizationProvider){
  $routeProvider
    .when('/account/propertystatuses', {
      templateUrl: 'account/properties/account-propertystatuses.tpl.html',
      controller: 'PropertyStatusCtrl',
      title: 'PropertyStatus Area',
      resolve: {
        authenticatedUser: securityAuthorizationProvider.requireAuthenticatedUser,
        propertyStatusesResult: ['$q', '$location', 'securityAuthorization', 'accountResource' ,function($q, $location, securityAuthorization, accountResource){
          //get account details only for verified-user, otherwise redirect to /account/verification
          var redirectUrl;
          var promise = securityAuthorization.requireVerifiedUser()
            .then(accountResource.getPropertyStatuses, function(reason){
              //rejected either user is unverified or un-authenticated
              redirectUrl = reason === 'unverified-client'? '/account/verification': '/login';
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
      }
    });
}]);
angular.module('account.properties.propertystatuses').controller('PropertyStatusCtrl', [ '$scope', 'propertyStatusesResult',
  function($scope, data){
    $scope.statusesResults = data;
  }]);
