angular.module('account.settings', ['config', 'account.settings.social', 'security.service', 'security.authorization', 'services.accountResource', 'services.utility','ui.bootstrap', 'directives.serverError']);
angular.module('account.settings').config(['$routeProvider', 'securityAuthorizationProvider', function($routeProvider){
  $routeProvider
    .when('/account/settings', {
      templateUrl: 'account/settings/account-settings.tpl.html',
      controller: 'AccountSettingsCtrl',
      title: 'Account Settings',
      resolve: {
        accountDetails: ['$q', '$location', 'securityAuthorization', 'accountResource' ,function($q, $location, securityAuthorization, accountResource){
          //get account details only for verified-user, otherwise redirect to /account/verification
          var redirectUrl;
          var promise = securityAuthorization.requireVerifiedUser()
            .then(accountResource.getAccountDetails, function(reason){
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
angular.module('account.settings').directive('fileUpdate', ['$parse', function($parse) {
	return {
		restrict: 'A',
		scope : {
			filesToUpload : '='
		},
		link: function(scope, element, attrs) {
			var parsedFile = $parse(attrs.fileUpdate);
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
angular.module('account.settings').directive('fileDragzone', function() {
	return {
		restrict: 'A',
		scope : {
			filesToUpload : '='
		},
		link: function(scope, element, attrs) {
			element.bind('dragover', function(e) {
				if(e != null) {
					e.preventDefault();
				}
				(e.originalEvent || e).dataTransfer.effectAllowed = 'copy';
				element.attr('class', 'file-drop-zone-over');
			});
			element.bind('dragenter', function(e) {
				if(e != null) {
					e.preventDefault();
				}
				(e.originalEvent || e).dataTransfer.effectAllowed = 'copy';
				element.attr('class', 'file-drop-zone-over');
			});
			element.bind('drop', function(e) {
				element.attr('class', 'file-drop-zone');
				if(e != null) {
					e.preventDefault();
				}
				var fileObjectsArray = [];
				if((e.originalEvent || e).dataTransfer.files.length > 1) {
					alert("Only one file can be added.");
					return;
				}
				angular.forEach((e.originalEvent || e).dataTransfer.files, function(file) {
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
});

angular.module('account.settings').controller('AccountSettingsCtrl', [ '$scope', '$location', '$log', '$timeout', 'security', 'utility', 'accountResource', 'accountDetails', 'SOCIAL', '$http', '$sce',
  function($scope, $location, $log, $timeout, security, utility, restResource, accountDetails, SOCIAL, $http, $sce){
	var isEnterAddress = 0;
    var account = accountDetails.account;
    var user = accountDetails.user;
    $scope.user = {};
    $scope.address = JSON.stringify(accountDetails.user.address);
  	$scope.$on('gmPlacesAutocomplete::placeChanged', function(){
  		isEnterAddress = 1;
  		var getPlace = $scope.user.address.getPlace().address_components;
  		var componentForm = {
  	        street_number: 'short_name',
  	        route: 'long_name',
  	        locality: 'long_name',
  	        administrative_area_level_1: 'short_name',
  	        country: 'long_name',
  	        postal_code: 'short_name'
  		};
  		
  		for(var i = 0; i < getPlace.length; i++) {
  			var addressType = getPlace[i].types[0];
  			var val = getPlace[i][componentForm[addressType]];
  			switch (addressType) {
  			case 'postal_code': // zip code
  				$scope.user.zip = val;
  				break;
  			case 'street_number': // address1
  				$scope.user.address = val;
  				break;
  			case 'route': // address2
  				if ($scope.user.address == undefined) {
  					$scope.user.address = "";
  				}
  				$scope.user.address += " " + val;
  				break;
  			case 'locality': // city
  				$scope.user.city = val;
  				break;
  			case 'administrative_area_level_1': // state
  				$scope.user.state = val;
  				break;
  			case 'administrative_area_level_2': // county
  				$scope.user.county = val;
  				break;
  			case 'administrative_area_level_3':
  				break;
  			case 'country':
  				break;
  			}
  		}
  	    $scope.$apply();
  	});
    var tmpStats = '';
    restResource.getUserPropertyStats(user._id).then(function(accountPropertyStats) {
      var tmpStats = accountPropertyStats;
      $scope.user = {
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
        }
      };

    });
    restResource.getStatusType().then(function(data){
        
        restResource.getStatsByUser(user._id, data).then(function(result){
        $scope.statusTypes = result;
        });
      });

    $scope.file = {};
    var submitPhotoForm = function() {
        $scope.uploading = true;
        restResource.upload($scope.files).then(function(data) {
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
        restResource.uploadDist($scope.files).then(function(data) {
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
    //local vars
    var submitDetailForm = function(){
      $scope.alerts.detail = [];
      restResource.setAccountDetails($scope.user).then(function(data){
        if(data.success){
          
        }else{
          
        }
      }, function(x){
        $scope.alerts.detail.push({
          type: 'danger',
          msg: 'Error updating account details: ' + x
        });
      });
    };
    var submitIdentityForm = function(){
      submitDetailForm();
      $scope.alerts.identity = [];
      if ($scope.user.firstName != '' && $scope.user.lastName != '' && $scope.user.address != '' && $scope.user.city !='' && $scope.user.state != '' && $scope.user.zip != '' && $scope.user.phone != '') {
        restResource.setProfileCompleted($scope.user).then(function(){
          
        });
      }
      if(isEnterAddress == 0) {
    	  $scope.user.address = accountDetails.user.address;
      }
      restResource.setIdentity($scope.user).then(function(data){
        if(data.success){
          $scope.alerts.identity.push({
            type: 'success',
            msg: 'User identity is updated.'
          });
        }else{
          //error due to server side validation
          $scope.errfor = data.errfor;
          angular.forEach(data.errfor, function(err, field){
            $scope.identityForm[field].$setValidity('server', false);
          });
          angular.forEach(data.errors, function(err, index){
            $scope.alerts.identity.push({
              type: 'danger',
              msg: err
            });
          });
        }
      }, function(x){
        $scope.alerts.identity.push({
          type: 'danger',
          msg: 'Error updating user identity: ' + x
        });
      });

      
    };

    var submitPasswordForm = function(){
      $scope.alerts.pass = [];
      restResource.setPassword($scope.pass).then(function(data){
        $scope.pass = {};
        $scope.passwordForm.$setPristine();
        if(data.success){
          $scope.alerts.pass.push({
            type: 'success',
            msg: 'Password is updated.'
          });
        }else{
          //error due to server side validation
          angular.forEach(data.errors, function(err, index){
            $scope.alerts.pass.push({
              type: 'danger',
              msg: err
            });
          });
        }
      }, function(x){
        $scope.alerts.pass.push({
          type: 'danger',
          msg: 'Error updating password: ' + x
        });
      });
    };

    var disconnect = function(provider){
      var errorAlert = {
        type: 'warning',
        msg: 'Error occurred when disconnecting your '+ provider + ' account. Please try again later.'
      };
      $scope.socialAlerts = [];
      security.socialDisconnect(provider).then(function(data){
        if(data.success){
          $scope.social[provider]['connected'] = false;
          $scope.socialAlerts.push({
            type: 'info',
            msg: 'Successfully disconnected your '+ provider +' account.'
          });
        }else{
          $scope.socialAlerts.push(errorAlert);
        }
      }, function(x){
        $scope.socialAlerts.push(errorAlert);
      });
    };

    //model def
    $scope.errfor = {}; //for identity server-side validation
    $scope.alerts = {
      detail: [], identity: [], pass: []
    };

    
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
        case 'identityForm':
          submitIdentityForm();
          break;
        case 'passwordForm':
          submitPasswordForm();
          break;
        case 'photoForm':
          submitPhotoForm();
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
