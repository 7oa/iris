(function() {

    'use strict';

    angular.module('iris_gs_maps_states', []);

    angular.module('iris_gs_maps_states').config(
        function ($stateProvider) {
            $stateProvider
                .state('module.maps',{
                    url:        '/maps',
                    template:   '<div class="b-content flex-grid" ui-view></div>'
                })
                .state('module.maps.layers',{
                    url:        '/layers',
                    templateUrl: iris.config.componentsUrl + '/global-settings/templates/maps/layers.html',
                    controller: 'ModuleLayersViewCtrl',
                    resolve: {
                        'mapsSettings': function (MapService) {
                            return MapService.getMapDefaults().$promise;
                        }
                    }
                })
                .state('module.maps.projections',{
                    url:        '/projections',
                    templateUrl: iris.config.componentsUrl + '/global-settings/templates/module.settings.maps.projections.view.html',
                    controller: 'ModuleProjectionsViewCtrl',
                    resolve: {
                        'mapsSettings': function (MapService) {
                            return MapService.getMapDefaults().$promise;
                        }
                    }
                })
                .state('module.maps.tile-server',{
                    url:        '/tile-server',
                    templateUrl: iris.config.componentsUrl + '/global-settings/templates/module.settings.maps.tile-server.view.html',
                    controller: 'ModuleTileServerViewCtrl',
                    resolve: {
                        'mapsSettings': function (MapService) {
                            return MapService.getMapDefaults().$promise;
                        }
                    }
                });
        }
    );

})();