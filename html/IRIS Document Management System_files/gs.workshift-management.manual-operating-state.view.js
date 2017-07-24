((globals) => {

    'use strict';

    const EDIT_TEMPLATE_URL = 'module.settings.workshift-management.manual-operating-state.edit.html';
    const IMPORT_TEMPLATE_URL = 'module.settings.workshift-management.import.edit.html';
    const EDIT_CONTROLLER_NAME = 'ModuleManualOperatingStateEditCtrl';
    const IMPORT_CONTROLLER_NAME = 'ModuleImportEditCtrl';

    const getGridOptions = () => {
        return {
            enableSorting: true,
            enableFiltering: true,
            showTreeExpandNoChildren: true,
            enableVerticalScrollbar: true,
            columnDefs: [
                { name: 'id', width: 50 },
                {
                    name: 'name',
                    width: '*',
                    cellFilter: `irisTranslate : row.entity.nameTranslations`
                },
                { name: 'code',
                    width: '*',
                    sort: {
                        direction: 'asc',
                        priority: 1
                    },
                    type: 'number'
                },
                {
                    name: 'actions',
                    width: 150,
                    enableSorting: false,
                    enableFiltering: false,
                    cellTemplate: `${globals.irisConfig.componentsUrl}/global-settings/templates/shift-mgmt/actions-cell-with-add.html`
                }
            ],
            data: []
        }
    };

    const fillGrid = (dataItems, gridItems, currLevel) => {
        currLevel = currLevel || 0;

        if (dataItems && dataItems.length) {
            dataItems.forEach((item) => {
                item.$$treeLevel = currLevel;
                gridItems.push(item);
                fillGrid(item.childStates, gridItems, currLevel + 1);
            });
        }
    };

    globals.angular.module('iris_gs_workshift_management_operating_state')
        .controller('ModuleManualOperatingStateViewCtrl', function($scope, $rootScope, $controller,
            $translate, $stateParams, OperatingStateService) {

            angular.extend($scope, $controller('PopupMixin', { $scope }));
            angular.extend($scope, $controller('FavoriteProjectMixin', { $scope }));

            $scope.init = () => {
                $scope.gridOptions = getGridOptions();
            };

            $scope.remove = (model) => {
                globals.alertify.confirm($translate.instant('message.ConfirmDeletionManualState'),
                    (confirm) => {
                        if (confirm) {
                            OperatingStateService.removeManualState(model.id).then(() => {
                                globals.alertify.success($translate.instant('message.ManualStateDeleted'));
                                $rootScope.$broadcast('updateManualStates');
                            })
                        }
                    }
                )
            };

            $scope.openEditModal = (row) => {
                var id = row.entity.id;
                $scope.popup.openComponents('global-settings', EDIT_TEMPLATE_URL, EDIT_CONTROLLER_NAME, { id });
            };

            $scope.openAddModal = (row) => {
                const parentStateId = row && row.entity && row.entity.id;
                const projectId = $scope.selProjectId;
                $scope.popup.openComponents('global-settings', EDIT_TEMPLATE_URL, EDIT_CONTROLLER_NAME, {parentStateId, projectId});
            };

            $scope.export = () => {
                window.location.href =
                    `${globals.irisConfig.apiUrl}/shiftmanagement/manual-operating-states/export/${$scope.selProjectId}`
            };

            $scope.import = () => {
                $scope.popup.openComponents('global-settings', IMPORT_TEMPLATE_URL, IMPORT_CONTROLLER_NAME, {projectId: $scope.selProjectId});
            };

            $scope.loadManualStates = (selectedProjectId) => {
                $scope.gridOptions = getGridOptions();
                OperatingStateService.findAllManualStatesByProjectId(selectedProjectId).then((model) =>
                    fillGrid(model, $scope.gridOptions.data)
                );
            };

            $scope.projectChanged = (selectedProjectId) => {
                $scope.selProjectId = selectedProjectId;
                if (selectedProjectId) {
                    $scope.loadManualStates(selectedProjectId);
                }
            };

            $scope.$on('updateManualStates', () => {
                $scope.loadManualStates($scope.selProjectId);
            });
        }
    );
})({
    angular: angular,
    irisConfig: iris.config,
    alertify: alertify
});