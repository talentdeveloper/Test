angular.module('admin.downloadmaterial.index', ['ngRoute', 'security.authorization', 'services.utility', 'services.adminResource']);
angular.module('admin.downloadmaterial.index').config(['$routeProvider', function($routeProvider){
  $routeProvider
    .when('/admin/downloadmaterial', {
      templateUrl: 'admin/trainingmaterial/admin-downloadmaterials.tpl.html',
      controller: 'downloadCtrl',
      title: 'Links',
      resolve: {
        downloadmaterial: ['$q', '$location', '$log', 'securityAuthorization', 'adminResource', function($q, $location, $log, securityAuthorization, adminResource){
          //get app stats only for admin-user, otherwise redirect to /account
          var redirectUrl;
          var promise = securityAuthorization.requireAdminUser()
            .then(function(){
              //handles url with query(search) parameter
              return adminResource.findDownloadMaterials();
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
angular.module('admin.downloadmaterial.index').directive('fileModel', ['$parse', function($parse) {
  return {
    restrict: 'A',
    scope : {
      filesToUpload : '='
    },
    link: function(scope, element, attrs) {
      var parsedFile = $parse(attrs.fileModel);
      var parsedFileSetter = parsedFile.assign;
      element.bind('change', function(e) {
        var fileObjectsArray = [];
        angular.forEach(parsedFileSetter(scope, element[0].files), function(file) {
          var reader = new FileReader();
          reader.onload = function(e) {
            scope.$apply(function() {
              var newFilePreview = e.target.result;
              var newFileName = file.name;
              var newFileSize = file.size;
              
              var fileObject = {
                file : file,
                name : newFileName,
                size : newFileSize,
                preview: newFilePreview
              }
              fileObjectsArray.push(fileObject);
            });
          }
          reader.readAsDataURL(file);
        });
        scope.filesToUpload = fileObjectsArray;
      });
    }
  };
}]);
angular.module('admin.downloadmaterial.index').controller('downloadCtrl', ['$scope', '$route', '$location', '$log', 'utility', 'adminResource', 'downloadmaterial',
  function($scope, $route, $location, $log, utility, adminResource, data){
    // local var
    
    $scope.downloadMaterials = data;
    // $scope vars
    //select elements and their associating optio
    $scope.deleteDownloadMaterial = function(id){
      $scope.deleteAlerts =[];
      if(confirm('Are you sure?')){
        adminResource.deleteDownloadMaterial(id).then(function(result){
          if(result.success){
            // redirect to admin users index page
            $location.path('/admin/downloadmaterial');
            $route.reload();
          }else{
            //error due to server side validation
            angular.forEach(result.errors, function(err, index){
              $scope.deleteAlerts.push({ type: 'danger', msg: err});
            });
          }
        }, function(x){
          $scope.deleteAlerts.push({ type: 'danger', msg: 'Error deleting user: ' + x });
        });
      }
    };

    $scope.submitUpload = function () {
      $scope.uploading = true;
      adminResource.uploadFile($scope.newFile, $scope.files).then(function(data) {
        if (data.data.success) {
          $scope.uploading = false;
          $scope.alert = 'alert alert-success';
          $scope.message = data.data.message;
          $scope.file = {};
          $location.path('/admin/downloadmaterial');
          $route.reload();
        } else {
          $scope.uploading = false;
          $scope.alert = 'alert alert-danger';
          $scope.message = data.data.message;
          $scope.file = {};
        }
      });
      adminResource.uploadFileDist($scope.files).then(function(data) {
        if (data.data.success) {
          $scope.uploading = false;
          $scope.alert = 'alert alert-success';
          $scope.message = data.data.message;
          $scope.file = {};
        } else {
          $scope.uploading = false;
          $scope.alert = 'alert alert-danger';
          $scope.message = data.data.message;
          $scope.file = {};
        }
      });
      
    };
  }
]);