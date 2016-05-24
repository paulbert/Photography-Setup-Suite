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
			ordKey = $scope.ordKey,
			listName = $scope.listName;
		
		// Sets selectedList as empty array for this list number.
		listFunctions.clearSelected(listName);
		this.hideOverlay = true;
		
		this.lFunc = listFunctions;
		this.newSection = '';
		this.currentSection = {section:'',id:0};
		
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
		this.orderSavePending = false;
		
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
		
		// Copies the selected list over to the edit list (for 'edit selected' situations)
		this.selectToEdit = function(listName) {
			this.Lists[listName].edit = this.Lists[listName].selected;
		};
		
		this.editOne = function(id,listName,idName) {
			var index = this.findById(id,listName,idName);
			this.Lists[listName].edit = [];
			this.Lists[listName].edit.push(this.Lists[listName].main[index]);
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

		// Function to create a comma separated list of a particular property within one of the lists. keyName specifies property to use (name of the item, generally). 
		this.makeList = function(listName,keyName,subList) {
			if(!subList) {
				subList = 'main';
			}
			var listArray = this.Lists[listName][subList],
				message = '';
			for(var i = 0; i < listArray.length; i++) {
				message += listArray[i][keyName];
				if(i < listArray.length - 1) {
					message += ', ';
				}
			}
			return message;
		};

		// Returns the index of the item within the an array (specified by listName and subList) or false if not found.  Search by key (should be unique id).
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
		
		// Deletes items found in delArray from main list searching by id. Does nothing with items which are not found.
		this.deleteById = function(delArray,idName,listName,subList) {
			var numItems = delArray.length;
			subList = typeof subList !== 'undefined' ? subList : 'main';
			for(var i = 0; i < numItems; i++) {
				var imgIndex = lFunc.findById(delArray[i][idName],listName,idName,subList);
				if(imgIndex !== false) {
					lFunc.Lists[listName].main.splice(imgIndex,1);
				}
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
		
		this.setOrderSave = function(orderSave) {
			this.orderSavePending = orderSave ? orderSave : false;
		};
		
	}]);
})();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImZpbHRlcnMvZmlsdGVyRGlyZWN0aXZlLmpzIiwibGlzdHMvbGlzdERpcmVjdGl2ZS5qcyIsIm92ZXJsYXkvb3ZlcmxheURpcmVjdGl2ZS5qcyIsImZpbHRlcnMvY29tcG9uZW50cy9maWx0ZXJDaGVja2JveENvbXBvbmVudERpcmVjdGl2ZS5qcyIsImZpbHRlcnMvY29tcG9uZW50cy9maWx0ZXJRdWVyeUNvbXBvbmVudERpcmVjdGl2ZS5qcyIsImZpbHRlckNvbnRyb2xsZXIuanMiLCJmaWx0ZXJTZXJ2aWNlLmpzIiwiY29tcG9uZW50cy9maWx0ZXJDb21wb25lbnRDb250cm9sbGVyLmpzIiwib3ZlcmxheUNvbnRyb2xsZXIuanMiLCJsaXN0Q29udHJvbGxlci5qcyIsImxpc3RTZXJ2LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FDSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDaENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDeEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDckJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDM0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2xEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDeERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6InBob3RvLXRvb2xzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCkge1xuXHRhbmd1bGFyLm1vZHVsZSgncGhvdG9FZGl0Q29tcG9uZW50cycsIFsnbGlzdE1vZCcsJ2ZpbHRlck1vZCcsJ292ZXJsYXlNb2QnXSk7XG5cdFxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcblx0XHJcblx0LypcclxuXHRTZWFyY2ggdmFyaWFibGUgc2hvdWxkIGJlIGFuIGFycmF5IG9mIG9iamVjdHMgbmFtZWQgdGhlIHNhbWUgYXMgdGhlIHByb3BlcnRpZXMgb2YgdGhlIG9iamVjdHMgd2l0aGluIHRoZSBsaXN0LlxyXG5cdFx0UmVxdWlyZXMgYSAncXVlcnknIHByb3BlcnR5IHdpdGhpbiBvYmplY3Qgd2hpY2ggaXMgbW9kZWxlZCB0byBhIHRleHQvaW5wdXQgZmlsdGVyLlxyXG5cdFx0SWYgdGhlIHNlYXJjaGVkIHByb3BlcnR5IGlzIGFuIGFycmF5IG9mIG9iamVjdHMgKGlmLCBmb3IgZXhhbXBsZSwgaW1hZ2VzIGNhbiBiZSBpbiBtYW55IGdhbGxlcnkgZ3JvdXBpbmdzKSwgYWRkICdpc0FycmF5JyBwcm9wZXJ0eSBhbmQgc2V0IHRvIHRydWUsIGFsc28gYWRkICdzZWFyY2hPbicgcHJvcGVydHkgYW5kIHNldCB0byB0aGUgbmFtZSBvZiB0aGUgcHJvcGVydHkgd2l0aGluIG9iamVjdHMuXHJcblx0XHRFeGFtcGxlOiBpbWFnZXMgPSBbIHtpbWduYW1lOiAnaW1nMS5qcGcnLCBnYWxsZXJpZXM6IFsgeyBpZDoxLCBuYW1lOidnYWxsZXJ5MScgfSwgeyBpZDoyLCBuYW1lOidnYWxsZXJ5Mid9IF19LCAuLi5dXHJcblx0XHRzZWFyY2ggPSB7IGdhbGxlcmllczogeyBxdWVyeTonJywgaXNBcnJheTogdHJ1ZSwgc2VhcmNoT246ICduYW1lJyB9IH1cclxuXHRcdEZvciBhIGNoZWNrYm94IGZpbHRlciwgaW5jbHVkZSBhbiBvYmplY3QgY2FsbGVkICdjaGVja2JveGVzJyB3aXRoIGEgJ25vbmUnIHByb3BlcnR5IGFuZCBhbGwgcG9zc2libGUgdmFsdWVzIGluIDAtbiBwcm9wZXJ0eS5cclxuXHRcdEJhc2VkIG9uIGFib3ZlIGV4YW1wbGU6IHNlYXJjaCA9IHsgZ2FsbGVyaWVzOiB7IC4uLiBjaGVja2JveGVzOiB7IG5vbmU6IHRydWUsIDA6J2dhbGxlcnkxJywxOidnYWxsZXJ5MicgfSB9XHJcblx0Ki9cclxuXHRcclxuXHRhbmd1bGFyLm1vZHVsZSgnZmlsdGVyTW9kJyxbXSlcclxuXHQuZGlyZWN0aXZlKCdmaWx0ZXJCYXInLCBmdW5jdGlvbigpIHtcclxuXHRcdHJldHVybiB7XHJcblx0XHRcdHNjb3BlOiB7XHJcblx0XHRcdFx0c2VhcmNoOic9JyxcclxuXHRcdFx0XHRmcG9zaXRpb246Jz0/JyxcclxuXHRcdFx0XHRpbmxpbmU6J0A/JyxcclxuXHRcdFx0XHR0bXBsdDonPScsXHJcblx0XHRcdFx0Y2hlY2tpdGVtczonPT8nXHJcblx0XHRcdH0sXHJcblx0XHRcdHRlbXBsYXRlOiAnPGRpdiBuZy1pbmNsdWRlPVwidGVtcGxhdGVVcmxcIj48L2Rpdj4nLFxyXG5cdFx0XHRjb250cm9sbGVyOidmaWx0ZXJCYXJDb250cm9sbGVyJyxcclxuXHRcdFx0Y29udHJvbGxlckFzOidmYmFyJyxcclxuXHRcdFx0bGluazogZnVuY3Rpb24oc2NvcGUsZWxlbWVudCxhdHRycykge1xyXG5cdFx0XHRcdHNjb3BlLnRlbXBsYXRlVXJsID0gc2NvcGUudG1wbHQuYmFzZSArIHNjb3BlLnRtcGx0LmZpbGVOYW1lO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fSlcclxuXHQ7XHJcblx0XHRcclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XG5cdGFuZ3VsYXIubW9kdWxlKCdsaXN0TW9kJyxbXSlcblx0LmRpcmVjdGl2ZSgnbGlzdE9mSXRlbXMnLGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiB7XG5cdFx0XHRzY29wZToge1xuXHRcdFx0XHRzZWFyY2g6Jz0nLFxuXHRcdFx0XHRsaXN0TmFtZTonPWxpc3QnLFxuXHRcdFx0XHRrZXlOYW1lOidAa2V5Jyxcblx0XHRcdFx0b3JkS2V5OidAb3JkbmFtZScsXG5cdFx0XHRcdC8vIEFkZGl0aW9uYWwgZnVuY3Rpb25zIHRvIGJlIGNhbGxlZCBmcm9tIGJ1dHRvbnMgaW4gdGhlIGxpc3QgKHNhdmUgaW5mbywgZGVsZXRlLCBldGMpXG5cdFx0XHRcdGFkZEZ1bmNzOic9ZnVuY3MnLFxuXHRcdFx0XHR0bXBsdDonPSdcblx0XHRcdH0sXG5cdFx0XHR0ZW1wbGF0ZTogJzxkaXYgbmctaW5jbHVkZT1cInRlbXBsYXRlVXJsXCI+PC9kaXY+Jyxcblx0XHRcdGNvbnRyb2xsZXI6J2xpc3RDb250cm9sbGVyJyxcblx0XHRcdGNvbnRyb2xsZXJBczonbGlzdCcsXG5cdFx0XHRsaW5rOiBmdW5jdGlvbihzY29wZSxlbGVtZW50LGF0dHJzKSB7XG5cdFx0XHRcdHNjb3BlLnRlbXBsYXRlVXJsID0gc2NvcGUudG1wbHQuYmFzZSArIHNjb3BlLnRtcGx0LmZpbGVOYW1lO1xuXHRcdFx0fVxuXHRcdH1cblx0fSlcblx0O1xufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcblx0XHJcblx0YW5ndWxhci5tb2R1bGUoJ292ZXJsYXlNb2QnLFtdKVxyXG5cdC5kaXJlY3RpdmUoJ292ZXJsYXknLCBmdW5jdGlvbigpIHtcclxuXHRcdHJldHVybiB7XHJcblx0XHRcdHNjb3BlOiB7XHJcblx0XHRcdFx0bWVzc2FnZTonPScsXHJcblx0XHRcdFx0bWVzc2FnZU51bTonPW51bWJlcicsXHJcblx0XHRcdFx0YnRuQ29uZmlnOic9Y2ZnJyxcclxuXHRcdFx0XHQvLyBGdW5jdGlvbiBmb3IgYWN0aW9uIG9mIG92ZXJsYXkgKGNhbmNlbC9iYWNrIGlzIGluIGNvbnRyb2xsZXIpXHJcblx0XHRcdFx0ZG9BY3Rpb246Jz1mdW5jJyxcclxuXHRcdFx0XHRiYXNlOidAPydcclxuXHRcdFx0fSxcclxuXHRcdFx0Y29udHJvbGxlcjonb3ZlcmxheUNvbnRyb2xsZXInLFxyXG5cdFx0XHRjb250cm9sbGVyQXM6J292ZXInLFxyXG5cdFx0XHR0ZW1wbGF0ZTogJzxkaXYgbmctaW5jbHVkZT1cInRlbXBsYXRlVXJsXCI+PC9kaXY+JyxcclxuXHRcdFx0bGluazogZnVuY3Rpb24oc2NvcGUsZWxlbWVudCxhdHRycykge1xyXG5cdFx0XHRcdC8vIElmIG5vIGJhc2UgaXMgc3BlY2lmaWVkLCB1c2UgbG9jYXRpb24gaWYgaW5zdGFsbGVkIHZpYSBib3dlci5cclxuXHRcdFx0XHRpZih0eXBlb2Ygc2NvcGUuYmFzZSA9PT0gJ3VuZGVmaW5lZCcpIHtcclxuXHRcdFx0XHRcdHNjb3BlLmJhc2UgPSAnL2Jvd2VyX2NvbXBvbmVudHMvUGhvdG9ncmFwaHktU2V0dXAtU3VpdGUvdGVtcGxhdGVzL292ZXJsYXkvJztcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0c2NvcGUudGVtcGxhdGVVcmwgPSBzY29wZS5iYXNlICsgJ292ZXJsYXkuaHRtbCc7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9KVxyXG5cdDtcclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcblx0XHJcblx0YW5ndWxhci5tb2R1bGUoJ2ZpbHRlck1vZCcpXHJcblx0LmRpcmVjdGl2ZSgnZmlsdGVyQ2hlY2tib3gnLCBmdW5jdGlvbigpIHtcclxuXHRcdFx0cmV0dXJuIHtcclxuXHRcdFx0XHRzY29wZToge1xyXG5cdFx0XHRcdFx0aXRlbXM6Jz0nLFxyXG5cdFx0XHRcdFx0c2VhcmNoOic9JyxcclxuXHRcdFx0XHRcdGJhc2U6Jz0/JyxcclxuXHRcdFx0XHRcdGxhYmVsOidAPydcclxuXHRcdFx0XHR9LFxyXG5cdFx0XHRcdGNvbnRyb2xsZXI6J2ZpbHRlckNvbXBDb250cm9sbGVyJyxcclxuXHRcdFx0XHRjb250cm9sbGVyQXM6J2Zjb21wJyxcclxuXHRcdFx0XHR0ZW1wbGF0ZTogJzxkaXYgbmctaW5jbHVkZT1cInRlbXBsYXRlVXJsXCI+PC9kaXY+JyxcclxuXHRcdFx0XHRsaW5rOiBmdW5jdGlvbihzY29wZSxlbGVtZW50LGF0dHJzKSB7XHJcblx0XHRcdFx0XHQvLyBJZiBubyBiYXNlIGlzIHNwZWNpZmllZCwgdXNlIGxvY2F0aW9uIGlmIGluc3RhbGxlZCB2aWEgYm93ZXIuXHJcblx0XHRcdFx0XHRpZih0eXBlb2Ygc2NvcGUuYmFzZSA9PT0gJ3VuZGVmaW5lZCcpIHtcclxuXHRcdFx0XHRcdFx0c2NvcGUuYmFzZSA9ICcvYm93ZXJfY29tcG9uZW50cy9QaG90b2dyYXBoeS1TZXR1cC1TdWl0ZS90ZW1wbGF0ZXMvZmlsdGVycy8nO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0c2NvcGUudGVtcGxhdGVVcmwgPSBzY29wZS5iYXNlICsgJ2ZpbHRlckNoZWNrYm94ZXMuaHRtbCc7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9KVxyXG5cdDtcclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcblx0XHJcblx0YW5ndWxhci5tb2R1bGUoJ2ZpbHRlck1vZCcpXHJcblx0LmRpcmVjdGl2ZSgnZmlsdGVyUXVlcnknLCBmdW5jdGlvbigpIHtcclxuXHRcdFx0cmV0dXJuIHtcclxuXHRcdFx0XHRzY29wZToge1xyXG5cdFx0XHRcdFx0c2VhcmNoOic9JyxcclxuXHRcdFx0XHRcdGJhc2U6Jz0/JyxcclxuXHRcdFx0XHRcdGxhYmVsOidAPydcclxuXHRcdFx0XHR9LFxyXG5cdFx0XHRcdHRlbXBsYXRlOiAnPGRpdiBuZy1pbmNsdWRlPVwidGVtcGxhdGVVcmxcIj48L2Rpdj4nLFxyXG5cdFx0XHRcdGxpbms6IGZ1bmN0aW9uKHNjb3BlLGVsZW1lbnQsYXR0cnMpIHtcclxuXHRcdFx0XHRcdC8vIElmIG5vIGJhc2UgaXMgc3BlY2lmaWVkLCB1c2UgbG9jYXRpb24gaWYgaW5zdGFsbGVkIHZpYSBib3dlci5cclxuXHRcdFx0XHRcdGlmKHR5cGVvZiBzY29wZS5iYXNlID09PSAndW5kZWZpbmVkJykge1xyXG5cdFx0XHRcdFx0XHRzY29wZS5iYXNlID0gJy9ib3dlcl9jb21wb25lbnRzL1Bob3RvZ3JhcGh5LVNldHVwLVN1aXRlL3RlbXBsYXRlcy9maWx0ZXJzLyc7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRzY29wZS50ZW1wbGF0ZVVybCA9IHNjb3BlLmJhc2UgKyAnZmlsdGVyUXVlcnkuaHRtbCc7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9KVxyXG5cdDtcclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcblx0XHJcblx0YW5ndWxhci5tb2R1bGUoJ2ZpbHRlck1vZCcpXHJcblx0LmNvbnRyb2xsZXIoJ2ZpbHRlckJhckNvbnRyb2xsZXInLCBbJyRzY29wZScsIGZ1bmN0aW9uKCRzY29wZSkge1xyXG5cdFx0XHRcclxuXHRcdFx0dGhpcy5nYWxsZXJpZXMgPSBbXTtcclxuXHRcdFx0XHJcblx0XHRcdC8vIFRvZ2dsZXMgdGhlIHBvc2l0aW9uIG9mIHRoZSBsZWZ0IHNpZGUgZmlsdGVyIGNvbHVtblxyXG5cdFx0XHR0aGlzLmZpbHRlclRvZ2dsZSA9IGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdHZhciBmUG9zID0gJHNjb3BlLmZwb3NpdGlvbjtcclxuXHRcdFx0XHQkc2NvcGUuZnBvc2l0aW9uID0gKGZQb3MgPT09IDAgPyAtMTkwIDogMCk7XHJcblx0XHRcdH07XHJcblx0XHRcdFxyXG5cdFx0XHR2YXIgZkN0cmwgPSB0aGlzO1xyXG5cdFx0XHRcclxuXHRcdH1dKVxyXG5cdDtcclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcblx0XHJcblx0YW5ndWxhci5tb2R1bGUoJ2ZpbHRlck1vZCcpXHJcblx0LnNlcnZpY2UoJ2ZpbHRlckZ1bmN0aW9ucycsIGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcclxuXHRcdHZhciBmRnVuY3Rpb25zID0gdGhpcztcclxuXHRcdFxyXG5cdFx0Ly8gQ2hlY2tzIGZvciBhIG1hdGNoIHdpdGggdGhlIGZpbHRlcnMuXHJcblx0XHQvLyBJZiB0aGUgdmFsdWUgaXMgYW4gYXJyYXksIGNoZWNrcyBhbGwgdmFsdWVzIGZvciBvbmUgbWF0Y2guXHJcblx0XHQvLyBJZiBub3QsIGp1c3QgY2hlY2tzIHNpbmdsZSB2YWx1ZS5cclxuXHRcdHRoaXMuZmlsdGVyQ2hlY2sgPSBmdW5jdGlvbih2YWx1ZSxzZWFyY2gpIHtcclxuXHRcdFx0dmFyIGFsbE1hdGNoID0gdHJ1ZTtcclxuXHRcdFx0XHJcblx0XHRcdGZvcih2YXIga2V5IGluIHNlYXJjaCkge1xyXG5cdFx0XHRcdGlmKHNlYXJjaC5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XHJcblx0XHRcdFx0XHR2YXIgdGhpc1ZhbHVlID0gdmFsdWVba2V5XTtcclxuXHRcdFx0XHRcdGlmKHNlYXJjaFtrZXldLmlzQXJyYXkpIHtcclxuXHRcdFx0XHRcdFx0dmFyIG51bVZhbHVlcyA9IHRoaXNWYWx1ZS5sZW5ndGgsXHJcblx0XHRcdFx0XHRcdFx0bWF0Y2hGb3VuZCA9IGZhbHNlO1xyXG5cdFx0XHRcdFx0XHRmb3IodmFyIGkgPSAwOyBpIDwgbnVtVmFsdWVzOyBpKyspIHtcclxuXHRcdFx0XHRcdFx0XHRpZihjaGVja1ZhbHVlKHRoaXNWYWx1ZVtpXSwgc2VhcmNoLCBrZXkpKSB7XHJcblx0XHRcdFx0XHRcdFx0XHRtYXRjaEZvdW5kID0gdHJ1ZTtcclxuXHRcdFx0XHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRpZighbWF0Y2hGb3VuZCkge1xyXG5cdFx0XHRcdFx0XHRcdGFsbE1hdGNoID0gZmFsc2U7XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRcdGFsbE1hdGNoID0gY2hlY2tWYWx1ZSh0aGlzVmFsdWUsIHNlYXJjaCwga2V5KTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdGlmKGFsbE1hdGNoID09PSBmYWxzZSkge1xyXG5cdFx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdFx0XHJcblx0XHRcdHJldHVybiBhbGxNYXRjaDtcclxuXHRcdFx0XHJcblx0XHR9O1xyXG5cdFx0XHJcblx0XHQvLyBGdW5jdGlvbiB0aGF0IGNoZWNrcyB2YWx1ZSBhZ2FpbnN0IHRoZSBxdWVyeSBmaWx0ZXIgJiBjaGVja2JveGVzXHJcblx0XHR2YXIgY2hlY2tWYWx1ZSA9IGZ1bmN0aW9uKHZhbHVlLCBzZWFyY2gsIGtleSkge1xyXG5cdFx0XHRcclxuXHRcdFx0dmFyIGNoZWNrTWF0Y2ggPSB0cnVlLFxyXG5cdFx0XHRcdHZhbHVlTWF0Y2ggPSBmYWxzZSxcclxuXHRcdFx0XHRjaGVja2JveGVzID0gc2VhcmNoW2tleV0uY2hlY2tib3hlcyxcclxuXHRcdFx0XHRzZWFyY2hPbiA9IHNlYXJjaFtrZXldLnNlYXJjaE9uO1xyXG5cdFx0XHRcdFxyXG5cdFx0XHRpZihzZWFyY2hPbiAmJiB2YWx1ZSkge1xyXG5cdFx0XHRcdHZhciB0aGlzVmFsdWUgPSB2YWx1ZVtzZWFyY2hPbl07XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0dmFyIHRoaXNWYWx1ZSA9IHZhbHVlO1xyXG5cdFx0XHR9XHJcblx0XHRcdGlmKGNoZWNrYm94ZXMpIHtcclxuXHRcdFx0XHRjaGVja01hdGNoID0gY2hlY2tUaGVCb3hlcyh0aGlzVmFsdWUsa2V5LGNoZWNrYm94ZXMpO1xyXG5cdFx0XHR9XHJcblx0XHRcdHZhbHVlTWF0Y2ggPSBmRnVuY3Rpb25zLnF1ZXJ5RmlsdGVyQ2hlY2sodGhpc1ZhbHVlLHNlYXJjaFtrZXldLnF1ZXJ5KTtcclxuXHRcdFx0XHJcblx0XHRcdHJldHVybiBjaGVja01hdGNoICYmIHZhbHVlTWF0Y2g7XHJcblx0XHR9O1xyXG5cdFx0XHJcblx0XHQvLyBDaGVja3MgcXVlcnkgdmFsdWUgYWdhaW5zdCBhY3R1YWwuICBBbHNvIHVzZWQgdG8gaGlkZS9zaG93IGNoZWNrYm94ZXMgYmFzZWQgb24gdGhlIHR5cGVkIGZpbHRlci5cclxuXHRcdHRoaXMucXVlcnlGaWx0ZXJDaGVjayA9IGZ1bmN0aW9uKHZhbHVlLHF1ZXJ5KSB7XHJcblx0XHRcdGlmKCF2YWx1ZSkge1xyXG5cdFx0XHRcdHZhbHVlID0gJyc7XHJcblx0XHRcdH1cclxuXHRcdFx0cmV0dXJuIHZhbHVlLnRvTG93ZXJDYXNlKCkuaW5kZXhPZihxdWVyeS50b0xvd2VyQ2FzZSgpKSA+IC0xO1xyXG5cdFx0fTtcclxuXHRcdFxyXG5cdFx0Ly8gRnVuY3Rpb24gdG8gbG9vcCB0aHJvdWdoIHRoZSBjaGVja2JveGVzIHZhcmlhYmxlIGFuZCByZXR1cm4gdHJ1ZSBpZiB0aGUgdmFsdWUgaXMgYSBtYXRjaFxyXG5cdFx0dmFyIGNoZWNrVGhlQm94ZXMgPSBmdW5jdGlvbiAodmFsdWUsZmlsdGVyc2V0LGNoZWNrYm94ZXMpIHtcclxuXHRcdFx0aWYodmFsdWUpIHtcclxuXHRcdFx0XHR2YXIgaSA9IDA7XHJcblx0XHRcdFx0ZG8ge1xyXG5cdFx0XHRcdFx0aWYodmFsdWUgPT09IGNoZWNrYm94ZXNbaV0pIHtcclxuXHRcdFx0XHRcdFx0cmV0dXJuIHRydWU7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRpKys7XHJcblx0XHRcdFx0fSB3aGlsZSh0eXBlb2YgY2hlY2tib3hlc1tpXSAhPT0gJ3VuZGVmaW5lZCcpXHJcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdGlmKGNoZWNrYm94ZXNbJ25vbmUnXSkge1xyXG5cdFx0XHRcdFx0cmV0dXJuIHRydWU7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdFx0fVxyXG5cdFx0fTtcclxuXHRcdFxyXG5cdH0pXHJcblx0O1xyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuXHRcclxuXHRhbmd1bGFyLm1vZHVsZSgnZmlsdGVyTW9kJylcclxuXHQuY29udHJvbGxlcignZmlsdGVyQ29tcENvbnRyb2xsZXInLCBbJyRzY29wZScsJ2ZpbHRlckZ1bmN0aW9ucycsIGZ1bmN0aW9uKCRzY29wZSxmaWx0ZXJGdW5jdGlvbnMpIHtcclxuXHRcdFxyXG5cdFx0dmFyIGJveFNldHVwID0gZnVuY3Rpb24gKGl0ZW1zKSB7XHJcblx0XHRcdFxyXG5cdFx0XHR2YXIgY2hlY2tib3hlcyA9IHtub25lOnRydWV9O1xyXG5cdFx0XHRcclxuXHRcdFx0Zm9yKHZhciBpID0gMDsgaSA8IGl0ZW1zLmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdFx0Y2hlY2tib3hlc1tpXSA9IGl0ZW1zW2ldO1xyXG5cdFx0XHR9XHJcblx0XHRcdFxyXG5cdFx0XHRyZXR1cm4gY2hlY2tib3hlcztcclxuXHRcdFx0XHJcblx0XHR9O1xyXG5cdFx0XHJcblx0XHQkc2NvcGUuc2VhcmNoLmNoZWNrYm94ZXMgPSBib3hTZXR1cCgkc2NvcGUuaXRlbXMpO1xyXG5cdFx0XHJcblx0XHQkc2NvcGUuJHdhdGNoKCdpdGVtcycsZnVuY3Rpb24obmV3VmFsdWUsb2xkVmFsdWUpIHtcclxuXHRcdFx0JHNjb3BlLnNlYXJjaC5jaGVja2JveGVzID0gYm94U2V0dXAobmV3VmFsdWUpO1xyXG5cdFx0fSk7XHJcblx0XHRcclxuXHRcdHRoaXMub25seUJveCA9IGZ1bmN0aW9uKGJveE51bSxib3hOYW1lKSB7XHJcblx0XHRcdHZhciBpID0gMDtcclxuXHRcdFx0ZG8ge1xyXG5cdFx0XHRcdCRzY29wZS5zZWFyY2guY2hlY2tib3hlc1tpXSA9IGZhbHNlO1x0XHRcdFx0XHRcclxuXHRcdFx0XHRpKys7XHJcblx0XHRcdH0gd2hpbGUodHlwZW9mICRzY29wZS5zZWFyY2guY2hlY2tib3hlc1tpXSAhPT0gJ3VuZGVmaW5lZCcpXHJcblx0XHRcdGlmKGJveE51bSA9PT0gJ25vbmUnKSB7XHJcblx0XHRcdFx0JHNjb3BlLnNlYXJjaC5jaGVja2JveGVzWydub25lJ10gPSB0cnVlO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdCRzY29wZS5zZWFyY2guY2hlY2tib3hlc1tib3hOdW1dID0gYm94TmFtZTtcclxuXHRcdFx0XHQkc2NvcGUuc2VhcmNoLmNoZWNrYm94ZXNbJ25vbmUnXSA9IGZhbHNlO1xyXG5cdFx0XHR9XHJcblx0XHR9O1xyXG5cdFx0XHJcblx0XHR0aGlzLmFsbEJveGVzID0gZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRmb3IodmFyIGkgPSAwOyBpIDwgJHNjb3BlLml0ZW1zLmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdFx0JHNjb3BlLnNlYXJjaC5jaGVja2JveGVzW2ldID0gJHNjb3BlLml0ZW1zW2ldO1xyXG5cdFx0XHR9XHJcblx0XHRcdCRzY29wZS5zZWFyY2guY2hlY2tib3hlc1snbm9uZSddID0gdHJ1ZTtcclxuXHRcdH07XHJcblx0XHRcclxuXHRcdHRoaXMuc2hvd0NoZWNrYm94ID0gZnVuY3Rpb24gKHZhbHVlLHF1ZXJ5KSB7XHJcblx0XHRcdHJldHVybiBmaWx0ZXJGdW5jdGlvbnMucXVlcnlGaWx0ZXJDaGVjayh2YWx1ZSxxdWVyeSk7XHJcblx0XHR9O1x0XHJcblx0XHRcclxuXHR9XSlcclxuXHQ7XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG5cdFxyXG5cdGFuZ3VsYXIubW9kdWxlKCdvdmVybGF5TW9kJylcclxuXHRcdC5jb250cm9sbGVyKCdvdmVybGF5Q29udHJvbGxlcicsIFsnJHNjb3BlJyxmdW5jdGlvbigkc2NvcGUpIHtcclxuXHRcdFx0XHJcblx0XHRcdHRoaXMuY2FuY2VsQWN0aW9uID0gZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0JHNjb3BlLm1lc3NhZ2VOdW0gPSAwO1xyXG5cdFx0XHR9O1xyXG5cdFx0XHRcclxuXHRcdH1dKVxyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuXHRhbmd1bGFyLm1vZHVsZSgnbGlzdE1vZCcpXHJcblx0LmNvbnRyb2xsZXIoJ2xpc3RDb250cm9sbGVyJyxbJyRzY29wZScsJyRyb290U2NvcGUnLCdsaXN0RnVuY3Rpb25zJyxmdW5jdGlvbigkc2NvcGUsJHJvb3RTY29wZSxsaXN0RnVuY3Rpb25zKSB7XHJcblx0XHRcclxuXHRcdHZhciBsQ3RybCA9IHRoaXMsXHJcblx0XHRcdGtleSA9ICRzY29wZS5rZXlOYW1lLFxyXG5cdFx0XHRvcmRLZXkgPSAkc2NvcGUub3JkS2V5LFxyXG5cdFx0XHRsaXN0TmFtZSA9ICRzY29wZS5saXN0TmFtZTtcclxuXHRcdFxyXG5cdFx0Ly8gU2V0cyBzZWxlY3RlZExpc3QgYXMgZW1wdHkgYXJyYXkgZm9yIHRoaXMgbGlzdCBudW1iZXIuXHJcblx0XHRsaXN0RnVuY3Rpb25zLmNsZWFyU2VsZWN0ZWQobGlzdE5hbWUpO1xyXG5cdFx0dGhpcy5oaWRlT3ZlcmxheSA9IHRydWU7XHJcblx0XHRcclxuXHRcdHRoaXMubEZ1bmMgPSBsaXN0RnVuY3Rpb25zO1xyXG5cdFx0dGhpcy5uZXdTZWN0aW9uID0gJyc7XHJcblx0XHR0aGlzLmN1cnJlbnRTZWN0aW9uID0ge3NlY3Rpb246JycsaWQ6MH07XHJcblx0XHRcclxuXHRcdC8vIFRvZ2dsZSBzZWxlY3Rpb24gb2YgaXRlbSAtIGNoYW5nZXMgc2VsZWN0IHByb3BlcnR5IG9mIGl0ZW0gYmV0d2VlbiB0cnVlL2ZhbHNlIGFuZCBhZGRzL3JlbW92ZXMgZnJvbSBzZWxlY3Rpb24gYXJyYXkgKHNlZSBsaXN0U2Vydi5qcyBmb3IgZnVuY3Rpb24pXHJcblx0XHR0aGlzLnRvZ2dsZVNlbGVjdCA9IGZ1bmN0aW9uKGl0ZW0saW5kZXgpIHtcclxuXHRcdFx0bGlzdEZ1bmN0aW9ucy50b2dnbGVTZWxlY3QoaXRlbSxpbmRleCxrZXksbGlzdE5hbWUpO1x0XHRcclxuXHRcdH07XHJcblx0XHRcclxuXHRcdC8vIEN1c3RvbSBmaWx0ZXIgZnVuY3Rpb24gY2hlY2tpbmcgaXRlbSBmaXJzdCBhZ2FpbnN0IGEgbGlzdCBvZiBleGNsdXNpb25zIHRoZW4gYWdhaW5zdCBjdXN0b20gZmlsdGVyIHZhbHVlc1xyXG5cdFx0dGhpcy5maWx0ZXJDaGVjayA9IGZ1bmN0aW9uKHZhbHVlLGluZGV4LGFycmF5KSB7XHJcblx0XHRcdHJldHVybiBsaXN0RnVuY3Rpb25zLmZpbHRlckNoZWNrKHZhbHVlLGluZGV4LCRzY29wZS5zZWFyY2gsa2V5LGxpc3ROYW1lKTtcclxuXHRcdH07XHJcblx0XHRcclxuXHRcdC8vIFJldHVybnMgdGhlIGxlbmd0aCBhIGxpc3QgKG1haW4gbGlzdCBpZiBub3Qgc3BlY2lmaWVkKS5cclxuXHRcdHRoaXMuZ2V0TGVuZ3RoID0gZnVuY3Rpb24obGlzdE5hbWUsc3ViTGlzdCkge1xyXG5cdFx0XHRpZighc3ViTGlzdCkge1xyXG5cdFx0XHRcdHN1Ykxpc3QgPSAnbWFpbic7XHJcblx0XHRcdH1cclxuXHRcdFx0cmV0dXJuIGxpc3RGdW5jdGlvbnMuTGlzdHNbbGlzdE5hbWVdW3N1Ykxpc3RdLmxlbmd0aDtcclxuXHRcdH07XHJcblx0XHRcclxuXHRcdC8vIENoYW5nZSBvcmRlciBvZiBsaXN0LlxyXG5cdFx0dGhpcy5tb3ZlSXRlbXMgPSBmdW5jdGlvbihkaXJlY3Rpb24pIHtcclxuXHRcdFx0bGlzdEZ1bmN0aW9ucy5tb3ZlSXRlbXMoZGlyZWN0aW9uLGtleSxvcmRLZXksbGlzdE5hbWUpO1xyXG5cdFx0XHRsaXN0RnVuY3Rpb25zLnNldE9yZGVyU2F2ZSh0cnVlKTtcclxuXHRcdH07XHJcblx0XHRcclxuXHRcdHRoaXMuY2hlY2tTZWxlY3RlZCA9IGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRyZXR1cm4gbGlzdEZ1bmN0aW9ucy5jaGVja1NlbGVjdGVkKGxpc3ROYW1lKTtcclxuXHRcdH07XHJcblx0XHRcclxuXHRcdHRoaXMuc2VsZWN0QWxsID0gZnVuY3Rpb24oKSB7XHJcblx0XHRcdGxpc3RGdW5jdGlvbnMuc2VsZWN0QWxsKGtleSxsaXN0TmFtZSk7XHJcblx0XHR9O1xyXG5cdFx0XHJcblx0XHR0aGlzLmRlc2VsZWN0QWxsID0gZnVuY3Rpb24oKSB7XHJcblx0XHRcdGxpc3RGdW5jdGlvbnMuZGVzZWxlY3RBbGwoa2V5LGxpc3ROYW1lKTtcclxuXHRcdH07XHJcblx0XHRcclxuXHR9XSlcclxuXHRcclxuXHQ7XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG5cdGFuZ3VsYXIubW9kdWxlKCdsaXN0TW9kJylcclxuXHQuc2VydmljZSgnbGlzdEZ1bmN0aW9ucycsIFsnJHEnLCdmaWx0ZXJGdW5jdGlvbnMnLGZ1bmN0aW9uICgkcSxmaWx0ZXJGdW5jdGlvbnMpIHtcclxuXHRcdFxyXG5cdFx0dmFyIGxGdW5jID0gdGhpcyxcclxuXHRcdFx0ZWRpdExpc3QgPSBbXSxcclxuXHRcdFx0Y3VycmVudEZpbHRlcmVkTGlzdCA9IFtdO1x0XHRcdFxyXG5cdFx0XHJcblx0XHR0aGlzLkxpc3RzID0ge307XHJcblx0XHR0aGlzLnNlY3Rpb25MaXN0ID0gW3tzZWN0aW9uOicnLGlkOjB9XTtcclxuXHRcdHRoaXMub3JkZXJTYXZlUGVuZGluZyA9IGZhbHNlO1xyXG5cdFx0XHJcblx0XHR0aGlzLnNldExpc3QgPSBmdW5jdGlvbihsaXN0QXJyYXksbGlzdE5hbWUsZXhjbHVkZUFycmF5KSB7XHJcblx0XHRcdHRoaXMuTGlzdHNbbGlzdE5hbWVdID0geyBtYWluOmxpc3RBcnJheSxzZWxlY3RlZDpbXSxlZGl0OltdLGZpbHRlcmVkOltdLGV4Y2x1ZGU6ZXhjbHVkZUFycmF5IH07XHJcblx0XHR9O1xyXG5cdFx0XHJcblx0XHR0aGlzLmNsZWFyU2VsZWN0ZWQgPSBmdW5jdGlvbihsaXN0TmFtZSkge1xyXG5cdFx0XHR0aGlzLkxpc3RzW2xpc3ROYW1lXS5zZWxlY3RlZCA9IFtdO1xyXG5cdFx0fTtcclxuXHRcdFxyXG5cdFx0dGhpcy5jaGVja1NlbGVjdGVkID0gZnVuY3Rpb24obGlzdE5hbWUpIHtcclxuXHRcdFx0cmV0dXJuIHRoaXMuTGlzdHNbbGlzdE5hbWVdLnNlbGVjdGVkLmxlbmd0aCA9PT0gMDtcclxuXHRcdH07XHJcblx0XHRcclxuXHRcdHRoaXMubGlzdExlbmd0aCA9IGZ1bmN0aW9uKGxpc3ROYW1lLHN1Ykxpc3QpIHtcclxuXHRcdFx0c3ViTGlzdCA9IHR5cGVvZiBzdWJMaXN0ICE9PSAndW5kZWZpbmVkJyA/IHN1Ykxpc3QgOiAnbWFpbic7XHJcblx0XHRcdGlmKHRoaXMuTGlzdHNbbGlzdE5hbWVdKSB7XHJcblx0XHRcdFx0cmV0dXJuIHRoaXMuTGlzdHNbbGlzdE5hbWVdW3N1Ykxpc3RdLmxlbmd0aDtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRyZXR1cm4gMDtcclxuXHRcdFx0fVxyXG5cdFx0fTtcclxuXHRcdFxyXG5cdFx0Ly8gQ29waWVzIHRoZSBzZWxlY3RlZCBsaXN0IG92ZXIgdG8gdGhlIGVkaXQgbGlzdCAoZm9yICdlZGl0IHNlbGVjdGVkJyBzaXR1YXRpb25zKVxyXG5cdFx0dGhpcy5zZWxlY3RUb0VkaXQgPSBmdW5jdGlvbihsaXN0TmFtZSkge1xyXG5cdFx0XHR0aGlzLkxpc3RzW2xpc3ROYW1lXS5lZGl0ID0gdGhpcy5MaXN0c1tsaXN0TmFtZV0uc2VsZWN0ZWQ7XHJcblx0XHR9O1xyXG5cdFx0XHJcblx0XHR0aGlzLmVkaXRPbmUgPSBmdW5jdGlvbihpZCxsaXN0TmFtZSxpZE5hbWUpIHtcclxuXHRcdFx0dmFyIGluZGV4ID0gdGhpcy5maW5kQnlJZChpZCxsaXN0TmFtZSxpZE5hbWUpO1xyXG5cdFx0XHR0aGlzLkxpc3RzW2xpc3ROYW1lXS5lZGl0ID0gW107XHJcblx0XHRcdHRoaXMuTGlzdHNbbGlzdE5hbWVdLmVkaXQucHVzaCh0aGlzLkxpc3RzW2xpc3ROYW1lXS5tYWluW2luZGV4XSk7XHJcblx0XHR9O1xyXG5cdFx0XHJcblx0XHQvLyBGaXJzdCBjaGVja3MgZXhjbHVkZSBhcnJheSBmb3IgaXRlbSwgdGhlbiBjaGVja3Mgc2VhcmNoIHZhbHVlIChzZWUgZmlsdGVyU2VydmljZS5qcylcclxuXHRcdHRoaXMuZmlsdGVyQ2hlY2sgPSBmdW5jdGlvbih2YWx1ZSxpbmRleCxzZWFyY2gsa2V5TmFtZSxsaXN0TmFtZSkge1xyXG5cdFx0XHR2YXIgbGlzdENoZWNrID0gZmFsc2UsXHJcblx0XHRcdFx0c2hvd0l0ZW0gPSBmYWxzZTtcclxuXHRcdFx0bGlzdENoZWNrID0gbEZ1bmMuZmluZEJ5SWQodmFsdWVba2V5TmFtZV0sbGlzdE5hbWUsa2V5TmFtZSwnZXhjbHVkZScpO1xyXG5cdFx0XHRpZihsaXN0Q2hlY2sgPT09IGZhbHNlKSB7XHJcblx0XHRcdFx0c2hvd0l0ZW0gPSBmaWx0ZXJGdW5jdGlvbnMuZmlsdGVyQ2hlY2sodmFsdWUsc2VhcmNoKTtcclxuXHRcdFx0XHQvLyBEZXNlbGVjdCBpdGVtIGlmIHRoZSBmaWx0ZXIgZXhjbHVkZXMgdGhlIGl0ZW1cclxuXHRcdFx0XHRpZih2YWx1ZS5zZWxlY3RlZCAmJiAhc2hvd0l0ZW0gJiYgaW5kZXggPj0gMCkge1xyXG5cdFx0XHRcdFx0bEZ1bmMuZGVzZWxlY3RJdGVtKHZhbHVlW2tleU5hbWVdLGluZGV4LGtleU5hbWUsbGlzdE5hbWUpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0XHRsRnVuYy5zZXRGaWx0ZXJlZChsaXN0TmFtZSxpbmRleCxzaG93SXRlbSk7XHJcblx0XHRcdHJldHVybiBzaG93SXRlbTtcclxuXHRcdH07XHJcblx0XHRcclxuXHRcdC8vIEFkZHMgcHJvcGVydHkgd2l0aCBmaWx0ZXIgc3RhdHVzIG9mIGVsZW1lbnRcclxuXHRcdHRoaXMuc2V0RmlsdGVyZWQgPSBmdW5jdGlvbihsaXN0TmFtZSxpbmRleCxzaG93KSB7XHJcblx0XHRcdHRoaXMuTGlzdHNbbGlzdE5hbWVdLm1haW5baW5kZXhdLnNob3dJdGVtID0gc2hvdztcclxuXHRcdH07XHJcblx0XHRcclxuXHRcdC8vIENyZWF0ZXMgYSBsaXN0IG9mIG9ubHkgdGhlIGN1cnJlbnRseSBmaWx0ZXJlZCBlbGVtZW50cyBvZiB0aGUgbWFpbiBhcnJheS4gUmV0dXJucyB0aGlzIGZpbHRlcmVkIGFycmF5LlxyXG5cdFx0dGhpcy5zZXRGaWx0ZXJBcnJheSA9IGZ1bmN0aW9uKGxpc3ROYW1lKSB7XHJcblx0XHRcdHZhciBtYWluQXJyYXkgPSB0aGlzLkxpc3RzW2xpc3ROYW1lXS5tYWluO1xyXG5cdFx0XHRmb3IodmFyIGkgPSAwOyBpIDwgbWFpbkFycmF5Lmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdFx0aWYobWFpbkFycmF5W2ldLnNob3dJdGVtID09PSB0cnVlKSB7XHJcblx0XHRcdFx0XHR0aGlzLkxpc3RzW2xpc3ROYW1lXS5maWx0ZXJlZC5wdXNoKG1haW5BcnJheVtpXSk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHRcdHJldHVybiB0aGlzLkxpc3RzW2xpc3ROYW1lXS5maWx0ZXJlZDtcclxuXHRcdH07XHJcblx0XHRcclxuXHRcdHRoaXMudG9nZ2xlU2VsZWN0ID0gZnVuY3Rpb24oaXRlbSxpbmRleCxrZXksbGlzdE5hbWUpIHtcclxuXHRcdFx0a2V5ID0ga2V5ID8ga2V5IDogJ2lkJztcclxuXHRcdFx0dmFyIGlkID0gaXRlbVtrZXldO1xyXG5cdFx0XHRpZighaW5kZXggJiYgaW5kZXggIT09IDApIHtcclxuXHRcdFx0XHRpbmRleCA9IHRoaXMuZmluZEJ5SWQoaWQsbGlzdE5hbWUsa2V5LCdtYWluJyk7XHJcblx0XHRcdH1cclxuXHRcdFx0aWYoIWl0ZW0uc2VsZWN0ZWQpIHtcclxuXHRcdFx0XHR0aGlzLnNlbGVjdEl0ZW0oaXRlbSxpbmRleCxrZXksbGlzdE5hbWUpO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdHRoaXMuZGVzZWxlY3RJdGVtKGlkLGluZGV4LGtleSxsaXN0TmFtZSk7XHJcblx0XHRcdH1cclxuXHRcdH07XHJcblxyXG5cdFx0Ly8gRnVuY3Rpb24gdG8gY3JlYXRlIGEgY29tbWEgc2VwYXJhdGVkIGxpc3Qgb2YgYSBwYXJ0aWN1bGFyIHByb3BlcnR5IHdpdGhpbiBvbmUgb2YgdGhlIGxpc3RzLiBrZXlOYW1lIHNwZWNpZmllcyBwcm9wZXJ0eSB0byB1c2UgKG5hbWUgb2YgdGhlIGl0ZW0sIGdlbmVyYWxseSkuIFxyXG5cdFx0dGhpcy5tYWtlTGlzdCA9IGZ1bmN0aW9uKGxpc3ROYW1lLGtleU5hbWUsc3ViTGlzdCkge1xyXG5cdFx0XHRpZighc3ViTGlzdCkge1xyXG5cdFx0XHRcdHN1Ykxpc3QgPSAnbWFpbic7XHJcblx0XHRcdH1cclxuXHRcdFx0dmFyIGxpc3RBcnJheSA9IHRoaXMuTGlzdHNbbGlzdE5hbWVdW3N1Ykxpc3RdLFxyXG5cdFx0XHRcdG1lc3NhZ2UgPSAnJztcclxuXHRcdFx0Zm9yKHZhciBpID0gMDsgaSA8IGxpc3RBcnJheS5sZW5ndGg7IGkrKykge1xyXG5cdFx0XHRcdG1lc3NhZ2UgKz0gbGlzdEFycmF5W2ldW2tleU5hbWVdO1xyXG5cdFx0XHRcdGlmKGkgPCBsaXN0QXJyYXkubGVuZ3RoIC0gMSkge1xyXG5cdFx0XHRcdFx0bWVzc2FnZSArPSAnLCAnO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0XHRyZXR1cm4gbWVzc2FnZTtcclxuXHRcdH07XHJcblxyXG5cdFx0Ly8gUmV0dXJucyB0aGUgaW5kZXggb2YgdGhlIGl0ZW0gd2l0aGluIHRoZSBhbiBhcnJheSAoc3BlY2lmaWVkIGJ5IGxpc3ROYW1lIGFuZCBzdWJMaXN0KSBvciBmYWxzZSBpZiBub3QgZm91bmQuICBTZWFyY2ggYnkga2V5IChzaG91bGQgYmUgdW5pcXVlIGlkKS5cclxuXHRcdHRoaXMuZmluZEJ5SWQgPSBmdW5jdGlvbihpZCxsaXN0TmFtZSxrZXksc3ViTGlzdCkge1xyXG5cdFx0XHRrZXkgPSB0eXBlb2Yga2V5ICE9PSAndW5kZWZpbmVkJyA/IGtleSA6ICdpZCc7XHJcblx0XHRcdHN1Ykxpc3QgPSB0eXBlb2Ygc3ViTGlzdCAhPT0gJ3VuZGVmaW5lZCcgPyBzdWJMaXN0IDogJ21haW4nO1xyXG5cdFx0XHR2YXIgbGlzdEFycmF5ID0gdGhpcy5MaXN0c1tsaXN0TmFtZV1bc3ViTGlzdF07XHJcblx0XHRcdGZvcih2YXIgaSA9IDA7IGkgPCBsaXN0QXJyYXkubGVuZ3RoOyBpKyspIHtcclxuXHRcdFx0XHRpZihTdHJpbmcobGlzdEFycmF5W2ldW2tleV0pID09PSBTdHJpbmcoaWQpKSB7XHJcblx0XHRcdFx0XHRyZXR1cm4gaTtcclxuXHRcdFx0XHR9XHRcdFx0XHJcblx0XHRcdH1cclxuXHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0fTtcclxuXHRcdFxyXG5cdFx0Ly8gRGVsZXRlcyBpdGVtcyBmb3VuZCBpbiBkZWxBcnJheSBmcm9tIG1haW4gbGlzdCBzZWFyY2hpbmcgYnkgaWQuIERvZXMgbm90aGluZyB3aXRoIGl0ZW1zIHdoaWNoIGFyZSBub3QgZm91bmQuXHJcblx0XHR0aGlzLmRlbGV0ZUJ5SWQgPSBmdW5jdGlvbihkZWxBcnJheSxpZE5hbWUsbGlzdE5hbWUsc3ViTGlzdCkge1xyXG5cdFx0XHR2YXIgbnVtSXRlbXMgPSBkZWxBcnJheS5sZW5ndGg7XHJcblx0XHRcdHN1Ykxpc3QgPSB0eXBlb2Ygc3ViTGlzdCAhPT0gJ3VuZGVmaW5lZCcgPyBzdWJMaXN0IDogJ21haW4nO1xyXG5cdFx0XHRmb3IodmFyIGkgPSAwOyBpIDwgbnVtSXRlbXM7IGkrKykge1xyXG5cdFx0XHRcdHZhciBpbWdJbmRleCA9IGxGdW5jLmZpbmRCeUlkKGRlbEFycmF5W2ldW2lkTmFtZV0sbGlzdE5hbWUsaWROYW1lLHN1Ykxpc3QpO1xyXG5cdFx0XHRcdGlmKGltZ0luZGV4ICE9PSBmYWxzZSkge1xyXG5cdFx0XHRcdFx0bEZ1bmMuTGlzdHNbbGlzdE5hbWVdLm1haW4uc3BsaWNlKGltZ0luZGV4LDEpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fTtcclxuXHRcdFxyXG5cdFx0Ly8gU2VsZWN0cyBhbGwgaXRlbXMgd2l0aGluIHRoZSBjdXJyZW50IGZpbHRlciBzZXRcclxuXHRcdHRoaXMuc2VsZWN0QWxsID0gZnVuY3Rpb24oa2V5LGxpc3ROYW1lKSB7XHJcblx0XHRcdGtleSA9IHR5cGVvZiBrZXkgIT09ICd1bmRlZmluZWQnID8ga2V5IDogJ2lkJztcclxuXHRcdFx0dmFyIGZpbHRlcmVkSXRlbXMgPSB0aGlzLnNldEZpbHRlckFycmF5KGxpc3ROYW1lKTtcclxuXHRcdFx0dmFyIG51bUl0ZW1zID0gZmlsdGVyZWRJdGVtcy5sZW5ndGg7XHJcblx0XHRcdGZvcih2YXIgaSA9IDA7IGkgPCBudW1JdGVtczsgaSsrKSB7XHJcblx0XHRcdFx0aWYoIWZpbHRlcmVkSXRlbXNbaV0uc2VsZWN0ZWQpIHtcclxuXHRcdFx0XHRcdGxGdW5jLnNlbGVjdEl0ZW0oZmlsdGVyZWRJdGVtc1tpXSx1bmRlZmluZWQsa2V5LGxpc3ROYW1lKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdH07XHJcblx0XHRcclxuXHRcdC8vIERlc2VsZWN0cyBhbGwgaXRlbXNcclxuXHRcdHRoaXMuZGVzZWxlY3RBbGwgPSBmdW5jdGlvbihrZXksbGlzdE5hbWUpIHtcclxuXHRcdFx0a2V5ID0gdHlwZW9mIGtleSAhPT0gJ3VuZGVmaW5lZCcgPyBrZXkgOiAnaWQnO1xyXG5cdFx0XHR2YXIgbnVtUGhvdG9zID0gdGhpcy5MaXN0c1tsaXN0TmFtZV0ubWFpbi5sZW5ndGg7XHJcblx0XHRcdGlmKCF0aGlzLmNoZWNrU2VsZWN0ZWQobGlzdE5hbWUpKSB7XHJcblx0XHRcdFx0Zm9yKHZhciBpID0gMDsgaSA8IG51bVBob3RvczsgaSsrKSB7XHJcblx0XHRcdFx0XHR2YXIgaXRlbSA9IHRoaXMuTGlzdHNbbGlzdE5hbWVdLm1haW5baV07XHJcblx0XHRcdFx0XHRpZihpdGVtLnNlbGVjdGVkKSB7XHJcblx0XHRcdFx0XHRcdHRoaXMuZGVzZWxlY3RJdGVtKGl0ZW0uaWQsaSxrZXksbGlzdE5hbWUpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fTtcclxuXHRcdFxyXG5cdFx0dGhpcy5kZXNlbGVjdEl0ZW0gPSBmdW5jdGlvbihpZCxpbmRleCxrZXksbGlzdE5hbWUpIHtcclxuXHRcdFx0a2V5ID0gdHlwZW9mIGtleSAhPT0gJ3VuZGVmaW5lZCcgPyBrZXkgOiAnaWQnO1xyXG5cdFx0XHRsRnVuYy5MaXN0c1tsaXN0TmFtZV0ubWFpbltpbmRleF0uc2VsZWN0ZWQgPSBmYWxzZTtcclxuXHRcdFx0dmFyIHNlbEluZGV4ID0gbEZ1bmMuZmluZEJ5SWQoaWQsbGlzdE5hbWUsa2V5LCdzZWxlY3RlZCcpO1xyXG5cdFx0XHRsRnVuYy5MaXN0c1tsaXN0TmFtZV0uc2VsZWN0ZWQuc3BsaWNlKHNlbEluZGV4LDEpO1xyXG5cdFx0fTtcclxuXHJcblx0XHR0aGlzLnNlbGVjdEl0ZW0gPSBmdW5jdGlvbihpdGVtLGluZGV4LGtleSxsaXN0TmFtZSkge1xyXG5cdFx0XHRrZXkgPSB0eXBlb2Yga2V5ICE9PSAndW5kZWZpbmVkJyA/IGtleSA6ICdpZCc7XHJcblx0XHRcdGlmKCFpbmRleCkge1xyXG5cdFx0XHRcdGluZGV4ID0gdGhpcy5maW5kQnlJZChpdGVtW2tleV0sbGlzdE5hbWUsa2V5LCdtYWluJyk7XHJcblx0XHRcdH1cclxuXHRcdFx0dGhpcy5MaXN0c1tsaXN0TmFtZV0ubWFpbltpbmRleF0uc2VsZWN0ZWQgPSB0cnVlO1xyXG5cdFx0XHR0aGlzLkxpc3RzW2xpc3ROYW1lXS5zZWxlY3RlZC5wdXNoKGl0ZW0pO1xyXG5cdFx0fTtcclxuXHRcdFxyXG5cdFx0Ly8gQWZ0ZXIgaXRlbXMgYXJlIG1vdmVkIGluIGxpc3QsIHNldHMgdGhlIG9yZGVyIHZhbHVlIChuYW1lZCBvcmRLZXkpIHRvIHRoZSBjb3JyZWN0IG51bWJlciBmb3IgdGhlIERCLiAgQWxzbyBhZGRzIG9yZGVyIGFuZCBzZWN0aW9uIHRvIHRoZSBzZWxlY3RlZCBsaXN0LlxyXG5cdFx0dmFyIHJlc2V0T3JkZXIgPSBmdW5jdGlvbihrZXksb3JkS2V5LGxpc3ROYW1lLHNlY3Rpb24pIHtcclxuXHRcdFx0dmFyIHNlbEluZGV4ID0gMDtcclxuXHRcdFx0Zm9yKGkgPSAwOyBpIDwgbEZ1bmMuTGlzdHNbbGlzdE5hbWVdLm1haW4ubGVuZ3RoOyBpKyspIHtcclxuXHRcdFx0XHRsRnVuYy5MaXN0c1tsaXN0TmFtZV0ubWFpbltpXVtvcmRLZXldID0gaTtcclxuXHRcdFx0XHRpZihsRnVuYy5MaXN0c1tsaXN0TmFtZV0ubWFpbi5zZWxlY3RlZCkge1xyXG5cdFx0XHRcdFx0c2VsSW5kZXggPSBsRnVuYy5maW5kQnlJZChsRnVuYy5MaXN0c1tsaXN0TmFtZV0ubWFpbltpXVtrZXldLGxpc3ROYW1lLGtleSwnc2VsZWN0ZWQnKTtcclxuXHRcdFx0XHRcdGxGdW5jLkxpc3RzW2xpc3ROYW1lXS5zZWxlY3RlZFtzZWxJbmRleF1bb3JkS2V5XSA9IGk7XHJcblx0XHRcdFx0XHRpZih0eXBlb2Ygc2VjdGlvbiAhPT0gJ3VuZGVmaW5lZCcpIHtcclxuXHRcdFx0XHRcdFx0bEZ1bmMuTGlzdHNbbGlzdE5hbWVdLnNlbGVjdGVkW3NlbEluZGV4XS5zZWN0aW9uID0gc2VjdGlvbjtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdH07XHJcblx0XHRcclxuXHRcdC8vIEFkZHMgdGhlIHNlbGVjdGVkIGl0ZW1zIHRvIGEgc2VjdGlvbiBhbmQgcmVvcmRlcnMgaXRlbXMgdG8gZ3JvdXAgdGhvc2UgdG9nZXRoZXIuXHJcblx0XHR0aGlzLmdyb3VwU2VsZWN0ZWQgPSBmdW5jdGlvbihrZXksb3JkS2V5LHNlY3Rpb24sbGlzdE5hbWUpIHtcclxuXHRcdFx0dmFyIGxpc3RUZW1wID0gbEZ1bmMuTGlzdHNbbGlzdE5hbWVdLm1haW4sXHJcblx0XHRcdFx0Zmlyc3RJbmRleCA9IC0xLFxyXG5cdFx0XHRcdG1vdmVJbmRleCA9IDAsXHJcblx0XHRcdFx0c2VsSW5kZXg7XHJcblx0XHRcdGZvcih2YXIgaSA9IDA7IGkgPCBsaXN0VGVtcC5sZW5ndGg7IGkrKykge1xyXG5cdFx0XHRcdGlmKGxpc3RUZW1wW2ldLnNlbGVjdGVkIHx8IGxsaXN0VGVtcFtpXS5zZWN0aW9uID09PSBzZWN0aW9uKSB7XHJcblx0XHRcdFx0XHRpZihmaXJzdEluZGV4ID0gLTEpIHtcclxuXHRcdFx0XHRcdFx0Zmlyc3RJbmRleCA9IGk7XHJcblx0XHRcdFx0XHRcdGxpc3RUZW1wW2ldLnNlY3Rpb24gPSBzZWN0aW9uO1xyXG5cdFx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdFx0bW92ZUluZGV4ID0gaTtcclxuXHRcdFx0XHRcdFx0bGlzdFRlbXBbbW92ZUluZGV4XS5zZWN0aW9uID0gc2VjdGlvbjtcclxuXHRcdFx0XHRcdFx0bGlzdFRlbXAuc3BsaWNlKGZpcnN0SW5kZXgrMSwwLGxpc3RUZW1wLnNwbGljZShtb3ZlSW5kZXgsMSlbMF0pO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0XHRsRnVuYy5MaXN0c1tsaXN0TmFtZV0ubWFpbiA9IGxpc3RUZW1wO1xyXG5cdFx0XHRyZXNldE9yZGVyKGtleSxvcmRLZXksbGlzdE5hbWUsc2VjdGlvbik7XHJcblx0XHR9O1xyXG5cdFx0XHJcblx0XHQvLyBNb3ZlcyBhbiBpdGVtIG9yIGl0ZW1zLiAgQ2hlY2tzIHRoZSBzZWN0aW9ucyBvZiB0aGUgaXRlbXMgdG8gZW5zdXJlIGl0ZW1zIHdpdGhpbiBzYW1lIHNlY3Rpb24gc3RpY2sgdG9nZXRoZXIuXHJcblx0XHR0aGlzLm1vdmVJdGVtcyA9IGZ1bmN0aW9uKGRpcmVjdGlvbixrZXksb3JkS2V5LGxpc3ROYW1lKSB7XHJcblx0XHRcdHZhciBzZWxTZWN0aW9uLFxyXG5cdFx0XHRcdGxpc3RMZW4gPSBsRnVuYy5MaXN0c1tsaXN0TmFtZV0ubWFpbi5sZW5ndGgsXHJcblx0XHRcdFx0bXVsdGlwbGllcixcclxuXHRcdFx0XHRuZXh0U2VjdGlvbjtcclxuXHRcdFx0dmFyIGkgPSBkaXJlY3Rpb24gPiAwID8gbGlzdExlbiAtIDEgOiAwO1xyXG5cdFx0XHQvLyBMb29wIHRocm91Z2ggbWFpbiBsaXN0IG9wcG9zaXRlIHRoZSBkaXJlY3Rpb24gb2YgdGhlIG1vdmVtZW50IG9mIGl0ZW1zIHRvIG1ha2Ugc3VyZSBvcmRlciBpcyBvdGhlcndpc2UgcHJlc2VydmVkLlxyXG5cdFx0XHRmb3IoaTsgaSA8IGxpc3RMZW4gJiYgaSA+PSAwOyBpID0gaSAtIGRpcmVjdGlvbikge1xyXG5cdFx0XHRcdG11bHRpcGxpZXIgPSAxO1xyXG5cdFx0XHRcdC8vIElmIHRoZSBpdGVtIGlzIGluIHRoZSBzZWxlY3RlZCBsaXN0IG9yIHRoZSBzZWN0aW9uIGlzIG1vdmluZy5cclxuXHRcdFx0XHRpZihsRnVuYy5maW5kQnlJZChsRnVuYy5MaXN0c1tsaXN0TmFtZV0ubWFpbltpXVtrZXldLGxpc3ROYW1lLGtleSwnc2VsZWN0ZWQnKSAhPT0gZmFsc2UgfHwgbEZ1bmMuTGlzdHNbbGlzdE5hbWVdLm1haW5baV0uc2VjdGlvbiA9PT0gc2VsU2VjdGlvbikge1xyXG5cdFx0XHRcdFx0Ly8gU2V0IHNlbFNlY3Rpb24gdG8gc2VjdGlvbiBvZiBhIHNlbGVjdGVkIGl0ZW0uXHJcblx0XHRcdFx0XHRpZihsRnVuYy5MaXN0c1tsaXN0TmFtZV0ubWFpbltpXS5zZWN0aW9uICE9PSAnJykge1xyXG5cdFx0XHRcdFx0XHRzZWxTZWN0aW9uID0gbEZ1bmMuTGlzdHNbbGlzdE5hbWVdLm1haW5baV0uc2VjdGlvbjtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdC8vIElmIHRoZSBtb3ZlbWVudCB3b3VsZCBwdXQgdGhlIGl0ZW0gb3V0c2lkZSBvZiBsaXN0IGJvdW5kYXJpZXMgb3IgYW5vdGhlciBzZWxlY3Rpb24gaGFzIGhpdCB0aG9zZSBib3VuZGFyaWVzIGRvbid0IG1vdmUuXHJcblx0XHRcdFx0XHRpZihpK2RpcmVjdGlvbiA+PSAwICYmIGkrZGlyZWN0aW9uIDwgbGlzdExlbiAmJiAhbEZ1bmMuTGlzdHNbbGlzdE5hbWVdLm1haW5baStkaXJlY3Rpb25dLnNlbGVjdGVkKSB7XHJcblx0XHRcdFx0XHRcdC8vIElmIHRoZSBuZXh0IGl0ZW0gaXMgaW4gYSBkZWZpbmVkIHNlY3Rpb24sIG5lZWQgdG8gY2hlY2sgJiBjb3VudCBpdGVtcyBpbiBzZWN0aW9uIHRvIGp1bXAgb3ZlciBvciBzdG9wIG1vdmVtZW50LlxyXG5cdFx0XHRcdFx0XHRpZihsRnVuYy5MaXN0c1tsaXN0TmFtZV0ubWFpbltpK2RpcmVjdGlvbl0uc2VjdGlvbiAhPT0gJycgJiYgbEZ1bmMuTGlzdHNbbGlzdE5hbWVdLm1haW5baV0uc2VjdGlvbiAhPT0gbEZ1bmMuTGlzdHNbbGlzdE5hbWVdLm1haW5baStkaXJlY3Rpb25dLnNlY3Rpb24pIHtcclxuXHRcdFx0XHRcdFx0XHRuZXh0U2VjdGlvbiA9IGxGdW5jLkxpc3RzW2xpc3ROYW1lXS5tYWluW2krZGlyZWN0aW9uXS5zZWN0aW9uO1xyXG5cdFx0XHRcdFx0XHRcdG11bHRpcGxpZXIgPSAwO1xyXG5cdFx0XHRcdFx0XHRcdC8vIExvb3AgYmFjayB0aHJvdWdoIGFycmF5IGluIHRoZSBkaXJlY3Rpb24gb2YgbW92ZW1lbnQuXHJcblx0XHRcdFx0XHRcdFx0Zm9yKHZhciBqID0gaSArIGRpcmVjdGlvbjsgaiA8IGxpc3RMZW4gJiYgaiA+PSAwOyBqID0gaiArIGRpcmVjdGlvbikge1xyXG5cdFx0XHRcdFx0XHRcdFx0Ly8gSWYgdGhlIGl0ZW0gaXMgaW4gdGhlIHNlY3Rpb24uLi5cclxuXHRcdFx0XHRcdFx0XHRcdGlmKGxGdW5jLkxpc3RzW2xpc3ROYW1lXS5tYWluW2pdLnNlY3Rpb24gPT09IG5leHRTZWN0aW9uKSB7XHJcblx0XHRcdFx0XHRcdFx0XHRcdC8vIElmIHNlbGVjdGVkIHN0b3AgbW92ZW1lbnQgYW5kIGJyZWFrLlxyXG5cdFx0XHRcdFx0XHRcdFx0XHRpZihsRnVuYy5MaXN0c1tsaXN0TmFtZV0ubWFpbltqXS5zZWxlY3RlZCkge1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRcdG11bHRpcGxpZXIgPSAwO1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdFx0XHRcdC8vIElmIG5vdCwgY291bnQgc2VjdGlvbi5cclxuXHRcdFx0XHRcdFx0XHRcdFx0bXVsdGlwbGllcisrO1xyXG5cdFx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdFx0XHRcdFx0Ly8gQnJlYWsgbG9vcCBhdCBmaXJzdCBpdGVtIG5vdCBpbiBzZWN0aW9uLlxyXG5cdFx0XHRcdFx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0Ly8gRmluYWwgY2hlY2s6IG9ubHkgbW92ZSBhbiBpdGVtIGlmIGl0IGlzIHNlbGVjdGVkIG9yIHRvIGVuc3VyZSBpdGVtcyBvZiB0aGUgc2FtZSBzZWN0aW9uIHN0aWNrIHRvZ2V0aGVyXHJcblx0XHRcdFx0XHRcdGlmKGxGdW5jLkxpc3RzW2xpc3ROYW1lXS5tYWluW2ldLnNlbGVjdGVkIHx8IGxGdW5jLkxpc3RzW2xpc3ROYW1lXS5tYWluW2krZGlyZWN0aW9uXS5zZWN0aW9uICE9PSBsRnVuYy5MaXN0c1tsaXN0TmFtZV0ubWFpbltpXS5zZWN0aW9uKSB7XHJcblx0XHRcdFx0XHRcdFx0bEZ1bmMuTGlzdHNbbGlzdE5hbWVdLm1haW4uc3BsaWNlKGkrKGRpcmVjdGlvbiptdWx0aXBsaWVyKSwwLGxGdW5jLkxpc3RzW2xpc3ROYW1lXS5tYWluLnNwbGljZShpLDEpWzBdKTtcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0XHQvLyBSZXNldCBvcmRlciB2YXJpYWJsZSBmb3IgZGF0YWJhc2UuXHJcblx0XHRcdHJlc2V0T3JkZXIoa2V5LG9yZEtleSxsaXN0TmFtZSk7XHJcblx0XHR9O1xyXG5cdFx0XHJcblx0XHR0aGlzLnNldE9yZGVyU2F2ZSA9IGZ1bmN0aW9uKG9yZGVyU2F2ZSkge1xyXG5cdFx0XHR0aGlzLm9yZGVyU2F2ZVBlbmRpbmcgPSBvcmRlclNhdmUgPyBvcmRlclNhdmUgOiBmYWxzZTtcclxuXHRcdH07XHJcblx0XHRcclxuXHR9XSk7XHJcbn0pKCk7Il0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
