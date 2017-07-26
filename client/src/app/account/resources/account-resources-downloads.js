angular.module('account.resoureces.downloads', ['ngRoute', 'security.authorization']);
angular.module('account.resoureces.downloads').config(['$routeProvider', 'securityAuthorizationProvider', function($routeProvider, securityAuthorizationProvider){
  $routeProvider
    .when('/resources/downloads', {
      templateUrl: 'account/resources/account-resources-downloads.tpl.html',
      controller: 'downloadsCtrl',
      title: 'File Download Area',
      resolve: {
        authenticatedUser: securityAuthorizationProvider.requireAuthenticatedUser,
        downloadMaterials: ['$q', '$location', 'securityAuthorization', 'accountResource' ,function($q, $location, securityAuthorization, accountResource){
          //get account details only for verified-user, otherwise redirect to /account/verification
          var redirectUrl;
          var promise = securityAuthorization.requireVerifiedUser()
            .then(accountResource.getDownloadMaterials, function(reason){
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
angular.module('account.resoureces.downloads').controller('downloadsCtrl', [ '$scope', '$location', 'downloadMaterials', 'accountResource',
  function($scope, $location, downloadMaterials, accountResource){
    console.log(downloadMaterials);
    $scope.downloadMaterials = downloadMaterials;
    accountResource.getAccountDetails().then(function(result){
      if (result.user.isCompletedProfile == 'no'){
          $location.path('/account/settings');
      }
    });

    $scope.submitDownload = function(result) {
      window.location.assign($location.protocol() + "://" + $location.host() + ":" + $location.port() + result);
    };
}]);
