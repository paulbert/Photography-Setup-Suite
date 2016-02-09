(function() {
	
	angular.module('bruceEdit')
	.directive('overlay', function() {
		return {
			scope: {
				itemsToChange:'=items',
				messageNum:'=message',
				keyName:'@key',
				tableName:'@table',
				editVars:'=?evars',
				action:'@',
				listNum:'=list',
				idName:'@?id'
			},
			templateUrl: '/templates/edit/overlay.html',
			controller:'overlayController',
			controllerAs:'over'
		}
	})
	;
})();