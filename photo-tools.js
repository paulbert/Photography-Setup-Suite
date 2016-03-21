(function() {
	angular.module('photoEditComponents', ['listMod','filterMod','overlayMod']);
	
})();
(function() {
	
	/*
	Search variable should be an array of objects named the same as the properties of the objects within the list.
		Requires a 'query' property within object which is modeled to a text/input filter.
		If the searched property is an array of objects (if, for example, images can be in many gallery groupings), add 'isArray' property and set to true, also add 'searchOn' property and set to the name of the property within objects.
		Example: images = [ {imgname: 'img1.jpg', galleries: [ { id:1, name:'gallery1' }, { id:2, name:'gallery2'} ]}, ...]
		search = { galleries: { query:'', isArray: true, searchOn: 'name' } }
		For a checkbox filter, include an object called 'checkboxes' with a 'none' property and all possible values in 0-n property.
		Based on above example: search = { galleries: { ... checkboxes: { none: true, 0:'gallery1',1:'gallery2' } }
	*/
	
	angular.module('filterMod',[])
	.directive('filterBar', function() {
		return {
			scope: {
				search:'=',
				fposition:'=?',
				inline:'@?'
			},
			template: '<div ng-include="templateUrl"></div>',
			controller:'filterBarController',
			controllerAs:'fbar',
			link: function(scope,element,attrs) {
				scope.base = attrs.tmplt.base;
				scope.templateUrl = attrs.tmplt.base + attrs.tmplt.fileName;
			}
		}
	})
	;
		
})();
(function() {
	angular.module('listMod',[])
	.directive('listOfItems',function() {
		return {
			scope: {
				search:'=',
				listName:'=list',
				keyName:'@key',
				ordKey:'@ordName',
				// Additional functions to be called from buttons in the list (save info, delete, etc)
				addFuncs:'=funcs'
			},
			template: '<div ng-include="templateUrl"></div>',
			controller:'listController',
			controllerAs:'list',
			link: function(scope,element,attrs) {
				scope.templateUrl = attrs.tmplt.base + attrs.tmplt.fileName;
			}
		}
	})
	;
})();
(function() {
	
	angular.module('overlayMod',[])
	.directive('overlay', function() {
		return {
			scope: {
				message:'=',
				messageNum:'=number',
				btnConfig:'=cfg',
				// Function for action of overlay (cancel/back is in controller)
				doAction:'=func'
			},
			controller:'overlayController',
			controllerAs:'over',
			template: '<div ng-include="templateUrl"></div>',
			link: function(scope,element,attrs) {
				// If no base is specified, use location if installed via bower.
				if(typeof scope.base === 'undefined') {
					scope.base = '/bower_components/Photography-Setup-Suite/templates/overlay/';
				}
				scope.templateUrl = attrs.tmplt.base + 'overlay.html';
			}
		}
	})
	;
})();
(function() {
	
	angular.module('filterMod')
	.directive('filterCheckbox', function() {
			return {
				scope: {
					items:'=',
					search:'=',
					base:'='
				},
				controller:'filterCompController',
				controllerAs:'fcomp',
				template: '<div ng-include="templateUrl"></div>',
				link: function(scope,element,attrs) {
					// If no base is specified, use location if installed via bower.
					if(typeof scope.base === 'undefined') {
						scope.base = '/bower_components/Photography-Setup-Suite/templates/filters/';
					}
					scope.templateUrl = scope.base + 'filterCheckboxes.html';
				}
			}
		})
	;
})();
(function() {
	
	angular.module('filterMod')
	.directive('filterQuery', function() {
			return {
				scope: {
					search:'=',
					base:'?='
				},
				template: '<div ng-include="templateUrl"></div>',
				link: function(scope,element,attrs) {
					// If no base is specified, use location if installed via bower.
					if(typeof scope.base === 'undefined') {
						scope.base = '/bower_components/Photography-Setup-Suite/templates/filters/';
					}
					scope.templateUrl = scope.base + 'filterQuery.html';
				}
			}
		})
	;
})();
(function() {
	
	angular.module('filterMod')
	.controller('filterBarController', ['$scope','getPhotoData', function($scope,getPhotoData) {
			
			this.galleries = [];
			
			// Toggles the position of the left side filter column
			this.filterToggle = function() {
				var fPos = $scope.fposition;
				$scope.fposition = (fPos === 0 ? -190 : 0);
			};
			
			var fCtrl = this;
			
		}])
	;
})();
(function() {
	
	angular.module('filterMod')
	.service('filterFunctions', function() {
			
		var fFunctions = this;
		
		// Checks for a match with the filters.
		// If the value is an array, checks all values for one match.
		// If not, just checks single value.
		this.filterCheck = function(value,search) {
			var allMatch = true;
			
			for(var key in search) {
				if(search.hasOwnProperty(key)) {
					var thisValue = value[key];
					if(search[key].isArray) {
						var numValues = thisValue.length,
							matchFound = false;
						for(var i = 0; i < numValues; i++) {
							if(checkValue(thisValue[i], search, key)) {
								matchFound = true;
								break;
							}
						}
						if(!matchFound) {
							allMatch = false;
						}
					} else {
						allMatch = checkValue(thisValue, search, key);
					}
					if(allMatch === false) {
						break;
					}
				}
			}
			
			return allMatch;
			
		};
		
		// Function that checks value against the query filter & checkboxes
		var checkValue = function(value, search, key) {
			
			var checkMatch = true,
				valueMatch = false,
				checkboxes = search[key].checkboxes,
				searchOn = search[key].searchOn;
				
			if(searchOn && value) {
				var thisValue = value[searchOn];
			} else {
				var thisValue = value;
			}
			if(checkboxes) {
				checkMatch = checkTheBoxes(thisValue,key,checkboxes);
			}
			valueMatch = fFunctions.queryFilterCheck(thisValue,search[key].query);
			
			return checkMatch && valueMatch;
		};
		
		// Checks query value against actual.  Also used to hide/show checkboxes based on the typed filter.
		this.queryFilterCheck = function(value,query) {
			if(!value) {
				value = '';
			}
			return value.toLowerCase().indexOf(query.toLowerCase()) > -1;
		};
		
		// Function to loop through the checkboxes variable and return true if the value is a match
		var checkTheBoxes = function (value,filterset,checkboxes) {
			if(value) {
				var i = 0;
				do {
					if(value === checkboxes[i]) {
						return true;
					}
					i++;
				} while(typeof checkboxes[i] !== 'undefined')
				return false;
			} else {
				if(checkboxes['none']) {
					return true;
				}
				return false;
			}
		};
		
	})
	;
})();
(function() {
	
	angular.module('filterMod')
	.controller('filterCompController', ['$scope','filterFunctions', function($scope,filterFunctions) {
		this.onlyBox = function(boxNum,boxName) {
			var i = 0;
			do {
				$scope.search.checkboxes[i] = false;					
				i++;
			} while(typeof $scope.search.checkboxes[i] !== 'undefined')
			if(boxNum === 'none') {
				$scope.search.checkboxes['none'] = true;
			} else {
				$scope.search.checkboxes[boxNum] = boxName;
				$scope.search.checkboxes['none'] = false;
			}
		};
		
		this.allBoxes = function () {
			for(var i = 0; i < $scope.items.length; i++) {
				$scope.search.checkboxes[i] = $scope.items[i];
			}
			$scope.search.checkboxes['none'] = true;
		};
		
		this.showCheckbox = function (value,query) {
			return filterFunctions.queryFilterCheck(value,query);
		};
	}])
	;
})();
(function() {
	
	angular.module('overlayMod')
		.controller('overlayController', ['$scope','listFunctions','doOverlayActions','openTabs', function($scope,listFunctions,doOverlayActions,openTabs) {
			
			this.cancelAction = function() {
				$scope.messageNum = 0;
			};
			
			this.backToList = function() {
				openTabs.setLower(0);
			};
			
		}])
})();
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
		
		// Returns the length a list (main list if not specified).
		this.getLength = function(listName,subList) {
			if(!subList) {
				subList = 'main';
			}
			return listFunctions.Lists.[listName].length;
		};
		
		// Change order of list.
		this.moveItems = function(direction,key) {
			listFunctions.moveItems(direction,key,ordKey,listName);
			this.orderSavePending = true;
		};
		
	}])
	
	;
})();
(function() {
	angular.module('listMod')
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
		
		this.listLength = function(listName,subList) {
			subList = typeof subList !== 'undefined' ? subList : 'main';
			if(this.Lists[listName]) {
				return this.Lists[listName][subList].length;
			} else {
				return 0;
			}
		};
		
		// First checks exclude array for item, then checks search value (see filterService.js)
		this.filterCheck = function(value,index,search,keyName,listName) {
			var listCheck = false,
				showItem = false;
			listCheck = lFunc.findById(value[keyName],listName,keyName,'exclude');
			if(listCheck === false) {
				showItem = filterFunctions.filterCheck(value,search);
				// Deselect item if the filter excludes the item
				if(value.selected && !showItem && index >= 0) {
					lFunc.deselectItem(value[keyName],index,keyName,listName);
				}
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
				index = this.findById(id,listName,key,'main');
			}
			if(!item.selected) {
				this.selectItem(item,index,key,listName);
			} else {
				this.deselectItem(id,index,key,listName);
			}
		};

		// Function to create a comma separated list of a particular property within an array 
		this.makeList = function(listName,keyName,subList) {
			if(!subList) {
				subList = 'main';
			}
			var listArray = this.Lists[listName][subList];
			for(var i = 0; i < listArray.length; i++) {
				message += listArray[i][keyName];
				if(i < listArray.length - 1) {
					message += ', ';
				}
			}
			return message;
		};

		// Returns the index of the item within the an array (specified by listName and subList) or false if not found.  Search by key (should be unique id.
		this.findById = function(id,listName,key,subList) {
			key = typeof key !== 'undefined' ? key : 'id';
			subList = typeof subList !== 'undefined' ? subList : 'main';
			var listArray = this.Lists[listName][subList];
			for(var i = 0; i < listArray.length; i++) {
				if(String(listArray[i][key]) === String(id)) {
					return i;
				}			
			}
			return false;
		};
		
		// Deletes items found in delArray from mainList searching by id. Returns new array.
		this.deleteById = function(delArray,idName,listName,subList) {
			var numItems = delArray.length;
			subList = typeof subList !== 'undefined' ? subList : 'main';
			for(var i = 0; i < numItems; i++) {
				var imgIndex = lFunc.findById(delArray[i][idName],listName,idName,subList);
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
			var selIndex = lFunc.findById(id,listName,key,'selected');
			lFunc.Lists[listName].selected.splice(selIndex,1);
		};

		this.selectItem = function(item,index,key,listName) {
			key = typeof key !== 'undefined' ? key : 'id';
			if(!index) {
				index = this.findById(item[key],listName,key,'main');
			}
			this.Lists[listName].main[index].selected = true;
			this.Lists[listName].selected.push(item);
		};
		
		// After items are moved in list, sets the order value (named ordKey) to the correct number for the DB.  Also adds order and section to the selected list.
		var resetOrder = function(key,ordKey,listName,section) {
			var selIndex = 0;
			for(i = 0; i < lFunc.Lists[listName].main.length; i++) {
				lFunc.Lists[listName].main[i][ordKey] = i;
				if(lFunc.Lists[listName].main.selected) {
					selIndex = lFunc.findById(lFunc.Lists[listName].main[i][key],listName,key,'selected');
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
		
		// Moves an item or items.  Checks the sections of the items to ensure items within same section stick together.
		this.moveItems = function(direction,key,ordKey,listName) {
			var selSection,
				listLen = lFunc.Lists[listName].main.length,
				multiplier,
				nextSection;
			var i = direction > 0 ? listLen - 1 : 0;
			// Loop through main list opposite the direction of the movement of items to make sure order is otherwise preserved.
			for(i; i < listLen && i >= 0; i = i - direction) {
				multiplier = 1;
				// If the item is in the selected list or the section is moving.
				if(lFunc.findById(lFunc.Lists[listName].main[i][key],listName,key,'selected') !== false || lFunc.Lists[listName].main[i].section === selSection) {
					// Set selSection to section of a selected item.
					if(lFunc.Lists[listName].main[i].section !== '') {
						selSection = lFunc.Lists[listName].main[i].section;
					}
					// If the movement would put the item outside of list boundaries or another selection has hit those boundaries don't move.
					if(i+direction >= 0 && i+direction < listLen && !lFunc.Lists[listName].main[i+direction].selected) {
						// If the next item is in a defined section, need to check & count items in section to jump over or stop movement.
						if(lFunc.mainList[listNum][i+direction].section !== '' && lFunc.mainList[listNum][i].section !== lFunc.mainList[listNum][i+direction].section) {
							nextSection = lFunc.Lists[listName].main[i+direction].section;
							multiplier = 0;
							// Loop back through array in the direction of movement.
							for(var j = i + direction; j < listLen && j >= 0; j = j + direction) {
								// If the item is in the section...
								if(lFunc.Lists[listName].main[j].section === nextSection) {
									// If selected stop movement and break.
									if(lFunc.mainList[listNum][j].selected) {
										multiplier = 0;
										break;
									}
									// If not, count section.
									multiplier++;
								} else {
									// Break loop at first item not in section.
									break;
								}
							}
						}
						// Final check: only move an item if it is selected or to ensure items of the same section stick together
						if(lFunc.Lists[listName].main[i].selected || lFunc.Lists[listName].main[i+direction].section !== lFunc.Lists[listName].main[i].section) {
							lFunc.Lists[listName].main.splice(i+(direction*multiplier),0,lFunc.Lists[listName].main.splice(i,1)[0]);
						}
					}
				}
			}
			// Reset order variable for database.
			resetOrder(key,ordKey,listName);
		};
		
	}]);
})
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImZpbHRlcnMvZmlsdGVyRGlyZWN0aXZlLmpzIiwibGlzdHMvbGlzdERpcmVjdGl2ZS5qcyIsIm92ZXJsYXkvb3ZlcmxheURpcmVjdGl2ZS5qcyIsImZpbHRlcnMvY29tcG9uZW50cy9maWx0ZXJDaGVja2JveENvbXBvbmVudERpcmVjdGl2ZS5qcyIsImZpbHRlcnMvY29tcG9uZW50cy9maWx0ZXJRdWVyeUNvbXBvbmVudERpcmVjdGl2ZS5qcyIsImZpbHRlckNvbnRyb2xsZXIuanMiLCJmaWx0ZXJTZXJ2aWNlLmpzIiwiY29tcG9uZW50cy9maWx0ZXJDb21wb25lbnRDb250cm9sbGVyLmpzIiwib3ZlcmxheUNvbnRyb2xsZXIuanMiLCJsaXN0Q29udHJvbGxlci5qcyIsImxpc3RTZXJ2LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FDSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQy9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3JCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDekJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3ZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMzRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM5QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDNUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJwaG90by10b29scy5qcyIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpIHtcblx0YW5ndWxhci5tb2R1bGUoJ3Bob3RvRWRpdENvbXBvbmVudHMnLCBbJ2xpc3RNb2QnLCdmaWx0ZXJNb2QnLCdvdmVybGF5TW9kJ10pO1xuXHRcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG5cdFxyXG5cdC8qXHJcblx0U2VhcmNoIHZhcmlhYmxlIHNob3VsZCBiZSBhbiBhcnJheSBvZiBvYmplY3RzIG5hbWVkIHRoZSBzYW1lIGFzIHRoZSBwcm9wZXJ0aWVzIG9mIHRoZSBvYmplY3RzIHdpdGhpbiB0aGUgbGlzdC5cclxuXHRcdFJlcXVpcmVzIGEgJ3F1ZXJ5JyBwcm9wZXJ0eSB3aXRoaW4gb2JqZWN0IHdoaWNoIGlzIG1vZGVsZWQgdG8gYSB0ZXh0L2lucHV0IGZpbHRlci5cclxuXHRcdElmIHRoZSBzZWFyY2hlZCBwcm9wZXJ0eSBpcyBhbiBhcnJheSBvZiBvYmplY3RzIChpZiwgZm9yIGV4YW1wbGUsIGltYWdlcyBjYW4gYmUgaW4gbWFueSBnYWxsZXJ5IGdyb3VwaW5ncyksIGFkZCAnaXNBcnJheScgcHJvcGVydHkgYW5kIHNldCB0byB0cnVlLCBhbHNvIGFkZCAnc2VhcmNoT24nIHByb3BlcnR5IGFuZCBzZXQgdG8gdGhlIG5hbWUgb2YgdGhlIHByb3BlcnR5IHdpdGhpbiBvYmplY3RzLlxyXG5cdFx0RXhhbXBsZTogaW1hZ2VzID0gWyB7aW1nbmFtZTogJ2ltZzEuanBnJywgZ2FsbGVyaWVzOiBbIHsgaWQ6MSwgbmFtZTonZ2FsbGVyeTEnIH0sIHsgaWQ6MiwgbmFtZTonZ2FsbGVyeTInfSBdfSwgLi4uXVxyXG5cdFx0c2VhcmNoID0geyBnYWxsZXJpZXM6IHsgcXVlcnk6JycsIGlzQXJyYXk6IHRydWUsIHNlYXJjaE9uOiAnbmFtZScgfSB9XHJcblx0XHRGb3IgYSBjaGVja2JveCBmaWx0ZXIsIGluY2x1ZGUgYW4gb2JqZWN0IGNhbGxlZCAnY2hlY2tib3hlcycgd2l0aCBhICdub25lJyBwcm9wZXJ0eSBhbmQgYWxsIHBvc3NpYmxlIHZhbHVlcyBpbiAwLW4gcHJvcGVydHkuXHJcblx0XHRCYXNlZCBvbiBhYm92ZSBleGFtcGxlOiBzZWFyY2ggPSB7IGdhbGxlcmllczogeyAuLi4gY2hlY2tib3hlczogeyBub25lOiB0cnVlLCAwOidnYWxsZXJ5MScsMTonZ2FsbGVyeTInIH0gfVxyXG5cdCovXHJcblx0XHJcblx0YW5ndWxhci5tb2R1bGUoJ2ZpbHRlck1vZCcsW10pXHJcblx0LmRpcmVjdGl2ZSgnZmlsdGVyQmFyJywgZnVuY3Rpb24oKSB7XHJcblx0XHRyZXR1cm4ge1xyXG5cdFx0XHRzY29wZToge1xyXG5cdFx0XHRcdHNlYXJjaDonPScsXHJcblx0XHRcdFx0ZnBvc2l0aW9uOic9PycsXHJcblx0XHRcdFx0aW5saW5lOidAPydcclxuXHRcdFx0fSxcclxuXHRcdFx0dGVtcGxhdGU6ICc8ZGl2IG5nLWluY2x1ZGU9XCJ0ZW1wbGF0ZVVybFwiPjwvZGl2PicsXHJcblx0XHRcdGNvbnRyb2xsZXI6J2ZpbHRlckJhckNvbnRyb2xsZXInLFxyXG5cdFx0XHRjb250cm9sbGVyQXM6J2ZiYXInLFxyXG5cdFx0XHRsaW5rOiBmdW5jdGlvbihzY29wZSxlbGVtZW50LGF0dHJzKSB7XHJcblx0XHRcdFx0c2NvcGUuYmFzZSA9IGF0dHJzLnRtcGx0LmJhc2U7XHJcblx0XHRcdFx0c2NvcGUudGVtcGxhdGVVcmwgPSBhdHRycy50bXBsdC5iYXNlICsgYXR0cnMudG1wbHQuZmlsZU5hbWU7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9KVxyXG5cdDtcclxuXHRcdFxyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcblx0YW5ndWxhci5tb2R1bGUoJ2xpc3RNb2QnLFtdKVxuXHQuZGlyZWN0aXZlKCdsaXN0T2ZJdGVtcycsZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdHNjb3BlOiB7XG5cdFx0XHRcdHNlYXJjaDonPScsXG5cdFx0XHRcdGxpc3ROYW1lOic9bGlzdCcsXG5cdFx0XHRcdGtleU5hbWU6J0BrZXknLFxuXHRcdFx0XHRvcmRLZXk6J0BvcmROYW1lJyxcblx0XHRcdFx0Ly8gQWRkaXRpb25hbCBmdW5jdGlvbnMgdG8gYmUgY2FsbGVkIGZyb20gYnV0dG9ucyBpbiB0aGUgbGlzdCAoc2F2ZSBpbmZvLCBkZWxldGUsIGV0Yylcblx0XHRcdFx0YWRkRnVuY3M6Jz1mdW5jcydcblx0XHRcdH0sXG5cdFx0XHR0ZW1wbGF0ZTogJzxkaXYgbmctaW5jbHVkZT1cInRlbXBsYXRlVXJsXCI+PC9kaXY+Jyxcblx0XHRcdGNvbnRyb2xsZXI6J2xpc3RDb250cm9sbGVyJyxcblx0XHRcdGNvbnRyb2xsZXJBczonbGlzdCcsXG5cdFx0XHRsaW5rOiBmdW5jdGlvbihzY29wZSxlbGVtZW50LGF0dHJzKSB7XG5cdFx0XHRcdHNjb3BlLnRlbXBsYXRlVXJsID0gYXR0cnMudG1wbHQuYmFzZSArIGF0dHJzLnRtcGx0LmZpbGVOYW1lO1xuXHRcdFx0fVxuXHRcdH1cblx0fSlcblx0O1xufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcblx0XHJcblx0YW5ndWxhci5tb2R1bGUoJ292ZXJsYXlNb2QnLFtdKVxyXG5cdC5kaXJlY3RpdmUoJ292ZXJsYXknLCBmdW5jdGlvbigpIHtcclxuXHRcdHJldHVybiB7XHJcblx0XHRcdHNjb3BlOiB7XHJcblx0XHRcdFx0bWVzc2FnZTonPScsXHJcblx0XHRcdFx0bWVzc2FnZU51bTonPW51bWJlcicsXHJcblx0XHRcdFx0YnRuQ29uZmlnOic9Y2ZnJyxcclxuXHRcdFx0XHQvLyBGdW5jdGlvbiBmb3IgYWN0aW9uIG9mIG92ZXJsYXkgKGNhbmNlbC9iYWNrIGlzIGluIGNvbnRyb2xsZXIpXHJcblx0XHRcdFx0ZG9BY3Rpb246Jz1mdW5jJ1xyXG5cdFx0XHR9LFxyXG5cdFx0XHRjb250cm9sbGVyOidvdmVybGF5Q29udHJvbGxlcicsXHJcblx0XHRcdGNvbnRyb2xsZXJBczonb3ZlcicsXHJcblx0XHRcdHRlbXBsYXRlOiAnPGRpdiBuZy1pbmNsdWRlPVwidGVtcGxhdGVVcmxcIj48L2Rpdj4nLFxyXG5cdFx0XHRsaW5rOiBmdW5jdGlvbihzY29wZSxlbGVtZW50LGF0dHJzKSB7XHJcblx0XHRcdFx0Ly8gSWYgbm8gYmFzZSBpcyBzcGVjaWZpZWQsIHVzZSBsb2NhdGlvbiBpZiBpbnN0YWxsZWQgdmlhIGJvd2VyLlxyXG5cdFx0XHRcdGlmKHR5cGVvZiBzY29wZS5iYXNlID09PSAndW5kZWZpbmVkJykge1xyXG5cdFx0XHRcdFx0c2NvcGUuYmFzZSA9ICcvYm93ZXJfY29tcG9uZW50cy9QaG90b2dyYXBoeS1TZXR1cC1TdWl0ZS90ZW1wbGF0ZXMvb3ZlcmxheS8nO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRzY29wZS50ZW1wbGF0ZVVybCA9IGF0dHJzLnRtcGx0LmJhc2UgKyAnb3ZlcmxheS5odG1sJztcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH0pXHJcblx0O1xyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuXHRcclxuXHRhbmd1bGFyLm1vZHVsZSgnZmlsdGVyTW9kJylcclxuXHQuZGlyZWN0aXZlKCdmaWx0ZXJDaGVja2JveCcsIGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRyZXR1cm4ge1xyXG5cdFx0XHRcdHNjb3BlOiB7XHJcblx0XHRcdFx0XHRpdGVtczonPScsXHJcblx0XHRcdFx0XHRzZWFyY2g6Jz0nLFxyXG5cdFx0XHRcdFx0YmFzZTonPSdcclxuXHRcdFx0XHR9LFxyXG5cdFx0XHRcdGNvbnRyb2xsZXI6J2ZpbHRlckNvbXBDb250cm9sbGVyJyxcclxuXHRcdFx0XHRjb250cm9sbGVyQXM6J2Zjb21wJyxcclxuXHRcdFx0XHR0ZW1wbGF0ZTogJzxkaXYgbmctaW5jbHVkZT1cInRlbXBsYXRlVXJsXCI+PC9kaXY+JyxcclxuXHRcdFx0XHRsaW5rOiBmdW5jdGlvbihzY29wZSxlbGVtZW50LGF0dHJzKSB7XHJcblx0XHRcdFx0XHQvLyBJZiBubyBiYXNlIGlzIHNwZWNpZmllZCwgdXNlIGxvY2F0aW9uIGlmIGluc3RhbGxlZCB2aWEgYm93ZXIuXHJcblx0XHRcdFx0XHRpZih0eXBlb2Ygc2NvcGUuYmFzZSA9PT0gJ3VuZGVmaW5lZCcpIHtcclxuXHRcdFx0XHRcdFx0c2NvcGUuYmFzZSA9ICcvYm93ZXJfY29tcG9uZW50cy9QaG90b2dyYXBoeS1TZXR1cC1TdWl0ZS90ZW1wbGF0ZXMvZmlsdGVycy8nO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0c2NvcGUudGVtcGxhdGVVcmwgPSBzY29wZS5iYXNlICsgJ2ZpbHRlckNoZWNrYm94ZXMuaHRtbCc7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9KVxyXG5cdDtcclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcblx0XHJcblx0YW5ndWxhci5tb2R1bGUoJ2ZpbHRlck1vZCcpXHJcblx0LmRpcmVjdGl2ZSgnZmlsdGVyUXVlcnknLCBmdW5jdGlvbigpIHtcclxuXHRcdFx0cmV0dXJuIHtcclxuXHRcdFx0XHRzY29wZToge1xyXG5cdFx0XHRcdFx0c2VhcmNoOic9JyxcclxuXHRcdFx0XHRcdGJhc2U6Jz89J1xyXG5cdFx0XHRcdH0sXHJcblx0XHRcdFx0dGVtcGxhdGU6ICc8ZGl2IG5nLWluY2x1ZGU9XCJ0ZW1wbGF0ZVVybFwiPjwvZGl2PicsXHJcblx0XHRcdFx0bGluazogZnVuY3Rpb24oc2NvcGUsZWxlbWVudCxhdHRycykge1xyXG5cdFx0XHRcdFx0Ly8gSWYgbm8gYmFzZSBpcyBzcGVjaWZpZWQsIHVzZSBsb2NhdGlvbiBpZiBpbnN0YWxsZWQgdmlhIGJvd2VyLlxyXG5cdFx0XHRcdFx0aWYodHlwZW9mIHNjb3BlLmJhc2UgPT09ICd1bmRlZmluZWQnKSB7XHJcblx0XHRcdFx0XHRcdHNjb3BlLmJhc2UgPSAnL2Jvd2VyX2NvbXBvbmVudHMvUGhvdG9ncmFwaHktU2V0dXAtU3VpdGUvdGVtcGxhdGVzL2ZpbHRlcnMvJztcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdHNjb3BlLnRlbXBsYXRlVXJsID0gc2NvcGUuYmFzZSArICdmaWx0ZXJRdWVyeS5odG1sJztcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdH0pXHJcblx0O1xyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuXHRcclxuXHRhbmd1bGFyLm1vZHVsZSgnZmlsdGVyTW9kJylcclxuXHQuY29udHJvbGxlcignZmlsdGVyQmFyQ29udHJvbGxlcicsIFsnJHNjb3BlJywnZ2V0UGhvdG9EYXRhJywgZnVuY3Rpb24oJHNjb3BlLGdldFBob3RvRGF0YSkge1xyXG5cdFx0XHRcclxuXHRcdFx0dGhpcy5nYWxsZXJpZXMgPSBbXTtcclxuXHRcdFx0XHJcblx0XHRcdC8vIFRvZ2dsZXMgdGhlIHBvc2l0aW9uIG9mIHRoZSBsZWZ0IHNpZGUgZmlsdGVyIGNvbHVtblxyXG5cdFx0XHR0aGlzLmZpbHRlclRvZ2dsZSA9IGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdHZhciBmUG9zID0gJHNjb3BlLmZwb3NpdGlvbjtcclxuXHRcdFx0XHQkc2NvcGUuZnBvc2l0aW9uID0gKGZQb3MgPT09IDAgPyAtMTkwIDogMCk7XHJcblx0XHRcdH07XHJcblx0XHRcdFxyXG5cdFx0XHR2YXIgZkN0cmwgPSB0aGlzO1xyXG5cdFx0XHRcclxuXHRcdH1dKVxyXG5cdDtcclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcblx0XHJcblx0YW5ndWxhci5tb2R1bGUoJ2ZpbHRlck1vZCcpXHJcblx0LnNlcnZpY2UoJ2ZpbHRlckZ1bmN0aW9ucycsIGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcclxuXHRcdHZhciBmRnVuY3Rpb25zID0gdGhpcztcclxuXHRcdFxyXG5cdFx0Ly8gQ2hlY2tzIGZvciBhIG1hdGNoIHdpdGggdGhlIGZpbHRlcnMuXHJcblx0XHQvLyBJZiB0aGUgdmFsdWUgaXMgYW4gYXJyYXksIGNoZWNrcyBhbGwgdmFsdWVzIGZvciBvbmUgbWF0Y2guXHJcblx0XHQvLyBJZiBub3QsIGp1c3QgY2hlY2tzIHNpbmdsZSB2YWx1ZS5cclxuXHRcdHRoaXMuZmlsdGVyQ2hlY2sgPSBmdW5jdGlvbih2YWx1ZSxzZWFyY2gpIHtcclxuXHRcdFx0dmFyIGFsbE1hdGNoID0gdHJ1ZTtcclxuXHRcdFx0XHJcblx0XHRcdGZvcih2YXIga2V5IGluIHNlYXJjaCkge1xyXG5cdFx0XHRcdGlmKHNlYXJjaC5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XHJcblx0XHRcdFx0XHR2YXIgdGhpc1ZhbHVlID0gdmFsdWVba2V5XTtcclxuXHRcdFx0XHRcdGlmKHNlYXJjaFtrZXldLmlzQXJyYXkpIHtcclxuXHRcdFx0XHRcdFx0dmFyIG51bVZhbHVlcyA9IHRoaXNWYWx1ZS5sZW5ndGgsXHJcblx0XHRcdFx0XHRcdFx0bWF0Y2hGb3VuZCA9IGZhbHNlO1xyXG5cdFx0XHRcdFx0XHRmb3IodmFyIGkgPSAwOyBpIDwgbnVtVmFsdWVzOyBpKyspIHtcclxuXHRcdFx0XHRcdFx0XHRpZihjaGVja1ZhbHVlKHRoaXNWYWx1ZVtpXSwgc2VhcmNoLCBrZXkpKSB7XHJcblx0XHRcdFx0XHRcdFx0XHRtYXRjaEZvdW5kID0gdHJ1ZTtcclxuXHRcdFx0XHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRpZighbWF0Y2hGb3VuZCkge1xyXG5cdFx0XHRcdFx0XHRcdGFsbE1hdGNoID0gZmFsc2U7XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRcdGFsbE1hdGNoID0gY2hlY2tWYWx1ZSh0aGlzVmFsdWUsIHNlYXJjaCwga2V5KTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdGlmKGFsbE1hdGNoID09PSBmYWxzZSkge1xyXG5cdFx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdFx0XHJcblx0XHRcdHJldHVybiBhbGxNYXRjaDtcclxuXHRcdFx0XHJcblx0XHR9O1xyXG5cdFx0XHJcblx0XHQvLyBGdW5jdGlvbiB0aGF0IGNoZWNrcyB2YWx1ZSBhZ2FpbnN0IHRoZSBxdWVyeSBmaWx0ZXIgJiBjaGVja2JveGVzXHJcblx0XHR2YXIgY2hlY2tWYWx1ZSA9IGZ1bmN0aW9uKHZhbHVlLCBzZWFyY2gsIGtleSkge1xyXG5cdFx0XHRcclxuXHRcdFx0dmFyIGNoZWNrTWF0Y2ggPSB0cnVlLFxyXG5cdFx0XHRcdHZhbHVlTWF0Y2ggPSBmYWxzZSxcclxuXHRcdFx0XHRjaGVja2JveGVzID0gc2VhcmNoW2tleV0uY2hlY2tib3hlcyxcclxuXHRcdFx0XHRzZWFyY2hPbiA9IHNlYXJjaFtrZXldLnNlYXJjaE9uO1xyXG5cdFx0XHRcdFxyXG5cdFx0XHRpZihzZWFyY2hPbiAmJiB2YWx1ZSkge1xyXG5cdFx0XHRcdHZhciB0aGlzVmFsdWUgPSB2YWx1ZVtzZWFyY2hPbl07XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0dmFyIHRoaXNWYWx1ZSA9IHZhbHVlO1xyXG5cdFx0XHR9XHJcblx0XHRcdGlmKGNoZWNrYm94ZXMpIHtcclxuXHRcdFx0XHRjaGVja01hdGNoID0gY2hlY2tUaGVCb3hlcyh0aGlzVmFsdWUsa2V5LGNoZWNrYm94ZXMpO1xyXG5cdFx0XHR9XHJcblx0XHRcdHZhbHVlTWF0Y2ggPSBmRnVuY3Rpb25zLnF1ZXJ5RmlsdGVyQ2hlY2sodGhpc1ZhbHVlLHNlYXJjaFtrZXldLnF1ZXJ5KTtcclxuXHRcdFx0XHJcblx0XHRcdHJldHVybiBjaGVja01hdGNoICYmIHZhbHVlTWF0Y2g7XHJcblx0XHR9O1xyXG5cdFx0XHJcblx0XHQvLyBDaGVja3MgcXVlcnkgdmFsdWUgYWdhaW5zdCBhY3R1YWwuICBBbHNvIHVzZWQgdG8gaGlkZS9zaG93IGNoZWNrYm94ZXMgYmFzZWQgb24gdGhlIHR5cGVkIGZpbHRlci5cclxuXHRcdHRoaXMucXVlcnlGaWx0ZXJDaGVjayA9IGZ1bmN0aW9uKHZhbHVlLHF1ZXJ5KSB7XHJcblx0XHRcdGlmKCF2YWx1ZSkge1xyXG5cdFx0XHRcdHZhbHVlID0gJyc7XHJcblx0XHRcdH1cclxuXHRcdFx0cmV0dXJuIHZhbHVlLnRvTG93ZXJDYXNlKCkuaW5kZXhPZihxdWVyeS50b0xvd2VyQ2FzZSgpKSA+IC0xO1xyXG5cdFx0fTtcclxuXHRcdFxyXG5cdFx0Ly8gRnVuY3Rpb24gdG8gbG9vcCB0aHJvdWdoIHRoZSBjaGVja2JveGVzIHZhcmlhYmxlIGFuZCByZXR1cm4gdHJ1ZSBpZiB0aGUgdmFsdWUgaXMgYSBtYXRjaFxyXG5cdFx0dmFyIGNoZWNrVGhlQm94ZXMgPSBmdW5jdGlvbiAodmFsdWUsZmlsdGVyc2V0LGNoZWNrYm94ZXMpIHtcclxuXHRcdFx0aWYodmFsdWUpIHtcclxuXHRcdFx0XHR2YXIgaSA9IDA7XHJcblx0XHRcdFx0ZG8ge1xyXG5cdFx0XHRcdFx0aWYodmFsdWUgPT09IGNoZWNrYm94ZXNbaV0pIHtcclxuXHRcdFx0XHRcdFx0cmV0dXJuIHRydWU7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRpKys7XHJcblx0XHRcdFx0fSB3aGlsZSh0eXBlb2YgY2hlY2tib3hlc1tpXSAhPT0gJ3VuZGVmaW5lZCcpXHJcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdGlmKGNoZWNrYm94ZXNbJ25vbmUnXSkge1xyXG5cdFx0XHRcdFx0cmV0dXJuIHRydWU7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdFx0fVxyXG5cdFx0fTtcclxuXHRcdFxyXG5cdH0pXHJcblx0O1xyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuXHRcclxuXHRhbmd1bGFyLm1vZHVsZSgnZmlsdGVyTW9kJylcclxuXHQuY29udHJvbGxlcignZmlsdGVyQ29tcENvbnRyb2xsZXInLCBbJyRzY29wZScsJ2ZpbHRlckZ1bmN0aW9ucycsIGZ1bmN0aW9uKCRzY29wZSxmaWx0ZXJGdW5jdGlvbnMpIHtcclxuXHRcdHRoaXMub25seUJveCA9IGZ1bmN0aW9uKGJveE51bSxib3hOYW1lKSB7XHJcblx0XHRcdHZhciBpID0gMDtcclxuXHRcdFx0ZG8ge1xyXG5cdFx0XHRcdCRzY29wZS5zZWFyY2guY2hlY2tib3hlc1tpXSA9IGZhbHNlO1x0XHRcdFx0XHRcclxuXHRcdFx0XHRpKys7XHJcblx0XHRcdH0gd2hpbGUodHlwZW9mICRzY29wZS5zZWFyY2guY2hlY2tib3hlc1tpXSAhPT0gJ3VuZGVmaW5lZCcpXHJcblx0XHRcdGlmKGJveE51bSA9PT0gJ25vbmUnKSB7XHJcblx0XHRcdFx0JHNjb3BlLnNlYXJjaC5jaGVja2JveGVzWydub25lJ10gPSB0cnVlO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdCRzY29wZS5zZWFyY2guY2hlY2tib3hlc1tib3hOdW1dID0gYm94TmFtZTtcclxuXHRcdFx0XHQkc2NvcGUuc2VhcmNoLmNoZWNrYm94ZXNbJ25vbmUnXSA9IGZhbHNlO1xyXG5cdFx0XHR9XHJcblx0XHR9O1xyXG5cdFx0XHJcblx0XHR0aGlzLmFsbEJveGVzID0gZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRmb3IodmFyIGkgPSAwOyBpIDwgJHNjb3BlLml0ZW1zLmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdFx0JHNjb3BlLnNlYXJjaC5jaGVja2JveGVzW2ldID0gJHNjb3BlLml0ZW1zW2ldO1xyXG5cdFx0XHR9XHJcblx0XHRcdCRzY29wZS5zZWFyY2guY2hlY2tib3hlc1snbm9uZSddID0gdHJ1ZTtcclxuXHRcdH07XHJcblx0XHRcclxuXHRcdHRoaXMuc2hvd0NoZWNrYm94ID0gZnVuY3Rpb24gKHZhbHVlLHF1ZXJ5KSB7XHJcblx0XHRcdHJldHVybiBmaWx0ZXJGdW5jdGlvbnMucXVlcnlGaWx0ZXJDaGVjayh2YWx1ZSxxdWVyeSk7XHJcblx0XHR9O1xyXG5cdH1dKVxyXG5cdDtcclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcblx0XHJcblx0YW5ndWxhci5tb2R1bGUoJ292ZXJsYXlNb2QnKVxyXG5cdFx0LmNvbnRyb2xsZXIoJ292ZXJsYXlDb250cm9sbGVyJywgWyckc2NvcGUnLCdsaXN0RnVuY3Rpb25zJywnZG9PdmVybGF5QWN0aW9ucycsJ29wZW5UYWJzJywgZnVuY3Rpb24oJHNjb3BlLGxpc3RGdW5jdGlvbnMsZG9PdmVybGF5QWN0aW9ucyxvcGVuVGFicykge1xyXG5cdFx0XHRcclxuXHRcdFx0dGhpcy5jYW5jZWxBY3Rpb24gPSBmdW5jdGlvbigpIHtcclxuXHRcdFx0XHQkc2NvcGUubWVzc2FnZU51bSA9IDA7XHJcblx0XHRcdH07XHJcblx0XHRcdFxyXG5cdFx0XHR0aGlzLmJhY2tUb0xpc3QgPSBmdW5jdGlvbigpIHtcclxuXHRcdFx0XHRvcGVuVGFicy5zZXRMb3dlcigwKTtcclxuXHRcdFx0fTtcclxuXHRcdFx0XHJcblx0XHR9XSlcclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcblx0YW5ndWxhci5tb2R1bGUoJ2xpc3RNb2QnKVxyXG5cdC5jb250cm9sbGVyKCdsaXN0Q29udHJvbGxlcicsWyckc2NvcGUnLCckcm9vdFNjb3BlJywnJHRpbWVvdXQnLCdvcGVuVGFicycsJ2xpc3RGdW5jdGlvbnMnLCdmaWx0ZXJGdW5jdGlvbnMnLCdkb092ZXJsYXlBY3Rpb25zJywnZ2V0UGhvdG9EYXRhJyxmdW5jdGlvbigkc2NvcGUsJHJvb3RTY29wZSwkdGltZW91dCxvcGVuVGFicyxsaXN0RnVuY3Rpb25zLGZpbHRlckZ1bmN0aW9ucyxkb092ZXJsYXlBY3Rpb25zLGdldFBob3RvRGF0YSkge1xyXG5cdFx0XHJcblx0XHR2YXIgbEN0cmwgPSB0aGlzLFxyXG5cdFx0XHRrZXkgPSAkc2NvcGUua2V5TmFtZSxcclxuXHRcdFx0bGlzdE5hbWUgPSAkc2NvcGUubGlzdE5hbWU7XHJcblx0XHRcclxuXHRcdC8vIFNldHMgc2VsZWN0ZWRMaXN0IGFzIGVtcHR5IGFycmF5IGZvciB0aGlzIGxpc3QgbnVtYmVyLlxyXG5cdFx0bGlzdEZ1bmN0aW9ucy5jbGVhclNlbGVjdGVkKGxpc3ROYW1lKTtcclxuXHRcdHRoaXMuaGlkZU92ZXJsYXkgPSB0cnVlO1xyXG5cdFx0XHJcblx0XHR0aGlzLkxpc3QgPSBsaXN0RnVuY3Rpb25zO1xyXG5cdFx0dGhpcy5uZXdTZWN0aW9uID0gJyc7XHJcblx0XHR0aGlzLmN1cnJlbnRTZWN0aW9uID0ge3NlY3Rpb246JycsaWQ6MH07XHJcblx0XHR0aGlzLm9yZGVyU2F2ZVBlbmRpbmcgPSBmYWxzZTtcclxuXHRcdFxyXG5cdFx0Ly8gVG9nZ2xlIHNlbGVjdGlvbiBvZiBpdGVtIC0gY2hhbmdlcyBzZWxlY3QgcHJvcGVydHkgb2YgaXRlbSBiZXR3ZWVuIHRydWUvZmFsc2UgYW5kIGFkZHMvcmVtb3ZlcyBmcm9tIHNlbGVjdGlvbiBhcnJheSAoc2VlIGxpc3RTZXJ2LmpzIGZvciBmdW5jdGlvbilcclxuXHRcdHRoaXMudG9nZ2xlU2VsZWN0ID0gZnVuY3Rpb24oaXRlbSxpbmRleCkge1xyXG5cdFx0XHRsaXN0RnVuY3Rpb25zLnRvZ2dsZVNlbGVjdChpdGVtLGluZGV4LGtleSxsaXN0TmFtZSk7XHRcdFxyXG5cdFx0fTtcclxuXHRcdFxyXG5cdFx0Ly8gQ3VzdG9tIGZpbHRlciBmdW5jdGlvbiBjaGVja2luZyBpdGVtIGZpcnN0IGFnYWluc3QgYSBsaXN0IG9mIGV4Y2x1c2lvbnMgdGhlbiBhZ2FpbnN0IGN1c3RvbSBmaWx0ZXIgdmFsdWVzXHJcblx0XHR0aGlzLmZpbHRlckNoZWNrID0gZnVuY3Rpb24odmFsdWUsaW5kZXgsYXJyYXkpIHtcclxuXHRcdFx0cmV0dXJuIGxpc3RGdW5jdGlvbnMuZmlsdGVyQ2hlY2sodmFsdWUsaW5kZXgsJHNjb3BlLnNlYXJjaCxrZXlOYW1lLGxpc3ROYW1lKTtcclxuXHRcdH07XHJcblx0XHRcclxuXHRcdC8vIFJldHVybnMgdGhlIGxlbmd0aCBhIGxpc3QgKG1haW4gbGlzdCBpZiBub3Qgc3BlY2lmaWVkKS5cclxuXHRcdHRoaXMuZ2V0TGVuZ3RoID0gZnVuY3Rpb24obGlzdE5hbWUsc3ViTGlzdCkge1xyXG5cdFx0XHRpZighc3ViTGlzdCkge1xyXG5cdFx0XHRcdHN1Ykxpc3QgPSAnbWFpbic7XHJcblx0XHRcdH1cclxuXHRcdFx0cmV0dXJuIGxpc3RGdW5jdGlvbnMuTGlzdHMuW2xpc3ROYW1lXS5sZW5ndGg7XHJcblx0XHR9O1xyXG5cdFx0XHJcblx0XHQvLyBDaGFuZ2Ugb3JkZXIgb2YgbGlzdC5cclxuXHRcdHRoaXMubW92ZUl0ZW1zID0gZnVuY3Rpb24oZGlyZWN0aW9uLGtleSkge1xyXG5cdFx0XHRsaXN0RnVuY3Rpb25zLm1vdmVJdGVtcyhkaXJlY3Rpb24sa2V5LG9yZEtleSxsaXN0TmFtZSk7XHJcblx0XHRcdHRoaXMub3JkZXJTYXZlUGVuZGluZyA9IHRydWU7XHJcblx0XHR9O1xyXG5cdFx0XHJcblx0fV0pXHJcblx0XHJcblx0O1xyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuXHRhbmd1bGFyLm1vZHVsZSgnbGlzdE1vZCcpXHJcblx0LnNlcnZpY2UoJ2xpc3RGdW5jdGlvbnMnLCBbJyRxJywnZ2V0UGhvdG9EYXRhJyxmdW5jdGlvbiAoJHEsZ2V0UGhvdG9EYXRhKSB7XHJcblx0XHRcclxuXHRcdHZhciBsRnVuYyA9IHRoaXMsXHJcblx0XHRcdGVkaXRMaXN0ID0gW10sXHJcblx0XHRcdGN1cnJlbnRGaWx0ZXJlZExpc3QgPSBbXTtcclxuXHRcdFxyXG5cdFx0dGhpcy5MaXN0cyA9IHt9O1xyXG5cdFx0dGhpcy5zZWN0aW9uTGlzdCA9IFt7c2VjdGlvbjonJyxpZDowfV07XHJcblx0XHRcclxuXHRcdHRoaXMuc2V0TGlzdCA9IGZ1bmN0aW9uKGxpc3RBcnJheSxsaXN0TmFtZSxleGNsdWRlQXJyYXkpIHtcclxuXHRcdFx0dGhpcy5MaXN0c1tsaXN0TmFtZV0gPSB7IG1haW46bGlzdEFycmF5LHNlbGVjdGVkOltdLGVkaXQ6W10sZmlsdGVyZWQ6W10sZXhjbHVkZTpleGNsdWRlQXJyYXkgfTtcclxuXHRcdH07XHJcblx0XHRcclxuXHRcdHRoaXMuY2xlYXJTZWxlY3RlZCA9IGZ1bmN0aW9uKGxpc3ROYW1lKSB7XHJcblx0XHRcdHRoaXMuTGlzdHNbbGlzdE5hbWVdLnNlbGVjdGVkID0gW107XHJcblx0XHR9O1xyXG5cdFx0XHJcblx0XHR0aGlzLmNoZWNrU2VsZWN0ZWQgPSBmdW5jdGlvbihsaXN0TmFtZSkge1xyXG5cdFx0XHRyZXR1cm4gdGhpcy5MaXN0c1tsaXN0TmFtZV0uc2VsZWN0ZWQubGVuZ3RoID09PSAwO1xyXG5cdFx0fTtcclxuXHRcdFxyXG5cdFx0dGhpcy5saXN0TGVuZ3RoID0gZnVuY3Rpb24obGlzdE5hbWUsc3ViTGlzdCkge1xyXG5cdFx0XHRzdWJMaXN0ID0gdHlwZW9mIHN1Ykxpc3QgIT09ICd1bmRlZmluZWQnID8gc3ViTGlzdCA6ICdtYWluJztcclxuXHRcdFx0aWYodGhpcy5MaXN0c1tsaXN0TmFtZV0pIHtcclxuXHRcdFx0XHRyZXR1cm4gdGhpcy5MaXN0c1tsaXN0TmFtZV1bc3ViTGlzdF0ubGVuZ3RoO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdHJldHVybiAwO1xyXG5cdFx0XHR9XHJcblx0XHR9O1xyXG5cdFx0XHJcblx0XHQvLyBGaXJzdCBjaGVja3MgZXhjbHVkZSBhcnJheSBmb3IgaXRlbSwgdGhlbiBjaGVja3Mgc2VhcmNoIHZhbHVlIChzZWUgZmlsdGVyU2VydmljZS5qcylcclxuXHRcdHRoaXMuZmlsdGVyQ2hlY2sgPSBmdW5jdGlvbih2YWx1ZSxpbmRleCxzZWFyY2gsa2V5TmFtZSxsaXN0TmFtZSkge1xyXG5cdFx0XHR2YXIgbGlzdENoZWNrID0gZmFsc2UsXHJcblx0XHRcdFx0c2hvd0l0ZW0gPSBmYWxzZTtcclxuXHRcdFx0bGlzdENoZWNrID0gbEZ1bmMuZmluZEJ5SWQodmFsdWVba2V5TmFtZV0sbGlzdE5hbWUsa2V5TmFtZSwnZXhjbHVkZScpO1xyXG5cdFx0XHRpZihsaXN0Q2hlY2sgPT09IGZhbHNlKSB7XHJcblx0XHRcdFx0c2hvd0l0ZW0gPSBmaWx0ZXJGdW5jdGlvbnMuZmlsdGVyQ2hlY2sodmFsdWUsc2VhcmNoKTtcclxuXHRcdFx0XHQvLyBEZXNlbGVjdCBpdGVtIGlmIHRoZSBmaWx0ZXIgZXhjbHVkZXMgdGhlIGl0ZW1cclxuXHRcdFx0XHRpZih2YWx1ZS5zZWxlY3RlZCAmJiAhc2hvd0l0ZW0gJiYgaW5kZXggPj0gMCkge1xyXG5cdFx0XHRcdFx0bEZ1bmMuZGVzZWxlY3RJdGVtKHZhbHVlW2tleU5hbWVdLGluZGV4LGtleU5hbWUsbGlzdE5hbWUpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0XHRsRnVuYy5zZXRGaWx0ZXJlZChsaXN0TmFtZSxpbmRleCxzaG93SXRlbSk7XHJcblx0XHRcdHJldHVybiBzaG93SXRlbTtcclxuXHRcdH07XHJcblx0XHRcclxuXHRcdC8vIEFkZHMgcHJvcGVydHkgd2l0aCBmaWx0ZXIgc3RhdHVzIG9mIGVsZW1lbnRcclxuXHRcdHRoaXMuc2V0RmlsdGVyZWQgPSBmdW5jdGlvbihsaXN0TmFtZSxpbmRleCxzaG93KSB7XHJcblx0XHRcdHRoaXMuTGlzdHNbbGlzdE5hbWVdLm1haW5baW5kZXhdLnNob3dJdGVtID0gc2hvdztcclxuXHRcdH07XHJcblx0XHRcclxuXHRcdC8vIENyZWF0ZXMgYSBsaXN0IG9mIG9ubHkgdGhlIGN1cnJlbnRseSBmaWx0ZXJlZCBlbGVtZW50cyBvZiB0aGUgbWFpbiBhcnJheS4gUmV0dXJucyB0aGlzIGZpbHRlcmVkIGFycmF5LlxyXG5cdFx0dGhpcy5zZXRGaWx0ZXJBcnJheSA9IGZ1bmN0aW9uKGxpc3ROYW1lKSB7XHJcblx0XHRcdHZhciBtYWluQXJyYXkgPSB0aGlzLkxpc3RzW2xpc3ROYW1lXS5tYWluO1xyXG5cdFx0XHRmb3IodmFyIGkgPSAwOyBpIDwgbWFpbkFycmF5OyBpKyspIHtcclxuXHRcdFx0XHRpZihtYWluQXJyYXlbaV0uc2hvd0l0ZW0gPT09IHRydWUpIHtcclxuXHRcdFx0XHRcdHRoaXMuTGlzdHNbbGlzdE5hbWVdLmZpbHRlcmVkLnB1c2gobWFpbkFycmF5W2ldKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdFx0cmV0dXJuIHRoaXMuTGlzdHNbbGlzdE5hbWVdLmZpbHRlcmVkXHJcblx0XHR9O1xyXG5cdFx0XHJcblx0XHR0aGlzLnRvZ2dsZVNlbGVjdCA9IGZ1bmN0aW9uKGl0ZW0saW5kZXgsa2V5LGxpc3ROYW1lKSB7XHJcblx0XHRcdGtleSA9IGtleSA/IGtleSA6ICdpZCc7XHJcblx0XHRcdHZhciBpZCA9IGl0ZW1ba2V5XTtcclxuXHRcdFx0aWYoIWluZGV4ICYmIGluZGV4ICE9PSAwKSB7XHJcblx0XHRcdFx0aW5kZXggPSB0aGlzLmZpbmRCeUlkKGlkLGxpc3ROYW1lLGtleSwnbWFpbicpO1xyXG5cdFx0XHR9XHJcblx0XHRcdGlmKCFpdGVtLnNlbGVjdGVkKSB7XHJcblx0XHRcdFx0dGhpcy5zZWxlY3RJdGVtKGl0ZW0saW5kZXgsa2V5LGxpc3ROYW1lKTtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHR0aGlzLmRlc2VsZWN0SXRlbShpZCxpbmRleCxrZXksbGlzdE5hbWUpO1xyXG5cdFx0XHR9XHJcblx0XHR9O1xyXG5cclxuXHRcdC8vIEZ1bmN0aW9uIHRvIGNyZWF0ZSBhIGNvbW1hIHNlcGFyYXRlZCBsaXN0IG9mIGEgcGFydGljdWxhciBwcm9wZXJ0eSB3aXRoaW4gYW4gYXJyYXkgXHJcblx0XHR0aGlzLm1ha2VMaXN0ID0gZnVuY3Rpb24obGlzdE5hbWUsa2V5TmFtZSxzdWJMaXN0KSB7XHJcblx0XHRcdGlmKCFzdWJMaXN0KSB7XHJcblx0XHRcdFx0c3ViTGlzdCA9ICdtYWluJztcclxuXHRcdFx0fVxyXG5cdFx0XHR2YXIgbGlzdEFycmF5ID0gdGhpcy5MaXN0c1tsaXN0TmFtZV1bc3ViTGlzdF07XHJcblx0XHRcdGZvcih2YXIgaSA9IDA7IGkgPCBsaXN0QXJyYXkubGVuZ3RoOyBpKyspIHtcclxuXHRcdFx0XHRtZXNzYWdlICs9IGxpc3RBcnJheVtpXVtrZXlOYW1lXTtcclxuXHRcdFx0XHRpZihpIDwgbGlzdEFycmF5Lmxlbmd0aCAtIDEpIHtcclxuXHRcdFx0XHRcdG1lc3NhZ2UgKz0gJywgJztcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdFx0cmV0dXJuIG1lc3NhZ2U7XHJcblx0XHR9O1xyXG5cclxuXHRcdC8vIFJldHVybnMgdGhlIGluZGV4IG9mIHRoZSBpdGVtIHdpdGhpbiB0aGUgYW4gYXJyYXkgKHNwZWNpZmllZCBieSBsaXN0TmFtZSBhbmQgc3ViTGlzdCkgb3IgZmFsc2UgaWYgbm90IGZvdW5kLiAgU2VhcmNoIGJ5IGtleSAoc2hvdWxkIGJlIHVuaXF1ZSBpZC5cclxuXHRcdHRoaXMuZmluZEJ5SWQgPSBmdW5jdGlvbihpZCxsaXN0TmFtZSxrZXksc3ViTGlzdCkge1xyXG5cdFx0XHRrZXkgPSB0eXBlb2Yga2V5ICE9PSAndW5kZWZpbmVkJyA/IGtleSA6ICdpZCc7XHJcblx0XHRcdHN1Ykxpc3QgPSB0eXBlb2Ygc3ViTGlzdCAhPT0gJ3VuZGVmaW5lZCcgPyBzdWJMaXN0IDogJ21haW4nO1xyXG5cdFx0XHR2YXIgbGlzdEFycmF5ID0gdGhpcy5MaXN0c1tsaXN0TmFtZV1bc3ViTGlzdF07XHJcblx0XHRcdGZvcih2YXIgaSA9IDA7IGkgPCBsaXN0QXJyYXkubGVuZ3RoOyBpKyspIHtcclxuXHRcdFx0XHRpZihTdHJpbmcobGlzdEFycmF5W2ldW2tleV0pID09PSBTdHJpbmcoaWQpKSB7XHJcblx0XHRcdFx0XHRyZXR1cm4gaTtcclxuXHRcdFx0XHR9XHRcdFx0XHJcblx0XHRcdH1cclxuXHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0fTtcclxuXHRcdFxyXG5cdFx0Ly8gRGVsZXRlcyBpdGVtcyBmb3VuZCBpbiBkZWxBcnJheSBmcm9tIG1haW5MaXN0IHNlYXJjaGluZyBieSBpZC4gUmV0dXJucyBuZXcgYXJyYXkuXHJcblx0XHR0aGlzLmRlbGV0ZUJ5SWQgPSBmdW5jdGlvbihkZWxBcnJheSxpZE5hbWUsbGlzdE5hbWUsc3ViTGlzdCkge1xyXG5cdFx0XHR2YXIgbnVtSXRlbXMgPSBkZWxBcnJheS5sZW5ndGg7XHJcblx0XHRcdHN1Ykxpc3QgPSB0eXBlb2Ygc3ViTGlzdCAhPT0gJ3VuZGVmaW5lZCcgPyBzdWJMaXN0IDogJ21haW4nO1xyXG5cdFx0XHRmb3IodmFyIGkgPSAwOyBpIDwgbnVtSXRlbXM7IGkrKykge1xyXG5cdFx0XHRcdHZhciBpbWdJbmRleCA9IGxGdW5jLmZpbmRCeUlkKGRlbEFycmF5W2ldW2lkTmFtZV0sbGlzdE5hbWUsaWROYW1lLHN1Ykxpc3QpO1xyXG5cdFx0XHRcdGxGdW5jLkxpc3RzW2xpc3ROYW1lXS5tYWluLnNwbGljZShpbWdJbmRleCwxKTtcclxuXHRcdFx0fVxyXG5cdFx0fTtcclxuXHRcdFxyXG5cdFx0Ly8gU2VsZWN0cyBhbGwgaXRlbXMgd2l0aGluIHRoZSBjdXJyZW50IGZpbHRlciBzZXRcclxuXHRcdHRoaXMuc2VsZWN0QWxsID0gZnVuY3Rpb24oa2V5LGxpc3ROYW1lKSB7XHJcblx0XHRcdGtleSA9IHR5cGVvZiBrZXkgIT09ICd1bmRlZmluZWQnID8ga2V5IDogJ2lkJztcclxuXHRcdFx0dmFyIGZpbHRlcmVkSXRlbXMgPSB0aGlzLnNldEZpbHRlckFycmF5KGxpc3ROYW1lKTtcclxuXHRcdFx0dmFyIG51bUl0ZW1zID0gZmlsdGVyZWRJdGVtcy5sZW5ndGg7XHJcblx0XHRcdGZvcih2YXIgaSA9IDA7IGkgPCBudW1JdGVtczsgaSsrKSB7XHJcblx0XHRcdFx0aWYoIWZpbHRlcmVkSXRlbXNbaV0uc2VsZWN0ZWQpIHtcclxuXHRcdFx0XHRcdGxGdW5jLnNlbGVjdEl0ZW0oZmlsdGVyZWRJdGVtc1tpXSx1bmRlZmluZWQsa2V5LGxpc3ROYW1lKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdH07XHJcblx0XHRcclxuXHRcdC8vIERlc2VsZWN0cyBhbGwgaXRlbXNcclxuXHRcdHRoaXMuZGVzZWxlY3RBbGwgPSBmdW5jdGlvbihrZXksbGlzdE5hbWUpIHtcclxuXHRcdFx0a2V5ID0gdHlwZW9mIGtleSAhPT0gJ3VuZGVmaW5lZCcgPyBrZXkgOiAnaWQnO1xyXG5cdFx0XHR2YXIgbnVtUGhvdG9zID0gdGhpcy5MaXN0c1tsaXN0TmFtZV0ubWFpbi5sZW5ndGg7XHJcblx0XHRcdGlmKCF0aGlzLmNoZWNrU2VsZWN0ZWQobGlzdE5hbWUpKSB7XHJcblx0XHRcdFx0Zm9yKHZhciBpID0gMDsgaSA8IG51bVBob3RvczsgaSsrKSB7XHJcblx0XHRcdFx0XHR2YXIgaXRlbSA9IHRoaXMuTGlzdHNbbGlzdE5hbWVdLm1haW5baV07XHJcblx0XHRcdFx0XHRpZihpdGVtLnNlbGVjdGVkKSB7XHJcblx0XHRcdFx0XHRcdHRoaXMuZGVzZWxlY3RJdGVtKGl0ZW0uaWQsaSxrZXksbGlzdE5hbWUpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fTtcclxuXHRcdFxyXG5cdFx0dGhpcy5kZXNlbGVjdEl0ZW0gPSBmdW5jdGlvbihpZCxpbmRleCxrZXksbGlzdE5hbWUpIHtcclxuXHRcdFx0a2V5ID0gdHlwZW9mIGtleSAhPT0gJ3VuZGVmaW5lZCcgPyBrZXkgOiAnaWQnO1xyXG5cdFx0XHRsRnVuYy5MaXN0c1tsaXN0TmFtZV0ubWFpbltpbmRleF0uc2VsZWN0ZWQgPSBmYWxzZTtcclxuXHRcdFx0dmFyIHNlbEluZGV4ID0gbEZ1bmMuZmluZEJ5SWQoaWQsbGlzdE5hbWUsa2V5LCdzZWxlY3RlZCcpO1xyXG5cdFx0XHRsRnVuYy5MaXN0c1tsaXN0TmFtZV0uc2VsZWN0ZWQuc3BsaWNlKHNlbEluZGV4LDEpO1xyXG5cdFx0fTtcclxuXHJcblx0XHR0aGlzLnNlbGVjdEl0ZW0gPSBmdW5jdGlvbihpdGVtLGluZGV4LGtleSxsaXN0TmFtZSkge1xyXG5cdFx0XHRrZXkgPSB0eXBlb2Yga2V5ICE9PSAndW5kZWZpbmVkJyA/IGtleSA6ICdpZCc7XHJcblx0XHRcdGlmKCFpbmRleCkge1xyXG5cdFx0XHRcdGluZGV4ID0gdGhpcy5maW5kQnlJZChpdGVtW2tleV0sbGlzdE5hbWUsa2V5LCdtYWluJyk7XHJcblx0XHRcdH1cclxuXHRcdFx0dGhpcy5MaXN0c1tsaXN0TmFtZV0ubWFpbltpbmRleF0uc2VsZWN0ZWQgPSB0cnVlO1xyXG5cdFx0XHR0aGlzLkxpc3RzW2xpc3ROYW1lXS5zZWxlY3RlZC5wdXNoKGl0ZW0pO1xyXG5cdFx0fTtcclxuXHRcdFxyXG5cdFx0Ly8gQWZ0ZXIgaXRlbXMgYXJlIG1vdmVkIGluIGxpc3QsIHNldHMgdGhlIG9yZGVyIHZhbHVlIChuYW1lZCBvcmRLZXkpIHRvIHRoZSBjb3JyZWN0IG51bWJlciBmb3IgdGhlIERCLiAgQWxzbyBhZGRzIG9yZGVyIGFuZCBzZWN0aW9uIHRvIHRoZSBzZWxlY3RlZCBsaXN0LlxyXG5cdFx0dmFyIHJlc2V0T3JkZXIgPSBmdW5jdGlvbihrZXksb3JkS2V5LGxpc3ROYW1lLHNlY3Rpb24pIHtcclxuXHRcdFx0dmFyIHNlbEluZGV4ID0gMDtcclxuXHRcdFx0Zm9yKGkgPSAwOyBpIDwgbEZ1bmMuTGlzdHNbbGlzdE5hbWVdLm1haW4ubGVuZ3RoOyBpKyspIHtcclxuXHRcdFx0XHRsRnVuYy5MaXN0c1tsaXN0TmFtZV0ubWFpbltpXVtvcmRLZXldID0gaTtcclxuXHRcdFx0XHRpZihsRnVuYy5MaXN0c1tsaXN0TmFtZV0ubWFpbi5zZWxlY3RlZCkge1xyXG5cdFx0XHRcdFx0c2VsSW5kZXggPSBsRnVuYy5maW5kQnlJZChsRnVuYy5MaXN0c1tsaXN0TmFtZV0ubWFpbltpXVtrZXldLGxpc3ROYW1lLGtleSwnc2VsZWN0ZWQnKTtcclxuXHRcdFx0XHRcdGxGdW5jLkxpc3RzW2xpc3ROYW1lXS5zZWxlY3RlZFtzZWxJbmRleF1bb3JkS2V5XSA9IGk7XHJcblx0XHRcdFx0XHRpZih0eXBlb2Ygc2VjdGlvbiAhPT0gJ3VuZGVmaW5lZCcpIHtcclxuXHRcdFx0XHRcdFx0bEZ1bmMuTGlzdHNbbGlzdE5hbWVdLnNlbGVjdGVkW3NlbEluZGV4XS5zZWN0aW9uID0gc2VjdGlvbjtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdH07XHJcblx0XHRcclxuXHRcdC8vIEFkZHMgdGhlIHNlbGVjdGVkIGl0ZW1zIHRvIGEgc2VjdGlvbiBhbmQgcmVvcmRlcnMgaXRlbXMgdG8gZ3JvdXAgdGhvc2UgdG9nZXRoZXIuXHJcblx0XHR0aGlzLmdyb3VwU2VsZWN0ZWQgPSBmdW5jdGlvbihrZXksb3JkS2V5LHNlY3Rpb24sbGlzdE5hbWUpIHtcclxuXHRcdFx0dmFyIGxpc3RUZW1wID0gbEZ1bmMuTGlzdHNbbGlzdE5hbWVdLm1haW4sXHJcblx0XHRcdFx0Zmlyc3RJbmRleCA9IC0xLFxyXG5cdFx0XHRcdG1vdmVJbmRleCA9IDAsXHJcblx0XHRcdFx0c2VsSW5kZXg7XHJcblx0XHRcdGZvcih2YXIgaSA9IDA7IGkgPCBsaXN0VGVtcC5sZW5ndGg7IGkrKykge1xyXG5cdFx0XHRcdGlmKGxpc3RUZW1wW2ldLnNlbGVjdGVkIHx8IGxsaXN0VGVtcFtpXS5zZWN0aW9uID09PSBzZWN0aW9uKSB7XHJcblx0XHRcdFx0XHRpZihmaXJzdEluZGV4ID0gLTEpIHtcclxuXHRcdFx0XHRcdFx0Zmlyc3RJbmRleCA9IGk7XHJcblx0XHRcdFx0XHRcdGxpc3RUZW1wW2ldLnNlY3Rpb24gPSBzZWN0aW9uO1xyXG5cdFx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdFx0bW92ZUluZGV4ID0gaTtcclxuXHRcdFx0XHRcdFx0bGlzdFRlbXBbbW92ZUluZGV4XS5zZWN0aW9uID0gc2VjdGlvbjtcclxuXHRcdFx0XHRcdFx0bGlzdFRlbXAuc3BsaWNlKGZpcnN0SW5kZXgrMSwwLGxpc3RUZW1wLnNwbGljZShtb3ZlSW5kZXgsMSlbMF0pO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0XHRsRnVuYy5MaXN0c1tsaXN0TmFtZV0ubWFpbiA9IGxpc3RUZW1wO1xyXG5cdFx0XHRyZXNldE9yZGVyKGtleSxvcmRLZXksbGlzdE51bSxzZWN0aW9uKTtcclxuXHRcdH07XHJcblx0XHRcclxuXHRcdC8vIE1vdmVzIGFuIGl0ZW0gb3IgaXRlbXMuICBDaGVja3MgdGhlIHNlY3Rpb25zIG9mIHRoZSBpdGVtcyB0byBlbnN1cmUgaXRlbXMgd2l0aGluIHNhbWUgc2VjdGlvbiBzdGljayB0b2dldGhlci5cclxuXHRcdHRoaXMubW92ZUl0ZW1zID0gZnVuY3Rpb24oZGlyZWN0aW9uLGtleSxvcmRLZXksbGlzdE5hbWUpIHtcclxuXHRcdFx0dmFyIHNlbFNlY3Rpb24sXHJcblx0XHRcdFx0bGlzdExlbiA9IGxGdW5jLkxpc3RzW2xpc3ROYW1lXS5tYWluLmxlbmd0aCxcclxuXHRcdFx0XHRtdWx0aXBsaWVyLFxyXG5cdFx0XHRcdG5leHRTZWN0aW9uO1xyXG5cdFx0XHR2YXIgaSA9IGRpcmVjdGlvbiA+IDAgPyBsaXN0TGVuIC0gMSA6IDA7XHJcblx0XHRcdC8vIExvb3AgdGhyb3VnaCBtYWluIGxpc3Qgb3Bwb3NpdGUgdGhlIGRpcmVjdGlvbiBvZiB0aGUgbW92ZW1lbnQgb2YgaXRlbXMgdG8gbWFrZSBzdXJlIG9yZGVyIGlzIG90aGVyd2lzZSBwcmVzZXJ2ZWQuXHJcblx0XHRcdGZvcihpOyBpIDwgbGlzdExlbiAmJiBpID49IDA7IGkgPSBpIC0gZGlyZWN0aW9uKSB7XHJcblx0XHRcdFx0bXVsdGlwbGllciA9IDE7XHJcblx0XHRcdFx0Ly8gSWYgdGhlIGl0ZW0gaXMgaW4gdGhlIHNlbGVjdGVkIGxpc3Qgb3IgdGhlIHNlY3Rpb24gaXMgbW92aW5nLlxyXG5cdFx0XHRcdGlmKGxGdW5jLmZpbmRCeUlkKGxGdW5jLkxpc3RzW2xpc3ROYW1lXS5tYWluW2ldW2tleV0sbGlzdE5hbWUsa2V5LCdzZWxlY3RlZCcpICE9PSBmYWxzZSB8fCBsRnVuYy5MaXN0c1tsaXN0TmFtZV0ubWFpbltpXS5zZWN0aW9uID09PSBzZWxTZWN0aW9uKSB7XHJcblx0XHRcdFx0XHQvLyBTZXQgc2VsU2VjdGlvbiB0byBzZWN0aW9uIG9mIGEgc2VsZWN0ZWQgaXRlbS5cclxuXHRcdFx0XHRcdGlmKGxGdW5jLkxpc3RzW2xpc3ROYW1lXS5tYWluW2ldLnNlY3Rpb24gIT09ICcnKSB7XHJcblx0XHRcdFx0XHRcdHNlbFNlY3Rpb24gPSBsRnVuYy5MaXN0c1tsaXN0TmFtZV0ubWFpbltpXS5zZWN0aW9uO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0Ly8gSWYgdGhlIG1vdmVtZW50IHdvdWxkIHB1dCB0aGUgaXRlbSBvdXRzaWRlIG9mIGxpc3QgYm91bmRhcmllcyBvciBhbm90aGVyIHNlbGVjdGlvbiBoYXMgaGl0IHRob3NlIGJvdW5kYXJpZXMgZG9uJ3QgbW92ZS5cclxuXHRcdFx0XHRcdGlmKGkrZGlyZWN0aW9uID49IDAgJiYgaStkaXJlY3Rpb24gPCBsaXN0TGVuICYmICFsRnVuYy5MaXN0c1tsaXN0TmFtZV0ubWFpbltpK2RpcmVjdGlvbl0uc2VsZWN0ZWQpIHtcclxuXHRcdFx0XHRcdFx0Ly8gSWYgdGhlIG5leHQgaXRlbSBpcyBpbiBhIGRlZmluZWQgc2VjdGlvbiwgbmVlZCB0byBjaGVjayAmIGNvdW50IGl0ZW1zIGluIHNlY3Rpb24gdG8ganVtcCBvdmVyIG9yIHN0b3AgbW92ZW1lbnQuXHJcblx0XHRcdFx0XHRcdGlmKGxGdW5jLm1haW5MaXN0W2xpc3ROdW1dW2krZGlyZWN0aW9uXS5zZWN0aW9uICE9PSAnJyAmJiBsRnVuYy5tYWluTGlzdFtsaXN0TnVtXVtpXS5zZWN0aW9uICE9PSBsRnVuYy5tYWluTGlzdFtsaXN0TnVtXVtpK2RpcmVjdGlvbl0uc2VjdGlvbikge1xyXG5cdFx0XHRcdFx0XHRcdG5leHRTZWN0aW9uID0gbEZ1bmMuTGlzdHNbbGlzdE5hbWVdLm1haW5baStkaXJlY3Rpb25dLnNlY3Rpb247XHJcblx0XHRcdFx0XHRcdFx0bXVsdGlwbGllciA9IDA7XHJcblx0XHRcdFx0XHRcdFx0Ly8gTG9vcCBiYWNrIHRocm91Z2ggYXJyYXkgaW4gdGhlIGRpcmVjdGlvbiBvZiBtb3ZlbWVudC5cclxuXHRcdFx0XHRcdFx0XHRmb3IodmFyIGogPSBpICsgZGlyZWN0aW9uOyBqIDwgbGlzdExlbiAmJiBqID49IDA7IGogPSBqICsgZGlyZWN0aW9uKSB7XHJcblx0XHRcdFx0XHRcdFx0XHQvLyBJZiB0aGUgaXRlbSBpcyBpbiB0aGUgc2VjdGlvbi4uLlxyXG5cdFx0XHRcdFx0XHRcdFx0aWYobEZ1bmMuTGlzdHNbbGlzdE5hbWVdLm1haW5bal0uc2VjdGlvbiA9PT0gbmV4dFNlY3Rpb24pIHtcclxuXHRcdFx0XHRcdFx0XHRcdFx0Ly8gSWYgc2VsZWN0ZWQgc3RvcCBtb3ZlbWVudCBhbmQgYnJlYWsuXHJcblx0XHRcdFx0XHRcdFx0XHRcdGlmKGxGdW5jLm1haW5MaXN0W2xpc3ROdW1dW2pdLnNlbGVjdGVkKSB7XHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0bXVsdGlwbGllciA9IDA7XHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0XHRcdFx0Ly8gSWYgbm90LCBjb3VudCBzZWN0aW9uLlxyXG5cdFx0XHRcdFx0XHRcdFx0XHRtdWx0aXBsaWVyKys7XHJcblx0XHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0XHRcdFx0XHQvLyBCcmVhayBsb29wIGF0IGZpcnN0IGl0ZW0gbm90IGluIHNlY3Rpb24uXHJcblx0XHRcdFx0XHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHQvLyBGaW5hbCBjaGVjazogb25seSBtb3ZlIGFuIGl0ZW0gaWYgaXQgaXMgc2VsZWN0ZWQgb3IgdG8gZW5zdXJlIGl0ZW1zIG9mIHRoZSBzYW1lIHNlY3Rpb24gc3RpY2sgdG9nZXRoZXJcclxuXHRcdFx0XHRcdFx0aWYobEZ1bmMuTGlzdHNbbGlzdE5hbWVdLm1haW5baV0uc2VsZWN0ZWQgfHwgbEZ1bmMuTGlzdHNbbGlzdE5hbWVdLm1haW5baStkaXJlY3Rpb25dLnNlY3Rpb24gIT09IGxGdW5jLkxpc3RzW2xpc3ROYW1lXS5tYWluW2ldLnNlY3Rpb24pIHtcclxuXHRcdFx0XHRcdFx0XHRsRnVuYy5MaXN0c1tsaXN0TmFtZV0ubWFpbi5zcGxpY2UoaSsoZGlyZWN0aW9uKm11bHRpcGxpZXIpLDAsbEZ1bmMuTGlzdHNbbGlzdE5hbWVdLm1haW4uc3BsaWNlKGksMSlbMF0pO1xyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHRcdC8vIFJlc2V0IG9yZGVyIHZhcmlhYmxlIGZvciBkYXRhYmFzZS5cclxuXHRcdFx0cmVzZXRPcmRlcihrZXksb3JkS2V5LGxpc3ROYW1lKTtcclxuXHRcdH07XHJcblx0XHRcclxuXHR9XSk7XHJcbn0pIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
