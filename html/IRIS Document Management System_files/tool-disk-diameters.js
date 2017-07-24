(function() {
    irisAppDependencies.add('iris_cutter_tool_disk_diameters');

    angular.module('iris_cutter_tool_disk_diameters', []);

    angular.module('iris_cutter_tool_disk_diameters').factory('CutterToolDiskDiameters', function ($resource) {
        return $resource(iris.config.apiUrl + "/cutter-tool/devices/:deviceId/tool-disk-diameters/:id", {
            id: '@id',
            deviceId: '@deviceId'
        });
    });

    angular.module('iris_cutter_tool_disk_diameters')
        .factory('CutterToolDiskDiameterService', function (CutterToolDiskDiameters) {
            return {
                getToolDiskDiameters: deviceId => CutterToolDiskDiameters.query({deviceId:deviceId}).$promise,

                getToolDiskDiameter: (deviceId, id) => CutterToolDiskDiameters.get({deviceId:deviceId, id: id}).$promise,

                saveToolDiskDiameter: toolDiskDiameter => CutterToolDiskDiameters.save(toolDiskDiameter).$promise,

                createToolDiskDiameter: params => new CutterToolDiskDiameters(params),

                removeToolDiskDiameter: toolDiskDiameter => CutterToolDiskDiameters.remove({
                    deviceId: toolDiskDiameter.deviceId,
                    id: toolDiskDiameter.id
                }).$promise
            }
        });
})();
