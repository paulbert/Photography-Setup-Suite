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
				inline:'@?',
				tmplt:'='
			},
			template: '<div ng-include="templateUrl"></div>',
			controller:'filterBarController',
			controllerAs:'fbar',
			link: function(scope,element,attrs) {
				scope.templateUrl = scope.tmplt.base + scope.tmplt.fileName;
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
				addFuncs:'=funcs',
				tmplt:'='
			},
			template: '<div ng-include="templateUrl"></div>',
			controller:'listController',
			controllerAs:'list',
			link: function(scope,element,attrs) {
				scope.templateUrl = scope.tmplt.base + scope.tmplt.fileName;
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
				doAction:'=func',
				base:'@?'
			},
			controller:'overlayController',
			controllerAs:'over',
			template: '<div ng-include="templateUrl"></div>',
			link: function(scope,element,attrs) {
				// If no base is specified, use location if installed via bower.
				if(typeof scope.base === 'undefined') {
					scope.base = '/bower_components/Photography-Setup-Suite/templates/overlay/';
				}
				scope.templateUrl = scope.base + 'overlay.html';
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
					base:'=?'
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
	.controller('filterBarController', ['$scope', function($scope) {
			
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
		.controller('overlayController', ['$scope',function($scope) {
			
			this.cancelAction = function() {
				$scope.messageNum = 0;
			};
			
		}])
})();
(function() {
	angular.module('listMod')
	.controller('listController',['$scope','$rootScope','listFunctions',function($scope,$rootScope,listFunctions) {
		
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
			return listFunctions.filterCheck(value,index,$scope.search,key,listName);
		};
		
		// Returns the length a list (main list if not specified).
		this.getLength = function(listName,subList) {
			if(!subList) {
				subList = 'main';
			}
			return listFunctions.Lists[listName][subList].length;
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
	.service('listFunctions', ['$q','filterFunctions',function ($q,filterFunctions) {
		
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
})();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImZpbHRlcnMvZmlsdGVyRGlyZWN0aXZlLmpzIiwibGlzdHMvbGlzdERpcmVjdGl2ZS5qcyIsIm92ZXJsYXkvb3ZlcmxheURpcmVjdGl2ZS5qcyIsImZpbHRlcnMvY29tcG9uZW50cy9maWx0ZXJDaGVja2JveENvbXBvbmVudERpcmVjdGl2ZS5qcyIsImZpbHRlcnMvY29tcG9uZW50cy9maWx0ZXJRdWVyeUNvbXBvbmVudERpcmVjdGl2ZS5qcyIsImZpbHRlckNvbnRyb2xsZXIuanMiLCJmaWx0ZXJTZXJ2aWNlLmpzIiwiY29tcG9uZW50cy9maWx0ZXJDb21wb25lbnRDb250cm9sbGVyLmpzIiwib3ZlcmxheUNvbnRyb2xsZXIuanMiLCJsaXN0Q29udHJvbGxlci5qcyIsImxpc3RTZXJ2LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FDSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQy9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDM0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDOUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM1Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6InBob3RvLXRvb2xzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCkge1xuXHRhbmd1bGFyLm1vZHVsZSgncGhvdG9FZGl0Q29tcG9uZW50cycsIFsnbGlzdE1vZCcsJ2ZpbHRlck1vZCcsJ292ZXJsYXlNb2QnXSk7XG5cdFxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcblx0XHJcblx0LypcclxuXHRTZWFyY2ggdmFyaWFibGUgc2hvdWxkIGJlIGFuIGFycmF5IG9mIG9iamVjdHMgbmFtZWQgdGhlIHNhbWUgYXMgdGhlIHByb3BlcnRpZXMgb2YgdGhlIG9iamVjdHMgd2l0aGluIHRoZSBsaXN0LlxyXG5cdFx0UmVxdWlyZXMgYSAncXVlcnknIHByb3BlcnR5IHdpdGhpbiBvYmplY3Qgd2hpY2ggaXMgbW9kZWxlZCB0byBhIHRleHQvaW5wdXQgZmlsdGVyLlxyXG5cdFx0SWYgdGhlIHNlYXJjaGVkIHByb3BlcnR5IGlzIGFuIGFycmF5IG9mIG9iamVjdHMgKGlmLCBmb3IgZXhhbXBsZSwgaW1hZ2VzIGNhbiBiZSBpbiBtYW55IGdhbGxlcnkgZ3JvdXBpbmdzKSwgYWRkICdpc0FycmF5JyBwcm9wZXJ0eSBhbmQgc2V0IHRvIHRydWUsIGFsc28gYWRkICdzZWFyY2hPbicgcHJvcGVydHkgYW5kIHNldCB0byB0aGUgbmFtZSBvZiB0aGUgcHJvcGVydHkgd2l0aGluIG9iamVjdHMuXHJcblx0XHRFeGFtcGxlOiBpbWFnZXMgPSBbIHtpbWduYW1lOiAnaW1nMS5qcGcnLCBnYWxsZXJpZXM6IFsgeyBpZDoxLCBuYW1lOidnYWxsZXJ5MScgfSwgeyBpZDoyLCBuYW1lOidnYWxsZXJ5Mid9IF19LCAuLi5dXHJcblx0XHRzZWFyY2ggPSB7IGdhbGxlcmllczogeyBxdWVyeTonJywgaXNBcnJheTogdHJ1ZSwgc2VhcmNoT246ICduYW1lJyB9IH1cclxuXHRcdEZvciBhIGNoZWNrYm94IGZpbHRlciwgaW5jbHVkZSBhbiBvYmplY3QgY2FsbGVkICdjaGVja2JveGVzJyB3aXRoIGEgJ25vbmUnIHByb3BlcnR5IGFuZCBhbGwgcG9zc2libGUgdmFsdWVzIGluIDAtbiBwcm9wZXJ0eS5cclxuXHRcdEJhc2VkIG9uIGFib3ZlIGV4YW1wbGU6IHNlYXJjaCA9IHsgZ2FsbGVyaWVzOiB7IC4uLiBjaGVja2JveGVzOiB7IG5vbmU6IHRydWUsIDA6J2dhbGxlcnkxJywxOidnYWxsZXJ5MicgfSB9XHJcblx0Ki9cclxuXHRcclxuXHRhbmd1bGFyLm1vZHVsZSgnZmlsdGVyTW9kJyxbXSlcclxuXHQuZGlyZWN0aXZlKCdmaWx0ZXJCYXInLCBmdW5jdGlvbigpIHtcclxuXHRcdHJldHVybiB7XHJcblx0XHRcdHNjb3BlOiB7XHJcblx0XHRcdFx0c2VhcmNoOic9JyxcclxuXHRcdFx0XHRmcG9zaXRpb246Jz0/JyxcclxuXHRcdFx0XHRpbmxpbmU6J0A/JyxcclxuXHRcdFx0XHR0bXBsdDonPSdcclxuXHRcdFx0fSxcclxuXHRcdFx0dGVtcGxhdGU6ICc8ZGl2IG5nLWluY2x1ZGU9XCJ0ZW1wbGF0ZVVybFwiPjwvZGl2PicsXHJcblx0XHRcdGNvbnRyb2xsZXI6J2ZpbHRlckJhckNvbnRyb2xsZXInLFxyXG5cdFx0XHRjb250cm9sbGVyQXM6J2ZiYXInLFxyXG5cdFx0XHRsaW5rOiBmdW5jdGlvbihzY29wZSxlbGVtZW50LGF0dHJzKSB7XHJcblx0XHRcdFx0c2NvcGUudGVtcGxhdGVVcmwgPSBzY29wZS50bXBsdC5iYXNlICsgc2NvcGUudG1wbHQuZmlsZU5hbWU7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9KVxyXG5cdDtcclxuXHRcdFxyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcblx0YW5ndWxhci5tb2R1bGUoJ2xpc3RNb2QnLFtdKVxuXHQuZGlyZWN0aXZlKCdsaXN0T2ZJdGVtcycsZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdHNjb3BlOiB7XG5cdFx0XHRcdHNlYXJjaDonPScsXG5cdFx0XHRcdGxpc3ROYW1lOic9bGlzdCcsXG5cdFx0XHRcdGtleU5hbWU6J0BrZXknLFxuXHRcdFx0XHRvcmRLZXk6J0BvcmROYW1lJyxcblx0XHRcdFx0Ly8gQWRkaXRpb25hbCBmdW5jdGlvbnMgdG8gYmUgY2FsbGVkIGZyb20gYnV0dG9ucyBpbiB0aGUgbGlzdCAoc2F2ZSBpbmZvLCBkZWxldGUsIGV0Yylcblx0XHRcdFx0YWRkRnVuY3M6Jz1mdW5jcycsXG5cdFx0XHRcdHRtcGx0Oic9J1xuXHRcdFx0fSxcblx0XHRcdHRlbXBsYXRlOiAnPGRpdiBuZy1pbmNsdWRlPVwidGVtcGxhdGVVcmxcIj48L2Rpdj4nLFxuXHRcdFx0Y29udHJvbGxlcjonbGlzdENvbnRyb2xsZXInLFxuXHRcdFx0Y29udHJvbGxlckFzOidsaXN0Jyxcblx0XHRcdGxpbms6IGZ1bmN0aW9uKHNjb3BlLGVsZW1lbnQsYXR0cnMpIHtcblx0XHRcdFx0c2NvcGUudGVtcGxhdGVVcmwgPSBzY29wZS50bXBsdC5iYXNlICsgc2NvcGUudG1wbHQuZmlsZU5hbWU7XG5cdFx0XHR9XG5cdFx0fVxuXHR9KVxuXHQ7XG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuXHRcclxuXHRhbmd1bGFyLm1vZHVsZSgnb3ZlcmxheU1vZCcsW10pXHJcblx0LmRpcmVjdGl2ZSgnb3ZlcmxheScsIGZ1bmN0aW9uKCkge1xyXG5cdFx0cmV0dXJuIHtcclxuXHRcdFx0c2NvcGU6IHtcclxuXHRcdFx0XHRtZXNzYWdlOic9JyxcclxuXHRcdFx0XHRtZXNzYWdlTnVtOic9bnVtYmVyJyxcclxuXHRcdFx0XHRidG5Db25maWc6Jz1jZmcnLFxyXG5cdFx0XHRcdC8vIEZ1bmN0aW9uIGZvciBhY3Rpb24gb2Ygb3ZlcmxheSAoY2FuY2VsL2JhY2sgaXMgaW4gY29udHJvbGxlcilcclxuXHRcdFx0XHRkb0FjdGlvbjonPWZ1bmMnLFxyXG5cdFx0XHRcdGJhc2U6J0A/J1xyXG5cdFx0XHR9LFxyXG5cdFx0XHRjb250cm9sbGVyOidvdmVybGF5Q29udHJvbGxlcicsXHJcblx0XHRcdGNvbnRyb2xsZXJBczonb3ZlcicsXHJcblx0XHRcdHRlbXBsYXRlOiAnPGRpdiBuZy1pbmNsdWRlPVwidGVtcGxhdGVVcmxcIj48L2Rpdj4nLFxyXG5cdFx0XHRsaW5rOiBmdW5jdGlvbihzY29wZSxlbGVtZW50LGF0dHJzKSB7XHJcblx0XHRcdFx0Ly8gSWYgbm8gYmFzZSBpcyBzcGVjaWZpZWQsIHVzZSBsb2NhdGlvbiBpZiBpbnN0YWxsZWQgdmlhIGJvd2VyLlxyXG5cdFx0XHRcdGlmKHR5cGVvZiBzY29wZS5iYXNlID09PSAndW5kZWZpbmVkJykge1xyXG5cdFx0XHRcdFx0c2NvcGUuYmFzZSA9ICcvYm93ZXJfY29tcG9uZW50cy9QaG90b2dyYXBoeS1TZXR1cC1TdWl0ZS90ZW1wbGF0ZXMvb3ZlcmxheS8nO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRzY29wZS50ZW1wbGF0ZVVybCA9IHNjb3BlLmJhc2UgKyAnb3ZlcmxheS5odG1sJztcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH0pXHJcblx0O1xyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuXHRcclxuXHRhbmd1bGFyLm1vZHVsZSgnZmlsdGVyTW9kJylcclxuXHQuZGlyZWN0aXZlKCdmaWx0ZXJDaGVja2JveCcsIGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRyZXR1cm4ge1xyXG5cdFx0XHRcdHNjb3BlOiB7XHJcblx0XHRcdFx0XHRpdGVtczonPScsXHJcblx0XHRcdFx0XHRzZWFyY2g6Jz0nLFxyXG5cdFx0XHRcdFx0YmFzZTonPSdcclxuXHRcdFx0XHR9LFxyXG5cdFx0XHRcdGNvbnRyb2xsZXI6J2ZpbHRlckNvbXBDb250cm9sbGVyJyxcclxuXHRcdFx0XHRjb250cm9sbGVyQXM6J2Zjb21wJyxcclxuXHRcdFx0XHR0ZW1wbGF0ZTogJzxkaXYgbmctaW5jbHVkZT1cInRlbXBsYXRlVXJsXCI+PC9kaXY+JyxcclxuXHRcdFx0XHRsaW5rOiBmdW5jdGlvbihzY29wZSxlbGVtZW50LGF0dHJzKSB7XHJcblx0XHRcdFx0XHQvLyBJZiBubyBiYXNlIGlzIHNwZWNpZmllZCwgdXNlIGxvY2F0aW9uIGlmIGluc3RhbGxlZCB2aWEgYm93ZXIuXHJcblx0XHRcdFx0XHRpZih0eXBlb2Ygc2NvcGUuYmFzZSA9PT0gJ3VuZGVmaW5lZCcpIHtcclxuXHRcdFx0XHRcdFx0c2NvcGUuYmFzZSA9ICcvYm93ZXJfY29tcG9uZW50cy9QaG90b2dyYXBoeS1TZXR1cC1TdWl0ZS90ZW1wbGF0ZXMvZmlsdGVycy8nO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0c2NvcGUudGVtcGxhdGVVcmwgPSBzY29wZS5iYXNlICsgJ2ZpbHRlckNoZWNrYm94ZXMuaHRtbCc7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9KVxyXG5cdDtcclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcblx0XHJcblx0YW5ndWxhci5tb2R1bGUoJ2ZpbHRlck1vZCcpXHJcblx0LmRpcmVjdGl2ZSgnZmlsdGVyUXVlcnknLCBmdW5jdGlvbigpIHtcclxuXHRcdFx0cmV0dXJuIHtcclxuXHRcdFx0XHRzY29wZToge1xyXG5cdFx0XHRcdFx0c2VhcmNoOic9JyxcclxuXHRcdFx0XHRcdGJhc2U6Jz0/J1xyXG5cdFx0XHRcdH0sXHJcblx0XHRcdFx0dGVtcGxhdGU6ICc8ZGl2IG5nLWluY2x1ZGU9XCJ0ZW1wbGF0ZVVybFwiPjwvZGl2PicsXHJcblx0XHRcdFx0bGluazogZnVuY3Rpb24oc2NvcGUsZWxlbWVudCxhdHRycykge1xyXG5cdFx0XHRcdFx0Ly8gSWYgbm8gYmFzZSBpcyBzcGVjaWZpZWQsIHVzZSBsb2NhdGlvbiBpZiBpbnN0YWxsZWQgdmlhIGJvd2VyLlxyXG5cdFx0XHRcdFx0aWYodHlwZW9mIHNjb3BlLmJhc2UgPT09ICd1bmRlZmluZWQnKSB7XHJcblx0XHRcdFx0XHRcdHNjb3BlLmJhc2UgPSAnL2Jvd2VyX2NvbXBvbmVudHMvUGhvdG9ncmFwaHktU2V0dXAtU3VpdGUvdGVtcGxhdGVzL2ZpbHRlcnMvJztcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdHNjb3BlLnRlbXBsYXRlVXJsID0gc2NvcGUuYmFzZSArICdmaWx0ZXJRdWVyeS5odG1sJztcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdH0pXHJcblx0O1xyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuXHRcclxuXHRhbmd1bGFyLm1vZHVsZSgnZmlsdGVyTW9kJylcclxuXHQuY29udHJvbGxlcignZmlsdGVyQmFyQ29udHJvbGxlcicsIFsnJHNjb3BlJywgZnVuY3Rpb24oJHNjb3BlKSB7XHJcblx0XHRcdFxyXG5cdFx0XHR0aGlzLmdhbGxlcmllcyA9IFtdO1xyXG5cdFx0XHRcclxuXHRcdFx0Ly8gVG9nZ2xlcyB0aGUgcG9zaXRpb24gb2YgdGhlIGxlZnQgc2lkZSBmaWx0ZXIgY29sdW1uXHJcblx0XHRcdHRoaXMuZmlsdGVyVG9nZ2xlID0gZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0dmFyIGZQb3MgPSAkc2NvcGUuZnBvc2l0aW9uO1xyXG5cdFx0XHRcdCRzY29wZS5mcG9zaXRpb24gPSAoZlBvcyA9PT0gMCA/IC0xOTAgOiAwKTtcclxuXHRcdFx0fTtcclxuXHRcdFx0XHJcblx0XHRcdHZhciBmQ3RybCA9IHRoaXM7XHJcblx0XHRcdFxyXG5cdFx0fV0pXHJcblx0O1xyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuXHRcclxuXHRhbmd1bGFyLm1vZHVsZSgnZmlsdGVyTW9kJylcclxuXHQuc2VydmljZSgnZmlsdGVyRnVuY3Rpb25zJywgZnVuY3Rpb24oKSB7XHJcblx0XHRcdFxyXG5cdFx0dmFyIGZGdW5jdGlvbnMgPSB0aGlzO1xyXG5cdFx0XHJcblx0XHQvLyBDaGVja3MgZm9yIGEgbWF0Y2ggd2l0aCB0aGUgZmlsdGVycy5cclxuXHRcdC8vIElmIHRoZSB2YWx1ZSBpcyBhbiBhcnJheSwgY2hlY2tzIGFsbCB2YWx1ZXMgZm9yIG9uZSBtYXRjaC5cclxuXHRcdC8vIElmIG5vdCwganVzdCBjaGVja3Mgc2luZ2xlIHZhbHVlLlxyXG5cdFx0dGhpcy5maWx0ZXJDaGVjayA9IGZ1bmN0aW9uKHZhbHVlLHNlYXJjaCkge1xyXG5cdFx0XHR2YXIgYWxsTWF0Y2ggPSB0cnVlO1xyXG5cdFx0XHRcclxuXHRcdFx0Zm9yKHZhciBrZXkgaW4gc2VhcmNoKSB7XHJcblx0XHRcdFx0aWYoc2VhcmNoLmhhc093blByb3BlcnR5KGtleSkpIHtcclxuXHRcdFx0XHRcdHZhciB0aGlzVmFsdWUgPSB2YWx1ZVtrZXldO1xyXG5cdFx0XHRcdFx0aWYoc2VhcmNoW2tleV0uaXNBcnJheSkge1xyXG5cdFx0XHRcdFx0XHR2YXIgbnVtVmFsdWVzID0gdGhpc1ZhbHVlLmxlbmd0aCxcclxuXHRcdFx0XHRcdFx0XHRtYXRjaEZvdW5kID0gZmFsc2U7XHJcblx0XHRcdFx0XHRcdGZvcih2YXIgaSA9IDA7IGkgPCBudW1WYWx1ZXM7IGkrKykge1xyXG5cdFx0XHRcdFx0XHRcdGlmKGNoZWNrVmFsdWUodGhpc1ZhbHVlW2ldLCBzZWFyY2gsIGtleSkpIHtcclxuXHRcdFx0XHRcdFx0XHRcdG1hdGNoRm91bmQgPSB0cnVlO1xyXG5cdFx0XHRcdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdGlmKCFtYXRjaEZvdW5kKSB7XHJcblx0XHRcdFx0XHRcdFx0YWxsTWF0Y2ggPSBmYWxzZTtcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdFx0YWxsTWF0Y2ggPSBjaGVja1ZhbHVlKHRoaXNWYWx1ZSwgc2VhcmNoLCBrZXkpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0aWYoYWxsTWF0Y2ggPT09IGZhbHNlKSB7XHJcblx0XHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0XHRcclxuXHRcdFx0cmV0dXJuIGFsbE1hdGNoO1xyXG5cdFx0XHRcclxuXHRcdH07XHJcblx0XHRcclxuXHRcdC8vIEZ1bmN0aW9uIHRoYXQgY2hlY2tzIHZhbHVlIGFnYWluc3QgdGhlIHF1ZXJ5IGZpbHRlciAmIGNoZWNrYm94ZXNcclxuXHRcdHZhciBjaGVja1ZhbHVlID0gZnVuY3Rpb24odmFsdWUsIHNlYXJjaCwga2V5KSB7XHJcblx0XHRcdFxyXG5cdFx0XHR2YXIgY2hlY2tNYXRjaCA9IHRydWUsXHJcblx0XHRcdFx0dmFsdWVNYXRjaCA9IGZhbHNlLFxyXG5cdFx0XHRcdGNoZWNrYm94ZXMgPSBzZWFyY2hba2V5XS5jaGVja2JveGVzLFxyXG5cdFx0XHRcdHNlYXJjaE9uID0gc2VhcmNoW2tleV0uc2VhcmNoT247XHJcblx0XHRcdFx0XHJcblx0XHRcdGlmKHNlYXJjaE9uICYmIHZhbHVlKSB7XHJcblx0XHRcdFx0dmFyIHRoaXNWYWx1ZSA9IHZhbHVlW3NlYXJjaE9uXTtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHR2YXIgdGhpc1ZhbHVlID0gdmFsdWU7XHJcblx0XHRcdH1cclxuXHRcdFx0aWYoY2hlY2tib3hlcykge1xyXG5cdFx0XHRcdGNoZWNrTWF0Y2ggPSBjaGVja1RoZUJveGVzKHRoaXNWYWx1ZSxrZXksY2hlY2tib3hlcyk7XHJcblx0XHRcdH1cclxuXHRcdFx0dmFsdWVNYXRjaCA9IGZGdW5jdGlvbnMucXVlcnlGaWx0ZXJDaGVjayh0aGlzVmFsdWUsc2VhcmNoW2tleV0ucXVlcnkpO1xyXG5cdFx0XHRcclxuXHRcdFx0cmV0dXJuIGNoZWNrTWF0Y2ggJiYgdmFsdWVNYXRjaDtcclxuXHRcdH07XHJcblx0XHRcclxuXHRcdC8vIENoZWNrcyBxdWVyeSB2YWx1ZSBhZ2FpbnN0IGFjdHVhbC4gIEFsc28gdXNlZCB0byBoaWRlL3Nob3cgY2hlY2tib3hlcyBiYXNlZCBvbiB0aGUgdHlwZWQgZmlsdGVyLlxyXG5cdFx0dGhpcy5xdWVyeUZpbHRlckNoZWNrID0gZnVuY3Rpb24odmFsdWUscXVlcnkpIHtcclxuXHRcdFx0aWYoIXZhbHVlKSB7XHJcblx0XHRcdFx0dmFsdWUgPSAnJztcclxuXHRcdFx0fVxyXG5cdFx0XHRyZXR1cm4gdmFsdWUudG9Mb3dlckNhc2UoKS5pbmRleE9mKHF1ZXJ5LnRvTG93ZXJDYXNlKCkpID4gLTE7XHJcblx0XHR9O1xyXG5cdFx0XHJcblx0XHQvLyBGdW5jdGlvbiB0byBsb29wIHRocm91Z2ggdGhlIGNoZWNrYm94ZXMgdmFyaWFibGUgYW5kIHJldHVybiB0cnVlIGlmIHRoZSB2YWx1ZSBpcyBhIG1hdGNoXHJcblx0XHR2YXIgY2hlY2tUaGVCb3hlcyA9IGZ1bmN0aW9uICh2YWx1ZSxmaWx0ZXJzZXQsY2hlY2tib3hlcykge1xyXG5cdFx0XHRpZih2YWx1ZSkge1xyXG5cdFx0XHRcdHZhciBpID0gMDtcclxuXHRcdFx0XHRkbyB7XHJcblx0XHRcdFx0XHRpZih2YWx1ZSA9PT0gY2hlY2tib3hlc1tpXSkge1xyXG5cdFx0XHRcdFx0XHRyZXR1cm4gdHJ1ZTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdGkrKztcclxuXHRcdFx0XHR9IHdoaWxlKHR5cGVvZiBjaGVja2JveGVzW2ldICE9PSAndW5kZWZpbmVkJylcclxuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0aWYoY2hlY2tib3hlc1snbm9uZSddKSB7XHJcblx0XHRcdFx0XHRyZXR1cm4gdHJ1ZTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0XHR9XHJcblx0XHR9O1xyXG5cdFx0XHJcblx0fSlcclxuXHQ7XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG5cdFxyXG5cdGFuZ3VsYXIubW9kdWxlKCdmaWx0ZXJNb2QnKVxyXG5cdC5jb250cm9sbGVyKCdmaWx0ZXJDb21wQ29udHJvbGxlcicsIFsnJHNjb3BlJywnZmlsdGVyRnVuY3Rpb25zJywgZnVuY3Rpb24oJHNjb3BlLGZpbHRlckZ1bmN0aW9ucykge1xyXG5cdFx0dGhpcy5vbmx5Qm94ID0gZnVuY3Rpb24oYm94TnVtLGJveE5hbWUpIHtcclxuXHRcdFx0dmFyIGkgPSAwO1xyXG5cdFx0XHRkbyB7XHJcblx0XHRcdFx0JHNjb3BlLnNlYXJjaC5jaGVja2JveGVzW2ldID0gZmFsc2U7XHRcdFx0XHRcdFxyXG5cdFx0XHRcdGkrKztcclxuXHRcdFx0fSB3aGlsZSh0eXBlb2YgJHNjb3BlLnNlYXJjaC5jaGVja2JveGVzW2ldICE9PSAndW5kZWZpbmVkJylcclxuXHRcdFx0aWYoYm94TnVtID09PSAnbm9uZScpIHtcclxuXHRcdFx0XHQkc2NvcGUuc2VhcmNoLmNoZWNrYm94ZXNbJ25vbmUnXSA9IHRydWU7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0JHNjb3BlLnNlYXJjaC5jaGVja2JveGVzW2JveE51bV0gPSBib3hOYW1lO1xyXG5cdFx0XHRcdCRzY29wZS5zZWFyY2guY2hlY2tib3hlc1snbm9uZSddID0gZmFsc2U7XHJcblx0XHRcdH1cclxuXHRcdH07XHJcblx0XHRcclxuXHRcdHRoaXMuYWxsQm94ZXMgPSBmdW5jdGlvbiAoKSB7XHJcblx0XHRcdGZvcih2YXIgaSA9IDA7IGkgPCAkc2NvcGUuaXRlbXMubGVuZ3RoOyBpKyspIHtcclxuXHRcdFx0XHQkc2NvcGUuc2VhcmNoLmNoZWNrYm94ZXNbaV0gPSAkc2NvcGUuaXRlbXNbaV07XHJcblx0XHRcdH1cclxuXHRcdFx0JHNjb3BlLnNlYXJjaC5jaGVja2JveGVzWydub25lJ10gPSB0cnVlO1xyXG5cdFx0fTtcclxuXHRcdFxyXG5cdFx0dGhpcy5zaG93Q2hlY2tib3ggPSBmdW5jdGlvbiAodmFsdWUscXVlcnkpIHtcclxuXHRcdFx0cmV0dXJuIGZpbHRlckZ1bmN0aW9ucy5xdWVyeUZpbHRlckNoZWNrKHZhbHVlLHF1ZXJ5KTtcclxuXHRcdH07XHJcblx0fV0pXHJcblx0O1xyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuXHRcclxuXHRhbmd1bGFyLm1vZHVsZSgnb3ZlcmxheU1vZCcpXHJcblx0XHQuY29udHJvbGxlcignb3ZlcmxheUNvbnRyb2xsZXInLCBbJyRzY29wZScsZnVuY3Rpb24oJHNjb3BlKSB7XHJcblx0XHRcdFxyXG5cdFx0XHR0aGlzLmNhbmNlbEFjdGlvbiA9IGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdCRzY29wZS5tZXNzYWdlTnVtID0gMDtcclxuXHRcdFx0fTtcclxuXHRcdFx0XHJcblx0XHR9XSlcclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcblx0YW5ndWxhci5tb2R1bGUoJ2xpc3RNb2QnKVxyXG5cdC5jb250cm9sbGVyKCdsaXN0Q29udHJvbGxlcicsWyckc2NvcGUnLCckcm9vdFNjb3BlJywnbGlzdEZ1bmN0aW9ucycsZnVuY3Rpb24oJHNjb3BlLCRyb290U2NvcGUsbGlzdEZ1bmN0aW9ucykge1xyXG5cdFx0XHJcblx0XHR2YXIgbEN0cmwgPSB0aGlzLFxyXG5cdFx0XHRrZXkgPSAkc2NvcGUua2V5TmFtZSxcclxuXHRcdFx0bGlzdE5hbWUgPSAkc2NvcGUubGlzdE5hbWU7XHJcblx0XHRcclxuXHRcdC8vIFNldHMgc2VsZWN0ZWRMaXN0IGFzIGVtcHR5IGFycmF5IGZvciB0aGlzIGxpc3QgbnVtYmVyLlxyXG5cdFx0bGlzdEZ1bmN0aW9ucy5jbGVhclNlbGVjdGVkKGxpc3ROYW1lKTtcclxuXHRcdHRoaXMuaGlkZU92ZXJsYXkgPSB0cnVlO1xyXG5cdFx0XHJcblx0XHR0aGlzLkxpc3QgPSBsaXN0RnVuY3Rpb25zO1xyXG5cdFx0dGhpcy5uZXdTZWN0aW9uID0gJyc7XHJcblx0XHR0aGlzLmN1cnJlbnRTZWN0aW9uID0ge3NlY3Rpb246JycsaWQ6MH07XHJcblx0XHR0aGlzLm9yZGVyU2F2ZVBlbmRpbmcgPSBmYWxzZTtcclxuXHRcdFxyXG5cdFx0Ly8gVG9nZ2xlIHNlbGVjdGlvbiBvZiBpdGVtIC0gY2hhbmdlcyBzZWxlY3QgcHJvcGVydHkgb2YgaXRlbSBiZXR3ZWVuIHRydWUvZmFsc2UgYW5kIGFkZHMvcmVtb3ZlcyBmcm9tIHNlbGVjdGlvbiBhcnJheSAoc2VlIGxpc3RTZXJ2LmpzIGZvciBmdW5jdGlvbilcclxuXHRcdHRoaXMudG9nZ2xlU2VsZWN0ID0gZnVuY3Rpb24oaXRlbSxpbmRleCkge1xyXG5cdFx0XHRsaXN0RnVuY3Rpb25zLnRvZ2dsZVNlbGVjdChpdGVtLGluZGV4LGtleSxsaXN0TmFtZSk7XHRcdFxyXG5cdFx0fTtcclxuXHRcdFxyXG5cdFx0Ly8gQ3VzdG9tIGZpbHRlciBmdW5jdGlvbiBjaGVja2luZyBpdGVtIGZpcnN0IGFnYWluc3QgYSBsaXN0IG9mIGV4Y2x1c2lvbnMgdGhlbiBhZ2FpbnN0IGN1c3RvbSBmaWx0ZXIgdmFsdWVzXHJcblx0XHR0aGlzLmZpbHRlckNoZWNrID0gZnVuY3Rpb24odmFsdWUsaW5kZXgsYXJyYXkpIHtcclxuXHRcdFx0cmV0dXJuIGxpc3RGdW5jdGlvbnMuZmlsdGVyQ2hlY2sodmFsdWUsaW5kZXgsJHNjb3BlLnNlYXJjaCxrZXksbGlzdE5hbWUpO1xyXG5cdFx0fTtcclxuXHRcdFxyXG5cdFx0Ly8gUmV0dXJucyB0aGUgbGVuZ3RoIGEgbGlzdCAobWFpbiBsaXN0IGlmIG5vdCBzcGVjaWZpZWQpLlxyXG5cdFx0dGhpcy5nZXRMZW5ndGggPSBmdW5jdGlvbihsaXN0TmFtZSxzdWJMaXN0KSB7XHJcblx0XHRcdGlmKCFzdWJMaXN0KSB7XHJcblx0XHRcdFx0c3ViTGlzdCA9ICdtYWluJztcclxuXHRcdFx0fVxyXG5cdFx0XHRyZXR1cm4gbGlzdEZ1bmN0aW9ucy5MaXN0c1tsaXN0TmFtZV1bc3ViTGlzdF0ubGVuZ3RoO1xyXG5cdFx0fTtcclxuXHRcdFxyXG5cdFx0Ly8gQ2hhbmdlIG9yZGVyIG9mIGxpc3QuXHJcblx0XHR0aGlzLm1vdmVJdGVtcyA9IGZ1bmN0aW9uKGRpcmVjdGlvbixrZXkpIHtcclxuXHRcdFx0bGlzdEZ1bmN0aW9ucy5tb3ZlSXRlbXMoZGlyZWN0aW9uLGtleSxvcmRLZXksbGlzdE5hbWUpO1xyXG5cdFx0XHR0aGlzLm9yZGVyU2F2ZVBlbmRpbmcgPSB0cnVlO1xyXG5cdFx0fTtcclxuXHRcdFxyXG5cdH1dKVxyXG5cdFxyXG5cdDtcclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcblx0YW5ndWxhci5tb2R1bGUoJ2xpc3RNb2QnKVxyXG5cdC5zZXJ2aWNlKCdsaXN0RnVuY3Rpb25zJywgWyckcScsJ2ZpbHRlckZ1bmN0aW9ucycsZnVuY3Rpb24gKCRxLGZpbHRlckZ1bmN0aW9ucykge1xyXG5cdFx0XHJcblx0XHR2YXIgbEZ1bmMgPSB0aGlzLFxyXG5cdFx0XHRlZGl0TGlzdCA9IFtdLFxyXG5cdFx0XHRjdXJyZW50RmlsdGVyZWRMaXN0ID0gW107XHJcblx0XHRcclxuXHRcdHRoaXMuTGlzdHMgPSB7fTtcclxuXHRcdHRoaXMuc2VjdGlvbkxpc3QgPSBbe3NlY3Rpb246JycsaWQ6MH1dO1xyXG5cdFx0XHJcblx0XHR0aGlzLnNldExpc3QgPSBmdW5jdGlvbihsaXN0QXJyYXksbGlzdE5hbWUsZXhjbHVkZUFycmF5KSB7XHJcblx0XHRcdHRoaXMuTGlzdHNbbGlzdE5hbWVdID0geyBtYWluOmxpc3RBcnJheSxzZWxlY3RlZDpbXSxlZGl0OltdLGZpbHRlcmVkOltdLGV4Y2x1ZGU6ZXhjbHVkZUFycmF5IH07XHJcblx0XHR9O1xyXG5cdFx0XHJcblx0XHR0aGlzLmNsZWFyU2VsZWN0ZWQgPSBmdW5jdGlvbihsaXN0TmFtZSkge1xyXG5cdFx0XHR0aGlzLkxpc3RzW2xpc3ROYW1lXS5zZWxlY3RlZCA9IFtdO1xyXG5cdFx0fTtcclxuXHRcdFxyXG5cdFx0dGhpcy5jaGVja1NlbGVjdGVkID0gZnVuY3Rpb24obGlzdE5hbWUpIHtcclxuXHRcdFx0cmV0dXJuIHRoaXMuTGlzdHNbbGlzdE5hbWVdLnNlbGVjdGVkLmxlbmd0aCA9PT0gMDtcclxuXHRcdH07XHJcblx0XHRcclxuXHRcdHRoaXMubGlzdExlbmd0aCA9IGZ1bmN0aW9uKGxpc3ROYW1lLHN1Ykxpc3QpIHtcclxuXHRcdFx0c3ViTGlzdCA9IHR5cGVvZiBzdWJMaXN0ICE9PSAndW5kZWZpbmVkJyA/IHN1Ykxpc3QgOiAnbWFpbic7XHJcblx0XHRcdGlmKHRoaXMuTGlzdHNbbGlzdE5hbWVdKSB7XHJcblx0XHRcdFx0cmV0dXJuIHRoaXMuTGlzdHNbbGlzdE5hbWVdW3N1Ykxpc3RdLmxlbmd0aDtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRyZXR1cm4gMDtcclxuXHRcdFx0fVxyXG5cdFx0fTtcclxuXHRcdFxyXG5cdFx0Ly8gRmlyc3QgY2hlY2tzIGV4Y2x1ZGUgYXJyYXkgZm9yIGl0ZW0sIHRoZW4gY2hlY2tzIHNlYXJjaCB2YWx1ZSAoc2VlIGZpbHRlclNlcnZpY2UuanMpXHJcblx0XHR0aGlzLmZpbHRlckNoZWNrID0gZnVuY3Rpb24odmFsdWUsaW5kZXgsc2VhcmNoLGtleU5hbWUsbGlzdE5hbWUpIHtcclxuXHRcdFx0dmFyIGxpc3RDaGVjayA9IGZhbHNlLFxyXG5cdFx0XHRcdHNob3dJdGVtID0gZmFsc2U7XHJcblx0XHRcdGxpc3RDaGVjayA9IGxGdW5jLmZpbmRCeUlkKHZhbHVlW2tleU5hbWVdLGxpc3ROYW1lLGtleU5hbWUsJ2V4Y2x1ZGUnKTtcclxuXHRcdFx0aWYobGlzdENoZWNrID09PSBmYWxzZSkge1xyXG5cdFx0XHRcdHNob3dJdGVtID0gZmlsdGVyRnVuY3Rpb25zLmZpbHRlckNoZWNrKHZhbHVlLHNlYXJjaCk7XHJcblx0XHRcdFx0Ly8gRGVzZWxlY3QgaXRlbSBpZiB0aGUgZmlsdGVyIGV4Y2x1ZGVzIHRoZSBpdGVtXHJcblx0XHRcdFx0aWYodmFsdWUuc2VsZWN0ZWQgJiYgIXNob3dJdGVtICYmIGluZGV4ID49IDApIHtcclxuXHRcdFx0XHRcdGxGdW5jLmRlc2VsZWN0SXRlbSh2YWx1ZVtrZXlOYW1lXSxpbmRleCxrZXlOYW1lLGxpc3ROYW1lKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdFx0bEZ1bmMuc2V0RmlsdGVyZWQobGlzdE5hbWUsaW5kZXgsc2hvd0l0ZW0pO1xyXG5cdFx0XHRyZXR1cm4gc2hvd0l0ZW07XHJcblx0XHR9O1xyXG5cdFx0XHJcblx0XHQvLyBBZGRzIHByb3BlcnR5IHdpdGggZmlsdGVyIHN0YXR1cyBvZiBlbGVtZW50XHJcblx0XHR0aGlzLnNldEZpbHRlcmVkID0gZnVuY3Rpb24obGlzdE5hbWUsaW5kZXgsc2hvdykge1xyXG5cdFx0XHR0aGlzLkxpc3RzW2xpc3ROYW1lXS5tYWluW2luZGV4XS5zaG93SXRlbSA9IHNob3c7XHJcblx0XHR9O1xyXG5cdFx0XHJcblx0XHQvLyBDcmVhdGVzIGEgbGlzdCBvZiBvbmx5IHRoZSBjdXJyZW50bHkgZmlsdGVyZWQgZWxlbWVudHMgb2YgdGhlIG1haW4gYXJyYXkuIFJldHVybnMgdGhpcyBmaWx0ZXJlZCBhcnJheS5cclxuXHRcdHRoaXMuc2V0RmlsdGVyQXJyYXkgPSBmdW5jdGlvbihsaXN0TmFtZSkge1xyXG5cdFx0XHR2YXIgbWFpbkFycmF5ID0gdGhpcy5MaXN0c1tsaXN0TmFtZV0ubWFpbjtcclxuXHRcdFx0Zm9yKHZhciBpID0gMDsgaSA8IG1haW5BcnJheTsgaSsrKSB7XHJcblx0XHRcdFx0aWYobWFpbkFycmF5W2ldLnNob3dJdGVtID09PSB0cnVlKSB7XHJcblx0XHRcdFx0XHR0aGlzLkxpc3RzW2xpc3ROYW1lXS5maWx0ZXJlZC5wdXNoKG1haW5BcnJheVtpXSk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHRcdHJldHVybiB0aGlzLkxpc3RzW2xpc3ROYW1lXS5maWx0ZXJlZFxyXG5cdFx0fTtcclxuXHRcdFxyXG5cdFx0dGhpcy50b2dnbGVTZWxlY3QgPSBmdW5jdGlvbihpdGVtLGluZGV4LGtleSxsaXN0TmFtZSkge1xyXG5cdFx0XHRrZXkgPSBrZXkgPyBrZXkgOiAnaWQnO1xyXG5cdFx0XHR2YXIgaWQgPSBpdGVtW2tleV07XHJcblx0XHRcdGlmKCFpbmRleCAmJiBpbmRleCAhPT0gMCkge1xyXG5cdFx0XHRcdGluZGV4ID0gdGhpcy5maW5kQnlJZChpZCxsaXN0TmFtZSxrZXksJ21haW4nKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRpZighaXRlbS5zZWxlY3RlZCkge1xyXG5cdFx0XHRcdHRoaXMuc2VsZWN0SXRlbShpdGVtLGluZGV4LGtleSxsaXN0TmFtZSk7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0dGhpcy5kZXNlbGVjdEl0ZW0oaWQsaW5kZXgsa2V5LGxpc3ROYW1lKTtcclxuXHRcdFx0fVxyXG5cdFx0fTtcclxuXHJcblx0XHQvLyBGdW5jdGlvbiB0byBjcmVhdGUgYSBjb21tYSBzZXBhcmF0ZWQgbGlzdCBvZiBhIHBhcnRpY3VsYXIgcHJvcGVydHkgd2l0aGluIGFuIGFycmF5IFxyXG5cdFx0dGhpcy5tYWtlTGlzdCA9IGZ1bmN0aW9uKGxpc3ROYW1lLGtleU5hbWUsc3ViTGlzdCkge1xyXG5cdFx0XHRpZighc3ViTGlzdCkge1xyXG5cdFx0XHRcdHN1Ykxpc3QgPSAnbWFpbic7XHJcblx0XHRcdH1cclxuXHRcdFx0dmFyIGxpc3RBcnJheSA9IHRoaXMuTGlzdHNbbGlzdE5hbWVdW3N1Ykxpc3RdO1xyXG5cdFx0XHRmb3IodmFyIGkgPSAwOyBpIDwgbGlzdEFycmF5Lmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdFx0bWVzc2FnZSArPSBsaXN0QXJyYXlbaV1ba2V5TmFtZV07XHJcblx0XHRcdFx0aWYoaSA8IGxpc3RBcnJheS5sZW5ndGggLSAxKSB7XHJcblx0XHRcdFx0XHRtZXNzYWdlICs9ICcsICc7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHRcdHJldHVybiBtZXNzYWdlO1xyXG5cdFx0fTtcclxuXHJcblx0XHQvLyBSZXR1cm5zIHRoZSBpbmRleCBvZiB0aGUgaXRlbSB3aXRoaW4gdGhlIGFuIGFycmF5IChzcGVjaWZpZWQgYnkgbGlzdE5hbWUgYW5kIHN1Ykxpc3QpIG9yIGZhbHNlIGlmIG5vdCBmb3VuZC4gIFNlYXJjaCBieSBrZXkgKHNob3VsZCBiZSB1bmlxdWUgaWQuXHJcblx0XHR0aGlzLmZpbmRCeUlkID0gZnVuY3Rpb24oaWQsbGlzdE5hbWUsa2V5LHN1Ykxpc3QpIHtcclxuXHRcdFx0a2V5ID0gdHlwZW9mIGtleSAhPT0gJ3VuZGVmaW5lZCcgPyBrZXkgOiAnaWQnO1xyXG5cdFx0XHRzdWJMaXN0ID0gdHlwZW9mIHN1Ykxpc3QgIT09ICd1bmRlZmluZWQnID8gc3ViTGlzdCA6ICdtYWluJztcclxuXHRcdFx0dmFyIGxpc3RBcnJheSA9IHRoaXMuTGlzdHNbbGlzdE5hbWVdW3N1Ykxpc3RdO1xyXG5cdFx0XHRmb3IodmFyIGkgPSAwOyBpIDwgbGlzdEFycmF5Lmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdFx0aWYoU3RyaW5nKGxpc3RBcnJheVtpXVtrZXldKSA9PT0gU3RyaW5nKGlkKSkge1xyXG5cdFx0XHRcdFx0cmV0dXJuIGk7XHJcblx0XHRcdFx0fVx0XHRcdFxyXG5cdFx0XHR9XHJcblx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdH07XHJcblx0XHRcclxuXHRcdC8vIERlbGV0ZXMgaXRlbXMgZm91bmQgaW4gZGVsQXJyYXkgZnJvbSBtYWluTGlzdCBzZWFyY2hpbmcgYnkgaWQuIFJldHVybnMgbmV3IGFycmF5LlxyXG5cdFx0dGhpcy5kZWxldGVCeUlkID0gZnVuY3Rpb24oZGVsQXJyYXksaWROYW1lLGxpc3ROYW1lLHN1Ykxpc3QpIHtcclxuXHRcdFx0dmFyIG51bUl0ZW1zID0gZGVsQXJyYXkubGVuZ3RoO1xyXG5cdFx0XHRzdWJMaXN0ID0gdHlwZW9mIHN1Ykxpc3QgIT09ICd1bmRlZmluZWQnID8gc3ViTGlzdCA6ICdtYWluJztcclxuXHRcdFx0Zm9yKHZhciBpID0gMDsgaSA8IG51bUl0ZW1zOyBpKyspIHtcclxuXHRcdFx0XHR2YXIgaW1nSW5kZXggPSBsRnVuYy5maW5kQnlJZChkZWxBcnJheVtpXVtpZE5hbWVdLGxpc3ROYW1lLGlkTmFtZSxzdWJMaXN0KTtcclxuXHRcdFx0XHRsRnVuYy5MaXN0c1tsaXN0TmFtZV0ubWFpbi5zcGxpY2UoaW1nSW5kZXgsMSk7XHJcblx0XHRcdH1cclxuXHRcdH07XHJcblx0XHRcclxuXHRcdC8vIFNlbGVjdHMgYWxsIGl0ZW1zIHdpdGhpbiB0aGUgY3VycmVudCBmaWx0ZXIgc2V0XHJcblx0XHR0aGlzLnNlbGVjdEFsbCA9IGZ1bmN0aW9uKGtleSxsaXN0TmFtZSkge1xyXG5cdFx0XHRrZXkgPSB0eXBlb2Yga2V5ICE9PSAndW5kZWZpbmVkJyA/IGtleSA6ICdpZCc7XHJcblx0XHRcdHZhciBmaWx0ZXJlZEl0ZW1zID0gdGhpcy5zZXRGaWx0ZXJBcnJheShsaXN0TmFtZSk7XHJcblx0XHRcdHZhciBudW1JdGVtcyA9IGZpbHRlcmVkSXRlbXMubGVuZ3RoO1xyXG5cdFx0XHRmb3IodmFyIGkgPSAwOyBpIDwgbnVtSXRlbXM7IGkrKykge1xyXG5cdFx0XHRcdGlmKCFmaWx0ZXJlZEl0ZW1zW2ldLnNlbGVjdGVkKSB7XHJcblx0XHRcdFx0XHRsRnVuYy5zZWxlY3RJdGVtKGZpbHRlcmVkSXRlbXNbaV0sdW5kZWZpbmVkLGtleSxsaXN0TmFtZSk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9O1xyXG5cdFx0XHJcblx0XHQvLyBEZXNlbGVjdHMgYWxsIGl0ZW1zXHJcblx0XHR0aGlzLmRlc2VsZWN0QWxsID0gZnVuY3Rpb24oa2V5LGxpc3ROYW1lKSB7XHJcblx0XHRcdGtleSA9IHR5cGVvZiBrZXkgIT09ICd1bmRlZmluZWQnID8ga2V5IDogJ2lkJztcclxuXHRcdFx0dmFyIG51bVBob3RvcyA9IHRoaXMuTGlzdHNbbGlzdE5hbWVdLm1haW4ubGVuZ3RoO1xyXG5cdFx0XHRpZighdGhpcy5jaGVja1NlbGVjdGVkKGxpc3ROYW1lKSkge1xyXG5cdFx0XHRcdGZvcih2YXIgaSA9IDA7IGkgPCBudW1QaG90b3M7IGkrKykge1xyXG5cdFx0XHRcdFx0dmFyIGl0ZW0gPSB0aGlzLkxpc3RzW2xpc3ROYW1lXS5tYWluW2ldO1xyXG5cdFx0XHRcdFx0aWYoaXRlbS5zZWxlY3RlZCkge1xyXG5cdFx0XHRcdFx0XHR0aGlzLmRlc2VsZWN0SXRlbShpdGVtLmlkLGksa2V5LGxpc3ROYW1lKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdH07XHJcblx0XHRcclxuXHRcdHRoaXMuZGVzZWxlY3RJdGVtID0gZnVuY3Rpb24oaWQsaW5kZXgsa2V5LGxpc3ROYW1lKSB7XHJcblx0XHRcdGtleSA9IHR5cGVvZiBrZXkgIT09ICd1bmRlZmluZWQnID8ga2V5IDogJ2lkJztcclxuXHRcdFx0bEZ1bmMuTGlzdHNbbGlzdE5hbWVdLm1haW5baW5kZXhdLnNlbGVjdGVkID0gZmFsc2U7XHJcblx0XHRcdHZhciBzZWxJbmRleCA9IGxGdW5jLmZpbmRCeUlkKGlkLGxpc3ROYW1lLGtleSwnc2VsZWN0ZWQnKTtcclxuXHRcdFx0bEZ1bmMuTGlzdHNbbGlzdE5hbWVdLnNlbGVjdGVkLnNwbGljZShzZWxJbmRleCwxKTtcclxuXHRcdH07XHJcblxyXG5cdFx0dGhpcy5zZWxlY3RJdGVtID0gZnVuY3Rpb24oaXRlbSxpbmRleCxrZXksbGlzdE5hbWUpIHtcclxuXHRcdFx0a2V5ID0gdHlwZW9mIGtleSAhPT0gJ3VuZGVmaW5lZCcgPyBrZXkgOiAnaWQnO1xyXG5cdFx0XHRpZighaW5kZXgpIHtcclxuXHRcdFx0XHRpbmRleCA9IHRoaXMuZmluZEJ5SWQoaXRlbVtrZXldLGxpc3ROYW1lLGtleSwnbWFpbicpO1xyXG5cdFx0XHR9XHJcblx0XHRcdHRoaXMuTGlzdHNbbGlzdE5hbWVdLm1haW5baW5kZXhdLnNlbGVjdGVkID0gdHJ1ZTtcclxuXHRcdFx0dGhpcy5MaXN0c1tsaXN0TmFtZV0uc2VsZWN0ZWQucHVzaChpdGVtKTtcclxuXHRcdH07XHJcblx0XHRcclxuXHRcdC8vIEFmdGVyIGl0ZW1zIGFyZSBtb3ZlZCBpbiBsaXN0LCBzZXRzIHRoZSBvcmRlciB2YWx1ZSAobmFtZWQgb3JkS2V5KSB0byB0aGUgY29ycmVjdCBudW1iZXIgZm9yIHRoZSBEQi4gIEFsc28gYWRkcyBvcmRlciBhbmQgc2VjdGlvbiB0byB0aGUgc2VsZWN0ZWQgbGlzdC5cclxuXHRcdHZhciByZXNldE9yZGVyID0gZnVuY3Rpb24oa2V5LG9yZEtleSxsaXN0TmFtZSxzZWN0aW9uKSB7XHJcblx0XHRcdHZhciBzZWxJbmRleCA9IDA7XHJcblx0XHRcdGZvcihpID0gMDsgaSA8IGxGdW5jLkxpc3RzW2xpc3ROYW1lXS5tYWluLmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdFx0bEZ1bmMuTGlzdHNbbGlzdE5hbWVdLm1haW5baV1bb3JkS2V5XSA9IGk7XHJcblx0XHRcdFx0aWYobEZ1bmMuTGlzdHNbbGlzdE5hbWVdLm1haW4uc2VsZWN0ZWQpIHtcclxuXHRcdFx0XHRcdHNlbEluZGV4ID0gbEZ1bmMuZmluZEJ5SWQobEZ1bmMuTGlzdHNbbGlzdE5hbWVdLm1haW5baV1ba2V5XSxsaXN0TmFtZSxrZXksJ3NlbGVjdGVkJyk7XHJcblx0XHRcdFx0XHRsRnVuYy5MaXN0c1tsaXN0TmFtZV0uc2VsZWN0ZWRbc2VsSW5kZXhdW29yZEtleV0gPSBpO1xyXG5cdFx0XHRcdFx0aWYodHlwZW9mIHNlY3Rpb24gIT09ICd1bmRlZmluZWQnKSB7XHJcblx0XHRcdFx0XHRcdGxGdW5jLkxpc3RzW2xpc3ROYW1lXS5zZWxlY3RlZFtzZWxJbmRleF0uc2VjdGlvbiA9IHNlY3Rpb247XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9O1xyXG5cdFx0XHJcblx0XHQvLyBBZGRzIHRoZSBzZWxlY3RlZCBpdGVtcyB0byBhIHNlY3Rpb24gYW5kIHJlb3JkZXJzIGl0ZW1zIHRvIGdyb3VwIHRob3NlIHRvZ2V0aGVyLlxyXG5cdFx0dGhpcy5ncm91cFNlbGVjdGVkID0gZnVuY3Rpb24oa2V5LG9yZEtleSxzZWN0aW9uLGxpc3ROYW1lKSB7XHJcblx0XHRcdHZhciBsaXN0VGVtcCA9IGxGdW5jLkxpc3RzW2xpc3ROYW1lXS5tYWluLFxyXG5cdFx0XHRcdGZpcnN0SW5kZXggPSAtMSxcclxuXHRcdFx0XHRtb3ZlSW5kZXggPSAwLFxyXG5cdFx0XHRcdHNlbEluZGV4O1xyXG5cdFx0XHRmb3IodmFyIGkgPSAwOyBpIDwgbGlzdFRlbXAubGVuZ3RoOyBpKyspIHtcclxuXHRcdFx0XHRpZihsaXN0VGVtcFtpXS5zZWxlY3RlZCB8fCBsbGlzdFRlbXBbaV0uc2VjdGlvbiA9PT0gc2VjdGlvbikge1xyXG5cdFx0XHRcdFx0aWYoZmlyc3RJbmRleCA9IC0xKSB7XHJcblx0XHRcdFx0XHRcdGZpcnN0SW5kZXggPSBpO1xyXG5cdFx0XHRcdFx0XHRsaXN0VGVtcFtpXS5zZWN0aW9uID0gc2VjdGlvbjtcclxuXHRcdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRcdG1vdmVJbmRleCA9IGk7XHJcblx0XHRcdFx0XHRcdGxpc3RUZW1wW21vdmVJbmRleF0uc2VjdGlvbiA9IHNlY3Rpb247XHJcblx0XHRcdFx0XHRcdGxpc3RUZW1wLnNwbGljZShmaXJzdEluZGV4KzEsMCxsaXN0VGVtcC5zcGxpY2UobW92ZUluZGV4LDEpWzBdKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdFx0bEZ1bmMuTGlzdHNbbGlzdE5hbWVdLm1haW4gPSBsaXN0VGVtcDtcclxuXHRcdFx0cmVzZXRPcmRlcihrZXksb3JkS2V5LGxpc3ROdW0sc2VjdGlvbik7XHJcblx0XHR9O1xyXG5cdFx0XHJcblx0XHQvLyBNb3ZlcyBhbiBpdGVtIG9yIGl0ZW1zLiAgQ2hlY2tzIHRoZSBzZWN0aW9ucyBvZiB0aGUgaXRlbXMgdG8gZW5zdXJlIGl0ZW1zIHdpdGhpbiBzYW1lIHNlY3Rpb24gc3RpY2sgdG9nZXRoZXIuXHJcblx0XHR0aGlzLm1vdmVJdGVtcyA9IGZ1bmN0aW9uKGRpcmVjdGlvbixrZXksb3JkS2V5LGxpc3ROYW1lKSB7XHJcblx0XHRcdHZhciBzZWxTZWN0aW9uLFxyXG5cdFx0XHRcdGxpc3RMZW4gPSBsRnVuYy5MaXN0c1tsaXN0TmFtZV0ubWFpbi5sZW5ndGgsXHJcblx0XHRcdFx0bXVsdGlwbGllcixcclxuXHRcdFx0XHRuZXh0U2VjdGlvbjtcclxuXHRcdFx0dmFyIGkgPSBkaXJlY3Rpb24gPiAwID8gbGlzdExlbiAtIDEgOiAwO1xyXG5cdFx0XHQvLyBMb29wIHRocm91Z2ggbWFpbiBsaXN0IG9wcG9zaXRlIHRoZSBkaXJlY3Rpb24gb2YgdGhlIG1vdmVtZW50IG9mIGl0ZW1zIHRvIG1ha2Ugc3VyZSBvcmRlciBpcyBvdGhlcndpc2UgcHJlc2VydmVkLlxyXG5cdFx0XHRmb3IoaTsgaSA8IGxpc3RMZW4gJiYgaSA+PSAwOyBpID0gaSAtIGRpcmVjdGlvbikge1xyXG5cdFx0XHRcdG11bHRpcGxpZXIgPSAxO1xyXG5cdFx0XHRcdC8vIElmIHRoZSBpdGVtIGlzIGluIHRoZSBzZWxlY3RlZCBsaXN0IG9yIHRoZSBzZWN0aW9uIGlzIG1vdmluZy5cclxuXHRcdFx0XHRpZihsRnVuYy5maW5kQnlJZChsRnVuYy5MaXN0c1tsaXN0TmFtZV0ubWFpbltpXVtrZXldLGxpc3ROYW1lLGtleSwnc2VsZWN0ZWQnKSAhPT0gZmFsc2UgfHwgbEZ1bmMuTGlzdHNbbGlzdE5hbWVdLm1haW5baV0uc2VjdGlvbiA9PT0gc2VsU2VjdGlvbikge1xyXG5cdFx0XHRcdFx0Ly8gU2V0IHNlbFNlY3Rpb24gdG8gc2VjdGlvbiBvZiBhIHNlbGVjdGVkIGl0ZW0uXHJcblx0XHRcdFx0XHRpZihsRnVuYy5MaXN0c1tsaXN0TmFtZV0ubWFpbltpXS5zZWN0aW9uICE9PSAnJykge1xyXG5cdFx0XHRcdFx0XHRzZWxTZWN0aW9uID0gbEZ1bmMuTGlzdHNbbGlzdE5hbWVdLm1haW5baV0uc2VjdGlvbjtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdC8vIElmIHRoZSBtb3ZlbWVudCB3b3VsZCBwdXQgdGhlIGl0ZW0gb3V0c2lkZSBvZiBsaXN0IGJvdW5kYXJpZXMgb3IgYW5vdGhlciBzZWxlY3Rpb24gaGFzIGhpdCB0aG9zZSBib3VuZGFyaWVzIGRvbid0IG1vdmUuXHJcblx0XHRcdFx0XHRpZihpK2RpcmVjdGlvbiA+PSAwICYmIGkrZGlyZWN0aW9uIDwgbGlzdExlbiAmJiAhbEZ1bmMuTGlzdHNbbGlzdE5hbWVdLm1haW5baStkaXJlY3Rpb25dLnNlbGVjdGVkKSB7XHJcblx0XHRcdFx0XHRcdC8vIElmIHRoZSBuZXh0IGl0ZW0gaXMgaW4gYSBkZWZpbmVkIHNlY3Rpb24sIG5lZWQgdG8gY2hlY2sgJiBjb3VudCBpdGVtcyBpbiBzZWN0aW9uIHRvIGp1bXAgb3ZlciBvciBzdG9wIG1vdmVtZW50LlxyXG5cdFx0XHRcdFx0XHRpZihsRnVuYy5tYWluTGlzdFtsaXN0TnVtXVtpK2RpcmVjdGlvbl0uc2VjdGlvbiAhPT0gJycgJiYgbEZ1bmMubWFpbkxpc3RbbGlzdE51bV1baV0uc2VjdGlvbiAhPT0gbEZ1bmMubWFpbkxpc3RbbGlzdE51bV1baStkaXJlY3Rpb25dLnNlY3Rpb24pIHtcclxuXHRcdFx0XHRcdFx0XHRuZXh0U2VjdGlvbiA9IGxGdW5jLkxpc3RzW2xpc3ROYW1lXS5tYWluW2krZGlyZWN0aW9uXS5zZWN0aW9uO1xyXG5cdFx0XHRcdFx0XHRcdG11bHRpcGxpZXIgPSAwO1xyXG5cdFx0XHRcdFx0XHRcdC8vIExvb3AgYmFjayB0aHJvdWdoIGFycmF5IGluIHRoZSBkaXJlY3Rpb24gb2YgbW92ZW1lbnQuXHJcblx0XHRcdFx0XHRcdFx0Zm9yKHZhciBqID0gaSArIGRpcmVjdGlvbjsgaiA8IGxpc3RMZW4gJiYgaiA+PSAwOyBqID0gaiArIGRpcmVjdGlvbikge1xyXG5cdFx0XHRcdFx0XHRcdFx0Ly8gSWYgdGhlIGl0ZW0gaXMgaW4gdGhlIHNlY3Rpb24uLi5cclxuXHRcdFx0XHRcdFx0XHRcdGlmKGxGdW5jLkxpc3RzW2xpc3ROYW1lXS5tYWluW2pdLnNlY3Rpb24gPT09IG5leHRTZWN0aW9uKSB7XHJcblx0XHRcdFx0XHRcdFx0XHRcdC8vIElmIHNlbGVjdGVkIHN0b3AgbW92ZW1lbnQgYW5kIGJyZWFrLlxyXG5cdFx0XHRcdFx0XHRcdFx0XHRpZihsRnVuYy5tYWluTGlzdFtsaXN0TnVtXVtqXS5zZWxlY3RlZCkge1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRcdG11bHRpcGxpZXIgPSAwO1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdFx0XHRcdC8vIElmIG5vdCwgY291bnQgc2VjdGlvbi5cclxuXHRcdFx0XHRcdFx0XHRcdFx0bXVsdGlwbGllcisrO1xyXG5cdFx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdFx0XHRcdFx0Ly8gQnJlYWsgbG9vcCBhdCBmaXJzdCBpdGVtIG5vdCBpbiBzZWN0aW9uLlxyXG5cdFx0XHRcdFx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0Ly8gRmluYWwgY2hlY2s6IG9ubHkgbW92ZSBhbiBpdGVtIGlmIGl0IGlzIHNlbGVjdGVkIG9yIHRvIGVuc3VyZSBpdGVtcyBvZiB0aGUgc2FtZSBzZWN0aW9uIHN0aWNrIHRvZ2V0aGVyXHJcblx0XHRcdFx0XHRcdGlmKGxGdW5jLkxpc3RzW2xpc3ROYW1lXS5tYWluW2ldLnNlbGVjdGVkIHx8IGxGdW5jLkxpc3RzW2xpc3ROYW1lXS5tYWluW2krZGlyZWN0aW9uXS5zZWN0aW9uICE9PSBsRnVuYy5MaXN0c1tsaXN0TmFtZV0ubWFpbltpXS5zZWN0aW9uKSB7XHJcblx0XHRcdFx0XHRcdFx0bEZ1bmMuTGlzdHNbbGlzdE5hbWVdLm1haW4uc3BsaWNlKGkrKGRpcmVjdGlvbiptdWx0aXBsaWVyKSwwLGxGdW5jLkxpc3RzW2xpc3ROYW1lXS5tYWluLnNwbGljZShpLDEpWzBdKTtcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0XHQvLyBSZXNldCBvcmRlciB2YXJpYWJsZSBmb3IgZGF0YWJhc2UuXHJcblx0XHRcdHJlc2V0T3JkZXIoa2V5LG9yZEtleSxsaXN0TmFtZSk7XHJcblx0XHR9O1xyXG5cdFx0XHJcblx0fV0pO1xyXG59KSgpOyJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
