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
					base:'=?',
					label:'@?'
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
					base:'=?',
					label:'@?'
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
		
		$scope.$watch('items',function(newValue,oldValue) {
			$scope.search.checkboxes = boxSetup(newValue);
		});
		
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImZpbHRlcnMvZmlsdGVyRGlyZWN0aXZlLmpzIiwibGlzdHMvbGlzdERpcmVjdGl2ZS5qcyIsIm92ZXJsYXkvb3ZlcmxheURpcmVjdGl2ZS5qcyIsImZpbHRlcnMvY29tcG9uZW50cy9maWx0ZXJDaGVja2JveENvbXBvbmVudERpcmVjdGl2ZS5qcyIsImZpbHRlcnMvY29tcG9uZW50cy9maWx0ZXJRdWVyeUNvbXBvbmVudERpcmVjdGl2ZS5qcyIsImZpbHRlckNvbnRyb2xsZXIuanMiLCJmaWx0ZXJTZXJ2aWNlLmpzIiwiY29tcG9uZW50cy9maWx0ZXJDb21wb25lbnRDb250cm9sbGVyLmpzIiwib3ZlcmxheUNvbnRyb2xsZXIuanMiLCJsaXN0Q29udHJvbGxlci5qcyIsImxpc3RTZXJ2LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FDSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDaENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDeEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDckJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDM0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2xEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN6REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6InBob3RvLXRvb2xzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCkge1xuXHRhbmd1bGFyLm1vZHVsZSgncGhvdG9FZGl0Q29tcG9uZW50cycsIFsnbGlzdE1vZCcsJ2ZpbHRlck1vZCcsJ292ZXJsYXlNb2QnXSk7XG5cdFxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcblx0XHJcblx0LypcclxuXHRTZWFyY2ggdmFyaWFibGUgc2hvdWxkIGJlIGFuIGFycmF5IG9mIG9iamVjdHMgbmFtZWQgdGhlIHNhbWUgYXMgdGhlIHByb3BlcnRpZXMgb2YgdGhlIG9iamVjdHMgd2l0aGluIHRoZSBsaXN0LlxyXG5cdFx0UmVxdWlyZXMgYSAncXVlcnknIHByb3BlcnR5IHdpdGhpbiBvYmplY3Qgd2hpY2ggaXMgbW9kZWxlZCB0byBhIHRleHQvaW5wdXQgZmlsdGVyLlxyXG5cdFx0SWYgdGhlIHNlYXJjaGVkIHByb3BlcnR5IGlzIGFuIGFycmF5IG9mIG9iamVjdHMgKGlmLCBmb3IgZXhhbXBsZSwgaW1hZ2VzIGNhbiBiZSBpbiBtYW55IGdhbGxlcnkgZ3JvdXBpbmdzKSwgYWRkICdpc0FycmF5JyBwcm9wZXJ0eSBhbmQgc2V0IHRvIHRydWUsIGFsc28gYWRkICdzZWFyY2hPbicgcHJvcGVydHkgYW5kIHNldCB0byB0aGUgbmFtZSBvZiB0aGUgcHJvcGVydHkgd2l0aGluIG9iamVjdHMuXHJcblx0XHRFeGFtcGxlOiBpbWFnZXMgPSBbIHtpbWduYW1lOiAnaW1nMS5qcGcnLCBnYWxsZXJpZXM6IFsgeyBpZDoxLCBuYW1lOidnYWxsZXJ5MScgfSwgeyBpZDoyLCBuYW1lOidnYWxsZXJ5Mid9IF19LCAuLi5dXHJcblx0XHRzZWFyY2ggPSB7IGdhbGxlcmllczogeyBxdWVyeTonJywgaXNBcnJheTogdHJ1ZSwgc2VhcmNoT246ICduYW1lJyB9IH1cclxuXHRcdEZvciBhIGNoZWNrYm94IGZpbHRlciwgaW5jbHVkZSBhbiBvYmplY3QgY2FsbGVkICdjaGVja2JveGVzJyB3aXRoIGEgJ25vbmUnIHByb3BlcnR5IGFuZCBhbGwgcG9zc2libGUgdmFsdWVzIGluIDAtbiBwcm9wZXJ0eS5cclxuXHRcdEJhc2VkIG9uIGFib3ZlIGV4YW1wbGU6IHNlYXJjaCA9IHsgZ2FsbGVyaWVzOiB7IC4uLiBjaGVja2JveGVzOiB7IG5vbmU6IHRydWUsIDA6J2dhbGxlcnkxJywxOidnYWxsZXJ5MicgfSB9XHJcblx0Ki9cclxuXHRcclxuXHRhbmd1bGFyLm1vZHVsZSgnZmlsdGVyTW9kJyxbXSlcclxuXHQuZGlyZWN0aXZlKCdmaWx0ZXJCYXInLCBmdW5jdGlvbigpIHtcclxuXHRcdHJldHVybiB7XHJcblx0XHRcdHNjb3BlOiB7XHJcblx0XHRcdFx0c2VhcmNoOic9JyxcclxuXHRcdFx0XHRmcG9zaXRpb246Jz0/JyxcclxuXHRcdFx0XHRpbmxpbmU6J0A/JyxcclxuXHRcdFx0XHR0bXBsdDonPScsXHJcblx0XHRcdFx0Y2hlY2tpdGVtczonPT8nXHJcblx0XHRcdH0sXHJcblx0XHRcdHRlbXBsYXRlOiAnPGRpdiBuZy1pbmNsdWRlPVwidGVtcGxhdGVVcmxcIj48L2Rpdj4nLFxyXG5cdFx0XHRjb250cm9sbGVyOidmaWx0ZXJCYXJDb250cm9sbGVyJyxcclxuXHRcdFx0Y29udHJvbGxlckFzOidmYmFyJyxcclxuXHRcdFx0bGluazogZnVuY3Rpb24oc2NvcGUsZWxlbWVudCxhdHRycykge1xyXG5cdFx0XHRcdHNjb3BlLnRlbXBsYXRlVXJsID0gc2NvcGUudG1wbHQuYmFzZSArIHNjb3BlLnRtcGx0LmZpbGVOYW1lO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fSlcclxuXHQ7XHJcblx0XHRcclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XG5cdGFuZ3VsYXIubW9kdWxlKCdsaXN0TW9kJyxbXSlcblx0LmRpcmVjdGl2ZSgnbGlzdE9mSXRlbXMnLGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiB7XG5cdFx0XHRzY29wZToge1xuXHRcdFx0XHRzZWFyY2g6Jz0nLFxuXHRcdFx0XHRsaXN0TmFtZTonPWxpc3QnLFxuXHRcdFx0XHRrZXlOYW1lOidAa2V5Jyxcblx0XHRcdFx0b3JkS2V5OidAb3JkbmFtZScsXG5cdFx0XHRcdC8vIEFkZGl0aW9uYWwgZnVuY3Rpb25zIHRvIGJlIGNhbGxlZCBmcm9tIGJ1dHRvbnMgaW4gdGhlIGxpc3QgKHNhdmUgaW5mbywgZGVsZXRlLCBldGMpXG5cdFx0XHRcdGFkZEZ1bmNzOic9ZnVuY3MnLFxuXHRcdFx0XHR0bXBsdDonPSdcblx0XHRcdH0sXG5cdFx0XHR0ZW1wbGF0ZTogJzxkaXYgbmctaW5jbHVkZT1cInRlbXBsYXRlVXJsXCI+PC9kaXY+Jyxcblx0XHRcdGNvbnRyb2xsZXI6J2xpc3RDb250cm9sbGVyJyxcblx0XHRcdGNvbnRyb2xsZXJBczonbGlzdCcsXG5cdFx0XHRsaW5rOiBmdW5jdGlvbihzY29wZSxlbGVtZW50LGF0dHJzKSB7XG5cdFx0XHRcdHNjb3BlLnRlbXBsYXRlVXJsID0gc2NvcGUudG1wbHQuYmFzZSArIHNjb3BlLnRtcGx0LmZpbGVOYW1lO1xuXHRcdFx0fVxuXHRcdH1cblx0fSlcblx0O1xufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcblx0XHJcblx0YW5ndWxhci5tb2R1bGUoJ292ZXJsYXlNb2QnLFtdKVxyXG5cdC5kaXJlY3RpdmUoJ292ZXJsYXknLCBmdW5jdGlvbigpIHtcclxuXHRcdHJldHVybiB7XHJcblx0XHRcdHNjb3BlOiB7XHJcblx0XHRcdFx0bWVzc2FnZTonPScsXHJcblx0XHRcdFx0bWVzc2FnZU51bTonPW51bWJlcicsXHJcblx0XHRcdFx0YnRuQ29uZmlnOic9Y2ZnJyxcclxuXHRcdFx0XHQvLyBGdW5jdGlvbiBmb3IgYWN0aW9uIG9mIG92ZXJsYXkgKGNhbmNlbC9iYWNrIGlzIGluIGNvbnRyb2xsZXIpXHJcblx0XHRcdFx0ZG9BY3Rpb246Jz1mdW5jJyxcclxuXHRcdFx0XHRiYXNlOidAPydcclxuXHRcdFx0fSxcclxuXHRcdFx0Y29udHJvbGxlcjonb3ZlcmxheUNvbnRyb2xsZXInLFxyXG5cdFx0XHRjb250cm9sbGVyQXM6J292ZXInLFxyXG5cdFx0XHR0ZW1wbGF0ZTogJzxkaXYgbmctaW5jbHVkZT1cInRlbXBsYXRlVXJsXCI+PC9kaXY+JyxcclxuXHRcdFx0bGluazogZnVuY3Rpb24oc2NvcGUsZWxlbWVudCxhdHRycykge1xyXG5cdFx0XHRcdC8vIElmIG5vIGJhc2UgaXMgc3BlY2lmaWVkLCB1c2UgbG9jYXRpb24gaWYgaW5zdGFsbGVkIHZpYSBib3dlci5cclxuXHRcdFx0XHRpZih0eXBlb2Ygc2NvcGUuYmFzZSA9PT0gJ3VuZGVmaW5lZCcpIHtcclxuXHRcdFx0XHRcdHNjb3BlLmJhc2UgPSAnL2Jvd2VyX2NvbXBvbmVudHMvUGhvdG9ncmFwaHktU2V0dXAtU3VpdGUvdGVtcGxhdGVzL292ZXJsYXkvJztcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0c2NvcGUudGVtcGxhdGVVcmwgPSBzY29wZS5iYXNlICsgJ292ZXJsYXkuaHRtbCc7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9KVxyXG5cdDtcclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcblx0XHJcblx0YW5ndWxhci5tb2R1bGUoJ2ZpbHRlck1vZCcpXHJcblx0LmRpcmVjdGl2ZSgnZmlsdGVyQ2hlY2tib3gnLCBmdW5jdGlvbigpIHtcclxuXHRcdFx0cmV0dXJuIHtcclxuXHRcdFx0XHRzY29wZToge1xyXG5cdFx0XHRcdFx0aXRlbXM6Jz0nLFxyXG5cdFx0XHRcdFx0c2VhcmNoOic9JyxcclxuXHRcdFx0XHRcdGJhc2U6Jz0/JyxcclxuXHRcdFx0XHRcdGxhYmVsOidAPydcclxuXHRcdFx0XHR9LFxyXG5cdFx0XHRcdGNvbnRyb2xsZXI6J2ZpbHRlckNvbXBDb250cm9sbGVyJyxcclxuXHRcdFx0XHRjb250cm9sbGVyQXM6J2Zjb21wJyxcclxuXHRcdFx0XHR0ZW1wbGF0ZTogJzxkaXYgbmctaW5jbHVkZT1cInRlbXBsYXRlVXJsXCI+PC9kaXY+JyxcclxuXHRcdFx0XHRsaW5rOiBmdW5jdGlvbihzY29wZSxlbGVtZW50LGF0dHJzKSB7XHJcblx0XHRcdFx0XHQvLyBJZiBubyBiYXNlIGlzIHNwZWNpZmllZCwgdXNlIGxvY2F0aW9uIGlmIGluc3RhbGxlZCB2aWEgYm93ZXIuXHJcblx0XHRcdFx0XHRpZih0eXBlb2Ygc2NvcGUuYmFzZSA9PT0gJ3VuZGVmaW5lZCcpIHtcclxuXHRcdFx0XHRcdFx0c2NvcGUuYmFzZSA9ICcvYm93ZXJfY29tcG9uZW50cy9QaG90b2dyYXBoeS1TZXR1cC1TdWl0ZS90ZW1wbGF0ZXMvZmlsdGVycy8nO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0c2NvcGUudGVtcGxhdGVVcmwgPSBzY29wZS5iYXNlICsgJ2ZpbHRlckNoZWNrYm94ZXMuaHRtbCc7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9KVxyXG5cdDtcclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcblx0XHJcblx0YW5ndWxhci5tb2R1bGUoJ2ZpbHRlck1vZCcpXHJcblx0LmRpcmVjdGl2ZSgnZmlsdGVyUXVlcnknLCBmdW5jdGlvbigpIHtcclxuXHRcdFx0cmV0dXJuIHtcclxuXHRcdFx0XHRzY29wZToge1xyXG5cdFx0XHRcdFx0c2VhcmNoOic9JyxcclxuXHRcdFx0XHRcdGJhc2U6Jz0/JyxcclxuXHRcdFx0XHRcdGxhYmVsOidAPydcclxuXHRcdFx0XHR9LFxyXG5cdFx0XHRcdHRlbXBsYXRlOiAnPGRpdiBuZy1pbmNsdWRlPVwidGVtcGxhdGVVcmxcIj48L2Rpdj4nLFxyXG5cdFx0XHRcdGxpbms6IGZ1bmN0aW9uKHNjb3BlLGVsZW1lbnQsYXR0cnMpIHtcclxuXHRcdFx0XHRcdC8vIElmIG5vIGJhc2UgaXMgc3BlY2lmaWVkLCB1c2UgbG9jYXRpb24gaWYgaW5zdGFsbGVkIHZpYSBib3dlci5cclxuXHRcdFx0XHRcdGlmKHR5cGVvZiBzY29wZS5iYXNlID09PSAndW5kZWZpbmVkJykge1xyXG5cdFx0XHRcdFx0XHRzY29wZS5iYXNlID0gJy9ib3dlcl9jb21wb25lbnRzL1Bob3RvZ3JhcGh5LVNldHVwLVN1aXRlL3RlbXBsYXRlcy9maWx0ZXJzLyc7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRzY29wZS50ZW1wbGF0ZVVybCA9IHNjb3BlLmJhc2UgKyAnZmlsdGVyUXVlcnkuaHRtbCc7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9KVxyXG5cdDtcclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcblx0XHJcblx0YW5ndWxhci5tb2R1bGUoJ2ZpbHRlck1vZCcpXHJcblx0LmNvbnRyb2xsZXIoJ2ZpbHRlckJhckNvbnRyb2xsZXInLCBbJyRzY29wZScsIGZ1bmN0aW9uKCRzY29wZSkge1xyXG5cdFx0XHRcclxuXHRcdFx0dGhpcy5nYWxsZXJpZXMgPSBbXTtcclxuXHRcdFx0XHJcblx0XHRcdC8vIFRvZ2dsZXMgdGhlIHBvc2l0aW9uIG9mIHRoZSBsZWZ0IHNpZGUgZmlsdGVyIGNvbHVtblxyXG5cdFx0XHR0aGlzLmZpbHRlclRvZ2dsZSA9IGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdHZhciBmUG9zID0gJHNjb3BlLmZwb3NpdGlvbjtcclxuXHRcdFx0XHQkc2NvcGUuZnBvc2l0aW9uID0gKGZQb3MgPT09IDAgPyAtMTkwIDogMCk7XHJcblx0XHRcdH07XHJcblx0XHRcdFxyXG5cdFx0XHR2YXIgZkN0cmwgPSB0aGlzO1xyXG5cdFx0XHRcclxuXHRcdH1dKVxyXG5cdDtcclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcblx0XHJcblx0YW5ndWxhci5tb2R1bGUoJ2ZpbHRlck1vZCcpXHJcblx0LnNlcnZpY2UoJ2ZpbHRlckZ1bmN0aW9ucycsIGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcclxuXHRcdHZhciBmRnVuY3Rpb25zID0gdGhpcztcclxuXHRcdFxyXG5cdFx0Ly8gQ2hlY2tzIGZvciBhIG1hdGNoIHdpdGggdGhlIGZpbHRlcnMuXHJcblx0XHQvLyBJZiB0aGUgdmFsdWUgaXMgYW4gYXJyYXksIGNoZWNrcyBhbGwgdmFsdWVzIGZvciBvbmUgbWF0Y2guXHJcblx0XHQvLyBJZiBub3QsIGp1c3QgY2hlY2tzIHNpbmdsZSB2YWx1ZS5cclxuXHRcdHRoaXMuZmlsdGVyQ2hlY2sgPSBmdW5jdGlvbih2YWx1ZSxzZWFyY2gpIHtcclxuXHRcdFx0dmFyIGFsbE1hdGNoID0gdHJ1ZTtcclxuXHRcdFx0XHJcblx0XHRcdGZvcih2YXIga2V5IGluIHNlYXJjaCkge1xyXG5cdFx0XHRcdGlmKHNlYXJjaC5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XHJcblx0XHRcdFx0XHR2YXIgdGhpc1ZhbHVlID0gdmFsdWVba2V5XTtcclxuXHRcdFx0XHRcdGlmKHNlYXJjaFtrZXldLmlzQXJyYXkpIHtcclxuXHRcdFx0XHRcdFx0dmFyIG51bVZhbHVlcyA9IHRoaXNWYWx1ZS5sZW5ndGgsXHJcblx0XHRcdFx0XHRcdFx0bWF0Y2hGb3VuZCA9IGZhbHNlO1xyXG5cdFx0XHRcdFx0XHRmb3IodmFyIGkgPSAwOyBpIDwgbnVtVmFsdWVzOyBpKyspIHtcclxuXHRcdFx0XHRcdFx0XHRpZihjaGVja1ZhbHVlKHRoaXNWYWx1ZVtpXSwgc2VhcmNoLCBrZXkpKSB7XHJcblx0XHRcdFx0XHRcdFx0XHRtYXRjaEZvdW5kID0gdHJ1ZTtcclxuXHRcdFx0XHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRpZighbWF0Y2hGb3VuZCkge1xyXG5cdFx0XHRcdFx0XHRcdGFsbE1hdGNoID0gZmFsc2U7XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRcdGFsbE1hdGNoID0gY2hlY2tWYWx1ZSh0aGlzVmFsdWUsIHNlYXJjaCwga2V5KTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdGlmKGFsbE1hdGNoID09PSBmYWxzZSkge1xyXG5cdFx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdFx0XHJcblx0XHRcdHJldHVybiBhbGxNYXRjaDtcclxuXHRcdFx0XHJcblx0XHR9O1xyXG5cdFx0XHJcblx0XHQvLyBGdW5jdGlvbiB0aGF0IGNoZWNrcyB2YWx1ZSBhZ2FpbnN0IHRoZSBxdWVyeSBmaWx0ZXIgJiBjaGVja2JveGVzXHJcblx0XHR2YXIgY2hlY2tWYWx1ZSA9IGZ1bmN0aW9uKHZhbHVlLCBzZWFyY2gsIGtleSkge1xyXG5cdFx0XHRcclxuXHRcdFx0dmFyIGNoZWNrTWF0Y2ggPSB0cnVlLFxyXG5cdFx0XHRcdHZhbHVlTWF0Y2ggPSBmYWxzZSxcclxuXHRcdFx0XHRjaGVja2JveGVzID0gc2VhcmNoW2tleV0uY2hlY2tib3hlcyxcclxuXHRcdFx0XHRzZWFyY2hPbiA9IHNlYXJjaFtrZXldLnNlYXJjaE9uO1xyXG5cdFx0XHRcdFxyXG5cdFx0XHRpZihzZWFyY2hPbiAmJiB2YWx1ZSkge1xyXG5cdFx0XHRcdHZhciB0aGlzVmFsdWUgPSB2YWx1ZVtzZWFyY2hPbl07XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0dmFyIHRoaXNWYWx1ZSA9IHZhbHVlO1xyXG5cdFx0XHR9XHJcblx0XHRcdGlmKGNoZWNrYm94ZXMpIHtcclxuXHRcdFx0XHRjaGVja01hdGNoID0gY2hlY2tUaGVCb3hlcyh0aGlzVmFsdWUsa2V5LGNoZWNrYm94ZXMpO1xyXG5cdFx0XHR9XHJcblx0XHRcdHZhbHVlTWF0Y2ggPSBmRnVuY3Rpb25zLnF1ZXJ5RmlsdGVyQ2hlY2sodGhpc1ZhbHVlLHNlYXJjaFtrZXldLnF1ZXJ5KTtcclxuXHRcdFx0XHJcblx0XHRcdHJldHVybiBjaGVja01hdGNoICYmIHZhbHVlTWF0Y2g7XHJcblx0XHR9O1xyXG5cdFx0XHJcblx0XHQvLyBDaGVja3MgcXVlcnkgdmFsdWUgYWdhaW5zdCBhY3R1YWwuICBBbHNvIHVzZWQgdG8gaGlkZS9zaG93IGNoZWNrYm94ZXMgYmFzZWQgb24gdGhlIHR5cGVkIGZpbHRlci5cclxuXHRcdHRoaXMucXVlcnlGaWx0ZXJDaGVjayA9IGZ1bmN0aW9uKHZhbHVlLHF1ZXJ5KSB7XHJcblx0XHRcdGlmKCF2YWx1ZSkge1xyXG5cdFx0XHRcdHZhbHVlID0gJyc7XHJcblx0XHRcdH1cclxuXHRcdFx0cmV0dXJuIHZhbHVlLnRvTG93ZXJDYXNlKCkuaW5kZXhPZihxdWVyeS50b0xvd2VyQ2FzZSgpKSA+IC0xO1xyXG5cdFx0fTtcclxuXHRcdFxyXG5cdFx0Ly8gRnVuY3Rpb24gdG8gbG9vcCB0aHJvdWdoIHRoZSBjaGVja2JveGVzIHZhcmlhYmxlIGFuZCByZXR1cm4gdHJ1ZSBpZiB0aGUgdmFsdWUgaXMgYSBtYXRjaFxyXG5cdFx0dmFyIGNoZWNrVGhlQm94ZXMgPSBmdW5jdGlvbiAodmFsdWUsZmlsdGVyc2V0LGNoZWNrYm94ZXMpIHtcclxuXHRcdFx0aWYodmFsdWUpIHtcclxuXHRcdFx0XHR2YXIgaSA9IDA7XHJcblx0XHRcdFx0ZG8ge1xyXG5cdFx0XHRcdFx0aWYodmFsdWUgPT09IGNoZWNrYm94ZXNbaV0pIHtcclxuXHRcdFx0XHRcdFx0cmV0dXJuIHRydWU7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRpKys7XHJcblx0XHRcdFx0fSB3aGlsZSh0eXBlb2YgY2hlY2tib3hlc1tpXSAhPT0gJ3VuZGVmaW5lZCcpXHJcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdGlmKGNoZWNrYm94ZXNbJ25vbmUnXSkge1xyXG5cdFx0XHRcdFx0cmV0dXJuIHRydWU7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdFx0fVxyXG5cdFx0fTtcclxuXHRcdFxyXG5cdH0pXHJcblx0O1xyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuXHRcclxuXHRhbmd1bGFyLm1vZHVsZSgnZmlsdGVyTW9kJylcclxuXHQuY29udHJvbGxlcignZmlsdGVyQ29tcENvbnRyb2xsZXInLCBbJyRzY29wZScsJ2ZpbHRlckZ1bmN0aW9ucycsIGZ1bmN0aW9uKCRzY29wZSxmaWx0ZXJGdW5jdGlvbnMpIHtcclxuXHRcdFxyXG5cdFx0dmFyIGJveFNldHVwID0gZnVuY3Rpb24gKGl0ZW1zKSB7XHJcblx0XHRcdFxyXG5cdFx0XHR2YXIgY2hlY2tib3hlcyA9IHtub25lOnRydWV9O1xyXG5cdFx0XHRcclxuXHRcdFx0Zm9yKHZhciBpID0gMDsgaSA8IGl0ZW1zLmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdFx0Y2hlY2tib3hlc1tpXSA9IGl0ZW1zW2ldO1xyXG5cdFx0XHR9XHJcblx0XHRcdFxyXG5cdFx0XHRyZXR1cm4gY2hlY2tib3hlcztcclxuXHRcdFx0XHJcblx0XHR9O1xyXG5cdFx0XHJcblx0XHQkc2NvcGUuc2VhcmNoLmNoZWNrYm94ZXMgPSBib3hTZXR1cCgkc2NvcGUuaXRlbXMpO1xyXG5cdFx0XHJcblx0XHQkc2NvcGUuJHdhdGNoKCdpdGVtcycsZnVuY3Rpb24obmV3VmFsdWUsb2xkVmFsdWUpIHtcclxuXHRcdFx0JHNjb3BlLnNlYXJjaC5jaGVja2JveGVzID0gYm94U2V0dXAobmV3VmFsdWUpO1xyXG5cdFx0fSk7XHJcblx0XHRcclxuXHRcdHRoaXMub25seUJveCA9IGZ1bmN0aW9uKGJveE51bSxib3hOYW1lKSB7XHJcblx0XHRcdHZhciBpID0gMDtcclxuXHRcdFx0ZG8ge1xyXG5cdFx0XHRcdCRzY29wZS5zZWFyY2guY2hlY2tib3hlc1tpXSA9IGZhbHNlO1x0XHRcdFx0XHRcclxuXHRcdFx0XHRpKys7XHJcblx0XHRcdH0gd2hpbGUodHlwZW9mICRzY29wZS5zZWFyY2guY2hlY2tib3hlc1tpXSAhPT0gJ3VuZGVmaW5lZCcpXHJcblx0XHRcdGlmKGJveE51bSA9PT0gJ25vbmUnKSB7XHJcblx0XHRcdFx0JHNjb3BlLnNlYXJjaC5jaGVja2JveGVzWydub25lJ10gPSB0cnVlO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdCRzY29wZS5zZWFyY2guY2hlY2tib3hlc1tib3hOdW1dID0gYm94TmFtZTtcclxuXHRcdFx0XHQkc2NvcGUuc2VhcmNoLmNoZWNrYm94ZXNbJ25vbmUnXSA9IGZhbHNlO1xyXG5cdFx0XHR9XHJcblx0XHR9O1xyXG5cdFx0XHJcblx0XHR0aGlzLmFsbEJveGVzID0gZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRmb3IodmFyIGkgPSAwOyBpIDwgJHNjb3BlLml0ZW1zLmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdFx0JHNjb3BlLnNlYXJjaC5jaGVja2JveGVzW2ldID0gJHNjb3BlLml0ZW1zW2ldO1xyXG5cdFx0XHR9XHJcblx0XHRcdCRzY29wZS5zZWFyY2guY2hlY2tib3hlc1snbm9uZSddID0gdHJ1ZTtcclxuXHRcdH07XHJcblx0XHRcclxuXHRcdHRoaXMuc2hvd0NoZWNrYm94ID0gZnVuY3Rpb24gKHZhbHVlLHF1ZXJ5KSB7XHJcblx0XHRcdHJldHVybiBmaWx0ZXJGdW5jdGlvbnMucXVlcnlGaWx0ZXJDaGVjayh2YWx1ZSxxdWVyeSk7XHJcblx0XHR9O1x0XHJcblx0XHRcclxuXHR9XSlcclxuXHQ7XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG5cdFxyXG5cdGFuZ3VsYXIubW9kdWxlKCdvdmVybGF5TW9kJylcclxuXHRcdC5jb250cm9sbGVyKCdvdmVybGF5Q29udHJvbGxlcicsIFsnJHNjb3BlJyxmdW5jdGlvbigkc2NvcGUpIHtcclxuXHRcdFx0XHJcblx0XHRcdHRoaXMuY2FuY2VsQWN0aW9uID0gZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0JHNjb3BlLm1lc3NhZ2VOdW0gPSAwO1xyXG5cdFx0XHR9O1xyXG5cdFx0XHRcclxuXHRcdH1dKVxyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuXHRhbmd1bGFyLm1vZHVsZSgnbGlzdE1vZCcpXHJcblx0LmNvbnRyb2xsZXIoJ2xpc3RDb250cm9sbGVyJyxbJyRzY29wZScsJyRyb290U2NvcGUnLCdsaXN0RnVuY3Rpb25zJyxmdW5jdGlvbigkc2NvcGUsJHJvb3RTY29wZSxsaXN0RnVuY3Rpb25zKSB7XHJcblx0XHRcclxuXHRcdHZhciBsQ3RybCA9IHRoaXMsXHJcblx0XHRcdGtleSA9ICRzY29wZS5rZXlOYW1lLFxyXG5cdFx0XHRvcmRLZXkgPSAkc2NvcGUub3JkTmFtZSxcclxuXHRcdFx0bGlzdE5hbWUgPSAkc2NvcGUubGlzdE5hbWU7XHJcblx0XHRcclxuXHRcdC8vIFNldHMgc2VsZWN0ZWRMaXN0IGFzIGVtcHR5IGFycmF5IGZvciB0aGlzIGxpc3QgbnVtYmVyLlxyXG5cdFx0bGlzdEZ1bmN0aW9ucy5jbGVhclNlbGVjdGVkKGxpc3ROYW1lKTtcclxuXHRcdHRoaXMuaGlkZU92ZXJsYXkgPSB0cnVlO1xyXG5cdFx0XHJcblx0XHR0aGlzLmxGdW5jID0gbGlzdEZ1bmN0aW9ucztcclxuXHRcdHRoaXMubmV3U2VjdGlvbiA9ICcnO1xyXG5cdFx0dGhpcy5jdXJyZW50U2VjdGlvbiA9IHtzZWN0aW9uOicnLGlkOjB9O1xyXG5cdFx0dGhpcy5vcmRlclNhdmVQZW5kaW5nID0gZmFsc2U7XHJcblx0XHRcclxuXHRcdC8vIFRvZ2dsZSBzZWxlY3Rpb24gb2YgaXRlbSAtIGNoYW5nZXMgc2VsZWN0IHByb3BlcnR5IG9mIGl0ZW0gYmV0d2VlbiB0cnVlL2ZhbHNlIGFuZCBhZGRzL3JlbW92ZXMgZnJvbSBzZWxlY3Rpb24gYXJyYXkgKHNlZSBsaXN0U2Vydi5qcyBmb3IgZnVuY3Rpb24pXHJcblx0XHR0aGlzLnRvZ2dsZVNlbGVjdCA9IGZ1bmN0aW9uKGl0ZW0saW5kZXgpIHtcclxuXHRcdFx0bGlzdEZ1bmN0aW9ucy50b2dnbGVTZWxlY3QoaXRlbSxpbmRleCxrZXksbGlzdE5hbWUpO1x0XHRcclxuXHRcdH07XHJcblx0XHRcclxuXHRcdC8vIEN1c3RvbSBmaWx0ZXIgZnVuY3Rpb24gY2hlY2tpbmcgaXRlbSBmaXJzdCBhZ2FpbnN0IGEgbGlzdCBvZiBleGNsdXNpb25zIHRoZW4gYWdhaW5zdCBjdXN0b20gZmlsdGVyIHZhbHVlc1xyXG5cdFx0dGhpcy5maWx0ZXJDaGVjayA9IGZ1bmN0aW9uKHZhbHVlLGluZGV4LGFycmF5KSB7XHJcblx0XHRcdHJldHVybiBsaXN0RnVuY3Rpb25zLmZpbHRlckNoZWNrKHZhbHVlLGluZGV4LCRzY29wZS5zZWFyY2gsa2V5LGxpc3ROYW1lKTtcclxuXHRcdH07XHJcblx0XHRcclxuXHRcdC8vIFJldHVybnMgdGhlIGxlbmd0aCBhIGxpc3QgKG1haW4gbGlzdCBpZiBub3Qgc3BlY2lmaWVkKS5cclxuXHRcdHRoaXMuZ2V0TGVuZ3RoID0gZnVuY3Rpb24obGlzdE5hbWUsc3ViTGlzdCkge1xyXG5cdFx0XHRpZighc3ViTGlzdCkge1xyXG5cdFx0XHRcdHN1Ykxpc3QgPSAnbWFpbic7XHJcblx0XHRcdH1cclxuXHRcdFx0cmV0dXJuIGxpc3RGdW5jdGlvbnMuTGlzdHNbbGlzdE5hbWVdW3N1Ykxpc3RdLmxlbmd0aDtcclxuXHRcdH07XHJcblx0XHRcclxuXHRcdC8vIENoYW5nZSBvcmRlciBvZiBsaXN0LlxyXG5cdFx0dGhpcy5tb3ZlSXRlbXMgPSBmdW5jdGlvbihkaXJlY3Rpb24pIHtcclxuXHRcdFx0bGlzdEZ1bmN0aW9ucy5tb3ZlSXRlbXMoZGlyZWN0aW9uLGtleSxvcmRLZXksbGlzdE5hbWUpO1xyXG5cdFx0XHR0aGlzLm9yZGVyU2F2ZVBlbmRpbmcgPSB0cnVlO1xyXG5cdFx0fTtcclxuXHRcdFxyXG5cdFx0dGhpcy5jaGVja1NlbGVjdGVkID0gZnVuY3Rpb24oKSB7XHJcblx0XHRcdHJldHVybiBsaXN0RnVuY3Rpb25zLmNoZWNrU2VsZWN0ZWQobGlzdE5hbWUpO1xyXG5cdFx0fTtcclxuXHRcdFxyXG5cdFx0dGhpcy5zZWxlY3RBbGwgPSBmdW5jdGlvbigpIHtcclxuXHRcdFx0bGlzdEZ1bmN0aW9ucy5zZWxlY3RBbGwoa2V5LGxpc3ROYW1lKTtcclxuXHRcdH07XHJcblx0XHRcclxuXHRcdHRoaXMuZGVzZWxlY3RBbGwgPSBmdW5jdGlvbigpIHtcclxuXHRcdFx0bGlzdEZ1bmN0aW9ucy5kZXNlbGVjdEFsbChrZXksbGlzdE5hbWUpO1xyXG5cdFx0fTtcclxuXHRcdFxyXG5cdH1dKVxyXG5cdFxyXG5cdDtcclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcblx0YW5ndWxhci5tb2R1bGUoJ2xpc3RNb2QnKVxyXG5cdC5zZXJ2aWNlKCdsaXN0RnVuY3Rpb25zJywgWyckcScsJ2ZpbHRlckZ1bmN0aW9ucycsZnVuY3Rpb24gKCRxLGZpbHRlckZ1bmN0aW9ucykge1xyXG5cdFx0XHJcblx0XHR2YXIgbEZ1bmMgPSB0aGlzLFxyXG5cdFx0XHRlZGl0TGlzdCA9IFtdLFxyXG5cdFx0XHRjdXJyZW50RmlsdGVyZWRMaXN0ID0gW107XHJcblx0XHRcclxuXHRcdHRoaXMuTGlzdHMgPSB7fTtcclxuXHRcdHRoaXMuc2VjdGlvbkxpc3QgPSBbe3NlY3Rpb246JycsaWQ6MH1dO1xyXG5cdFx0XHJcblx0XHR0aGlzLnNldExpc3QgPSBmdW5jdGlvbihsaXN0QXJyYXksbGlzdE5hbWUsZXhjbHVkZUFycmF5KSB7XHJcblx0XHRcdHRoaXMuTGlzdHNbbGlzdE5hbWVdID0geyBtYWluOmxpc3RBcnJheSxzZWxlY3RlZDpbXSxlZGl0OltdLGZpbHRlcmVkOltdLGV4Y2x1ZGU6ZXhjbHVkZUFycmF5IH07XHJcblx0XHR9O1xyXG5cdFx0XHJcblx0XHR0aGlzLmNsZWFyU2VsZWN0ZWQgPSBmdW5jdGlvbihsaXN0TmFtZSkge1xyXG5cdFx0XHR0aGlzLkxpc3RzW2xpc3ROYW1lXS5zZWxlY3RlZCA9IFtdO1xyXG5cdFx0fTtcclxuXHRcdFxyXG5cdFx0dGhpcy5jaGVja1NlbGVjdGVkID0gZnVuY3Rpb24obGlzdE5hbWUpIHtcclxuXHRcdFx0cmV0dXJuIHRoaXMuTGlzdHNbbGlzdE5hbWVdLnNlbGVjdGVkLmxlbmd0aCA9PT0gMDtcclxuXHRcdH07XHJcblx0XHRcclxuXHRcdHRoaXMubGlzdExlbmd0aCA9IGZ1bmN0aW9uKGxpc3ROYW1lLHN1Ykxpc3QpIHtcclxuXHRcdFx0c3ViTGlzdCA9IHR5cGVvZiBzdWJMaXN0ICE9PSAndW5kZWZpbmVkJyA/IHN1Ykxpc3QgOiAnbWFpbic7XHJcblx0XHRcdGlmKHRoaXMuTGlzdHNbbGlzdE5hbWVdKSB7XHJcblx0XHRcdFx0cmV0dXJuIHRoaXMuTGlzdHNbbGlzdE5hbWVdW3N1Ykxpc3RdLmxlbmd0aDtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRyZXR1cm4gMDtcclxuXHRcdFx0fVxyXG5cdFx0fTtcclxuXHRcdFxyXG5cdFx0Ly8gRmlyc3QgY2hlY2tzIGV4Y2x1ZGUgYXJyYXkgZm9yIGl0ZW0sIHRoZW4gY2hlY2tzIHNlYXJjaCB2YWx1ZSAoc2VlIGZpbHRlclNlcnZpY2UuanMpXHJcblx0XHR0aGlzLmZpbHRlckNoZWNrID0gZnVuY3Rpb24odmFsdWUsaW5kZXgsc2VhcmNoLGtleU5hbWUsbGlzdE5hbWUpIHtcclxuXHRcdFx0dmFyIGxpc3RDaGVjayA9IGZhbHNlLFxyXG5cdFx0XHRcdHNob3dJdGVtID0gZmFsc2U7XHJcblx0XHRcdGxpc3RDaGVjayA9IGxGdW5jLmZpbmRCeUlkKHZhbHVlW2tleU5hbWVdLGxpc3ROYW1lLGtleU5hbWUsJ2V4Y2x1ZGUnKTtcclxuXHRcdFx0aWYobGlzdENoZWNrID09PSBmYWxzZSkge1xyXG5cdFx0XHRcdHNob3dJdGVtID0gZmlsdGVyRnVuY3Rpb25zLmZpbHRlckNoZWNrKHZhbHVlLHNlYXJjaCk7XHJcblx0XHRcdFx0Ly8gRGVzZWxlY3QgaXRlbSBpZiB0aGUgZmlsdGVyIGV4Y2x1ZGVzIHRoZSBpdGVtXHJcblx0XHRcdFx0aWYodmFsdWUuc2VsZWN0ZWQgJiYgIXNob3dJdGVtICYmIGluZGV4ID49IDApIHtcclxuXHRcdFx0XHRcdGxGdW5jLmRlc2VsZWN0SXRlbSh2YWx1ZVtrZXlOYW1lXSxpbmRleCxrZXlOYW1lLGxpc3ROYW1lKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdFx0bEZ1bmMuc2V0RmlsdGVyZWQobGlzdE5hbWUsaW5kZXgsc2hvd0l0ZW0pO1xyXG5cdFx0XHRyZXR1cm4gc2hvd0l0ZW07XHJcblx0XHR9O1xyXG5cdFx0XHJcblx0XHQvLyBBZGRzIHByb3BlcnR5IHdpdGggZmlsdGVyIHN0YXR1cyBvZiBlbGVtZW50XHJcblx0XHR0aGlzLnNldEZpbHRlcmVkID0gZnVuY3Rpb24obGlzdE5hbWUsaW5kZXgsc2hvdykge1xyXG5cdFx0XHR0aGlzLkxpc3RzW2xpc3ROYW1lXS5tYWluW2luZGV4XS5zaG93SXRlbSA9IHNob3c7XHJcblx0XHR9O1xyXG5cdFx0XHJcblx0XHQvLyBDcmVhdGVzIGEgbGlzdCBvZiBvbmx5IHRoZSBjdXJyZW50bHkgZmlsdGVyZWQgZWxlbWVudHMgb2YgdGhlIG1haW4gYXJyYXkuIFJldHVybnMgdGhpcyBmaWx0ZXJlZCBhcnJheS5cclxuXHRcdHRoaXMuc2V0RmlsdGVyQXJyYXkgPSBmdW5jdGlvbihsaXN0TmFtZSkge1xyXG5cdFx0XHR2YXIgbWFpbkFycmF5ID0gdGhpcy5MaXN0c1tsaXN0TmFtZV0ubWFpbjtcclxuXHRcdFx0Zm9yKHZhciBpID0gMDsgaSA8IG1haW5BcnJheS5sZW5ndGg7IGkrKykge1xyXG5cdFx0XHRcdGlmKG1haW5BcnJheVtpXS5zaG93SXRlbSA9PT0gdHJ1ZSkge1xyXG5cdFx0XHRcdFx0dGhpcy5MaXN0c1tsaXN0TmFtZV0uZmlsdGVyZWQucHVzaChtYWluQXJyYXlbaV0pO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0XHRyZXR1cm4gdGhpcy5MaXN0c1tsaXN0TmFtZV0uZmlsdGVyZWQ7XHJcblx0XHR9O1xyXG5cdFx0XHJcblx0XHR0aGlzLnRvZ2dsZVNlbGVjdCA9IGZ1bmN0aW9uKGl0ZW0saW5kZXgsa2V5LGxpc3ROYW1lKSB7XHJcblx0XHRcdGtleSA9IGtleSA/IGtleSA6ICdpZCc7XHJcblx0XHRcdHZhciBpZCA9IGl0ZW1ba2V5XTtcclxuXHRcdFx0aWYoIWluZGV4ICYmIGluZGV4ICE9PSAwKSB7XHJcblx0XHRcdFx0aW5kZXggPSB0aGlzLmZpbmRCeUlkKGlkLGxpc3ROYW1lLGtleSwnbWFpbicpO1xyXG5cdFx0XHR9XHJcblx0XHRcdGlmKCFpdGVtLnNlbGVjdGVkKSB7XHJcblx0XHRcdFx0dGhpcy5zZWxlY3RJdGVtKGl0ZW0saW5kZXgsa2V5LGxpc3ROYW1lKTtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHR0aGlzLmRlc2VsZWN0SXRlbShpZCxpbmRleCxrZXksbGlzdE5hbWUpO1xyXG5cdFx0XHR9XHJcblx0XHR9O1xyXG5cclxuXHRcdC8vIEZ1bmN0aW9uIHRvIGNyZWF0ZSBhIGNvbW1hIHNlcGFyYXRlZCBsaXN0IG9mIGEgcGFydGljdWxhciBwcm9wZXJ0eSB3aXRoaW4gYW4gYXJyYXkgXHJcblx0XHR0aGlzLm1ha2VMaXN0ID0gZnVuY3Rpb24obGlzdE5hbWUsa2V5TmFtZSxzdWJMaXN0KSB7XHJcblx0XHRcdGlmKCFzdWJMaXN0KSB7XHJcblx0XHRcdFx0c3ViTGlzdCA9ICdtYWluJztcclxuXHRcdFx0fVxyXG5cdFx0XHR2YXIgbGlzdEFycmF5ID0gdGhpcy5MaXN0c1tsaXN0TmFtZV1bc3ViTGlzdF07XHJcblx0XHRcdGZvcih2YXIgaSA9IDA7IGkgPCBsaXN0QXJyYXkubGVuZ3RoOyBpKyspIHtcclxuXHRcdFx0XHRtZXNzYWdlICs9IGxpc3RBcnJheVtpXVtrZXlOYW1lXTtcclxuXHRcdFx0XHRpZihpIDwgbGlzdEFycmF5Lmxlbmd0aCAtIDEpIHtcclxuXHRcdFx0XHRcdG1lc3NhZ2UgKz0gJywgJztcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdFx0cmV0dXJuIG1lc3NhZ2U7XHJcblx0XHR9O1xyXG5cclxuXHRcdC8vIFJldHVybnMgdGhlIGluZGV4IG9mIHRoZSBpdGVtIHdpdGhpbiB0aGUgYW4gYXJyYXkgKHNwZWNpZmllZCBieSBsaXN0TmFtZSBhbmQgc3ViTGlzdCkgb3IgZmFsc2UgaWYgbm90IGZvdW5kLiAgU2VhcmNoIGJ5IGtleSAoc2hvdWxkIGJlIHVuaXF1ZSBpZC5cclxuXHRcdHRoaXMuZmluZEJ5SWQgPSBmdW5jdGlvbihpZCxsaXN0TmFtZSxrZXksc3ViTGlzdCkge1xyXG5cdFx0XHRrZXkgPSB0eXBlb2Yga2V5ICE9PSAndW5kZWZpbmVkJyA/IGtleSA6ICdpZCc7XHJcblx0XHRcdHN1Ykxpc3QgPSB0eXBlb2Ygc3ViTGlzdCAhPT0gJ3VuZGVmaW5lZCcgPyBzdWJMaXN0IDogJ21haW4nO1xyXG5cdFx0XHR2YXIgbGlzdEFycmF5ID0gdGhpcy5MaXN0c1tsaXN0TmFtZV1bc3ViTGlzdF07XHJcblx0XHRcdGZvcih2YXIgaSA9IDA7IGkgPCBsaXN0QXJyYXkubGVuZ3RoOyBpKyspIHtcclxuXHRcdFx0XHRpZihTdHJpbmcobGlzdEFycmF5W2ldW2tleV0pID09PSBTdHJpbmcoaWQpKSB7XHJcblx0XHRcdFx0XHRyZXR1cm4gaTtcclxuXHRcdFx0XHR9XHRcdFx0XHJcblx0XHRcdH1cclxuXHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0fTtcclxuXHRcdFxyXG5cdFx0Ly8gRGVsZXRlcyBpdGVtcyBmb3VuZCBpbiBkZWxBcnJheSBmcm9tIG1haW4gbGlzdCBzZWFyY2hpbmcgYnkgaWQuIFJldHVybnMgbmV3IGFycmF5LlxyXG5cdFx0dGhpcy5kZWxldGVCeUlkID0gZnVuY3Rpb24oZGVsQXJyYXksaWROYW1lLGxpc3ROYW1lLHN1Ykxpc3QpIHtcclxuXHRcdFx0dmFyIG51bUl0ZW1zID0gZGVsQXJyYXkubGVuZ3RoO1xyXG5cdFx0XHRzdWJMaXN0ID0gdHlwZW9mIHN1Ykxpc3QgIT09ICd1bmRlZmluZWQnID8gc3ViTGlzdCA6ICdtYWluJztcclxuXHRcdFx0Zm9yKHZhciBpID0gMDsgaSA8IG51bUl0ZW1zOyBpKyspIHtcclxuXHRcdFx0XHR2YXIgaW1nSW5kZXggPSBsRnVuYy5maW5kQnlJZChkZWxBcnJheVtpXVtpZE5hbWVdLGxpc3ROYW1lLGlkTmFtZSxzdWJMaXN0KTtcclxuXHRcdFx0XHRsRnVuYy5MaXN0c1tsaXN0TmFtZV0ubWFpbi5zcGxpY2UoaW1nSW5kZXgsMSk7XHJcblx0XHRcdH1cclxuXHRcdH07XHJcblx0XHRcclxuXHRcdC8vIFNlbGVjdHMgYWxsIGl0ZW1zIHdpdGhpbiB0aGUgY3VycmVudCBmaWx0ZXIgc2V0XHJcblx0XHR0aGlzLnNlbGVjdEFsbCA9IGZ1bmN0aW9uKGtleSxsaXN0TmFtZSkge1xyXG5cdFx0XHRrZXkgPSB0eXBlb2Yga2V5ICE9PSAndW5kZWZpbmVkJyA/IGtleSA6ICdpZCc7XHJcblx0XHRcdHZhciBmaWx0ZXJlZEl0ZW1zID0gdGhpcy5zZXRGaWx0ZXJBcnJheShsaXN0TmFtZSk7XHJcblx0XHRcdHZhciBudW1JdGVtcyA9IGZpbHRlcmVkSXRlbXMubGVuZ3RoO1xyXG5cdFx0XHRmb3IodmFyIGkgPSAwOyBpIDwgbnVtSXRlbXM7IGkrKykge1xyXG5cdFx0XHRcdGlmKCFmaWx0ZXJlZEl0ZW1zW2ldLnNlbGVjdGVkKSB7XHJcblx0XHRcdFx0XHRsRnVuYy5zZWxlY3RJdGVtKGZpbHRlcmVkSXRlbXNbaV0sdW5kZWZpbmVkLGtleSxsaXN0TmFtZSk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9O1xyXG5cdFx0XHJcblx0XHQvLyBEZXNlbGVjdHMgYWxsIGl0ZW1zXHJcblx0XHR0aGlzLmRlc2VsZWN0QWxsID0gZnVuY3Rpb24oa2V5LGxpc3ROYW1lKSB7XHJcblx0XHRcdGtleSA9IHR5cGVvZiBrZXkgIT09ICd1bmRlZmluZWQnID8ga2V5IDogJ2lkJztcclxuXHRcdFx0dmFyIG51bVBob3RvcyA9IHRoaXMuTGlzdHNbbGlzdE5hbWVdLm1haW4ubGVuZ3RoO1xyXG5cdFx0XHRpZighdGhpcy5jaGVja1NlbGVjdGVkKGxpc3ROYW1lKSkge1xyXG5cdFx0XHRcdGZvcih2YXIgaSA9IDA7IGkgPCBudW1QaG90b3M7IGkrKykge1xyXG5cdFx0XHRcdFx0dmFyIGl0ZW0gPSB0aGlzLkxpc3RzW2xpc3ROYW1lXS5tYWluW2ldO1xyXG5cdFx0XHRcdFx0aWYoaXRlbS5zZWxlY3RlZCkge1xyXG5cdFx0XHRcdFx0XHR0aGlzLmRlc2VsZWN0SXRlbShpdGVtLmlkLGksa2V5LGxpc3ROYW1lKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdH07XHJcblx0XHRcclxuXHRcdHRoaXMuZGVzZWxlY3RJdGVtID0gZnVuY3Rpb24oaWQsaW5kZXgsa2V5LGxpc3ROYW1lKSB7XHJcblx0XHRcdGtleSA9IHR5cGVvZiBrZXkgIT09ICd1bmRlZmluZWQnID8ga2V5IDogJ2lkJztcclxuXHRcdFx0bEZ1bmMuTGlzdHNbbGlzdE5hbWVdLm1haW5baW5kZXhdLnNlbGVjdGVkID0gZmFsc2U7XHJcblx0XHRcdHZhciBzZWxJbmRleCA9IGxGdW5jLmZpbmRCeUlkKGlkLGxpc3ROYW1lLGtleSwnc2VsZWN0ZWQnKTtcclxuXHRcdFx0bEZ1bmMuTGlzdHNbbGlzdE5hbWVdLnNlbGVjdGVkLnNwbGljZShzZWxJbmRleCwxKTtcclxuXHRcdH07XHJcblxyXG5cdFx0dGhpcy5zZWxlY3RJdGVtID0gZnVuY3Rpb24oaXRlbSxpbmRleCxrZXksbGlzdE5hbWUpIHtcclxuXHRcdFx0a2V5ID0gdHlwZW9mIGtleSAhPT0gJ3VuZGVmaW5lZCcgPyBrZXkgOiAnaWQnO1xyXG5cdFx0XHRpZighaW5kZXgpIHtcclxuXHRcdFx0XHRpbmRleCA9IHRoaXMuZmluZEJ5SWQoaXRlbVtrZXldLGxpc3ROYW1lLGtleSwnbWFpbicpO1xyXG5cdFx0XHR9XHJcblx0XHRcdHRoaXMuTGlzdHNbbGlzdE5hbWVdLm1haW5baW5kZXhdLnNlbGVjdGVkID0gdHJ1ZTtcclxuXHRcdFx0dGhpcy5MaXN0c1tsaXN0TmFtZV0uc2VsZWN0ZWQucHVzaChpdGVtKTtcclxuXHRcdH07XHJcblx0XHRcclxuXHRcdC8vIEFmdGVyIGl0ZW1zIGFyZSBtb3ZlZCBpbiBsaXN0LCBzZXRzIHRoZSBvcmRlciB2YWx1ZSAobmFtZWQgb3JkS2V5KSB0byB0aGUgY29ycmVjdCBudW1iZXIgZm9yIHRoZSBEQi4gIEFsc28gYWRkcyBvcmRlciBhbmQgc2VjdGlvbiB0byB0aGUgc2VsZWN0ZWQgbGlzdC5cclxuXHRcdHZhciByZXNldE9yZGVyID0gZnVuY3Rpb24oa2V5LG9yZEtleSxsaXN0TmFtZSxzZWN0aW9uKSB7XHJcblx0XHRcdHZhciBzZWxJbmRleCA9IDA7XHJcblx0XHRcdGZvcihpID0gMDsgaSA8IGxGdW5jLkxpc3RzW2xpc3ROYW1lXS5tYWluLmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdFx0bEZ1bmMuTGlzdHNbbGlzdE5hbWVdLm1haW5baV1bb3JkS2V5XSA9IGk7XHJcblx0XHRcdFx0aWYobEZ1bmMuTGlzdHNbbGlzdE5hbWVdLm1haW4uc2VsZWN0ZWQpIHtcclxuXHRcdFx0XHRcdHNlbEluZGV4ID0gbEZ1bmMuZmluZEJ5SWQobEZ1bmMuTGlzdHNbbGlzdE5hbWVdLm1haW5baV1ba2V5XSxsaXN0TmFtZSxrZXksJ3NlbGVjdGVkJyk7XHJcblx0XHRcdFx0XHRsRnVuYy5MaXN0c1tsaXN0TmFtZV0uc2VsZWN0ZWRbc2VsSW5kZXhdW29yZEtleV0gPSBpO1xyXG5cdFx0XHRcdFx0aWYodHlwZW9mIHNlY3Rpb24gIT09ICd1bmRlZmluZWQnKSB7XHJcblx0XHRcdFx0XHRcdGxGdW5jLkxpc3RzW2xpc3ROYW1lXS5zZWxlY3RlZFtzZWxJbmRleF0uc2VjdGlvbiA9IHNlY3Rpb247XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9O1xyXG5cdFx0XHJcblx0XHQvLyBBZGRzIHRoZSBzZWxlY3RlZCBpdGVtcyB0byBhIHNlY3Rpb24gYW5kIHJlb3JkZXJzIGl0ZW1zIHRvIGdyb3VwIHRob3NlIHRvZ2V0aGVyLlxyXG5cdFx0dGhpcy5ncm91cFNlbGVjdGVkID0gZnVuY3Rpb24oa2V5LG9yZEtleSxzZWN0aW9uLGxpc3ROYW1lKSB7XHJcblx0XHRcdHZhciBsaXN0VGVtcCA9IGxGdW5jLkxpc3RzW2xpc3ROYW1lXS5tYWluLFxyXG5cdFx0XHRcdGZpcnN0SW5kZXggPSAtMSxcclxuXHRcdFx0XHRtb3ZlSW5kZXggPSAwLFxyXG5cdFx0XHRcdHNlbEluZGV4O1xyXG5cdFx0XHRmb3IodmFyIGkgPSAwOyBpIDwgbGlzdFRlbXAubGVuZ3RoOyBpKyspIHtcclxuXHRcdFx0XHRpZihsaXN0VGVtcFtpXS5zZWxlY3RlZCB8fCBsbGlzdFRlbXBbaV0uc2VjdGlvbiA9PT0gc2VjdGlvbikge1xyXG5cdFx0XHRcdFx0aWYoZmlyc3RJbmRleCA9IC0xKSB7XHJcblx0XHRcdFx0XHRcdGZpcnN0SW5kZXggPSBpO1xyXG5cdFx0XHRcdFx0XHRsaXN0VGVtcFtpXS5zZWN0aW9uID0gc2VjdGlvbjtcclxuXHRcdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRcdG1vdmVJbmRleCA9IGk7XHJcblx0XHRcdFx0XHRcdGxpc3RUZW1wW21vdmVJbmRleF0uc2VjdGlvbiA9IHNlY3Rpb247XHJcblx0XHRcdFx0XHRcdGxpc3RUZW1wLnNwbGljZShmaXJzdEluZGV4KzEsMCxsaXN0VGVtcC5zcGxpY2UobW92ZUluZGV4LDEpWzBdKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdFx0bEZ1bmMuTGlzdHNbbGlzdE5hbWVdLm1haW4gPSBsaXN0VGVtcDtcclxuXHRcdFx0cmVzZXRPcmRlcihrZXksb3JkS2V5LGxpc3ROYW1lLHNlY3Rpb24pO1xyXG5cdFx0fTtcclxuXHRcdFxyXG5cdFx0Ly8gTW92ZXMgYW4gaXRlbSBvciBpdGVtcy4gIENoZWNrcyB0aGUgc2VjdGlvbnMgb2YgdGhlIGl0ZW1zIHRvIGVuc3VyZSBpdGVtcyB3aXRoaW4gc2FtZSBzZWN0aW9uIHN0aWNrIHRvZ2V0aGVyLlxyXG5cdFx0dGhpcy5tb3ZlSXRlbXMgPSBmdW5jdGlvbihkaXJlY3Rpb24sa2V5LG9yZEtleSxsaXN0TmFtZSkge1xyXG5cdFx0XHR2YXIgc2VsU2VjdGlvbixcclxuXHRcdFx0XHRsaXN0TGVuID0gbEZ1bmMuTGlzdHNbbGlzdE5hbWVdLm1haW4ubGVuZ3RoLFxyXG5cdFx0XHRcdG11bHRpcGxpZXIsXHJcblx0XHRcdFx0bmV4dFNlY3Rpb247XHJcblx0XHRcdHZhciBpID0gZGlyZWN0aW9uID4gMCA/IGxpc3RMZW4gLSAxIDogMDtcclxuXHRcdFx0Ly8gTG9vcCB0aHJvdWdoIG1haW4gbGlzdCBvcHBvc2l0ZSB0aGUgZGlyZWN0aW9uIG9mIHRoZSBtb3ZlbWVudCBvZiBpdGVtcyB0byBtYWtlIHN1cmUgb3JkZXIgaXMgb3RoZXJ3aXNlIHByZXNlcnZlZC5cclxuXHRcdFx0Zm9yKGk7IGkgPCBsaXN0TGVuICYmIGkgPj0gMDsgaSA9IGkgLSBkaXJlY3Rpb24pIHtcclxuXHRcdFx0XHRtdWx0aXBsaWVyID0gMTtcclxuXHRcdFx0XHQvLyBJZiB0aGUgaXRlbSBpcyBpbiB0aGUgc2VsZWN0ZWQgbGlzdCBvciB0aGUgc2VjdGlvbiBpcyBtb3ZpbmcuXHJcblx0XHRcdFx0aWYobEZ1bmMuZmluZEJ5SWQobEZ1bmMuTGlzdHNbbGlzdE5hbWVdLm1haW5baV1ba2V5XSxsaXN0TmFtZSxrZXksJ3NlbGVjdGVkJykgIT09IGZhbHNlIHx8IGxGdW5jLkxpc3RzW2xpc3ROYW1lXS5tYWluW2ldLnNlY3Rpb24gPT09IHNlbFNlY3Rpb24pIHtcclxuXHRcdFx0XHRcdC8vIFNldCBzZWxTZWN0aW9uIHRvIHNlY3Rpb24gb2YgYSBzZWxlY3RlZCBpdGVtLlxyXG5cdFx0XHRcdFx0aWYobEZ1bmMuTGlzdHNbbGlzdE5hbWVdLm1haW5baV0uc2VjdGlvbiAhPT0gJycpIHtcclxuXHRcdFx0XHRcdFx0c2VsU2VjdGlvbiA9IGxGdW5jLkxpc3RzW2xpc3ROYW1lXS5tYWluW2ldLnNlY3Rpb247XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHQvLyBJZiB0aGUgbW92ZW1lbnQgd291bGQgcHV0IHRoZSBpdGVtIG91dHNpZGUgb2YgbGlzdCBib3VuZGFyaWVzIG9yIGFub3RoZXIgc2VsZWN0aW9uIGhhcyBoaXQgdGhvc2UgYm91bmRhcmllcyBkb24ndCBtb3ZlLlxyXG5cdFx0XHRcdFx0aWYoaStkaXJlY3Rpb24gPj0gMCAmJiBpK2RpcmVjdGlvbiA8IGxpc3RMZW4gJiYgIWxGdW5jLkxpc3RzW2xpc3ROYW1lXS5tYWluW2krZGlyZWN0aW9uXS5zZWxlY3RlZCkge1xyXG5cdFx0XHRcdFx0XHQvLyBJZiB0aGUgbmV4dCBpdGVtIGlzIGluIGEgZGVmaW5lZCBzZWN0aW9uLCBuZWVkIHRvIGNoZWNrICYgY291bnQgaXRlbXMgaW4gc2VjdGlvbiB0byBqdW1wIG92ZXIgb3Igc3RvcCBtb3ZlbWVudC5cclxuXHRcdFx0XHRcdFx0aWYobEZ1bmMuTGlzdHNbbGlzdE5hbWVdLm1haW5baStkaXJlY3Rpb25dLnNlY3Rpb24gIT09ICcnICYmIGxGdW5jLkxpc3RzW2xpc3ROYW1lXS5tYWluW2ldLnNlY3Rpb24gIT09IGxGdW5jLkxpc3RzW2xpc3ROYW1lXS5tYWluW2krZGlyZWN0aW9uXS5zZWN0aW9uKSB7XHJcblx0XHRcdFx0XHRcdFx0bmV4dFNlY3Rpb24gPSBsRnVuYy5MaXN0c1tsaXN0TmFtZV0ubWFpbltpK2RpcmVjdGlvbl0uc2VjdGlvbjtcclxuXHRcdFx0XHRcdFx0XHRtdWx0aXBsaWVyID0gMDtcclxuXHRcdFx0XHRcdFx0XHQvLyBMb29wIGJhY2sgdGhyb3VnaCBhcnJheSBpbiB0aGUgZGlyZWN0aW9uIG9mIG1vdmVtZW50LlxyXG5cdFx0XHRcdFx0XHRcdGZvcih2YXIgaiA9IGkgKyBkaXJlY3Rpb247IGogPCBsaXN0TGVuICYmIGogPj0gMDsgaiA9IGogKyBkaXJlY3Rpb24pIHtcclxuXHRcdFx0XHRcdFx0XHRcdC8vIElmIHRoZSBpdGVtIGlzIGluIHRoZSBzZWN0aW9uLi4uXHJcblx0XHRcdFx0XHRcdFx0XHRpZihsRnVuYy5MaXN0c1tsaXN0TmFtZV0ubWFpbltqXS5zZWN0aW9uID09PSBuZXh0U2VjdGlvbikge1xyXG5cdFx0XHRcdFx0XHRcdFx0XHQvLyBJZiBzZWxlY3RlZCBzdG9wIG1vdmVtZW50IGFuZCBicmVhay5cclxuXHRcdFx0XHRcdFx0XHRcdFx0aWYobEZ1bmMuTGlzdHNbbGlzdE5hbWVdLm1haW5bal0uc2VsZWN0ZWQpIHtcclxuXHRcdFx0XHRcdFx0XHRcdFx0XHRtdWx0aXBsaWVyID0gMDtcclxuXHRcdFx0XHRcdFx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRcdFx0XHQvLyBJZiBub3QsIGNvdW50IHNlY3Rpb24uXHJcblx0XHRcdFx0XHRcdFx0XHRcdG11bHRpcGxpZXIrKztcclxuXHRcdFx0XHRcdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRcdFx0XHRcdC8vIEJyZWFrIGxvb3AgYXQgZmlyc3QgaXRlbSBub3QgaW4gc2VjdGlvbi5cclxuXHRcdFx0XHRcdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdC8vIEZpbmFsIGNoZWNrOiBvbmx5IG1vdmUgYW4gaXRlbSBpZiBpdCBpcyBzZWxlY3RlZCBvciB0byBlbnN1cmUgaXRlbXMgb2YgdGhlIHNhbWUgc2VjdGlvbiBzdGljayB0b2dldGhlclxyXG5cdFx0XHRcdFx0XHRpZihsRnVuYy5MaXN0c1tsaXN0TmFtZV0ubWFpbltpXS5zZWxlY3RlZCB8fCBsRnVuYy5MaXN0c1tsaXN0TmFtZV0ubWFpbltpK2RpcmVjdGlvbl0uc2VjdGlvbiAhPT0gbEZ1bmMuTGlzdHNbbGlzdE5hbWVdLm1haW5baV0uc2VjdGlvbikge1xyXG5cdFx0XHRcdFx0XHRcdGxGdW5jLkxpc3RzW2xpc3ROYW1lXS5tYWluLnNwbGljZShpKyhkaXJlY3Rpb24qbXVsdGlwbGllciksMCxsRnVuYy5MaXN0c1tsaXN0TmFtZV0ubWFpbi5zcGxpY2UoaSwxKVswXSk7XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdFx0Ly8gUmVzZXQgb3JkZXIgdmFyaWFibGUgZm9yIGRhdGFiYXNlLlxyXG5cdFx0XHRyZXNldE9yZGVyKGtleSxvcmRLZXksbGlzdE5hbWUpO1xyXG5cdFx0fTtcclxuXHRcdFxyXG5cdH1dKTtcclxufSkoKTsiXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
