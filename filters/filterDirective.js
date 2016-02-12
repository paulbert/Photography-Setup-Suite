(function() {
	
	angular.module('filterMod',[])
	.directive('filterBar', function() {
		return {
			scope: {
				search:'=',
				fposition:'=?',
				inline:'@?'
			},
			templateUrl: '/templates/edit/filterbar.html',
			controller:'filterBarController',
			controllerAs:'fbar'
		}
	})
	;
		
})();