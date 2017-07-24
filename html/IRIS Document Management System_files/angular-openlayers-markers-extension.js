angular.module('openlayers-directive').decorator('olMarkerDirective', ['$delegate', "$window", "$log", "$q", "$timeout", "olMapDefaults", "olHelpers", '$compile', '$templateCache', 'FilesService',
    function ($delegate, $window, $log, $q, $timeout, olMapDefaults, olHelpers, $compile, $templateCache, FilesService) {

        var directive = $delegate[0];
        var compile = directive.compile;

        directive.compile = function (tElement, tAttrs) {

            var link = compile.apply(this, arguments);

            return function (scope, element, attrs, controller) {


                var createStyle = olHelpers.createStyle;

                link.apply(this, arguments);

                controller.getOpenlayersScope().getMap().then(function (map) {

                    /* get the feature by the marker properties */
                    function getOlMarker(id) {
                        var marker;
                        map.getLayers().forEach(layer => {
                            if (layer instanceof ol.layer.Vector) {
                                layer.getSource().getFeatures().forEach(feature => {

                                    // existing link between the feature and the marker properties
                                    var markerProperties = feature.get('marker');
                                    if (markerProperties && markerProperties && (markerProperties.id == id)) {
                                        marker = feature;
                                    }
                                });
                            }
                        });
                        return marker;
                    }

                    scope.$watch('properties', function (properties) {

                        if (properties && properties.label) {

                            scope.documents = properties.label.documents || [];

                            scope.getFileIcon = function (mime_type) {
                                return FilesService.getIcon(mime_type);
                            };

                            scope.goToDMS = function (file) {
                                return FilesService.goToDMS(file.folderId, file.id);
                            };
                            scope.getFileDownloadUrl = function (file) {
                                return FilesService.getFileDownloadUrl(file.id);
                            };

                            scope.sensors = [];

                            if (properties.label.sensorgroup && properties.label.sensorgroup.id) {
                                scope.sensors = properties.label.sensorgroup.sensors || scope.sensors;
                            }

                            if (properties.label.sensor && properties.label.sensor.id) {
                                scope.sensors.push(properties.label.sensor);
                            }

                            if (properties.label.type) {

                                $timeout(function () {

                                    // Precompiling the dynamic template
                                    var template = $templateCache.get(iris.config.baseUrl + '/modules/maps/templates/maps.marker.overlay.html');
                                    var compiled_template = $compile(template)(scope);
                                    element.html('').append(compiled_template);

                                }, 10);
                            }

                            if (properties.style) {

                                var marker = getOlMarker(properties.id);
                                if (marker) {
                                    marker.setStyle(createStyle(properties.style));
                                }
                            }

                            properties.handleMouseMove = function (evt) {
                                var ngClick = false;
                                if (attrs.hasOwnProperty('ngClick')) {
                                    ngClick = true;
                                }

                                if (properties.label.show && !ngClick) {
                                    return;
                                }
                                var found = false;
                                var pixel = map.getEventPixel(evt);
                                var feature = map.forEachFeatureAtPixel(pixel, function (feature) {
                                    return feature;
                                });

                                if (feature) {
                                    if (feature.getProperties().marker && feature.getProperties().marker.id == properties.id) {
                                        map.getTarget().style.cursor = 'pointer';
                                    }
                                } else {
                                    map.getTarget().style.cursor = '';
                                }
                            };


                            if ((properties.label.show === false && properties.label.showOnMouseClick) || attrs.hasOwnProperty('ngClick')) {
                                map.getViewport().addEventListener('mousemove', properties.handleMouseMove);
                            }
                        }

                    }, true);
                });
            };
        };
        return $delegate;

    }]);

