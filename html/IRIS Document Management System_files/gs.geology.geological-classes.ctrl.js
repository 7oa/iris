(function () {
    'use strict';

    angular
        .module('iris_gs_geology')
        .controller('ModuleGeologicalClassesViewCtrl', ModuleGeologicalClassesViewCtrl);

    function ModuleGeologicalClassesViewCtrl($scope, $uibModal, $translate, $stateParams, $filter, GeologyClassesService, ProjectsService, ExportService) {

        var vm = this;

        //functions
        vm.activate = activate;
        vm.getGeologyClasses = getGeologyClasses;
        vm.clearClass = clearClass;
        vm.getGeologyClassesParameters = getGeologyClassesParameters;
        vm.addParameterType = addParameterType;
        vm.addParameter = addParameter;
        vm.saveClass = saveClass;
        vm.generateDummy = generateDummy;


        //variables
        vm.activate();
        var defaultCols = [{
            field: 'name',
            width: '*',
            displayName: $translate.instant('label.Name')
        }, {
            field: 'shortName',
            width: 100,
            displayName: $translate.instant('label.ShortName')
        }, {
            field: 'description',
            width: '**',
            displayName: $translate.instant('label.Description')
        }, {
            name: 'color',
            displayName: $translate.instant('label.Color'),
            width: 70,
            cellTemplate: `<div class="ui-grid-cell-contents" ng-style="{'background-color': (row.entity.color || '#000000')}"></div>`
        }, {
            name: 'actions',
            displayName: $translate.instant('label.Actions'),
            width: 50,
            enableSorting: false,
            cellTemplate: `
                <div class="ui-grid-cell-contents actions">
                    <button class="btn btn-link"
                            data-uib-tooltip="{{'label.Remove' | translate}}"
                            data-ng-click="grid.appScope.removeClass(row.entity); $event.stopPropagation();">
                        <i class="fa fa-trash-o"></i>
                    </button>
                </div>`
        }];
        var columnDefs = angular.copy(defaultCols);

        function activate() {
            vm.clearClass();
            vm.getGeologyClasses($stateParams.projectId);
        }

        vm.gridOptions = {
            data: 'vm.geologyClasses',
            enableFullRowSelection: true,
            enableSelectAll: false,
            selectionRowHeaderWidth: 35,
            multiSelect: false,
            columnDefs: columnDefs,
            onRegisterApi: function (gridApi) {
                vm.gridOptions.gridAPI = gridApi;

                gridApi.selection.on.rowSelectionChanged($scope, function (row, event) {
                    if (vm.geologyClass.id == row.entity.id) {
                        vm.clearClass();
                    } else {
                        vm.geologyClass = angular.copy(row.entity);
                    }
                });
            }
        };

        vm.ParamsGridOptions = {
            data: 'vm.geologyClass.geologicalClassValues',
            enableFullRowSelection: true,
            enableSelectAll: false,
            selectionRowHeaderWidth: 35,
            enableHorizontalScrollbar: 1,
            multiSelect: false,
            columnDefs: [{
                field: 'geologicalParameter.name',
                width: '*',
                displayName: $translate.instant('label.Name')
            }, {
                field: 'value',
                width: '*',
                displayName: $translate.instant('label.geology.Value'),
                cellTemplate: `
                    <div class="ui-grid-cell-contents actions">
                        <div iris-field
                             type="text"
                             inline
                             style="width: 100%;"
                             required="true"
                             iris-field-label=""
                             iris-field-offset="0"
                             uib-tooltip="{{::'label.Value'|translate}}"
                             placeholder="{{::'label.Value'|translate}}"
                             ng-model="row.entity.value"></div>
                    </div>`
            }, {
                field: 'geologicalParameter.unit',
                width: 50,
                displayName: $translate.instant('label.Unit'),
                cellFilter: `irisUnits`
            }, {
                field: 'parameterId',
                width: 40,
                displayName: ' ',
                cellTemplate: `
                    <div class="ui-grid-cell-contents actions">
                        <button class="btn btn-link"
                                data-uib-tooltip="{{'label.Remove' | translate}}"
                                data-ng-click="grid.appScope.removeClassParameter(row.entity); $event.stopPropagation();">
                            <i class="fa fa-trash-o"></i>
                        </button>
                    </div>`
            }]
        };

        $scope.removeClassParameter = function (classParam) {
            var index = vm.geologyClass.geologicalClassValues.indexOf(classParam);
            if (index > -1) {
                vm.geologyClass.geologicalClassValues.splice(index, 1);
            }
        };

        function getGeologyClasses() {
            vm.geologyClasses = [];
            GeologyClassesService.getGeologyClasses($stateParams.projectId).then(function (resp) {
                vm.geologyClasses = resp;
                columnDefs = angular.copy(defaultCols);
                var parameters = {};
                vm.geologyClasses.forEach(geoClass => {
                    geoClass.geologicalClassValues.forEach(classParam => {
                        if(!parameters[classParam.parameterId]){
                            parameters[classParam.parameterId] = classParam.geologicalParameter;
                        }
                    })
                });
                var newCols = Object.keys(parameters).map(key => {
                    return {
                        field: 'parameterId',
                        width: '*',
                        displayName: parameters[key].name,
                        cellTemplate: `
                            <div class="ui-grid-cell-contents actions">
                                {{grid.appScope.getClassParameterValue(row.entity, ${key})}}
                            </div>`
                    }
                });
                columnDefs.splice.apply(columnDefs, [4, 0].concat(newCols));
                vm.gridOptions.columnDefs = columnDefs;
            });
        }

        $scope.getClassParameterValue = function (geoClass, parameterId) {
            var param = geoClass.geologicalClassValues.find(c => c.parameterId == parameterId);
            return param && param.value;
        };

        function getGeologyClassesParameters() {
            vm.geologyClassesParameters = [];
            GeologyClassesService.getGeologyClassesParameters($stateParams.projectId).then(function (resp) {
                vm.geologyClassesParameters = resp || [];
            });
        }

        function generateDummy() {

            var numbers = [];
            var colors = [];
            var newColor;
            var number = 0;
            if(vm.geologyClasses.length != 0){
                vm.geologyClasses.forEach(function (geologyClass) {
                    var num = $filter('lowercase')(geologyClass.name);
                    colors[colors.length] = geologyClass.color;
                    if(num.indexOf("dummy")!= -1){
                        num = num.replace("dummy","");
                        if(num && num != 0){
                            numbers[numbers.length] = +num;
                        }
                    }
                });
                numbers.sort(compareNumeric);
                for(var i=1; i <= numbers.length; i++) {
                    if(i < numbers[(i-1)]){
                        number = i;
                        break;
                    }
                }
                
                if(number == 0 && numbers.length>0) number = ++numbers[numbers.length-1];

            }

            if(number == 0) number = 1;

            function compareNumeric(a, b) {
                return a - b;
            }

            vm.geologyClass.name = 'Dummy ' + number;
            vm.geologyClass.shortName = 'D ' + number;
            vm.geologyClass.description = 'Dummy';
            while(true){
                newColor = '#'+((1<<24)*Math.random()|0).toString(16);
                if(!colors.some(color => color == newColor)) break;
            }
            vm.geologyClass.color = newColor;
        }

        function clearClass() {
            vm.gridOptions && vm.gridOptions.gridAPI.selection.clearSelectedRows();
            vm.geologyClass = GeologyClassesService.createGeologyClass({
                projectId: $stateParams.projectId,
                geologicalClassValues: []
            });
        }

        function addParameterType() {
            $uibModal.open({
                templateUrl: iris.config.componentsUrl + '/global-settings/templates/geology/ms.geology.classes.parameters.types.modal.html',
                resolve: {
                    types: function () {
                        return $scope.geologicalclassesParameters.types
                    },
                    units: function () {
                        return $scope.geologicalclassesParameters.units
                    }
                },
                controller: 'ModuleGeologicalClassesParameterTypesModalViewCtrl',
                size: 'sm'
            });
        }

        function addParameter() {
            $uibModal.open({
                templateUrl: iris.config.componentsUrl + '/global-settings/templates/geology/ms.geology.classes.parameters.modal.html',
                resolve: {
                    parameters: function (GeologyClassesParametersService) {
                        return GeologyClassesParametersService.getGeologyClassesParameters($stateParams.projectId);
                    },
                    geologicalClassValues: function () {
                        return vm.geologyClass.geologicalClassValues;
                    }
                },
                controller: 'ModuleGeologicalClassesParametersModalViewCtrl',
                controllerAs: vm
            }).result.then(params => vm.geologyClass.geologicalClassValues = params);
        }

        function saveClass() {
            GeologyClassesService.saveGeologyClass(vm.geologyClass).then(function () {
                vm.getGeologyClasses($stateParams.projectId);
                vm.clearClass();
            })
        }

        $scope.removeClass = function (geologyClass) {
            alertify.confirm($translate.instant('message.DeleteItemConfirm'), function (e) {
                if (e) {
                    GeologyClassesService.removeGeologyClass(geologyClass).then(function () {
                        vm.clearClass();
                        vm.getGeologyClasses($stateParams.projectId);
                    })
                }
            });
        };

        $scope.openImportGeologyClasses = function () {
            $uibModal.open({
                templateUrl: iris.config.baseUrl + '/modules/geology/templates/geology.import.modal.html',
                controller: 'GeologyClassesImportCtrl',
                resolve: {
                    'projectId': function () {
                        return $stateParams.projectId;
                    }
                }
            }).result.then(() => {
                vm.clearClass();
                vm.getGeologyClasses($stateParams.projectId);
            });
        };

        $scope.exportFormats = ExportService.getExportFormats();

        var project = ProjectsService.getProjectById($stateParams.projectId)
        var timezone = project ? project.timeZone : null;
        $scope.openExportGeologyClasses = function(type) {
            ExportService.openExportModal(GeologyClassesService.getExportClassesUrl($stateParams.projectId), {
                type,
                timezone
            });
        };

    }

})();