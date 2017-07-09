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
            console.log(promise);
          return promise;
        }]
      },
      reloadOnSearch: false
    });
}]);
angular.module('admin.index').controller('AdminCtrl', ['$scope', '$log', 'stats',
  function($scope, $log, stats){
    console.log(stats);
    $scope.user = {
      // users: stats['User'],
      // accounts: stats['Account'],
      // admins: stats['Admin'],
      // groups: stats['AdminGroup'],
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
    // $scope.pivoted = {
    //   categories: stats['Category'],
    //   statuses: stats['Status']
    // };
  }]);