angular.module('admin.index', ['ngRoute', 'security.authorization', 'services.adminResource']);
angular.module('admin.index').config(['$routeProvider', function($routeProvider){
  $routeProvider
    .when('/admin', {
      templateUrl: 'admin/admin.tpl.html',
      controller: 'AdminCtrl',
      title: 'Admin Area',
      resolve: {
        stats: ['$q', '$location', 'securityAuthorization', 'adminResource', function($q, $location, securityAuthorization, adminResource){
          //get app stats only for admin-user, otherwise redirect to /account
          var redirectUrl;
          var promise = securityAuthorization.requireAdminUser()
            .then(adminResource.getStats, function(reason){
              //rejected either user is un-authorized or un-authenticated
              redirectUrl = reason === 'unauthorized-client'? '/account': '/login';
              return $q.reject();
            })
            .catch(function(){
              redirectUrl = redirectUrl || '/account';
              $location.path(redirectUrl);
              return $q.reject();
            });
          return promise;
        }]
      },
      reloadOnSearch: false
    });
}]);
angular.module('admin.index').controller('AdminCtrl', ['$scope', '$log', 'stats', 'adminResource',
  function($scope, $log, stats, adminResource){
	$scope.closingStatsTitleShow = {};
	var getTitleShow = function(){
		adminResource.getClosingStatsTitle().then(function(result) {
			$scope.closingStatsTitleShow = result;
			if(result.isShow == 0) {
		    	$scope.btnText = 'Closing Stats On';
		    } else {
		    	$scope.btnText = 'Closing Stats Off';
		    }
	    });
    };
    getTitleShow();
    $scope.user = {
      submitted: stats['PropertySubmitted'],
      new: stats['New'],
      activelyWorking: stats['ActivelyWorking'],
      offerAccepted: stats['OfferAccepted'],
      offerRejected: stats['OfferRejected'],
      ucSeller: stats['UCSeller'],
      ucBuyer: stats['UCBuyer'],
      closed: stats['Closed'],
      deadLeads: stats['DeadLeads']
    };
    $scope.clickChange = function() {
    	if($scope.closingStatsTitleShow.isShow == 0) {
    		$scope.btnText = 'Closing Stats Off';
    		$scope.closingStatsTitleShow.isShow = 1;
    		updateTitleShow($scope.closingStatsTitleShow);
    	} else {
    		$scope.btnText = 'Closing Stats On';
    		$scope.closingStatsTitleShow.isShow = 0;
    		updateTitleShow($scope.closingStatsTitleShow);
    	}
    };
    
    var updateTitleShow = function() {
	    adminResource.updateClosingStatsTitleShow($scope.closingStatsTitleShow).then(function(data){
	    
	      if(data.success){
	
	      }else if (data.errors && data.errors.length > 0){
	        alert(data.errors[0]);
	      }else {
	        
	      }
	    }, function(e){
	      $log.error(e);
	    });
	  };
      
    var showRecentlyAddedProperties = function() {
      remarkUserRankingAndBadge();
      adminResource.recentlyAddedProperties().then(function(result) {
        $scope.recentlyProperties = result;
      });
    };
    var remarkUserRankingAndBadge = function() {
      adminResource.remarkSystem().then(function(result){

      });
    };
    showRecentlyAddedProperties();
  }]);