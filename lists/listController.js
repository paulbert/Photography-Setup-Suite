(function() {
	angular.module('listMod')
	.controller('listController',['$scope','$rootScope','listFunctions',function($scope,$rootScope,listFunctions) {
		
		var lCtrl = this,
			key = $scope.keyName,
			ordKey = $scope.ordKey,
			listName = $scope.listName;
		
		// Sets selectedList as empty array for this list number.
		listFunctions.clearSelected(listName);
		this.hideOverlay = true;
		
		this.lFunc = listFunctions;
		this.newSection = '';
		this.currentSection = '';
		
		// Toggle selection of item - changes select property of item between true/false and adds/removes from selection array (see listServ.js for function)
		// Optional selectOne: if true all items will be deselected first so only one item is selected at a time
		this.toggleSelect = function(item,index,selectOne) {
			listFunctions.toggleSelect(item,index,key,listName,selectOne);		
		};
		
		// Custom filter function checking item first against a list of exclusions then against custom filter values
		this.filterCheck = function(value,index,array) {
			return listFunctions.filterCheck(value,index,$scope.search,key,listName);
		};
		
		// Returns the length a list (main list if not specified).
		this.getLength = function(listName,subList) {
			if(!subList) {
				subList = 'main';
			}
			return listFunctions.Lists[listName][subList].length;
		};
		
		// Move selected items or one item if specified.
		this.moveItems = function(direction,item) {
			listFunctions.moveItems(direction,key,ordKey,listName,item && item[key]);
			listFunctions.setOrderSave(true);
		};
		
		this.checkSelected = function() {
			return listFunctions.checkSelected(listName);
		};
		
		this.selectAll = function() {
			listFunctions.selectAll(key,listName);
		};
		
		this.deselectAll = function() {
			listFunctions.deselectAll(key,listName);
		};
		
		this.linkSection = function(section) {
			listFunctions.groupSelected(key,ordKey,section,listName);
		};
		
		this.addToSections = function(section) {
			listFunctions.addToSections(section,listName);
		};
		
	}])
	
	;
})();