(function() {
	
	angular.module('filterMod')
	.directive('filterComponent', function() {
			return {
				scope: {
					items:'=',
					search:'=',
					heading:'@'
				},
				templateUrl: '/templates/edit/filtercomp.html',
				controller:'filterCompController',
				controllerAs:'fcomp'
			}
		})
	;
})();