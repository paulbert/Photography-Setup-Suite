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
				tmplt:'=',
				checkitems:'=?'
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
		
		var boxSetup = function (items) {
			
			var checkboxes = {none:true};
			
			for(var i = 0; i < items.length; i++) {
				checkboxes[i] = items[i];
			}
			
			return checkboxes;
			
		};
		
		$scope.search.checkboxes = boxSetup($scope.items);
		
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImZpbHRlcnMvZmlsdGVyRGlyZWN0aXZlLmpzIiwibGlzdHMvbGlzdERpcmVjdGl2ZS5qcyIsIm92ZXJsYXkvb3ZlcmxheURpcmVjdGl2ZS5qcyIsImZpbHRlcnMvY29tcG9uZW50cy9maWx0ZXJDaGVja2JveENvbXBvbmVudERpcmVjdGl2ZS5qcyIsImZpbHRlcnMvY29tcG9uZW50cy9maWx0ZXJRdWVyeUNvbXBvbmVudERpcmVjdGl2ZS5qcyIsImZpbHRlckNvbnRyb2xsZXIuanMiLCJmaWx0ZXJTZXJ2aWNlLmpzIiwiY29tcG9uZW50cy9maWx0ZXJDb21wb25lbnRDb250cm9sbGVyLmpzIiwib3ZlcmxheUNvbnRyb2xsZXIuanMiLCJsaXN0Q29udHJvbGxlci5qcyIsImxpc3RTZXJ2LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FDSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDaENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3ZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMzRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzlDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN6REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6InBob3RvLXRvb2xzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCkge1xuXHRhbmd1bGFyLm1vZHVsZSgncGhvdG9FZGl0Q29tcG9uZW50cycsIFsnbGlzdE1vZCcsJ2ZpbHRlck1vZCcsJ292ZXJsYXlNb2QnXSk7XG5cdFxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcblx0XHJcblx0LypcclxuXHRTZWFyY2ggdmFyaWFibGUgc2hvdWxkIGJlIGFuIGFycmF5IG9mIG9iamVjdHMgbmFtZWQgdGhlIHNhbWUgYXMgdGhlIHByb3BlcnRpZXMgb2YgdGhlIG9iamVjdHMgd2l0aGluIHRoZSBsaXN0LlxyXG5cdFx0UmVxdWlyZXMgYSAncXVlcnknIHByb3BlcnR5IHdpdGhpbiBvYmplY3Qgd2hpY2ggaXMgbW9kZWxlZCB0byBhIHRleHQvaW5wdXQgZmlsdGVyLlxyXG5cdFx0SWYgdGhlIHNlYXJjaGVkIHByb3BlcnR5IGlzIGFuIGFycmF5IG9mIG9iamVjdHMgKGlmLCBmb3IgZXhhbXBsZSwgaW1hZ2VzIGNhbiBiZSBpbiBtYW55IGdhbGxlcnkgZ3JvdXBpbmdzKSwgYWRkICdpc0FycmF5JyBwcm9wZXJ0eSBhbmQgc2V0IHRvIHRydWUsIGFsc28gYWRkICdzZWFyY2hPbicgcHJvcGVydHkgYW5kIHNldCB0byB0aGUgbmFtZSBvZiB0aGUgcHJvcGVydHkgd2l0aGluIG9iamVjdHMuXHJcblx0XHRFeGFtcGxlOiBpbWFnZXMgPSBbIHtpbWduYW1lOiAnaW1nMS5qcGcnLCBnYWxsZXJpZXM6IFsgeyBpZDoxLCBuYW1lOidnYWxsZXJ5MScgfSwgeyBpZDoyLCBuYW1lOidnYWxsZXJ5Mid9IF19LCAuLi5dXHJcblx0XHRzZWFyY2ggPSB7IGdhbGxlcmllczogeyBxdWVyeTonJywgaXNBcnJheTogdHJ1ZSwgc2VhcmNoT246ICduYW1lJyB9IH1cclxuXHRcdEZvciBhIGNoZWNrYm94IGZpbHRlciwgaW5jbHVkZSBhbiBvYmplY3QgY2FsbGVkICdjaGVja2JveGVzJyB3aXRoIGEgJ25vbmUnIHByb3BlcnR5IGFuZCBhbGwgcG9zc2libGUgdmFsdWVzIGluIDAtbiBwcm9wZXJ0eS5cclxuXHRcdEJhc2VkIG9uIGFib3ZlIGV4YW1wbGU6IHNlYXJjaCA9IHsgZ2FsbGVyaWVzOiB7IC4uLiBjaGVja2JveGVzOiB7IG5vbmU6IHRydWUsIDA6J2dhbGxlcnkxJywxOidnYWxsZXJ5MicgfSB9XHJcblx0Ki9cclxuXHRcclxuXHRhbmd1bGFyLm1vZHVsZSgnZmlsdGVyTW9kJyxbXSlcclxuXHQuZGlyZWN0aXZlKCdmaWx0ZXJCYXInLCBmdW5jdGlvbigpIHtcclxuXHRcdHJldHVybiB7XHJcblx0XHRcdHNjb3BlOiB7XHJcblx0XHRcdFx0c2VhcmNoOic9JyxcclxuXHRcdFx0XHRmcG9zaXRpb246Jz0/JyxcclxuXHRcdFx0XHRpbmxpbmU6J0A/JyxcclxuXHRcdFx0XHR0bXBsdDonPScsXHJcblx0XHRcdFx0Y2hlY2tpdGVtczonPT8nXHJcblx0XHRcdH0sXHJcblx0XHRcdHRlbXBsYXRlOiAnPGRpdiBuZy1pbmNsdWRlPVwidGVtcGxhdGVVcmxcIj48L2Rpdj4nLFxyXG5cdFx0XHRjb250cm9sbGVyOidmaWx0ZXJCYXJDb250cm9sbGVyJyxcclxuXHRcdFx0Y29udHJvbGxlckFzOidmYmFyJyxcclxuXHRcdFx0bGluazogZnVuY3Rpb24oc2NvcGUsZWxlbWVudCxhdHRycykge1xyXG5cdFx0XHRcdHNjb3BlLnRlbXBsYXRlVXJsID0gc2NvcGUudG1wbHQuYmFzZSArIHNjb3BlLnRtcGx0LmZpbGVOYW1lO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fSlcclxuXHQ7XHJcblx0XHRcclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XG5cdGFuZ3VsYXIubW9kdWxlKCdsaXN0TW9kJyxbXSlcblx0LmRpcmVjdGl2ZSgnbGlzdE9mSXRlbXMnLGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiB7XG5cdFx0XHRzY29wZToge1xuXHRcdFx0XHRzZWFyY2g6Jz0nLFxuXHRcdFx0XHRsaXN0TmFtZTonPWxpc3QnLFxuXHRcdFx0XHRrZXlOYW1lOidAa2V5Jyxcblx0XHRcdFx0b3JkS2V5OidAb3JkbmFtZScsXG5cdFx0XHRcdC8vIEFkZGl0aW9uYWwgZnVuY3Rpb25zIHRvIGJlIGNhbGxlZCBmcm9tIGJ1dHRvbnMgaW4gdGhlIGxpc3QgKHNhdmUgaW5mbywgZGVsZXRlLCBldGMpXG5cdFx0XHRcdGFkZEZ1bmNzOic9ZnVuY3MnLFxuXHRcdFx0XHR0bXBsdDonPSdcblx0XHRcdH0sXG5cdFx0XHR0ZW1wbGF0ZTogJzxkaXYgbmctaW5jbHVkZT1cInRlbXBsYXRlVXJsXCI+PC9kaXY+Jyxcblx0XHRcdGNvbnRyb2xsZXI6J2xpc3RDb250cm9sbGVyJyxcblx0XHRcdGNvbnRyb2xsZXJBczonbGlzdCcsXG5cdFx0XHRsaW5rOiBmdW5jdGlvbihzY29wZSxlbGVtZW50LGF0dHJzKSB7XG5cdFx0XHRcdHNjb3BlLnRlbXBsYXRlVXJsID0gc2NvcGUudG1wbHQuYmFzZSArIHNjb3BlLnRtcGx0LmZpbGVOYW1lO1xuXHRcdFx0fVxuXHRcdH1cblx0fSlcblx0O1xufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcblx0XHJcblx0YW5ndWxhci5tb2R1bGUoJ292ZXJsYXlNb2QnLFtdKVxyXG5cdC5kaXJlY3RpdmUoJ292ZXJsYXknLCBmdW5jdGlvbigpIHtcclxuXHRcdHJldHVybiB7XHJcblx0XHRcdHNjb3BlOiB7XHJcblx0XHRcdFx0bWVzc2FnZTonPScsXHJcblx0XHRcdFx0bWVzc2FnZU51bTonPW51bWJlcicsXHJcblx0XHRcdFx0YnRuQ29uZmlnOic9Y2ZnJyxcclxuXHRcdFx0XHQvLyBGdW5jdGlvbiBmb3IgYWN0aW9uIG9mIG92ZXJsYXkgKGNhbmNlbC9iYWNrIGlzIGluIGNvbnRyb2xsZXIpXHJcblx0XHRcdFx0ZG9BY3Rpb246Jz1mdW5jJyxcclxuXHRcdFx0XHRiYXNlOidAPydcclxuXHRcdFx0fSxcclxuXHRcdFx0Y29udHJvbGxlcjonb3ZlcmxheUNvbnRyb2xsZXInLFxyXG5cdFx0XHRjb250cm9sbGVyQXM6J292ZXInLFxyXG5cdFx0XHR0ZW1wbGF0ZTogJzxkaXYgbmctaW5jbHVkZT1cInRlbXBsYXRlVXJsXCI+PC9kaXY+JyxcclxuXHRcdFx0bGluazogZnVuY3Rpb24oc2NvcGUsZWxlbWVudCxhdHRycykge1xyXG5cdFx0XHRcdC8vIElmIG5vIGJhc2UgaXMgc3BlY2lmaWVkLCB1c2UgbG9jYXRpb24gaWYgaW5zdGFsbGVkIHZpYSBib3dlci5cclxuXHRcdFx0XHRpZih0eXBlb2Ygc2NvcGUuYmFzZSA9PT0gJ3VuZGVmaW5lZCcpIHtcclxuXHRcdFx0XHRcdHNjb3BlLmJhc2UgPSAnL2Jvd2VyX2NvbXBvbmVudHMvUGhvdG9ncmFwaHktU2V0dXAtU3VpdGUvdGVtcGxhdGVzL292ZXJsYXkvJztcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0c2NvcGUudGVtcGxhdGVVcmwgPSBzY29wZS5iYXNlICsgJ292ZXJsYXkuaHRtbCc7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9KVxyXG5cdDtcclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcblx0XHJcblx0YW5ndWxhci5tb2R1bGUoJ2ZpbHRlck1vZCcpXHJcblx0LmRpcmVjdGl2ZSgnZmlsdGVyQ2hlY2tib3gnLCBmdW5jdGlvbigpIHtcclxuXHRcdFx0cmV0dXJuIHtcclxuXHRcdFx0XHRzY29wZToge1xyXG5cdFx0XHRcdFx0aXRlbXM6Jz0nLFxyXG5cdFx0XHRcdFx0c2VhcmNoOic9JyxcclxuXHRcdFx0XHRcdGJhc2U6Jz0nXHJcblx0XHRcdFx0fSxcclxuXHRcdFx0XHRjb250cm9sbGVyOidmaWx0ZXJDb21wQ29udHJvbGxlcicsXHJcblx0XHRcdFx0Y29udHJvbGxlckFzOidmY29tcCcsXHJcblx0XHRcdFx0dGVtcGxhdGU6ICc8ZGl2IG5nLWluY2x1ZGU9XCJ0ZW1wbGF0ZVVybFwiPjwvZGl2PicsXHJcblx0XHRcdFx0bGluazogZnVuY3Rpb24oc2NvcGUsZWxlbWVudCxhdHRycykge1xyXG5cdFx0XHRcdFx0Ly8gSWYgbm8gYmFzZSBpcyBzcGVjaWZpZWQsIHVzZSBsb2NhdGlvbiBpZiBpbnN0YWxsZWQgdmlhIGJvd2VyLlxyXG5cdFx0XHRcdFx0aWYodHlwZW9mIHNjb3BlLmJhc2UgPT09ICd1bmRlZmluZWQnKSB7XHJcblx0XHRcdFx0XHRcdHNjb3BlLmJhc2UgPSAnL2Jvd2VyX2NvbXBvbmVudHMvUGhvdG9ncmFwaHktU2V0dXAtU3VpdGUvdGVtcGxhdGVzL2ZpbHRlcnMvJztcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdHNjb3BlLnRlbXBsYXRlVXJsID0gc2NvcGUuYmFzZSArICdmaWx0ZXJDaGVja2JveGVzLmh0bWwnO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fSlcclxuXHQ7XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG5cdFxyXG5cdGFuZ3VsYXIubW9kdWxlKCdmaWx0ZXJNb2QnKVxyXG5cdC5kaXJlY3RpdmUoJ2ZpbHRlclF1ZXJ5JywgZnVuY3Rpb24oKSB7XHJcblx0XHRcdHJldHVybiB7XHJcblx0XHRcdFx0c2NvcGU6IHtcclxuXHRcdFx0XHRcdHNlYXJjaDonPScsXHJcblx0XHRcdFx0XHRiYXNlOic9PydcclxuXHRcdFx0XHR9LFxyXG5cdFx0XHRcdHRlbXBsYXRlOiAnPGRpdiBuZy1pbmNsdWRlPVwidGVtcGxhdGVVcmxcIj48L2Rpdj4nLFxyXG5cdFx0XHRcdGxpbms6IGZ1bmN0aW9uKHNjb3BlLGVsZW1lbnQsYXR0cnMpIHtcclxuXHRcdFx0XHRcdC8vIElmIG5vIGJhc2UgaXMgc3BlY2lmaWVkLCB1c2UgbG9jYXRpb24gaWYgaW5zdGFsbGVkIHZpYSBib3dlci5cclxuXHRcdFx0XHRcdGlmKHR5cGVvZiBzY29wZS5iYXNlID09PSAndW5kZWZpbmVkJykge1xyXG5cdFx0XHRcdFx0XHRzY29wZS5iYXNlID0gJy9ib3dlcl9jb21wb25lbnRzL1Bob3RvZ3JhcGh5LVNldHVwLVN1aXRlL3RlbXBsYXRlcy9maWx0ZXJzLyc7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRzY29wZS50ZW1wbGF0ZVVybCA9IHNjb3BlLmJhc2UgKyAnZmlsdGVyUXVlcnkuaHRtbCc7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9KVxyXG5cdDtcclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcblx0XHJcblx0YW5ndWxhci5tb2R1bGUoJ2ZpbHRlck1vZCcpXHJcblx0LmNvbnRyb2xsZXIoJ2ZpbHRlckJhckNvbnRyb2xsZXInLCBbJyRzY29wZScsIGZ1bmN0aW9uKCRzY29wZSkge1xyXG5cdFx0XHRcclxuXHRcdFx0dGhpcy5nYWxsZXJpZXMgPSBbXTtcclxuXHRcdFx0XHJcblx0XHRcdC8vIFRvZ2dsZXMgdGhlIHBvc2l0aW9uIG9mIHRoZSBsZWZ0IHNpZGUgZmlsdGVyIGNvbHVtblxyXG5cdFx0XHR0aGlzLmZpbHRlclRvZ2dsZSA9IGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdHZhciBmUG9zID0gJHNjb3BlLmZwb3NpdGlvbjtcclxuXHRcdFx0XHQkc2NvcGUuZnBvc2l0aW9uID0gKGZQb3MgPT09IDAgPyAtMTkwIDogMCk7XHJcblx0XHRcdH07XHJcblx0XHRcdFxyXG5cdFx0XHR2YXIgZkN0cmwgPSB0aGlzO1xyXG5cdFx0XHRcclxuXHRcdH1dKVxyXG5cdDtcclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcblx0XHJcblx0YW5ndWxhci5tb2R1bGUoJ2ZpbHRlck1vZCcpXHJcblx0LnNlcnZpY2UoJ2ZpbHRlckZ1bmN0aW9ucycsIGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcclxuXHRcdHZhciBmRnVuY3Rpb25zID0gdGhpcztcclxuXHRcdFxyXG5cdFx0Ly8gQ2hlY2tzIGZvciBhIG1hdGNoIHdpdGggdGhlIGZpbHRlcnMuXHJcblx0XHQvLyBJZiB0aGUgdmFsdWUgaXMgYW4gYXJyYXksIGNoZWNrcyBhbGwgdmFsdWVzIGZvciBvbmUgbWF0Y2guXHJcblx0XHQvLyBJZiBub3QsIGp1c3QgY2hlY2tzIHNpbmdsZSB2YWx1ZS5cclxuXHRcdHRoaXMuZmlsdGVyQ2hlY2sgPSBmdW5jdGlvbih2YWx1ZSxzZWFyY2gpIHtcclxuXHRcdFx0dmFyIGFsbE1hdGNoID0gdHJ1ZTtcclxuXHRcdFx0XHJcblx0XHRcdGZvcih2YXIga2V5IGluIHNlYXJjaCkge1xyXG5cdFx0XHRcdGlmKHNlYXJjaC5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XHJcblx0XHRcdFx0XHR2YXIgdGhpc1ZhbHVlID0gdmFsdWVba2V5XTtcclxuXHRcdFx0XHRcdGlmKHNlYXJjaFtrZXldLmlzQXJyYXkpIHtcclxuXHRcdFx0XHRcdFx0dmFyIG51bVZhbHVlcyA9IHRoaXNWYWx1ZS5sZW5ndGgsXHJcblx0XHRcdFx0XHRcdFx0bWF0Y2hGb3VuZCA9IGZhbHNlO1xyXG5cdFx0XHRcdFx0XHRmb3IodmFyIGkgPSAwOyBpIDwgbnVtVmFsdWVzOyBpKyspIHtcclxuXHRcdFx0XHRcdFx0XHRpZihjaGVja1ZhbHVlKHRoaXNWYWx1ZVtpXSwgc2VhcmNoLCBrZXkpKSB7XHJcblx0XHRcdFx0XHRcdFx0XHRtYXRjaEZvdW5kID0gdHJ1ZTtcclxuXHRcdFx0XHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRpZighbWF0Y2hGb3VuZCkge1xyXG5cdFx0XHRcdFx0XHRcdGFsbE1hdGNoID0gZmFsc2U7XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRcdGFsbE1hdGNoID0gY2hlY2tWYWx1ZSh0aGlzVmFsdWUsIHNlYXJjaCwga2V5KTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdGlmKGFsbE1hdGNoID09PSBmYWxzZSkge1xyXG5cdFx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdFx0XHJcblx0XHRcdHJldHVybiBhbGxNYXRjaDtcclxuXHRcdFx0XHJcblx0XHR9O1xyXG5cdFx0XHJcblx0XHQvLyBGdW5jdGlvbiB0aGF0IGNoZWNrcyB2YWx1ZSBhZ2FpbnN0IHRoZSBxdWVyeSBmaWx0ZXIgJiBjaGVja2JveGVzXHJcblx0XHR2YXIgY2hlY2tWYWx1ZSA9IGZ1bmN0aW9uKHZhbHVlLCBzZWFyY2gsIGtleSkge1xyXG5cdFx0XHRcclxuXHRcdFx0dmFyIGNoZWNrTWF0Y2ggPSB0cnVlLFxyXG5cdFx0XHRcdHZhbHVlTWF0Y2ggPSBmYWxzZSxcclxuXHRcdFx0XHRjaGVja2JveGVzID0gc2VhcmNoW2tleV0uY2hlY2tib3hlcyxcclxuXHRcdFx0XHRzZWFyY2hPbiA9IHNlYXJjaFtrZXldLnNlYXJjaE9uO1xyXG5cdFx0XHRcdFxyXG5cdFx0XHRpZihzZWFyY2hPbiAmJiB2YWx1ZSkge1xyXG5cdFx0XHRcdHZhciB0aGlzVmFsdWUgPSB2YWx1ZVtzZWFyY2hPbl07XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0dmFyIHRoaXNWYWx1ZSA9IHZhbHVlO1xyXG5cdFx0XHR9XHJcblx0XHRcdGlmKGNoZWNrYm94ZXMpIHtcclxuXHRcdFx0XHRjaGVja01hdGNoID0gY2hlY2tUaGVCb3hlcyh0aGlzVmFsdWUsa2V5LGNoZWNrYm94ZXMpO1xyXG5cdFx0XHR9XHJcblx0XHRcdHZhbHVlTWF0Y2ggPSBmRnVuY3Rpb25zLnF1ZXJ5RmlsdGVyQ2hlY2sodGhpc1ZhbHVlLHNlYXJjaFtrZXldLnF1ZXJ5KTtcclxuXHRcdFx0XHJcblx0XHRcdHJldHVybiBjaGVja01hdGNoICYmIHZhbHVlTWF0Y2g7XHJcblx0XHR9O1xyXG5cdFx0XHJcblx0XHQvLyBDaGVja3MgcXVlcnkgdmFsdWUgYWdhaW5zdCBhY3R1YWwuICBBbHNvIHVzZWQgdG8gaGlkZS9zaG93IGNoZWNrYm94ZXMgYmFzZWQgb24gdGhlIHR5cGVkIGZpbHRlci5cclxuXHRcdHRoaXMucXVlcnlGaWx0ZXJDaGVjayA9IGZ1bmN0aW9uKHZhbHVlLHF1ZXJ5KSB7XHJcblx0XHRcdGlmKCF2YWx1ZSkge1xyXG5cdFx0XHRcdHZhbHVlID0gJyc7XHJcblx0XHRcdH1cclxuXHRcdFx0cmV0dXJuIHZhbHVlLnRvTG93ZXJDYXNlKCkuaW5kZXhPZihxdWVyeS50b0xvd2VyQ2FzZSgpKSA+IC0xO1xyXG5cdFx0fTtcclxuXHRcdFxyXG5cdFx0Ly8gRnVuY3Rpb24gdG8gbG9vcCB0aHJvdWdoIHRoZSBjaGVja2JveGVzIHZhcmlhYmxlIGFuZCByZXR1cm4gdHJ1ZSBpZiB0aGUgdmFsdWUgaXMgYSBtYXRjaFxyXG5cdFx0dmFyIGNoZWNrVGhlQm94ZXMgPSBmdW5jdGlvbiAodmFsdWUsZmlsdGVyc2V0LGNoZWNrYm94ZXMpIHtcclxuXHRcdFx0aWYodmFsdWUpIHtcclxuXHRcdFx0XHR2YXIgaSA9IDA7XHJcblx0XHRcdFx0ZG8ge1xyXG5cdFx0XHRcdFx0aWYodmFsdWUgPT09IGNoZWNrYm94ZXNbaV0pIHtcclxuXHRcdFx0XHRcdFx0cmV0dXJuIHRydWU7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRpKys7XHJcblx0XHRcdFx0fSB3aGlsZSh0eXBlb2YgY2hlY2tib3hlc1tpXSAhPT0gJ3VuZGVmaW5lZCcpXHJcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdGlmKGNoZWNrYm94ZXNbJ25vbmUnXSkge1xyXG5cdFx0XHRcdFx0cmV0dXJuIHRydWU7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdFx0fVxyXG5cdFx0fTtcclxuXHRcdFxyXG5cdH0pXHJcblx0O1xyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuXHRcclxuXHRhbmd1bGFyLm1vZHVsZSgnZmlsdGVyTW9kJylcclxuXHQuY29udHJvbGxlcignZmlsdGVyQ29tcENvbnRyb2xsZXInLCBbJyRzY29wZScsJ2ZpbHRlckZ1bmN0aW9ucycsIGZ1bmN0aW9uKCRzY29wZSxmaWx0ZXJGdW5jdGlvbnMpIHtcclxuXHRcdFxyXG5cdFx0dmFyIGJveFNldHVwID0gZnVuY3Rpb24gKGl0ZW1zKSB7XHJcblx0XHRcdFxyXG5cdFx0XHR2YXIgY2hlY2tib3hlcyA9IHtub25lOnRydWV9O1xyXG5cdFx0XHRcclxuXHRcdFx0Zm9yKHZhciBpID0gMDsgaSA8IGl0ZW1zLmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdFx0Y2hlY2tib3hlc1tpXSA9IGl0ZW1zW2ldO1xyXG5cdFx0XHR9XHJcblx0XHRcdFxyXG5cdFx0XHRyZXR1cm4gY2hlY2tib3hlcztcclxuXHRcdFx0XHJcblx0XHR9O1xyXG5cdFx0XHJcblx0XHQkc2NvcGUuc2VhcmNoLmNoZWNrYm94ZXMgPSBib3hTZXR1cCgkc2NvcGUuaXRlbXMpO1xyXG5cdFx0XHJcblx0XHR0aGlzLm9ubHlCb3ggPSBmdW5jdGlvbihib3hOdW0sYm94TmFtZSkge1xyXG5cdFx0XHR2YXIgaSA9IDA7XHJcblx0XHRcdGRvIHtcclxuXHRcdFx0XHQkc2NvcGUuc2VhcmNoLmNoZWNrYm94ZXNbaV0gPSBmYWxzZTtcdFx0XHRcdFx0XHJcblx0XHRcdFx0aSsrO1xyXG5cdFx0XHR9IHdoaWxlKHR5cGVvZiAkc2NvcGUuc2VhcmNoLmNoZWNrYm94ZXNbaV0gIT09ICd1bmRlZmluZWQnKVxyXG5cdFx0XHRpZihib3hOdW0gPT09ICdub25lJykge1xyXG5cdFx0XHRcdCRzY29wZS5zZWFyY2guY2hlY2tib3hlc1snbm9uZSddID0gdHJ1ZTtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHQkc2NvcGUuc2VhcmNoLmNoZWNrYm94ZXNbYm94TnVtXSA9IGJveE5hbWU7XHJcblx0XHRcdFx0JHNjb3BlLnNlYXJjaC5jaGVja2JveGVzWydub25lJ10gPSBmYWxzZTtcclxuXHRcdFx0fVxyXG5cdFx0fTtcclxuXHRcdFxyXG5cdFx0dGhpcy5hbGxCb3hlcyA9IGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0Zm9yKHZhciBpID0gMDsgaSA8ICRzY29wZS5pdGVtcy5sZW5ndGg7IGkrKykge1xyXG5cdFx0XHRcdCRzY29wZS5zZWFyY2guY2hlY2tib3hlc1tpXSA9ICRzY29wZS5pdGVtc1tpXTtcclxuXHRcdFx0fVxyXG5cdFx0XHQkc2NvcGUuc2VhcmNoLmNoZWNrYm94ZXNbJ25vbmUnXSA9IHRydWU7XHJcblx0XHR9O1xyXG5cdFx0XHJcblx0XHR0aGlzLnNob3dDaGVja2JveCA9IGZ1bmN0aW9uICh2YWx1ZSxxdWVyeSkge1xyXG5cdFx0XHRyZXR1cm4gZmlsdGVyRnVuY3Rpb25zLnF1ZXJ5RmlsdGVyQ2hlY2sodmFsdWUscXVlcnkpO1xyXG5cdFx0fTtcdFxyXG5cdFx0XHJcblx0fV0pXHJcblx0O1xyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuXHRcclxuXHRhbmd1bGFyLm1vZHVsZSgnb3ZlcmxheU1vZCcpXHJcblx0XHQuY29udHJvbGxlcignb3ZlcmxheUNvbnRyb2xsZXInLCBbJyRzY29wZScsZnVuY3Rpb24oJHNjb3BlKSB7XHJcblx0XHRcdFxyXG5cdFx0XHR0aGlzLmNhbmNlbEFjdGlvbiA9IGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdCRzY29wZS5tZXNzYWdlTnVtID0gMDtcclxuXHRcdFx0fTtcclxuXHRcdFx0XHJcblx0XHR9XSlcclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcblx0YW5ndWxhci5tb2R1bGUoJ2xpc3RNb2QnKVxyXG5cdC5jb250cm9sbGVyKCdsaXN0Q29udHJvbGxlcicsWyckc2NvcGUnLCckcm9vdFNjb3BlJywnbGlzdEZ1bmN0aW9ucycsZnVuY3Rpb24oJHNjb3BlLCRyb290U2NvcGUsbGlzdEZ1bmN0aW9ucykge1xyXG5cdFx0XHJcblx0XHR2YXIgbEN0cmwgPSB0aGlzLFxyXG5cdFx0XHRrZXkgPSAkc2NvcGUua2V5TmFtZSxcclxuXHRcdFx0b3JkS2V5ID0gJHNjb3BlLm9yZE5hbWUsXHJcblx0XHRcdGxpc3ROYW1lID0gJHNjb3BlLmxpc3ROYW1lO1xyXG5cdFx0XHJcblx0XHQvLyBTZXRzIHNlbGVjdGVkTGlzdCBhcyBlbXB0eSBhcnJheSBmb3IgdGhpcyBsaXN0IG51bWJlci5cclxuXHRcdGxpc3RGdW5jdGlvbnMuY2xlYXJTZWxlY3RlZChsaXN0TmFtZSk7XHJcblx0XHR0aGlzLmhpZGVPdmVybGF5ID0gdHJ1ZTtcclxuXHRcdFxyXG5cdFx0dGhpcy5sRnVuYyA9IGxpc3RGdW5jdGlvbnM7XHJcblx0XHR0aGlzLm5ld1NlY3Rpb24gPSAnJztcclxuXHRcdHRoaXMuY3VycmVudFNlY3Rpb24gPSB7c2VjdGlvbjonJyxpZDowfTtcclxuXHRcdHRoaXMub3JkZXJTYXZlUGVuZGluZyA9IGZhbHNlO1xyXG5cdFx0XHJcblx0XHQvLyBUb2dnbGUgc2VsZWN0aW9uIG9mIGl0ZW0gLSBjaGFuZ2VzIHNlbGVjdCBwcm9wZXJ0eSBvZiBpdGVtIGJldHdlZW4gdHJ1ZS9mYWxzZSBhbmQgYWRkcy9yZW1vdmVzIGZyb20gc2VsZWN0aW9uIGFycmF5IChzZWUgbGlzdFNlcnYuanMgZm9yIGZ1bmN0aW9uKVxyXG5cdFx0dGhpcy50b2dnbGVTZWxlY3QgPSBmdW5jdGlvbihpdGVtLGluZGV4KSB7XHJcblx0XHRcdGxpc3RGdW5jdGlvbnMudG9nZ2xlU2VsZWN0KGl0ZW0saW5kZXgsa2V5LGxpc3ROYW1lKTtcdFx0XHJcblx0XHR9O1xyXG5cdFx0XHJcblx0XHQvLyBDdXN0b20gZmlsdGVyIGZ1bmN0aW9uIGNoZWNraW5nIGl0ZW0gZmlyc3QgYWdhaW5zdCBhIGxpc3Qgb2YgZXhjbHVzaW9ucyB0aGVuIGFnYWluc3QgY3VzdG9tIGZpbHRlciB2YWx1ZXNcclxuXHRcdHRoaXMuZmlsdGVyQ2hlY2sgPSBmdW5jdGlvbih2YWx1ZSxpbmRleCxhcnJheSkge1xyXG5cdFx0XHRyZXR1cm4gbGlzdEZ1bmN0aW9ucy5maWx0ZXJDaGVjayh2YWx1ZSxpbmRleCwkc2NvcGUuc2VhcmNoLGtleSxsaXN0TmFtZSk7XHJcblx0XHR9O1xyXG5cdFx0XHJcblx0XHQvLyBSZXR1cm5zIHRoZSBsZW5ndGggYSBsaXN0IChtYWluIGxpc3QgaWYgbm90IHNwZWNpZmllZCkuXHJcblx0XHR0aGlzLmdldExlbmd0aCA9IGZ1bmN0aW9uKGxpc3ROYW1lLHN1Ykxpc3QpIHtcclxuXHRcdFx0aWYoIXN1Ykxpc3QpIHtcclxuXHRcdFx0XHRzdWJMaXN0ID0gJ21haW4nO1xyXG5cdFx0XHR9XHJcblx0XHRcdHJldHVybiBsaXN0RnVuY3Rpb25zLkxpc3RzW2xpc3ROYW1lXVtzdWJMaXN0XS5sZW5ndGg7XHJcblx0XHR9O1xyXG5cdFx0XHJcblx0XHQvLyBDaGFuZ2Ugb3JkZXIgb2YgbGlzdC5cclxuXHRcdHRoaXMubW92ZUl0ZW1zID0gZnVuY3Rpb24oZGlyZWN0aW9uKSB7XHJcblx0XHRcdGxpc3RGdW5jdGlvbnMubW92ZUl0ZW1zKGRpcmVjdGlvbixrZXksb3JkS2V5LGxpc3ROYW1lKTtcclxuXHRcdFx0dGhpcy5vcmRlclNhdmVQZW5kaW5nID0gdHJ1ZTtcclxuXHRcdH07XHJcblx0XHRcclxuXHRcdHRoaXMuY2hlY2tTZWxlY3RlZCA9IGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRyZXR1cm4gbGlzdEZ1bmN0aW9ucy5jaGVja1NlbGVjdGVkKGxpc3ROYW1lKTtcclxuXHRcdH07XHJcblx0XHRcclxuXHRcdHRoaXMuc2VsZWN0QWxsID0gZnVuY3Rpb24oKSB7XHJcblx0XHRcdGxpc3RGdW5jdGlvbnMuc2VsZWN0QWxsKGtleSxsaXN0TmFtZSk7XHJcblx0XHR9O1xyXG5cdFx0XHJcblx0XHR0aGlzLmRlc2VsZWN0QWxsID0gZnVuY3Rpb24oKSB7XHJcblx0XHRcdGxpc3RGdW5jdGlvbnMuZGVzZWxlY3RBbGwoa2V5LGxpc3ROYW1lKTtcclxuXHRcdH07XHJcblx0XHRcclxuXHR9XSlcclxuXHRcclxuXHQ7XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG5cdGFuZ3VsYXIubW9kdWxlKCdsaXN0TW9kJylcclxuXHQuc2VydmljZSgnbGlzdEZ1bmN0aW9ucycsIFsnJHEnLCdmaWx0ZXJGdW5jdGlvbnMnLGZ1bmN0aW9uICgkcSxmaWx0ZXJGdW5jdGlvbnMpIHtcclxuXHRcdFxyXG5cdFx0dmFyIGxGdW5jID0gdGhpcyxcclxuXHRcdFx0ZWRpdExpc3QgPSBbXSxcclxuXHRcdFx0Y3VycmVudEZpbHRlcmVkTGlzdCA9IFtdO1xyXG5cdFx0XHJcblx0XHR0aGlzLkxpc3RzID0ge307XHJcblx0XHR0aGlzLnNlY3Rpb25MaXN0ID0gW3tzZWN0aW9uOicnLGlkOjB9XTtcclxuXHRcdFxyXG5cdFx0dGhpcy5zZXRMaXN0ID0gZnVuY3Rpb24obGlzdEFycmF5LGxpc3ROYW1lLGV4Y2x1ZGVBcnJheSkge1xyXG5cdFx0XHR0aGlzLkxpc3RzW2xpc3ROYW1lXSA9IHsgbWFpbjpsaXN0QXJyYXksc2VsZWN0ZWQ6W10sZWRpdDpbXSxmaWx0ZXJlZDpbXSxleGNsdWRlOmV4Y2x1ZGVBcnJheSB9O1xyXG5cdFx0fTtcclxuXHRcdFxyXG5cdFx0dGhpcy5jbGVhclNlbGVjdGVkID0gZnVuY3Rpb24obGlzdE5hbWUpIHtcclxuXHRcdFx0dGhpcy5MaXN0c1tsaXN0TmFtZV0uc2VsZWN0ZWQgPSBbXTtcclxuXHRcdH07XHJcblx0XHRcclxuXHRcdHRoaXMuY2hlY2tTZWxlY3RlZCA9IGZ1bmN0aW9uKGxpc3ROYW1lKSB7XHJcblx0XHRcdHJldHVybiB0aGlzLkxpc3RzW2xpc3ROYW1lXS5zZWxlY3RlZC5sZW5ndGggPT09IDA7XHJcblx0XHR9O1xyXG5cdFx0XHJcblx0XHR0aGlzLmxpc3RMZW5ndGggPSBmdW5jdGlvbihsaXN0TmFtZSxzdWJMaXN0KSB7XHJcblx0XHRcdHN1Ykxpc3QgPSB0eXBlb2Ygc3ViTGlzdCAhPT0gJ3VuZGVmaW5lZCcgPyBzdWJMaXN0IDogJ21haW4nO1xyXG5cdFx0XHRpZih0aGlzLkxpc3RzW2xpc3ROYW1lXSkge1xyXG5cdFx0XHRcdHJldHVybiB0aGlzLkxpc3RzW2xpc3ROYW1lXVtzdWJMaXN0XS5sZW5ndGg7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0cmV0dXJuIDA7XHJcblx0XHRcdH1cclxuXHRcdH07XHJcblx0XHRcclxuXHRcdC8vIEZpcnN0IGNoZWNrcyBleGNsdWRlIGFycmF5IGZvciBpdGVtLCB0aGVuIGNoZWNrcyBzZWFyY2ggdmFsdWUgKHNlZSBmaWx0ZXJTZXJ2aWNlLmpzKVxyXG5cdFx0dGhpcy5maWx0ZXJDaGVjayA9IGZ1bmN0aW9uKHZhbHVlLGluZGV4LHNlYXJjaCxrZXlOYW1lLGxpc3ROYW1lKSB7XHJcblx0XHRcdHZhciBsaXN0Q2hlY2sgPSBmYWxzZSxcclxuXHRcdFx0XHRzaG93SXRlbSA9IGZhbHNlO1xyXG5cdFx0XHRsaXN0Q2hlY2sgPSBsRnVuYy5maW5kQnlJZCh2YWx1ZVtrZXlOYW1lXSxsaXN0TmFtZSxrZXlOYW1lLCdleGNsdWRlJyk7XHJcblx0XHRcdGlmKGxpc3RDaGVjayA9PT0gZmFsc2UpIHtcclxuXHRcdFx0XHRzaG93SXRlbSA9IGZpbHRlckZ1bmN0aW9ucy5maWx0ZXJDaGVjayh2YWx1ZSxzZWFyY2gpO1xyXG5cdFx0XHRcdC8vIERlc2VsZWN0IGl0ZW0gaWYgdGhlIGZpbHRlciBleGNsdWRlcyB0aGUgaXRlbVxyXG5cdFx0XHRcdGlmKHZhbHVlLnNlbGVjdGVkICYmICFzaG93SXRlbSAmJiBpbmRleCA+PSAwKSB7XHJcblx0XHRcdFx0XHRsRnVuYy5kZXNlbGVjdEl0ZW0odmFsdWVba2V5TmFtZV0saW5kZXgsa2V5TmFtZSxsaXN0TmFtZSk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHRcdGxGdW5jLnNldEZpbHRlcmVkKGxpc3ROYW1lLGluZGV4LHNob3dJdGVtKTtcclxuXHRcdFx0cmV0dXJuIHNob3dJdGVtO1xyXG5cdFx0fTtcclxuXHRcdFxyXG5cdFx0Ly8gQWRkcyBwcm9wZXJ0eSB3aXRoIGZpbHRlciBzdGF0dXMgb2YgZWxlbWVudFxyXG5cdFx0dGhpcy5zZXRGaWx0ZXJlZCA9IGZ1bmN0aW9uKGxpc3ROYW1lLGluZGV4LHNob3cpIHtcclxuXHRcdFx0dGhpcy5MaXN0c1tsaXN0TmFtZV0ubWFpbltpbmRleF0uc2hvd0l0ZW0gPSBzaG93O1xyXG5cdFx0fTtcclxuXHRcdFxyXG5cdFx0Ly8gQ3JlYXRlcyBhIGxpc3Qgb2Ygb25seSB0aGUgY3VycmVudGx5IGZpbHRlcmVkIGVsZW1lbnRzIG9mIHRoZSBtYWluIGFycmF5LiBSZXR1cm5zIHRoaXMgZmlsdGVyZWQgYXJyYXkuXHJcblx0XHR0aGlzLnNldEZpbHRlckFycmF5ID0gZnVuY3Rpb24obGlzdE5hbWUpIHtcclxuXHRcdFx0dmFyIG1haW5BcnJheSA9IHRoaXMuTGlzdHNbbGlzdE5hbWVdLm1haW47XHJcblx0XHRcdGZvcih2YXIgaSA9IDA7IGkgPCBtYWluQXJyYXkubGVuZ3RoOyBpKyspIHtcclxuXHRcdFx0XHRpZihtYWluQXJyYXlbaV0uc2hvd0l0ZW0gPT09IHRydWUpIHtcclxuXHRcdFx0XHRcdHRoaXMuTGlzdHNbbGlzdE5hbWVdLmZpbHRlcmVkLnB1c2gobWFpbkFycmF5W2ldKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdFx0cmV0dXJuIHRoaXMuTGlzdHNbbGlzdE5hbWVdLmZpbHRlcmVkO1xyXG5cdFx0fTtcclxuXHRcdFxyXG5cdFx0dGhpcy50b2dnbGVTZWxlY3QgPSBmdW5jdGlvbihpdGVtLGluZGV4LGtleSxsaXN0TmFtZSkge1xyXG5cdFx0XHRrZXkgPSBrZXkgPyBrZXkgOiAnaWQnO1xyXG5cdFx0XHR2YXIgaWQgPSBpdGVtW2tleV07XHJcblx0XHRcdGlmKCFpbmRleCAmJiBpbmRleCAhPT0gMCkge1xyXG5cdFx0XHRcdGluZGV4ID0gdGhpcy5maW5kQnlJZChpZCxsaXN0TmFtZSxrZXksJ21haW4nKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRpZighaXRlbS5zZWxlY3RlZCkge1xyXG5cdFx0XHRcdHRoaXMuc2VsZWN0SXRlbShpdGVtLGluZGV4LGtleSxsaXN0TmFtZSk7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0dGhpcy5kZXNlbGVjdEl0ZW0oaWQsaW5kZXgsa2V5LGxpc3ROYW1lKTtcclxuXHRcdFx0fVxyXG5cdFx0fTtcclxuXHJcblx0XHQvLyBGdW5jdGlvbiB0byBjcmVhdGUgYSBjb21tYSBzZXBhcmF0ZWQgbGlzdCBvZiBhIHBhcnRpY3VsYXIgcHJvcGVydHkgd2l0aGluIGFuIGFycmF5IFxyXG5cdFx0dGhpcy5tYWtlTGlzdCA9IGZ1bmN0aW9uKGxpc3ROYW1lLGtleU5hbWUsc3ViTGlzdCkge1xyXG5cdFx0XHRpZighc3ViTGlzdCkge1xyXG5cdFx0XHRcdHN1Ykxpc3QgPSAnbWFpbic7XHJcblx0XHRcdH1cclxuXHRcdFx0dmFyIGxpc3RBcnJheSA9IHRoaXMuTGlzdHNbbGlzdE5hbWVdW3N1Ykxpc3RdO1xyXG5cdFx0XHRmb3IodmFyIGkgPSAwOyBpIDwgbGlzdEFycmF5Lmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdFx0bWVzc2FnZSArPSBsaXN0QXJyYXlbaV1ba2V5TmFtZV07XHJcblx0XHRcdFx0aWYoaSA8IGxpc3RBcnJheS5sZW5ndGggLSAxKSB7XHJcblx0XHRcdFx0XHRtZXNzYWdlICs9ICcsICc7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHRcdHJldHVybiBtZXNzYWdlO1xyXG5cdFx0fTtcclxuXHJcblx0XHQvLyBSZXR1cm5zIHRoZSBpbmRleCBvZiB0aGUgaXRlbSB3aXRoaW4gdGhlIGFuIGFycmF5IChzcGVjaWZpZWQgYnkgbGlzdE5hbWUgYW5kIHN1Ykxpc3QpIG9yIGZhbHNlIGlmIG5vdCBmb3VuZC4gIFNlYXJjaCBieSBrZXkgKHNob3VsZCBiZSB1bmlxdWUgaWQuXHJcblx0XHR0aGlzLmZpbmRCeUlkID0gZnVuY3Rpb24oaWQsbGlzdE5hbWUsa2V5LHN1Ykxpc3QpIHtcclxuXHRcdFx0a2V5ID0gdHlwZW9mIGtleSAhPT0gJ3VuZGVmaW5lZCcgPyBrZXkgOiAnaWQnO1xyXG5cdFx0XHRzdWJMaXN0ID0gdHlwZW9mIHN1Ykxpc3QgIT09ICd1bmRlZmluZWQnID8gc3ViTGlzdCA6ICdtYWluJztcclxuXHRcdFx0dmFyIGxpc3RBcnJheSA9IHRoaXMuTGlzdHNbbGlzdE5hbWVdW3N1Ykxpc3RdO1xyXG5cdFx0XHRmb3IodmFyIGkgPSAwOyBpIDwgbGlzdEFycmF5Lmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdFx0aWYoU3RyaW5nKGxpc3RBcnJheVtpXVtrZXldKSA9PT0gU3RyaW5nKGlkKSkge1xyXG5cdFx0XHRcdFx0cmV0dXJuIGk7XHJcblx0XHRcdFx0fVx0XHRcdFxyXG5cdFx0XHR9XHJcblx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdH07XHJcblx0XHRcclxuXHRcdC8vIERlbGV0ZXMgaXRlbXMgZm91bmQgaW4gZGVsQXJyYXkgZnJvbSBtYWluIGxpc3Qgc2VhcmNoaW5nIGJ5IGlkLiBSZXR1cm5zIG5ldyBhcnJheS5cclxuXHRcdHRoaXMuZGVsZXRlQnlJZCA9IGZ1bmN0aW9uKGRlbEFycmF5LGlkTmFtZSxsaXN0TmFtZSxzdWJMaXN0KSB7XHJcblx0XHRcdHZhciBudW1JdGVtcyA9IGRlbEFycmF5Lmxlbmd0aDtcclxuXHRcdFx0c3ViTGlzdCA9IHR5cGVvZiBzdWJMaXN0ICE9PSAndW5kZWZpbmVkJyA/IHN1Ykxpc3QgOiAnbWFpbic7XHJcblx0XHRcdGZvcih2YXIgaSA9IDA7IGkgPCBudW1JdGVtczsgaSsrKSB7XHJcblx0XHRcdFx0dmFyIGltZ0luZGV4ID0gbEZ1bmMuZmluZEJ5SWQoZGVsQXJyYXlbaV1baWROYW1lXSxsaXN0TmFtZSxpZE5hbWUsc3ViTGlzdCk7XHJcblx0XHRcdFx0bEZ1bmMuTGlzdHNbbGlzdE5hbWVdLm1haW4uc3BsaWNlKGltZ0luZGV4LDEpO1xyXG5cdFx0XHR9XHJcblx0XHR9O1xyXG5cdFx0XHJcblx0XHQvLyBTZWxlY3RzIGFsbCBpdGVtcyB3aXRoaW4gdGhlIGN1cnJlbnQgZmlsdGVyIHNldFxyXG5cdFx0dGhpcy5zZWxlY3RBbGwgPSBmdW5jdGlvbihrZXksbGlzdE5hbWUpIHtcclxuXHRcdFx0a2V5ID0gdHlwZW9mIGtleSAhPT0gJ3VuZGVmaW5lZCcgPyBrZXkgOiAnaWQnO1xyXG5cdFx0XHR2YXIgZmlsdGVyZWRJdGVtcyA9IHRoaXMuc2V0RmlsdGVyQXJyYXkobGlzdE5hbWUpO1xyXG5cdFx0XHR2YXIgbnVtSXRlbXMgPSBmaWx0ZXJlZEl0ZW1zLmxlbmd0aDtcclxuXHRcdFx0Zm9yKHZhciBpID0gMDsgaSA8IG51bUl0ZW1zOyBpKyspIHtcclxuXHRcdFx0XHRpZighZmlsdGVyZWRJdGVtc1tpXS5zZWxlY3RlZCkge1xyXG5cdFx0XHRcdFx0bEZ1bmMuc2VsZWN0SXRlbShmaWx0ZXJlZEl0ZW1zW2ldLHVuZGVmaW5lZCxrZXksbGlzdE5hbWUpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fTtcclxuXHRcdFxyXG5cdFx0Ly8gRGVzZWxlY3RzIGFsbCBpdGVtc1xyXG5cdFx0dGhpcy5kZXNlbGVjdEFsbCA9IGZ1bmN0aW9uKGtleSxsaXN0TmFtZSkge1xyXG5cdFx0XHRrZXkgPSB0eXBlb2Yga2V5ICE9PSAndW5kZWZpbmVkJyA/IGtleSA6ICdpZCc7XHJcblx0XHRcdHZhciBudW1QaG90b3MgPSB0aGlzLkxpc3RzW2xpc3ROYW1lXS5tYWluLmxlbmd0aDtcclxuXHRcdFx0aWYoIXRoaXMuY2hlY2tTZWxlY3RlZChsaXN0TmFtZSkpIHtcclxuXHRcdFx0XHRmb3IodmFyIGkgPSAwOyBpIDwgbnVtUGhvdG9zOyBpKyspIHtcclxuXHRcdFx0XHRcdHZhciBpdGVtID0gdGhpcy5MaXN0c1tsaXN0TmFtZV0ubWFpbltpXTtcclxuXHRcdFx0XHRcdGlmKGl0ZW0uc2VsZWN0ZWQpIHtcclxuXHRcdFx0XHRcdFx0dGhpcy5kZXNlbGVjdEl0ZW0oaXRlbS5pZCxpLGtleSxsaXN0TmFtZSk7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9O1xyXG5cdFx0XHJcblx0XHR0aGlzLmRlc2VsZWN0SXRlbSA9IGZ1bmN0aW9uKGlkLGluZGV4LGtleSxsaXN0TmFtZSkge1xyXG5cdFx0XHRrZXkgPSB0eXBlb2Yga2V5ICE9PSAndW5kZWZpbmVkJyA/IGtleSA6ICdpZCc7XHJcblx0XHRcdGxGdW5jLkxpc3RzW2xpc3ROYW1lXS5tYWluW2luZGV4XS5zZWxlY3RlZCA9IGZhbHNlO1xyXG5cdFx0XHR2YXIgc2VsSW5kZXggPSBsRnVuYy5maW5kQnlJZChpZCxsaXN0TmFtZSxrZXksJ3NlbGVjdGVkJyk7XHJcblx0XHRcdGxGdW5jLkxpc3RzW2xpc3ROYW1lXS5zZWxlY3RlZC5zcGxpY2Uoc2VsSW5kZXgsMSk7XHJcblx0XHR9O1xyXG5cclxuXHRcdHRoaXMuc2VsZWN0SXRlbSA9IGZ1bmN0aW9uKGl0ZW0saW5kZXgsa2V5LGxpc3ROYW1lKSB7XHJcblx0XHRcdGtleSA9IHR5cGVvZiBrZXkgIT09ICd1bmRlZmluZWQnID8ga2V5IDogJ2lkJztcclxuXHRcdFx0aWYoIWluZGV4KSB7XHJcblx0XHRcdFx0aW5kZXggPSB0aGlzLmZpbmRCeUlkKGl0ZW1ba2V5XSxsaXN0TmFtZSxrZXksJ21haW4nKTtcclxuXHRcdFx0fVxyXG5cdFx0XHR0aGlzLkxpc3RzW2xpc3ROYW1lXS5tYWluW2luZGV4XS5zZWxlY3RlZCA9IHRydWU7XHJcblx0XHRcdHRoaXMuTGlzdHNbbGlzdE5hbWVdLnNlbGVjdGVkLnB1c2goaXRlbSk7XHJcblx0XHR9O1xyXG5cdFx0XHJcblx0XHQvLyBBZnRlciBpdGVtcyBhcmUgbW92ZWQgaW4gbGlzdCwgc2V0cyB0aGUgb3JkZXIgdmFsdWUgKG5hbWVkIG9yZEtleSkgdG8gdGhlIGNvcnJlY3QgbnVtYmVyIGZvciB0aGUgREIuICBBbHNvIGFkZHMgb3JkZXIgYW5kIHNlY3Rpb24gdG8gdGhlIHNlbGVjdGVkIGxpc3QuXHJcblx0XHR2YXIgcmVzZXRPcmRlciA9IGZ1bmN0aW9uKGtleSxvcmRLZXksbGlzdE5hbWUsc2VjdGlvbikge1xyXG5cdFx0XHR2YXIgc2VsSW5kZXggPSAwO1xyXG5cdFx0XHRmb3IoaSA9IDA7IGkgPCBsRnVuYy5MaXN0c1tsaXN0TmFtZV0ubWFpbi5sZW5ndGg7IGkrKykge1xyXG5cdFx0XHRcdGxGdW5jLkxpc3RzW2xpc3ROYW1lXS5tYWluW2ldW29yZEtleV0gPSBpO1xyXG5cdFx0XHRcdGlmKGxGdW5jLkxpc3RzW2xpc3ROYW1lXS5tYWluLnNlbGVjdGVkKSB7XHJcblx0XHRcdFx0XHRzZWxJbmRleCA9IGxGdW5jLmZpbmRCeUlkKGxGdW5jLkxpc3RzW2xpc3ROYW1lXS5tYWluW2ldW2tleV0sbGlzdE5hbWUsa2V5LCdzZWxlY3RlZCcpO1xyXG5cdFx0XHRcdFx0bEZ1bmMuTGlzdHNbbGlzdE5hbWVdLnNlbGVjdGVkW3NlbEluZGV4XVtvcmRLZXldID0gaTtcclxuXHRcdFx0XHRcdGlmKHR5cGVvZiBzZWN0aW9uICE9PSAndW5kZWZpbmVkJykge1xyXG5cdFx0XHRcdFx0XHRsRnVuYy5MaXN0c1tsaXN0TmFtZV0uc2VsZWN0ZWRbc2VsSW5kZXhdLnNlY3Rpb24gPSBzZWN0aW9uO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fTtcclxuXHRcdFxyXG5cdFx0Ly8gQWRkcyB0aGUgc2VsZWN0ZWQgaXRlbXMgdG8gYSBzZWN0aW9uIGFuZCByZW9yZGVycyBpdGVtcyB0byBncm91cCB0aG9zZSB0b2dldGhlci5cclxuXHRcdHRoaXMuZ3JvdXBTZWxlY3RlZCA9IGZ1bmN0aW9uKGtleSxvcmRLZXksc2VjdGlvbixsaXN0TmFtZSkge1xyXG5cdFx0XHR2YXIgbGlzdFRlbXAgPSBsRnVuYy5MaXN0c1tsaXN0TmFtZV0ubWFpbixcclxuXHRcdFx0XHRmaXJzdEluZGV4ID0gLTEsXHJcblx0XHRcdFx0bW92ZUluZGV4ID0gMCxcclxuXHRcdFx0XHRzZWxJbmRleDtcclxuXHRcdFx0Zm9yKHZhciBpID0gMDsgaSA8IGxpc3RUZW1wLmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdFx0aWYobGlzdFRlbXBbaV0uc2VsZWN0ZWQgfHwgbGxpc3RUZW1wW2ldLnNlY3Rpb24gPT09IHNlY3Rpb24pIHtcclxuXHRcdFx0XHRcdGlmKGZpcnN0SW5kZXggPSAtMSkge1xyXG5cdFx0XHRcdFx0XHRmaXJzdEluZGV4ID0gaTtcclxuXHRcdFx0XHRcdFx0bGlzdFRlbXBbaV0uc2VjdGlvbiA9IHNlY3Rpb247XHJcblx0XHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0XHRtb3ZlSW5kZXggPSBpO1xyXG5cdFx0XHRcdFx0XHRsaXN0VGVtcFttb3ZlSW5kZXhdLnNlY3Rpb24gPSBzZWN0aW9uO1xyXG5cdFx0XHRcdFx0XHRsaXN0VGVtcC5zcGxpY2UoZmlyc3RJbmRleCsxLDAsbGlzdFRlbXAuc3BsaWNlKG1vdmVJbmRleCwxKVswXSk7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHRcdGxGdW5jLkxpc3RzW2xpc3ROYW1lXS5tYWluID0gbGlzdFRlbXA7XHJcblx0XHRcdHJlc2V0T3JkZXIoa2V5LG9yZEtleSxsaXN0TmFtZSxzZWN0aW9uKTtcclxuXHRcdH07XHJcblx0XHRcclxuXHRcdC8vIE1vdmVzIGFuIGl0ZW0gb3IgaXRlbXMuICBDaGVja3MgdGhlIHNlY3Rpb25zIG9mIHRoZSBpdGVtcyB0byBlbnN1cmUgaXRlbXMgd2l0aGluIHNhbWUgc2VjdGlvbiBzdGljayB0b2dldGhlci5cclxuXHRcdHRoaXMubW92ZUl0ZW1zID0gZnVuY3Rpb24oZGlyZWN0aW9uLGtleSxvcmRLZXksbGlzdE5hbWUpIHtcclxuXHRcdFx0dmFyIHNlbFNlY3Rpb24sXHJcblx0XHRcdFx0bGlzdExlbiA9IGxGdW5jLkxpc3RzW2xpc3ROYW1lXS5tYWluLmxlbmd0aCxcclxuXHRcdFx0XHRtdWx0aXBsaWVyLFxyXG5cdFx0XHRcdG5leHRTZWN0aW9uO1xyXG5cdFx0XHR2YXIgaSA9IGRpcmVjdGlvbiA+IDAgPyBsaXN0TGVuIC0gMSA6IDA7XHJcblx0XHRcdC8vIExvb3AgdGhyb3VnaCBtYWluIGxpc3Qgb3Bwb3NpdGUgdGhlIGRpcmVjdGlvbiBvZiB0aGUgbW92ZW1lbnQgb2YgaXRlbXMgdG8gbWFrZSBzdXJlIG9yZGVyIGlzIG90aGVyd2lzZSBwcmVzZXJ2ZWQuXHJcblx0XHRcdGZvcihpOyBpIDwgbGlzdExlbiAmJiBpID49IDA7IGkgPSBpIC0gZGlyZWN0aW9uKSB7XHJcblx0XHRcdFx0bXVsdGlwbGllciA9IDE7XHJcblx0XHRcdFx0Ly8gSWYgdGhlIGl0ZW0gaXMgaW4gdGhlIHNlbGVjdGVkIGxpc3Qgb3IgdGhlIHNlY3Rpb24gaXMgbW92aW5nLlxyXG5cdFx0XHRcdGlmKGxGdW5jLmZpbmRCeUlkKGxGdW5jLkxpc3RzW2xpc3ROYW1lXS5tYWluW2ldW2tleV0sbGlzdE5hbWUsa2V5LCdzZWxlY3RlZCcpICE9PSBmYWxzZSB8fCBsRnVuYy5MaXN0c1tsaXN0TmFtZV0ubWFpbltpXS5zZWN0aW9uID09PSBzZWxTZWN0aW9uKSB7XHJcblx0XHRcdFx0XHQvLyBTZXQgc2VsU2VjdGlvbiB0byBzZWN0aW9uIG9mIGEgc2VsZWN0ZWQgaXRlbS5cclxuXHRcdFx0XHRcdGlmKGxGdW5jLkxpc3RzW2xpc3ROYW1lXS5tYWluW2ldLnNlY3Rpb24gIT09ICcnKSB7XHJcblx0XHRcdFx0XHRcdHNlbFNlY3Rpb24gPSBsRnVuYy5MaXN0c1tsaXN0TmFtZV0ubWFpbltpXS5zZWN0aW9uO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0Ly8gSWYgdGhlIG1vdmVtZW50IHdvdWxkIHB1dCB0aGUgaXRlbSBvdXRzaWRlIG9mIGxpc3QgYm91bmRhcmllcyBvciBhbm90aGVyIHNlbGVjdGlvbiBoYXMgaGl0IHRob3NlIGJvdW5kYXJpZXMgZG9uJ3QgbW92ZS5cclxuXHRcdFx0XHRcdGlmKGkrZGlyZWN0aW9uID49IDAgJiYgaStkaXJlY3Rpb24gPCBsaXN0TGVuICYmICFsRnVuYy5MaXN0c1tsaXN0TmFtZV0ubWFpbltpK2RpcmVjdGlvbl0uc2VsZWN0ZWQpIHtcclxuXHRcdFx0XHRcdFx0Ly8gSWYgdGhlIG5leHQgaXRlbSBpcyBpbiBhIGRlZmluZWQgc2VjdGlvbiwgbmVlZCB0byBjaGVjayAmIGNvdW50IGl0ZW1zIGluIHNlY3Rpb24gdG8ganVtcCBvdmVyIG9yIHN0b3AgbW92ZW1lbnQuXHJcblx0XHRcdFx0XHRcdGlmKGxGdW5jLkxpc3RzW2xpc3ROYW1lXS5tYWluW2krZGlyZWN0aW9uXS5zZWN0aW9uICE9PSAnJyAmJiBsRnVuYy5MaXN0c1tsaXN0TmFtZV0ubWFpbltpXS5zZWN0aW9uICE9PSBsRnVuYy5MaXN0c1tsaXN0TmFtZV0ubWFpbltpK2RpcmVjdGlvbl0uc2VjdGlvbikge1xyXG5cdFx0XHRcdFx0XHRcdG5leHRTZWN0aW9uID0gbEZ1bmMuTGlzdHNbbGlzdE5hbWVdLm1haW5baStkaXJlY3Rpb25dLnNlY3Rpb247XHJcblx0XHRcdFx0XHRcdFx0bXVsdGlwbGllciA9IDA7XHJcblx0XHRcdFx0XHRcdFx0Ly8gTG9vcCBiYWNrIHRocm91Z2ggYXJyYXkgaW4gdGhlIGRpcmVjdGlvbiBvZiBtb3ZlbWVudC5cclxuXHRcdFx0XHRcdFx0XHRmb3IodmFyIGogPSBpICsgZGlyZWN0aW9uOyBqIDwgbGlzdExlbiAmJiBqID49IDA7IGogPSBqICsgZGlyZWN0aW9uKSB7XHJcblx0XHRcdFx0XHRcdFx0XHQvLyBJZiB0aGUgaXRlbSBpcyBpbiB0aGUgc2VjdGlvbi4uLlxyXG5cdFx0XHRcdFx0XHRcdFx0aWYobEZ1bmMuTGlzdHNbbGlzdE5hbWVdLm1haW5bal0uc2VjdGlvbiA9PT0gbmV4dFNlY3Rpb24pIHtcclxuXHRcdFx0XHRcdFx0XHRcdFx0Ly8gSWYgc2VsZWN0ZWQgc3RvcCBtb3ZlbWVudCBhbmQgYnJlYWsuXHJcblx0XHRcdFx0XHRcdFx0XHRcdGlmKGxGdW5jLkxpc3RzW2xpc3ROYW1lXS5tYWluW2pdLnNlbGVjdGVkKSB7XHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0bXVsdGlwbGllciA9IDA7XHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0XHRcdFx0Ly8gSWYgbm90LCBjb3VudCBzZWN0aW9uLlxyXG5cdFx0XHRcdFx0XHRcdFx0XHRtdWx0aXBsaWVyKys7XHJcblx0XHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0XHRcdFx0XHQvLyBCcmVhayBsb29wIGF0IGZpcnN0IGl0ZW0gbm90IGluIHNlY3Rpb24uXHJcblx0XHRcdFx0XHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHQvLyBGaW5hbCBjaGVjazogb25seSBtb3ZlIGFuIGl0ZW0gaWYgaXQgaXMgc2VsZWN0ZWQgb3IgdG8gZW5zdXJlIGl0ZW1zIG9mIHRoZSBzYW1lIHNlY3Rpb24gc3RpY2sgdG9nZXRoZXJcclxuXHRcdFx0XHRcdFx0aWYobEZ1bmMuTGlzdHNbbGlzdE5hbWVdLm1haW5baV0uc2VsZWN0ZWQgfHwgbEZ1bmMuTGlzdHNbbGlzdE5hbWVdLm1haW5baStkaXJlY3Rpb25dLnNlY3Rpb24gIT09IGxGdW5jLkxpc3RzW2xpc3ROYW1lXS5tYWluW2ldLnNlY3Rpb24pIHtcclxuXHRcdFx0XHRcdFx0XHRsRnVuYy5MaXN0c1tsaXN0TmFtZV0ubWFpbi5zcGxpY2UoaSsoZGlyZWN0aW9uKm11bHRpcGxpZXIpLDAsbEZ1bmMuTGlzdHNbbGlzdE5hbWVdLm1haW4uc3BsaWNlKGksMSlbMF0pO1xyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHRcdC8vIFJlc2V0IG9yZGVyIHZhcmlhYmxlIGZvciBkYXRhYmFzZS5cclxuXHRcdFx0cmVzZXRPcmRlcihrZXksb3JkS2V5LGxpc3ROYW1lKTtcclxuXHRcdH07XHJcblx0XHRcclxuXHR9XSk7XHJcbn0pKCk7Il0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
