(function () {

    angular.module('iris_gs_maps', ['iris_gs_maps_edit', 'iris_gs_maps_view', 'iris_gs_maps_states']);

    angular.module('iris_gs_maps').controller('ModuleLayersViewCtrl',
        function ($scope, $translate, LayerHelpers, MapService, mapsSettings) {
            $scope.layerGroupsTypes = LayerHelpers.getLayerGroupTypes();
            $scope.mapsSettings = mapsSettings;

            $scope.saveMapsSettings = function () {
                MapService.saveMapSettings($scope.mapsSettings.value).then(() => {
                    alertify.success($translate.instant('label.SavedSuccessfully'));
                });
            }

            $scope.resetMapsSettings = function () {
                MapService.resetMapSettings().then(result => {
                    $scope.mapsSettings = result;
                    alertify.success($translate.instant('label.SavedSuccessfully'));
                });
            }

        });

})();