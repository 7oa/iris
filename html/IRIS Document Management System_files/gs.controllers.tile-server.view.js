(function () {

    angular.module('iris_gs_maps').controller('ModuleTileServerViewCtrl',
        function ($scope, $translate, $uibModal, MapService, mapsSettings) {

            $scope.map_settings = mapsSettings;
            $scope.tile_server;

            $scope.refresh = function() {
                $scope.tile_server = [];
                for (var m in $scope.map_settings.value.maps) {
                    var map = $scope.map_settings.value.maps[m];
                    if (map.type === "TileWMS") {
                        $scope.tile_server.push({
                            id: map.alias,
                            name: map.name,
                            type: map.type,
                            projection: map.projection,
                            url: map.url,
                            layer: map.layer, // WMTS
                            attributions: map.attributions,
                            layers: map.params.LAYERS,
                            format: map.params.FORMAT || map.format, // TileWMS || WMTS
                            version: map.params.VERSION,
                            left: map.extent[0],
                            bottom: map.extent[1],
                            right: map.extent[2],
                            top: map.extent[3]
                        });
                    } else if (map.type === "WMTS") {
                        $scope.tile_server.push({
                            id: map.alias,
                            name: map.name,
                            type: map.type,
                            projection: map.projection,
                            url: map.url,
                            layer: map.layer,
                            attributions: map.attributions,
                            format: map.format,
                            left: map.extent[0],
                            bottom: map.extent[1],
                            right: map.extent[2],
                            top: map.extent[3],
                            style: map.style,
                            requestEncoding : map.requestEncoding,
                            matrixSet: map.matrixSet,
                            resolutions: map.tileGrid.resolutions,
                            matrixIds: map.tileGrid.matrixIds,
                            maxZoom: map.tileGrid.resolutions ? map.tileGrid.resolutions.length + 1 : 1
                        });
                    }
                }
            }

            $scope.refresh();

            $scope.gridOptions = {
                data: "tile_server",
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
                        field: 'type',
                        width: '*',
                        displayName: $translate.instant('label.Type'),
                        enableSorting: false
                    },
                    {
                        field: 'url',
                        width: '*',
                        displayName: 'URL',
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
                    templateUrl: iris.config.componentsUrl + '/global-settings/templates/module.settings.maps.tile-server.edit.html',
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
                    controller: 'ModuleTileServerEditCtrl',
                    size: 'lg'
                });
            };

            $scope.remove = function (map) {
                alertify.confirm($translate.instant('message.ConfirmDeleteTileServer'), function (e) {
                    if (e) {
                        delete $scope.map_settings.value.maps[map.id];
                        saveMapSettings();
                    }
                });
            }

            $scope.saveTileServer = function (map) {
                if (map && map.id) {
                    if (map.type === "TileWMS") {
                        $scope.map_settings.value.maps[map.id] = {
                            alias: map.id,
                            name: map.name,
                            projection: map.projection,
                            url: map.url,
                            attributions: map.attributions,
                            params: {
                                LAYERS: map.layers,
                                FORMAT: map.format,
                                VERSION: map.version
                            },
                            extent: [map.left, map.bottom, map.right, map.top],
                            type: map.type,
                            serverType: "mapserver"
                        };
                    } else if (map.type === "WMTS") {
                        $scope.map_settings.value.maps[map.id] = {
                            alias: map.id,
                            name: map.name,
                            projection: map.projection,
                            url: map.url,
                            attributions: map.attributions,
                            layer: map.layer,
                            format: map.format,
                            style: map.style,
                            requestEncoding: map.requestEncoding,
                            matrixSet: map.matrixSet,
                            extent: [map.left, map.bottom, map.right, map.top],
                            type: map.type,
                            tileGrid: {
                                origin: [map.left, map.top],
                                resolutions: map.resolutions,
                                matrixIds: map.matrixIds
                            }
                        };
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