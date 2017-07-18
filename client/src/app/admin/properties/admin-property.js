angular.module('admin.properties.detail', ['ngRoute', 'security.authorization', 'services.utility', 'services.adminResource', 'directives.serverError', 'ui.bootstrap']);
angular.module('admin.properties.detail').config(['$routeProvider', function($routeProvider){
  $routeProvider
    .when('/admin/properties/:id', {
      templateUrl: 'admin/properties/admin-property.tpl.html',
      controller: 'PropertiesDetailCtrl',
      title: 'Properties / Details',
      resolve: {
        propertyDetails: ['$q', '$route', '$location', 'securityAuthorization', 'adminResource', function($q, $route, $location, securityAuthorization, adminResource){
          //get app stats only for admin-user, otherwise redirect to /account
          var redirectUrl;
          var promise = securityAuthorization.requireAdminUser()
            .then(function(){
              var id = $route.current.params.id || '';
              if(id){
                return adminResource.findProperty(id);
              }else{
                redirectUrl = '/admin/properties';
                return $q.reject();
              }
            }, function(reason){
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
      }
    });
}]);

angular.module('admin.properties.detail').directive('fileInput', ['$parse', function($parse) {
	return {
		restrict: 'A',
		scope : {
			filesToUpload : '='
		},
		link: function(scope, element, attrs) {
			var parsedFile = $parse(attrs.fileInput);
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
angular.module('admin.properties.detail').directive('fileDraginput', function() {
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
angular.module('admin.properties.detail').controller('PropertiesDetailCtrl', ['$scope', '$route', '$location', 'utility', 'adminResource', 'propertyDetails', '$timeout',
  function($scope, $route, $location, utility, adminResource, propertyDetails, $timeout) {
	/************************* Files Drop ****************************/
	$scope.remove = function(index) {
		var files = [];
		angular.forEach($scope.files, function(file, key) {
			if(index != key) {
				files.push(file);
			}
		});
		$scope.files = files;
	};
	/*****************************************************************/
	$scope.address = JSON.stringify(propertyDetails.propertyAddress);
    // local vars
    //var property = propertyDetails.property;
	$scope.propertyDetail = {};
	// Address automatic Complete
	$scope.$on('gmPlacesAutocomplete::placeChanged', function(){
		var getPlace = $scope.propertyDetail.propertyAddress.getPlace().address_components;
		var componentForm = {
	        street_number: 'short_name',
	        route: 'long_name',
	        locality: 'long_name',
	        administrative_area_level_1: 'short_name',
	        country: 'long_name',
	        postal_code: 'short_name'
		};
		if(getPlace == undefined) {
			$scope.propertyDetail.propertyZip = '';
			$scope.propertyDetail.propertyAddress = '';
			$scope.propertyDetail.propertyCity = '';
			$scope.propertyDetail.propertyState = '';
			$scope.propertyDetail.propertyCounty = '';
			
			return;
		}
		
		for(var i = 0; i < getPlace.length; i++) {
			var addressType = getPlace[i].types[0];
			var val = getPlace[i][componentForm[addressType]];
			switch (addressType) {
			case 'postal_code': // zip code
				$scope.propertyDetail.propertyZip = val;
				break;
			case 'street_number': // address1
				$scope.propertyDetail.propertyAddress = val;
				break;
			case 'route': // address2
				if ($scope.propertyDetail.propertyAddress == undefined) {
					$scope.propertyDetail.propertyAddress = "";
				}
				$scope.propertyDetail.propertyAddress += " " + val;
				break;
			case 'locality': // city
				$scope.propertyDetail.propertyCity = val;
				break;
			case 'administrative_area_level_1': // state
				$scope.propertyDetail.propertyState = val;
				break;
			case 'administrative_area_level_2': // county
				$scope.propertyDetail.propertyCounty = val;
				break;
			case 'administrative_area_level_3':
				break;
			case 'country':
				break;
			}
		}
//		var location = $scope.autocomplete.getPlace().geometry.location;
//	    $scope.lat = location.lat();
//	    $scope.lng = location.lng();
	    $scope.$apply();
	});
	
	// textarea row fixed 15 lines
	$scope.limitRows = function() {
		var rows = angular.element('#textarea').val().split('\n').length;
		var maxRows = 15;
		if(rows > maxRows) {
			alert("Only 15 lines are allowed.");
			var modifiedText = angular.element('#textarea').val().split('\n').slice(0, maxRows);
			angular.element('#textarea').val(modifiedText.join('\n'));
		}
	};
	
	// calculate ARV
	$scope.calcFunc = function(paramARV, paramRepairs, paramAmount) {
		if(paramARV == null) {
			paramARV = 0;
		}
		if(paramRepairs == null) {
			paramRepairs = 0;
		}
		if(paramAmount == null) {
			paramAmount = 0;
		}
		var value1 = 0.65 * paramARV;
		var value2 = value1 - paramRepairs;
		if(value2 < paramAmount) {
			return true;
		} else {
			return false;
		}
	};
	// function sum Point
	$scope.sumPoint = function() {
		var sum = 0;
		if ($scope.files != undefined) {
			if($scope.files.length != 0) {
				sum++;				
			}
		}
		if ($scope.propertyDetail.propertyAddress != null) {
			sum++;
		}
		if ($scope.propertyDetail.ownerFirstName != null && $scope.propertyDetail.ownerLastName != null) {
			sum++;
		}
		if ($scope.propertyDetail.ownerPhone != null) {
			sum++;
		}
		if ($scope.propertyDetail.ownerEmail != null) {
			sum++;
		}
		if ($scope.propertyDetail.askingPrice != null) {
			sum++;
		}
		if ($scope.propertyDetail.repairs != null) {
			sum++;
		}
		if ($scope.propertyDetail.propertyDetail != null) {
			sum++;
		}
		if ($scope.propertyDetail.offerAmountAccepted != null) {
			sum += 2;
		}
		
		return sum;
	};
	
	$scope.file = {};
	var propertyURL = '';
    var submitPhotoForm = function() {
        $scope.uploading = true;
        adminResource.propertyUpload($scope.file).then(function(data) {
          if (data.data.success) {
            $scope.uploading = false;
            $scope.alert = 'alert alert-success';
            $scope.message = data.data.message;
            $scope.file = {};
   
            propertyURL = data.data.photoURL;
          } else {
            $scope.uploading = false;
            $scope.alert = 'alert alert-danger';
            $scope.message = data.data.message;
            $scope.file = {};
          }
        });
        adminResource.propertyUploadDist($scope.file).then(function(data) {
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
	
    var user = propertyDetails.user;
    var submitDetailForm = function(){
      $scope.propertyDetail.photoURL = propertyURL;
      $scope.propertyDetail.sumPoint = $scope.sumPoint();
      $scope.alerts.detail = [];
      $scope.alerts.detail.push({
            type: 'success',
            msg: 'Changes have been updated.'
          });
      adminResource.updateProperty(propertyDetails._id, $scope.propertyDetail).then(function(result){
        if(result.success){
          $scope.user = result.user; //update $scope user model
          $scope.identityAlerts.push({ type: 'info', msg: 'Changes have been saved.'});
        }else{
         
          angular.forEach(result.errors, function(err, index){
            $scope.identityAlerts.push({ type: 'danger', msg: err });
          });
        }
      }, function(x){
        $scope.identityAlerts.push({
          type: 'danger',
          msg: 'Error updating user identity: ' + x
        });
      });
    };


    //model def
    $scope.errfor = {}; //for identity server-side validation
    $scope.alerts = {
      detail: [], identity: [], pass: []
    };
    $scope.propertyDetail = {
      propertyType: propertyDetails.propertyType,
      multiFamilyUnit: propertyDetails.multiFamilyUnit,
      commercialContent: propertyDetails.commercialContent,
      commercialComplex: propertyDetails.commercialComplex,
      commercialOther: propertyDetails.commercialOther,
      landBuild: propertyDetails.landBuild,
      submittedOn: propertyDetails.submittedOn,
      propertyAddress: propertyDetails.propertyAddress,
      propertyCity: propertyDetails.propertyCity,
      propertyState: propertyDetails.propertyState,
      propertyZip: propertyDetails.propertyZip,
      propertyCounty: propertyDetails.propertyCounty,
      ownerFirstName: propertyDetails.ownerFirstName,
      ownerLastName: propertyDetails.ownerLastName,
      ownerPhone: propertyDetails.ownerPhone,
      ownerCell: propertyDetails.ownerCell,
      ownerEmail: propertyDetails.ownerEmail,
      beds: propertyDetails.beds,
      baths: propertyDetails.baths,
      askingPrice: propertyDetails.askingPrice,
      propertyPrice: propertyDetails.propertyPrice,
      modifyPrice: propertyDetails.modifyPrice,
      repairs: propertyDetails.repairs,
      Roof: propertyDetails.Roof,
      Kitchen: propertyDetails.Kitchen,
      Bath: propertyDetails.Bath,
      Paint: propertyDetails.Paint,
      Carpet: propertyDetails.Carpet,
      Windows: propertyDetails.Windows,
      Furnance: propertyDetails.Furnance,
      Drywall: propertyDetails.Drywall,
      Plumbing: propertyDetails.Plumbing,
      Electrical: propertyDetails.Electrical,
      repairs: propertyDetails.repairs,
      otherRepairDetail: propertyDetails.otherRepairDetail,
      occupancy: propertyDetails.occupancy,  
      listedOnMLS: propertyDetails.listedOnMLS,
      propertyOnMLS: propertyDetails.propertyOnMLS,
      propertyDetail: propertyDetails.propertyDetail,
      taxRecordLink: propertyDetails.taxRecordLink,
      zillowLink: propertyDetails.zillowLink,
      offerAmountAccepted: propertyDetails.offerAmountAccepted,    
      approxARV: propertyDetails.approxARV,
      status: propertyDetails.status,
      selectCalculate: propertyDetails.selectCalculate,
      propertyCalculate: propertyDetails.propertyCalculate,
      photoURL: propertyDetails.photoURL
    };
    $scope.user = {
      username: user.name,
      email:    user.email
    };
    $scope.pass = {};

    //initial behavior
    var search = $location.search();


    // method def
    $scope.hasError = utility.hasError;
    $scope.showError = utility.showError;
    $scope.canSave = utility.canSave;
    $scope.closeAlert = function(key, ind){
      $scope.alerts[key].splice(ind, 1);
    };

    $scope.submit = function(ngFormCtrl){
      switch (ngFormCtrl.$name){
        case 'detailForm':
          submitDetailForm();
          break;
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