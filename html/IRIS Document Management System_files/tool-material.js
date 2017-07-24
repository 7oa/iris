(function() {
    irisAppDependencies.add('iris_cutter_tool_material');

    angular.module('iris_cutter_tool_material', []);

    angular.module('iris_cutter_tool_material').factory('CutterToolMaterials', function ($resource) {
        return $resource(iris.config.apiUrl + "/cutter-tool/devices/:deviceId/tool-materials/:id", {
            id: '@id',
            deviceId: '@deviceId'
        });
    });

    angular.module('iris_cutter_tool_material')
        .factory('CutterToolMaterialsService', function (CutterToolMaterials) {
            return {
                getToolMaterials: deviceId => CutterToolMaterials.query({deviceId:deviceId}).$promise,

                getToolMaterial: (deviceId, id) => CutterToolMaterials.get({deviceId:deviceId, id: id}).$promise,

                saveToolMaterial: toolMaterial => CutterToolMaterials.save(toolMaterial).$promise,

                createToolMaterial: params => new CutterToolMaterials(params),

                removeToolMaterial: toolMaterial => CutterToolMaterials.remove({
                    deviceId: toolMaterial.deviceId,
                    id: toolMaterial.id
                }).$promise
            }
        });
})();
