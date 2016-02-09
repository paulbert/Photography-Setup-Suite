(function() {
	angular.module('listMod',[])
	.directive('listOfItems',function() {
		return {
			scope: {
				search:'=',
				itemsToChange:'=items',
				messageNum:'=?message',
				listNum:'=list',
				keyName:'@key',
				hideOverlay:'=?hide',
				editType:'=?adv'
			},
			template: '<div ng-include="tempUrl"></div>',
			controller:'listController',
			controllerAs:'list',
			link: function(scope,element,attrs) {
				scope.tempUrl = '/templates/edit/' + attrs.temp;
			}
		}
	})
	;
})();