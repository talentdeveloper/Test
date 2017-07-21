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
angular.module('account.index').controller('AccountCtrl', [ '$scope', '$location', 'getVideoURL', '$sce', 'ModalService', 'accountResource',
  function($scope, $location, data, $sce, ModalService, accountResource){
    temp = data;
    accountResource.getAccountDetails().then(function(result){
      if (result.user.isCompletedProfile == 'no'){
           $location.path('/account/settings');
      } else if (result.user.isCompletedProfile == 'yes'){
        var user = result.user;
        var tmpStats = '';
        accountResource.getUserPropertyStats(user._id).then(function(accountPropertyStats) {
          var tmpStats = accountPropertyStats;
          var tmpData = {
            username:   user.username,
            email:      user.email,
            phone:      user.phone,
            address:    user.address,
            city:     user.city,
            state:    user.state,
            zip:      user.zip,
            phone:      user.phone,
            atlantic:   user.atlantic,
            hunterdon:  user.hunterdon,
            sussex:   user.sussex,
            gloucester: user.gloucester,
            salem:    user.salem,
            cumberland: user.cumberland,
            ocean:    user.ocean,
            camden:   user.camden,
            monmouth:   user.monmouth,
            bergen:   user.bergen,
            merser:   user.merser,
            union:    user.union,
            hudson:   user.hudson,
            somerset:   user.somerset,
            essex:    user.essex,
            passaic:    user.passaic,
            capemay:    user.capeMay,
            morris:   user.morris,
            burlington: user.burlington,
            middlesex:  user.middlesex,
            warren:   user.warren,
            occupation:   user.occupation,
            otherSpecify: user.otherSpecify,
            whereHeardUs: user.whereHeardUs,
            photoURL:   user.photoURL,
            firstName: user.firstName,
            lastName: user.lastName,
            status: {        
              submitted: tmpStats['PropertySubmitted'],
              new: tmpStats['New'],
              inProgress: tmpStats['ActivelyWorking'],
              offerAccepted: tmpStats['OfferAccepted'],
              offerRejected: tmpStats['OfferRejected'],
              ucSeller: tmpStats['UCSeller'],
              ucBuyer: tmpStats['UCBuyer'],
              closed: tmpStats['Closed'],
              deadLeads: tmpStats['DeadLeads']
            }
          };
          accountResource.setIdentity(tmpData).then(function(data){
            if(data.success){
              
            }else{
              //error due to server side validation
            }
          }, function(x){
            $scope.alerts.identity.push({
              type: 'danger',
              msg: 'Error updating user identity: ' + x
            });
          });
        });
      }
      
    });

    var show = function() {
      
      ModalService.showModal({
        templateUrl: 'account/welcome.tpl.html',
        controller: "Controller",
        resolve: temp
      }).then(function(modal) {
        modal.element.modal();
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
      });
    };
    var showClosingStats = function() {
      accountResource.getClosingStats().then(function(result){
        $scope.closingStats = result;
      });
    };
    showClosingStatsTitle();
//    show();
    quote();

  }]);
angular.module('account.index').controller('Controller', ['$scope', '$sce', function($scope, $sce) {
    $scope.trustSrc = function(src) {
      return $sce.trustAsResourceUrl(src);
    }
    $scope.videoURL = {src:temp.welcomePageURL};
}]);
