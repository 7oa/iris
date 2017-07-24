(function () {

    angular.module('iris_gs_geomonitoring_view', []);

    angular.module('iris_gs_geomonitoring_view').controller('ModuleSensorTypesViewCtrl',
        function ($scope, $controller, $translate, $state, GeosensorTypesService) {

            $scope.items = [];

            $scope.loadItems = function() {
                GeosensorTypesService.getSensorTypes().then(result => {
                    $scope.items = result;
                });
            }

            $scope.loadItems();

            angular.extend($scope, $controller('ModuleDirectoriesBaseViewCtrl', {$scope: $scope}));

            $scope.updateGridRowActions();

            var table_fields = [
                {
                    name: 'alias',
                    displayName: $translate.instant('label.Alias'),
                    width: '*'
                },
                {
                    name: 'name',
                    displayName: $translate.instant('label.Name'),
                    width: '*'
                },
                {
                    name: 'style',
                    displayName: 'Style',
                    width: '***'
                }
            ];

            $scope.addFieldsToGrid(table_fields);

            $scope.removeFieldsFromGrid(["#"]);

            $scope.remove = function (item) {
                alertify.confirm($translate.instant('text.RemoveItemConfirm'), function (e) {
                    if (e) {
                        GeosensorTypesService.deleteGeosensorType(item.id).then(() => {
                            $scope.loadItems();
                            alertify.success($translate.instant('text.RemoveItemSuccess'));
                        });
                    }
                });
            };

        });


})();