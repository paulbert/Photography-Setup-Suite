(function() {
	
	angular.module('filterMod')
	.directive('filterCheckbox', function() {
			return {
				scope: {
					items:'=',
					search:'='
				},
				templateUrl: '/filters/components/filterCheckboxes.html',
				controller:'filterCompController',
				controllerAs:'fcomp',
			}
		})
	;
})();