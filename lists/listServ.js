(function() {
	angular.module('photoSuite')
	.service('listFunctions', ['$q','getPhotoData',function ($q,getPhotoData) {
		
		var lFunc = this,
			editList = [],
			currentFilteredList = [];
		
		this.Lists = {};
		this.sectionList = [{section:'',id:0}];
		
		this.setList = function(listArray,listName,excludeArray) {
			this.Lists[listName] = { main:listArray,selected:[],edit:[],filtered:[],exclude:excludeArray };
		};
		
		this.clearSelected = function(listName) {
			this.Lists[listName].selected = [];
		};
		
		this.checkSelected = function(listName) {
			return this.Lists[listName].selected.length === 0;
		};
		
		this.mainListLength = function(listName) {
			if(this.Lists[listName]) {
				return this.Lists[listName].main.length;
			} else {
				return 0;
			}
		};
		
		// First checks exclude array for item, then checks search value (see filterService.js)
		this.filterCheck = function(value,index,search,keyName,listName) {
			var listCheck = false;
			listCheck = lFunc.findById(value[keyName],lFunc.Lists[listName].exclude,keyName);
			if(listCheck === false) {
				var showItem = filterFunctions.filterCheck(value,search);
				// Deselect item if the filter excludes the item
				if(value.selected && !showItem && index >= 0) {
					lFunc.deselectItem(value[keyName],index,keyName,listName);
				}
			} else {
				showItem = false;
			}
			lFunc.setFiltered(listName,index,showItem);
			return showItem;
		};
		
		// Adds property with filter status of element
		this.setFiltered = function(listName,index,show) {
			this.Lists[listName].main[index].showItem = show;
		};
		
		// Creates a list of only the currently filtered elements of the main array. Returns this filtered array.
		this.setFilterArray = function(listName) {
			var mainArray = this.Lists[listName].main;
			for(var i = 0; i < mainArray; i++) {
				if(mainArray[i].showItem === true) {
					this.Lists[listName].filtered.push(mainArray[i]);
				}
			}
			return this.Lists[listName].filtered
		};
		
		this.toggleSelect = function(item,index,key,listName) {
			key = key ? key : 'id';
			var id = item[key];
			if(!index && index !== 0) {
				index = this.findById(id,this.Lists[listName].main,key);
			}
			if(!item.selected) {
				this.selectItem(item,index,key,listName);
			} else {
				this.deselectItem(id,index,key,listName);
			}
		};

		// Function to create a comma separated list of a particular property within an array 
		this.makeList = function(photoArray,keyName) {
			var message = '';
			for(var i = 0; i < photoArray.length; i++) {
				message += photoArray[i][keyName];
				if(i < photoArray.length - 1) {
					message += ', ';
				}
			}
			return message;
		};

		// Returns the index of the photo within the array or false if not found.  Search by id.
		this.findById = function(id,array,key) {
			key = typeof key !== 'undefined' ? key : 'id';
			for(var i = 0; i < array.length; i++) {
				if(String(array[i][key]) === String(id)) {
					return i;
				}			
			}
			return false;
		};
		
		// Deletes items found in delArray from mainList searching by id. Returns new array.
		this.deleteById = function(delArray,idName,listName) {
			var numItems = delArray.length;
			for(var i = 0; i < numItems; i++) {
				var imgIndex = lFunc.findById(delArray[i][idName],lFunc.Lists[listName].main,idName);
				lFunc.Lists[listName].main.splice(imgIndex,1);
			}
		};
		
		// Selects all items within the current filter set
		this.selectAll = function(key,listName) {
			key = typeof key !== 'undefined' ? key : 'id';
			var filteredItems = this.setFilterArray(listName);
			var numItems = filteredItems.length;
			for(var i = 0; i < numItems; i++) {
				if(!filteredItems[i].selected) {
					lFunc.selectItem(filteredItems[i],undefined,key,listName);
				}
			}
		};
		
		// Deselects all items
		this.deselectAll = function(key,listName) {
			key = typeof key !== 'undefined' ? key : 'id';
			var numPhotos = this.Lists[listName].main.length;
			if(!this.checkSelected(listName)) {
				for(var i = 0; i < numPhotos; i++) {
					var item = this.Lists[listName].main[i];
					if(item.selected) {
						this.deselectItem(item.id,i,key,listName);
					}
				}
			}
		};
		
		this.deselectItem = function(id,index,key,listName) {
			key = typeof key !== 'undefined' ? key : 'id';
			lFunc.Lists[listName].main[index].selected = false;
			var selIndex = lFunc.findById(id,lFunc.Lists[listName].selected,key);
			lFunc.Lists[listName].selected.splice(selIndex,1);
		};

		this.selectItem = function(item,index,key,listName) {
			key = typeof key !== 'undefined' ? key : 'id';
			if(!index) {
				index = this.findById(item[key],this.Lists[listName].main,key);
			}
			this.Lists[listName].main[index].selected = true;
			this.Lists[listName].selected.push(item);
		};
				
		this.setEditList = function(eList,listName) {
			this.Lists[listName].edit = eList;
		};

		this.getEditList = function(listName) {
			return this.Lists[listName].edit;
		};
		
		this.getFilteredList = function(listName) {
			return this.Lists[listName].filtered;
		};
		
		this.setSectionList = function(sList) {
			this.sectionList = sList;
		};
		
		// Sorts by the order column of the data (as specified by ordKey).  Direction is 1 for ascending and -1 for descending.
		var ordSort = function(ordKey,direction) {
			return function(a,b) {
				return direction * (a[ordKey] - b[ordKey]);
			}
		};
		
		// After items are moved in list, sets the order value (named ordKey) to the correct number for the DB.  Also adds order and section to the selected list.
		var resetOrder = function(key,ordKey,listName,section) {
			var selIndex = 0;
			for(i = 0; i < lFunc.Lists[listName].main.length; i++) {
				lFunc.Lists[listName].main[i][ordKey] = i;
				if(lFunc.Lists[listName].main.selected) {
					selIndex = lFunc.findById(lFunc.Lists[listName].main[i][key],lFunc.Lists[listName].selected,key);
					lFunc.Lists[listName].selected[selIndex][ordKey] = i;
					if(typeof section !== 'undefined') {
						lFunc.Lists[listName].selected[selIndex].section = section;
					}
				}
			}
		};
		
		// Adds the selected items to a section and reorders items to group those together.
		this.groupSelected = function(key,ordKey,section,listName) {
			var listTemp = lFunc.Lists[listName].main,
				firstIndex = -1,
				moveIndex = 0,
				selIndex;
			for(var i = 0; i < listTemp.length; i++) {
				if(listTemp[i].selected || llistTemp[i].section === section) {
					if(firstIndex = -1) {
						firstIndex = i;
						listTemp[i].section = section;
					} else {
						moveIndex = i;
						listTemp[moveIndex].section = section;
						listTemp.splice(firstIndex+1,0,listTemp.splice(moveIndex,1)[0]);
					}
				}
			}
			lFunc.Lists[listName].main = listTemp;
			resetOrder(key,ordKey,listNum,section);
		};
		
		// Removes section from selected photos.
		this.removeSection = function(key,listNum) {
			var index;
			for(var i = 0; i < lFunc.selectedList[listNum].length; i++) {
				index = lFunc.findById(lFunc.selectedList[listNum][i][key],lFunc.mainList[listNum],key);
				lFunc.mainList[listNum][index].section = '';
			}
		};
		
		// Moves an item or items.  Checks the sections of the items to ensure items within same section stick together.
		this.moveItems = function(direction,key,ordKey,listNum) {
			var selSection,
				listLen = lFunc.mainList[listNum].length,
				multiplier,
				nextSection;
			var i = direction > 0 ? listLen - 1 : 0;
			for(i; i < listLen && i >= 0; i = i - direction) {
				multiplier = 1;
				if(lFunc.findById(lFunc.mainList[listNum][i][key],lFunc.selectedList[listNum],key) !== false || lFunc.mainList[listNum][i].section === selSection) {
					if(lFunc.mainList[listNum][i].section !== '') {
						selSection = lFunc.mainList[listNum][i].section;
					}
					if(i+direction >= 0 && i+direction < listLen && !lFunc.mainList[listNum][i+direction].selected) {
						if(lFunc.mainList[listNum][i+direction].section !== '' && lFunc.mainList[listNum][i].section !== lFunc.mainList[listNum][i+direction].section) {
							nextSection = lFunc.mainList[listNum][i+direction].section;
							multiplier = 0;
							for(var j = i + direction; j < listLen && j >= 0; j = j + direction) {
								if(lFunc.mainList[listNum][j].section === nextSection) {
									if(lFunc.mainList[listNum][j].selected) {
										multiplier = 0;
										break;
									}
									multiplier++;
								} else {
									break;
								}
							}
						}
						if(lFunc.mainList[listNum][i].selected || lFunc.mainList[listNum][i+direction].section !== lFunc.mainList[listNum][i].section) {
							lFunc.mainList[listNum].splice(i+(direction*multiplier),0,lFunc.mainList[listNum].splice(i,1)[0]);
						}
					}
				}
			}
			resetOrder(key,ordKey,listNum);
		};
		
		this.updateLists = function(table,idName,listNum) {
			var index,
				deferred = $q.defer(),
				listLen = editList.length > currentFilteredList ? editList.length : currentFilteredList.length;
				
			getPhotoData[table](true).then(function(response) {
				lFunc.mainList[listNum] = response.data;
				for(var i = 0; i < editList.length; i++) {
					index = lFunc.findById(editList[i][idName],lFunc.mainList[listNum],idName);
					editList[i] = lFunc.mainList[listNum][index];
				}
				for(var i = 0; i < currentFilteredList.length; i++) {
					index = lFunc.findById(currentFilteredList[i][idName],lFunc.mainList[listNum],idName);
					currentFilteredList[i] = lFunc.mainList[listNum][index];
				}
				deferred.resolve();
			});
			
			return deferred.promise;
			
		};
		
	}]);
})