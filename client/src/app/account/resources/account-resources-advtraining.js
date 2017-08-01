angular.module('account.resources.advtraining', ['ngRoute', 'security.authorization']);
angular.module('account.resources.advtraining').config(['$routeProvider', 'securityAuthorizationProvider', function($routeProvider, securityAuthorizationProvider){
  $routeProvider
    .when('/resources/advtraining', {
      templateUrl: 'account/resources/account-resources-advtraining.tpl.html',
      controller: 'instructionCtrl',
      title: 'Adv Training Area',
      resolve: {
        authenticatedUser: securityAuthorizationProvider.requireAuthenticatedUser,
        getinstructionURL: ['$q', '$location', 'securityAuthorization', 'accountResource' ,function($q, $location, securityAuthorization, accountResource){
          //get account details only for verified-user, otherwise redirect to /account/verification
          var redirectUrl;
          var promise = securityAuthorization.requireVerifiedUser()
            .then(accountResource.findAdvTrainingVideoURL, function(reason){
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
angular.module('account.resources.advtraining').controller('instructionCtrl', [ '$scope', '$location', 'getinstructionURL', '$sce', 'accountResource',
	function($scope, $location, data, $sce, accountResource){
	$scope.instructionURL = {src:data[0].videoURL};
    $scope.data = data;
    
	$scope.trustSrc = function(src) {
		return $sce.trustAsResourceUrl(src);
	};
	
	$scope.selectKey = function(val) {
		var url = val + '&autoplay=1';
		$scope.instructionURL = {src:url};
	};

  accountResource.getAccountDetails().then(function(result){
    if (result.user.isCompletedProfile == 'no'){
         // $location.path('/account/settings');
    }
  });
}]);
