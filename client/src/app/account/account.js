angular.module('account.index', ['ngRoute', 'security.authorization', 'angularModalService']);
angular.module('account.index').config(['$routeProvider', 'securityAuthorizationProvider', function($routeProvider, securityAuthorizationProvider){
  $routeProvider
    .when('/account', {
      templateUrl: 'account/account.tpl.html',
      controller: 'AccountCtrl',
      title: 'Account Area',
      resolve: {
        authenticatedUser: securityAuthorizationProvider.requireAuthenticatedUser,
        getVideoURL: ['$q', '$location', 'securityAuthorization', 'accountResource', function($q, $location, securityAuthorization, accountResource){
          //get account details only for verified-user, otherwise redirect to /account/verification
          var redirectUrl;
          var promise = securityAuthorization.requireVerifiedUser()
            .then(accountResource.findVideoURL, function(reason){
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
var temp = '';
angular.module('account.index').controller('AccountCtrl', [ '$scope', 'getVideoURL', '$sce', 'ModalService', 'accountResource',
  function($scope, data, $sce, ModalService, accountResource){
    console.log(data.welcomePageURL);
    temp = data;
    var value = '';

    var show = function() {
      quote();
      ModalService.showModal({
        templateUrl: 'account/welcome.tpl.html',
        controller: "Controller",
        resolve: temp
      }).then(function(modal) {
    	console.log(modal);
        modal.element.modal();
        console.log(modal.element.modal());
        modal.close.then(function(result) {
          // close Progress Here
          quote();
        });
      });
    };
    
    var quote = function() {
    	accountResource.getQuote().then(function(result) {
    		$scope.quotes = '';
    		var dayOfYear = moment().format('DDD');
    		
    		if(dayOfYear <= result.length) {
    			$scope.quotes = result[dayOfYear - 1];
    		} else if(dayOfYear > result.length){
    			var dayVal = (dayOfYear / result.length) - 1;
    			if(dayOfYear <= result.length) {
    				$scope.quotes = result[dayVal];
    			} else {
    				$scope.quotes = result[(dayVal / result.length) - 1];
    			}
    		}
    		
    	    /*$scope.dayOfMonth = moment().format('D');
    	    $scope.weekOfYear = moment().format('w');
    	    $scope.dayOfWeek = moment().format('d');
    	    $scope.weekYear = moment().format('gg');
    	    $scope.hourOfDay = moment().format('H');*/
    	});
    };
    var showClosingStatsTitle = function() {
      showClosingStats();  
      accountResource.getClosingStatsTitle().then(function(result){
        $scope.closingStatsTitle = result;
        console.log(result);
      });
    };
    var showClosingStats = function() {
      accountResource.getClosingStats().then(function(result){
        $scope.closingStats = result;
      });
    };
    showClosingStatsTitle();
//    show();
  }]);
angular.module('account.index').controller('Controller', ['$scope', '$sce', function($scope, $sce) {
    $scope.trustSrc = function(src) {
      return $sce.trustAsResourceUrl(src);
    }
    $scope.videoURL = {src:temp.welcomePageURL};
}]);
