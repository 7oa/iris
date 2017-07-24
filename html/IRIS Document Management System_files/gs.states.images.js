(function () {

    'use strict';

    angular.module('iris_gs_images_states', []);

    angular.module('iris_gs_images_states').config(
        function ($stateProvider) {
            $stateProvider
                .state('module.images', {
                    url: '/images',
                    template: '<div class="b-content flex-grid" ui-view></div>'
                })
                .state('module.images.images', {
                    url: '/images',
                    templateUrl: iris.config.componentsUrl + '/global-settings/templates/module.settings.images.images.view.html',
                    controller: 'ModuleImagesViewCtrl'
                })
                .state('module.images.image', {
                    url: '/image/:imageId',
                    templateUrl: iris.config.componentsUrl + '/global-settings/templates/module.settings.images.images.edit.html',
                    controller: 'ModuleImagesEditCtrl',
                    resolve: {
                        'image': function ($stateParams, ImageService) {
                            return ImageService.getImageForId(+$stateParams.imageId).$promise;
                        },
                        'mapsSettings': function (MapService) {
                            return MapService.getMapDefaults().$promise;
                        }
                    }
                });
        }
    );

})();