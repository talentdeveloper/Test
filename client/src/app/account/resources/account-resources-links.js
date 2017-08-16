angular.module('account.resources.links', ['ngRoute', 'security.authorization']);
angular.module('account.resources.links').config(['$routeProvider', 'securityAuthorizationProvider', function($routeProvider, securityAuthorizationProvider){
  $routeProvider
    .when('/resources/links', {
      templateUrl: 'account/resources/account-resources-links.tpl.html',
      controller: 'linksCtrl',
      title: 'Links Area',
      resolve: {
        authenticatedUser: securityAuthorizationProvider.requireAuthenticatedUser,
        linkMaterials: ['$q', '$location', 'securityAuthorization', 'accountResource' ,function($q, $location, securityAuthorization, accountResource){
          //get account details only for verified-user, otherwise redirect to /account/verification
          var redirectUrl;
          var promise = securityAuthorization.requireVerifiedUser()
            .then(accountResource.getLinkMaterials, function(reason){
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
angular.module('account.resources.links').controller('linksCtrl', [ '$scope', '$location', 'linkMaterials', 'accountResource',
  function($scope, $location, linkMaterials, accountResource){
    $scope.linkMaterials = linkMaterials;
    accountResource.getAccountDetails().then(function(result){
      if (result.user.isCompletedProfile == 'no'){
           // $location.path('/account/settings');
      }
    });
  }]);
