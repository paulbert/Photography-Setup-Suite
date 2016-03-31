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
				ordKey:'@ordname',
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
			ordKey = $scope.ordName,
			listName = $scope.listName;
		
		// Sets selectedList as empty array for this list number.
		listFunctions.clearSelected(listName);
		this.hideOverlay = true;
		
		this.lFunc = listFunctions;
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
		this.moveItems = function(direction) {
			listFunctions.moveItems(direction,key,ordKey,listName);
			this.orderSavePending = true;
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
			for(var i = 0; i < mainArray.length; i++) {
				if(mainArray[i].showItem === true) {
					this.Lists[listName].filtered.push(mainArray[i]);
				}
			}
			return this.Lists[listName].filtered;
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
		
		// Deletes items found in delArray from main list searching by id. Returns new array.
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
			resetOrder(key,ordKey,listName,section);
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
						if(lFunc.Lists[listName].main[i+direction].section !== '' && lFunc.Lists[listName].main[i].section !== lFunc.Lists[listName].main[i+direction].section) {
							nextSection = lFunc.Lists[listName].main[i+direction].section;
							multiplier = 0;
							// Loop back through array in the direction of movement.
							for(var j = i + direction; j < listLen && j >= 0; j = j + direction) {
								// If the item is in the section...
								if(lFunc.Lists[listName].main[j].section === nextSection) {
									// If selected stop movement and break.
									if(lFunc.Lists[listName].main[j].selected) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImZpbHRlcnMvZmlsdGVyRGlyZWN0aXZlLmpzIiwibGlzdHMvbGlzdERpcmVjdGl2ZS5qcyIsIm92ZXJsYXkvb3ZlcmxheURpcmVjdGl2ZS5qcyIsImZpbHRlcnMvY29tcG9uZW50cy9maWx0ZXJDaGVja2JveENvbXBvbmVudERpcmVjdGl2ZS5qcyIsImZpbHRlcnMvY29tcG9uZW50cy9maWx0ZXJRdWVyeUNvbXBvbmVudERpcmVjdGl2ZS5qcyIsImZpbHRlckNvbnRyb2xsZXIuanMiLCJmaWx0ZXJTZXJ2aWNlLmpzIiwiY29tcG9uZW50cy9maWx0ZXJDb21wb25lbnRDb250cm9sbGVyLmpzIiwib3ZlcmxheUNvbnRyb2xsZXIuanMiLCJsaXN0Q29udHJvbGxlci5qcyIsImxpc3RTZXJ2LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FDSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQy9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDM0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDOUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3pEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoicGhvdG8tdG9vbHMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKSB7XG5cdGFuZ3VsYXIubW9kdWxlKCdwaG90b0VkaXRDb21wb25lbnRzJywgWydsaXN0TW9kJywnZmlsdGVyTW9kJywnb3ZlcmxheU1vZCddKTtcblx0XG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuXHRcclxuXHQvKlxyXG5cdFNlYXJjaCB2YXJpYWJsZSBzaG91bGQgYmUgYW4gYXJyYXkgb2Ygb2JqZWN0cyBuYW1lZCB0aGUgc2FtZSBhcyB0aGUgcHJvcGVydGllcyBvZiB0aGUgb2JqZWN0cyB3aXRoaW4gdGhlIGxpc3QuXHJcblx0XHRSZXF1aXJlcyBhICdxdWVyeScgcHJvcGVydHkgd2l0aGluIG9iamVjdCB3aGljaCBpcyBtb2RlbGVkIHRvIGEgdGV4dC9pbnB1dCBmaWx0ZXIuXHJcblx0XHRJZiB0aGUgc2VhcmNoZWQgcHJvcGVydHkgaXMgYW4gYXJyYXkgb2Ygb2JqZWN0cyAoaWYsIGZvciBleGFtcGxlLCBpbWFnZXMgY2FuIGJlIGluIG1hbnkgZ2FsbGVyeSBncm91cGluZ3MpLCBhZGQgJ2lzQXJyYXknIHByb3BlcnR5IGFuZCBzZXQgdG8gdHJ1ZSwgYWxzbyBhZGQgJ3NlYXJjaE9uJyBwcm9wZXJ0eSBhbmQgc2V0IHRvIHRoZSBuYW1lIG9mIHRoZSBwcm9wZXJ0eSB3aXRoaW4gb2JqZWN0cy5cclxuXHRcdEV4YW1wbGU6IGltYWdlcyA9IFsge2ltZ25hbWU6ICdpbWcxLmpwZycsIGdhbGxlcmllczogWyB7IGlkOjEsIG5hbWU6J2dhbGxlcnkxJyB9LCB7IGlkOjIsIG5hbWU6J2dhbGxlcnkyJ30gXX0sIC4uLl1cclxuXHRcdHNlYXJjaCA9IHsgZ2FsbGVyaWVzOiB7IHF1ZXJ5OicnLCBpc0FycmF5OiB0cnVlLCBzZWFyY2hPbjogJ25hbWUnIH0gfVxyXG5cdFx0Rm9yIGEgY2hlY2tib3ggZmlsdGVyLCBpbmNsdWRlIGFuIG9iamVjdCBjYWxsZWQgJ2NoZWNrYm94ZXMnIHdpdGggYSAnbm9uZScgcHJvcGVydHkgYW5kIGFsbCBwb3NzaWJsZSB2YWx1ZXMgaW4gMC1uIHByb3BlcnR5LlxyXG5cdFx0QmFzZWQgb24gYWJvdmUgZXhhbXBsZTogc2VhcmNoID0geyBnYWxsZXJpZXM6IHsgLi4uIGNoZWNrYm94ZXM6IHsgbm9uZTogdHJ1ZSwgMDonZ2FsbGVyeTEnLDE6J2dhbGxlcnkyJyB9IH1cclxuXHQqL1xyXG5cdFxyXG5cdGFuZ3VsYXIubW9kdWxlKCdmaWx0ZXJNb2QnLFtdKVxyXG5cdC5kaXJlY3RpdmUoJ2ZpbHRlckJhcicsIGZ1bmN0aW9uKCkge1xyXG5cdFx0cmV0dXJuIHtcclxuXHRcdFx0c2NvcGU6IHtcclxuXHRcdFx0XHRzZWFyY2g6Jz0nLFxyXG5cdFx0XHRcdGZwb3NpdGlvbjonPT8nLFxyXG5cdFx0XHRcdGlubGluZTonQD8nLFxyXG5cdFx0XHRcdHRtcGx0Oic9J1xyXG5cdFx0XHR9LFxyXG5cdFx0XHR0ZW1wbGF0ZTogJzxkaXYgbmctaW5jbHVkZT1cInRlbXBsYXRlVXJsXCI+PC9kaXY+JyxcclxuXHRcdFx0Y29udHJvbGxlcjonZmlsdGVyQmFyQ29udHJvbGxlcicsXHJcblx0XHRcdGNvbnRyb2xsZXJBczonZmJhcicsXHJcblx0XHRcdGxpbms6IGZ1bmN0aW9uKHNjb3BlLGVsZW1lbnQsYXR0cnMpIHtcclxuXHRcdFx0XHRzY29wZS50ZW1wbGF0ZVVybCA9IHNjb3BlLnRtcGx0LmJhc2UgKyBzY29wZS50bXBsdC5maWxlTmFtZTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH0pXHJcblx0O1xyXG5cdFx0XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xuXHRhbmd1bGFyLm1vZHVsZSgnbGlzdE1vZCcsW10pXG5cdC5kaXJlY3RpdmUoJ2xpc3RPZkl0ZW1zJyxmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0c2NvcGU6IHtcblx0XHRcdFx0c2VhcmNoOic9Jyxcblx0XHRcdFx0bGlzdE5hbWU6Jz1saXN0Jyxcblx0XHRcdFx0a2V5TmFtZTonQGtleScsXG5cdFx0XHRcdG9yZEtleTonQG9yZG5hbWUnLFxuXHRcdFx0XHQvLyBBZGRpdGlvbmFsIGZ1bmN0aW9ucyB0byBiZSBjYWxsZWQgZnJvbSBidXR0b25zIGluIHRoZSBsaXN0IChzYXZlIGluZm8sIGRlbGV0ZSwgZXRjKVxuXHRcdFx0XHRhZGRGdW5jczonPWZ1bmNzJyxcblx0XHRcdFx0dG1wbHQ6Jz0nXG5cdFx0XHR9LFxuXHRcdFx0dGVtcGxhdGU6ICc8ZGl2IG5nLWluY2x1ZGU9XCJ0ZW1wbGF0ZVVybFwiPjwvZGl2PicsXG5cdFx0XHRjb250cm9sbGVyOidsaXN0Q29udHJvbGxlcicsXG5cdFx0XHRjb250cm9sbGVyQXM6J2xpc3QnLFxuXHRcdFx0bGluazogZnVuY3Rpb24oc2NvcGUsZWxlbWVudCxhdHRycykge1xuXHRcdFx0XHRzY29wZS50ZW1wbGF0ZVVybCA9IHNjb3BlLnRtcGx0LmJhc2UgKyBzY29wZS50bXBsdC5maWxlTmFtZTtcblx0XHRcdH1cblx0XHR9XG5cdH0pXG5cdDtcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG5cdFxyXG5cdGFuZ3VsYXIubW9kdWxlKCdvdmVybGF5TW9kJyxbXSlcclxuXHQuZGlyZWN0aXZlKCdvdmVybGF5JywgZnVuY3Rpb24oKSB7XHJcblx0XHRyZXR1cm4ge1xyXG5cdFx0XHRzY29wZToge1xyXG5cdFx0XHRcdG1lc3NhZ2U6Jz0nLFxyXG5cdFx0XHRcdG1lc3NhZ2VOdW06Jz1udW1iZXInLFxyXG5cdFx0XHRcdGJ0bkNvbmZpZzonPWNmZycsXHJcblx0XHRcdFx0Ly8gRnVuY3Rpb24gZm9yIGFjdGlvbiBvZiBvdmVybGF5IChjYW5jZWwvYmFjayBpcyBpbiBjb250cm9sbGVyKVxyXG5cdFx0XHRcdGRvQWN0aW9uOic9ZnVuYycsXHJcblx0XHRcdFx0YmFzZTonQD8nXHJcblx0XHRcdH0sXHJcblx0XHRcdGNvbnRyb2xsZXI6J292ZXJsYXlDb250cm9sbGVyJyxcclxuXHRcdFx0Y29udHJvbGxlckFzOidvdmVyJyxcclxuXHRcdFx0dGVtcGxhdGU6ICc8ZGl2IG5nLWluY2x1ZGU9XCJ0ZW1wbGF0ZVVybFwiPjwvZGl2PicsXHJcblx0XHRcdGxpbms6IGZ1bmN0aW9uKHNjb3BlLGVsZW1lbnQsYXR0cnMpIHtcclxuXHRcdFx0XHQvLyBJZiBubyBiYXNlIGlzIHNwZWNpZmllZCwgdXNlIGxvY2F0aW9uIGlmIGluc3RhbGxlZCB2aWEgYm93ZXIuXHJcblx0XHRcdFx0aWYodHlwZW9mIHNjb3BlLmJhc2UgPT09ICd1bmRlZmluZWQnKSB7XHJcblx0XHRcdFx0XHRzY29wZS5iYXNlID0gJy9ib3dlcl9jb21wb25lbnRzL1Bob3RvZ3JhcGh5LVNldHVwLVN1aXRlL3RlbXBsYXRlcy9vdmVybGF5Lyc7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdHNjb3BlLnRlbXBsYXRlVXJsID0gc2NvcGUuYmFzZSArICdvdmVybGF5Lmh0bWwnO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fSlcclxuXHQ7XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG5cdFxyXG5cdGFuZ3VsYXIubW9kdWxlKCdmaWx0ZXJNb2QnKVxyXG5cdC5kaXJlY3RpdmUoJ2ZpbHRlckNoZWNrYm94JywgZnVuY3Rpb24oKSB7XHJcblx0XHRcdHJldHVybiB7XHJcblx0XHRcdFx0c2NvcGU6IHtcclxuXHRcdFx0XHRcdGl0ZW1zOic9JyxcclxuXHRcdFx0XHRcdHNlYXJjaDonPScsXHJcblx0XHRcdFx0XHRiYXNlOic9J1xyXG5cdFx0XHRcdH0sXHJcblx0XHRcdFx0Y29udHJvbGxlcjonZmlsdGVyQ29tcENvbnRyb2xsZXInLFxyXG5cdFx0XHRcdGNvbnRyb2xsZXJBczonZmNvbXAnLFxyXG5cdFx0XHRcdHRlbXBsYXRlOiAnPGRpdiBuZy1pbmNsdWRlPVwidGVtcGxhdGVVcmxcIj48L2Rpdj4nLFxyXG5cdFx0XHRcdGxpbms6IGZ1bmN0aW9uKHNjb3BlLGVsZW1lbnQsYXR0cnMpIHtcclxuXHRcdFx0XHRcdC8vIElmIG5vIGJhc2UgaXMgc3BlY2lmaWVkLCB1c2UgbG9jYXRpb24gaWYgaW5zdGFsbGVkIHZpYSBib3dlci5cclxuXHRcdFx0XHRcdGlmKHR5cGVvZiBzY29wZS5iYXNlID09PSAndW5kZWZpbmVkJykge1xyXG5cdFx0XHRcdFx0XHRzY29wZS5iYXNlID0gJy9ib3dlcl9jb21wb25lbnRzL1Bob3RvZ3JhcGh5LVNldHVwLVN1aXRlL3RlbXBsYXRlcy9maWx0ZXJzLyc7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRzY29wZS50ZW1wbGF0ZVVybCA9IHNjb3BlLmJhc2UgKyAnZmlsdGVyQ2hlY2tib3hlcy5odG1sJztcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdH0pXHJcblx0O1xyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuXHRcclxuXHRhbmd1bGFyLm1vZHVsZSgnZmlsdGVyTW9kJylcclxuXHQuZGlyZWN0aXZlKCdmaWx0ZXJRdWVyeScsIGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRyZXR1cm4ge1xyXG5cdFx0XHRcdHNjb3BlOiB7XHJcblx0XHRcdFx0XHRzZWFyY2g6Jz0nLFxyXG5cdFx0XHRcdFx0YmFzZTonPT8nXHJcblx0XHRcdFx0fSxcclxuXHRcdFx0XHR0ZW1wbGF0ZTogJzxkaXYgbmctaW5jbHVkZT1cInRlbXBsYXRlVXJsXCI+PC9kaXY+JyxcclxuXHRcdFx0XHRsaW5rOiBmdW5jdGlvbihzY29wZSxlbGVtZW50LGF0dHJzKSB7XHJcblx0XHRcdFx0XHQvLyBJZiBubyBiYXNlIGlzIHNwZWNpZmllZCwgdXNlIGxvY2F0aW9uIGlmIGluc3RhbGxlZCB2aWEgYm93ZXIuXHJcblx0XHRcdFx0XHRpZih0eXBlb2Ygc2NvcGUuYmFzZSA9PT0gJ3VuZGVmaW5lZCcpIHtcclxuXHRcdFx0XHRcdFx0c2NvcGUuYmFzZSA9ICcvYm93ZXJfY29tcG9uZW50cy9QaG90b2dyYXBoeS1TZXR1cC1TdWl0ZS90ZW1wbGF0ZXMvZmlsdGVycy8nO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0c2NvcGUudGVtcGxhdGVVcmwgPSBzY29wZS5iYXNlICsgJ2ZpbHRlclF1ZXJ5Lmh0bWwnO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fSlcclxuXHQ7XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG5cdFxyXG5cdGFuZ3VsYXIubW9kdWxlKCdmaWx0ZXJNb2QnKVxyXG5cdC5jb250cm9sbGVyKCdmaWx0ZXJCYXJDb250cm9sbGVyJywgWyckc2NvcGUnLCBmdW5jdGlvbigkc2NvcGUpIHtcclxuXHRcdFx0XHJcblx0XHRcdHRoaXMuZ2FsbGVyaWVzID0gW107XHJcblx0XHRcdFxyXG5cdFx0XHQvLyBUb2dnbGVzIHRoZSBwb3NpdGlvbiBvZiB0aGUgbGVmdCBzaWRlIGZpbHRlciBjb2x1bW5cclxuXHRcdFx0dGhpcy5maWx0ZXJUb2dnbGUgPSBmdW5jdGlvbigpIHtcclxuXHRcdFx0XHR2YXIgZlBvcyA9ICRzY29wZS5mcG9zaXRpb247XHJcblx0XHRcdFx0JHNjb3BlLmZwb3NpdGlvbiA9IChmUG9zID09PSAwID8gLTE5MCA6IDApO1xyXG5cdFx0XHR9O1xyXG5cdFx0XHRcclxuXHRcdFx0dmFyIGZDdHJsID0gdGhpcztcclxuXHRcdFx0XHJcblx0XHR9XSlcclxuXHQ7XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG5cdFxyXG5cdGFuZ3VsYXIubW9kdWxlKCdmaWx0ZXJNb2QnKVxyXG5cdC5zZXJ2aWNlKCdmaWx0ZXJGdW5jdGlvbnMnLCBmdW5jdGlvbigpIHtcclxuXHRcdFx0XHJcblx0XHR2YXIgZkZ1bmN0aW9ucyA9IHRoaXM7XHJcblx0XHRcclxuXHRcdC8vIENoZWNrcyBmb3IgYSBtYXRjaCB3aXRoIHRoZSBmaWx0ZXJzLlxyXG5cdFx0Ly8gSWYgdGhlIHZhbHVlIGlzIGFuIGFycmF5LCBjaGVja3MgYWxsIHZhbHVlcyBmb3Igb25lIG1hdGNoLlxyXG5cdFx0Ly8gSWYgbm90LCBqdXN0IGNoZWNrcyBzaW5nbGUgdmFsdWUuXHJcblx0XHR0aGlzLmZpbHRlckNoZWNrID0gZnVuY3Rpb24odmFsdWUsc2VhcmNoKSB7XHJcblx0XHRcdHZhciBhbGxNYXRjaCA9IHRydWU7XHJcblx0XHRcdFxyXG5cdFx0XHRmb3IodmFyIGtleSBpbiBzZWFyY2gpIHtcclxuXHRcdFx0XHRpZihzZWFyY2guaGFzT3duUHJvcGVydHkoa2V5KSkge1xyXG5cdFx0XHRcdFx0dmFyIHRoaXNWYWx1ZSA9IHZhbHVlW2tleV07XHJcblx0XHRcdFx0XHRpZihzZWFyY2hba2V5XS5pc0FycmF5KSB7XHJcblx0XHRcdFx0XHRcdHZhciBudW1WYWx1ZXMgPSB0aGlzVmFsdWUubGVuZ3RoLFxyXG5cdFx0XHRcdFx0XHRcdG1hdGNoRm91bmQgPSBmYWxzZTtcclxuXHRcdFx0XHRcdFx0Zm9yKHZhciBpID0gMDsgaSA8IG51bVZhbHVlczsgaSsrKSB7XHJcblx0XHRcdFx0XHRcdFx0aWYoY2hlY2tWYWx1ZSh0aGlzVmFsdWVbaV0sIHNlYXJjaCwga2V5KSkge1xyXG5cdFx0XHRcdFx0XHRcdFx0bWF0Y2hGb3VuZCA9IHRydWU7XHJcblx0XHRcdFx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0aWYoIW1hdGNoRm91bmQpIHtcclxuXHRcdFx0XHRcdFx0XHRhbGxNYXRjaCA9IGZhbHNlO1xyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0XHRhbGxNYXRjaCA9IGNoZWNrVmFsdWUodGhpc1ZhbHVlLCBzZWFyY2gsIGtleSk7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRpZihhbGxNYXRjaCA9PT0gZmFsc2UpIHtcclxuXHRcdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHRcdFxyXG5cdFx0XHRyZXR1cm4gYWxsTWF0Y2g7XHJcblx0XHRcdFxyXG5cdFx0fTtcclxuXHRcdFxyXG5cdFx0Ly8gRnVuY3Rpb24gdGhhdCBjaGVja3MgdmFsdWUgYWdhaW5zdCB0aGUgcXVlcnkgZmlsdGVyICYgY2hlY2tib3hlc1xyXG5cdFx0dmFyIGNoZWNrVmFsdWUgPSBmdW5jdGlvbih2YWx1ZSwgc2VhcmNoLCBrZXkpIHtcclxuXHRcdFx0XHJcblx0XHRcdHZhciBjaGVja01hdGNoID0gdHJ1ZSxcclxuXHRcdFx0XHR2YWx1ZU1hdGNoID0gZmFsc2UsXHJcblx0XHRcdFx0Y2hlY2tib3hlcyA9IHNlYXJjaFtrZXldLmNoZWNrYm94ZXMsXHJcblx0XHRcdFx0c2VhcmNoT24gPSBzZWFyY2hba2V5XS5zZWFyY2hPbjtcclxuXHRcdFx0XHRcclxuXHRcdFx0aWYoc2VhcmNoT24gJiYgdmFsdWUpIHtcclxuXHRcdFx0XHR2YXIgdGhpc1ZhbHVlID0gdmFsdWVbc2VhcmNoT25dO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdHZhciB0aGlzVmFsdWUgPSB2YWx1ZTtcclxuXHRcdFx0fVxyXG5cdFx0XHRpZihjaGVja2JveGVzKSB7XHJcblx0XHRcdFx0Y2hlY2tNYXRjaCA9IGNoZWNrVGhlQm94ZXModGhpc1ZhbHVlLGtleSxjaGVja2JveGVzKTtcclxuXHRcdFx0fVxyXG5cdFx0XHR2YWx1ZU1hdGNoID0gZkZ1bmN0aW9ucy5xdWVyeUZpbHRlckNoZWNrKHRoaXNWYWx1ZSxzZWFyY2hba2V5XS5xdWVyeSk7XHJcblx0XHRcdFxyXG5cdFx0XHRyZXR1cm4gY2hlY2tNYXRjaCAmJiB2YWx1ZU1hdGNoO1xyXG5cdFx0fTtcclxuXHRcdFxyXG5cdFx0Ly8gQ2hlY2tzIHF1ZXJ5IHZhbHVlIGFnYWluc3QgYWN0dWFsLiAgQWxzbyB1c2VkIHRvIGhpZGUvc2hvdyBjaGVja2JveGVzIGJhc2VkIG9uIHRoZSB0eXBlZCBmaWx0ZXIuXHJcblx0XHR0aGlzLnF1ZXJ5RmlsdGVyQ2hlY2sgPSBmdW5jdGlvbih2YWx1ZSxxdWVyeSkge1xyXG5cdFx0XHRpZighdmFsdWUpIHtcclxuXHRcdFx0XHR2YWx1ZSA9ICcnO1xyXG5cdFx0XHR9XHJcblx0XHRcdHJldHVybiB2YWx1ZS50b0xvd2VyQ2FzZSgpLmluZGV4T2YocXVlcnkudG9Mb3dlckNhc2UoKSkgPiAtMTtcclxuXHRcdH07XHJcblx0XHRcclxuXHRcdC8vIEZ1bmN0aW9uIHRvIGxvb3AgdGhyb3VnaCB0aGUgY2hlY2tib3hlcyB2YXJpYWJsZSBhbmQgcmV0dXJuIHRydWUgaWYgdGhlIHZhbHVlIGlzIGEgbWF0Y2hcclxuXHRcdHZhciBjaGVja1RoZUJveGVzID0gZnVuY3Rpb24gKHZhbHVlLGZpbHRlcnNldCxjaGVja2JveGVzKSB7XHJcblx0XHRcdGlmKHZhbHVlKSB7XHJcblx0XHRcdFx0dmFyIGkgPSAwO1xyXG5cdFx0XHRcdGRvIHtcclxuXHRcdFx0XHRcdGlmKHZhbHVlID09PSBjaGVja2JveGVzW2ldKSB7XHJcblx0XHRcdFx0XHRcdHJldHVybiB0cnVlO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0aSsrO1xyXG5cdFx0XHRcdH0gd2hpbGUodHlwZW9mIGNoZWNrYm94ZXNbaV0gIT09ICd1bmRlZmluZWQnKVxyXG5cdFx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRpZihjaGVja2JveGVzWydub25lJ10pIHtcclxuXHRcdFx0XHRcdHJldHVybiB0cnVlO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHRcdH1cclxuXHRcdH07XHJcblx0XHRcclxuXHR9KVxyXG5cdDtcclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcblx0XHJcblx0YW5ndWxhci5tb2R1bGUoJ2ZpbHRlck1vZCcpXHJcblx0LmNvbnRyb2xsZXIoJ2ZpbHRlckNvbXBDb250cm9sbGVyJywgWyckc2NvcGUnLCdmaWx0ZXJGdW5jdGlvbnMnLCBmdW5jdGlvbigkc2NvcGUsZmlsdGVyRnVuY3Rpb25zKSB7XHJcblx0XHR0aGlzLm9ubHlCb3ggPSBmdW5jdGlvbihib3hOdW0sYm94TmFtZSkge1xyXG5cdFx0XHR2YXIgaSA9IDA7XHJcblx0XHRcdGRvIHtcclxuXHRcdFx0XHQkc2NvcGUuc2VhcmNoLmNoZWNrYm94ZXNbaV0gPSBmYWxzZTtcdFx0XHRcdFx0XHJcblx0XHRcdFx0aSsrO1xyXG5cdFx0XHR9IHdoaWxlKHR5cGVvZiAkc2NvcGUuc2VhcmNoLmNoZWNrYm94ZXNbaV0gIT09ICd1bmRlZmluZWQnKVxyXG5cdFx0XHRpZihib3hOdW0gPT09ICdub25lJykge1xyXG5cdFx0XHRcdCRzY29wZS5zZWFyY2guY2hlY2tib3hlc1snbm9uZSddID0gdHJ1ZTtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHQkc2NvcGUuc2VhcmNoLmNoZWNrYm94ZXNbYm94TnVtXSA9IGJveE5hbWU7XHJcblx0XHRcdFx0JHNjb3BlLnNlYXJjaC5jaGVja2JveGVzWydub25lJ10gPSBmYWxzZTtcclxuXHRcdFx0fVxyXG5cdFx0fTtcclxuXHRcdFxyXG5cdFx0dGhpcy5hbGxCb3hlcyA9IGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0Zm9yKHZhciBpID0gMDsgaSA8ICRzY29wZS5pdGVtcy5sZW5ndGg7IGkrKykge1xyXG5cdFx0XHRcdCRzY29wZS5zZWFyY2guY2hlY2tib3hlc1tpXSA9ICRzY29wZS5pdGVtc1tpXTtcclxuXHRcdFx0fVxyXG5cdFx0XHQkc2NvcGUuc2VhcmNoLmNoZWNrYm94ZXNbJ25vbmUnXSA9IHRydWU7XHJcblx0XHR9O1xyXG5cdFx0XHJcblx0XHR0aGlzLnNob3dDaGVja2JveCA9IGZ1bmN0aW9uICh2YWx1ZSxxdWVyeSkge1xyXG5cdFx0XHRyZXR1cm4gZmlsdGVyRnVuY3Rpb25zLnF1ZXJ5RmlsdGVyQ2hlY2sodmFsdWUscXVlcnkpO1xyXG5cdFx0fTtcclxuXHR9XSlcclxuXHQ7XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG5cdFxyXG5cdGFuZ3VsYXIubW9kdWxlKCdvdmVybGF5TW9kJylcclxuXHRcdC5jb250cm9sbGVyKCdvdmVybGF5Q29udHJvbGxlcicsIFsnJHNjb3BlJyxmdW5jdGlvbigkc2NvcGUpIHtcclxuXHRcdFx0XHJcblx0XHRcdHRoaXMuY2FuY2VsQWN0aW9uID0gZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0JHNjb3BlLm1lc3NhZ2VOdW0gPSAwO1xyXG5cdFx0XHR9O1xyXG5cdFx0XHRcclxuXHRcdH1dKVxyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuXHRhbmd1bGFyLm1vZHVsZSgnbGlzdE1vZCcpXHJcblx0LmNvbnRyb2xsZXIoJ2xpc3RDb250cm9sbGVyJyxbJyRzY29wZScsJyRyb290U2NvcGUnLCdsaXN0RnVuY3Rpb25zJyxmdW5jdGlvbigkc2NvcGUsJHJvb3RTY29wZSxsaXN0RnVuY3Rpb25zKSB7XHJcblx0XHRcclxuXHRcdHZhciBsQ3RybCA9IHRoaXMsXHJcblx0XHRcdGtleSA9ICRzY29wZS5rZXlOYW1lLFxyXG5cdFx0XHRvcmRLZXkgPSAkc2NvcGUub3JkTmFtZSxcclxuXHRcdFx0bGlzdE5hbWUgPSAkc2NvcGUubGlzdE5hbWU7XHJcblx0XHRcclxuXHRcdC8vIFNldHMgc2VsZWN0ZWRMaXN0IGFzIGVtcHR5IGFycmF5IGZvciB0aGlzIGxpc3QgbnVtYmVyLlxyXG5cdFx0bGlzdEZ1bmN0aW9ucy5jbGVhclNlbGVjdGVkKGxpc3ROYW1lKTtcclxuXHRcdHRoaXMuaGlkZU92ZXJsYXkgPSB0cnVlO1xyXG5cdFx0XHJcblx0XHR0aGlzLmxGdW5jID0gbGlzdEZ1bmN0aW9ucztcclxuXHRcdHRoaXMubmV3U2VjdGlvbiA9ICcnO1xyXG5cdFx0dGhpcy5jdXJyZW50U2VjdGlvbiA9IHtzZWN0aW9uOicnLGlkOjB9O1xyXG5cdFx0dGhpcy5vcmRlclNhdmVQZW5kaW5nID0gZmFsc2U7XHJcblx0XHRcclxuXHRcdC8vIFRvZ2dsZSBzZWxlY3Rpb24gb2YgaXRlbSAtIGNoYW5nZXMgc2VsZWN0IHByb3BlcnR5IG9mIGl0ZW0gYmV0d2VlbiB0cnVlL2ZhbHNlIGFuZCBhZGRzL3JlbW92ZXMgZnJvbSBzZWxlY3Rpb24gYXJyYXkgKHNlZSBsaXN0U2Vydi5qcyBmb3IgZnVuY3Rpb24pXHJcblx0XHR0aGlzLnRvZ2dsZVNlbGVjdCA9IGZ1bmN0aW9uKGl0ZW0saW5kZXgpIHtcclxuXHRcdFx0bGlzdEZ1bmN0aW9ucy50b2dnbGVTZWxlY3QoaXRlbSxpbmRleCxrZXksbGlzdE5hbWUpO1x0XHRcclxuXHRcdH07XHJcblx0XHRcclxuXHRcdC8vIEN1c3RvbSBmaWx0ZXIgZnVuY3Rpb24gY2hlY2tpbmcgaXRlbSBmaXJzdCBhZ2FpbnN0IGEgbGlzdCBvZiBleGNsdXNpb25zIHRoZW4gYWdhaW5zdCBjdXN0b20gZmlsdGVyIHZhbHVlc1xyXG5cdFx0dGhpcy5maWx0ZXJDaGVjayA9IGZ1bmN0aW9uKHZhbHVlLGluZGV4LGFycmF5KSB7XHJcblx0XHRcdHJldHVybiBsaXN0RnVuY3Rpb25zLmZpbHRlckNoZWNrKHZhbHVlLGluZGV4LCRzY29wZS5zZWFyY2gsa2V5LGxpc3ROYW1lKTtcclxuXHRcdH07XHJcblx0XHRcclxuXHRcdC8vIFJldHVybnMgdGhlIGxlbmd0aCBhIGxpc3QgKG1haW4gbGlzdCBpZiBub3Qgc3BlY2lmaWVkKS5cclxuXHRcdHRoaXMuZ2V0TGVuZ3RoID0gZnVuY3Rpb24obGlzdE5hbWUsc3ViTGlzdCkge1xyXG5cdFx0XHRpZighc3ViTGlzdCkge1xyXG5cdFx0XHRcdHN1Ykxpc3QgPSAnbWFpbic7XHJcblx0XHRcdH1cclxuXHRcdFx0cmV0dXJuIGxpc3RGdW5jdGlvbnMuTGlzdHNbbGlzdE5hbWVdW3N1Ykxpc3RdLmxlbmd0aDtcclxuXHRcdH07XHJcblx0XHRcclxuXHRcdC8vIENoYW5nZSBvcmRlciBvZiBsaXN0LlxyXG5cdFx0dGhpcy5tb3ZlSXRlbXMgPSBmdW5jdGlvbihkaXJlY3Rpb24pIHtcclxuXHRcdFx0bGlzdEZ1bmN0aW9ucy5tb3ZlSXRlbXMoZGlyZWN0aW9uLGtleSxvcmRLZXksbGlzdE5hbWUpO1xyXG5cdFx0XHR0aGlzLm9yZGVyU2F2ZVBlbmRpbmcgPSB0cnVlO1xyXG5cdFx0fTtcclxuXHRcdFxyXG5cdFx0dGhpcy5jaGVja1NlbGVjdGVkID0gZnVuY3Rpb24oKSB7XHJcblx0XHRcdHJldHVybiBsaXN0RnVuY3Rpb25zLmNoZWNrU2VsZWN0ZWQobGlzdE5hbWUpO1xyXG5cdFx0fTtcclxuXHRcdFxyXG5cdFx0dGhpcy5zZWxlY3RBbGwgPSBmdW5jdGlvbigpIHtcclxuXHRcdFx0bGlzdEZ1bmN0aW9ucy5zZWxlY3RBbGwoa2V5LGxpc3ROYW1lKTtcclxuXHRcdH07XHJcblx0XHRcclxuXHRcdHRoaXMuZGVzZWxlY3RBbGwgPSBmdW5jdGlvbigpIHtcclxuXHRcdFx0bGlzdEZ1bmN0aW9ucy5kZXNlbGVjdEFsbChrZXksbGlzdE5hbWUpO1xyXG5cdFx0fTtcclxuXHRcdFxyXG5cdH1dKVxyXG5cdFxyXG5cdDtcclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcblx0YW5ndWxhci5tb2R1bGUoJ2xpc3RNb2QnKVxyXG5cdC5zZXJ2aWNlKCdsaXN0RnVuY3Rpb25zJywgWyckcScsJ2ZpbHRlckZ1bmN0aW9ucycsZnVuY3Rpb24gKCRxLGZpbHRlckZ1bmN0aW9ucykge1xyXG5cdFx0XHJcblx0XHR2YXIgbEZ1bmMgPSB0aGlzLFxyXG5cdFx0XHRlZGl0TGlzdCA9IFtdLFxyXG5cdFx0XHRjdXJyZW50RmlsdGVyZWRMaXN0ID0gW107XHJcblx0XHRcclxuXHRcdHRoaXMuTGlzdHMgPSB7fTtcclxuXHRcdHRoaXMuc2VjdGlvbkxpc3QgPSBbe3NlY3Rpb246JycsaWQ6MH1dO1xyXG5cdFx0XHJcblx0XHR0aGlzLnNldExpc3QgPSBmdW5jdGlvbihsaXN0QXJyYXksbGlzdE5hbWUsZXhjbHVkZUFycmF5KSB7XHJcblx0XHRcdHRoaXMuTGlzdHNbbGlzdE5hbWVdID0geyBtYWluOmxpc3RBcnJheSxzZWxlY3RlZDpbXSxlZGl0OltdLGZpbHRlcmVkOltdLGV4Y2x1ZGU6ZXhjbHVkZUFycmF5IH07XHJcblx0XHR9O1xyXG5cdFx0XHJcblx0XHR0aGlzLmNsZWFyU2VsZWN0ZWQgPSBmdW5jdGlvbihsaXN0TmFtZSkge1xyXG5cdFx0XHR0aGlzLkxpc3RzW2xpc3ROYW1lXS5zZWxlY3RlZCA9IFtdO1xyXG5cdFx0fTtcclxuXHRcdFxyXG5cdFx0dGhpcy5jaGVja1NlbGVjdGVkID0gZnVuY3Rpb24obGlzdE5hbWUpIHtcclxuXHRcdFx0cmV0dXJuIHRoaXMuTGlzdHNbbGlzdE5hbWVdLnNlbGVjdGVkLmxlbmd0aCA9PT0gMDtcclxuXHRcdH07XHJcblx0XHRcclxuXHRcdHRoaXMubGlzdExlbmd0aCA9IGZ1bmN0aW9uKGxpc3ROYW1lLHN1Ykxpc3QpIHtcclxuXHRcdFx0c3ViTGlzdCA9IHR5cGVvZiBzdWJMaXN0ICE9PSAndW5kZWZpbmVkJyA/IHN1Ykxpc3QgOiAnbWFpbic7XHJcblx0XHRcdGlmKHRoaXMuTGlzdHNbbGlzdE5hbWVdKSB7XHJcblx0XHRcdFx0cmV0dXJuIHRoaXMuTGlzdHNbbGlzdE5hbWVdW3N1Ykxpc3RdLmxlbmd0aDtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRyZXR1cm4gMDtcclxuXHRcdFx0fVxyXG5cdFx0fTtcclxuXHRcdFxyXG5cdFx0Ly8gRmlyc3QgY2hlY2tzIGV4Y2x1ZGUgYXJyYXkgZm9yIGl0ZW0sIHRoZW4gY2hlY2tzIHNlYXJjaCB2YWx1ZSAoc2VlIGZpbHRlclNlcnZpY2UuanMpXHJcblx0XHR0aGlzLmZpbHRlckNoZWNrID0gZnVuY3Rpb24odmFsdWUsaW5kZXgsc2VhcmNoLGtleU5hbWUsbGlzdE5hbWUpIHtcclxuXHRcdFx0dmFyIGxpc3RDaGVjayA9IGZhbHNlLFxyXG5cdFx0XHRcdHNob3dJdGVtID0gZmFsc2U7XHJcblx0XHRcdGxpc3RDaGVjayA9IGxGdW5jLmZpbmRCeUlkKHZhbHVlW2tleU5hbWVdLGxpc3ROYW1lLGtleU5hbWUsJ2V4Y2x1ZGUnKTtcclxuXHRcdFx0aWYobGlzdENoZWNrID09PSBmYWxzZSkge1xyXG5cdFx0XHRcdHNob3dJdGVtID0gZmlsdGVyRnVuY3Rpb25zLmZpbHRlckNoZWNrKHZhbHVlLHNlYXJjaCk7XHJcblx0XHRcdFx0Ly8gRGVzZWxlY3QgaXRlbSBpZiB0aGUgZmlsdGVyIGV4Y2x1ZGVzIHRoZSBpdGVtXHJcblx0XHRcdFx0aWYodmFsdWUuc2VsZWN0ZWQgJiYgIXNob3dJdGVtICYmIGluZGV4ID49IDApIHtcclxuXHRcdFx0XHRcdGxGdW5jLmRlc2VsZWN0SXRlbSh2YWx1ZVtrZXlOYW1lXSxpbmRleCxrZXlOYW1lLGxpc3ROYW1lKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdFx0bEZ1bmMuc2V0RmlsdGVyZWQobGlzdE5hbWUsaW5kZXgsc2hvd0l0ZW0pO1xyXG5cdFx0XHRyZXR1cm4gc2hvd0l0ZW07XHJcblx0XHR9O1xyXG5cdFx0XHJcblx0XHQvLyBBZGRzIHByb3BlcnR5IHdpdGggZmlsdGVyIHN0YXR1cyBvZiBlbGVtZW50XHJcblx0XHR0aGlzLnNldEZpbHRlcmVkID0gZnVuY3Rpb24obGlzdE5hbWUsaW5kZXgsc2hvdykge1xyXG5cdFx0XHR0aGlzLkxpc3RzW2xpc3ROYW1lXS5tYWluW2luZGV4XS5zaG93SXRlbSA9IHNob3c7XHJcblx0XHR9O1xyXG5cdFx0XHJcblx0XHQvLyBDcmVhdGVzIGEgbGlzdCBvZiBvbmx5IHRoZSBjdXJyZW50bHkgZmlsdGVyZWQgZWxlbWVudHMgb2YgdGhlIG1haW4gYXJyYXkuIFJldHVybnMgdGhpcyBmaWx0ZXJlZCBhcnJheS5cclxuXHRcdHRoaXMuc2V0RmlsdGVyQXJyYXkgPSBmdW5jdGlvbihsaXN0TmFtZSkge1xyXG5cdFx0XHR2YXIgbWFpbkFycmF5ID0gdGhpcy5MaXN0c1tsaXN0TmFtZV0ubWFpbjtcclxuXHRcdFx0Zm9yKHZhciBpID0gMDsgaSA8IG1haW5BcnJheS5sZW5ndGg7IGkrKykge1xyXG5cdFx0XHRcdGlmKG1haW5BcnJheVtpXS5zaG93SXRlbSA9PT0gdHJ1ZSkge1xyXG5cdFx0XHRcdFx0dGhpcy5MaXN0c1tsaXN0TmFtZV0uZmlsdGVyZWQucHVzaChtYWluQXJyYXlbaV0pO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0XHRyZXR1cm4gdGhpcy5MaXN0c1tsaXN0TmFtZV0uZmlsdGVyZWQ7XHJcblx0XHR9O1xyXG5cdFx0XHJcblx0XHR0aGlzLnRvZ2dsZVNlbGVjdCA9IGZ1bmN0aW9uKGl0ZW0saW5kZXgsa2V5LGxpc3ROYW1lKSB7XHJcblx0XHRcdGtleSA9IGtleSA/IGtleSA6ICdpZCc7XHJcblx0XHRcdHZhciBpZCA9IGl0ZW1ba2V5XTtcclxuXHRcdFx0aWYoIWluZGV4ICYmIGluZGV4ICE9PSAwKSB7XHJcblx0XHRcdFx0aW5kZXggPSB0aGlzLmZpbmRCeUlkKGlkLGxpc3ROYW1lLGtleSwnbWFpbicpO1xyXG5cdFx0XHR9XHJcblx0XHRcdGlmKCFpdGVtLnNlbGVjdGVkKSB7XHJcblx0XHRcdFx0dGhpcy5zZWxlY3RJdGVtKGl0ZW0saW5kZXgsa2V5LGxpc3ROYW1lKTtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHR0aGlzLmRlc2VsZWN0SXRlbShpZCxpbmRleCxrZXksbGlzdE5hbWUpO1xyXG5cdFx0XHR9XHJcblx0XHR9O1xyXG5cclxuXHRcdC8vIEZ1bmN0aW9uIHRvIGNyZWF0ZSBhIGNvbW1hIHNlcGFyYXRlZCBsaXN0IG9mIGEgcGFydGljdWxhciBwcm9wZXJ0eSB3aXRoaW4gYW4gYXJyYXkgXHJcblx0XHR0aGlzLm1ha2VMaXN0ID0gZnVuY3Rpb24obGlzdE5hbWUsa2V5TmFtZSxzdWJMaXN0KSB7XHJcblx0XHRcdGlmKCFzdWJMaXN0KSB7XHJcblx0XHRcdFx0c3ViTGlzdCA9ICdtYWluJztcclxuXHRcdFx0fVxyXG5cdFx0XHR2YXIgbGlzdEFycmF5ID0gdGhpcy5MaXN0c1tsaXN0TmFtZV1bc3ViTGlzdF07XHJcblx0XHRcdGZvcih2YXIgaSA9IDA7IGkgPCBsaXN0QXJyYXkubGVuZ3RoOyBpKyspIHtcclxuXHRcdFx0XHRtZXNzYWdlICs9IGxpc3RBcnJheVtpXVtrZXlOYW1lXTtcclxuXHRcdFx0XHRpZihpIDwgbGlzdEFycmF5Lmxlbmd0aCAtIDEpIHtcclxuXHRcdFx0XHRcdG1lc3NhZ2UgKz0gJywgJztcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdFx0cmV0dXJuIG1lc3NhZ2U7XHJcblx0XHR9O1xyXG5cclxuXHRcdC8vIFJldHVybnMgdGhlIGluZGV4IG9mIHRoZSBpdGVtIHdpdGhpbiB0aGUgYW4gYXJyYXkgKHNwZWNpZmllZCBieSBsaXN0TmFtZSBhbmQgc3ViTGlzdCkgb3IgZmFsc2UgaWYgbm90IGZvdW5kLiAgU2VhcmNoIGJ5IGtleSAoc2hvdWxkIGJlIHVuaXF1ZSBpZC5cclxuXHRcdHRoaXMuZmluZEJ5SWQgPSBmdW5jdGlvbihpZCxsaXN0TmFtZSxrZXksc3ViTGlzdCkge1xyXG5cdFx0XHRrZXkgPSB0eXBlb2Yga2V5ICE9PSAndW5kZWZpbmVkJyA/IGtleSA6ICdpZCc7XHJcblx0XHRcdHN1Ykxpc3QgPSB0eXBlb2Ygc3ViTGlzdCAhPT0gJ3VuZGVmaW5lZCcgPyBzdWJMaXN0IDogJ21haW4nO1xyXG5cdFx0XHR2YXIgbGlzdEFycmF5ID0gdGhpcy5MaXN0c1tsaXN0TmFtZV1bc3ViTGlzdF07XHJcblx0XHRcdGZvcih2YXIgaSA9IDA7IGkgPCBsaXN0QXJyYXkubGVuZ3RoOyBpKyspIHtcclxuXHRcdFx0XHRpZihTdHJpbmcobGlzdEFycmF5W2ldW2tleV0pID09PSBTdHJpbmcoaWQpKSB7XHJcblx0XHRcdFx0XHRyZXR1cm4gaTtcclxuXHRcdFx0XHR9XHRcdFx0XHJcblx0XHRcdH1cclxuXHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0fTtcclxuXHRcdFxyXG5cdFx0Ly8gRGVsZXRlcyBpdGVtcyBmb3VuZCBpbiBkZWxBcnJheSBmcm9tIG1haW4gbGlzdCBzZWFyY2hpbmcgYnkgaWQuIFJldHVybnMgbmV3IGFycmF5LlxyXG5cdFx0dGhpcy5kZWxldGVCeUlkID0gZnVuY3Rpb24oZGVsQXJyYXksaWROYW1lLGxpc3ROYW1lLHN1Ykxpc3QpIHtcclxuXHRcdFx0dmFyIG51bUl0ZW1zID0gZGVsQXJyYXkubGVuZ3RoO1xyXG5cdFx0XHRzdWJMaXN0ID0gdHlwZW9mIHN1Ykxpc3QgIT09ICd1bmRlZmluZWQnID8gc3ViTGlzdCA6ICdtYWluJztcclxuXHRcdFx0Zm9yKHZhciBpID0gMDsgaSA8IG51bUl0ZW1zOyBpKyspIHtcclxuXHRcdFx0XHR2YXIgaW1nSW5kZXggPSBsRnVuYy5maW5kQnlJZChkZWxBcnJheVtpXVtpZE5hbWVdLGxpc3ROYW1lLGlkTmFtZSxzdWJMaXN0KTtcclxuXHRcdFx0XHRsRnVuYy5MaXN0c1tsaXN0TmFtZV0ubWFpbi5zcGxpY2UoaW1nSW5kZXgsMSk7XHJcblx0XHRcdH1cclxuXHRcdH07XHJcblx0XHRcclxuXHRcdC8vIFNlbGVjdHMgYWxsIGl0ZW1zIHdpdGhpbiB0aGUgY3VycmVudCBmaWx0ZXIgc2V0XHJcblx0XHR0aGlzLnNlbGVjdEFsbCA9IGZ1bmN0aW9uKGtleSxsaXN0TmFtZSkge1xyXG5cdFx0XHRrZXkgPSB0eXBlb2Yga2V5ICE9PSAndW5kZWZpbmVkJyA/IGtleSA6ICdpZCc7XHJcblx0XHRcdHZhciBmaWx0ZXJlZEl0ZW1zID0gdGhpcy5zZXRGaWx0ZXJBcnJheShsaXN0TmFtZSk7XHJcblx0XHRcdHZhciBudW1JdGVtcyA9IGZpbHRlcmVkSXRlbXMubGVuZ3RoO1xyXG5cdFx0XHRmb3IodmFyIGkgPSAwOyBpIDwgbnVtSXRlbXM7IGkrKykge1xyXG5cdFx0XHRcdGlmKCFmaWx0ZXJlZEl0ZW1zW2ldLnNlbGVjdGVkKSB7XHJcblx0XHRcdFx0XHRsRnVuYy5zZWxlY3RJdGVtKGZpbHRlcmVkSXRlbXNbaV0sdW5kZWZpbmVkLGtleSxsaXN0TmFtZSk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9O1xyXG5cdFx0XHJcblx0XHQvLyBEZXNlbGVjdHMgYWxsIGl0ZW1zXHJcblx0XHR0aGlzLmRlc2VsZWN0QWxsID0gZnVuY3Rpb24oa2V5LGxpc3ROYW1lKSB7XHJcblx0XHRcdGtleSA9IHR5cGVvZiBrZXkgIT09ICd1bmRlZmluZWQnID8ga2V5IDogJ2lkJztcclxuXHRcdFx0dmFyIG51bVBob3RvcyA9IHRoaXMuTGlzdHNbbGlzdE5hbWVdLm1haW4ubGVuZ3RoO1xyXG5cdFx0XHRpZighdGhpcy5jaGVja1NlbGVjdGVkKGxpc3ROYW1lKSkge1xyXG5cdFx0XHRcdGZvcih2YXIgaSA9IDA7IGkgPCBudW1QaG90b3M7IGkrKykge1xyXG5cdFx0XHRcdFx0dmFyIGl0ZW0gPSB0aGlzLkxpc3RzW2xpc3ROYW1lXS5tYWluW2ldO1xyXG5cdFx0XHRcdFx0aWYoaXRlbS5zZWxlY3RlZCkge1xyXG5cdFx0XHRcdFx0XHR0aGlzLmRlc2VsZWN0SXRlbShpdGVtLmlkLGksa2V5LGxpc3ROYW1lKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdH07XHJcblx0XHRcclxuXHRcdHRoaXMuZGVzZWxlY3RJdGVtID0gZnVuY3Rpb24oaWQsaW5kZXgsa2V5LGxpc3ROYW1lKSB7XHJcblx0XHRcdGtleSA9IHR5cGVvZiBrZXkgIT09ICd1bmRlZmluZWQnID8ga2V5IDogJ2lkJztcclxuXHRcdFx0bEZ1bmMuTGlzdHNbbGlzdE5hbWVdLm1haW5baW5kZXhdLnNlbGVjdGVkID0gZmFsc2U7XHJcblx0XHRcdHZhciBzZWxJbmRleCA9IGxGdW5jLmZpbmRCeUlkKGlkLGxpc3ROYW1lLGtleSwnc2VsZWN0ZWQnKTtcclxuXHRcdFx0bEZ1bmMuTGlzdHNbbGlzdE5hbWVdLnNlbGVjdGVkLnNwbGljZShzZWxJbmRleCwxKTtcclxuXHRcdH07XHJcblxyXG5cdFx0dGhpcy5zZWxlY3RJdGVtID0gZnVuY3Rpb24oaXRlbSxpbmRleCxrZXksbGlzdE5hbWUpIHtcclxuXHRcdFx0a2V5ID0gdHlwZW9mIGtleSAhPT0gJ3VuZGVmaW5lZCcgPyBrZXkgOiAnaWQnO1xyXG5cdFx0XHRpZighaW5kZXgpIHtcclxuXHRcdFx0XHRpbmRleCA9IHRoaXMuZmluZEJ5SWQoaXRlbVtrZXldLGxpc3ROYW1lLGtleSwnbWFpbicpO1xyXG5cdFx0XHR9XHJcblx0XHRcdHRoaXMuTGlzdHNbbGlzdE5hbWVdLm1haW5baW5kZXhdLnNlbGVjdGVkID0gdHJ1ZTtcclxuXHRcdFx0dGhpcy5MaXN0c1tsaXN0TmFtZV0uc2VsZWN0ZWQucHVzaChpdGVtKTtcclxuXHRcdH07XHJcblx0XHRcclxuXHRcdC8vIEFmdGVyIGl0ZW1zIGFyZSBtb3ZlZCBpbiBsaXN0LCBzZXRzIHRoZSBvcmRlciB2YWx1ZSAobmFtZWQgb3JkS2V5KSB0byB0aGUgY29ycmVjdCBudW1iZXIgZm9yIHRoZSBEQi4gIEFsc28gYWRkcyBvcmRlciBhbmQgc2VjdGlvbiB0byB0aGUgc2VsZWN0ZWQgbGlzdC5cclxuXHRcdHZhciByZXNldE9yZGVyID0gZnVuY3Rpb24oa2V5LG9yZEtleSxsaXN0TmFtZSxzZWN0aW9uKSB7XHJcblx0XHRcdHZhciBzZWxJbmRleCA9IDA7XHJcblx0XHRcdGZvcihpID0gMDsgaSA8IGxGdW5jLkxpc3RzW2xpc3ROYW1lXS5tYWluLmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdFx0bEZ1bmMuTGlzdHNbbGlzdE5hbWVdLm1haW5baV1bb3JkS2V5XSA9IGk7XHJcblx0XHRcdFx0aWYobEZ1bmMuTGlzdHNbbGlzdE5hbWVdLm1haW4uc2VsZWN0ZWQpIHtcclxuXHRcdFx0XHRcdHNlbEluZGV4ID0gbEZ1bmMuZmluZEJ5SWQobEZ1bmMuTGlzdHNbbGlzdE5hbWVdLm1haW5baV1ba2V5XSxsaXN0TmFtZSxrZXksJ3NlbGVjdGVkJyk7XHJcblx0XHRcdFx0XHRsRnVuYy5MaXN0c1tsaXN0TmFtZV0uc2VsZWN0ZWRbc2VsSW5kZXhdW29yZEtleV0gPSBpO1xyXG5cdFx0XHRcdFx0aWYodHlwZW9mIHNlY3Rpb24gIT09ICd1bmRlZmluZWQnKSB7XHJcblx0XHRcdFx0XHRcdGxGdW5jLkxpc3RzW2xpc3ROYW1lXS5zZWxlY3RlZFtzZWxJbmRleF0uc2VjdGlvbiA9IHNlY3Rpb247XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9O1xyXG5cdFx0XHJcblx0XHQvLyBBZGRzIHRoZSBzZWxlY3RlZCBpdGVtcyB0byBhIHNlY3Rpb24gYW5kIHJlb3JkZXJzIGl0ZW1zIHRvIGdyb3VwIHRob3NlIHRvZ2V0aGVyLlxyXG5cdFx0dGhpcy5ncm91cFNlbGVjdGVkID0gZnVuY3Rpb24oa2V5LG9yZEtleSxzZWN0aW9uLGxpc3ROYW1lKSB7XHJcblx0XHRcdHZhciBsaXN0VGVtcCA9IGxGdW5jLkxpc3RzW2xpc3ROYW1lXS5tYWluLFxyXG5cdFx0XHRcdGZpcnN0SW5kZXggPSAtMSxcclxuXHRcdFx0XHRtb3ZlSW5kZXggPSAwLFxyXG5cdFx0XHRcdHNlbEluZGV4O1xyXG5cdFx0XHRmb3IodmFyIGkgPSAwOyBpIDwgbGlzdFRlbXAubGVuZ3RoOyBpKyspIHtcclxuXHRcdFx0XHRpZihsaXN0VGVtcFtpXS5zZWxlY3RlZCB8fCBsbGlzdFRlbXBbaV0uc2VjdGlvbiA9PT0gc2VjdGlvbikge1xyXG5cdFx0XHRcdFx0aWYoZmlyc3RJbmRleCA9IC0xKSB7XHJcblx0XHRcdFx0XHRcdGZpcnN0SW5kZXggPSBpO1xyXG5cdFx0XHRcdFx0XHRsaXN0VGVtcFtpXS5zZWN0aW9uID0gc2VjdGlvbjtcclxuXHRcdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRcdG1vdmVJbmRleCA9IGk7XHJcblx0XHRcdFx0XHRcdGxpc3RUZW1wW21vdmVJbmRleF0uc2VjdGlvbiA9IHNlY3Rpb247XHJcblx0XHRcdFx0XHRcdGxpc3RUZW1wLnNwbGljZShmaXJzdEluZGV4KzEsMCxsaXN0VGVtcC5zcGxpY2UobW92ZUluZGV4LDEpWzBdKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdFx0bEZ1bmMuTGlzdHNbbGlzdE5hbWVdLm1haW4gPSBsaXN0VGVtcDtcclxuXHRcdFx0cmVzZXRPcmRlcihrZXksb3JkS2V5LGxpc3ROYW1lLHNlY3Rpb24pO1xyXG5cdFx0fTtcclxuXHRcdFxyXG5cdFx0Ly8gTW92ZXMgYW4gaXRlbSBvciBpdGVtcy4gIENoZWNrcyB0aGUgc2VjdGlvbnMgb2YgdGhlIGl0ZW1zIHRvIGVuc3VyZSBpdGVtcyB3aXRoaW4gc2FtZSBzZWN0aW9uIHN0aWNrIHRvZ2V0aGVyLlxyXG5cdFx0dGhpcy5tb3ZlSXRlbXMgPSBmdW5jdGlvbihkaXJlY3Rpb24sa2V5LG9yZEtleSxsaXN0TmFtZSkge1xyXG5cdFx0XHR2YXIgc2VsU2VjdGlvbixcclxuXHRcdFx0XHRsaXN0TGVuID0gbEZ1bmMuTGlzdHNbbGlzdE5hbWVdLm1haW4ubGVuZ3RoLFxyXG5cdFx0XHRcdG11bHRpcGxpZXIsXHJcblx0XHRcdFx0bmV4dFNlY3Rpb247XHJcblx0XHRcdHZhciBpID0gZGlyZWN0aW9uID4gMCA/IGxpc3RMZW4gLSAxIDogMDtcclxuXHRcdFx0Ly8gTG9vcCB0aHJvdWdoIG1haW4gbGlzdCBvcHBvc2l0ZSB0aGUgZGlyZWN0aW9uIG9mIHRoZSBtb3ZlbWVudCBvZiBpdGVtcyB0byBtYWtlIHN1cmUgb3JkZXIgaXMgb3RoZXJ3aXNlIHByZXNlcnZlZC5cclxuXHRcdFx0Zm9yKGk7IGkgPCBsaXN0TGVuICYmIGkgPj0gMDsgaSA9IGkgLSBkaXJlY3Rpb24pIHtcclxuXHRcdFx0XHRtdWx0aXBsaWVyID0gMTtcclxuXHRcdFx0XHQvLyBJZiB0aGUgaXRlbSBpcyBpbiB0aGUgc2VsZWN0ZWQgbGlzdCBvciB0aGUgc2VjdGlvbiBpcyBtb3ZpbmcuXHJcblx0XHRcdFx0aWYobEZ1bmMuZmluZEJ5SWQobEZ1bmMuTGlzdHNbbGlzdE5hbWVdLm1haW5baV1ba2V5XSxsaXN0TmFtZSxrZXksJ3NlbGVjdGVkJykgIT09IGZhbHNlIHx8IGxGdW5jLkxpc3RzW2xpc3ROYW1lXS5tYWluW2ldLnNlY3Rpb24gPT09IHNlbFNlY3Rpb24pIHtcclxuXHRcdFx0XHRcdC8vIFNldCBzZWxTZWN0aW9uIHRvIHNlY3Rpb24gb2YgYSBzZWxlY3RlZCBpdGVtLlxyXG5cdFx0XHRcdFx0aWYobEZ1bmMuTGlzdHNbbGlzdE5hbWVdLm1haW5baV0uc2VjdGlvbiAhPT0gJycpIHtcclxuXHRcdFx0XHRcdFx0c2VsU2VjdGlvbiA9IGxGdW5jLkxpc3RzW2xpc3ROYW1lXS5tYWluW2ldLnNlY3Rpb247XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHQvLyBJZiB0aGUgbW92ZW1lbnQgd291bGQgcHV0IHRoZSBpdGVtIG91dHNpZGUgb2YgbGlzdCBib3VuZGFyaWVzIG9yIGFub3RoZXIgc2VsZWN0aW9uIGhhcyBoaXQgdGhvc2UgYm91bmRhcmllcyBkb24ndCBtb3ZlLlxyXG5cdFx0XHRcdFx0aWYoaStkaXJlY3Rpb24gPj0gMCAmJiBpK2RpcmVjdGlvbiA8IGxpc3RMZW4gJiYgIWxGdW5jLkxpc3RzW2xpc3ROYW1lXS5tYWluW2krZGlyZWN0aW9uXS5zZWxlY3RlZCkge1xyXG5cdFx0XHRcdFx0XHQvLyBJZiB0aGUgbmV4dCBpdGVtIGlzIGluIGEgZGVmaW5lZCBzZWN0aW9uLCBuZWVkIHRvIGNoZWNrICYgY291bnQgaXRlbXMgaW4gc2VjdGlvbiB0byBqdW1wIG92ZXIgb3Igc3RvcCBtb3ZlbWVudC5cclxuXHRcdFx0XHRcdFx0aWYobEZ1bmMuTGlzdHNbbGlzdE5hbWVdLm1haW5baStkaXJlY3Rpb25dLnNlY3Rpb24gIT09ICcnICYmIGxGdW5jLkxpc3RzW2xpc3ROYW1lXS5tYWluW2ldLnNlY3Rpb24gIT09IGxGdW5jLkxpc3RzW2xpc3ROYW1lXS5tYWluW2krZGlyZWN0aW9uXS5zZWN0aW9uKSB7XHJcblx0XHRcdFx0XHRcdFx0bmV4dFNlY3Rpb24gPSBsRnVuYy5MaXN0c1tsaXN0TmFtZV0ubWFpbltpK2RpcmVjdGlvbl0uc2VjdGlvbjtcclxuXHRcdFx0XHRcdFx0XHRtdWx0aXBsaWVyID0gMDtcclxuXHRcdFx0XHRcdFx0XHQvLyBMb29wIGJhY2sgdGhyb3VnaCBhcnJheSBpbiB0aGUgZGlyZWN0aW9uIG9mIG1vdmVtZW50LlxyXG5cdFx0XHRcdFx0XHRcdGZvcih2YXIgaiA9IGkgKyBkaXJlY3Rpb247IGogPCBsaXN0TGVuICYmIGogPj0gMDsgaiA9IGogKyBkaXJlY3Rpb24pIHtcclxuXHRcdFx0XHRcdFx0XHRcdC8vIElmIHRoZSBpdGVtIGlzIGluIHRoZSBzZWN0aW9uLi4uXHJcblx0XHRcdFx0XHRcdFx0XHRpZihsRnVuYy5MaXN0c1tsaXN0TmFtZV0ubWFpbltqXS5zZWN0aW9uID09PSBuZXh0U2VjdGlvbikge1xyXG5cdFx0XHRcdFx0XHRcdFx0XHQvLyBJZiBzZWxlY3RlZCBzdG9wIG1vdmVtZW50IGFuZCBicmVhay5cclxuXHRcdFx0XHRcdFx0XHRcdFx0aWYobEZ1bmMuTGlzdHNbbGlzdE5hbWVdLm1haW5bal0uc2VsZWN0ZWQpIHtcclxuXHRcdFx0XHRcdFx0XHRcdFx0XHRtdWx0aXBsaWVyID0gMDtcclxuXHRcdFx0XHRcdFx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRcdFx0XHQvLyBJZiBub3QsIGNvdW50IHNlY3Rpb24uXHJcblx0XHRcdFx0XHRcdFx0XHRcdG11bHRpcGxpZXIrKztcclxuXHRcdFx0XHRcdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRcdFx0XHRcdC8vIEJyZWFrIGxvb3AgYXQgZmlyc3QgaXRlbSBub3QgaW4gc2VjdGlvbi5cclxuXHRcdFx0XHRcdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdC8vIEZpbmFsIGNoZWNrOiBvbmx5IG1vdmUgYW4gaXRlbSBpZiBpdCBpcyBzZWxlY3RlZCBvciB0byBlbnN1cmUgaXRlbXMgb2YgdGhlIHNhbWUgc2VjdGlvbiBzdGljayB0b2dldGhlclxyXG5cdFx0XHRcdFx0XHRpZihsRnVuYy5MaXN0c1tsaXN0TmFtZV0ubWFpbltpXS5zZWxlY3RlZCB8fCBsRnVuYy5MaXN0c1tsaXN0TmFtZV0ubWFpbltpK2RpcmVjdGlvbl0uc2VjdGlvbiAhPT0gbEZ1bmMuTGlzdHNbbGlzdE5hbWVdLm1haW5baV0uc2VjdGlvbikge1xyXG5cdFx0XHRcdFx0XHRcdGxGdW5jLkxpc3RzW2xpc3ROYW1lXS5tYWluLnNwbGljZShpKyhkaXJlY3Rpb24qbXVsdGlwbGllciksMCxsRnVuYy5MaXN0c1tsaXN0TmFtZV0ubWFpbi5zcGxpY2UoaSwxKVswXSk7XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdFx0Ly8gUmVzZXQgb3JkZXIgdmFyaWFibGUgZm9yIGRhdGFiYXNlLlxyXG5cdFx0XHRyZXNldE9yZGVyKGtleSxvcmRLZXksbGlzdE5hbWUpO1xyXG5cdFx0fTtcclxuXHRcdFxyXG5cdH1dKTtcclxufSkoKTsiXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
