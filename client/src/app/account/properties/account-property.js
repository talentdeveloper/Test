angular.module('account.properties.submit', ['config', 'security.service', 'security.authorization', 'services.accountResource', 'services.utility','ui.bootstrap', 'directives.serverError']);
angular.module('account.properties.submit').config(['$routeProvider', 'securityAuthorizationProvider', function($routeProvider){
  $routeProvider
    .when('/account/properties', {
      templateUrl: 'account/properties/account-property.tpl.html',
      controller: 'AccountPropertySubmitCtrl',
      title: 'Account Property Submit',
      resolve: {
        propertyDetails: ['$q', '$location', 'securityAuthorization', 'accountResource' ,function($q, $location, securityAuthorization, accountResource){
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

angular.module('account.properties.submit').directive('fileModel', ['$parse', function($parse) {
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      var parsedFile = $parse(attrs.fileModel);
      var parsedFileSetter = parsedFile.assign;

      element.bind('change', function() {
        scope.$apply(function() {
          parsedFileSetter(scope, element[0].files[0]);
        });
      });
    }
  };
}]);
angular.module('account.properties.submit').controller('AccountPropertySubmitCtrl', [ '$scope', '$location', '$log', 'security', 'utility', 'accountResource', 'propertyDetails', 'SOCIAL', '$timeout',
  function($scope, $location, $log, security, utility, restResource, propertyDetails, SOCIAL, $timeout){
    //local vars
   // $scope.getFileDetails = function (e) {

   //      $scope.files = [];
   //      $scope.$apply(function () {

   //        $scope.fileCounts = e.files.length;
   //          // STORE THE FILE OBJECT IN AN ARRAY.
   //          for (var i = 0; i < e.files.length; i++) {
   //              $scope.files.push(e.files[i])
   //          }

   //      });
   //  };

   //  // NOW UPLOAD THE FILES.
   //  var submitPhotoForm = function () {

   //      //FILL FormData WITH FILE DETAILS.
   //      var data = new FormData();

   //      for (var i in $scope.files) {
   //          data.append("uploadedFile", $scope.files[i]);
   //      }

   //      // ADD LISTENERS.
   //      var objXhr = new XMLHttpRequest();
   //      objXhr.addEventListener("progress", updateProgress, false);
   //      objXhr.addEventListener("load", transferComplete, false);

   //      // SEND FILE DETAILS TO THE API.
   //      objXhr.open("POST", "/api/fileupload/");
   //      objXhr.send(data);
   //  }

   $scope.file = {};
   var propertyURL = '';
    var submitPhotoForm = function() {
        console.log($scope.file);
        console.log('$scope.file');
        $scope.uploading = true;
        restResource.propertyUpload($scope.file).then(function(data) {
          if (data.data.success) {
            $scope.uploading = false;
            $scope.alert = 'alert alert-success';
            $scope.message = data.data.message;
            $scope.file = {};
            console.log(data.data.photoURL);
            // console.log($scope.propertyDetail);
   
            propertyURL = data.data.photoURL;
            console.log($scope.propertyDetail);
          } else {
            $scope.uploading = false;
            $scope.alert = 'alert alert-danger';
            $scope.message = data.data.message;
            $scope.file = {};
          }
        });
        restResource.propertyUploadDist($scope.file).then(function(data) {
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
    $scope.photoChanged = function(files) {
      console.log(files);
      if (files.length > 0 && files[0].name.match(/\.(png|jpg|jpeg)$/)) {
        $scope.uploading = true;
        var file = files[0];
        var fileReader = new FileReader();
        fileReader.readAsDataURL(file);
        fileReader.onload = function(e) {
           $timeout(function() {
            $scope.thumbnail = {};
            $scope.thumbnail.dataUrl = e.target.result;           
            $scope.uploading = false;
            $scope.message = false;
           });
        };
      } else {
        $scope.thumbnail = {};
        $scope.message = false;
      }
    };

    var property = propertyDetails.property;
    var user = propertyDetails.user;
    $scope.user = {
      username: propertyDetails.user.username,
      email:    propertyDetails.user.email
    };
    console.log(user);
    var submitDetailForm = function(){
      $scope.alerts.detail = [];
      console.log($scope.propertyDetail);
      $scope.propertyDetail.photoURL = propertyURL;
      restResource.addAccountProperty($scope.propertyDetail).then(function(data){
        if(data.success){
          $scope.alerts.detail.push({
            type: 'success',
            msg: 'New Property submitted.'
          });
        }else{
          angular.forEach(data.errors, function(err, index){
            $scope.alerts.detail.push({
              type: 'danger',
              msg: err
            });
          });
        }
      }, function(x){
        $scope.alerts.detail.push({
          type: 'danger',
          msg: 'Error updating account details: ' + x
        });
      });
    };


    //model def
    $scope.errfor = {}; //for identity server-side validation
    $scope.alerts = {
      detail: [], identity: [], pass: []
    };
    console.log(user);
    // $scope.propertyDetail = {

  		// propertyType: property.propertyType,
  		// submittedOn: property.submittedOn,
  		// propertyAddress: property.propertyAddress,
  		// propertyCity: property.propertyCity,
  		// propertyState: property.propertyState,
  		// propertyZip: property.propertyZip,
  		// propertyCounty: property.propertyCounty,
  		// ownerFirstName: property.ownerFirstName,
  		// ownerLastName: property.ownerLastName,
  		// ownerPhone: property.ownerPhone,
  		// ownerCell: property.ownerCell,
  		// ownerEmail: property.ownerEmail,
  		// beds: property.beds,
  		// baths: property.baths,
  		// askingPrice: property.askingPrice,
  		// repairs: property.repairs,
  		// repairNeed: property.repairNeed,
  		// otherRepairDetail: property.otherRepairDetail,
  		// occupancy: property.occupancy,  
  		// listedOnMLS: property.listedOnMLS,
  		// propertyDetail: property.propertyDetail,
  		// taxRecordLink: property.taxRecordLink,
  		// zillowLink: property.zillowLink,
  		// offerAmountAccepted: property.offerAmountAccepted,    
  		// approxARV: property.approxARV,
    //   user: user,
    //   status: 'new'
    // };
    // $scope.user = {
    //   username: user.username,
    //   email:    user.email
    // };
    console.log($scope.user);
    console.log(user);
    $scope.pass = {};
    $scope.social = null;
    if(!angular.equals({}, SOCIAL)){
      $scope.social = SOCIAL;
      if(user.google && user.google.id){
        $scope.social.google.connected = true;
      }
      if(user.facebook && user.facebook.id){
        $scope.social.facebook.connected = true;
      }
    }

    $scope.socialAlerts = [];

    //initial behavior
    var search = $location.search();
    if(search.provider){
      if(search.success === 'true'){
        $scope.socialAlerts.push({
          type: 'info',
          msg: 'Successfully connected your '+ search.provider +' account.'
        });
      }else{
        $scope.socialAlerts.push({
          type: 'warning',
          msg: 'Unable to connect your '+ search.provider + ' account. ' + search.reason
        });
      }
    }

    // method def
    $scope.hasError = utility.hasError;
    $scope.showError = utility.showError;
    $scope.canSave = utility.canSave;
    $scope.closeAlert = function(key, ind){
      $scope.alerts[key].splice(ind, 1);
    };
    $scope.closeSocialAlert = function(ind){
      $scope.socialAlerts.splice(ind, 1);
    };
    $scope.submit = function(ngFormCtrl){
      switch (ngFormCtrl.$name){
        case 'detailForm':
          submitDetailForm();
          console.log('button pressed');
          break;
        case 'photoForm':
        console.log('button pressed');
          submitPhotoForm();
          break;
        case 'passwordForm':
          submitPasswordForm();
          break;
        default:
          return;
      }
    };
    $scope.disconnect = function(provider){
      if($scope.social){
        disconnect(provider);
      }
    };
  }
]);
