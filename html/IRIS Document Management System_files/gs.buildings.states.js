(function() {
    'use strict';

    angular.module('iris_gs_buildings_states', []);

    angular.module('iris_gs_buildings_states').controller('ModuleBuildingsFakeCtrl', function($scope) {} );

    angular.module('iris_gs_buildings_states').config(
        function ($stateProvider) {
            $stateProvider
                .state('module.buildings', {
                    url: '',
                    controller: 'ModuleBuildingsFakeCtrl',
                    template: `<div class="b-content b-window flex-grid" ui-view></div>`
                })
                .state('module.buildings.building', {
                    url: '/buildings?parentId',
                    controller: 'ModuleBuildingViewCtrl',
                    templateUrl: `${iris.config.componentsUrl}/global-settings/templates/buildings/ms.buildings.building.html`,
                    resolve: {
                        'parent': ($stateParams, BuildingService) => $stateParams['parentId'] ? BuildingService.get($stateParams['parentId']) : {}
                    }
                });
        }
    )
})();
