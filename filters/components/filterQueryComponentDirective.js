(function() {
	
	angular.module('filterMod')
	.directive('filterQuery', function() {
			return {
				scope: {
					search:'='
				},
				templateUrl: '/filters/components/filterQuery.html',
			}
		})
	;
})();