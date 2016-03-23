(function() {
	
	angular.module('overlayMod')
		.controller('overlayController', ['$scope','listFunctions', function($scope,listFunctions) {
			
			this.cancelAction = function() {
				$scope.messageNum = 0;
			};
			
		}])
})();