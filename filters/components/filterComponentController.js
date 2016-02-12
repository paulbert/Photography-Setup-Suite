(function() {
	
	angular.module('filterMod')
	.controller('filterCompController', ['$scope','filterFunctions', function($scope,filterFunctions) {
		this.onlyBox = function(boxNum,boxName) {
			var i = 0;
			do {
				$scope.search.checkboxes[i] = false;					
				i++;
			} while(typeof $scope.search.checkboxes[i] !== 'undefined')
			if(boxNum === 'none') {
				$scope.search.checkboxes['none'] = true;
			} else {
				$scope.search.checkboxes[boxNum] = boxName;
				$scope.search.checkboxes['none'] = false;
			}
		};
		
		this.allBoxes = function () {
			for(var i = 0; i < $scope.items.length; i++) {
				$scope.search.checkboxes[i] = $scope.items[i];
			}
			$scope.search.checkboxes['none'] = true;
		};
		
		this.showCheckbox = function (value,query) {
			return filterFunctions.queryFilterCheck(value,query);
		};
	}])
	;
})();