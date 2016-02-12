(function() {
	angular.module('listMod')
	.controller('listController',['$scope','$rootScope','$timeout','openTabs','listFunctions','filterFunctions','doOverlayActions','getPhotoData',function($scope,$rootScope,$timeout,openTabs,listFunctions,filterFunctions,doOverlayActions,getPhotoData) {
		
		var lCtrl = this,
			key = $scope.keyName,
			listName = $scope.listName;
		
		// Sets selectedList as empty array for this list number.
		listFunctions.clearSelected(listName);
		this.hideOverlay = true;
		
		this.List = listFunctions;
		this.newSection = '';
		this.currentSection = {section:'',id:0};
		this.orderSavePending = false;
		
		// Toggle selection of item - changes select property of item between true/false and adds/removes from selection array (see listServ.js for function)
		this.toggleSelect = function(item,index) {
			listFunctions.toggleSelect(item,index,key,listName);		
		};
		
		// Custom filter function checking item first against a list of exclusions then against custom filter values
		this.filterCheck = function(value,index,array) {
			return listFunctions.filterCheck(value,index,$scope.search,keyName,listName);
		};
		
		// Returns the length of the main list.
		this.getLength = function(listName) {
			return listFunctions.mainList[listName].length;
		};
		
		this.addToSections = function() {
			if(this.newSection !== '') {
				this.List.sectionList.push({section:this.newSection,id:this.List.sectionList.length});
			}
		};
		
		this.linkSection = function(key,ordKey) {
			var theSection = this.currentSection.section;
			if(theSection !== '' && !listFunctions.checkSelected($scope.listName)) {
				listFunctions.groupSelected(key,ordKey,theSection,$scope.listName);
			} else if(!listFunctions.checkSelected($scope.listName)) {
				listFunctions.removeSection(key,$scope.listName);
			}
			doOverlayActions.galleryOrderAndSection(listFunctions.mainList[$scope.listName]);
		};
		
		// Change order of list.
		this.moveItems = function(direction,key) {
			listFunctions.moveItems(direction,key,ordKey,listName);
			this.orderSavePending = true;
		};
		
	}])
	
	;
})();