(function () {

    angular.module('iris_gs_geomonitoring_edit', []);

    angular.module('iris_gs_geomonitoring_edit').controller('ModuleSensorTypesEditCtrl',
        function ($scope, $controller, $translate, params, $uibModalInstance, GeosensorTypesService) {

            $scope.map_defaults = {
                alias: "",
                view: {
                    projection: 'EPSG:3857',
                    maxZoom: 21,
                    minZoom: 3
                },
                center: {lon: 0, lat: 0}
            };

            if (!params.object_id) {
                $scope.is_add = true;
                $scope.sensorType = {
                    name: "", style: {}
                };
            }
            else {
                $scope.is_add = false;
                GeosensorTypesService.getSensorType(params.object_id).then(result => {
                    $scope.sensorType = result;
                    $scope.sensorType.styleAsText = JSON.stringify($scope.sensorType.style, null, "\t");
                    console.log("SensorType to edit: ", $scope.sensorType);
                });
            }

            $scope.save = function() {
                $scope.sensorType.style = JSON.parse($scope.sensorType.styleAsText);
                GeosensorTypesService.saveGeosensorType($scope.sensorType).then(() => {
                    alertify.success($translate.instant('text.ItemSavedSuccessfully'));
                    $uibModalInstance.close($scope.sensorType);
                });
            }
        });

})();