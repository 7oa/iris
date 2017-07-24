(function(globals) {

    'use strict';

    const EDIT_TEMPLATE_URL = 'module.settings.workshift-management.shift-model.edit.html';
    const EDIT_CONTROLLER_NAME = 'ModuleShiftModelEditCtrl';
    const EDIT_BUNDLE_TEMPLATE_URL = 'module.settings.workshift-management.shift-model-bundle.edit.html';
    const EDIT_BUNDLE_CONTROLLER_NAME = 'ModuleShiftModelBundleEditCtrl';

    function getGridOptions($translate) {
        return {
            enableSorting: false,
            enableFiltering: false,
            showTreeExpandNoChildren: false,
            enableVerticalScrollbar: true,
            columnDefs: [
                {
                    name: 'name',
                    width: '15%',
                    displayName: $translate.instant('label.Name')
                },
                {
                    name: 'shorthandSymbol',
                    width: '15%',
                    displayName: $translate.instant('label.ShorthandSymbol')
                },
                {
                    name: 'startTime',
                    width: '10%',
                    displayName: $translate.instant('label.StartTime')
                },
                {
                    name: 'durationTime',
                    width: '10%',
                    displayName: $translate.instant('label.Duration')
                },
                {
                    name: 'protocolDisplayFormatString',
                    width: '20%',
                    displayName: $translate.instant('label.ProtocolDisplayFormat')
                },
                {
                    name: 'projectName',
                    width: '15%',
                    displayName: $translate.instant('label.ProjectName')
                },
                {
                    name: 'actions',
                    width: '15%',
                    displayName: $translate.instant('label.Actions'),
                    cellTemplate: `${globals.irisConfig.componentsUrl}/global-settings/templates/shift-mgmt/shift-model-action-cell.html`
                }
            ],

            data: []
        }
    }

    globals.angular.module('iris_gs_workshift_management_shift_model').controller('ModuleShiftModelViewCtrl',
        function($scope, $controller, $translate, $stateParams, $timeout, ShiftModelService, ProjectsService) {

            globals.angular.extend($scope, $controller('PopupMixin', { $scope }));
            $scope.init = () => {
                $scope.projectId = $scope.projectId || iris.config.favProjectId || null;
                $scope.projects = ProjectsService.getProjects();
                $scope.gridOptions = getGridOptions($translate);
                $scope.gridOptions.onRegisterApi = (gridApi) =>
                    $scope.gridApi = gridApi;
            };

            $scope._loadProjectModels = (projectId) => {
                $scope.gridOptions = getGridOptions($translate);

                $scope._saveExpandedBundles();

                ShiftModelService.findAllByProject(projectId).then((model) => {
                    $scope.model = model;
                    $scope._fillGrid(model, $scope.gridOptions.data);
                    $timeout($scope._restoreExpandedState, 500);
                });
            };

            $scope._fillGrid = (shiftModels, gridItems) => {
                if (shiftModels && shiftModels.length) {

                    shiftModels.filter((sm) => !sm.bundle).forEach((sm) => {
                        sm.bundle = {
                            title: $translate.instant('label.StandaloneShifts'),
                            projectId: $scope.projectId
                        };
                    });

                    $scope.bundles = [];

                    shiftModels.map((sm) => sm.bundle).filter((sm) => sm !== null).forEach((b) => {
                        if (!$scope.bundles.find((i) => i.id === b.id)) {
                            $scope.bundles.push(b)
                        }
                    });

                    $scope.bundles.forEach((b) => {
                        b.$$treeLevel = 0;
                        b.name = b.title;
                        b.isBundle = true;
                        gridItems.push(b);

                        let children = shiftModels.filter((sm) => sm.bundle && sm.bundle.id === b.id);
                        const startModelId = b.startModelId || children[0].id;

                        children = ShiftModelService.sortModels(startModelId, children);

                        children.forEach((sm) => {
                            delete sm.bundle;
                            gridItems.push(sm);
                            sm.index = children.indexOf(sm);
                        });

                        b.startTime = ShiftModelService.getBundleStartTime(children);
                        b.durationTime = ShiftModelService.getBundleDuration(children);
                        b.shiftModels = children;
                    });
                }
            };

            $scope._saveExpandedBundles = () => {
                $scope.expandedBundles = $scope.gridApi.core.getVisibleRows().filter(
                    (r) => r.entity.projectId == $scope.projectId &&
                           r.entity.isBundle &&
                           r.treeNode.state === 'expanded'
                ).map((r) => r.entity.id);
            };

            $scope._restoreExpandedState = () => {
                $scope.gridApi.core.getVisibleRows().forEach((r) => {
                    if (r.entity.isBundle && $scope.expandedBundles.indexOf(r.entity.id) >= 0) {
                        $scope.gridApi.treeBase.expandRow(r);
                    }
                })
            };

            $scope.openEditModal = function(id) {
                $scope.popup.openComponents('global-settings', EDIT_TEMPLATE_URL, EDIT_CONTROLLER_NAME,
                    { id, projectId: $scope.projectId });
            };

            $scope.openEditBundleModal = (id) => {
                $scope.popup.openComponents('global-settings', EDIT_BUNDLE_TEMPLATE_URL, EDIT_BUNDLE_CONTROLLER_NAME,
                    { id, projectId: $scope.projectId });
            };

            $scope.openAddModal = () => {
                $scope.popup.openComponents('global-settings', EDIT_TEMPLATE_URL, EDIT_CONTROLLER_NAME,
                    { projectId: $scope.projectId });
            };

            $scope.remove = (id) => {
                alertify.confirm($translate.instant('message.ConfirmDeletionShiftModel'), function(confirm) {
                    if (confirm) {
                        ShiftModelService.remove(id).then(function() {
                            alertify.success($translate.instant('message.ShiftModelDeleted'));
                            $scope.$broadcast('updateShiftModels')
                        })
                    }
                })
            };

            $scope.removeBundle = (id) => {
                alertify.confirm($translate.instant('message.ConfirmDeletionShiftBundle'), function(confirm) {
                    if (confirm) {
                        ShiftModelService.removeBundle(id).then(function() {
                            alertify.success($translate.instant('message.ShiftModelBundleDeleted'));
                            $scope.$broadcast('updateShiftModels');
                        })
                    }
                })
            };

            $scope.moveUp = (shiftModel) => {
                ShiftModelService.setStartModelInBundle(shiftModel).then(() => {
                    $scope.$broadcast('updateShiftModels');
                });
            };

            $scope.validateBundle = (bundle) => {
                const models = $scope.model.filter((m) => m.bundleId == bundle.id);
                const hasGaps = ShiftModelService.hasGapsInBundle(models);
                if (hasGaps) {
                    alertify.error($translate.instant('message.ShiftModelHasGapsError'));
                    return
                }
                const duration = ShiftModelService.getBundleDuration(models);
                if (duration !== '24:00') {
                    alertify.error($translate.instant('message.ShiftModelNotSingleDayError'));
                    return;
                }

                alertify.success($translate.instant('message.ShiftModelBundleValidationSuccess'));

            };

            $scope.changeProject = (projectId) => {
                $scope.projectId = projectId;
                $scope._loadProjectModels(projectId)
            };

            $scope.$on('updateShiftModels', () => {
                $scope._loadProjectModels($scope.projectId)
            });

        }
    );
})({
    angular: angular,
    irisConfig: iris.config
});