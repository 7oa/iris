angular.module('openlayers-directive').
    directive('olOverlay', ['$log', '$q', 'olMapDefaults', 'olHelpers', function ($log, $q, olMapDefaults, olHelpers) {
        return {
            restrict: 'E',
            scope: {
                properties: '=olOverlayProperties'
            },
            require: '^openlayers',
            replace: true,
            /*template: '<div class="popup-label marker"></div>',*/
            templateUrl: iris.config.moduleUrl + '/templates/maps.layer.overlay.html',
            link: function (scope, element, attrs, controller) {
                var label,
                    olScope = controller.getOpenlayersScope(),
                    createOverlay = olHelpers.createOverlay,
                    projection = 'EPSG:4326';

                scope.config = iris.config;

                olScope.getMap().then(function (map) {
                    var mapDefaults = olMapDefaults.getDefaults(olScope);
                    var viewProjection = mapDefaults.view.projection;

                    scope.$watch('properties', function (properties) {

                        // Remove previous listeners if any
                        map.getViewport().removeEventListener('mousemove', properties.handleInteraction);
                        map.getViewport().removeEventListener('click', properties.handleInteraction);

                        // This function handles popup on mouse over/click
                        properties.handleInteraction = function (evt) {

                            if (label && evt.type == 'mousemove') {
                                evt.preventDefault();
                            }
                            if (label && evt.type == 'click') {
                                map.removeOverlay(label);
                                label = undefined;
                            }
                        };

                        if (label) {
                            map.removeOverlay(label);
                            label = undefined;
                        }

                        if (properties.layers.length) {
                            var pos = ol.proj.transform([properties.position.lon, properties.position.lat], projection, viewProjection);
                            label = createOverlay(element, pos);
                            map.addOverlay(label);
                            map.getViewport().addEventListener('mousemove', properties.handleInteraction);
                            map.getViewport().addEventListener('click', properties.handleInteraction);

                        }

                    }, true);

                });

                scope.getLayerChainageUnits = function (layer) {
                    if (layer && layer.navi_data
                        && layer.navi_data.settings) return layer.navi_data.settings.unitForChainage;

                    return null;
                };

                scope.getLayerChainageDigits = function (layer) {
                    if (layer && layer.navi_data
                        && layer.navi_data.settings
                        && angular.isNumber(layer.navi_data.settings.digitsForChainage)) return layer.navi_data.settings.digitsForChainage;

                    return 3;
                }
            }
        }
    }]);
