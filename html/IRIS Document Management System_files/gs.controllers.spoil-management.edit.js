(function () {
    
    angular.module('iris_gs_spoil_mgt_edit', []);

    angular.module('iris_gs_spoil_mgt_edit').controller('ModuleSpoilManagementEditCtrl',
        function ($scope, $controller, $translate, params, $uibModalInstance, DataSeriesService, DevicesService) {
            angular.extend($scope, $controller('ModuleSettingsBaseEditCtrl', {
                $scope: $scope,
                $uibModalInstance: $uibModalInstance,
                params: params
            }));

            $scope.ds_list = [];
            var allowed_types = ['VIRTUAL', 'MANUAL', 'CONDENSED'];

            $scope.requestDS = function (device_id) {
                $scope.ds_list = [];
                if (!device_id) return;

                //TODO refactor after implementing getting device's dataseries
                DevicesService.getSensorsByDeviceId(device_id, ['TBM'], allowed_types, {
                    'only-fields': angular.toJson(['id'])
                }).then(function (sensors) {
                    var sensors_ids = sensors.map(function (v) {
                        return v.id;
                    });
                    if (!sensors_ids.length) return;

                    DataSeriesService.getAllByDevice(device_id, {
                        filter: angular.toJson([{
                            f: 'type',
                            v: allowed_types
                        }, {
                            f: 'deviceSensorId',
                            v: sensors_ids
                        }]),
                        'only-fields': angular.toJson(['id', 'name'])
                    }).then(function (ds_list) {
                        $scope.ds_list = ds_list;
                    })
                });
            };

            if (params.object_id) {
                $scope.requestDS(params.object_id);
            }

        });

})();