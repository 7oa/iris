(function() {
    irisAppDependencies.add('iris_cutter_track_maintenance_status');

    angular.module('iris_cutter_track_maintenance_status', []);

    angular.module('iris_cutter_track_maintenance_status').factory('CutterToolMaintenanceStatus', function ($resource) {
        return $resource(iris.config.apiUrl + "/cutter-tool/devices/:deviceId/tool-status/:id", {
            id: '@id',
            deviceId: '@deviceId'
        });
    });

    angular.module('iris_cutter_track_maintenance_status')
        .factory('CutterToolStatusService', function (CutterToolMaintenanceStatus) {
            return {
                getToolStatuses: deviceId => CutterToolMaintenanceStatus.query({deviceId:deviceId}).$promise,

                getToolStatus: (deviceId, id) => CutterToolMaintenanceStatus.get({deviceId:deviceId, id: id}).$promise,

                saveToolStatus: toolStatus => CutterToolMaintenanceStatus.save(toolStatus).$promise,

                createToolStatus: params => new CutterToolMaintenanceStatus(params),

                removeToolStatus: toolStatus => CutterToolMaintenanceStatus.remove({
                    deviceId: toolStatus.deviceId,
                    id: toolStatus.id
                }).$promise
            }
        });
})();
