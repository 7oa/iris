(function () {
    angular.module('iris_gs_sensor_data_import').controller('ModuleSensorDataImportViewCtrl',
        function ($scope, $state, $translate, $uibModal, devices, buildings, ImportSettingsService) {
            $scope.devices = devices;
            $scope.buildings = buildings;
            $scope.filter = {};

            $scope.settings = [];
            $scope.refreshSettings = function () {
                var settingsPromise = $scope.filter.deviceId
                    ? ImportSettingsService.getImportSettings($scope.filter.deviceId)
                    : ImportSettingsService.getAllImportSettings();

                settingsPromise.then(result => {
                    $scope.settings = result;

                    for (var i in $scope.settings) {
                        var setting = $scope.settings[i];
                        setting.dataSeriesCount = 0;
                        if (setting.columns) {
                            for (var colInd in setting.columns) {
                                if (setting.columns[colInd].dataSeries) {
                                    setting.dataSeriesCount++;
                                }
                            }
                        }
                    }
                })
            };
            $scope.refreshSettings();

            $scope.addImportSettings = function () {
                $state.go('module.sensor-data-import.settings.edit', {id: 'add', deviceId: $scope.filter.deviceId});
            };

            $scope.editImportSettings = function (importSetting) {
                $state.go('module.sensor-data-import.settings.edit', {id: importSetting.id, deviceId: importSetting.device.id});
            };

            $scope.deleteImportSettings = function (importSetting) {
                alertify.confirm($translate.instant('message.DeleteItemConfirm'), function (e) {
                    if (e) {
                        ImportSettingsService.deleteImportSetting(importSetting.device.id, importSetting).then(() => {
                                alertify.success($translate.instant('message.DeleteItemSuccessful'));
                                $scope.refreshSettings();
                            }
                        );
                    }
                });
            };

            $scope.showActivities = function (importSettings) {
                ImportSettingsService.openImportModal(importSettings.device.id, "url", {}, importSettings, {}, "ModuleSensorDataImportManualCtrl",
                    iris.config.componentsUrl + '/global-settings/templates/sensor-data-import/sensor-data-import-activities.html', 'xl')
            };

            $scope.gridOptions = {
                data: 'settings',
                enablePaginationControls: false,
                paginationPageSize: 10,
                showGridFooter: true,
                enableFullRowSelection: true,
                enableSelectAll: false,
                selectionRowHeaderWidth: 35,
                multiSelect: false,
                columnDefs: [
                    {
                        field: 'device.name',
                        width: '*',
                        displayName: $translate.instant('label.Device')
                    },
                    {
                        field: 'buildingId',
                        width: '*',
                        displayName: $translate.instant('label.Building'),
                        cellFilter: 'IrisFilterField:[grid.appScope.buildings]'
                    },
                    {
                        field: 'name',
                        width: '*',
                        displayName: $translate.instant('label.Name')
                    },
                    {
                        field: 'type',
                        width: '*',
                        displayName: $translate.instant('label.Type')
                    },
                    {
                        field: 'dataSeriesCount',
                        width: '*',
                        displayName: $translate.instant('label.DataSeries')
                    },
                    {
                        field: 'active',
                        width: '*',
                        displayName: $translate.instant('label.Active'),
                        cellTemplate: `<div class="ui-grid-cell-contents">
                            <i class="fa fa-play" ng-if="row.entity.active" ng-style="{color: '#93BE3D;'}"></i>
                        </div>`

                    },
                    {
                        name: 'activities',
                        width: '*',
                        displayName: $translate.instant('label.Activities'),
                        cellTemplate: `
                        <div class="ui-grid-cell-contents actions">
                            <button class="btn btn-link"
                                    ng-click="grid.appScope.showActivities(row.entity); $event.stopPropagation();"><i class="fa fa-list-alt"></i></button>
                        </div>`
                    },
                    {
                        name: 'actions',
                        displayName: $translate.instant('label.Actions'),
                        width: 150,
                        enableSorting: false,
                        cellTemplate: `<div class="ui-grid-cell-contents">
                            <button class="btn btn-default" ng-click="grid.appScope.editImportSettings(row.entity)" uib-tooltip="{{'label.Edit' | translate}}">
                                <i class="fa fa-pencil"></i>
                            </button>
                            <button class="btn btn-danger" ng-click="grid.appScope.deleteImportSettings(row.entity)" uib-tooltip="{{'label.Delete' | translate}}">
                                <i class="fa fa-trash-o"></i>
                            </button>
                        </div>`
                    }
                ]
            };


        });

    angular.module('iris_gs_sensor_data_import').factory('ImportFiles', function ($resource) {
        return $resource(iris.config.apiUrl + "/sensor-import/devices/:deviceId/import/settings/:id/files", {
            id: '@id',
            deviceId: '@deviceId'
        });
    });

    angular.module('iris_gs_sensor_data_import').controller('ModuleSensorDataImportManualCtrl',
        function ($controller, importSettings, $scope, $state,
                  BuildingService, ImportSettingsService, $translate, IrisTimeService, FileUploader, ImportFiles) {
            var $uibModalInstance = {};
            var deviceId = importSettings.device.id;
            var tunnelId = importSettings.source;
            var uploadUrl = importSettings.type == "SENSOR_DATA"
                ? `${iris.config.apiUrl}/sensor-import/devices/${deviceId}/import/manual`
                : `${iris.config.apiUrl}/construction/segment-management/tunnels/${tunnelId}/segments/import-manual/${importSettings.id}`;
            var analysisUrl = `${iris.config.apiUrl}/import-settings/devices/${deviceId}/settings/meta`;
            var fieldsMapping = [];
            var params = {};

            angular.extend($scope, $controller('ImportModalBaseCtrl', {
                $scope, $uibModalInstance, analysisUrl, uploadUrl, importSettings, fieldsMapping, params,
                ImportSettingsService, $translate, IrisTimeService, FileUploader
            }));

            $scope.importFiles = [];

            $scope.refresh = function () {
                ImportFiles.query({deviceId, id: importSettings.id}).$promise.then(result => {
                    $scope.importFiles = result;
                    //console.log(result)
                });
            };
            $scope.refresh();

            $scope.filesGridOptions = {
                data: 'importFiles',
                enablePaginationControls: false,
                paginationPageSize: 10,
                showGridFooter: true,
                enableFullRowSelection: true,
                enableSelectAll: false,
                selectionRowHeaderWidth: 35,
                multiSelect: false,
                columnDefs: [
                    {
                        field: 'file',
                        width: '*',
                        displayName: $translate.instant('label.File')
                    },
                    {
                        field: 'rowsImported',
                        width: 80,
                        displayName: $translate.instant('label.Rows.processed')
                    },
                    {
                        field: 'autoImport',
                        width: 90,
                        displayName: $translate.instant('label.Auto.import'),
                        cellTemplate: `<div class="ui-grid-cell-contents">
                            <i class="fa fa-check" ng-if="row.entity.autoImport" ng-style="{color: '#93BE3D;'}"></i>
                        </div>`

                    },
                    {
                        name: 'active',
                        width: 80,
                        displayName: $translate.instant('label.Active'),
                        cellTemplate: `<div class="ui-grid-cell-contents">
                            <i class="fa fa-check" ng-if="row.entity.active" ng-style="{color: '#93BE3D;'}"></i>
                        </div>`
                    },
                    {
                        name: 'finished',
                        width: 80,
                        displayName: $translate.instant('label.Finished'),
                        cellTemplate: `<div class="ui-grid-cell-contents">
                            <i class="fa fa-check" ng-if="row.entity.finished" ng-style="{color: '#93BE3D;'}"></i>
                        </div>`
                    },
                    {
                        name: 'hasErrors',
                        width: 50,
                        displayName: $translate.instant('label.Error'),
                        cellTemplate: `<div class="ui-grid-cell-contents">
                            <i class="fa fa-warning" ng-if="row.entity.hasErrors" ng-style="{color: 'red'}"></i>
                        </div>`
                    },
                    {
                        field: 'createdOn',
                        width: '150',
                        displayName: $translate.instant('label.CreatedOn'),
                        cellFilter: 'irisTime:grid.appScope'
                    }/*,
                     {
                     name: 'UpdatedOn',
                     width: '150',
                     displayName: $translate.instant('label.UpdatedOn'),
                     cellTemplate: '\
                     <div class="ui-grid-cell-contents">\
                     {{row.entity.updatedOn | irisTime:this}}\
                     </div>'
                     }*/
                ]
            };
        });

    angular.module('iris_gs_sensor_data_import').controller('ModuleSensorDataImportModalCtrl',
        function ($controller, importSettings, agents, $scope, $state, $uibModal, projects, devices, buildings,
                  ImportSettingsService, $translate, $stateParams,
                  IrisTimeService, FileUploader, DataSeriesService, IrisUnitsService, ServerFolderSelectorService) {
            $scope.projects = projects;
            $scope.devices = devices;
            $scope.buildings = buildings;
            $scope.agents = agents;
            $scope.units = IrisUnitsService.getUnitsAsArray();
            $scope.unitsMap = IrisUnitsService.getUnits();
            $scope.state='result';
            //todo move to backend
            $scope.importTypes = ['SEGMENT', 'SENSOR_DATA', 'DPM', 'MQTT'].map(v => { return {id:v, name:v}});
            $scope.types = ['VALUE', 'DATE_TIME'];

            $scope.processDevice = function(init) {
                $scope.import || ($scope.import = importSettings);
                $scope.import.device = $scope.import.device || {};
                $scope.import.device.id = $scope.import.device.id || $stateParams.deviceId;
                var analysisUrl = `${iris.config.apiUrl}/import-settings/devices/${$scope.import.device.id}/settings/meta`;
                var uploadUrl = iris.config.apiUrl + '/import';

                if (init) {
                    angular.extend($scope, $controller('ImportModalBaseCtrl', {
                        $scope,
                        $uibModalInstance: {},
                        analysisUrl,
                        uploadUrl,
                        importSettings: $scope.import || importSettings,
                        fieldsMapping: $scope.fields || [],
                        params: $scope.params || {},
                        ImportSettingsService,
                        $translate,
                        IrisTimeService,
                        FileUploader
                    }));
                } else {
                    $scope.analysisUrl = analysisUrl;
                    $scope.uploadUrl = uploadUrl;
                    $scope.uploader.url = analysisUrl;
                }
            };
            $scope.processDevice(true);

            $scope.import.encoding = $scope.import.encoding || "UTF-8";
            $scope.columns = $scope.import.columns || [];

            $scope.addColumn = function () {
                $scope.columns.push({name: 'new column', type: 'VALUE'});
                $scope.setIndexes();
            };

            $scope.openDSEditorForRow = function (entity) {
                DataSeriesService.openSelectDSListModal({
                    'params': function () {
                        return {
                            project_id: null, //selectedProjectId,
                            device_id: $scope.import.device && $scope.import.device.id,
                            result: entity.dataSeries ? [entity.dataSeries] : []
                        }
                    }
                }).then(function (dataSeries) {
                    entity.dataSeries = dataSeries;
                });
            };

            $scope.deleteColumn = function (column) {
                $scope.columns.splice($scope.columns.indexOf(column), 1);
                $scope.setIndexes();
            };

            $scope.saveImportSetting = function () {
                $scope.import.columns = $scope.columns;
                $scope.setIndexes();
                //console.log($scope.import,$scope.columns,$scope.import.columns.length)
                ImportSettingsService.saveImportSetting($scope.import.device.id, $scope.import).then(() => {
                    $scope.refreshSettings();
                    $state.go("^");
                });
            };
            
            $scope.openSelectFolderModal = function() {
                ServerFolderSelectorService.openSelectFolderModal()
                    .then(folder => $scope.import.sourceFolder = folder.path);
            };

            $scope.setIndexes = function(){
                if($scope.columns){
                    for(var i in $scope.columns){
                        $scope.columns[i].index=i;
                    }
                }
            };

            $scope.refresh=function(){
                $scope.import = $scope.result;
                $scope.columns = $scope.import.columns;
                $scope.setIndexes();
            };

            $scope.startAnalysis = function (item) {
                $scope.columns = [];
                $scope.import.columns = [];
                $scope.import.testData = null;
                item.url = `${$scope.analysisUrl}?setting=${angular.toJson($scope.import)}`;
                item.upload();
            };

            $scope.columnsGridOptions = {
                data: 'columns',
                enablePaginationControls: false,
                paginationPageSize: 10,
                showGridFooter: true,
                columnDefs: [
                    {
                        field: 'name',
                        width: '*',
                        displayName: $translate.instant('label.Name'),
                        cellTemplate: `
                        <div class="ui-grid-cell-contents">
                             <div iris-field
                             inline
                             style="width: 100%;"
                             iris-field-offset="0"
                             iris-field-label=""
                             required="true"
                             type="text"
                             ng-model="row.entity.name"/>
                        </div>`

                    },
                    {
                        field: 'active',
                        width: 50,
                        displayName: $translate.instant('label.Active'),
                        cellTemplate: `
                        <div class="ui-grid-cell-contents">
                         <div iris-field
                             inline
                             iris-field-offset="0"
                             iris-field-label=""
                             type="checkbox"
                             ng-model="row.entity.active">
                         </div>
                        </div>`

                    },
                    {
                        field: 'type',
                        width: 150,
                        displayName: $translate.instant('label.Type'),
                        cellTemplate: `
                        <div class="ui-grid-cell-contents">
                             <div ng-if="row.entity.active"
                             iris-field
                             inline
                             iris-field-offset="0"
                             iris-field-label=""
                             required="true"
                             type="selectize"
                             iris-select-directory="grid.appScope.types"
                             iris-select-value="a as a"
                             iris-select-text="i18nUnitLong"
                             ng-change="grid.appScope.setDateTimeFormat()"
                             ng-model="row.entity.type">
                        </div>`

                    },
                    {
                        field: 'select',
                        displayName: $translate.instant('label.Select'),
                        cellTemplate: `
                        <div class="ui-grid-cell-contents">
                            <div ng-if="row.entity.type=='VALUE' && row.entity.active">
                                <button  class="btn btn-default" ng-click="grid.appScope.openDSEditorForRow(row.entity)" uib-tooltip="{{\'label.Add\' | translate}}">
                                    <i class="fa fa-plus"></i>
                                </button>
                                {{row.entity.dataSeries.name}}
                            </div>
                            <div ng-if="row.entity.type!='VALUE' && row.entity.active"
                                iris-field
                                inline
                                style="width: 100%;"
                                iris-field-offset="0"
                                iris-field-label=""
                                required="true"
                                type="text"
                                ng-model="row.entity.format"/>
                        </div>`,
                        enableSorting: true,
                        width: '**'
                    },
                    {
                        field: 'sourceUnit',
                        displayName: $translate.instant('label.Source'),
                        cellTemplate: `
                        <div class="ui-grid-cell-contents">
                        {{grid.appScope.units[row.entity.dataSeries.irisUnit].possibleConvert}}
                             <div ng-if="row.entity.type=='VALUE' && row.entity.active && row.entity.dataSeries.irisUnit"
                             iris-field
                             inline
                             iris-field-offset="0"
                             iris-field-label=""
                             required="true"
                             type="selectize"
                             iris-select-directory="grid.appScope.unitsMap[row.entity.dataSeries.irisUnit].possibleConvert"
                             iris-select-value="unit"
                             iris-select-text="i18nUnitLong"
                             ng-model="row.entity.sourceUnit">
                        </div>`,
                        enableSorting: true,
                        width: 150
                    },
                    {
                        field: 'dataSeries',
                        displayName: $translate.instant('label.Target'),
                        cellTemplate: `
                        <div class="ui-grid-cell-contents">
                             <div ng-if="row.entity.type=='VALUE' && row.entity.active"
                             iris-field
                             inline
                             ng-disabled="true"
                             iris-field-offset="0"
                             iris-field-label=""
                             type="selectize"
                             iris-select-directory="grid.appScope.units"
                             iris-select-value="unit"
                             iris-select-text="i18nUnitLong"
                             ng-model="row.entity.dataSeries.irisUnit">
                        </div>`,
                        enableSorting: true,
                        width: 150
                    },
                    {
                        name: 'sourceData',
                        displayName: $translate.instant('label.Source'),
                        cellTemplate: `
                        <div class="ui-grid-cell-contents">
                            {{grid.appScope.import.testData[row.entity.index]}}
                        </div>`,
                        enableSorting: true,
                        width: 150
                    },
                    {
                        name: 'actions',
                        displayName: $translate.instant('label.Actions'),
                        width: 60,
                        enableSorting: false,
                        cellTemplate: `
                        <div class="ui-grid-cell-contents">
                            <button class="btn btn-danger" ng-click="grid.appScope.deleteColumn(row.entity)" uib-tooltip="{{'label.Delete' | translate}}">
                                <i class="fa fa-trash-o"></i>
                            </button>
                        </div>`
                    }
                ]
            };
        });
})();
