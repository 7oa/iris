(function() {
    irisAppDependencies.add('iris_cutter_tool_options');

    angular.module('iris_cutter_tool_options', []);

    angular.module('iris_cutter_tool_options').factory('CutterToolOptions', function ($resource) {
        return $resource(iris.config.apiUrl + "/cutter-tool/devices/:deviceId/tool-options/:id", {
            id: '@id',
            deviceId: '@deviceId'
        });
    });

    angular.module('iris_cutter_tool_options')
        .factory('CutterToolOptionsService', function (CutterToolOptions) {
            return {
                getToolOptions: deviceId => CutterToolOptions.query({deviceId:deviceId}).$promise,

                getToolOption: (deviceId, id) => CutterToolOptions.get({deviceId:deviceId, id: id}).$promise,

                saveToolOption: toolOption => CutterToolOptions.save(toolOption).$promise,

                createToolOption: params => new CutterToolOptions(params),

                removeToolOption: toolOption => CutterToolOptions.remove({
                    deviceId: toolOption.deviceId,
                    id: toolOption.id
                }).$promise
            }
        });
})();
