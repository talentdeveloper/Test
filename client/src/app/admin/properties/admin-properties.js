angular.module('admin.properties.index', ['ngRoute', 'security.authorization', 'services.utility', 'services.adminResource']);
angular.module('admin.properties.index').config(['$routeProvider', function($routeProvider){
  $routeProvider
    .when('/admin/properties', {
      templateUrl: 'admin/properties/admin-properties.tpl.html',
      controller: 'PropertiesIndexCtrl',
      title: 'Manage Properties',
      resolve: {
        properties: ['$q', '$location', '$log', 'securityAuthorization', 'adminResource', function($q, $location, $log, securityAuthorization, adminResource){
          //get app stats only for admin-user, otherwise redirect to /account
          var redirectUrl;
          var promise = securityAuthorization.requireAdminUser()
            .then(function(){
              //handles url with query(search) parameter
              return adminResource.findProperties($location.search());
            }, function(reason){
              //rejected either user is un-authorized or un-authenticated
              redirectUrl = reason === 'unauthorized-client'? '/account': '/login';              
              return $q.reject();
            })
            .catch(function(){              
              redirectUrl = redirectUrl || '/account';
              $location.search({});
              $location.path(redirectUrl);
              return $q.reject();
            });
          return promise;
        }]
      },
      reloadOnSearch: false
    });
}]);
angular.module('admin.properties.index').controller('PropertiesIndexCtrl', ['$scope', '$route', '$location', '$log', 'utility', 'adminResource', 'properties',
  function($scope, $route, $location, $log, utility, adminResource, data){
    // local var
    console.log(data.data[1].user);
    var deserializeData = function(data){
      $scope.items = data.items;
      $scope.pages = data.pages;
      $scope.filters = data.filters;
      $scope.properties = data.data;
    };
    console.log(data.filters);
    var fetchProperties = function(){
      adminResource.findProperties($scope.filters).then(function(data){
        deserializeData(data);

        // update url in browser addr bar
        $location.search($scope.filters);
      }, function(e){
        $log.error(e);
      });
    };

    // $scope methods
    $scope.canSave = utility.canSave;
    $scope.filtersUpdated = function(){
      //reset pagination after filter(s) is updated
      $scope.filters.page = undefined;
      fetchProperties();
    };
    $scope.prev = function(){
      $scope.filters.page = $scope.pages.prev;
      fetchProperties();
    };
    $scope.next = function(){
      $scope.filters.page = $scope.pages.next;
      fetchProperties();
    };
    $scope.addProperty = function(){
      adminResource.addProperty($scope.user).then(function(data){
        $scope.user = '';
        if(data.success){
          $route.reload();
        }else if (data.errors && data.errors.length > 0){
          alert(data.errors[0]);
        }else {
          alert('unknown error.');
        }
      }, function(e){
        $scope.user = '';
        $log.error(e);
      });
    };

    // $scope vars
    //select elements and their associating options
    $scope.status = [
    {label: "All", value: ""},
    {label: "New", value: "new"}, 
    {label: "Actively Working", value: "activelyWorking"}, 
    {label: "Offer Accepted", value: "offerAccepted"},
    {label: "Offer Rejected", value: "offerRejected"},
    {label: "UC Seller", value: "ucSeller"},
    {label: "UC Buyer", value: "ucbuyer"},
    {label: "Closed", value: "closed"},
    {label: "Dead", value: "dead"}

    ];
    $scope.sorts = [
   
      {label: "username \u25B2", value: "user.name"},
      {label: "username \u25BC", value: "-user.name"},
 
    ];
    $scope.limits = [
      {label: "10 items", value: 10},
      {label: "20 items", value: 20},
      {label: "50 items", value: 50},
      {label: "100 items", value: 100}
    ];

    //initialize $scope variables
    deserializeData(data);
  }
]);