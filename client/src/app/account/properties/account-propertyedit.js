angular.module('account.properties.edit', ['config', 'security.service', 'security.authorization', 'services.accountResource', 'services.utility','ui.bootstrap', 'directives.serverError']);
angular.module('account.properties.edit').config(['$routeProvider', 'securityAuthorizationProvider', function($routeProvider){
  $routeProvider
    .when('/account/propertyedit/:id', {
      templateUrl: 'account/properties/account-propertyedit.tpl.html',
      controller: 'AccountPropertyEditCtrl',
      title: 'Account Property Edit',
      resolve: {
        propertyDetail: ['$q', '$route', '$location', 'securityAuthorization', 'accountResource' ,function($q, $route, $location, securityAuthorization, accountResource){
          //get account details only for verified-user, otherwise redirect to /account/verification
          var redirectUrl;
          var promise = securityAuthorization.requireVerifiedUser()
            .then(function(){
              var id = $route.current.params.id || '';
              if(id){
                return accountResource.getAccountProperty(id);
              }
              else{
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

angular.module('account.properties.edit').directive('fileModels', ['$parse', function($parse) {
	return {
		restrict: 'A',
		scope : {
			filesToUpload : '='
		},
		link: function(scope, element, attrs) {
			var parsedFile = $parse(attrs.fileModels);
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
angular.module('account.properties.edit').directive('fileDropzones', function() {
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
angular.module('account.properties.edit').controller('AccountPropertyEditCtrl', ['$scope', '$route', '$location', 'utility', 'accountResource', 'propertyDetail', '$timeout',
  function($scope, $route, $location, utility, restResource, propertyDetail, $timeout) {
	/*var img = [];
	if($scope.files == undefined) {
		for(var i = 0; i < propertyDetail.photoURL.length; i++) {
			var tempid = propertyDetail.photoURL[i].split('_')[0];
			var tempname = propertyDetail.photoURL[i].split(tempid + '_')[1];
			var obj = {
				preview: propertyDetail.photoURL[i],
				name: tempname
			}
			img[i] = obj;
		}
		$scope.files = img;
	}*/
	var isEnterAddress = 0;
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
    // local vars
    //var property = propertyDetails.property;
	restResource.getAccountDetails().then(function(result){
		if (result.user.isCompletedProfile == 'no'){
		     // $location.path('/account/settings');
		}
	});
	$scope.propertyDetail = {};
	$scope.address = JSON.stringify(propertyDetail.propertyAddress);
	// Address automatic Complete
	$scope.$on('gmPlacesAutocomplete::placeChanged', function(){
		isEnterAddress = 1;
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
	    $scope.$apply();
	});
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
	
   	var propertyURL = '';
    var submitPhotoForm = function() {
        $scope.uploading = true;
        restResource.propertyUpload($scope.files).then(function(data) {
          if (data.data.success) {
            $scope.uploading = false;
            $scope.alert = 'alert alert-success';
            $scope.message = data.data.message;
            $scope.file = {};
            propertyURL = data.data.photoURL;
            var tempURL = {
        		photoURL: propertyURL
        	};
            restResource.updateProperty(propertyDetail._id, tempURL).then(function(result){
	        	if(result.success){
    	    	}else{
          
    	    	}
  		    }, function(x){
    		});
          } else {
            $scope.uploading = false;
            $scope.alert = 'alert alert-danger';
            $scope.message = data.data.message;
            $scope.file = {};
          }
        });

        restResource.propertyUploadDist($scope.files).then(function(data) {
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
    var user = propertyDetail.user;
    var submitDetailForm = function(){
      $scope.alerts.detail = [];
      $scope.propertyDetail.sumPoint = $scope.sumPoint();
      $scope.propertyDetail.photoURL = propertyURL;
      $scope.alerts.detail.push({
            type: 'success',
            msg: 'Changes have been updated.'
          });
      if(isEnterAddress == 0) {
    	  $scope.propertyDetail.propertyAddress = propertyDetail.propertyAddress;
      }
      restResource.updateProperty(propertyDetail._id, $scope.propertyDetail).then(function(result){
        document.body.scrollTop = document.documentElement.scrollTop = 0;
        if(result.success){
        }else{
          
        }
      }, function(x){
      });
    };
    //model def
    $scope.errfor = {}; //for identity server-side validation
    $scope.alerts = {
      detail: [], identity: [], pass: []
    };
    $scope.propertyDetail = {
      propertyType: propertyDetail.propertyType,
      multiFamilyUnit: propertyDetail.multiFamilyUnit,
      commercialContent: propertyDetail.commercialContent,
      commercialComplex: propertyDetail.commercialComplex,
      commercialOther: propertyDetail.commercialOther,
      landBuild: propertyDetail.landBuild,
      submittedOn: propertyDetail.submittedOn,
      propertyAddress: propertyDetail.propertyAddress,
      propertyCity: propertyDetail.propertyCity,
      propertyState: propertyDetail.propertyState,
      propertyZip: propertyDetail.propertyZip,
      propertyCounty: propertyDetail.propertyCounty,
      ownerFirstName: propertyDetail.ownerFirstName,
      ownerLastName: propertyDetail.ownerLastName,
      ownerPhone: propertyDetail.ownerPhone,
      ownerCell: propertyDetail.ownerCell,
      ownerEmail: propertyDetail.ownerEmail,
      beds: propertyDetail.beds,
      baths: propertyDetail.baths,
      askingPrice: propertyDetail.askingPrice,
      propertyPrice: propertyDetail.propertyPrice,
      modifyPrice: propertyDetail.modifyPrice,
      repairs: propertyDetail.repairs,
      Roof: propertyDetail.Roof,
      Kitchen: propertyDetail.Kitchen,
      Bath: propertyDetail.Bath,
      Paint: propertyDetail.Paint,
      Carpet: propertyDetail.Carpet,
      Windows: propertyDetail.Windows,
      Furnance: propertyDetail.Furnance,
      Drywall: propertyDetail.Drywall,
      Plumbing: propertyDetail.Plumbing,
      Electrical: propertyDetail.Electrical,
      repairs: propertyDetail.repairs,
      otherRepairDetail: propertyDetail.otherRepairDetail,
      occupancy: propertyDetail.occupancy,  
      listedOnMLS: propertyDetail.listedOnMLS,
      propertyOnMLS: propertyDetail.propertyOnMLS,
      propertyDetail: propertyDetail.propertyDetail,
      taxRecordLink: propertyDetail.taxRecordLink,
      zillowLink: propertyDetail.zillowLink,
      offerAmountAccepted: propertyDetail.offerAmountAccepted,    
      approxARV: propertyDetail.approxARV,
      status: propertyDetail.status,
      selectCalculate: propertyDetail.selectCalculate,
      propertyCalculate: propertyDetail.propertyCalculate,
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