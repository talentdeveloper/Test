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
            console.log(promise);
          return promise;
        }]
      }
    });
}]);


angular.module('account.properties.list').controller('AccountPropertyListCtrl', [ '$scope', '$location', '$log', 'security', 'utility', 'accountResource', 'propertyList',
  function($scope, $location, $log, security, utility, restResource, data){
    var user = data.user;
    console.log(user);

    restResource.findPropertyList(user._id).then(function(list){
      console.log(list);
      $scope.properties = list;
    });

  }
]);
