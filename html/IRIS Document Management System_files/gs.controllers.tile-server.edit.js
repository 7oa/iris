(function () {

    angular.module('iris_gs_maps').controller('ModuleTileServerEditCtrl',
        function ($scope, $controller, $translate, $resource, params, $uibModalInstance) {

            $scope.tile_server = params.data || {};
            $scope.is_add = !params.object_id;

            $scope.selectableProjections = [];
            $scope.selectableImageFormats = ["image/png", "image/jpeg"];

            $scope.selectableProjections = [];
            $scope.selectableTypes = [{
                id: "TileWMS",
                name: "TileWMS"
            }, {
                id: "WMTS",
                name: "WMTS"
            }];

            if (!$scope.tile_server.type) {
                $scope.tile_server.type = $scope.selectableTypes[0].id;
            }

            $scope.selectedType = $scope.tile_server.type;
            $scope.typeSelected = function (selectedType) {
                if (selectedType) {
                    $scope.tile_server.type = selectedType;
                }
            }

            $scope.maxZoom = $scope.tile_server.maxZoom;
            $scope.maxZoomChanged = function(maxZoom) {
                if (maxZoom) {
                    if (!$scope.tile_server.resolutions) {
                        $scope.tile_server.resolutions = [];
                        $scope.tile_server.resolutions.push(1024);
                        $scope.tile_server.matrixIds = [];
                        $scope.tile_server.matrixIds.push(($scope.tile_server.matrixSet || '') + '0');
                    }
                    while (maxZoom < ($scope.tile_server.resolutions.length + 1)) {
                        $scope.tile_server.resolutions.pop();
                        $scope.tile_server.matrixIds.pop();
                    }
                    while (maxZoom > ($scope.tile_server.resolutions.length + 1)) {
                        var lastResolution = $scope.tile_server.resolutions.slice(-1)[0] || 1.0;
                        $scope.tile_server.resolutions.push(lastResolution / 2.0);
                        $scope.tile_server.matrixIds.push(($scope.tile_server.matrixSet || '') + $scope.tile_server.matrixIds.length);
                    }
                    $scope.tile_server.maxZoom = maxZoom;
                }
            }

            for (var p in $scope.map_settings.value.projections) {
                var proj = $scope.map_settings.value.projections[p];
                if (proj.proj4) {
                    $scope.selectableProjections.push({
                        id: proj.defaults.alias,
                        name: proj.defaults.alias + (proj.name ? (" - " + proj.name) : "")
                    });
                }
            }

            $scope.save = function () {
                $scope.saveTileServer($scope.tile_server);
                $uibModalInstance.close($scope.tile_server);
            };
        });

})();