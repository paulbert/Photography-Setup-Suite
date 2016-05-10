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
			currentFilteredList = [],
			orderSavePending = false;
		
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
		
		this.getOrderSave = function() {
			return orderSavePending;
		};
		
		this.setOrderSave = function(orderSave) {
			orderSavePending = orderSave ? orderSave : false;
		};
		
	}]);
})();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImZpbHRlcnMvZmlsdGVyRGlyZWN0aXZlLmpzIiwibGlzdHMvbGlzdERpcmVjdGl2ZS5qcyIsIm92ZXJsYXkvb3ZlcmxheURpcmVjdGl2ZS5qcyIsImZpbHRlcnMvY29tcG9uZW50cy9maWx0ZXJDaGVja2JveENvbXBvbmVudERpcmVjdGl2ZS5qcyIsImZpbHRlcnMvY29tcG9uZW50cy9maWx0ZXJRdWVyeUNvbXBvbmVudERpcmVjdGl2ZS5qcyIsImZpbHRlckNvbnRyb2xsZXIuanMiLCJmaWx0ZXJTZXJ2aWNlLmpzIiwiY29tcG9uZW50cy9maWx0ZXJDb21wb25lbnRDb250cm9sbGVyLmpzIiwib3ZlcmxheUNvbnRyb2xsZXIuanMiLCJsaXN0Q29udHJvbGxlci5qcyIsImxpc3RTZXJ2LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FDSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDaENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDeEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDckJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDM0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2xEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDeERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJwaG90by10b29scy5qcyIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpIHtcblx0YW5ndWxhci5tb2R1bGUoJ3Bob3RvRWRpdENvbXBvbmVudHMnLCBbJ2xpc3RNb2QnLCdmaWx0ZXJNb2QnLCdvdmVybGF5TW9kJ10pO1xuXHRcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG5cdFxyXG5cdC8qXHJcblx0U2VhcmNoIHZhcmlhYmxlIHNob3VsZCBiZSBhbiBhcnJheSBvZiBvYmplY3RzIG5hbWVkIHRoZSBzYW1lIGFzIHRoZSBwcm9wZXJ0aWVzIG9mIHRoZSBvYmplY3RzIHdpdGhpbiB0aGUgbGlzdC5cclxuXHRcdFJlcXVpcmVzIGEgJ3F1ZXJ5JyBwcm9wZXJ0eSB3aXRoaW4gb2JqZWN0IHdoaWNoIGlzIG1vZGVsZWQgdG8gYSB0ZXh0L2lucHV0IGZpbHRlci5cclxuXHRcdElmIHRoZSBzZWFyY2hlZCBwcm9wZXJ0eSBpcyBhbiBhcnJheSBvZiBvYmplY3RzIChpZiwgZm9yIGV4YW1wbGUsIGltYWdlcyBjYW4gYmUgaW4gbWFueSBnYWxsZXJ5IGdyb3VwaW5ncyksIGFkZCAnaXNBcnJheScgcHJvcGVydHkgYW5kIHNldCB0byB0cnVlLCBhbHNvIGFkZCAnc2VhcmNoT24nIHByb3BlcnR5IGFuZCBzZXQgdG8gdGhlIG5hbWUgb2YgdGhlIHByb3BlcnR5IHdpdGhpbiBvYmplY3RzLlxyXG5cdFx0RXhhbXBsZTogaW1hZ2VzID0gWyB7aW1nbmFtZTogJ2ltZzEuanBnJywgZ2FsbGVyaWVzOiBbIHsgaWQ6MSwgbmFtZTonZ2FsbGVyeTEnIH0sIHsgaWQ6MiwgbmFtZTonZ2FsbGVyeTInfSBdfSwgLi4uXVxyXG5cdFx0c2VhcmNoID0geyBnYWxsZXJpZXM6IHsgcXVlcnk6JycsIGlzQXJyYXk6IHRydWUsIHNlYXJjaE9uOiAnbmFtZScgfSB9XHJcblx0XHRGb3IgYSBjaGVja2JveCBmaWx0ZXIsIGluY2x1ZGUgYW4gb2JqZWN0IGNhbGxlZCAnY2hlY2tib3hlcycgd2l0aCBhICdub25lJyBwcm9wZXJ0eSBhbmQgYWxsIHBvc3NpYmxlIHZhbHVlcyBpbiAwLW4gcHJvcGVydHkuXHJcblx0XHRCYXNlZCBvbiBhYm92ZSBleGFtcGxlOiBzZWFyY2ggPSB7IGdhbGxlcmllczogeyAuLi4gY2hlY2tib3hlczogeyBub25lOiB0cnVlLCAwOidnYWxsZXJ5MScsMTonZ2FsbGVyeTInIH0gfVxyXG5cdCovXHJcblx0XHJcblx0YW5ndWxhci5tb2R1bGUoJ2ZpbHRlck1vZCcsW10pXHJcblx0LmRpcmVjdGl2ZSgnZmlsdGVyQmFyJywgZnVuY3Rpb24oKSB7XHJcblx0XHRyZXR1cm4ge1xyXG5cdFx0XHRzY29wZToge1xyXG5cdFx0XHRcdHNlYXJjaDonPScsXHJcblx0XHRcdFx0ZnBvc2l0aW9uOic9PycsXHJcblx0XHRcdFx0aW5saW5lOidAPycsXHJcblx0XHRcdFx0dG1wbHQ6Jz0nLFxyXG5cdFx0XHRcdGNoZWNraXRlbXM6Jz0/J1xyXG5cdFx0XHR9LFxyXG5cdFx0XHR0ZW1wbGF0ZTogJzxkaXYgbmctaW5jbHVkZT1cInRlbXBsYXRlVXJsXCI+PC9kaXY+JyxcclxuXHRcdFx0Y29udHJvbGxlcjonZmlsdGVyQmFyQ29udHJvbGxlcicsXHJcblx0XHRcdGNvbnRyb2xsZXJBczonZmJhcicsXHJcblx0XHRcdGxpbms6IGZ1bmN0aW9uKHNjb3BlLGVsZW1lbnQsYXR0cnMpIHtcclxuXHRcdFx0XHRzY29wZS50ZW1wbGF0ZVVybCA9IHNjb3BlLnRtcGx0LmJhc2UgKyBzY29wZS50bXBsdC5maWxlTmFtZTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH0pXHJcblx0O1xyXG5cdFx0XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xuXHRhbmd1bGFyLm1vZHVsZSgnbGlzdE1vZCcsW10pXG5cdC5kaXJlY3RpdmUoJ2xpc3RPZkl0ZW1zJyxmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0c2NvcGU6IHtcblx0XHRcdFx0c2VhcmNoOic9Jyxcblx0XHRcdFx0bGlzdE5hbWU6Jz1saXN0Jyxcblx0XHRcdFx0a2V5TmFtZTonQGtleScsXG5cdFx0XHRcdG9yZEtleTonQG9yZG5hbWUnLFxuXHRcdFx0XHQvLyBBZGRpdGlvbmFsIGZ1bmN0aW9ucyB0byBiZSBjYWxsZWQgZnJvbSBidXR0b25zIGluIHRoZSBsaXN0IChzYXZlIGluZm8sIGRlbGV0ZSwgZXRjKVxuXHRcdFx0XHRhZGRGdW5jczonPWZ1bmNzJyxcblx0XHRcdFx0dG1wbHQ6Jz0nXG5cdFx0XHR9LFxuXHRcdFx0dGVtcGxhdGU6ICc8ZGl2IG5nLWluY2x1ZGU9XCJ0ZW1wbGF0ZVVybFwiPjwvZGl2PicsXG5cdFx0XHRjb250cm9sbGVyOidsaXN0Q29udHJvbGxlcicsXG5cdFx0XHRjb250cm9sbGVyQXM6J2xpc3QnLFxuXHRcdFx0bGluazogZnVuY3Rpb24oc2NvcGUsZWxlbWVudCxhdHRycykge1xuXHRcdFx0XHRzY29wZS50ZW1wbGF0ZVVybCA9IHNjb3BlLnRtcGx0LmJhc2UgKyBzY29wZS50bXBsdC5maWxlTmFtZTtcblx0XHRcdH1cblx0XHR9XG5cdH0pXG5cdDtcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG5cdFxyXG5cdGFuZ3VsYXIubW9kdWxlKCdvdmVybGF5TW9kJyxbXSlcclxuXHQuZGlyZWN0aXZlKCdvdmVybGF5JywgZnVuY3Rpb24oKSB7XHJcblx0XHRyZXR1cm4ge1xyXG5cdFx0XHRzY29wZToge1xyXG5cdFx0XHRcdG1lc3NhZ2U6Jz0nLFxyXG5cdFx0XHRcdG1lc3NhZ2VOdW06Jz1udW1iZXInLFxyXG5cdFx0XHRcdGJ0bkNvbmZpZzonPWNmZycsXHJcblx0XHRcdFx0Ly8gRnVuY3Rpb24gZm9yIGFjdGlvbiBvZiBvdmVybGF5IChjYW5jZWwvYmFjayBpcyBpbiBjb250cm9sbGVyKVxyXG5cdFx0XHRcdGRvQWN0aW9uOic9ZnVuYycsXHJcblx0XHRcdFx0YmFzZTonQD8nXHJcblx0XHRcdH0sXHJcblx0XHRcdGNvbnRyb2xsZXI6J292ZXJsYXlDb250cm9sbGVyJyxcclxuXHRcdFx0Y29udHJvbGxlckFzOidvdmVyJyxcclxuXHRcdFx0dGVtcGxhdGU6ICc8ZGl2IG5nLWluY2x1ZGU9XCJ0ZW1wbGF0ZVVybFwiPjwvZGl2PicsXHJcblx0XHRcdGxpbms6IGZ1bmN0aW9uKHNjb3BlLGVsZW1lbnQsYXR0cnMpIHtcclxuXHRcdFx0XHQvLyBJZiBubyBiYXNlIGlzIHNwZWNpZmllZCwgdXNlIGxvY2F0aW9uIGlmIGluc3RhbGxlZCB2aWEgYm93ZXIuXHJcblx0XHRcdFx0aWYodHlwZW9mIHNjb3BlLmJhc2UgPT09ICd1bmRlZmluZWQnKSB7XHJcblx0XHRcdFx0XHRzY29wZS5iYXNlID0gJy9ib3dlcl9jb21wb25lbnRzL1Bob3RvZ3JhcGh5LVNldHVwLVN1aXRlL3RlbXBsYXRlcy9vdmVybGF5Lyc7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdHNjb3BlLnRlbXBsYXRlVXJsID0gc2NvcGUuYmFzZSArICdvdmVybGF5Lmh0bWwnO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fSlcclxuXHQ7XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG5cdFxyXG5cdGFuZ3VsYXIubW9kdWxlKCdmaWx0ZXJNb2QnKVxyXG5cdC5kaXJlY3RpdmUoJ2ZpbHRlckNoZWNrYm94JywgZnVuY3Rpb24oKSB7XHJcblx0XHRcdHJldHVybiB7XHJcblx0XHRcdFx0c2NvcGU6IHtcclxuXHRcdFx0XHRcdGl0ZW1zOic9JyxcclxuXHRcdFx0XHRcdHNlYXJjaDonPScsXHJcblx0XHRcdFx0XHRiYXNlOic9PycsXHJcblx0XHRcdFx0XHRsYWJlbDonQD8nXHJcblx0XHRcdFx0fSxcclxuXHRcdFx0XHRjb250cm9sbGVyOidmaWx0ZXJDb21wQ29udHJvbGxlcicsXHJcblx0XHRcdFx0Y29udHJvbGxlckFzOidmY29tcCcsXHJcblx0XHRcdFx0dGVtcGxhdGU6ICc8ZGl2IG5nLWluY2x1ZGU9XCJ0ZW1wbGF0ZVVybFwiPjwvZGl2PicsXHJcblx0XHRcdFx0bGluazogZnVuY3Rpb24oc2NvcGUsZWxlbWVudCxhdHRycykge1xyXG5cdFx0XHRcdFx0Ly8gSWYgbm8gYmFzZSBpcyBzcGVjaWZpZWQsIHVzZSBsb2NhdGlvbiBpZiBpbnN0YWxsZWQgdmlhIGJvd2VyLlxyXG5cdFx0XHRcdFx0aWYodHlwZW9mIHNjb3BlLmJhc2UgPT09ICd1bmRlZmluZWQnKSB7XHJcblx0XHRcdFx0XHRcdHNjb3BlLmJhc2UgPSAnL2Jvd2VyX2NvbXBvbmVudHMvUGhvdG9ncmFwaHktU2V0dXAtU3VpdGUvdGVtcGxhdGVzL2ZpbHRlcnMvJztcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdHNjb3BlLnRlbXBsYXRlVXJsID0gc2NvcGUuYmFzZSArICdmaWx0ZXJDaGVja2JveGVzLmh0bWwnO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fSlcclxuXHQ7XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG5cdFxyXG5cdGFuZ3VsYXIubW9kdWxlKCdmaWx0ZXJNb2QnKVxyXG5cdC5kaXJlY3RpdmUoJ2ZpbHRlclF1ZXJ5JywgZnVuY3Rpb24oKSB7XHJcblx0XHRcdHJldHVybiB7XHJcblx0XHRcdFx0c2NvcGU6IHtcclxuXHRcdFx0XHRcdHNlYXJjaDonPScsXHJcblx0XHRcdFx0XHRiYXNlOic9PycsXHJcblx0XHRcdFx0XHRsYWJlbDonQD8nXHJcblx0XHRcdFx0fSxcclxuXHRcdFx0XHR0ZW1wbGF0ZTogJzxkaXYgbmctaW5jbHVkZT1cInRlbXBsYXRlVXJsXCI+PC9kaXY+JyxcclxuXHRcdFx0XHRsaW5rOiBmdW5jdGlvbihzY29wZSxlbGVtZW50LGF0dHJzKSB7XHJcblx0XHRcdFx0XHQvLyBJZiBubyBiYXNlIGlzIHNwZWNpZmllZCwgdXNlIGxvY2F0aW9uIGlmIGluc3RhbGxlZCB2aWEgYm93ZXIuXHJcblx0XHRcdFx0XHRpZih0eXBlb2Ygc2NvcGUuYmFzZSA9PT0gJ3VuZGVmaW5lZCcpIHtcclxuXHRcdFx0XHRcdFx0c2NvcGUuYmFzZSA9ICcvYm93ZXJfY29tcG9uZW50cy9QaG90b2dyYXBoeS1TZXR1cC1TdWl0ZS90ZW1wbGF0ZXMvZmlsdGVycy8nO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0c2NvcGUudGVtcGxhdGVVcmwgPSBzY29wZS5iYXNlICsgJ2ZpbHRlclF1ZXJ5Lmh0bWwnO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fSlcclxuXHQ7XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG5cdFxyXG5cdGFuZ3VsYXIubW9kdWxlKCdmaWx0ZXJNb2QnKVxyXG5cdC5jb250cm9sbGVyKCdmaWx0ZXJCYXJDb250cm9sbGVyJywgWyckc2NvcGUnLCBmdW5jdGlvbigkc2NvcGUpIHtcclxuXHRcdFx0XHJcblx0XHRcdHRoaXMuZ2FsbGVyaWVzID0gW107XHJcblx0XHRcdFxyXG5cdFx0XHQvLyBUb2dnbGVzIHRoZSBwb3NpdGlvbiBvZiB0aGUgbGVmdCBzaWRlIGZpbHRlciBjb2x1bW5cclxuXHRcdFx0dGhpcy5maWx0ZXJUb2dnbGUgPSBmdW5jdGlvbigpIHtcclxuXHRcdFx0XHR2YXIgZlBvcyA9ICRzY29wZS5mcG9zaXRpb247XHJcblx0XHRcdFx0JHNjb3BlLmZwb3NpdGlvbiA9IChmUG9zID09PSAwID8gLTE5MCA6IDApO1xyXG5cdFx0XHR9O1xyXG5cdFx0XHRcclxuXHRcdFx0dmFyIGZDdHJsID0gdGhpcztcclxuXHRcdFx0XHJcblx0XHR9XSlcclxuXHQ7XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG5cdFxyXG5cdGFuZ3VsYXIubW9kdWxlKCdmaWx0ZXJNb2QnKVxyXG5cdC5zZXJ2aWNlKCdmaWx0ZXJGdW5jdGlvbnMnLCBmdW5jdGlvbigpIHtcclxuXHRcdFx0XHJcblx0XHR2YXIgZkZ1bmN0aW9ucyA9IHRoaXM7XHJcblx0XHRcclxuXHRcdC8vIENoZWNrcyBmb3IgYSBtYXRjaCB3aXRoIHRoZSBmaWx0ZXJzLlxyXG5cdFx0Ly8gSWYgdGhlIHZhbHVlIGlzIGFuIGFycmF5LCBjaGVja3MgYWxsIHZhbHVlcyBmb3Igb25lIG1hdGNoLlxyXG5cdFx0Ly8gSWYgbm90LCBqdXN0IGNoZWNrcyBzaW5nbGUgdmFsdWUuXHJcblx0XHR0aGlzLmZpbHRlckNoZWNrID0gZnVuY3Rpb24odmFsdWUsc2VhcmNoKSB7XHJcblx0XHRcdHZhciBhbGxNYXRjaCA9IHRydWU7XHJcblx0XHRcdFxyXG5cdFx0XHRmb3IodmFyIGtleSBpbiBzZWFyY2gpIHtcclxuXHRcdFx0XHRpZihzZWFyY2guaGFzT3duUHJvcGVydHkoa2V5KSkge1xyXG5cdFx0XHRcdFx0dmFyIHRoaXNWYWx1ZSA9IHZhbHVlW2tleV07XHJcblx0XHRcdFx0XHRpZihzZWFyY2hba2V5XS5pc0FycmF5KSB7XHJcblx0XHRcdFx0XHRcdHZhciBudW1WYWx1ZXMgPSB0aGlzVmFsdWUubGVuZ3RoLFxyXG5cdFx0XHRcdFx0XHRcdG1hdGNoRm91bmQgPSBmYWxzZTtcclxuXHRcdFx0XHRcdFx0Zm9yKHZhciBpID0gMDsgaSA8IG51bVZhbHVlczsgaSsrKSB7XHJcblx0XHRcdFx0XHRcdFx0aWYoY2hlY2tWYWx1ZSh0aGlzVmFsdWVbaV0sIHNlYXJjaCwga2V5KSkge1xyXG5cdFx0XHRcdFx0XHRcdFx0bWF0Y2hGb3VuZCA9IHRydWU7XHJcblx0XHRcdFx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0aWYoIW1hdGNoRm91bmQpIHtcclxuXHRcdFx0XHRcdFx0XHRhbGxNYXRjaCA9IGZhbHNlO1xyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0XHRhbGxNYXRjaCA9IGNoZWNrVmFsdWUodGhpc1ZhbHVlLCBzZWFyY2gsIGtleSk7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRpZihhbGxNYXRjaCA9PT0gZmFsc2UpIHtcclxuXHRcdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHRcdFxyXG5cdFx0XHRyZXR1cm4gYWxsTWF0Y2g7XHJcblx0XHRcdFxyXG5cdFx0fTtcclxuXHRcdFxyXG5cdFx0Ly8gRnVuY3Rpb24gdGhhdCBjaGVja3MgdmFsdWUgYWdhaW5zdCB0aGUgcXVlcnkgZmlsdGVyICYgY2hlY2tib3hlc1xyXG5cdFx0dmFyIGNoZWNrVmFsdWUgPSBmdW5jdGlvbih2YWx1ZSwgc2VhcmNoLCBrZXkpIHtcclxuXHRcdFx0XHJcblx0XHRcdHZhciBjaGVja01hdGNoID0gdHJ1ZSxcclxuXHRcdFx0XHR2YWx1ZU1hdGNoID0gZmFsc2UsXHJcblx0XHRcdFx0Y2hlY2tib3hlcyA9IHNlYXJjaFtrZXldLmNoZWNrYm94ZXMsXHJcblx0XHRcdFx0c2VhcmNoT24gPSBzZWFyY2hba2V5XS5zZWFyY2hPbjtcclxuXHRcdFx0XHRcclxuXHRcdFx0aWYoc2VhcmNoT24gJiYgdmFsdWUpIHtcclxuXHRcdFx0XHR2YXIgdGhpc1ZhbHVlID0gdmFsdWVbc2VhcmNoT25dO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdHZhciB0aGlzVmFsdWUgPSB2YWx1ZTtcclxuXHRcdFx0fVxyXG5cdFx0XHRpZihjaGVja2JveGVzKSB7XHJcblx0XHRcdFx0Y2hlY2tNYXRjaCA9IGNoZWNrVGhlQm94ZXModGhpc1ZhbHVlLGtleSxjaGVja2JveGVzKTtcclxuXHRcdFx0fVxyXG5cdFx0XHR2YWx1ZU1hdGNoID0gZkZ1bmN0aW9ucy5xdWVyeUZpbHRlckNoZWNrKHRoaXNWYWx1ZSxzZWFyY2hba2V5XS5xdWVyeSk7XHJcblx0XHRcdFxyXG5cdFx0XHRyZXR1cm4gY2hlY2tNYXRjaCAmJiB2YWx1ZU1hdGNoO1xyXG5cdFx0fTtcclxuXHRcdFxyXG5cdFx0Ly8gQ2hlY2tzIHF1ZXJ5IHZhbHVlIGFnYWluc3QgYWN0dWFsLiAgQWxzbyB1c2VkIHRvIGhpZGUvc2hvdyBjaGVja2JveGVzIGJhc2VkIG9uIHRoZSB0eXBlZCBmaWx0ZXIuXHJcblx0XHR0aGlzLnF1ZXJ5RmlsdGVyQ2hlY2sgPSBmdW5jdGlvbih2YWx1ZSxxdWVyeSkge1xyXG5cdFx0XHRpZighdmFsdWUpIHtcclxuXHRcdFx0XHR2YWx1ZSA9ICcnO1xyXG5cdFx0XHR9XHJcblx0XHRcdHJldHVybiB2YWx1ZS50b0xvd2VyQ2FzZSgpLmluZGV4T2YocXVlcnkudG9Mb3dlckNhc2UoKSkgPiAtMTtcclxuXHRcdH07XHJcblx0XHRcclxuXHRcdC8vIEZ1bmN0aW9uIHRvIGxvb3AgdGhyb3VnaCB0aGUgY2hlY2tib3hlcyB2YXJpYWJsZSBhbmQgcmV0dXJuIHRydWUgaWYgdGhlIHZhbHVlIGlzIGEgbWF0Y2hcclxuXHRcdHZhciBjaGVja1RoZUJveGVzID0gZnVuY3Rpb24gKHZhbHVlLGZpbHRlcnNldCxjaGVja2JveGVzKSB7XHJcblx0XHRcdGlmKHZhbHVlKSB7XHJcblx0XHRcdFx0dmFyIGkgPSAwO1xyXG5cdFx0XHRcdGRvIHtcclxuXHRcdFx0XHRcdGlmKHZhbHVlID09PSBjaGVja2JveGVzW2ldKSB7XHJcblx0XHRcdFx0XHRcdHJldHVybiB0cnVlO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0aSsrO1xyXG5cdFx0XHRcdH0gd2hpbGUodHlwZW9mIGNoZWNrYm94ZXNbaV0gIT09ICd1bmRlZmluZWQnKVxyXG5cdFx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRpZihjaGVja2JveGVzWydub25lJ10pIHtcclxuXHRcdFx0XHRcdHJldHVybiB0cnVlO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHRcdH1cclxuXHRcdH07XHJcblx0XHRcclxuXHR9KVxyXG5cdDtcclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcblx0XHJcblx0YW5ndWxhci5tb2R1bGUoJ2ZpbHRlck1vZCcpXHJcblx0LmNvbnRyb2xsZXIoJ2ZpbHRlckNvbXBDb250cm9sbGVyJywgWyckc2NvcGUnLCdmaWx0ZXJGdW5jdGlvbnMnLCBmdW5jdGlvbigkc2NvcGUsZmlsdGVyRnVuY3Rpb25zKSB7XHJcblx0XHRcclxuXHRcdHZhciBib3hTZXR1cCA9IGZ1bmN0aW9uIChpdGVtcykge1xyXG5cdFx0XHRcclxuXHRcdFx0dmFyIGNoZWNrYm94ZXMgPSB7bm9uZTp0cnVlfTtcclxuXHRcdFx0XHJcblx0XHRcdGZvcih2YXIgaSA9IDA7IGkgPCBpdGVtcy5sZW5ndGg7IGkrKykge1xyXG5cdFx0XHRcdGNoZWNrYm94ZXNbaV0gPSBpdGVtc1tpXTtcclxuXHRcdFx0fVxyXG5cdFx0XHRcclxuXHRcdFx0cmV0dXJuIGNoZWNrYm94ZXM7XHJcblx0XHRcdFxyXG5cdFx0fTtcclxuXHRcdFxyXG5cdFx0JHNjb3BlLnNlYXJjaC5jaGVja2JveGVzID0gYm94U2V0dXAoJHNjb3BlLml0ZW1zKTtcclxuXHRcdFxyXG5cdFx0JHNjb3BlLiR3YXRjaCgnaXRlbXMnLGZ1bmN0aW9uKG5ld1ZhbHVlLG9sZFZhbHVlKSB7XHJcblx0XHRcdCRzY29wZS5zZWFyY2guY2hlY2tib3hlcyA9IGJveFNldHVwKG5ld1ZhbHVlKTtcclxuXHRcdH0pO1xyXG5cdFx0XHJcblx0XHR0aGlzLm9ubHlCb3ggPSBmdW5jdGlvbihib3hOdW0sYm94TmFtZSkge1xyXG5cdFx0XHR2YXIgaSA9IDA7XHJcblx0XHRcdGRvIHtcclxuXHRcdFx0XHQkc2NvcGUuc2VhcmNoLmNoZWNrYm94ZXNbaV0gPSBmYWxzZTtcdFx0XHRcdFx0XHJcblx0XHRcdFx0aSsrO1xyXG5cdFx0XHR9IHdoaWxlKHR5cGVvZiAkc2NvcGUuc2VhcmNoLmNoZWNrYm94ZXNbaV0gIT09ICd1bmRlZmluZWQnKVxyXG5cdFx0XHRpZihib3hOdW0gPT09ICdub25lJykge1xyXG5cdFx0XHRcdCRzY29wZS5zZWFyY2guY2hlY2tib3hlc1snbm9uZSddID0gdHJ1ZTtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHQkc2NvcGUuc2VhcmNoLmNoZWNrYm94ZXNbYm94TnVtXSA9IGJveE5hbWU7XHJcblx0XHRcdFx0JHNjb3BlLnNlYXJjaC5jaGVja2JveGVzWydub25lJ10gPSBmYWxzZTtcclxuXHRcdFx0fVxyXG5cdFx0fTtcclxuXHRcdFxyXG5cdFx0dGhpcy5hbGxCb3hlcyA9IGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0Zm9yKHZhciBpID0gMDsgaSA8ICRzY29wZS5pdGVtcy5sZW5ndGg7IGkrKykge1xyXG5cdFx0XHRcdCRzY29wZS5zZWFyY2guY2hlY2tib3hlc1tpXSA9ICRzY29wZS5pdGVtc1tpXTtcclxuXHRcdFx0fVxyXG5cdFx0XHQkc2NvcGUuc2VhcmNoLmNoZWNrYm94ZXNbJ25vbmUnXSA9IHRydWU7XHJcblx0XHR9O1xyXG5cdFx0XHJcblx0XHR0aGlzLnNob3dDaGVja2JveCA9IGZ1bmN0aW9uICh2YWx1ZSxxdWVyeSkge1xyXG5cdFx0XHRyZXR1cm4gZmlsdGVyRnVuY3Rpb25zLnF1ZXJ5RmlsdGVyQ2hlY2sodmFsdWUscXVlcnkpO1xyXG5cdFx0fTtcdFxyXG5cdFx0XHJcblx0fV0pXHJcblx0O1xyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuXHRcclxuXHRhbmd1bGFyLm1vZHVsZSgnb3ZlcmxheU1vZCcpXHJcblx0XHQuY29udHJvbGxlcignb3ZlcmxheUNvbnRyb2xsZXInLCBbJyRzY29wZScsZnVuY3Rpb24oJHNjb3BlKSB7XHJcblx0XHRcdFxyXG5cdFx0XHR0aGlzLmNhbmNlbEFjdGlvbiA9IGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdCRzY29wZS5tZXNzYWdlTnVtID0gMDtcclxuXHRcdFx0fTtcclxuXHRcdFx0XHJcblx0XHR9XSlcclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcblx0YW5ndWxhci5tb2R1bGUoJ2xpc3RNb2QnKVxyXG5cdC5jb250cm9sbGVyKCdsaXN0Q29udHJvbGxlcicsWyckc2NvcGUnLCckcm9vdFNjb3BlJywnbGlzdEZ1bmN0aW9ucycsZnVuY3Rpb24oJHNjb3BlLCRyb290U2NvcGUsbGlzdEZ1bmN0aW9ucykge1xyXG5cdFx0XHJcblx0XHR2YXIgbEN0cmwgPSB0aGlzLFxyXG5cdFx0XHRrZXkgPSAkc2NvcGUua2V5TmFtZSxcclxuXHRcdFx0b3JkS2V5ID0gJHNjb3BlLm9yZE5hbWUsXHJcblx0XHRcdGxpc3ROYW1lID0gJHNjb3BlLmxpc3ROYW1lO1xyXG5cdFx0XHJcblx0XHQvLyBTZXRzIHNlbGVjdGVkTGlzdCBhcyBlbXB0eSBhcnJheSBmb3IgdGhpcyBsaXN0IG51bWJlci5cclxuXHRcdGxpc3RGdW5jdGlvbnMuY2xlYXJTZWxlY3RlZChsaXN0TmFtZSk7XHJcblx0XHR0aGlzLmhpZGVPdmVybGF5ID0gdHJ1ZTtcclxuXHRcdFxyXG5cdFx0dGhpcy5sRnVuYyA9IGxpc3RGdW5jdGlvbnM7XHJcblx0XHR0aGlzLm5ld1NlY3Rpb24gPSAnJztcclxuXHRcdHRoaXMuY3VycmVudFNlY3Rpb24gPSB7c2VjdGlvbjonJyxpZDowfTtcclxuXHRcdFxyXG5cdFx0Ly8gVG9nZ2xlIHNlbGVjdGlvbiBvZiBpdGVtIC0gY2hhbmdlcyBzZWxlY3QgcHJvcGVydHkgb2YgaXRlbSBiZXR3ZWVuIHRydWUvZmFsc2UgYW5kIGFkZHMvcmVtb3ZlcyBmcm9tIHNlbGVjdGlvbiBhcnJheSAoc2VlIGxpc3RTZXJ2LmpzIGZvciBmdW5jdGlvbilcclxuXHRcdHRoaXMudG9nZ2xlU2VsZWN0ID0gZnVuY3Rpb24oaXRlbSxpbmRleCkge1xyXG5cdFx0XHRsaXN0RnVuY3Rpb25zLnRvZ2dsZVNlbGVjdChpdGVtLGluZGV4LGtleSxsaXN0TmFtZSk7XHRcdFxyXG5cdFx0fTtcclxuXHRcdFxyXG5cdFx0Ly8gQ3VzdG9tIGZpbHRlciBmdW5jdGlvbiBjaGVja2luZyBpdGVtIGZpcnN0IGFnYWluc3QgYSBsaXN0IG9mIGV4Y2x1c2lvbnMgdGhlbiBhZ2FpbnN0IGN1c3RvbSBmaWx0ZXIgdmFsdWVzXHJcblx0XHR0aGlzLmZpbHRlckNoZWNrID0gZnVuY3Rpb24odmFsdWUsaW5kZXgsYXJyYXkpIHtcclxuXHRcdFx0cmV0dXJuIGxpc3RGdW5jdGlvbnMuZmlsdGVyQ2hlY2sodmFsdWUsaW5kZXgsJHNjb3BlLnNlYXJjaCxrZXksbGlzdE5hbWUpO1xyXG5cdFx0fTtcclxuXHRcdFxyXG5cdFx0Ly8gUmV0dXJucyB0aGUgbGVuZ3RoIGEgbGlzdCAobWFpbiBsaXN0IGlmIG5vdCBzcGVjaWZpZWQpLlxyXG5cdFx0dGhpcy5nZXRMZW5ndGggPSBmdW5jdGlvbihsaXN0TmFtZSxzdWJMaXN0KSB7XHJcblx0XHRcdGlmKCFzdWJMaXN0KSB7XHJcblx0XHRcdFx0c3ViTGlzdCA9ICdtYWluJztcclxuXHRcdFx0fVxyXG5cdFx0XHRyZXR1cm4gbGlzdEZ1bmN0aW9ucy5MaXN0c1tsaXN0TmFtZV1bc3ViTGlzdF0ubGVuZ3RoO1xyXG5cdFx0fTtcclxuXHRcdFxyXG5cdFx0Ly8gQ2hhbmdlIG9yZGVyIG9mIGxpc3QuXHJcblx0XHR0aGlzLm1vdmVJdGVtcyA9IGZ1bmN0aW9uKGRpcmVjdGlvbikge1xyXG5cdFx0XHRsaXN0RnVuY3Rpb25zLm1vdmVJdGVtcyhkaXJlY3Rpb24sa2V5LG9yZEtleSxsaXN0TmFtZSk7XHJcblx0XHRcdGxpc3RGdW5jdGlvbnMuc2V0T3JkZXJTYXZlKHRydWUpO1xyXG5cdFx0fTtcclxuXHRcdFxyXG5cdFx0dGhpcy5jaGVja1NlbGVjdGVkID0gZnVuY3Rpb24oKSB7XHJcblx0XHRcdHJldHVybiBsaXN0RnVuY3Rpb25zLmNoZWNrU2VsZWN0ZWQobGlzdE5hbWUpO1xyXG5cdFx0fTtcclxuXHRcdFxyXG5cdFx0dGhpcy5zZWxlY3RBbGwgPSBmdW5jdGlvbigpIHtcclxuXHRcdFx0bGlzdEZ1bmN0aW9ucy5zZWxlY3RBbGwoa2V5LGxpc3ROYW1lKTtcclxuXHRcdH07XHJcblx0XHRcclxuXHRcdHRoaXMuZGVzZWxlY3RBbGwgPSBmdW5jdGlvbigpIHtcclxuXHRcdFx0bGlzdEZ1bmN0aW9ucy5kZXNlbGVjdEFsbChrZXksbGlzdE5hbWUpO1xyXG5cdFx0fTtcclxuXHRcdFxyXG5cdH1dKVxyXG5cdFxyXG5cdDtcclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcblx0YW5ndWxhci5tb2R1bGUoJ2xpc3RNb2QnKVxyXG5cdC5zZXJ2aWNlKCdsaXN0RnVuY3Rpb25zJywgWyckcScsJ2ZpbHRlckZ1bmN0aW9ucycsZnVuY3Rpb24gKCRxLGZpbHRlckZ1bmN0aW9ucykge1xyXG5cdFx0XHJcblx0XHR2YXIgbEZ1bmMgPSB0aGlzLFxyXG5cdFx0XHRlZGl0TGlzdCA9IFtdLFxyXG5cdFx0XHRjdXJyZW50RmlsdGVyZWRMaXN0ID0gW10sXHJcblx0XHRcdG9yZGVyU2F2ZVBlbmRpbmcgPSBmYWxzZTtcclxuXHRcdFxyXG5cdFx0dGhpcy5MaXN0cyA9IHt9O1xyXG5cdFx0dGhpcy5zZWN0aW9uTGlzdCA9IFt7c2VjdGlvbjonJyxpZDowfV07XHJcblx0XHRcclxuXHRcdHRoaXMuc2V0TGlzdCA9IGZ1bmN0aW9uKGxpc3RBcnJheSxsaXN0TmFtZSxleGNsdWRlQXJyYXkpIHtcclxuXHRcdFx0dGhpcy5MaXN0c1tsaXN0TmFtZV0gPSB7IG1haW46bGlzdEFycmF5LHNlbGVjdGVkOltdLGVkaXQ6W10sZmlsdGVyZWQ6W10sZXhjbHVkZTpleGNsdWRlQXJyYXkgfTtcclxuXHRcdH07XHJcblx0XHRcclxuXHRcdHRoaXMuY2xlYXJTZWxlY3RlZCA9IGZ1bmN0aW9uKGxpc3ROYW1lKSB7XHJcblx0XHRcdHRoaXMuTGlzdHNbbGlzdE5hbWVdLnNlbGVjdGVkID0gW107XHJcblx0XHR9O1xyXG5cdFx0XHJcblx0XHR0aGlzLmNoZWNrU2VsZWN0ZWQgPSBmdW5jdGlvbihsaXN0TmFtZSkge1xyXG5cdFx0XHRyZXR1cm4gdGhpcy5MaXN0c1tsaXN0TmFtZV0uc2VsZWN0ZWQubGVuZ3RoID09PSAwO1xyXG5cdFx0fTtcclxuXHRcdFxyXG5cdFx0dGhpcy5saXN0TGVuZ3RoID0gZnVuY3Rpb24obGlzdE5hbWUsc3ViTGlzdCkge1xyXG5cdFx0XHRzdWJMaXN0ID0gdHlwZW9mIHN1Ykxpc3QgIT09ICd1bmRlZmluZWQnID8gc3ViTGlzdCA6ICdtYWluJztcclxuXHRcdFx0aWYodGhpcy5MaXN0c1tsaXN0TmFtZV0pIHtcclxuXHRcdFx0XHRyZXR1cm4gdGhpcy5MaXN0c1tsaXN0TmFtZV1bc3ViTGlzdF0ubGVuZ3RoO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdHJldHVybiAwO1xyXG5cdFx0XHR9XHJcblx0XHR9O1xyXG5cdFx0XHJcblx0XHQvLyBDb3BpZXMgdGhlIHNlbGVjdGVkIGxpc3Qgb3ZlciB0byB0aGUgZWRpdCBsaXN0IChmb3IgJ2VkaXQgc2VsZWN0ZWQnIHNpdHVhdGlvbnMpXHJcblx0XHR0aGlzLnNlbGVjdFRvRWRpdCA9IGZ1bmN0aW9uKGxpc3ROYW1lKSB7XHJcblx0XHRcdHRoaXMuTGlzdHNbbGlzdE5hbWVdLmVkaXQgPSB0aGlzLkxpc3RzW2xpc3ROYW1lXS5zZWxlY3RlZDtcclxuXHRcdH07XHJcblx0XHRcclxuXHRcdHRoaXMuZWRpdE9uZSA9IGZ1bmN0aW9uKGlkLGxpc3ROYW1lLGlkTmFtZSkge1xyXG5cdFx0XHR2YXIgaW5kZXggPSB0aGlzLmZpbmRCeUlkKGlkLGxpc3ROYW1lLGlkTmFtZSk7XHJcblx0XHRcdHRoaXMuTGlzdHNbbGlzdE5hbWVdLmVkaXQgPSBbXTtcclxuXHRcdFx0dGhpcy5MaXN0c1tsaXN0TmFtZV0uZWRpdC5wdXNoKHRoaXMuTGlzdHNbbGlzdE5hbWVdLm1haW5baW5kZXhdKTtcclxuXHRcdH07XHJcblx0XHRcclxuXHRcdC8vIEZpcnN0IGNoZWNrcyBleGNsdWRlIGFycmF5IGZvciBpdGVtLCB0aGVuIGNoZWNrcyBzZWFyY2ggdmFsdWUgKHNlZSBmaWx0ZXJTZXJ2aWNlLmpzKVxyXG5cdFx0dGhpcy5maWx0ZXJDaGVjayA9IGZ1bmN0aW9uKHZhbHVlLGluZGV4LHNlYXJjaCxrZXlOYW1lLGxpc3ROYW1lKSB7XHJcblx0XHRcdHZhciBsaXN0Q2hlY2sgPSBmYWxzZSxcclxuXHRcdFx0XHRzaG93SXRlbSA9IGZhbHNlO1xyXG5cdFx0XHRsaXN0Q2hlY2sgPSBsRnVuYy5maW5kQnlJZCh2YWx1ZVtrZXlOYW1lXSxsaXN0TmFtZSxrZXlOYW1lLCdleGNsdWRlJyk7XHJcblx0XHRcdGlmKGxpc3RDaGVjayA9PT0gZmFsc2UpIHtcclxuXHRcdFx0XHRzaG93SXRlbSA9IGZpbHRlckZ1bmN0aW9ucy5maWx0ZXJDaGVjayh2YWx1ZSxzZWFyY2gpO1xyXG5cdFx0XHRcdC8vIERlc2VsZWN0IGl0ZW0gaWYgdGhlIGZpbHRlciBleGNsdWRlcyB0aGUgaXRlbVxyXG5cdFx0XHRcdGlmKHZhbHVlLnNlbGVjdGVkICYmICFzaG93SXRlbSAmJiBpbmRleCA+PSAwKSB7XHJcblx0XHRcdFx0XHRsRnVuYy5kZXNlbGVjdEl0ZW0odmFsdWVba2V5TmFtZV0saW5kZXgsa2V5TmFtZSxsaXN0TmFtZSk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHRcdGxGdW5jLnNldEZpbHRlcmVkKGxpc3ROYW1lLGluZGV4LHNob3dJdGVtKTtcclxuXHRcdFx0cmV0dXJuIHNob3dJdGVtO1xyXG5cdFx0fTtcclxuXHRcdFxyXG5cdFx0Ly8gQWRkcyBwcm9wZXJ0eSB3aXRoIGZpbHRlciBzdGF0dXMgb2YgZWxlbWVudFxyXG5cdFx0dGhpcy5zZXRGaWx0ZXJlZCA9IGZ1bmN0aW9uKGxpc3ROYW1lLGluZGV4LHNob3cpIHtcclxuXHRcdFx0dGhpcy5MaXN0c1tsaXN0TmFtZV0ubWFpbltpbmRleF0uc2hvd0l0ZW0gPSBzaG93O1xyXG5cdFx0fTtcclxuXHRcdFxyXG5cdFx0Ly8gQ3JlYXRlcyBhIGxpc3Qgb2Ygb25seSB0aGUgY3VycmVudGx5IGZpbHRlcmVkIGVsZW1lbnRzIG9mIHRoZSBtYWluIGFycmF5LiBSZXR1cm5zIHRoaXMgZmlsdGVyZWQgYXJyYXkuXHJcblx0XHR0aGlzLnNldEZpbHRlckFycmF5ID0gZnVuY3Rpb24obGlzdE5hbWUpIHtcclxuXHRcdFx0dmFyIG1haW5BcnJheSA9IHRoaXMuTGlzdHNbbGlzdE5hbWVdLm1haW47XHJcblx0XHRcdGZvcih2YXIgaSA9IDA7IGkgPCBtYWluQXJyYXkubGVuZ3RoOyBpKyspIHtcclxuXHRcdFx0XHRpZihtYWluQXJyYXlbaV0uc2hvd0l0ZW0gPT09IHRydWUpIHtcclxuXHRcdFx0XHRcdHRoaXMuTGlzdHNbbGlzdE5hbWVdLmZpbHRlcmVkLnB1c2gobWFpbkFycmF5W2ldKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdFx0cmV0dXJuIHRoaXMuTGlzdHNbbGlzdE5hbWVdLmZpbHRlcmVkO1xyXG5cdFx0fTtcclxuXHRcdFxyXG5cdFx0dGhpcy50b2dnbGVTZWxlY3QgPSBmdW5jdGlvbihpdGVtLGluZGV4LGtleSxsaXN0TmFtZSkge1xyXG5cdFx0XHRrZXkgPSBrZXkgPyBrZXkgOiAnaWQnO1xyXG5cdFx0XHR2YXIgaWQgPSBpdGVtW2tleV07XHJcblx0XHRcdGlmKCFpbmRleCAmJiBpbmRleCAhPT0gMCkge1xyXG5cdFx0XHRcdGluZGV4ID0gdGhpcy5maW5kQnlJZChpZCxsaXN0TmFtZSxrZXksJ21haW4nKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRpZighaXRlbS5zZWxlY3RlZCkge1xyXG5cdFx0XHRcdHRoaXMuc2VsZWN0SXRlbShpdGVtLGluZGV4LGtleSxsaXN0TmFtZSk7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0dGhpcy5kZXNlbGVjdEl0ZW0oaWQsaW5kZXgsa2V5LGxpc3ROYW1lKTtcclxuXHRcdFx0fVxyXG5cdFx0fTtcclxuXHJcblx0XHQvLyBGdW5jdGlvbiB0byBjcmVhdGUgYSBjb21tYSBzZXBhcmF0ZWQgbGlzdCBvZiBhIHBhcnRpY3VsYXIgcHJvcGVydHkgd2l0aGluIG9uZSBvZiB0aGUgbGlzdHMuIGtleU5hbWUgc3BlY2lmaWVzIHByb3BlcnR5IHRvIHVzZSAobmFtZSBvZiB0aGUgaXRlbSwgZ2VuZXJhbGx5KS4gXHJcblx0XHR0aGlzLm1ha2VMaXN0ID0gZnVuY3Rpb24obGlzdE5hbWUsa2V5TmFtZSxzdWJMaXN0KSB7XHJcblx0XHRcdGlmKCFzdWJMaXN0KSB7XHJcblx0XHRcdFx0c3ViTGlzdCA9ICdtYWluJztcclxuXHRcdFx0fVxyXG5cdFx0XHR2YXIgbGlzdEFycmF5ID0gdGhpcy5MaXN0c1tsaXN0TmFtZV1bc3ViTGlzdF0sXHJcblx0XHRcdFx0bWVzc2FnZSA9ICcnO1xyXG5cdFx0XHRmb3IodmFyIGkgPSAwOyBpIDwgbGlzdEFycmF5Lmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdFx0bWVzc2FnZSArPSBsaXN0QXJyYXlbaV1ba2V5TmFtZV07XHJcblx0XHRcdFx0aWYoaSA8IGxpc3RBcnJheS5sZW5ndGggLSAxKSB7XHJcblx0XHRcdFx0XHRtZXNzYWdlICs9ICcsICc7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHRcdHJldHVybiBtZXNzYWdlO1xyXG5cdFx0fTtcclxuXHJcblx0XHQvLyBSZXR1cm5zIHRoZSBpbmRleCBvZiB0aGUgaXRlbSB3aXRoaW4gdGhlIGFuIGFycmF5IChzcGVjaWZpZWQgYnkgbGlzdE5hbWUgYW5kIHN1Ykxpc3QpIG9yIGZhbHNlIGlmIG5vdCBmb3VuZC4gIFNlYXJjaCBieSBrZXkgKHNob3VsZCBiZSB1bmlxdWUgaWQuXHJcblx0XHR0aGlzLmZpbmRCeUlkID0gZnVuY3Rpb24oaWQsbGlzdE5hbWUsa2V5LHN1Ykxpc3QpIHtcclxuXHRcdFx0a2V5ID0gdHlwZW9mIGtleSAhPT0gJ3VuZGVmaW5lZCcgPyBrZXkgOiAnaWQnO1xyXG5cdFx0XHRzdWJMaXN0ID0gdHlwZW9mIHN1Ykxpc3QgIT09ICd1bmRlZmluZWQnID8gc3ViTGlzdCA6ICdtYWluJztcclxuXHRcdFx0dmFyIGxpc3RBcnJheSA9IHRoaXMuTGlzdHNbbGlzdE5hbWVdW3N1Ykxpc3RdO1xyXG5cdFx0XHRmb3IodmFyIGkgPSAwOyBpIDwgbGlzdEFycmF5Lmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdFx0aWYoU3RyaW5nKGxpc3RBcnJheVtpXVtrZXldKSA9PT0gU3RyaW5nKGlkKSkge1xyXG5cdFx0XHRcdFx0cmV0dXJuIGk7XHJcblx0XHRcdFx0fVx0XHRcdFxyXG5cdFx0XHR9XHJcblx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdH07XHJcblx0XHRcclxuXHRcdC8vIERlbGV0ZXMgaXRlbXMgZm91bmQgaW4gZGVsQXJyYXkgZnJvbSBtYWluIGxpc3Qgc2VhcmNoaW5nIGJ5IGlkLiBSZXR1cm5zIG5ldyBhcnJheS5cclxuXHRcdHRoaXMuZGVsZXRlQnlJZCA9IGZ1bmN0aW9uKGRlbEFycmF5LGlkTmFtZSxsaXN0TmFtZSxzdWJMaXN0KSB7XHJcblx0XHRcdHZhciBudW1JdGVtcyA9IGRlbEFycmF5Lmxlbmd0aDtcclxuXHRcdFx0c3ViTGlzdCA9IHR5cGVvZiBzdWJMaXN0ICE9PSAndW5kZWZpbmVkJyA/IHN1Ykxpc3QgOiAnbWFpbic7XHJcblx0XHRcdGZvcih2YXIgaSA9IDA7IGkgPCBudW1JdGVtczsgaSsrKSB7XHJcblx0XHRcdFx0dmFyIGltZ0luZGV4ID0gbEZ1bmMuZmluZEJ5SWQoZGVsQXJyYXlbaV1baWROYW1lXSxsaXN0TmFtZSxpZE5hbWUsc3ViTGlzdCk7XHJcblx0XHRcdFx0bEZ1bmMuTGlzdHNbbGlzdE5hbWVdLm1haW4uc3BsaWNlKGltZ0luZGV4LDEpO1xyXG5cdFx0XHR9XHJcblx0XHR9O1xyXG5cdFx0XHJcblx0XHQvLyBTZWxlY3RzIGFsbCBpdGVtcyB3aXRoaW4gdGhlIGN1cnJlbnQgZmlsdGVyIHNldFxyXG5cdFx0dGhpcy5zZWxlY3RBbGwgPSBmdW5jdGlvbihrZXksbGlzdE5hbWUpIHtcclxuXHRcdFx0a2V5ID0gdHlwZW9mIGtleSAhPT0gJ3VuZGVmaW5lZCcgPyBrZXkgOiAnaWQnO1xyXG5cdFx0XHR2YXIgZmlsdGVyZWRJdGVtcyA9IHRoaXMuc2V0RmlsdGVyQXJyYXkobGlzdE5hbWUpO1xyXG5cdFx0XHR2YXIgbnVtSXRlbXMgPSBmaWx0ZXJlZEl0ZW1zLmxlbmd0aDtcclxuXHRcdFx0Zm9yKHZhciBpID0gMDsgaSA8IG51bUl0ZW1zOyBpKyspIHtcclxuXHRcdFx0XHRpZighZmlsdGVyZWRJdGVtc1tpXS5zZWxlY3RlZCkge1xyXG5cdFx0XHRcdFx0bEZ1bmMuc2VsZWN0SXRlbShmaWx0ZXJlZEl0ZW1zW2ldLHVuZGVmaW5lZCxrZXksbGlzdE5hbWUpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fTtcclxuXHRcdFxyXG5cdFx0Ly8gRGVzZWxlY3RzIGFsbCBpdGVtc1xyXG5cdFx0dGhpcy5kZXNlbGVjdEFsbCA9IGZ1bmN0aW9uKGtleSxsaXN0TmFtZSkge1xyXG5cdFx0XHRrZXkgPSB0eXBlb2Yga2V5ICE9PSAndW5kZWZpbmVkJyA/IGtleSA6ICdpZCc7XHJcblx0XHRcdHZhciBudW1QaG90b3MgPSB0aGlzLkxpc3RzW2xpc3ROYW1lXS5tYWluLmxlbmd0aDtcclxuXHRcdFx0aWYoIXRoaXMuY2hlY2tTZWxlY3RlZChsaXN0TmFtZSkpIHtcclxuXHRcdFx0XHRmb3IodmFyIGkgPSAwOyBpIDwgbnVtUGhvdG9zOyBpKyspIHtcclxuXHRcdFx0XHRcdHZhciBpdGVtID0gdGhpcy5MaXN0c1tsaXN0TmFtZV0ubWFpbltpXTtcclxuXHRcdFx0XHRcdGlmKGl0ZW0uc2VsZWN0ZWQpIHtcclxuXHRcdFx0XHRcdFx0dGhpcy5kZXNlbGVjdEl0ZW0oaXRlbS5pZCxpLGtleSxsaXN0TmFtZSk7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9O1xyXG5cdFx0XHJcblx0XHR0aGlzLmRlc2VsZWN0SXRlbSA9IGZ1bmN0aW9uKGlkLGluZGV4LGtleSxsaXN0TmFtZSkge1xyXG5cdFx0XHRrZXkgPSB0eXBlb2Yga2V5ICE9PSAndW5kZWZpbmVkJyA/IGtleSA6ICdpZCc7XHJcblx0XHRcdGxGdW5jLkxpc3RzW2xpc3ROYW1lXS5tYWluW2luZGV4XS5zZWxlY3RlZCA9IGZhbHNlO1xyXG5cdFx0XHR2YXIgc2VsSW5kZXggPSBsRnVuYy5maW5kQnlJZChpZCxsaXN0TmFtZSxrZXksJ3NlbGVjdGVkJyk7XHJcblx0XHRcdGxGdW5jLkxpc3RzW2xpc3ROYW1lXS5zZWxlY3RlZC5zcGxpY2Uoc2VsSW5kZXgsMSk7XHJcblx0XHR9O1xyXG5cclxuXHRcdHRoaXMuc2VsZWN0SXRlbSA9IGZ1bmN0aW9uKGl0ZW0saW5kZXgsa2V5LGxpc3ROYW1lKSB7XHJcblx0XHRcdGtleSA9IHR5cGVvZiBrZXkgIT09ICd1bmRlZmluZWQnID8ga2V5IDogJ2lkJztcclxuXHRcdFx0aWYoIWluZGV4KSB7XHJcblx0XHRcdFx0aW5kZXggPSB0aGlzLmZpbmRCeUlkKGl0ZW1ba2V5XSxsaXN0TmFtZSxrZXksJ21haW4nKTtcclxuXHRcdFx0fVxyXG5cdFx0XHR0aGlzLkxpc3RzW2xpc3ROYW1lXS5tYWluW2luZGV4XS5zZWxlY3RlZCA9IHRydWU7XHJcblx0XHRcdHRoaXMuTGlzdHNbbGlzdE5hbWVdLnNlbGVjdGVkLnB1c2goaXRlbSk7XHJcblx0XHR9O1xyXG5cdFx0XHJcblx0XHQvLyBBZnRlciBpdGVtcyBhcmUgbW92ZWQgaW4gbGlzdCwgc2V0cyB0aGUgb3JkZXIgdmFsdWUgKG5hbWVkIG9yZEtleSkgdG8gdGhlIGNvcnJlY3QgbnVtYmVyIGZvciB0aGUgREIuICBBbHNvIGFkZHMgb3JkZXIgYW5kIHNlY3Rpb24gdG8gdGhlIHNlbGVjdGVkIGxpc3QuXHJcblx0XHR2YXIgcmVzZXRPcmRlciA9IGZ1bmN0aW9uKGtleSxvcmRLZXksbGlzdE5hbWUsc2VjdGlvbikge1xyXG5cdFx0XHR2YXIgc2VsSW5kZXggPSAwO1xyXG5cdFx0XHRmb3IoaSA9IDA7IGkgPCBsRnVuYy5MaXN0c1tsaXN0TmFtZV0ubWFpbi5sZW5ndGg7IGkrKykge1xyXG5cdFx0XHRcdGxGdW5jLkxpc3RzW2xpc3ROYW1lXS5tYWluW2ldW29yZEtleV0gPSBpO1xyXG5cdFx0XHRcdGlmKGxGdW5jLkxpc3RzW2xpc3ROYW1lXS5tYWluLnNlbGVjdGVkKSB7XHJcblx0XHRcdFx0XHRzZWxJbmRleCA9IGxGdW5jLmZpbmRCeUlkKGxGdW5jLkxpc3RzW2xpc3ROYW1lXS5tYWluW2ldW2tleV0sbGlzdE5hbWUsa2V5LCdzZWxlY3RlZCcpO1xyXG5cdFx0XHRcdFx0bEZ1bmMuTGlzdHNbbGlzdE5hbWVdLnNlbGVjdGVkW3NlbEluZGV4XVtvcmRLZXldID0gaTtcclxuXHRcdFx0XHRcdGlmKHR5cGVvZiBzZWN0aW9uICE9PSAndW5kZWZpbmVkJykge1xyXG5cdFx0XHRcdFx0XHRsRnVuYy5MaXN0c1tsaXN0TmFtZV0uc2VsZWN0ZWRbc2VsSW5kZXhdLnNlY3Rpb24gPSBzZWN0aW9uO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fTtcclxuXHRcdFxyXG5cdFx0Ly8gQWRkcyB0aGUgc2VsZWN0ZWQgaXRlbXMgdG8gYSBzZWN0aW9uIGFuZCByZW9yZGVycyBpdGVtcyB0byBncm91cCB0aG9zZSB0b2dldGhlci5cclxuXHRcdHRoaXMuZ3JvdXBTZWxlY3RlZCA9IGZ1bmN0aW9uKGtleSxvcmRLZXksc2VjdGlvbixsaXN0TmFtZSkge1xyXG5cdFx0XHR2YXIgbGlzdFRlbXAgPSBsRnVuYy5MaXN0c1tsaXN0TmFtZV0ubWFpbixcclxuXHRcdFx0XHRmaXJzdEluZGV4ID0gLTEsXHJcblx0XHRcdFx0bW92ZUluZGV4ID0gMCxcclxuXHRcdFx0XHRzZWxJbmRleDtcclxuXHRcdFx0Zm9yKHZhciBpID0gMDsgaSA8IGxpc3RUZW1wLmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdFx0aWYobGlzdFRlbXBbaV0uc2VsZWN0ZWQgfHwgbGxpc3RUZW1wW2ldLnNlY3Rpb24gPT09IHNlY3Rpb24pIHtcclxuXHRcdFx0XHRcdGlmKGZpcnN0SW5kZXggPSAtMSkge1xyXG5cdFx0XHRcdFx0XHRmaXJzdEluZGV4ID0gaTtcclxuXHRcdFx0XHRcdFx0bGlzdFRlbXBbaV0uc2VjdGlvbiA9IHNlY3Rpb247XHJcblx0XHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0XHRtb3ZlSW5kZXggPSBpO1xyXG5cdFx0XHRcdFx0XHRsaXN0VGVtcFttb3ZlSW5kZXhdLnNlY3Rpb24gPSBzZWN0aW9uO1xyXG5cdFx0XHRcdFx0XHRsaXN0VGVtcC5zcGxpY2UoZmlyc3RJbmRleCsxLDAsbGlzdFRlbXAuc3BsaWNlKG1vdmVJbmRleCwxKVswXSk7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHRcdGxGdW5jLkxpc3RzW2xpc3ROYW1lXS5tYWluID0gbGlzdFRlbXA7XHJcblx0XHRcdHJlc2V0T3JkZXIoa2V5LG9yZEtleSxsaXN0TmFtZSxzZWN0aW9uKTtcclxuXHRcdH07XHJcblx0XHRcclxuXHRcdC8vIE1vdmVzIGFuIGl0ZW0gb3IgaXRlbXMuICBDaGVja3MgdGhlIHNlY3Rpb25zIG9mIHRoZSBpdGVtcyB0byBlbnN1cmUgaXRlbXMgd2l0aGluIHNhbWUgc2VjdGlvbiBzdGljayB0b2dldGhlci5cclxuXHRcdHRoaXMubW92ZUl0ZW1zID0gZnVuY3Rpb24oZGlyZWN0aW9uLGtleSxvcmRLZXksbGlzdE5hbWUpIHtcclxuXHRcdFx0dmFyIHNlbFNlY3Rpb24sXHJcblx0XHRcdFx0bGlzdExlbiA9IGxGdW5jLkxpc3RzW2xpc3ROYW1lXS5tYWluLmxlbmd0aCxcclxuXHRcdFx0XHRtdWx0aXBsaWVyLFxyXG5cdFx0XHRcdG5leHRTZWN0aW9uO1xyXG5cdFx0XHR2YXIgaSA9IGRpcmVjdGlvbiA+IDAgPyBsaXN0TGVuIC0gMSA6IDA7XHJcblx0XHRcdC8vIExvb3AgdGhyb3VnaCBtYWluIGxpc3Qgb3Bwb3NpdGUgdGhlIGRpcmVjdGlvbiBvZiB0aGUgbW92ZW1lbnQgb2YgaXRlbXMgdG8gbWFrZSBzdXJlIG9yZGVyIGlzIG90aGVyd2lzZSBwcmVzZXJ2ZWQuXHJcblx0XHRcdGZvcihpOyBpIDwgbGlzdExlbiAmJiBpID49IDA7IGkgPSBpIC0gZGlyZWN0aW9uKSB7XHJcblx0XHRcdFx0bXVsdGlwbGllciA9IDE7XHJcblx0XHRcdFx0Ly8gSWYgdGhlIGl0ZW0gaXMgaW4gdGhlIHNlbGVjdGVkIGxpc3Qgb3IgdGhlIHNlY3Rpb24gaXMgbW92aW5nLlxyXG5cdFx0XHRcdGlmKGxGdW5jLmZpbmRCeUlkKGxGdW5jLkxpc3RzW2xpc3ROYW1lXS5tYWluW2ldW2tleV0sbGlzdE5hbWUsa2V5LCdzZWxlY3RlZCcpICE9PSBmYWxzZSB8fCBsRnVuYy5MaXN0c1tsaXN0TmFtZV0ubWFpbltpXS5zZWN0aW9uID09PSBzZWxTZWN0aW9uKSB7XHJcblx0XHRcdFx0XHQvLyBTZXQgc2VsU2VjdGlvbiB0byBzZWN0aW9uIG9mIGEgc2VsZWN0ZWQgaXRlbS5cclxuXHRcdFx0XHRcdGlmKGxGdW5jLkxpc3RzW2xpc3ROYW1lXS5tYWluW2ldLnNlY3Rpb24gIT09ICcnKSB7XHJcblx0XHRcdFx0XHRcdHNlbFNlY3Rpb24gPSBsRnVuYy5MaXN0c1tsaXN0TmFtZV0ubWFpbltpXS5zZWN0aW9uO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0Ly8gSWYgdGhlIG1vdmVtZW50IHdvdWxkIHB1dCB0aGUgaXRlbSBvdXRzaWRlIG9mIGxpc3QgYm91bmRhcmllcyBvciBhbm90aGVyIHNlbGVjdGlvbiBoYXMgaGl0IHRob3NlIGJvdW5kYXJpZXMgZG9uJ3QgbW92ZS5cclxuXHRcdFx0XHRcdGlmKGkrZGlyZWN0aW9uID49IDAgJiYgaStkaXJlY3Rpb24gPCBsaXN0TGVuICYmICFsRnVuYy5MaXN0c1tsaXN0TmFtZV0ubWFpbltpK2RpcmVjdGlvbl0uc2VsZWN0ZWQpIHtcclxuXHRcdFx0XHRcdFx0Ly8gSWYgdGhlIG5leHQgaXRlbSBpcyBpbiBhIGRlZmluZWQgc2VjdGlvbiwgbmVlZCB0byBjaGVjayAmIGNvdW50IGl0ZW1zIGluIHNlY3Rpb24gdG8ganVtcCBvdmVyIG9yIHN0b3AgbW92ZW1lbnQuXHJcblx0XHRcdFx0XHRcdGlmKGxGdW5jLkxpc3RzW2xpc3ROYW1lXS5tYWluW2krZGlyZWN0aW9uXS5zZWN0aW9uICE9PSAnJyAmJiBsRnVuYy5MaXN0c1tsaXN0TmFtZV0ubWFpbltpXS5zZWN0aW9uICE9PSBsRnVuYy5MaXN0c1tsaXN0TmFtZV0ubWFpbltpK2RpcmVjdGlvbl0uc2VjdGlvbikge1xyXG5cdFx0XHRcdFx0XHRcdG5leHRTZWN0aW9uID0gbEZ1bmMuTGlzdHNbbGlzdE5hbWVdLm1haW5baStkaXJlY3Rpb25dLnNlY3Rpb247XHJcblx0XHRcdFx0XHRcdFx0bXVsdGlwbGllciA9IDA7XHJcblx0XHRcdFx0XHRcdFx0Ly8gTG9vcCBiYWNrIHRocm91Z2ggYXJyYXkgaW4gdGhlIGRpcmVjdGlvbiBvZiBtb3ZlbWVudC5cclxuXHRcdFx0XHRcdFx0XHRmb3IodmFyIGogPSBpICsgZGlyZWN0aW9uOyBqIDwgbGlzdExlbiAmJiBqID49IDA7IGogPSBqICsgZGlyZWN0aW9uKSB7XHJcblx0XHRcdFx0XHRcdFx0XHQvLyBJZiB0aGUgaXRlbSBpcyBpbiB0aGUgc2VjdGlvbi4uLlxyXG5cdFx0XHRcdFx0XHRcdFx0aWYobEZ1bmMuTGlzdHNbbGlzdE5hbWVdLm1haW5bal0uc2VjdGlvbiA9PT0gbmV4dFNlY3Rpb24pIHtcclxuXHRcdFx0XHRcdFx0XHRcdFx0Ly8gSWYgc2VsZWN0ZWQgc3RvcCBtb3ZlbWVudCBhbmQgYnJlYWsuXHJcblx0XHRcdFx0XHRcdFx0XHRcdGlmKGxGdW5jLkxpc3RzW2xpc3ROYW1lXS5tYWluW2pdLnNlbGVjdGVkKSB7XHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0bXVsdGlwbGllciA9IDA7XHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0XHRcdFx0Ly8gSWYgbm90LCBjb3VudCBzZWN0aW9uLlxyXG5cdFx0XHRcdFx0XHRcdFx0XHRtdWx0aXBsaWVyKys7XHJcblx0XHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0XHRcdFx0XHQvLyBCcmVhayBsb29wIGF0IGZpcnN0IGl0ZW0gbm90IGluIHNlY3Rpb24uXHJcblx0XHRcdFx0XHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHQvLyBGaW5hbCBjaGVjazogb25seSBtb3ZlIGFuIGl0ZW0gaWYgaXQgaXMgc2VsZWN0ZWQgb3IgdG8gZW5zdXJlIGl0ZW1zIG9mIHRoZSBzYW1lIHNlY3Rpb24gc3RpY2sgdG9nZXRoZXJcclxuXHRcdFx0XHRcdFx0aWYobEZ1bmMuTGlzdHNbbGlzdE5hbWVdLm1haW5baV0uc2VsZWN0ZWQgfHwgbEZ1bmMuTGlzdHNbbGlzdE5hbWVdLm1haW5baStkaXJlY3Rpb25dLnNlY3Rpb24gIT09IGxGdW5jLkxpc3RzW2xpc3ROYW1lXS5tYWluW2ldLnNlY3Rpb24pIHtcclxuXHRcdFx0XHRcdFx0XHRsRnVuYy5MaXN0c1tsaXN0TmFtZV0ubWFpbi5zcGxpY2UoaSsoZGlyZWN0aW9uKm11bHRpcGxpZXIpLDAsbEZ1bmMuTGlzdHNbbGlzdE5hbWVdLm1haW4uc3BsaWNlKGksMSlbMF0pO1xyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHRcdC8vIFJlc2V0IG9yZGVyIHZhcmlhYmxlIGZvciBkYXRhYmFzZS5cclxuXHRcdFx0cmVzZXRPcmRlcihrZXksb3JkS2V5LGxpc3ROYW1lKTtcclxuXHRcdH07XHJcblx0XHRcclxuXHRcdHRoaXMuZ2V0T3JkZXJTYXZlID0gZnVuY3Rpb24oKSB7XHJcblx0XHRcdHJldHVybiBvcmRlclNhdmVQZW5kaW5nO1xyXG5cdFx0fTtcclxuXHRcdFxyXG5cdFx0dGhpcy5zZXRPcmRlclNhdmUgPSBmdW5jdGlvbihvcmRlclNhdmUpIHtcclxuXHRcdFx0b3JkZXJTYXZlUGVuZGluZyA9IG9yZGVyU2F2ZSA/IG9yZGVyU2F2ZSA6IGZhbHNlO1xyXG5cdFx0fTtcclxuXHRcdFxyXG5cdH1dKTtcclxufSkoKTsiXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
