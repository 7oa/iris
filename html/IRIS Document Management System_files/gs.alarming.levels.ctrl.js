(function () {
    angular.module('iris_gs_alarming').controller('ModuleLevelsViewCtrl',
        function ($scope, $translate, $timeout, AlarmingService) {
            $scope.$parent.setItem = function(item) {
                $scope.item = item;
                $timeout(() => angular.element('[autofocus] input[type="text"]').focus());
            };

            $scope.$parent.removeItem = function(item) {
                alertify.confirm($translate.instant('message.DeleteItemConfirm'), function (e) {
                    if (e) {
                        var loaderPath = '.app-content';
                        iris.loader.start(loaderPath);

                        AlarmingService.removeLevel(item.device.id, item.id).then(response => {
                            iris.loader.stop(loaderPath);

                            alertify.success($translate.instant('label.Alarming.AlarmingLevelRemoved'));

                            $scope.getItems(AlarmingService.getLevels);
                        });
                    }
                });
            };

            $scope.saveItem = function () {
                var loaderPath = '.app-content';
                iris.loader.start(loaderPath);

                AlarmingService.saveLevel($scope.item.device.id, $scope.item.id, $scope.item).then(response => {
                    iris.loader.stop(loaderPath);

                    alertify.success($translate.instant('label.Alarming.AlarmingLevelSaved'));

                    $scope.getItems(AlarmingService.getLevels);
                    $scope.setNewItem();
                }, function() {
                    iris.loader.stop(loaderPath);
                });
            };

            $scope.gridOptions.columnDefs = [
                {
                    field: 'id',
                    width: 50,
                    displayName: $translate.instant('label.Id')
                },
                {
                    field: 'name',
                    width: '*',
                    displayName: $translate.instant('label.Name')
                },
                {
                    field: 'device.name',
                    width: '*',
                    displayName: $translate.instant('label.Device'),
                    // cellFilter: `IrisFilterField:[grid.appScope.devices]`
                },
                {
                    field: 'level',
                    width: 70,
                    displayName: $translate.instant('label.Level')
                },
                {
                    field: 'color',
                    width: 70,
                    displayName: $translate.instant('label.Color'),
                    cellTemplate: `
                        <div class="ui-grid-cell-contents">
                            <i class="fa fa-circle" ng-style="{ color: row.entity.color }"></i>
                        </div>`
                }/*,
                {
                    name: 'actions',
                    displayName: $translate.instant('label.Actions'),
                    width: 100,
                    enableSorting: false,
                    cellTemplate: `<div class="ui-grid-cell-contents actions">
                            <button class="btn btn-link"
                                uib-tooltip="{{'label.Edit' | translate}}"
                                ng-click="grid.appScope.editItem(row.entity, $event);">
                            <i class="fa fa-pencil"></i>
                        </button>
                        <button class="btn btn-link"
                                uib-tooltip="{{'label.Remove' | translate}}"
                                ng-click="grid.appScope.removeItem(row.entity); $event.stopPropagation();">
                            <i class="fa fa-trash-o"></i>
                        </button>
                    </div>`
                }*/
            ];


            $scope.getItems(AlarmingService.getLevels);
            $scope.setNewItem();
        })
})();
