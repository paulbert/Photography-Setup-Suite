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
			return listFunctions.filterCheck(value,index,$scope.search,keyName,listName);
		};
		
		// Returns the length a list (main list if not specified).
		this.getLength = function(listName,subList) {
			if(!subList) {
				subList = 'main';
			}
			return listFunctions.Lists[listName].length;
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
	.service('listFunctions', ['$q',function ($q) {
		
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImZpbHRlcnMvZmlsdGVyRGlyZWN0aXZlLmpzIiwibGlzdHMvbGlzdERpcmVjdGl2ZS5qcyIsIm92ZXJsYXkvb3ZlcmxheURpcmVjdGl2ZS5qcyIsImZpbHRlcnMvY29tcG9uZW50cy9maWx0ZXJDaGVja2JveENvbXBvbmVudERpcmVjdGl2ZS5qcyIsImZpbHRlcnMvY29tcG9uZW50cy9maWx0ZXJRdWVyeUNvbXBvbmVudERpcmVjdGl2ZS5qcyIsImZpbHRlckNvbnRyb2xsZXIuanMiLCJmaWx0ZXJTZXJ2aWNlLmpzIiwiY29tcG9uZW50cy9maWx0ZXJDb21wb25lbnRDb250cm9sbGVyLmpzIiwib3ZlcmxheUNvbnRyb2xsZXIuanMiLCJsaXN0Q29udHJvbGxlci5qcyIsImxpc3RTZXJ2LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FDSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQy9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3JCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMxQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzNGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzlCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDNUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJwaG90by10b29scy5qcyIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpIHtcblx0YW5ndWxhci5tb2R1bGUoJ3Bob3RvRWRpdENvbXBvbmVudHMnLCBbJ2xpc3RNb2QnLCdmaWx0ZXJNb2QnLCdvdmVybGF5TW9kJ10pO1xuXHRcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG5cdFxyXG5cdC8qXHJcblx0U2VhcmNoIHZhcmlhYmxlIHNob3VsZCBiZSBhbiBhcnJheSBvZiBvYmplY3RzIG5hbWVkIHRoZSBzYW1lIGFzIHRoZSBwcm9wZXJ0aWVzIG9mIHRoZSBvYmplY3RzIHdpdGhpbiB0aGUgbGlzdC5cclxuXHRcdFJlcXVpcmVzIGEgJ3F1ZXJ5JyBwcm9wZXJ0eSB3aXRoaW4gb2JqZWN0IHdoaWNoIGlzIG1vZGVsZWQgdG8gYSB0ZXh0L2lucHV0IGZpbHRlci5cclxuXHRcdElmIHRoZSBzZWFyY2hlZCBwcm9wZXJ0eSBpcyBhbiBhcnJheSBvZiBvYmplY3RzIChpZiwgZm9yIGV4YW1wbGUsIGltYWdlcyBjYW4gYmUgaW4gbWFueSBnYWxsZXJ5IGdyb3VwaW5ncyksIGFkZCAnaXNBcnJheScgcHJvcGVydHkgYW5kIHNldCB0byB0cnVlLCBhbHNvIGFkZCAnc2VhcmNoT24nIHByb3BlcnR5IGFuZCBzZXQgdG8gdGhlIG5hbWUgb2YgdGhlIHByb3BlcnR5IHdpdGhpbiBvYmplY3RzLlxyXG5cdFx0RXhhbXBsZTogaW1hZ2VzID0gWyB7aW1nbmFtZTogJ2ltZzEuanBnJywgZ2FsbGVyaWVzOiBbIHsgaWQ6MSwgbmFtZTonZ2FsbGVyeTEnIH0sIHsgaWQ6MiwgbmFtZTonZ2FsbGVyeTInfSBdfSwgLi4uXVxyXG5cdFx0c2VhcmNoID0geyBnYWxsZXJpZXM6IHsgcXVlcnk6JycsIGlzQXJyYXk6IHRydWUsIHNlYXJjaE9uOiAnbmFtZScgfSB9XHJcblx0XHRGb3IgYSBjaGVja2JveCBmaWx0ZXIsIGluY2x1ZGUgYW4gb2JqZWN0IGNhbGxlZCAnY2hlY2tib3hlcycgd2l0aCBhICdub25lJyBwcm9wZXJ0eSBhbmQgYWxsIHBvc3NpYmxlIHZhbHVlcyBpbiAwLW4gcHJvcGVydHkuXHJcblx0XHRCYXNlZCBvbiBhYm92ZSBleGFtcGxlOiBzZWFyY2ggPSB7IGdhbGxlcmllczogeyAuLi4gY2hlY2tib3hlczogeyBub25lOiB0cnVlLCAwOidnYWxsZXJ5MScsMTonZ2FsbGVyeTInIH0gfVxyXG5cdCovXHJcblx0XHJcblx0YW5ndWxhci5tb2R1bGUoJ2ZpbHRlck1vZCcsW10pXHJcblx0LmRpcmVjdGl2ZSgnZmlsdGVyQmFyJywgZnVuY3Rpb24oKSB7XHJcblx0XHRyZXR1cm4ge1xyXG5cdFx0XHRzY29wZToge1xyXG5cdFx0XHRcdHNlYXJjaDonPScsXHJcblx0XHRcdFx0ZnBvc2l0aW9uOic9PycsXHJcblx0XHRcdFx0aW5saW5lOidAPydcclxuXHRcdFx0fSxcclxuXHRcdFx0dGVtcGxhdGU6ICc8ZGl2IG5nLWluY2x1ZGU9XCJ0ZW1wbGF0ZVVybFwiPjwvZGl2PicsXHJcblx0XHRcdGNvbnRyb2xsZXI6J2ZpbHRlckJhckNvbnRyb2xsZXInLFxyXG5cdFx0XHRjb250cm9sbGVyQXM6J2ZiYXInLFxyXG5cdFx0XHRsaW5rOiBmdW5jdGlvbihzY29wZSxlbGVtZW50LGF0dHJzKSB7XHJcblx0XHRcdFx0c2NvcGUuYmFzZSA9IGF0dHJzLnRtcGx0LmJhc2U7XHJcblx0XHRcdFx0c2NvcGUudGVtcGxhdGVVcmwgPSBhdHRycy50bXBsdC5iYXNlICsgYXR0cnMudG1wbHQuZmlsZU5hbWU7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9KVxyXG5cdDtcclxuXHRcdFxyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcblx0YW5ndWxhci5tb2R1bGUoJ2xpc3RNb2QnLFtdKVxuXHQuZGlyZWN0aXZlKCdsaXN0T2ZJdGVtcycsZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdHNjb3BlOiB7XG5cdFx0XHRcdHNlYXJjaDonPScsXG5cdFx0XHRcdGxpc3ROYW1lOic9bGlzdCcsXG5cdFx0XHRcdGtleU5hbWU6J0BrZXknLFxuXHRcdFx0XHRvcmRLZXk6J0BvcmROYW1lJyxcblx0XHRcdFx0Ly8gQWRkaXRpb25hbCBmdW5jdGlvbnMgdG8gYmUgY2FsbGVkIGZyb20gYnV0dG9ucyBpbiB0aGUgbGlzdCAoc2F2ZSBpbmZvLCBkZWxldGUsIGV0Yylcblx0XHRcdFx0YWRkRnVuY3M6Jz1mdW5jcydcblx0XHRcdH0sXG5cdFx0XHR0ZW1wbGF0ZTogJzxkaXYgbmctaW5jbHVkZT1cInRlbXBsYXRlVXJsXCI+PC9kaXY+Jyxcblx0XHRcdGNvbnRyb2xsZXI6J2xpc3RDb250cm9sbGVyJyxcblx0XHRcdGNvbnRyb2xsZXJBczonbGlzdCcsXG5cdFx0XHRsaW5rOiBmdW5jdGlvbihzY29wZSxlbGVtZW50LGF0dHJzKSB7XG5cdFx0XHRcdHNjb3BlLnRlbXBsYXRlVXJsID0gYXR0cnMudG1wbHQuYmFzZSArIGF0dHJzLnRtcGx0LmZpbGVOYW1lO1xuXHRcdFx0fVxuXHRcdH1cblx0fSlcblx0O1xufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcblx0XHJcblx0YW5ndWxhci5tb2R1bGUoJ292ZXJsYXlNb2QnLFtdKVxyXG5cdC5kaXJlY3RpdmUoJ292ZXJsYXknLCBmdW5jdGlvbigpIHtcclxuXHRcdHJldHVybiB7XHJcblx0XHRcdHNjb3BlOiB7XHJcblx0XHRcdFx0bWVzc2FnZTonPScsXHJcblx0XHRcdFx0bWVzc2FnZU51bTonPW51bWJlcicsXHJcblx0XHRcdFx0YnRuQ29uZmlnOic9Y2ZnJyxcclxuXHRcdFx0XHQvLyBGdW5jdGlvbiBmb3IgYWN0aW9uIG9mIG92ZXJsYXkgKGNhbmNlbC9iYWNrIGlzIGluIGNvbnRyb2xsZXIpXHJcblx0XHRcdFx0ZG9BY3Rpb246Jz1mdW5jJyxcclxuXHRcdFx0XHRiYXNlOidAPydcclxuXHRcdFx0fSxcclxuXHRcdFx0Y29udHJvbGxlcjonb3ZlcmxheUNvbnRyb2xsZXInLFxyXG5cdFx0XHRjb250cm9sbGVyQXM6J292ZXInLFxyXG5cdFx0XHR0ZW1wbGF0ZTogJzxkaXYgbmctaW5jbHVkZT1cInRlbXBsYXRlVXJsXCI+PC9kaXY+JyxcclxuXHRcdFx0bGluazogZnVuY3Rpb24oc2NvcGUsZWxlbWVudCxhdHRycykge1xyXG5cdFx0XHRcdC8vIElmIG5vIGJhc2UgaXMgc3BlY2lmaWVkLCB1c2UgbG9jYXRpb24gaWYgaW5zdGFsbGVkIHZpYSBib3dlci5cclxuXHRcdFx0XHRpZih0eXBlb2Ygc2NvcGUuYmFzZSA9PT0gJ3VuZGVmaW5lZCcpIHtcclxuXHRcdFx0XHRcdHNjb3BlLmJhc2UgPSAnL2Jvd2VyX2NvbXBvbmVudHMvUGhvdG9ncmFwaHktU2V0dXAtU3VpdGUvdGVtcGxhdGVzL292ZXJsYXkvJztcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0c2NvcGUudGVtcGxhdGVVcmwgPSBzY29wZS5iYXNlICsgJ292ZXJsYXkuaHRtbCc7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9KVxyXG5cdDtcclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcblx0XHJcblx0YW5ndWxhci5tb2R1bGUoJ2ZpbHRlck1vZCcpXHJcblx0LmRpcmVjdGl2ZSgnZmlsdGVyQ2hlY2tib3gnLCBmdW5jdGlvbigpIHtcclxuXHRcdFx0cmV0dXJuIHtcclxuXHRcdFx0XHRzY29wZToge1xyXG5cdFx0XHRcdFx0aXRlbXM6Jz0nLFxyXG5cdFx0XHRcdFx0c2VhcmNoOic9JyxcclxuXHRcdFx0XHRcdGJhc2U6Jz0nXHJcblx0XHRcdFx0fSxcclxuXHRcdFx0XHRjb250cm9sbGVyOidmaWx0ZXJDb21wQ29udHJvbGxlcicsXHJcblx0XHRcdFx0Y29udHJvbGxlckFzOidmY29tcCcsXHJcblx0XHRcdFx0dGVtcGxhdGU6ICc8ZGl2IG5nLWluY2x1ZGU9XCJ0ZW1wbGF0ZVVybFwiPjwvZGl2PicsXHJcblx0XHRcdFx0bGluazogZnVuY3Rpb24oc2NvcGUsZWxlbWVudCxhdHRycykge1xyXG5cdFx0XHRcdFx0Ly8gSWYgbm8gYmFzZSBpcyBzcGVjaWZpZWQsIHVzZSBsb2NhdGlvbiBpZiBpbnN0YWxsZWQgdmlhIGJvd2VyLlxyXG5cdFx0XHRcdFx0aWYodHlwZW9mIHNjb3BlLmJhc2UgPT09ICd1bmRlZmluZWQnKSB7XHJcblx0XHRcdFx0XHRcdHNjb3BlLmJhc2UgPSAnL2Jvd2VyX2NvbXBvbmVudHMvUGhvdG9ncmFwaHktU2V0dXAtU3VpdGUvdGVtcGxhdGVzL2ZpbHRlcnMvJztcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdHNjb3BlLnRlbXBsYXRlVXJsID0gc2NvcGUuYmFzZSArICdmaWx0ZXJDaGVja2JveGVzLmh0bWwnO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fSlcclxuXHQ7XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG5cdFxyXG5cdGFuZ3VsYXIubW9kdWxlKCdmaWx0ZXJNb2QnKVxyXG5cdC5kaXJlY3RpdmUoJ2ZpbHRlclF1ZXJ5JywgZnVuY3Rpb24oKSB7XHJcblx0XHRcdHJldHVybiB7XHJcblx0XHRcdFx0c2NvcGU6IHtcclxuXHRcdFx0XHRcdHNlYXJjaDonPScsXHJcblx0XHRcdFx0XHRiYXNlOic/PSdcclxuXHRcdFx0XHR9LFxyXG5cdFx0XHRcdHRlbXBsYXRlOiAnPGRpdiBuZy1pbmNsdWRlPVwidGVtcGxhdGVVcmxcIj48L2Rpdj4nLFxyXG5cdFx0XHRcdGxpbms6IGZ1bmN0aW9uKHNjb3BlLGVsZW1lbnQsYXR0cnMpIHtcclxuXHRcdFx0XHRcdC8vIElmIG5vIGJhc2UgaXMgc3BlY2lmaWVkLCB1c2UgbG9jYXRpb24gaWYgaW5zdGFsbGVkIHZpYSBib3dlci5cclxuXHRcdFx0XHRcdGlmKHR5cGVvZiBzY29wZS5iYXNlID09PSAndW5kZWZpbmVkJykge1xyXG5cdFx0XHRcdFx0XHRzY29wZS5iYXNlID0gJy9ib3dlcl9jb21wb25lbnRzL1Bob3RvZ3JhcGh5LVNldHVwLVN1aXRlL3RlbXBsYXRlcy9maWx0ZXJzLyc7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRzY29wZS50ZW1wbGF0ZVVybCA9IHNjb3BlLmJhc2UgKyAnZmlsdGVyUXVlcnkuaHRtbCc7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9KVxyXG5cdDtcclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcblx0XHJcblx0YW5ndWxhci5tb2R1bGUoJ2ZpbHRlck1vZCcpXHJcblx0LmNvbnRyb2xsZXIoJ2ZpbHRlckJhckNvbnRyb2xsZXInLCBbJyRzY29wZScsIGZ1bmN0aW9uKCRzY29wZSkge1xyXG5cdFx0XHRcclxuXHRcdFx0dGhpcy5nYWxsZXJpZXMgPSBbXTtcclxuXHRcdFx0XHJcblx0XHRcdC8vIFRvZ2dsZXMgdGhlIHBvc2l0aW9uIG9mIHRoZSBsZWZ0IHNpZGUgZmlsdGVyIGNvbHVtblxyXG5cdFx0XHR0aGlzLmZpbHRlclRvZ2dsZSA9IGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdHZhciBmUG9zID0gJHNjb3BlLmZwb3NpdGlvbjtcclxuXHRcdFx0XHQkc2NvcGUuZnBvc2l0aW9uID0gKGZQb3MgPT09IDAgPyAtMTkwIDogMCk7XHJcblx0XHRcdH07XHJcblx0XHRcdFxyXG5cdFx0XHR2YXIgZkN0cmwgPSB0aGlzO1xyXG5cdFx0XHRcclxuXHRcdH1dKVxyXG5cdDtcclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcblx0XHJcblx0YW5ndWxhci5tb2R1bGUoJ2ZpbHRlck1vZCcpXHJcblx0LnNlcnZpY2UoJ2ZpbHRlckZ1bmN0aW9ucycsIGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcclxuXHRcdHZhciBmRnVuY3Rpb25zID0gdGhpcztcclxuXHRcdFxyXG5cdFx0Ly8gQ2hlY2tzIGZvciBhIG1hdGNoIHdpdGggdGhlIGZpbHRlcnMuXHJcblx0XHQvLyBJZiB0aGUgdmFsdWUgaXMgYW4gYXJyYXksIGNoZWNrcyBhbGwgdmFsdWVzIGZvciBvbmUgbWF0Y2guXHJcblx0XHQvLyBJZiBub3QsIGp1c3QgY2hlY2tzIHNpbmdsZSB2YWx1ZS5cclxuXHRcdHRoaXMuZmlsdGVyQ2hlY2sgPSBmdW5jdGlvbih2YWx1ZSxzZWFyY2gpIHtcclxuXHRcdFx0dmFyIGFsbE1hdGNoID0gdHJ1ZTtcclxuXHRcdFx0XHJcblx0XHRcdGZvcih2YXIga2V5IGluIHNlYXJjaCkge1xyXG5cdFx0XHRcdGlmKHNlYXJjaC5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XHJcblx0XHRcdFx0XHR2YXIgdGhpc1ZhbHVlID0gdmFsdWVba2V5XTtcclxuXHRcdFx0XHRcdGlmKHNlYXJjaFtrZXldLmlzQXJyYXkpIHtcclxuXHRcdFx0XHRcdFx0dmFyIG51bVZhbHVlcyA9IHRoaXNWYWx1ZS5sZW5ndGgsXHJcblx0XHRcdFx0XHRcdFx0bWF0Y2hGb3VuZCA9IGZhbHNlO1xyXG5cdFx0XHRcdFx0XHRmb3IodmFyIGkgPSAwOyBpIDwgbnVtVmFsdWVzOyBpKyspIHtcclxuXHRcdFx0XHRcdFx0XHRpZihjaGVja1ZhbHVlKHRoaXNWYWx1ZVtpXSwgc2VhcmNoLCBrZXkpKSB7XHJcblx0XHRcdFx0XHRcdFx0XHRtYXRjaEZvdW5kID0gdHJ1ZTtcclxuXHRcdFx0XHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRpZighbWF0Y2hGb3VuZCkge1xyXG5cdFx0XHRcdFx0XHRcdGFsbE1hdGNoID0gZmFsc2U7XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRcdGFsbE1hdGNoID0gY2hlY2tWYWx1ZSh0aGlzVmFsdWUsIHNlYXJjaCwga2V5KTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdGlmKGFsbE1hdGNoID09PSBmYWxzZSkge1xyXG5cdFx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdFx0XHJcblx0XHRcdHJldHVybiBhbGxNYXRjaDtcclxuXHRcdFx0XHJcblx0XHR9O1xyXG5cdFx0XHJcblx0XHQvLyBGdW5jdGlvbiB0aGF0IGNoZWNrcyB2YWx1ZSBhZ2FpbnN0IHRoZSBxdWVyeSBmaWx0ZXIgJiBjaGVja2JveGVzXHJcblx0XHR2YXIgY2hlY2tWYWx1ZSA9IGZ1bmN0aW9uKHZhbHVlLCBzZWFyY2gsIGtleSkge1xyXG5cdFx0XHRcclxuXHRcdFx0dmFyIGNoZWNrTWF0Y2ggPSB0cnVlLFxyXG5cdFx0XHRcdHZhbHVlTWF0Y2ggPSBmYWxzZSxcclxuXHRcdFx0XHRjaGVja2JveGVzID0gc2VhcmNoW2tleV0uY2hlY2tib3hlcyxcclxuXHRcdFx0XHRzZWFyY2hPbiA9IHNlYXJjaFtrZXldLnNlYXJjaE9uO1xyXG5cdFx0XHRcdFxyXG5cdFx0XHRpZihzZWFyY2hPbiAmJiB2YWx1ZSkge1xyXG5cdFx0XHRcdHZhciB0aGlzVmFsdWUgPSB2YWx1ZVtzZWFyY2hPbl07XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0dmFyIHRoaXNWYWx1ZSA9IHZhbHVlO1xyXG5cdFx0XHR9XHJcblx0XHRcdGlmKGNoZWNrYm94ZXMpIHtcclxuXHRcdFx0XHRjaGVja01hdGNoID0gY2hlY2tUaGVCb3hlcyh0aGlzVmFsdWUsa2V5LGNoZWNrYm94ZXMpO1xyXG5cdFx0XHR9XHJcblx0XHRcdHZhbHVlTWF0Y2ggPSBmRnVuY3Rpb25zLnF1ZXJ5RmlsdGVyQ2hlY2sodGhpc1ZhbHVlLHNlYXJjaFtrZXldLnF1ZXJ5KTtcclxuXHRcdFx0XHJcblx0XHRcdHJldHVybiBjaGVja01hdGNoICYmIHZhbHVlTWF0Y2g7XHJcblx0XHR9O1xyXG5cdFx0XHJcblx0XHQvLyBDaGVja3MgcXVlcnkgdmFsdWUgYWdhaW5zdCBhY3R1YWwuICBBbHNvIHVzZWQgdG8gaGlkZS9zaG93IGNoZWNrYm94ZXMgYmFzZWQgb24gdGhlIHR5cGVkIGZpbHRlci5cclxuXHRcdHRoaXMucXVlcnlGaWx0ZXJDaGVjayA9IGZ1bmN0aW9uKHZhbHVlLHF1ZXJ5KSB7XHJcblx0XHRcdGlmKCF2YWx1ZSkge1xyXG5cdFx0XHRcdHZhbHVlID0gJyc7XHJcblx0XHRcdH1cclxuXHRcdFx0cmV0dXJuIHZhbHVlLnRvTG93ZXJDYXNlKCkuaW5kZXhPZihxdWVyeS50b0xvd2VyQ2FzZSgpKSA+IC0xO1xyXG5cdFx0fTtcclxuXHRcdFxyXG5cdFx0Ly8gRnVuY3Rpb24gdG8gbG9vcCB0aHJvdWdoIHRoZSBjaGVja2JveGVzIHZhcmlhYmxlIGFuZCByZXR1cm4gdHJ1ZSBpZiB0aGUgdmFsdWUgaXMgYSBtYXRjaFxyXG5cdFx0dmFyIGNoZWNrVGhlQm94ZXMgPSBmdW5jdGlvbiAodmFsdWUsZmlsdGVyc2V0LGNoZWNrYm94ZXMpIHtcclxuXHRcdFx0aWYodmFsdWUpIHtcclxuXHRcdFx0XHR2YXIgaSA9IDA7XHJcblx0XHRcdFx0ZG8ge1xyXG5cdFx0XHRcdFx0aWYodmFsdWUgPT09IGNoZWNrYm94ZXNbaV0pIHtcclxuXHRcdFx0XHRcdFx0cmV0dXJuIHRydWU7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRpKys7XHJcblx0XHRcdFx0fSB3aGlsZSh0eXBlb2YgY2hlY2tib3hlc1tpXSAhPT0gJ3VuZGVmaW5lZCcpXHJcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdGlmKGNoZWNrYm94ZXNbJ25vbmUnXSkge1xyXG5cdFx0XHRcdFx0cmV0dXJuIHRydWU7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdFx0fVxyXG5cdFx0fTtcclxuXHRcdFxyXG5cdH0pXHJcblx0O1xyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuXHRcclxuXHRhbmd1bGFyLm1vZHVsZSgnZmlsdGVyTW9kJylcclxuXHQuY29udHJvbGxlcignZmlsdGVyQ29tcENvbnRyb2xsZXInLCBbJyRzY29wZScsJ2ZpbHRlckZ1bmN0aW9ucycsIGZ1bmN0aW9uKCRzY29wZSxmaWx0ZXJGdW5jdGlvbnMpIHtcclxuXHRcdHRoaXMub25seUJveCA9IGZ1bmN0aW9uKGJveE51bSxib3hOYW1lKSB7XHJcblx0XHRcdHZhciBpID0gMDtcclxuXHRcdFx0ZG8ge1xyXG5cdFx0XHRcdCRzY29wZS5zZWFyY2guY2hlY2tib3hlc1tpXSA9IGZhbHNlO1x0XHRcdFx0XHRcclxuXHRcdFx0XHRpKys7XHJcblx0XHRcdH0gd2hpbGUodHlwZW9mICRzY29wZS5zZWFyY2guY2hlY2tib3hlc1tpXSAhPT0gJ3VuZGVmaW5lZCcpXHJcblx0XHRcdGlmKGJveE51bSA9PT0gJ25vbmUnKSB7XHJcblx0XHRcdFx0JHNjb3BlLnNlYXJjaC5jaGVja2JveGVzWydub25lJ10gPSB0cnVlO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdCRzY29wZS5zZWFyY2guY2hlY2tib3hlc1tib3hOdW1dID0gYm94TmFtZTtcclxuXHRcdFx0XHQkc2NvcGUuc2VhcmNoLmNoZWNrYm94ZXNbJ25vbmUnXSA9IGZhbHNlO1xyXG5cdFx0XHR9XHJcblx0XHR9O1xyXG5cdFx0XHJcblx0XHR0aGlzLmFsbEJveGVzID0gZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRmb3IodmFyIGkgPSAwOyBpIDwgJHNjb3BlLml0ZW1zLmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdFx0JHNjb3BlLnNlYXJjaC5jaGVja2JveGVzW2ldID0gJHNjb3BlLml0ZW1zW2ldO1xyXG5cdFx0XHR9XHJcblx0XHRcdCRzY29wZS5zZWFyY2guY2hlY2tib3hlc1snbm9uZSddID0gdHJ1ZTtcclxuXHRcdH07XHJcblx0XHRcclxuXHRcdHRoaXMuc2hvd0NoZWNrYm94ID0gZnVuY3Rpb24gKHZhbHVlLHF1ZXJ5KSB7XHJcblx0XHRcdHJldHVybiBmaWx0ZXJGdW5jdGlvbnMucXVlcnlGaWx0ZXJDaGVjayh2YWx1ZSxxdWVyeSk7XHJcblx0XHR9O1xyXG5cdH1dKVxyXG5cdDtcclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcblx0XHJcblx0YW5ndWxhci5tb2R1bGUoJ292ZXJsYXlNb2QnKVxyXG5cdFx0LmNvbnRyb2xsZXIoJ292ZXJsYXlDb250cm9sbGVyJywgWyckc2NvcGUnLGZ1bmN0aW9uKCRzY29wZSkge1xyXG5cdFx0XHRcclxuXHRcdFx0dGhpcy5jYW5jZWxBY3Rpb24gPSBmdW5jdGlvbigpIHtcclxuXHRcdFx0XHQkc2NvcGUubWVzc2FnZU51bSA9IDA7XHJcblx0XHRcdH07XHJcblx0XHRcdFxyXG5cdFx0fV0pXHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG5cdGFuZ3VsYXIubW9kdWxlKCdsaXN0TW9kJylcclxuXHQuY29udHJvbGxlcignbGlzdENvbnRyb2xsZXInLFsnJHNjb3BlJywnJHJvb3RTY29wZScsJ2xpc3RGdW5jdGlvbnMnLGZ1bmN0aW9uKCRzY29wZSwkcm9vdFNjb3BlLGxpc3RGdW5jdGlvbnMpIHtcclxuXHRcdFxyXG5cdFx0dmFyIGxDdHJsID0gdGhpcyxcclxuXHRcdFx0a2V5ID0gJHNjb3BlLmtleU5hbWUsXHJcblx0XHRcdGxpc3ROYW1lID0gJHNjb3BlLmxpc3ROYW1lO1xyXG5cdFx0XHJcblx0XHQvLyBTZXRzIHNlbGVjdGVkTGlzdCBhcyBlbXB0eSBhcnJheSBmb3IgdGhpcyBsaXN0IG51bWJlci5cclxuXHRcdGxpc3RGdW5jdGlvbnMuY2xlYXJTZWxlY3RlZChsaXN0TmFtZSk7XHJcblx0XHR0aGlzLmhpZGVPdmVybGF5ID0gdHJ1ZTtcclxuXHRcdFxyXG5cdFx0dGhpcy5MaXN0ID0gbGlzdEZ1bmN0aW9ucztcclxuXHRcdHRoaXMubmV3U2VjdGlvbiA9ICcnO1xyXG5cdFx0dGhpcy5jdXJyZW50U2VjdGlvbiA9IHtzZWN0aW9uOicnLGlkOjB9O1xyXG5cdFx0dGhpcy5vcmRlclNhdmVQZW5kaW5nID0gZmFsc2U7XHJcblx0XHRcclxuXHRcdC8vIFRvZ2dsZSBzZWxlY3Rpb24gb2YgaXRlbSAtIGNoYW5nZXMgc2VsZWN0IHByb3BlcnR5IG9mIGl0ZW0gYmV0d2VlbiB0cnVlL2ZhbHNlIGFuZCBhZGRzL3JlbW92ZXMgZnJvbSBzZWxlY3Rpb24gYXJyYXkgKHNlZSBsaXN0U2Vydi5qcyBmb3IgZnVuY3Rpb24pXHJcblx0XHR0aGlzLnRvZ2dsZVNlbGVjdCA9IGZ1bmN0aW9uKGl0ZW0saW5kZXgpIHtcclxuXHRcdFx0bGlzdEZ1bmN0aW9ucy50b2dnbGVTZWxlY3QoaXRlbSxpbmRleCxrZXksbGlzdE5hbWUpO1x0XHRcclxuXHRcdH07XHJcblx0XHRcclxuXHRcdC8vIEN1c3RvbSBmaWx0ZXIgZnVuY3Rpb24gY2hlY2tpbmcgaXRlbSBmaXJzdCBhZ2FpbnN0IGEgbGlzdCBvZiBleGNsdXNpb25zIHRoZW4gYWdhaW5zdCBjdXN0b20gZmlsdGVyIHZhbHVlc1xyXG5cdFx0dGhpcy5maWx0ZXJDaGVjayA9IGZ1bmN0aW9uKHZhbHVlLGluZGV4LGFycmF5KSB7XHJcblx0XHRcdHJldHVybiBsaXN0RnVuY3Rpb25zLmZpbHRlckNoZWNrKHZhbHVlLGluZGV4LCRzY29wZS5zZWFyY2gsa2V5TmFtZSxsaXN0TmFtZSk7XHJcblx0XHR9O1xyXG5cdFx0XHJcblx0XHQvLyBSZXR1cm5zIHRoZSBsZW5ndGggYSBsaXN0IChtYWluIGxpc3QgaWYgbm90IHNwZWNpZmllZCkuXHJcblx0XHR0aGlzLmdldExlbmd0aCA9IGZ1bmN0aW9uKGxpc3ROYW1lLHN1Ykxpc3QpIHtcclxuXHRcdFx0aWYoIXN1Ykxpc3QpIHtcclxuXHRcdFx0XHRzdWJMaXN0ID0gJ21haW4nO1xyXG5cdFx0XHR9XHJcblx0XHRcdHJldHVybiBsaXN0RnVuY3Rpb25zLkxpc3RzW2xpc3ROYW1lXS5sZW5ndGg7XHJcblx0XHR9O1xyXG5cdFx0XHJcblx0XHQvLyBDaGFuZ2Ugb3JkZXIgb2YgbGlzdC5cclxuXHRcdHRoaXMubW92ZUl0ZW1zID0gZnVuY3Rpb24oZGlyZWN0aW9uLGtleSkge1xyXG5cdFx0XHRsaXN0RnVuY3Rpb25zLm1vdmVJdGVtcyhkaXJlY3Rpb24sa2V5LG9yZEtleSxsaXN0TmFtZSk7XHJcblx0XHRcdHRoaXMub3JkZXJTYXZlUGVuZGluZyA9IHRydWU7XHJcblx0XHR9O1xyXG5cdFx0XHJcblx0fV0pXHJcblx0XHJcblx0O1xyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuXHRhbmd1bGFyLm1vZHVsZSgnbGlzdE1vZCcpXHJcblx0LnNlcnZpY2UoJ2xpc3RGdW5jdGlvbnMnLCBbJyRxJyxmdW5jdGlvbiAoJHEpIHtcclxuXHRcdFxyXG5cdFx0dmFyIGxGdW5jID0gdGhpcyxcclxuXHRcdFx0ZWRpdExpc3QgPSBbXSxcclxuXHRcdFx0Y3VycmVudEZpbHRlcmVkTGlzdCA9IFtdO1xyXG5cdFx0XHJcblx0XHR0aGlzLkxpc3RzID0ge307XHJcblx0XHR0aGlzLnNlY3Rpb25MaXN0ID0gW3tzZWN0aW9uOicnLGlkOjB9XTtcclxuXHRcdFxyXG5cdFx0dGhpcy5zZXRMaXN0ID0gZnVuY3Rpb24obGlzdEFycmF5LGxpc3ROYW1lLGV4Y2x1ZGVBcnJheSkge1xyXG5cdFx0XHR0aGlzLkxpc3RzW2xpc3ROYW1lXSA9IHsgbWFpbjpsaXN0QXJyYXksc2VsZWN0ZWQ6W10sZWRpdDpbXSxmaWx0ZXJlZDpbXSxleGNsdWRlOmV4Y2x1ZGVBcnJheSB9O1xyXG5cdFx0fTtcclxuXHRcdFxyXG5cdFx0dGhpcy5jbGVhclNlbGVjdGVkID0gZnVuY3Rpb24obGlzdE5hbWUpIHtcclxuXHRcdFx0dGhpcy5MaXN0c1tsaXN0TmFtZV0uc2VsZWN0ZWQgPSBbXTtcclxuXHRcdH07XHJcblx0XHRcclxuXHRcdHRoaXMuY2hlY2tTZWxlY3RlZCA9IGZ1bmN0aW9uKGxpc3ROYW1lKSB7XHJcblx0XHRcdHJldHVybiB0aGlzLkxpc3RzW2xpc3ROYW1lXS5zZWxlY3RlZC5sZW5ndGggPT09IDA7XHJcblx0XHR9O1xyXG5cdFx0XHJcblx0XHR0aGlzLmxpc3RMZW5ndGggPSBmdW5jdGlvbihsaXN0TmFtZSxzdWJMaXN0KSB7XHJcblx0XHRcdHN1Ykxpc3QgPSB0eXBlb2Ygc3ViTGlzdCAhPT0gJ3VuZGVmaW5lZCcgPyBzdWJMaXN0IDogJ21haW4nO1xyXG5cdFx0XHRpZih0aGlzLkxpc3RzW2xpc3ROYW1lXSkge1xyXG5cdFx0XHRcdHJldHVybiB0aGlzLkxpc3RzW2xpc3ROYW1lXVtzdWJMaXN0XS5sZW5ndGg7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0cmV0dXJuIDA7XHJcblx0XHRcdH1cclxuXHRcdH07XHJcblx0XHRcclxuXHRcdC8vIEZpcnN0IGNoZWNrcyBleGNsdWRlIGFycmF5IGZvciBpdGVtLCB0aGVuIGNoZWNrcyBzZWFyY2ggdmFsdWUgKHNlZSBmaWx0ZXJTZXJ2aWNlLmpzKVxyXG5cdFx0dGhpcy5maWx0ZXJDaGVjayA9IGZ1bmN0aW9uKHZhbHVlLGluZGV4LHNlYXJjaCxrZXlOYW1lLGxpc3ROYW1lKSB7XHJcblx0XHRcdHZhciBsaXN0Q2hlY2sgPSBmYWxzZSxcclxuXHRcdFx0XHRzaG93SXRlbSA9IGZhbHNlO1xyXG5cdFx0XHRsaXN0Q2hlY2sgPSBsRnVuYy5maW5kQnlJZCh2YWx1ZVtrZXlOYW1lXSxsaXN0TmFtZSxrZXlOYW1lLCdleGNsdWRlJyk7XHJcblx0XHRcdGlmKGxpc3RDaGVjayA9PT0gZmFsc2UpIHtcclxuXHRcdFx0XHRzaG93SXRlbSA9IGZpbHRlckZ1bmN0aW9ucy5maWx0ZXJDaGVjayh2YWx1ZSxzZWFyY2gpO1xyXG5cdFx0XHRcdC8vIERlc2VsZWN0IGl0ZW0gaWYgdGhlIGZpbHRlciBleGNsdWRlcyB0aGUgaXRlbVxyXG5cdFx0XHRcdGlmKHZhbHVlLnNlbGVjdGVkICYmICFzaG93SXRlbSAmJiBpbmRleCA+PSAwKSB7XHJcblx0XHRcdFx0XHRsRnVuYy5kZXNlbGVjdEl0ZW0odmFsdWVba2V5TmFtZV0saW5kZXgsa2V5TmFtZSxsaXN0TmFtZSk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHRcdGxGdW5jLnNldEZpbHRlcmVkKGxpc3ROYW1lLGluZGV4LHNob3dJdGVtKTtcclxuXHRcdFx0cmV0dXJuIHNob3dJdGVtO1xyXG5cdFx0fTtcclxuXHRcdFxyXG5cdFx0Ly8gQWRkcyBwcm9wZXJ0eSB3aXRoIGZpbHRlciBzdGF0dXMgb2YgZWxlbWVudFxyXG5cdFx0dGhpcy5zZXRGaWx0ZXJlZCA9IGZ1bmN0aW9uKGxpc3ROYW1lLGluZGV4LHNob3cpIHtcclxuXHRcdFx0dGhpcy5MaXN0c1tsaXN0TmFtZV0ubWFpbltpbmRleF0uc2hvd0l0ZW0gPSBzaG93O1xyXG5cdFx0fTtcclxuXHRcdFxyXG5cdFx0Ly8gQ3JlYXRlcyBhIGxpc3Qgb2Ygb25seSB0aGUgY3VycmVudGx5IGZpbHRlcmVkIGVsZW1lbnRzIG9mIHRoZSBtYWluIGFycmF5LiBSZXR1cm5zIHRoaXMgZmlsdGVyZWQgYXJyYXkuXHJcblx0XHR0aGlzLnNldEZpbHRlckFycmF5ID0gZnVuY3Rpb24obGlzdE5hbWUpIHtcclxuXHRcdFx0dmFyIG1haW5BcnJheSA9IHRoaXMuTGlzdHNbbGlzdE5hbWVdLm1haW47XHJcblx0XHRcdGZvcih2YXIgaSA9IDA7IGkgPCBtYWluQXJyYXk7IGkrKykge1xyXG5cdFx0XHRcdGlmKG1haW5BcnJheVtpXS5zaG93SXRlbSA9PT0gdHJ1ZSkge1xyXG5cdFx0XHRcdFx0dGhpcy5MaXN0c1tsaXN0TmFtZV0uZmlsdGVyZWQucHVzaChtYWluQXJyYXlbaV0pO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0XHRyZXR1cm4gdGhpcy5MaXN0c1tsaXN0TmFtZV0uZmlsdGVyZWRcclxuXHRcdH07XHJcblx0XHRcclxuXHRcdHRoaXMudG9nZ2xlU2VsZWN0ID0gZnVuY3Rpb24oaXRlbSxpbmRleCxrZXksbGlzdE5hbWUpIHtcclxuXHRcdFx0a2V5ID0ga2V5ID8ga2V5IDogJ2lkJztcclxuXHRcdFx0dmFyIGlkID0gaXRlbVtrZXldO1xyXG5cdFx0XHRpZighaW5kZXggJiYgaW5kZXggIT09IDApIHtcclxuXHRcdFx0XHRpbmRleCA9IHRoaXMuZmluZEJ5SWQoaWQsbGlzdE5hbWUsa2V5LCdtYWluJyk7XHJcblx0XHRcdH1cclxuXHRcdFx0aWYoIWl0ZW0uc2VsZWN0ZWQpIHtcclxuXHRcdFx0XHR0aGlzLnNlbGVjdEl0ZW0oaXRlbSxpbmRleCxrZXksbGlzdE5hbWUpO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdHRoaXMuZGVzZWxlY3RJdGVtKGlkLGluZGV4LGtleSxsaXN0TmFtZSk7XHJcblx0XHRcdH1cclxuXHRcdH07XHJcblxyXG5cdFx0Ly8gRnVuY3Rpb24gdG8gY3JlYXRlIGEgY29tbWEgc2VwYXJhdGVkIGxpc3Qgb2YgYSBwYXJ0aWN1bGFyIHByb3BlcnR5IHdpdGhpbiBhbiBhcnJheSBcclxuXHRcdHRoaXMubWFrZUxpc3QgPSBmdW5jdGlvbihsaXN0TmFtZSxrZXlOYW1lLHN1Ykxpc3QpIHtcclxuXHRcdFx0aWYoIXN1Ykxpc3QpIHtcclxuXHRcdFx0XHRzdWJMaXN0ID0gJ21haW4nO1xyXG5cdFx0XHR9XHJcblx0XHRcdHZhciBsaXN0QXJyYXkgPSB0aGlzLkxpc3RzW2xpc3ROYW1lXVtzdWJMaXN0XTtcclxuXHRcdFx0Zm9yKHZhciBpID0gMDsgaSA8IGxpc3RBcnJheS5sZW5ndGg7IGkrKykge1xyXG5cdFx0XHRcdG1lc3NhZ2UgKz0gbGlzdEFycmF5W2ldW2tleU5hbWVdO1xyXG5cdFx0XHRcdGlmKGkgPCBsaXN0QXJyYXkubGVuZ3RoIC0gMSkge1xyXG5cdFx0XHRcdFx0bWVzc2FnZSArPSAnLCAnO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0XHRyZXR1cm4gbWVzc2FnZTtcclxuXHRcdH07XHJcblxyXG5cdFx0Ly8gUmV0dXJucyB0aGUgaW5kZXggb2YgdGhlIGl0ZW0gd2l0aGluIHRoZSBhbiBhcnJheSAoc3BlY2lmaWVkIGJ5IGxpc3ROYW1lIGFuZCBzdWJMaXN0KSBvciBmYWxzZSBpZiBub3QgZm91bmQuICBTZWFyY2ggYnkga2V5IChzaG91bGQgYmUgdW5pcXVlIGlkLlxyXG5cdFx0dGhpcy5maW5kQnlJZCA9IGZ1bmN0aW9uKGlkLGxpc3ROYW1lLGtleSxzdWJMaXN0KSB7XHJcblx0XHRcdGtleSA9IHR5cGVvZiBrZXkgIT09ICd1bmRlZmluZWQnID8ga2V5IDogJ2lkJztcclxuXHRcdFx0c3ViTGlzdCA9IHR5cGVvZiBzdWJMaXN0ICE9PSAndW5kZWZpbmVkJyA/IHN1Ykxpc3QgOiAnbWFpbic7XHJcblx0XHRcdHZhciBsaXN0QXJyYXkgPSB0aGlzLkxpc3RzW2xpc3ROYW1lXVtzdWJMaXN0XTtcclxuXHRcdFx0Zm9yKHZhciBpID0gMDsgaSA8IGxpc3RBcnJheS5sZW5ndGg7IGkrKykge1xyXG5cdFx0XHRcdGlmKFN0cmluZyhsaXN0QXJyYXlbaV1ba2V5XSkgPT09IFN0cmluZyhpZCkpIHtcclxuXHRcdFx0XHRcdHJldHVybiBpO1xyXG5cdFx0XHRcdH1cdFx0XHRcclxuXHRcdFx0fVxyXG5cdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHR9O1xyXG5cdFx0XHJcblx0XHQvLyBEZWxldGVzIGl0ZW1zIGZvdW5kIGluIGRlbEFycmF5IGZyb20gbWFpbkxpc3Qgc2VhcmNoaW5nIGJ5IGlkLiBSZXR1cm5zIG5ldyBhcnJheS5cclxuXHRcdHRoaXMuZGVsZXRlQnlJZCA9IGZ1bmN0aW9uKGRlbEFycmF5LGlkTmFtZSxsaXN0TmFtZSxzdWJMaXN0KSB7XHJcblx0XHRcdHZhciBudW1JdGVtcyA9IGRlbEFycmF5Lmxlbmd0aDtcclxuXHRcdFx0c3ViTGlzdCA9IHR5cGVvZiBzdWJMaXN0ICE9PSAndW5kZWZpbmVkJyA/IHN1Ykxpc3QgOiAnbWFpbic7XHJcblx0XHRcdGZvcih2YXIgaSA9IDA7IGkgPCBudW1JdGVtczsgaSsrKSB7XHJcblx0XHRcdFx0dmFyIGltZ0luZGV4ID0gbEZ1bmMuZmluZEJ5SWQoZGVsQXJyYXlbaV1baWROYW1lXSxsaXN0TmFtZSxpZE5hbWUsc3ViTGlzdCk7XHJcblx0XHRcdFx0bEZ1bmMuTGlzdHNbbGlzdE5hbWVdLm1haW4uc3BsaWNlKGltZ0luZGV4LDEpO1xyXG5cdFx0XHR9XHJcblx0XHR9O1xyXG5cdFx0XHJcblx0XHQvLyBTZWxlY3RzIGFsbCBpdGVtcyB3aXRoaW4gdGhlIGN1cnJlbnQgZmlsdGVyIHNldFxyXG5cdFx0dGhpcy5zZWxlY3RBbGwgPSBmdW5jdGlvbihrZXksbGlzdE5hbWUpIHtcclxuXHRcdFx0a2V5ID0gdHlwZW9mIGtleSAhPT0gJ3VuZGVmaW5lZCcgPyBrZXkgOiAnaWQnO1xyXG5cdFx0XHR2YXIgZmlsdGVyZWRJdGVtcyA9IHRoaXMuc2V0RmlsdGVyQXJyYXkobGlzdE5hbWUpO1xyXG5cdFx0XHR2YXIgbnVtSXRlbXMgPSBmaWx0ZXJlZEl0ZW1zLmxlbmd0aDtcclxuXHRcdFx0Zm9yKHZhciBpID0gMDsgaSA8IG51bUl0ZW1zOyBpKyspIHtcclxuXHRcdFx0XHRpZighZmlsdGVyZWRJdGVtc1tpXS5zZWxlY3RlZCkge1xyXG5cdFx0XHRcdFx0bEZ1bmMuc2VsZWN0SXRlbShmaWx0ZXJlZEl0ZW1zW2ldLHVuZGVmaW5lZCxrZXksbGlzdE5hbWUpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fTtcclxuXHRcdFxyXG5cdFx0Ly8gRGVzZWxlY3RzIGFsbCBpdGVtc1xyXG5cdFx0dGhpcy5kZXNlbGVjdEFsbCA9IGZ1bmN0aW9uKGtleSxsaXN0TmFtZSkge1xyXG5cdFx0XHRrZXkgPSB0eXBlb2Yga2V5ICE9PSAndW5kZWZpbmVkJyA/IGtleSA6ICdpZCc7XHJcblx0XHRcdHZhciBudW1QaG90b3MgPSB0aGlzLkxpc3RzW2xpc3ROYW1lXS5tYWluLmxlbmd0aDtcclxuXHRcdFx0aWYoIXRoaXMuY2hlY2tTZWxlY3RlZChsaXN0TmFtZSkpIHtcclxuXHRcdFx0XHRmb3IodmFyIGkgPSAwOyBpIDwgbnVtUGhvdG9zOyBpKyspIHtcclxuXHRcdFx0XHRcdHZhciBpdGVtID0gdGhpcy5MaXN0c1tsaXN0TmFtZV0ubWFpbltpXTtcclxuXHRcdFx0XHRcdGlmKGl0ZW0uc2VsZWN0ZWQpIHtcclxuXHRcdFx0XHRcdFx0dGhpcy5kZXNlbGVjdEl0ZW0oaXRlbS5pZCxpLGtleSxsaXN0TmFtZSk7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9O1xyXG5cdFx0XHJcblx0XHR0aGlzLmRlc2VsZWN0SXRlbSA9IGZ1bmN0aW9uKGlkLGluZGV4LGtleSxsaXN0TmFtZSkge1xyXG5cdFx0XHRrZXkgPSB0eXBlb2Yga2V5ICE9PSAndW5kZWZpbmVkJyA/IGtleSA6ICdpZCc7XHJcblx0XHRcdGxGdW5jLkxpc3RzW2xpc3ROYW1lXS5tYWluW2luZGV4XS5zZWxlY3RlZCA9IGZhbHNlO1xyXG5cdFx0XHR2YXIgc2VsSW5kZXggPSBsRnVuYy5maW5kQnlJZChpZCxsaXN0TmFtZSxrZXksJ3NlbGVjdGVkJyk7XHJcblx0XHRcdGxGdW5jLkxpc3RzW2xpc3ROYW1lXS5zZWxlY3RlZC5zcGxpY2Uoc2VsSW5kZXgsMSk7XHJcblx0XHR9O1xyXG5cclxuXHRcdHRoaXMuc2VsZWN0SXRlbSA9IGZ1bmN0aW9uKGl0ZW0saW5kZXgsa2V5LGxpc3ROYW1lKSB7XHJcblx0XHRcdGtleSA9IHR5cGVvZiBrZXkgIT09ICd1bmRlZmluZWQnID8ga2V5IDogJ2lkJztcclxuXHRcdFx0aWYoIWluZGV4KSB7XHJcblx0XHRcdFx0aW5kZXggPSB0aGlzLmZpbmRCeUlkKGl0ZW1ba2V5XSxsaXN0TmFtZSxrZXksJ21haW4nKTtcclxuXHRcdFx0fVxyXG5cdFx0XHR0aGlzLkxpc3RzW2xpc3ROYW1lXS5tYWluW2luZGV4XS5zZWxlY3RlZCA9IHRydWU7XHJcblx0XHRcdHRoaXMuTGlzdHNbbGlzdE5hbWVdLnNlbGVjdGVkLnB1c2goaXRlbSk7XHJcblx0XHR9O1xyXG5cdFx0XHJcblx0XHQvLyBBZnRlciBpdGVtcyBhcmUgbW92ZWQgaW4gbGlzdCwgc2V0cyB0aGUgb3JkZXIgdmFsdWUgKG5hbWVkIG9yZEtleSkgdG8gdGhlIGNvcnJlY3QgbnVtYmVyIGZvciB0aGUgREIuICBBbHNvIGFkZHMgb3JkZXIgYW5kIHNlY3Rpb24gdG8gdGhlIHNlbGVjdGVkIGxpc3QuXHJcblx0XHR2YXIgcmVzZXRPcmRlciA9IGZ1bmN0aW9uKGtleSxvcmRLZXksbGlzdE5hbWUsc2VjdGlvbikge1xyXG5cdFx0XHR2YXIgc2VsSW5kZXggPSAwO1xyXG5cdFx0XHRmb3IoaSA9IDA7IGkgPCBsRnVuYy5MaXN0c1tsaXN0TmFtZV0ubWFpbi5sZW5ndGg7IGkrKykge1xyXG5cdFx0XHRcdGxGdW5jLkxpc3RzW2xpc3ROYW1lXS5tYWluW2ldW29yZEtleV0gPSBpO1xyXG5cdFx0XHRcdGlmKGxGdW5jLkxpc3RzW2xpc3ROYW1lXS5tYWluLnNlbGVjdGVkKSB7XHJcblx0XHRcdFx0XHRzZWxJbmRleCA9IGxGdW5jLmZpbmRCeUlkKGxGdW5jLkxpc3RzW2xpc3ROYW1lXS5tYWluW2ldW2tleV0sbGlzdE5hbWUsa2V5LCdzZWxlY3RlZCcpO1xyXG5cdFx0XHRcdFx0bEZ1bmMuTGlzdHNbbGlzdE5hbWVdLnNlbGVjdGVkW3NlbEluZGV4XVtvcmRLZXldID0gaTtcclxuXHRcdFx0XHRcdGlmKHR5cGVvZiBzZWN0aW9uICE9PSAndW5kZWZpbmVkJykge1xyXG5cdFx0XHRcdFx0XHRsRnVuYy5MaXN0c1tsaXN0TmFtZV0uc2VsZWN0ZWRbc2VsSW5kZXhdLnNlY3Rpb24gPSBzZWN0aW9uO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fTtcclxuXHRcdFxyXG5cdFx0Ly8gQWRkcyB0aGUgc2VsZWN0ZWQgaXRlbXMgdG8gYSBzZWN0aW9uIGFuZCByZW9yZGVycyBpdGVtcyB0byBncm91cCB0aG9zZSB0b2dldGhlci5cclxuXHRcdHRoaXMuZ3JvdXBTZWxlY3RlZCA9IGZ1bmN0aW9uKGtleSxvcmRLZXksc2VjdGlvbixsaXN0TmFtZSkge1xyXG5cdFx0XHR2YXIgbGlzdFRlbXAgPSBsRnVuYy5MaXN0c1tsaXN0TmFtZV0ubWFpbixcclxuXHRcdFx0XHRmaXJzdEluZGV4ID0gLTEsXHJcblx0XHRcdFx0bW92ZUluZGV4ID0gMCxcclxuXHRcdFx0XHRzZWxJbmRleDtcclxuXHRcdFx0Zm9yKHZhciBpID0gMDsgaSA8IGxpc3RUZW1wLmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdFx0aWYobGlzdFRlbXBbaV0uc2VsZWN0ZWQgfHwgbGxpc3RUZW1wW2ldLnNlY3Rpb24gPT09IHNlY3Rpb24pIHtcclxuXHRcdFx0XHRcdGlmKGZpcnN0SW5kZXggPSAtMSkge1xyXG5cdFx0XHRcdFx0XHRmaXJzdEluZGV4ID0gaTtcclxuXHRcdFx0XHRcdFx0bGlzdFRlbXBbaV0uc2VjdGlvbiA9IHNlY3Rpb247XHJcblx0XHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0XHRtb3ZlSW5kZXggPSBpO1xyXG5cdFx0XHRcdFx0XHRsaXN0VGVtcFttb3ZlSW5kZXhdLnNlY3Rpb24gPSBzZWN0aW9uO1xyXG5cdFx0XHRcdFx0XHRsaXN0VGVtcC5zcGxpY2UoZmlyc3RJbmRleCsxLDAsbGlzdFRlbXAuc3BsaWNlKG1vdmVJbmRleCwxKVswXSk7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHRcdGxGdW5jLkxpc3RzW2xpc3ROYW1lXS5tYWluID0gbGlzdFRlbXA7XHJcblx0XHRcdHJlc2V0T3JkZXIoa2V5LG9yZEtleSxsaXN0TnVtLHNlY3Rpb24pO1xyXG5cdFx0fTtcclxuXHRcdFxyXG5cdFx0Ly8gTW92ZXMgYW4gaXRlbSBvciBpdGVtcy4gIENoZWNrcyB0aGUgc2VjdGlvbnMgb2YgdGhlIGl0ZW1zIHRvIGVuc3VyZSBpdGVtcyB3aXRoaW4gc2FtZSBzZWN0aW9uIHN0aWNrIHRvZ2V0aGVyLlxyXG5cdFx0dGhpcy5tb3ZlSXRlbXMgPSBmdW5jdGlvbihkaXJlY3Rpb24sa2V5LG9yZEtleSxsaXN0TmFtZSkge1xyXG5cdFx0XHR2YXIgc2VsU2VjdGlvbixcclxuXHRcdFx0XHRsaXN0TGVuID0gbEZ1bmMuTGlzdHNbbGlzdE5hbWVdLm1haW4ubGVuZ3RoLFxyXG5cdFx0XHRcdG11bHRpcGxpZXIsXHJcblx0XHRcdFx0bmV4dFNlY3Rpb247XHJcblx0XHRcdHZhciBpID0gZGlyZWN0aW9uID4gMCA/IGxpc3RMZW4gLSAxIDogMDtcclxuXHRcdFx0Ly8gTG9vcCB0aHJvdWdoIG1haW4gbGlzdCBvcHBvc2l0ZSB0aGUgZGlyZWN0aW9uIG9mIHRoZSBtb3ZlbWVudCBvZiBpdGVtcyB0byBtYWtlIHN1cmUgb3JkZXIgaXMgb3RoZXJ3aXNlIHByZXNlcnZlZC5cclxuXHRcdFx0Zm9yKGk7IGkgPCBsaXN0TGVuICYmIGkgPj0gMDsgaSA9IGkgLSBkaXJlY3Rpb24pIHtcclxuXHRcdFx0XHRtdWx0aXBsaWVyID0gMTtcclxuXHRcdFx0XHQvLyBJZiB0aGUgaXRlbSBpcyBpbiB0aGUgc2VsZWN0ZWQgbGlzdCBvciB0aGUgc2VjdGlvbiBpcyBtb3ZpbmcuXHJcblx0XHRcdFx0aWYobEZ1bmMuZmluZEJ5SWQobEZ1bmMuTGlzdHNbbGlzdE5hbWVdLm1haW5baV1ba2V5XSxsaXN0TmFtZSxrZXksJ3NlbGVjdGVkJykgIT09IGZhbHNlIHx8IGxGdW5jLkxpc3RzW2xpc3ROYW1lXS5tYWluW2ldLnNlY3Rpb24gPT09IHNlbFNlY3Rpb24pIHtcclxuXHRcdFx0XHRcdC8vIFNldCBzZWxTZWN0aW9uIHRvIHNlY3Rpb24gb2YgYSBzZWxlY3RlZCBpdGVtLlxyXG5cdFx0XHRcdFx0aWYobEZ1bmMuTGlzdHNbbGlzdE5hbWVdLm1haW5baV0uc2VjdGlvbiAhPT0gJycpIHtcclxuXHRcdFx0XHRcdFx0c2VsU2VjdGlvbiA9IGxGdW5jLkxpc3RzW2xpc3ROYW1lXS5tYWluW2ldLnNlY3Rpb247XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHQvLyBJZiB0aGUgbW92ZW1lbnQgd291bGQgcHV0IHRoZSBpdGVtIG91dHNpZGUgb2YgbGlzdCBib3VuZGFyaWVzIG9yIGFub3RoZXIgc2VsZWN0aW9uIGhhcyBoaXQgdGhvc2UgYm91bmRhcmllcyBkb24ndCBtb3ZlLlxyXG5cdFx0XHRcdFx0aWYoaStkaXJlY3Rpb24gPj0gMCAmJiBpK2RpcmVjdGlvbiA8IGxpc3RMZW4gJiYgIWxGdW5jLkxpc3RzW2xpc3ROYW1lXS5tYWluW2krZGlyZWN0aW9uXS5zZWxlY3RlZCkge1xyXG5cdFx0XHRcdFx0XHQvLyBJZiB0aGUgbmV4dCBpdGVtIGlzIGluIGEgZGVmaW5lZCBzZWN0aW9uLCBuZWVkIHRvIGNoZWNrICYgY291bnQgaXRlbXMgaW4gc2VjdGlvbiB0byBqdW1wIG92ZXIgb3Igc3RvcCBtb3ZlbWVudC5cclxuXHRcdFx0XHRcdFx0aWYobEZ1bmMubWFpbkxpc3RbbGlzdE51bV1baStkaXJlY3Rpb25dLnNlY3Rpb24gIT09ICcnICYmIGxGdW5jLm1haW5MaXN0W2xpc3ROdW1dW2ldLnNlY3Rpb24gIT09IGxGdW5jLm1haW5MaXN0W2xpc3ROdW1dW2krZGlyZWN0aW9uXS5zZWN0aW9uKSB7XHJcblx0XHRcdFx0XHRcdFx0bmV4dFNlY3Rpb24gPSBsRnVuYy5MaXN0c1tsaXN0TmFtZV0ubWFpbltpK2RpcmVjdGlvbl0uc2VjdGlvbjtcclxuXHRcdFx0XHRcdFx0XHRtdWx0aXBsaWVyID0gMDtcclxuXHRcdFx0XHRcdFx0XHQvLyBMb29wIGJhY2sgdGhyb3VnaCBhcnJheSBpbiB0aGUgZGlyZWN0aW9uIG9mIG1vdmVtZW50LlxyXG5cdFx0XHRcdFx0XHRcdGZvcih2YXIgaiA9IGkgKyBkaXJlY3Rpb247IGogPCBsaXN0TGVuICYmIGogPj0gMDsgaiA9IGogKyBkaXJlY3Rpb24pIHtcclxuXHRcdFx0XHRcdFx0XHRcdC8vIElmIHRoZSBpdGVtIGlzIGluIHRoZSBzZWN0aW9uLi4uXHJcblx0XHRcdFx0XHRcdFx0XHRpZihsRnVuYy5MaXN0c1tsaXN0TmFtZV0ubWFpbltqXS5zZWN0aW9uID09PSBuZXh0U2VjdGlvbikge1xyXG5cdFx0XHRcdFx0XHRcdFx0XHQvLyBJZiBzZWxlY3RlZCBzdG9wIG1vdmVtZW50IGFuZCBicmVhay5cclxuXHRcdFx0XHRcdFx0XHRcdFx0aWYobEZ1bmMubWFpbkxpc3RbbGlzdE51bV1bal0uc2VsZWN0ZWQpIHtcclxuXHRcdFx0XHRcdFx0XHRcdFx0XHRtdWx0aXBsaWVyID0gMDtcclxuXHRcdFx0XHRcdFx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRcdFx0XHQvLyBJZiBub3QsIGNvdW50IHNlY3Rpb24uXHJcblx0XHRcdFx0XHRcdFx0XHRcdG11bHRpcGxpZXIrKztcclxuXHRcdFx0XHRcdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRcdFx0XHRcdC8vIEJyZWFrIGxvb3AgYXQgZmlyc3QgaXRlbSBub3QgaW4gc2VjdGlvbi5cclxuXHRcdFx0XHRcdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdC8vIEZpbmFsIGNoZWNrOiBvbmx5IG1vdmUgYW4gaXRlbSBpZiBpdCBpcyBzZWxlY3RlZCBvciB0byBlbnN1cmUgaXRlbXMgb2YgdGhlIHNhbWUgc2VjdGlvbiBzdGljayB0b2dldGhlclxyXG5cdFx0XHRcdFx0XHRpZihsRnVuYy5MaXN0c1tsaXN0TmFtZV0ubWFpbltpXS5zZWxlY3RlZCB8fCBsRnVuYy5MaXN0c1tsaXN0TmFtZV0ubWFpbltpK2RpcmVjdGlvbl0uc2VjdGlvbiAhPT0gbEZ1bmMuTGlzdHNbbGlzdE5hbWVdLm1haW5baV0uc2VjdGlvbikge1xyXG5cdFx0XHRcdFx0XHRcdGxGdW5jLkxpc3RzW2xpc3ROYW1lXS5tYWluLnNwbGljZShpKyhkaXJlY3Rpb24qbXVsdGlwbGllciksMCxsRnVuYy5MaXN0c1tsaXN0TmFtZV0ubWFpbi5zcGxpY2UoaSwxKVswXSk7XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdFx0Ly8gUmVzZXQgb3JkZXIgdmFyaWFibGUgZm9yIGRhdGFiYXNlLlxyXG5cdFx0XHRyZXNldE9yZGVyKGtleSxvcmRLZXksbGlzdE5hbWUpO1xyXG5cdFx0fTtcclxuXHRcdFxyXG5cdH1dKTtcclxufSkoKTsiXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
