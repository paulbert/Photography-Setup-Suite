(function() {
	angular.module('listMod',[])
	.controller('listController',['$scope','$rootScope','$timeout','openTabs','listFunctions','filterFunctions','doOverlayActions','getPhotoData',function($scope,$rootScope,$timeout,openTabs,listFunctions,filterFunctions,doOverlayActions,getPhotoData) {
		
		var lCtrl = this;
		
		// Sets selectedList as empty array for this list number.
		listFunctions.clearSelected($scope.listNum);
		this.hideOverlay = true;
		
		this.List = listFunctions;
		this.newSection = '';
		this.currentSection = {section:'',id:0};
		this.orderSavePending = false;
		
		this.toggleSelect = function(item,index,key,listNum) {
			listFunctions.toggleSelect(item,index,key,listNum);		
		};
		
		this.setLower = function(newLower) {
			openTabs.setLower(newLower);
		};
		
		// See editFilters.js for next two functions
		this.filterCheck = function(value,index,array) {
			return listFunctions.filterCheck(value,index,$scope.search,$scope.keyName,$scope.listName);
		};
		
		// Function that returns a filtered array from the main List based on current filters			
		var filterAllItems = function() {
			var thePhotos = lCtrl.List.mainList[$scope.listNum];
			var filteredPhotos = [];
			for(var i = 0; i < thePhotos.length; i++) {
				if(lCtrl.filterCheck(thePhotos[i])) {
					thePhotos[i].index = i;
					filteredPhotos.push(thePhotos[i]);
				}
			}
			return filteredPhotos;
		};
		
		// Returns the length of the main list.
		this.getLength = function(listNum) {
			return listFunctions.mainList[listNum].length;
		};
		
		// Toggles the confirmation message for editing (deleting or updating) a photo.
		this.toggleMessage = function(type,listNum,photo) {	
			if(photo) {
				$scope.itemsToChange.pending = [photo];
			} else {
				$scope.itemsToChange.pending = listFunctions.selectedList[listNum];
			}
			if($scope.itemsToChange.pending.length > 0) {
				$scope.messageNum = type;
			}
		};
		
		this.editItems = function(listNum,item) {
			if(item) {
				listFunctions.setEditList(new Array(item),filterAllItems());
				openTabs.setLower(2);
			} else {
				if(!listFunctions.checkSelected($scope.listNum)) {
					listFunctions.setEditList(listFunctions.selectedList[listNum],filterAllItems());
					openTabs.setLower(2);
				}
			}
			listFunctions.clearSelected($scope.listNum);
		};
		
		this.addToSections = function() {
			if(this.newSection !== '') {
				this.List.sectionList.push({section:this.newSection,id:this.List.sectionList.length});
			}
		};
		
		this.linkSection = function(key,ordKey) {
			var theSection = this.currentSection.section;
			if(theSection !== '' && !listFunctions.checkSelected($scope.listNum)) {
				listFunctions.groupSelected(key,ordKey,theSection,$scope.listNum);
			} else if(!listFunctions.checkSelected($scope.listNum)) {
				listFunctions.removeSection(key,$scope.listNum);
			}
			doOverlayActions.galleryOrderAndSection(listFunctions.mainList[$scope.listNum]);
		};
		
		this.moveItems = function(direction,key,ordKey) {
			listFunctions.moveItems(direction,key,ordKey,$scope.listNum);
			this.orderSavePending = true;
			$rootScope.$broadcast('masonry.reload');
		};
		
		// Should not be in module
		this.saveListOrder = function() {
			if(this.orderSavePending) {
				doOverlayActions.galleryOrderAndSection(listFunctions.mainList[$scope.listNum]);
				this.orderSavePending = false;
			}
		};
		
		this.resetOrder = function(ordKey) {
			var newList = [],
				index,
				oldList = lCtrl.List.mainList[$scope.listNum];
			
			for(var i = 0; i < oldList.length; i++) {
				index = listFunctions.findById(i,oldList,ordKey);
				newList.push(oldList[i]);
			}
			
			listFunctions.setMainList(newList,$scope.listNum);
			
		};
		
		// Should not be in module
		this.togglePhotoOverlay = function() {
			this.hideOverlay = !this.hideOverlay;
			if(typeof lCtrl.List.mainList[2] === 'undefined') {
				getPhotoData.photos('all').then(function(response) {
					listFunctions.setMainList(response.data,2);
				});
			}
		};
		
		// Should not be in module
		this.closePhotoOverlay = function() {
			$scope.hideOverlay = true;
		};
		
		this.addPhotosToGallery = function() {
			var delCheck,
				addPhotos = lCtrl.List.selectedList[$scope.listNum];
			if(addPhotos.length > 0) {	
				for(var i = 0; i < addPhotos.length; i++) {
					delCheck = listFunctions.findById(addPhotos[i][$scope.keyName],$scope.itemsToChange.joinDelete,$scope.keyName);
					if(delCheck === false) {
						$scope.itemsToChange.joinInsert.push(addPhotos[i]);
					} else {
						$scope.itemsToChange.joinDelete.splice(delCheck,1);
					}
					addPhotos[i].selected = false;
					lCtrl.List.mainList[1].push(addPhotos[i]);
				}
				lCtrl.closePhotoOverlay();
				lCtrl.deselectAll($scope.keyName);
				listFunctions.clearSelected(2);
			}
		};
		
		this.removePhotosFromGallery = function() {
			var insCheck,
				remPhotos = lCtrl.List.selectedList[$scope.listNum],
				index;
				
			for(var i = 0; i < remPhotos.length; i++) {
				insCheck = listFunctions.findById(remPhotos[i][$scope.keyName],$scope.itemsToChange.joinInsert,$scope.keyName);
				if(insCheck === false) {
					$scope.itemsToChange.joinDelete.push(remPhotos[i]);
				} else {
					$scope.itemsToChange.joinInsert.splice(insCheck,1);
				}
				remPhotos[i].selected = false;
				index = listFunctions.findById(remPhotos[i][$scope.keyName],lCtrl.List.mainList[1],$scope.keyName)
				lCtrl.List.mainList[1].splice(index,1);
			}
			listFunctions.clearSelected(1);
		};
		
	}])
	
	;
})();