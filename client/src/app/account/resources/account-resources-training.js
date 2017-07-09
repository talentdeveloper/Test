angular.module('account.resoureces.training', ['ngRoute', 'security.authorization']);
angular.module('account.resoureces.training').config(['$routeProvider', 'securityAuthorizationProvider', function($routeProvider, securityAuthorizationProvider){
  $routeProvider
    .when('/resources/training', {
      templateUrl: 'account/resources/account-resources-training.tpl.html',
      controller: 'instructionCtrl',
      title: 'Training Area',
      resolve: {
        authenticatedUser: securityAuthorizationProvider.requireAuthenticatedUser,
        getinstructionURL: ['$q', '$location', 'securityAuthorization', 'accountResource' ,function($q, $location, securityAuthorization, accountResource){
          //get account details only for verified-user, otherwise redirect to /account/verification
          var redirectUrl;
          var promise = securityAuthorization.requireVerifiedUser()
            .then(accountResource.findTrainingVideoURL, function(reason){
              //rejected either user is unverified or un-authenticated
              //console.log('hererererererereer');
              redirectUrl = reason === 'unverified-client'? '/account/verification': '/login';
              return $q.reject();
            })
            .catch(function(){
             // console.log('hererererererereer');
              redirectUrl = redirectUrl || '/account';
              $location.path(redirectUrl);
              return $q.reject();
            });
console.log('hererererererereer');
          return promise;
        }]

      }
    });
}]);
angular.module('account.resoureces.training').controller('instructionCtrl', [ '$scope', 'getinstructionURL', '$sce',
  function($scope, data, $sce){
    $scope.trustSrc = function(src) {
    return $sce.trustAsResourceUrl(src);
  }
    $scope.instructionURL = {src:data.instructionURL};
    $scope.description = data.description;
}]);
