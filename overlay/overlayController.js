(function() {
	
	angular.module('bruceEdit')
		.controller('overlayController', ['$scope','listFunctions','doOverlayActions','openTabs', function($scope,listFunctions,doOverlayActions,openTabs) {
			
			var oCtrl = this;
			
			var pendingList = listFunctions.makeList($scope.itemsToChange.pending,$scope.keyName);
			var successList = listFunctions.makeList($scope.itemsToChange.success,$scope.keyName);
			
			this.message = '';
			
			this.btnConfig = [
				{},
				{doBtn: {style:'btn-danger',text:'Delete'},cancelBtn: {style:'',text:'Cancel'},backBtn: {style:'hidden',text:''}},
				{doBtn: {style:'hidden',text:''},cancelBtn: {style:'',text:'OK'},backBtn: {style:'hidden',text:''}},
				{doBtn: {style:'btn-danger',text:'Delete'},cancelBtn: {style:'',text:'Cancel'},backBtn: {style:'hidden',text:''}},
				{doBtn: {style:'hidden',text:''},cancelBtn: {style:'hidden',text:''},backBtn: {style:'hidden',text:''}},
				{doBtn: {style:'hidden',text:''},cancelBtn: {style:'',text:'OK'},backBtn: {style:'',text:'Back to list'}},
				{doBtn: {style:'',text:'Try again'},cancelBtn: {style:'hidden',text:''},backBtn: {style:'',text:'Back to list'}}
			];
			
			$scope.$watch('messageNum', function() {
				pendingList = listFunctions.makeList($scope.itemsToChange.pending,$scope.keyName);
				successList = listFunctions.makeList($scope.itemsToChange.success,$scope.keyName);
				oCtrl.message = constructMessage($scope.messageNum,pendingList,successList);
			});
			
			var constructMessage = function(mesNum,pList,sList) {
				switch(mesNum) {
					case 1:
						return 'Are you sure you want to delete <strong>' + pList + '</strong> from the server?';
						break;
					case 2:
						return '<strong>' + sList + '</strong> successfully deleted.';
						break;
					case 3:
						var secondMessage = sList === '' ? '' : ' <strong>' + sList + '</strong> successfully deleted.'
						return 'There was an error deleting <strong>' + pList + '</strong>. Press delete to try again.' + secondMessage;
						break;
					case 4:
						return 'Working on it...';
						break;
					case 5:
						return '<strong>' + sList + '</strong> successfully edited.';
						break;
					case 6:
						var secondMessage = sList === '' ? '' : ' <strong>' + sList + '</strong> successfully edited.'
						return 'There was an error editing <strong>' + pList + '</strong>. Try to edit ' + pList + ' again? ' + secondMessage;
						break;
				}
			};
			
			this.cancelAction = function() {
				$scope.itemsToChange.success = [];
				if($scope.messageNum !== 5) {
					$scope.itemsToChange.pending = [];
				}
				$scope.messageNum = 0;
			};
			
			this.backToList = function() {
				openTabs.setLower(0);
			};
			
			this.doAction = {
				deleteItem: function() {
					var idName = $scope.idName ? $scope.idName : 'id';
					doOverlayActions.deleteItems($scope.itemsToChange.pending,$scope.tableName,idName,'id').then(function(response) {
						$scope.itemsToChange = response;
						if(response.pending.length > 0) {
							$scope.messageNum = 3;
						} else {
							$scope.messageNum = 2;
							listFunctions.clearSelected($scope.listNum);
						}
						if(response.success.length > 0) {
							listFunctions.deleteById(response.success,idName,$scope.listNum);
							var joinId = $scope.tableName === 'photos' ? 'p_id' : ($scope.tableName === 'galleries' ? 'g_id' : 'ERROR');
							doOverlayActions.deleteItems(response.success,'pjoing',idName,joinId).then(function(response) {
								if(response.pending.length > 0) {
									console.log('The following ' + $scope.tableName + ' ids were not deleted from pjoing: ' + listFunctions.makeList(response.pending));
								}
							});
						}
						// CHANGE TO DELETE FILES AT FULL SAVE OF DATA ONLY
						if($scope.tableName === 'photos') {
							doOverlayActions.deletePhotos(response.success);
						}
					});
				},
				editItem: function() {
					var idName = $scope.idName ? $scope.idName : 'id';
					doOverlayActions.editItems($scope.itemsToChange.pending,$scope.tableName,$scope.editVars.editFields,idName,$scope.editVars.joinInsert,$scope.editVars.joinDelete,$scope.editVars.insert).then(function(response) {
						$scope.itemsToChange = response;
						if($scope.pending.length > 0) {
							$scope.messageNum = 6;
						} else {
							$scope.editVars = {
								editFields: {},
								joinInsert: [],
								joinDelete: []
							};
							$scope.messageNum = 5;
						}
					});
				}
			};
			
			this.backToList = function() {
				openTabs.setLower(0);
			};
			
		}])
})();