(function() {
	
	angular.module('overlayMod')
		.controller('overlayController', ['$scope',function($scope) {
			
			this.cancelAction = function() {
				$scope.messageNum = 0;
			};
			
		}])
})();