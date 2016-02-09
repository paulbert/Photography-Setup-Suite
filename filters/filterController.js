(function() {
	
	angular.module('bruceEdit')
	.controller('filterBarController', ['$scope','getPhotoData', function($scope,getPhotoData) {
			
			this.galleries = [];
			
			// Toggles the position of the left side filter column
			this.filterToggle = function() {
				var fPos = $scope.fposition;
				$scope.fposition = (fPos === 0 ? -190 : 0);
			};
			
			var fCtrl = this;
			
			// Function to get gallery information
			var getGalleries = function() {
				getPhotoData.galleries(true).then(function(response) {
					var allGalleries = response.data;
					for(var i = 0; i < allGalleries.length; i++) {
						$scope.search.galName.checkboxes[i] = allGalleries[i].galName;
						fCtrl.galleries.push(allGalleries[i].galName);
					}
				});
			};
			
			if($scope.search.galName && $scope.search.galName.checkboxes) {
				getGalleries();
			}
			
		}])
	;
})();