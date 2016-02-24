(function() {
	
	angular.module('filterMod')
	.directive('filterQuery', function() {
			return {
				scope: {
					search:'=',
					base:'='
				},
				template: '<div ng-include="templateUrl"></div>',
				link: function(scope,element,attrs) {
					scope.templateUrl = scope.base + 'filterQuery.html';
				}
			}
		})
	;
})();