(function() {
	angular.module('photoSuite')
	.directive('checkBoxWHalf', function() {
		return {
			scope: {
				notAll: '=inc',
				change: '='
			},
			link: function(scope,element,attrs) {
				
				scope.$watch('notAll', function() {
					if(scope.notAll) {
						element.prop("indeterminate", true);
					}
				});
				
				element.bind('click', function() {
					element.prop("indeterminate", false);
					if(!scope.change) {
						scope.change = true;
						scope.$apply();
					}
				});
			}
		}
	})
	;
})();