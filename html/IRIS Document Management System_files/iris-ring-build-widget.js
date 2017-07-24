(function () {
    angular.module('irisRingBuildWidget').directive('irisRingBuildWidget',
        function ($q, $filter, RingsService, IrisRingBuildWidgetService, JackConfigurationService) {
            return {
                restrict: 'EA',
                scope: {
                    params: '=',
                    widget: '='
                },
                templateUrl: iris.config.widgetsUrl + '/iris-ring-build-widget/templates/iris-ring-build-widget.view.html',

                controller: function ($scope) {
                    $scope.irisFabric = {
                        api: {},
                        options: {
                            fixAspectRatio: true,
                            enableSelection: false,
                            autoSize: {
                                toWidth: true,
                                toHeight: false
                            }
                        }
                    };
                },

                link: function (scope, element, attrs) {
                    scope.widget = scope.widget || {};
                    scope.widget.settings = scope.widget.settings || {};
                    scope.params = scope.params || {};
                    scope.params = angular.extend({}, scope.params, IrisRingBuildWidgetService.getDefaultSettings(), scope.widget.settings);
                    scope.params.demo = (attrs.mode == 'demo');

                    function refreshRingData() {
                        var q = new $q.defer();

                        scope.ringData = {};
                        if (scope.params.demo) {
                            scope.ringData = IrisRingBuildWidgetService.getDemoData();
                            q.resolve();
                        } else {
                            IrisRingBuildWidgetService.getData(scope.params.project_id, scope.params.device_id, scope.params.date.ring).then((data) => {
                                scope.ringData = data || {};
                                fixRingData();
                                if (scope.ringData.ringType) {
                                    JackConfigurationService.getJackConfigurations(scope.params.device_id).then((jacks) => {
                                        var filterJack = jacks.filter(j => j.orientationId == scope.ringData.ringType.orientationId);
                                        if (filterJack.length === 1) scope.ringData.keyStoneAngle = filterJack[0].angle;
                                        else scope.ringData.keyStoneAngle = null;
                                        q.resolve();
                                    });
                                } else {
                                    q.resolve();
                                }
                            });
                        }

                        return q.promise;
                    }

                    function fixRingData() {
                        var tables = ["top", "left", "right", "bottom"],
                            aliases = ["Top", "Left", "Right", "Bottom"];

                        scope.ringData.cylindersPush || (scope.ringData.cylindersPush = {});
                        scope.ringData.cylindersPushAfter || (scope.ringData.cylindersPushAfter = {});
                        scope.ringData.tscBefore || (scope.ringData.tscBefore = {});
                        scope.ringData.tscAfter || (scope.ringData.tscAfter = {});

                        for (var i = 0; i < tables.length; i++) {
                            var t = tables[i], a = aliases[i];
                            scope.ringData.cylindersPush[t] = scope.ringData.cylindersPush[t + "Measurement"];
                            scope.ringData.cylindersPushAfter[t] = scope.ringData.cylindersPushAfter[t + "Measurement"];
                            scope.ringData.tscBefore[t] = scope.ringData["tsc" + a + "Before"];
                            scope.ringData.tscAfter[t] = scope.ringData["tsc" + a + "After"];
                        }
                    }

                    function getRing(canvasWidth, ringParams) {
                        var padding = 10,
                            ringBuild = new irisFabricWidgets.RingBuild({
                                left: padding,
                                top: padding,
                                width: canvasWidth - padding * 2,
                                height: canvasWidth - padding * 2,
                                keyStoneVisible: ringParams.ring.keyStone.visible,
                                keyStoneShape: ringParams.ring.keyStone.shape,
                                keyStoneSize: ringParams.ring.keyStone.size,
                                keyStoneFill: ringParams.ring.keyStone.fill,
                                ringTypeVisible: ringParams.ring.ringType.visible,
                                ringTypeLabel: $filter("irisTranslate")(ringParams.ring.ringType.label, ringParams.ring.ringType.translations),
                                keyPositionVisible: ringParams.ring.keyStonePosition.visible,
                                keyPositionLabel: $filter("irisTranslate")(ringParams.ring.keyStonePosition.label, ringParams.ring.keyStonePosition.translations)
                            });

                        ringBuild.ringTypeValue = scope.ringData.ringType && scope.ringData.ringType.name,
                        ringBuild.keyPositionValue = scope.ringData.ringType && scope.ringData.ringType.orientationName;
                        ringBuild.keyStoneAngle = scope.ringData.keyStoneAngle;

                        return ringBuild;
                    }

                    function redrawRing() {
                        var fabricEditor = scope.irisFabric.api.getFabricEditor();
                        fabricEditor.clear();
                        refreshRingData().then(() => {
                            fabricEditor.add(getRing(fabricEditor.width, scope.params));
                        });
                    }

                    scope.$on('irisFabric:editor:ready', function() {
                        redrawRing();
                    });

                    scope.$watch('params', function (nv, ov) {
                        if (!nv || angular.equals(nv, ov)) return;
                        redrawRing();
                    }, true);
                }
            };
        });

    angular.module('irisRingBuildWidget').directive('irisRingBuildWidgetTable',
        function () {
            return {
                restrict: 'EA',
                replace: true,
                scope: {
                    params: '=',
                    data: '=',
                    caption: '='
                },
                templateUrl: iris.config.widgetsUrl + '/iris-ring-build-widget/templates/iris-ring-build-widget.table.html',
                link: function(scope, elements, attrs) {
                    scope.alias = attrs.alias;
                    scope.$watch("data", function(nv, ov) {
                        if (!nv || angular.equals(nv, ov)) return;
                        scope.cylindersPush = scope.data.cylindersPush && scope.data.cylindersPush[scope.alias];
                        scope.cylindersPushAfter = scope.data.cylindersPushAfter && scope.data.cylindersPushAfter[scope.alias];
                        scope.tscBefore = scope.data.tscBefore && scope.data.tscBefore[scope.alias];
                        scope.tscAfter = scope.data.tscAfter && scope.data.tscAfter[scope.alias];
                    }, true);
                }
            }
        });
})();

