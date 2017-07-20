angular.module('login.index', ['ngRoute', 'config', 'security.service', 'directives.serverError', 'services.utility', 'vcRecaptcha']);
angular.module('login.index').config(['$routeProvider', '$httpProvider', function($routeProvider, $httpProvider){
	$httpProvider.defaults.useXDomain = true;
	$httpProvider.defaults.headers.common['Access-Control-Allow-Origin'] = '*';
    delete $httpProvider.defaults.headers.common['X-Requested-With'];
  $routeProvider
    .when('/login', {
      templateUrl: 'login/login.tpl.html',
      controller: 'LoginCtrl',
      title: 'Login',
      resolve: {
        UnauthenticatedUser: ['$q', '$location', 'securityAuthorization', function($q, $location, securityAuthorization){
          var promise = securityAuthorization.requireUnauthenticatedUser()
            .catch(function(){
              // user is authenticated, redirect
              $location.path('/account');
              return $q.reject();
            });
          return promise;
        }]
      }
    });
}]);
angular.module('login.index').controller('LoginCtrl', [ '$scope', '$location', '$log', 'security', 'utility', 'SOCIAL','$http',
  function($scope, $location, $log, security, utility, SOCIAL, $http){
	console.log(SOCIAL);
    // local variable
    var loginSuccess = function(data){
      if(data.success){
        //account/user created, redirect...
        var url = data.defaultReturnUrl || '/';
        return $location.path(url);
      }else{
        //error due to server side validation
        $scope.errfor = data.errfor;
        angular.forEach(data.errfor, function(err, field){
          $scope.loginForm[field].$setValidity('server', false);
        });
        angular.forEach(data.errors, function(err, index){
          $scope.alerts.push({
            type: 'danger',
            msg: err
          });
        });
      }
    };
    var loginError = function(){
      $scope.alerts.push({
        type: 'danger',
        msg: 'Error logging you in, Please try again'
      });
    };
    // model def
    $scope.user = {};
    $scope.alerts = [];
    $scope.errfor = {};
    $scope.social = angular.equals({}, SOCIAL)? null: SOCIAL;
    console.log("FACEBOOK:", $scope.social);

    // method def
    $scope.hasError = utility.hasError;
    $scope.showError = utility.showError;
    $scope.canSave = utility.canSave;
    $scope.closeAlert = function(ind){
      $scope.alerts.splice(ind, 1);
    };
    $scope.submit = function(){
    	$scope.alerts = [];
    	security.login($scope.user.username, $scope.user.password).then(loginSuccess, loginError);
    };
  }]);
