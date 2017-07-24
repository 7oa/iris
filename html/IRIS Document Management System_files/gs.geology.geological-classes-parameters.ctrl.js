(function () {
    'use strict';

    angular
        .module('iris_gs_geology')
        .controller('ModuleGeologicalClassesParametersViewCtrl', ModuleGeologicalClassesParametersViewCtrl);

    ModuleGeologicalClassesParametersViewCtrl.$inject = [
        '$scope',
        '$stateParams',
        '$translate',
        'GeologyClassesParametersService',
        'geologyClassesParameters'
    ];


    function ModuleGeologicalClassesParametersViewCtrl($scope, $stateParams, $translate, GeologyClassesParametersService, geologyClassesParameters) {

        var vm = this;

        //variables
        vm.geologyClassesParameters = geologyClassesParameters;

        //functions
        vm.getGeologyClassesParameters = getGeologyClassesParameters;
        vm.saveGeologyClassesParameter = saveGeologyClassesParameter;
        vm.clearParameters = clearParameters;

        vm.clearParameters();

        vm.gridOptions = {
            data: 'vm.geologyClassesParameters',
            enableFullRowSelection: true,
            enableSelectAll: false,
            selectionRowHeaderWidth: 35,
            multiSelect: false,
            columnDefs: [{
                field: 'name',
                width: '*',
                displayName: $translate.instant('label.Name')
            }, {
                field: 'type',
                width: '*',
                displayName: $translate.instant('label.Type'),
                cellFilter: 'IrisFilterField:[grid.appScope.geologicalclassesParameters.types]'
            }, {
                field: 'unit',
                width: '*',
                displayName: $translate.instant('label.Unit'),
                cellFilter: `irisUnits:'long'`
            }, {
                name: 'actions',
                displayName: $translate.instant('label.Actions'),
                width: 50,
                enableSorting: false,
                cellTemplate: `
                    <div class="ui-grid-cell-contents actions">
                        <button class="btn btn-link"
                                data-uib-tooltip="{{'label.Remove' | translate}}"
                                data-ng-click="grid.appScope.removeClassProject(row.entity); $event.stopPropagation();">
                            <i class="fa fa-trash-o"></i>
                        </button>
                    </div>`
            }],
            onRegisterApi: function (gridApi) {
                vm.gridOptions.gridAPI = gridApi;

                gridApi.selection.on.rowSelectionChanged($scope, function (row, event) {
                    if (vm.geologyClassesParameter.id == row.entity.id) {
                        vm.clearParameters();
                    }
                    else {
                        vm.geologyClassesParameter = angular.copy(row.entity);
                    }
                });
            }
        };

        function getGeologyClassesParameters() {
            GeologyClassesParametersService.getGeologyClassesParameters($stateParams.projectId).then(function (resp) {
                vm.geologyClassesParameters = resp || [];
            });
        }

        function clearParameters() {
            vm.gridOptions && vm.gridOptions.gridAPI.selection.clearSelectedRows();
            vm.geologyClassesParameter = GeologyClassesParametersService.createGeologyClassesParameter({
                type: 'ALL',
                projectId: $stateParams.projectId
            });
        }

        function saveGeologyClassesParameter() {
            GeologyClassesParametersService.saveGeologyClassesParameter(vm.geologyClassesParameter)
                .then(() => {
                    vm.getGeologyClassesParameters();
                    vm.clearParameters();
                });
        }

        $scope.removeClassProject = function (parameter) {
            alertify.confirm($translate.instant('message.DeleteItemConfirm'), function (e) {
                if (e) {
                    GeologyClassesParametersService.removeGeologyClassesParameter(parameter).then(function () {
                        vm.getGeologyClassesParameters();
                        clearParameters();
                    })
                }
            });
        }
    }
})();
