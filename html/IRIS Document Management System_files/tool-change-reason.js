(function() {
    irisAppDependencies.add('iris_cutter_tool_change_reason');

    angular.module('iris_cutter_tool_change_reason', []);

    angular.module('iris_cutter_tool_change_reason').factory('CutterToolChangeReasons', function ($resource) {
        return $resource(iris.config.apiUrl + "/cutter-tool/devices/:deviceId/tool-change-reasons/:id", {
            id: '@id',
            deviceId: '@deviceId'
        });
    });

    angular.module('iris_cutter_tool_change_reason')
        .factory('CutterToolChangeReasonService', function (CutterToolChangeReasons) {
            return {
                getToolChangeReasons: deviceId => CutterToolChangeReasons.query({deviceId:deviceId}).$promise,

                getToolChangeReason: (deviceId, id) => CutterToolChangeReasons.get({deviceId:deviceId, id: id}).$promise,

                saveToolChangeReason: toolChangeReason => CutterToolChangeReasons.save(toolChangeReason).$promise,

                createToolChangeReason: params => new CutterToolChangeReasons(params),

                removeToolChangeReason: toolChangeReason => CutterToolChangeReasons.remove({
                    deviceId: toolChangeReason.deviceId,
                    id: toolChangeReason.id
                }).$promise
            }
        });
})();
