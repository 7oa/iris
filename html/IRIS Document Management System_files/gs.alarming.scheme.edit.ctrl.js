(function () {
    angular.module('iris_gs_alarming')
        .controller('ModuleSchemeEditCtrl',
            function ($scope, $state, $stateParams, $translate, $timeout, $uibModal, $parse, IrisUtilsService, UserGroups, uiGridConstants, uiGridGroupingConstants, AlarmingService, DevicesService, SensorGroupsService, DataSeriesService, scheme, units, levels, companies, dsTypes, sensorTypes, groups, devices, channels, mainIntervalScanners, ExportService) {

                $scope.availableAlarmTypes = AlarmingService.getAlarmingTypes();

                var getUnitsSelectOptions = function() {
                    var opts = [];
                    angular.forEach(units, (unitObj, unitName) => {
                        opts.push({ value: unitName, label: unitObj.i18nUnitShort });
                    });
                    return opts;
                };

                var getDsTypesSelectOptions = function() {
                    var opts = [];
                    angular.forEach(dsTypes, (type) => {
                        opts.push({ value: type.type, label: type.name });
                    });
                    return opts;
                };

                var getSensorTypesSelectOptions = function() {
                    var opts = [];
                    angular.forEach(sensorTypes, (type) => {
                        opts.push({ value: type.type, label: type.name });
                    });
                    return opts;
                };

                var getAvailableDataserieses = function(loaderPath, callback) {
                    if(!$scope.filter.deviceId) {
                        return;
                    }

                    var deviceId = $scope.filter.deviceId;

                    iris.loader.start(loaderPath);

                    SensorGroupsService.getSensorGroups(deviceId, { 'order-by': angular.toJson([{ name: 'id', value: 'asc' }]), 'only-fields': angular.toJson([ 'id', 'name', 'sensors', 'sensorDataSourceType', 'systemIndexName' ]) }).then(function(response) {
                        $scope.groups = response;

                        DevicesService.getSensorsByDeviceId(deviceId, { 'order-by': angular.toJson([{ name: 'id', value: 'asc' }]), 'only-fields': angular.toJson([ 'id', 'name', 'sensorDataSourceType', 'systemIndexName' ]) }).then(function(response) {
                            $scope.sensors = response;

                            DataSeriesService.getAllByDevice(deviceId, { 'order-by': angular.toJson([{ name: 'deviceSensorId', value: 'asc' }, { name: 'mergedName', value: 'asc' }]), 'only-fields': angular.toJson([ 'id', 'deviceId', 'deviceSensorId', 'mergedName', 'name', 'irisUnit', 'type' ]) }).then(function(response) {
                                $scope.dataserieses = response;

                                refreshSelectedDataserieses();

                                if(angular.isFunction(callback)) {
                                    callback();
                                }

                                iris.loader.stop(loaderPath);
                            }, function(errorResponse) {
                                iris.loader.stop(loaderPath);
                            });
                        }, function(errorResponse) {
                            iris.loader.stop(loaderPath);
                        });
                    }, function(errorResponse) {
                        iris.loader.stop(loaderPath);
                    });
                };

                $scope.refreshAvaillableDataserieses = function() {
                    $scope.availableDataserieses = AlarmingService.getDataseriesesData($scope.groups, $scope.sensors, $scope.dataserieses, scheme.groups, scheme.sensors, scheme.dataSerieses, false);

                    if($scope.filter.rowType) {
                        $scope.availableDataserieses = $scope.availableDataserieses.filter(row => {
                            var f = row.$$type == $scope.filter.rowType;

                            f = f && $scope.filter.rowType != "group" && row.$$hasGroup ? false : f;

                            if(f) {
                                delete row.$$treeLevel;
                            }

                            return f;
                        });
                    }

                    $timeout(() => {
                        $scope.gridAvailableDataseriesesOptions.gridApi.core.handleWindowResize();
                        $scope.gridAvailableDataseriesesOptions.gridApi.core.queueGridRefresh();
                    }, 500);
                };

                var refreshSelectedDataserieses = function() {
                    $scope.selectedDataserieses = AlarmingService.getDataseriesesData($scope.groups, $scope.sensors, $scope.dataserieses, scheme.groups, scheme.sensors, scheme.dataSerieses, true);

                    $timeout(() => {
                        $scope.gridSelectedDataseriesesOptions.gridApi.selection.clearSelectedRows();
                        $scope.gridSelectedDataseriesesOptions.gridApi.core.notifyDataChange(uiGridConstants.dataChange.ROW);

                        $scope.gridSelectedDataseriesesOptions.gridApi.core.handleWindowResize();
                        $scope.gridSelectedDataseriesesOptions.gridApi.core.queueGridRefresh();
                    }, 500);
                };

                var refreshReceivers = function() {
                    $scope.selectedReceivers = AlarmingService.getReceiversData($scope.userGroups, false, scheme.alarmSchemaNotificationSubscriptions, companies);

                    $scope.refreshReceiversGrid();
                };

                var setItem = function(item) {
                    $scope.conditionsFields = AlarmingService.getConditionsFields(item.conditions || []);
                    $scope.conditionsData = AlarmingService.getConditionsData($scope.conditionsFields);

                    scheme = $scope.item = item;

                    $timeout(() => angular.element('[autofocus] input[type="text"]').focus());

                    refreshReceivers();
                };

                $scope.refreshReceiversGrid = function() {
                    $timeout(() => {
                        $scope.gridSelectedReceiversOptions.gridApi.core.handleWindowResize();
                        $scope.gridSelectedReceiversOptions.gridApi.core.queueGridRefresh();
                    });
                };

                $scope.openAvailableDataserieses = function () {
                    $scope.modalInstance = $uibModal.open({
                        templateUrl: iris.config.componentsUrl + '/global-settings/templates/alarming/ms.alarming.dataserieses.html',
                        size: 'lg',
                        scope: $scope
                    });

                    $scope.modalInstance.opened.then(function() {
                        $scope.refreshAvaillableDataserieses();
                    });
                };

                $scope.openReceivers = function () {
                    $scope.modalInstance = $uibModal.open({
                        templateUrl: iris.config.componentsUrl + '/global-settings/templates/alarming/ms.alarming.receivers.edit.html',
                        size: 'lg',
                        scope: $scope
                    });

                    $scope.modalInstance.opened.then(function() {
                        $scope.refreshAllReceivers();
                    });
                };

                $scope.openRemoveDialogForDataserieses = function() {
                    alertify.confirm($translate.instant('message.DeleteItemConfirm'), function (e) {
                        if (e) {
                            var rows = $scope.gridSelectedDataseriesesOptions.gridApi.selection.getSelectedRows();

                            $scope.removeSelectedDataserieses(rows);
                        }
                    });
                };

                $scope.removeReceivers = function() {
                    alertify.confirm($translate.instant('message.DeleteItemConfirm'), function (e) {
                        if (e) {
                            var rows = $scope.gridSelectedReceiversOptions.gridApi.selection.getSelectedRows(),
                                groupsIds = rows.map(row => row.groupId);

                            scheme.alarmSchemaNotificationSubscriptions = scheme.alarmSchemaNotificationSubscriptions.filter(ns => {
                                return groupsIds.indexOf(ns.userGroups.id) == -1;
                            });

                            $scope.gridSelectedReceiversOptions.gridApi.selection.clearSelectedRows();

                            refreshReceivers();
                        }
                    });
                };

                $scope.removeSelectedDataserieses = function(entities) {
                    entities = angular.isArray(entities) ? entities : [entities];

                    angular.forEach(entities, entity => {
                        switch(entity.$$type) {
                            case 'group':
                                scheme.groups = scheme.groups.filter(group => group.id != entity.id);

                                var sensors = [];

                                $scope.groups.some((group) => {
                                    if(group.id == entity.id) {
                                        if(group.sensors && group.sensors.length) {
                                            sensors = group.sensors.map(sensor => sensor.id);
                                        }

                                        return true;
                                    }

                                    return false;
                                });

                                scheme.sensors = scheme.sensors.filter(sensor => {
                                    if(angular.isArray(sensor.$$groupsIds) && sensor.$$groupsIds.indexOf(entity.id) > -1) {
                                        if(sensors.indexOf(sensor.id) == -1) {
                                            sensors.push(sensor.id);
                                        }

                                        return false;
                                    }

                                    return true;
                                });

                                scheme.dataSerieses = scheme.dataSerieses.filter(dataseries => sensors.indexOf(dataseries.deviceSensorId) == -1);
                                break;

                            case 'sensor':
                                scheme.sensors = scheme.sensors.filter(sensor => sensor.id != entity.id);
                                scheme.dataSerieses = scheme.dataSerieses.filter(dataseries => entity.id != dataseries.deviceSensorId);
                                break;

                            case 'dataseries':
                                scheme.dataSerieses = scheme.dataSerieses.filter(dataseries => entity.id != dataseries.id);
                                break;
                        }
                    });

                    refreshSelectedDataserieses();
                };

                $scope.addToList = function() {
                    var schemeGroupsMap = {},
                        schemeSensorsMap = {},
                        schemeDataseriesMap = {},
                        selectedRows = $scope.gridAvailableDataseriesesOptions.gridApi.selection.getSelectedRows();

                    angular.forEach(selectedRows, entity => {
                        switch(entity.$$type) {
                            case 'group':
                                if(!schemeGroupsMap[entity.id]) {
                                    scheme.groups.push(entity);
                                    schemeGroupsMap[entity.id] = entity;
                                }
                                break;

                            case 'sensor':
                                if(!schemeSensorsMap[entity.id]) {
                                    scheme.sensors.push(entity);
                                    schemeSensorsMap[entity.id] = entity;
                                }
                                break;

                            case 'dataseries':
                                if(!schemeDataseriesMap[entity.id]) {
                                    scheme.dataSerieses.push(entity);
                                    schemeDataseriesMap[entity.id] = entity;
                                }
                                break;
                        }
                    });

                    $scope.modalInstance.close();

                    refreshSelectedDataserieses();

                    scheme.groups = [];
                    scheme.sensors = [];
                    scheme.dataSerieses = [];

                    angular.forEach($scope.selectedDataserieses, selectedDs => {
                        switch(selectedDs.$$type) {
                            case 'group':
                                scheme.groups.push(selectedDs);
                                break;

                            case 'sensor':
                                scheme.sensors.push(selectedDs);
                                break;

                            case 'dataseries':
                                scheme.dataSerieses.push(selectedDs);
                                break;
                        }
                    });
                };

                $scope.saveItem = function () {
                    var loaderPath = '.app-content';
                    iris.loader.start(loaderPath);

                    AlarmingService.saveScheme(scheme, $scope.conditionsFields, $scope.conditionsData).then(response => {
                        // TODO It need to load correct scheme, because API return incorrect scheme after update
                        AlarmingService.getScheme($stateParams.deviceId, response.id).then(response => {
                            iris.loader.stop(loaderPath);

                            alertify.success($translate.instant('label.Alarming.AlarmingSchemeSaved'));

                            setItem(response);
                            $state.go('module.scheme', { deviceId: $stateParams.deviceId, schemeId: response.id }, { notify: false });

                            refreshSelectedDataserieses();
                        });
                    }, function() {
                        iris.loader.stop(loaderPath);
                    });
                };

                $scope.saveReceivers = function() {
                    scheme.alarmSchemaNotificationSubscriptions = AlarmingService.getReceiversForSave($scope.allReceivers);

                    refreshReceivers();

                    $scope.modalInstance.close();

                    /*if(scheme.id) {
                        $scope.saveItem();
                    }*/
                };

                $scope.refreshAllReceivers = function(row) {
                    if(row) {
                        row.entity.$$selected = AlarmingService.setSelectedReceiver(row.entity.channels);

                        $scope.gridAllReceiversOptions.gridApi.core.notifyDataChange(uiGridConstants.dataChange.EDIT);

                        $timeout(() => {
                            if(row.entity.$$selected) {
                                $scope.gridAllReceiversOptions.gridApi.selection.selectRow(row.entity);
                            } else {
                                $scope.gridAllReceiversOptions.gridApi.selection.unSelectRow(row.entity);
                            }
                        });
                    } else {
                        $scope.allReceivers = AlarmingService.getReceiversData($scope.userGroups, true, scheme.alarmSchemaNotificationSubscriptions, companies);

                        $timeout(() => {
                            $scope.gridAllReceiversOptions.gridApi.core.notifyDataChange(uiGridConstants.dataChange.EDIT);

                            $scope.gridAllReceiversOptions.gridApi.selection.selectAllRows();
                        }, $scope.gridAllReceiversOptions.gridApi ? 0 : 500);
                    }
                };

                $scope.back = function() {
                    $state.go('module.alarming.schemes', $stateParams);
                };

                $scope.eval = function(expr) {
                    if(angular.isString(expr)){
                        return $scope.$eval(expr);
                    }
                };

                $scope.hasMainIntervalScanners = !!mainIntervalScanners.length;

                $scope.rowTypes = [
                    { id: 'group', value: 'group', label: $translate.instant('label.Alarming.Group'), name: $translate.instant('label.Alarming.Group') },
                    { id: 'sensor', value: 'sensor', label: $translate.instant('label.Alarming.Sensor'), name: $translate.instant('label.Alarming.Sensor') },
                    { id: 'dataseries', value: 'dataseries', label: $translate.instant('label.Alarming.Dataseries'), name: $translate.instant('label.Alarming.Dataseries') }
                ];

                $scope.channels = channels;
                $scope.levels = levels;
                $scope.userGroups = groups;
                $scope.devices = devices;

                $scope.filter = {
                    deviceId: $stateParams.deviceId
                };

                $scope.availableDataserieses = [];
                $scope.gridAvailableDataseriesesOptions = {
                    data: 'availableDataserieses',
                    enableFiltering: true,
                    enableGroupHeaderSelection: true,
                    enableSelectAll: true,
                    multiSelect: true,
                    treeRowHeaderAlwaysVisible: false,
                    enableFooterTotalSelected: true,
                    virtualizationThreshold: 100,
                    columnDefs: [
                        {
                            field: 'id',
                            displayName: 'ID',
                            enableSorting: true,
                            width: 50
                        },
                        {
                            field: 'name',
                            width: '*',
                            displayName: $translate.instant('label.Name'),
                            cellTemplate: `<div class="ui-grid-cell-contents" title="TOOLTIP">{{ row.entity.name + (row.treeNode.children.length ? ' (' + row.treeNode.children.length + ')' : '') }}</div>`
                        },
                        {
                            field: '$$type',
                            width: 100,
                            enableSorting: false,
                            enableFiltering: false,
                            filter: {
                                type: uiGridConstants.filter.SELECT,
                                selectOptions: $scope.rowTypes
                            },
                            displayName: $translate.instant('label.Alarming.RowType')
                        },
                        {
                            field: 'sensorDataSourceType',
                            width: 130,
                            displayName: $translate.instant('label.SensorType'),
                            enableSorting: false,
                            filter: {
                                type: uiGridConstants.filter.SELECT,
                                selectOptions: getSensorTypesSelectOptions()
                            }
                        },
                        {
                            field: 'type',
                            width: 130,
                            displayName: $translate.instant('label.DataSeriesType'),
                            enableSorting: false,
                            filter: {
                                type: uiGridConstants.filter.SELECT,
                                selectOptions: getDsTypesSelectOptions()
                            }
                        },
                        {
                            field: 'irisUnit',
                            width: 110,
                            displayName: $translate.instant('label.Unit'),
                            enableSorting: false,
                            filter: {
                                type: uiGridConstants.filter.SELECT,
                                selectOptions: getUnitsSelectOptions()
                            },
                            cellFilter: 'irisUnits'
                        }
                    ],

                    onRegisterApi: function(gridApi) {
                        $scope.gridAvailableDataseriesesOptions.gridApi = gridApi;
                    }
                };

                $scope.selectedDataserieses = [];
                $scope.selectedDataseriesesCount = 0;
                $scope.gridSelectedDataseriesesOptions = angular.copy($scope.gridAvailableDataseriesesOptions);
                $scope.gridSelectedDataseriesesOptions.data = 'selectedDataserieses';
                $scope.gridSelectedDataseriesesOptions.enableFullRowSelection = true;
                $scope.gridSelectedDataseriesesOptions.columnDefs.push({
                    name: 'actions',
                    displayName: $translate.instant('label.Actions'),
                    width: 60,
                    enableSorting: false,
                    enableFiltering: false,
                    cellTemplate: `<div class="ui-grid-cell-contents actions">
                            <button class="btn btn-link"
                                    uib-tooltip="{{'label.Remove' | translate}}"
                                    ng-click="grid.appScope.removeSelectedDataserieses(row.entity); $event.stopPropagation();">
                                <i class="fa fa-trash-o"></i>
                            </button>
                        </div>`
                });
                $scope.gridSelectedDataseriesesOptions.onRegisterApi = function(gridApi) {
                    $scope.gridSelectedDataseriesesOptions.gridApi = gridApi;

                    gridApi.selection.on.rowSelectionChanged($scope, function (row) {
                        $scope.selectedDataseriesesCount = gridApi.grid.selection.selectedCount;
                    });

                    gridApi.selection.on.rowSelectionChangedBatch($scope, function (rows) {
                        $scope.selectedDataseriesesCount = gridApi.grid.selection.selectedCount;
                    });
                };
                $scope.gridSelectedDataseriesesOptions.columnDefs[2].enableFiltering = true;

                $scope.selectedReceivers = [];
                $scope.selectedReceiversCount = 0;
                $scope.gridSelectedReceiversOptions = AlarmingService.getGridSelectedReceiversOptions($scope, 'gridSelectedReceiversOptions', 'selectedReceivers', 'selectedReceiversCount');

                $scope.allReceivers = [];
                $scope.allReceiversCount = 0;
                $scope.gridAllReceiversOptions = AlarmingService.getGridAllReceiversOptions($scope, 'gridAllReceiversOptions', 'allReceivers', 'allReceiversCount');

                setItem(scheme);

                getAvailableDataserieses('.app-content', () => {
                    $timeout(() => {
                        if($scope.gridSelectedDataseriesesOptions.gridApi) {
                            $scope.gridSelectedDataseriesesOptions.gridApi.core.handleWindowResize();
                            $scope.gridSelectedDataseriesesOptions.gridApi.core.queueGridRefresh();
                        }
                    });
                });
            });
})();