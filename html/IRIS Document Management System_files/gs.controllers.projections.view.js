(function () {

    angular.module('iris_gs_maps').controller('ModuleProjectionsViewCtrl',
        function ($scope, $translate, $uibModal, MapService, mapsSettings) {

            $scope.map_settings = mapsSettings;
            $scope.projections;

            $scope.refresh = function() {
                $scope.projections = [];
                for (var p in $scope.map_settings.value.projections) {
                    var proj = $scope.map_settings.value.projections[p];
                    if (proj.proj4) {
                        $scope.projections.push({
                            id: proj.defaults.alias,
                            name: proj.name,
                            proj4: proj.proj4
                        });
                    }
                }
            }

            $scope.refresh();

            $scope.gridOptions = {
                data: "projections",
                enablePaginationControls: false,
                paginationPageSize: 10,
                showGridFooter: true,
                columnDefs: [
                    {
                        field: 'id',
                        displayName: 'ID',
                        enableSorting: true,
                        width: 100
                    },
                    {
                        field: 'name',
                        width: '*',
                        displayName: $translate.instant('label.Name'),
                        enableSorting: true
                    },
                    {
                        field: 'proj4',
                        width: '**',
                        displayName: 'proj4 definition',
                        enableSorting: false
                    },
                    {
                        name: 'actions',
                        displayName: $translate.instant('label.Actions'),
                        width: 100,
                        enableSorting: false,
                        cellTemplate: '\
                    <div class="ui-grid-cell-contents actions">\
                        <a href="javascript:void(0)" ng-click="grid.appScope.openModuleSettingsModal(row)" class="btn btn-default">\
                            <i class="fa fa-pencil"></i> {{\'label.Edit\' | translate}}\
                        </a> \
                        <button class="btn btn-danger" ng-click="grid.appScope.remove(row.entity)" uib-tooltip="{{\'label.Remove\' | translate}}">\
                            <i class="fa fa-trash-o"></i>\
                        </button>\
                    </div>'
                    }
                ],
                onRegisterApi: function (gridApi) {
                    $scope.gridOptions.gridAPI = gridApi;
                }
            };

            $scope.openModuleSettingsModal = function (row) {

                var object_id;
                var data = {};
                //edit element
                if (row && row.entity.id) {
                    object_id = row.entity.id;
                    data = row.entity;
                }
                //edit default
                if (row && !row.entity.id) {
                    object_id = 'default';
                }
                //create new element
                if (!row) {

                }

                return $uibModal.open({
                    templateUrl: iris.config.componentsUrl + '/global-settings/templates/module.settings.maps.projections.edit.html',
                    resolve: {
                        'params': function () {
                            return {
                                'object_id': object_id,
                                'settings_alias': 'projections',
                                'module_alias': 'maps',
                                'data': data
                            }
                        }
                    },
                    scope: $scope,
                    controller: 'ModuleProjectionsEditCtrl',
                    size: 'lg'
                });

            };

            $scope.remove = function (projection) {
                alertify.confirm($translate.instant('message.ConfirmDeleteProjection'), function (e) {
                    if (e) {
                        delete $scope.map_settings.value.projections[projection.id];
                        saveMapSettings();
                    }
                });
            }

            $scope.saveProjection = function (projection) {
                if (projection && projection.id) {
                    $scope.map_settings.value.projections[projection.id] = {
                        center: {
                            projection: projection.id
                        },
                        defaults: {
                            view: {
                                projection: projection.id
                            },
                            alias: projection.id
                        },
                        name: projection.name,
                        proj4: projection.proj4
                    }
                    saveMapSettings();
                }
            }

            var saveMapSettings = function() {
                MapService.saveMapSettings($scope.map_settings.value).then(() => {
                    alertify.success($translate.instant('label.SavedSuccessfully'));
                });
                $scope.refresh();
            }

        });

})();