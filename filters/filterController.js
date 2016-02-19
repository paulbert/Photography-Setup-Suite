(function() {
	
	angular.module('filterMod')
	.controller('filterBarController', ['$scope','getPhotoData', function($scope,getPhotoData) {
			
			this.galleries = [];
			
			// Toggles the position of the left side filter column
			this.filterToggle = function() {
				var fPos = $scope.fposition;
				$scope.fposition = (fPos === 0 ? -190 : 0);
			};
			
			var fCtrl = this;
			
		}])
	;
})();