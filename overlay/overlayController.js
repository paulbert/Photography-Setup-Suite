(function() {
	
	angular.module('overlayMod')
		.controller('overlayController', ['$scope','listFunctions','doOverlayActions','openTabs', function($scope,listFunctions,doOverlayActions,openTabs) {
			
			this.cancelAction = function() {
				$scope.messageNum = 0;
			};
			
			this.backToList = function() {
				openTabs.setLower(0);
			};
			
		}])
})();