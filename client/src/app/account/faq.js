angular.module('account.faq', ['ngRoute', 'security.authorization']);
angular.module('account.faq').config(['$routeProvider', 'securityAuthorizationProvider', function($routeProvider, securityAuthorizationProvider){
  $routeProvider
    .when('/faq', {
      templateUrl: 'account/faq.tpl.html',
      controller: 'FAQCtrl',
      title: 'FAQ Area',
      resolve: {
        authenticatedUser: securityAuthorizationProvider.requireAuthenticatedUser
      }
    });
}]);
angular.module('account.faq').controller('FAQCtrl', [ '$scope',
  function($scope){
    
  }]);
