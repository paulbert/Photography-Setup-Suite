(function() {
	
	angular.module('overlayMod',[])
	.directive('overlay', function() {
		return {
			scope: {
				messages:'=',
				messageNum:'=number',
				btnConfig:'=cfg',
				// Function for action of overlay (cancel/back is in controller)
				doFunction:'=func'
			},
			templateUrl: '/templates/edit/overlay.html',
			controller:'overlayController',
			controllerAs:'over'
		}
	})
	;
})();