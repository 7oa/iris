angular.module('openlayers-directive').decorator('openlayersDirective', ['$delegate', '$timeout', 'olHelpers', 'olMapDefaults', 'olData', function ($delegate, $timeout, olHelpers, olMapDefaults, olData) {

    var link;
    var directive = $delegate[0];

    link = function olLinkFnOverride(scope, element, attrs) {

        var isDefined = olHelpers.isDefined;
        var createLayer = olHelpers.createLayer;
        var setMapEvents = olHelpers.setMapEvents;
        var setViewEvents = olHelpers.setViewEvents;
        var createView = olHelpers.createView;
        var defaults = olMapDefaults.setDefaults(scope);

        // Set width and height if they are defined
        if (isDefined(attrs.width)) {
            if (isNaN(attrs.width)) {
                element.css('width', attrs.width);
            } else {
                element.css('width', attrs.width + 'px');
            }
        }

        if (isDefined(attrs.height)) {
            if (isNaN(attrs.height)) {
                element.css('height', attrs.height);
            } else {
                element.css('height', attrs.height + 'px');
            }
        }

        // workaround for canvas-height increasing each time openlayer-directive gets re-rendered
        var canvas = $('canvas.ol-unselectable');
        if (canvas && !isDefined(attrs.width)) {
            attrs.width = canvas.css('width');
        }
        if (canvas && !isDefined(attrs.height)) {
            attrs.height = canvas.css('height');
        }

        if (scope.defaults.alias === 'google') {

            if (!google || !olgm) {
                console.log('ERROR: Google Maps not loaded!');
            }
            else {

                if (isDefined(attrs.lat)) {
                    defaults.center.lat = parseFloat(attrs.lat);
                }

                if (isDefined(attrs.lon)) {
                    defaults.center.lon = parseFloat(attrs.lon);
                }

                if (isDefined(attrs.zoom)) {
                    defaults.center.zoom = parseFloat(attrs.zoom);
                }

                var controls = ol.control.defaults(defaults.controls);
                var interactions = ol.interaction.defaults(defaults.interactions);
                var view = createView(defaults.view);

                // Create the Openlayers Map Object with the options
                var map = new ol.Map({
                    target: element[0],
                    controls: controls,
                    interactions: interactions,
                    renderer: defaults.renderer,
                    view: view,
                    loadTilesWhileAnimating: defaults.loadTilesWhileAnimating,
                    loadTilesWhileInteracting: defaults.loadTilesWhileInteracting
                });

                scope.$on('$destroy', function () {
                    olData.resetMap(attrs.id);
                });

                var googleHybridLayer = new olgm.layer.Google({
                    mapTypeId: google.maps.MapTypeId.HYBRID
                });

                var googleRoadLayer = new olgm.layer.Google({
                    mapTypeId: google.maps.MapTypeId.ROADMAP
                });

                map.addLayer(googleHybridLayer);
                map.addLayer(googleRoadLayer);

                var olGM = new olgm.OLGoogleMaps({
                    map: map, // map is the ol.Map instance
                    watchVector: true,
                    mapIconOptions: {
                        useCanvas: true
                    }
                });
                $timeout(() => {
                    // need to do activate() with a timeout, because other layers must be added first
                    // otherwise styles are getting lost (maybe it's a bug in ol3gm)
                    olGM.activate();
                }, 100);

                scope.$on('iris.maps.gmaps.changeTypeId', (e, type) => {
                    var isRoadmap = (type === 'ROADMAP');
                    googleHybridLayer.setVisible(!isRoadmap);
                    googleRoadLayer.setVisible(isRoadmap);
                });

                if (!isDefined(attrs.olCenter)) {
                    var c = ol.proj.transform([defaults.center.lon,
                            defaults.center.lat
                        ],
                        defaults.center.projection, view.getProjection()
                    );
                    view.setCenter(c);
                    view.setZoom(defaults.center.zoom);
                }

                // Set the Default events for the map
                setMapEvents(defaults.events, map, scope);

                //Set the Default events for the map view
                setViewEvents(defaults.events, map, scope);

                // Resolve the map object to the promises
                scope.setMap(map);
                olData.setMap(map, attrs.id);
            }
        }
        else {
            directive.link(scope, element, attrs);
        }
    };

    directive.compile = function() {
        return function(scope, element, attrs) {
            link.apply(this, arguments);
        };
    };

    return $delegate;
}]);

