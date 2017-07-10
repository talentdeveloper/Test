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
angular.module('admin.properties.detail').controller('PropertiesDetailCtrl', ['$scope', '$route', '$location', 'utility', 'adminResource', 'propertyDetails',
  function($scope, $route, $location, utility, adminResource, propertyDetails) {
    // local vars
    //var property = propertyDetails.property;
	
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
		if(paramARV == '') {
			paramARV = 0;
		}
		if(paramRepairs == '') {
			paramRepairs = 0;
		}
		if(paramAmount == '') {
			paramAmount = 0;
		}
		var value1 = 0.65 * paramARV;
		var value2 = value1 - paramRepairs;
		if(value2 > paramAmount) {
			return true;
		} else {
			return false;
		}
	};
	
    var user = propertyDetails.user;
    console.log(propertyDetails.propertyAddress);
    console.log(user);
    var submitDetailForm = function(){
      $scope.alerts.detail = [];
      $scope.alerts.detail.push({
            type: 'success',
            msg: 'Changes have been updated.'
          });
      console.log($scope.propertyDetail);
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
      residentialUnit: propertyDetails.residentialUnit,
      residentialContent: propertyDetails.residentialContent,
      residentialOther: propertyDetails.residentialOther,
      commercialContent: propertyDetails.commercialContent,
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
      propertyCalculate: propertyDetails.propertyCalculate
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