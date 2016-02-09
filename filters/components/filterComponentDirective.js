(function() {
	
	angular.module('bruceEdit')
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