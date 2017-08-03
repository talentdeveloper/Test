angular.module('admin.announcement', ['ngRoute', 'security.authorization', 'services.adminResource']);
angular.module('admin.announcement').config(['$routeProvider', function($routeProvider){
  $routeProvider
    .when('/admin/announcement', {
      templateUrl: 'admin/admin-announcement.tpl.html',
      controller: 'AnnouncementCtrl',
      title: 'Announcemnet Area',
      resolve: {
        announcement: ['$q', '$location', 'securityAuthorization', 'adminResource', function($q, $location, securityAuthorization, adminResource){
          // get app stats only for admin-user, otherwise redirect to /account
          var redirectUrl;
          var promise = securityAuthorization.requireAdminUser()
            .then(adminResource.getAnnouncement, function(reason){
              // rejected either user is un-authorized or un-authenticated
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
angular.module('admin.announcement').controller('AnnouncementCtrl', ['$scope', '$route', '$location', '$log', 'announcement', 'adminResource',
  function($scope, $route, $location, $log, announcement, adminResource){
    $scope.announcement = announcement;
    console.log(announcement);


    $scope.updateAnnouncement = function() {
      adminResource.updateAnnouncement($scope.announcement).then(function(data){
        //alert('Announcement Updated.');
        if(data.success){

        }else if (data.errors && data.errors.length > 0){
          alert(data.errors[0]);
        }else {
          // alert('unknown error.');
        }
      }, function(e){       
        $log.error(e);
      });
    };
  }]);