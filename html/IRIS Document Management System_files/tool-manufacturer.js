(function() {
    irisAppDependencies.add('iris_cutter_tool_manufacturer');

    angular.module('iris_cutter_tool_manufacturer', []);

    angular.module('iris_cutter_tool_manufacturer').factory('CutterToolManufacturers', function ($resource) {
        return $resource(iris.config.apiUrl + "/cutter-tool/devices/:deviceId/tool-manufacturers/:id", {
            id: '@id',
            deviceId: '@deviceId'
        });
    });

    angular.module('iris_cutter_tool_manufacturer')
        .factory('CutterToolManufacturerService', function (CutterToolManufacturers) {
            return {
                getToolManufacturers: deviceId => CutterToolManufacturers.query({deviceId:deviceId}).$promise,

                getToolManufacturer: (deviceId, id) => CutterToolManufacturers.get({deviceId:deviceId, id: id}).$promise,

                saveToolManufacturer: toolManufacturer => CutterToolManufacturers.save(toolManufacturer).$promise,

                createToolManufacturer: params => new CutterToolManufacturers(params),

                removeToolManufacturer: toolManufacturer => CutterToolManufacturers.remove({
                    deviceId: toolManufacturer.deviceId,
                    id: toolManufacturer.id
                }).$promise
            }
        });
})();
