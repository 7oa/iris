((globals) => {
    'use strict';

    const getGridOptions = ($translate) => {
        return {
            enableSorting: true,
            enableFiltering: true,
            enableVerticalScrollbar: true,
            enablePaginationControls: false,
            paginationPageSize: 10,
            showGridFooter: true,
            columnDefs: [
                { name: 'id', width: 50 },
                { name: 'name', width: '*' },
                {
                    name: 'ring',
                    cellTemplate: `
                        <div class="ui-grid-cell-contents">
                            <i class="fa" ng-class="{'fa-check-square-o': row.entity.ring,'fa-square-o': !row.entity.ring}"></i>
                        </div>
                    `
                },
                {
                    name: 'code',
                    width: '*',
                    sort: {
                        direction: 'asc',
                        priority: 1
                    },
                    type: 'number'
                },
                {
                    name: 'color',
                    cellTemplate: `
                        <div class="ui-grid-cell-contents">
                            <div ng-style="{'background-color':row.entity.defaultDisplayColor || '#000000', width:'100%', height: '100%'}"></div>
                        </div>`,
                    enableFiltering: false,
                    width: 50
                },
                { name: 'deviceName', displayName: `${$translate.instant('label.IntervalScanner')}`, width: '*' },
                {
                    name: 'actions',
                    enableSorting: false,
                    enableFiltering: false,
                    width: 150,
                    cellTemplate: `${globals.irisConfig.componentsUrl}/global-settings/templates/shift-mgmt/actions-cell.html`
                }
            ],
            data: []
        }
    };

    globals.angular.module('iris_gs_workshift_management_operating_state')
        .controller('ModuleAutoOperatingStateViewCtrl', function (DevicesService, OperatingStateService,
            $scope, $rootScope, $translate, $controller, IntervalScannerService) {

            globals.angular.extend($scope, $controller('PopupMixin', { $scope }));

            $scope.init = () => {
                $scope.gridOptions = getGridOptions($translate);
                $scope.devices = DevicesService.getDevices();
            };

            $scope.loadStates = (deviceId) => {
                if (deviceId) {
                    $scope.deviceId = deviceId;
                    IntervalScannerService.getScanners(deviceId).then((scanners) => {
                        const scannerName = scanners[0].name;
                        OperatingStateService.findAllAutoStatesByDeviceId(deviceId).then((items) => {
                            items.forEach((i) => {
                                i.deviceName = scannerName;
                            });
                            $scope.gridOptions.data = items;
                        })
                    });
                }
            };

            $scope.openEditModal = (row) => {
                let id = row.entity.id;
                let deviceId = $scope.deviceId;
                $scope.popup.openComponents('global-settings',
                    'module.settings.workshift-management.auto-operating-state.edit.html',
                    'ModuleAutoOperatingStateEditCtrl', {id, deviceId});
            };

            $scope.openAddModal = () => {
                let deviceId = $scope.deviceId;
                $scope.popup.openComponents('global-settings',
                    'module.settings.workshift-management.auto-operating-state.edit.html',
                    'ModuleAutoOperatingStateEditCtrl', {deviceId});
            };

            $scope.remove = (model) => {
                globals.alertify.confirm($translate.instant('message.ConfirmDeletionAutoState'),
                    (confirm) => {
                        if (confirm) {
                            OperatingStateService.removeAutoState(model.id).then(() => {
                                globals.alertify.success($translate.instant('message.AutoStateDeleted'));
                                $rootScope.$broadcast('updateAutoStates');
                            })
                        }
                    }
                )
            };

            $scope.$on('updateAutoStates', () => {
                $scope.init();
                $scope.loadStates($scope.deviceId);
            })
        }
    );
})({
    angular: angular,
    irisConfig: iris.config,
    alertify: alertify
});