(function () {
    angular.module('iris_gs_dms').controller('ModuleDmsPropertiesViewCtrl',
        function ($scope, GlobalSettingsService, $translate, DmsPropertiesService) {
            GlobalSettingsService.getGlobalSettingsById("dms").then(res => {
                res.value = res.value || {};
                res.value.properties = angular.merge(DmsPropertiesService.getProperties(), res.value.properties);
                $scope.settings = res;
            });

            $scope.saveSettings = function () {
                GlobalSettingsService.saveGlobalSettings("dms", $scope.settings).then(res => {
                    alertify.success($translate.instant("label.SavedSuccessfully"));
                });
            };

            $scope.setValue = function (index, field) {
                $scope.settings.value.properties[index][field] = !$scope.settings.value.properties[index][field];
            };

            $scope.gridOptions = {
                data: 'settings.value.properties',
                columnDefs: [
                    {
                        field: 'name',
                        width: '**',
                        displayName: $translate.instant('label.Name'),
                        enableSorting: true,
                        cellTemplate: `
                        <div class="ui-grid-cell-contents">
                            {{('label.'+row.entity.name) | translate}}
                        </div>`
                    },
                    {
                        field: 'isActive',
                        width: '*',
                        displayName: $translate.instant('label.Active'),
                        cellTemplate: `
                        <div class="ui-grid-cell-contents">
                            <button class="btn btn-link {{row.entity.isActive ? 'text-success' : 'text-danger'}}"
                                    ng-click="grid.appScope.setValue(grid.renderContainers.body.visibleRowCache.indexOf(row), 'isActive')">
                                <i  class="fa {{row.entity.isActive ? 'fa-check' : 'fa-times'}}"></i>
                            </button>
                        </div>`
                    },
                    {
                        field: 'isMultiple',
                        width: '*',
                        displayName: $translate.instant('label.Multiple'),
                        cellTemplate: ` 
                        <div class="ui-grid-cell-contents">
                            <button class="btn btn-link {{row.entity.isMultiple ? 'text-success' : 'text-danger'}}"
                                    ng-click="grid.appScope.setValue(grid.renderContainers.body.visibleRowCache.indexOf(row), 'isMultiple')">
                                <i  class="fa {{row.entity.isMultiple ? 'fa-check' : 'fa-times'}}"></i>
                            </button>
                        </div>`
                    }
                ]
            };

        });
})();
