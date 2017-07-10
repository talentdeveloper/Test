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
angular.module('account.properties.edit').controller('AccountPropertyEditCtrl', ['$scope', '$route', '$location', 'utility', 'accountResource', 'propertyDetail',
  function($scope, $route, $location, utility, accountResource, propertyDetail) {
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
	
    var user = propertyDetail.user;
    console.log(propertyDetail.propertyAddress);
    console.log(user);
    var submitDetailForm = function(){
      $scope.alerts.detail = [];
      $scope.alerts.detail.push({
            type: 'success',
            msg: 'Changes have been updated.'
          });
      console.log($scope.propertyDetail);
      adminResource.updateProperty(propertyDetail._id, $scope.propertyDetail).then(function(result){
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
      propertyType: propertyDetail.propertyType,
      residentialUnit: propertyDetail.residentialUnit,
      residentialContent: propertyDetail.residentialContent,
      residentialOther: propertyDetail.residentialOther,
      commercialContent: propertyDetail.commercialContent,
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
      propertyCalculate: propertyDetail.propertyCalculate
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