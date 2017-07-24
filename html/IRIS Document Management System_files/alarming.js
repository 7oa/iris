(function() {
    irisAppDependencies.add('iris_alarming');


    var module = angular.module('iris_alarming', []);

    module
        .factory('AlarmingLevels', function ($resource) {
            return $resource(iris.config.apiUrl + "/alarming/devices/:deviceId/alarm-levels/:id", {
                id: '@id',
                deviceId: '@deviceId'
            });
        })
        .factory('AlarmingSchemes', function ($resource) {
            return $resource(iris.config.apiUrl + "/alarming/devices/:deviceId/alarm-schemas/:id", {
                id: '@id',
                deviceId: '@deviceId'
            });
        })
        .factory('AlarmingLimits', function ($resource) {
            return $resource(iris.config.apiUrl + "/alarming/alarm-limits/:limitId", {
                limitId: '@limitId'
            });
        })
        .factory('AlarmingEvents', function ($resource) {
            return $resource(iris.config.apiUrl + "/alarming/alarms/:id/events", {
                id: '@id'
            });
        })
        .factory('TimeoutAlarmLimits', function ($resource) {
            return $resource(iris.config.apiUrl + "/alarming/timeout-alarm-limits");
        })
        .factory('AlarmingHistory', function ($resource) {
            return $resource(iris.config.apiUrl + "/alarming/devices/:deviceId/alarms/history/:action", {
                deviceId: '@deviceId',
                sensorGroup: '@sensorGroupId',
                sensorType: '@sensorType',
                dataSeriesType: '@dataSeriesType',
                unit: '@unit',
                alarmLevel: '@alarmLevel'
            },
            {
                getCount: {
                    method: "GET",
                    params: { action: 'count' },
                    isArray: false
                }
            });
        })
        .factory('TimeoutAlarmingLimits', function($resource) {
            return $resource(iris.config.apiUrl + "/alarming/timeout-alarm-limits/:operation/:limitId", {
                operation: '@operation',
                limitId: '@limitId'
            }, {
                deactivate: {
                    method: 'DELETE',
                    params: { operation: 'deactivate' },
                    isArray: false
                }
            });
        })
        .factory('AlarmingService', function (AlarmingLevels, AlarmingSchemes, AlarmingEvents, AlarmingLimits, AlarmingHistory, $translate, $uibModal, uiGridConstants, TimeoutAlarmLimits) {
            return {
                getHistory: (deviceId, params) => {
                    params = params || {};

                    params.deviceId = deviceId;

                    return AlarmingHistory.query(params).$promise;
                },
                getHistoryCountItems: (params) => {
                    return AlarmingHistory.getCount(params).$promise;
                },
                getLevel: (deviceId, id) => AlarmingLevels.get({deviceId, id}).$promise,
                getLevels: (deviceId, params) => {
                    params = params || {};

                    params.deviceId = deviceId;
                    params['order-by'] = params['order-by'] || angular.toJson([ { name: 'name', value: 'asc' } ]);

                    return AlarmingLevels.query(params).$promise;
                },
                createLevel: params => new AlarmingLevels(params),
                saveLevel: (deviceId, id, data) => _save(AlarmingLevels, deviceId, id, data),
                removeLevel: (deviceId, id) => _remove(AlarmingLevels, deviceId, id),

                getChannels: function() {
                    return ['EMAIL', 'POPUP', 'SMS'];
                },

                getAlarmingTypes() {
                    return [{alias: "MEASUREMENTS", name: $translate.instant('label.AlarmSchemaType.MEASUREMENTS')},
                        {alias: "TIMEOUTS", name: $translate.instant('label.AlarmSchemaType.TIMEOUTS')}];
                },

                getAlarmingEvents(id) {
                    return AlarmingEvents.query({id}).$promise
                },

                getConditionsData: _getConditionsData,
                getConditionsFields: _getConditionsFields,
                getConditionsForSave: _getConditionsForSave,

                getReceiversData: _getReceiversData,
                getReceiversForSave: _getReceiversForSave,
                getDataseriesesData: _getDataseriesesData,
                setSelectedReceiver: _setSelectedReceiver,

                getGridSelectedReceiversOptions: _getGridSelectedReceiversOptions,
                getGridAllReceiversOptions: _getGridAllReceiversOptions,

                getAlarmingHistoryExportUrl: (filter) => {
                    return iris.config.apiUrl + `/alarming/devices/${filter.deviceId}/alarms/export` +
                        `?format=XLS` +
                        `&filter=` + angular.toJson(filter.filter) +
                        (angular.isArray(filter.order) ? `&order-by=` + angular.toJson(filter.order) : ``);
                },

                getScheme: (deviceId, id) => {
                    var params = {
                        deviceId,
                        id,
                        'exclude-fields': angular.toJson(_getExcludeFieldsForScheme())
                    };

                    return AlarmingSchemes.get(params).$promise;
                },
                getSchemes: (deviceId, params) => {
                    params = params || {};

                    params.deviceId = deviceId;

                    params['exclude-fields'] = params['exclude-fields'] || angular.toJson(_getExcludeFieldsForScheme());

                    return AlarmingSchemes.query(params).$promise
                },
                createScheme: params => new AlarmingSchemes(params),
                saveScheme: (data, conditionsFields, conditionsData) => {
                    data.conditions = _getConditionsForSave(conditionsFields, conditionsData);

                    if(data.active === 1 || data.active === "1") {
                        data.active = true;
                    }
                    return _save(AlarmingSchemes, data.device.id, data.id, data);
                },
                removeScheme: (deviceId, id) => _remove(AlarmingSchemes, deviceId, id),
                createLimit: params => new AlarmingLimits(params),
                removeLimit: (limit) => {
                    return AlarmingLimits.remove({limitId: limit.id}).$promise;
                },
                saveLimit: (limit, dataSeries) => {
                    limit.dataSeriesId = dataSeries.id;
                    return AlarmingLimits.save({limitId: limit.id}, limit).$promise;
                },
                saveTimeoutLimit: (limit, dataSeries) => {
                    limit.dataSeriesId = dataSeries.id;
                    return TimeoutAlarmLimits.save(limit).$promise;
                },
                getLimitsForDs: (arrayOfDataSeriesIds) => {
                    var params = {
                        'exclude-fields': angular.toJson([
                            'createdBy', 'createdOn', 'updatedBy', 'updatedOn', 'validTill'
                        ]), 'ds-ids': angular.toJson(arrayOfDataSeriesIds)
                    };

                    return AlarmingLimits.query(params).$promise;
                },
                getTimeoutAlarmLimits(dsIds) {
                    return TimeoutAlarmLimits.query({'ds-ids': angular.toJson(dsIds)}).$promise
                },
                openSetAlarmLimitsModal: function (dataseries) {
                    return $uibModal.open({
                        templateUrl: iris.config.componentsUrl + '/alarming/templates/edit.alarmlimits.modal.html',
                        resolve: {
                            'params': function () {
                                return {
                                    dataseries: dataseries,
                                    deviceId: dataseries.deviceSensor.deviceId
                                }
                            }
                        },
                        controller: 'AlarmLimitsController'
                    }).result
                }
            };

            function _getExcludeFieldsForScheme() {
                return [
                    'deviceSensor', 'createdBy', 'createdOn', 'updatedBy', 'updatedOn', 'validTill',
                    'address', 'dataType', 'digits', 'importIndexName', 'systemIndexName', 'threshold',
                    'deviceType', 'machineId', 'settings',
                    'isSystem', 'sensorDataSourceType', 'sensorState', 'sourceId'
                ];
            }

            function _getGridAllReceiversOptions($scope, gridName, dataName, counterName) {
                return {
                    data: dataName,
                    multiSelect: true,
                    enableFiltering: true,
                    enableGroupHeaderSelection: true,
                    enableSelectAll: false,
                    enableFooterTotalSelected: true,
                    enableRowSelection: true,
                    virtualizationThreshold: 100,
                    rowHeight: 116,
                    isRowSelectable: row => {
                        return row.entity.$$selected ? true : false;
                    },
                    columnDefs: [
                        {
                            field: 'name',
                            displayName: $translate.instant('label.Name'),
                            enableSorting: true
                        },
                        {
                            field: 'company',
                            displayName: $translate.instant('label.Company'),
                            enableSorting: true
                        },
                        {
                            field: 'channels',
                            displayName: $translate.instant('label.Channels'),
                            width: 280,
                            enableSorting: false,
                            enableFiltering: false,
                            cellTemplate:
                                `<div class="ui-grid-cell-contents">
                                    <div class="form-horizontal" ng-if="grid.appScope.item.alarmSchemaType == 'MEASUREMENTS'" style="width: 100%">
                                        <div iris-field
                                            style="margin-bottom: 3px;"
                                             ng-repeat="channel in grid.appScope.channels"
                                             iris-field-label="{{ channel }}"
                                             type="selectize"
                                             iris-select-directory="grid.appScope.levels"
                                             iris-select-null="label.NotSet"
                                             ng-change="grid.appScope.refreshAllReceivers(row)"
                                             ng-model="row.entity.channels[channel].alarmLevel.id"></div>
                                    </div>
                                    <form ng-if="grid.appScope.item.alarmSchemaType == 'TIMEOUTS'" class="form-inline">
                                        <div ng-if="grid.appScope.item.alarmSchemaType == 'TIMEOUTS'" ng-repeat="channel in grid.appScope.channels">
                                            <div class="checkbox">
                                                <label>
                                                    <input type="checkbox" ng-click="grid.appScope.refreshAllReceivers(row, channel)" ng-model="row.entity.channels[channel]" ng-checked="row.entity.channels[channel] !== undefined && row.entity.channels[channel] !== false" style="width:20px;"> <span style="margin-left:5px;position:relative;top:5px;">{{channel}}</span>
                                                </label>
                                            </div>
                                        </div>     
                                    </form>
                                </div>`
                        }
                    ],
                    onRegisterApi: function(gridApi) {
                        $scope[gridName].gridApi = gridApi;

                        gridApi.selection.on.rowSelectionChanged($scope, function (row) {
                            $scope[counterName] = gridApi.grid.selection.selectedCount;

                            if(!row.isSelected) {
                                row.entity.channels = {};
                                $scope.refreshAllReceivers(row)
                            }
                        });
                    }
                };
            }

            function _getGridSelectedReceiversOptions($scope, gridName, dataName, counterName) {
                return {
                    data: dataName,
                    enableFiltering: true,
                    enableGroupHeaderSelection: true,
                    enableSelectAll: true,
                    multiSelect: true,
                    enableFullRowSelection: true,
                    enableFooterTotalSelected: true,
                    virtualizationThreshold: 100,
                    rowHeight: 56,
                    columnDefs: [
                        {
                            field: 'name',
                            displayName: $translate.instant('label.Name'),
                            enableSorting: true
                        },
                        {
                            field: 'company',
                            displayName: $translate.instant('label.Company'),
                            enableSorting: true
                        },
                        {
                            field: 'channels',
                            displayName: $translate.instant('label.Channels'),
                            enableSorting: false,
                            enableFiltering: false,
                            cellTemplate:
                                `<div class="ui-grid-cell-contents">
                                    <ul class="list-unstyled" style="margin-bottom: 0;">
                                        <li ng-repeat="channel in grid.appScope.channels" ng-if="row.entity.channels[channel]" ng-init="data = {}; data.title = row.entity.channels[channel].alarmLevel.name ? row.entity.channels[channel].alarmLevel.name : (row.entity.channels[channel].alarmLevel.id | IrisFilterField:[grid.appScope.levels,'name'])" uib-tooltip="{{ channel }}: {{ data.title }}" tooltip-placement="left">{{ channel }} {{ data.title ? ': ' + data.title : '' }}</li>
                                    </ul>
                                </div>`
                        }
                    ],
                    onRegisterApi: function(gridApi) {
                        $scope[gridName].gridApi = gridApi;

                        gridApi.selection.on.rowSelectionChanged($scope, function (row) {
                            $scope[counterName] = gridApi.grid.selection.selectedCount;
                        });

                        gridApi.selection.on.rowSelectionChangedBatch($scope, function (rows) {
                            $scope[counterName] = gridApi.grid.selection.selectedCount;
                        });
                    }
                };
            }

            function _setDataseriesesFromSensorTo (sensor, data, hasGroup) {
                if(sensor.$$dataserieses) {
                    angular.forEach(sensor.$$dataserieses, dataserie => {
                        data.push({
                            id: dataserie.id,
                            name: dataserie.mergedName,
                            mergedName: dataserie.mergedName,
                            sensorDataSourceType: sensor.sensorDataSourceType,
                            deviceSensorId: dataserie.deviceSensorId,
                            irisUnit: dataserie.irisUnit,
                            type: dataserie.type,
                            $$groupsIds: sensor.$$groupsIds,
                            $$type: 'dataseries',
                            $$hasGroup: hasGroup
                        });
                    });
                }
            };

            function _getDataseriesesData (srcGroups, srcSensors, srcDataseries, schemeGroups, schemeSensors, schemeDataseries, include) {
                var groups = angular.copy(srcGroups),
                    sensors = angular.copy(srcSensors),
                    schemeDataseriesMap = {},
                    schemeGroupsMap = {},
                    schemeSensorsMap = {},
                    groupsMap = {},
                    sensorsMap = {},
                    sensorsIds = [],
                    groupsIds = [];

                if(angular.isArray(schemeGroups)) {
                    angular.forEach(schemeGroups, item => {
                        schemeGroupsMap[item.id] = item;
                    });
                }

                if(angular.isArray(schemeSensors)) {
                    angular.forEach(schemeSensors, item => {
                        schemeSensorsMap[item.id] = item;
                    });
                }

                if(angular.isArray(schemeDataseries)) {
                    angular.forEach(schemeDataseries, item => {
                        schemeDataseriesMap[item.id] = item;

                        if(include && !schemeSensorsMap[item.deviceSensorId]) {
                            schemeSensorsMap[item.deviceSensorId] = null;
                        }
                    });
                }

                angular.forEach(groups, function(group) {
                    var skip = (!include && schemeGroupsMap[group.id]) || (include && !schemeGroupsMap[group.id]);

                    angular.forEach(group.sensors, (sensorInGroup, i) => {
                        var sensor = group.sensors[i] = sensorsMap[sensorInGroup.id] = sensorsMap[sensorInGroup.id] || sensorInGroup;

                        if(skip) {
                            if(!include && !schemeSensorsMap[sensor.id]) {
                                schemeSensorsMap[sensor.id] = sensor;
                            }
                        } else {
                            if(include && angular.isDefined(schemeSensorsMap[sensor.id])) {
                                delete schemeSensorsMap[sensor.id];
                            }
                        }

                        if(include && schemeSensorsMap[sensor.id] === null) {
                            sensor.$$hide = true;
                            schemeSensorsMap[sensor.id] = sensor;
                        }

                        sensor.$$groupsIds = sensor.$$groupsIds || [];
                        sensor.$$groupsIds.push(group.id);
                    });

                    groupsMap[group.id] = group;

                    if(skip) {
                        return;
                    }

                    groupsIds.push(group.id);
                });

                angular.forEach(sensors, function(sensor) {
                    var skip = (!include && schemeSensorsMap[sensor.id]) || (include && angular.isUndefined(schemeSensorsMap[sensor.id]));

                    if(skip) {
                        return;
                    }

                    sensor = sensorsMap[sensor.id] = sensorsMap[sensor.id] || sensor;

                    if(include && schemeSensorsMap[sensor.id] === null) {
                        sensor.$$hide = true;
                        schemeSensorsMap[sensor.id] = sensor;
                    }

                    sensorsIds.push(sensor.id);
                });

                var data = [],
                    ds = !include ? srcDataseries : schemeDataseries;

                angular.forEach(ds, function(dataseries) {
                    var skip = (!include && (schemeDataseriesMap[dataseries.id] || schemeSensorsMap[dataseries.deviceSensorId]))
                        || (include && (!schemeDataseriesMap[dataseries.id] || (schemeDataseriesMap[dataseries.id] && (schemeSensorsMap[dataseries.deviceSensorId] && !schemeSensorsMap[dataseries.deviceSensorId].$$hide))));

                    if(skip) {
                        return;
                    }

                    var sensor = sensorsMap[dataseries.deviceSensorId];
                    if(sensor) {
                        sensor.$$dataserieses = sensor.$$dataserieses || [];

                        sensor.$$dataserieses.push(dataseries);
                    }
                });

                angular.forEach(groupsIds, groupId => {
                    var group = groupsMap[groupId];

                    data.push({
                        id: group.id,
                        name: group.name,
                        $$type: 'group',
                        $$treeLevel: include ? undefined : 0
                    });

                    if(group.sensors) {
                        angular.forEach(group.sensors, sensor => {
                            if((!include && !schemeSensorsMap[sensor.id]) || (include && schemeSensorsMap[sensor.id])) {
                                data.push({
                                    id: sensor.id,
                                    name: sensor.name,
                                    sensorDataSourceType: sensor.sensorDataSourceType,
                                    systemIndexName: sensor.systemIndexName,
                                    $$type: 'sensor',
                                    $$treeLevel: include ? undefined : 1,
                                    $$groupsIds: sensor.$$groupsIds,
                                    $$hasGroup: true
                                });

                                _setDataseriesesFromSensorTo(sensor, data, true);
                            }
                        });
                    }
                });

                angular.forEach(sensorsIds, sensorId => {
                    var sensor = sensorsMap[sensorId];

                    if(!sensor.$$hide) {
                        data.push({
                            id: sensor.id,
                            name: sensor.name,
                            sensorDataSourceType: sensor.sensorDataSourceType,
                            systemIndexName: sensor.systemIndexName,
                            $$type: 'sensor',
                            $$treeLevel: include ? undefined : 0
                        });
                    }

                    _setDataseriesesFromSensorTo(sensor, data);
                });

                return data;
            }

            function _getReceiversForSave(allReceivers) {
                var notificationSchemes = [];

                angular.forEach(allReceivers, receiver => {
                    var channels = receiver.channels;

                    angular.forEach(channels, (notificationScheme, channel) => {

                        if (typeof(notificationScheme) === 'boolean') {
                            if (!notificationScheme) {
                                return
                            }
                            notificationScheme = { channel: channel }
                        }

                        if(!notificationScheme.channel) {
                            notificationScheme.channel = channel;
                        }

                        if(!notificationScheme.userGroup || !notificationScheme.userGroup.id) {
                            notificationScheme.userGroup = notificationScheme.userGroup || {};
                            notificationScheme.userGroup.id = receiver.groupId;
                        }

                        notificationSchemes.push(notificationScheme);
                    });
                });

                return notificationSchemes;
            }

            function _setSelectedReceiver (selectedNotificationSchemes) {
                var channelsTotal = 0,
                    channelsWithoutLevel = 0;

                angular.forEach(selectedNotificationSchemes, (notificationScheme, channelName) => {
                    channelsTotal++;
                    if(notificationScheme.alarmLevel && !notificationScheme.alarmLevel.id) {
                        delete selectedNotificationSchemes[channelName];
                        channelsWithoutLevel++;
                    }
                });

                return channelsTotal > 0 && channelsTotal > channelsWithoutLevel;
            }

            function _getReceiversData (groups, showAllGroups, srcNotificationSchemes, companies) {
                var receivers = [],
                    notificationSchemesMapByGroup = {},
                    companiesMap = {},
                    notificationSchemes = angular.copy(srcNotificationSchemes);

                angular.forEach(companies, company => {
                    companiesMap[company.id] = company.name;
                });

                angular.forEach(notificationSchemes, notificationScheme => {
                    var userGroupId = notificationScheme.userGroup.id,
                        schemesByChannel = notificationSchemesMapByGroup[userGroupId] = notificationSchemesMapByGroup[userGroupId] || {};

                    schemesByChannel[notificationScheme.channel] = notificationScheme;
                });

                angular.forEach(groups, group => {
                    var selectedNotificationSchemes = notificationSchemesMapByGroup[group.id],
                        receiver = {
                            groupId: group.id,
                            name: group.name,
                            company: companiesMap[group.companyId],
                            channels: selectedNotificationSchemes || {}
                        };

                    if(showAllGroups || selectedNotificationSchemes) {
                        if(showAllGroups && selectedNotificationSchemes) {
                            receiver.$$selected = _setSelectedReceiver(selectedNotificationSchemes);
                        }

                        receivers.push(receiver);
                    }
                });

                return receivers;
            }

            function _save (resource, deviceId, id, data) {
                var params = angular.isObject(deviceId) ? deviceId: { deviceId, id };
                data = angular.isObject(deviceId) ? deviceId : data;

                return resource.save(params, data).$promise;
            }

            function _remove (resource, deviceId, id) {
                var params = angular.isObject(deviceId) ? deviceId: { deviceId, id };

                return resource.remove(params).$promise;
            }

            function _getConditionsForSave (conditionsFields, conditionsData) {
                var conditions = [],
                    classNamesIndexes = {},
                    groupsProperties = {};

                angular.forEach(conditionsFields, field => {
                    var className = field['@class'],
                        modelValue = conditionsData[className][field.modelName],
                        index = classNamesIndexes[className],
                        condition;

                    if(field.virtual) {
                        groupsProperties[className] = { show: modelValue };
                        return;
                    }

                    if((groupsProperties[className] && !groupsProperties[className].show) || angular.isUndefined(modelValue)) {
                        return;
                    }

                    if(angular.isUndefined(index)) {
                        classNamesIndexes[className] = conditions.length;
                        condition = { '@class': className };
                    } else {
                        condition = conditions[index];
                    }

                    condition[field.modelName] = modelValue;

                    conditions.push(condition);
                });

                return conditions;
            }

            function _getConditionsData (conditionsFields) {
                var conditionsData = {};

                angular.forEach(conditionsFields, field => {
                    var conditionData = conditionsData[field['@class']] = conditionsData[field['@class']] || {};

                    conditionData[field.modelName] = field.value;
                });

                return conditionsData;
            }

            function _getConditionsFields (srcConditionsArray) {
                var conditions = [
                        {
                            '@class': "com.itc.iris.alarming.entities.conditions.AlarmSilentCondition",
                            modelName: "silentTimeSec",
                            type: "number",
                            label: 'label.Alarming.AlarmPauseInterval'
                        },
                        {
                            '@class': "com.itc.iris.alarming.entities.conditions.AlarmPhaseCondition",
                            modelName: "phases",
                            directory: ['ADV', 'RING_BUILD', 'STOP'],
                            multiple: true,
                            type: "selectize",
                            label: 'label.Alarming.TBMStatusRestriction',
                            if: 'hasMainIntervalScanners'
                        },
                        {
                            '@class': "com.itc.iris.alarming.entities.conditions.AlarmPhaseStartSilentCondition",
                            modelName: "silentTimeSec",
                            type: "number",
                            label: 'label.Alarming.NeglectData',
                            if: 'hasMainIntervalScanners'
                        },
                        {
                            '@class': "com.itc.iris.alarming.entities.conditions.AlarmSilentConditionRange",
                            modelName: "useRange",
                            virtual: true,
                            valueTrueIfExist: "com.itc.iris.alarming.entities.conditions.AlarmSilentConditionRange",
                            type: "checkbox",
                            label: 'label.Alarming.PeriodOfValidity'
                        },
                        {
                            '@class': "com.itc.iris.alarming.entities.conditions.AlarmSilentConditionRange",
                            modelName: "rangeType",
                            type: "selectize",
                            directory: ['DATE', 'ADVANCE', 'CHAINAGE', 'TUNNELMETER'],
                            value: 'DATE',
                            label: 'label.Type',
                            if: `conditionsData['com.itc.iris.alarming.entities.conditions.AlarmSilentConditionRange'].useRange`
                        },
                        {
                            '@class': "com.itc.iris.alarming.entities.conditions.AlarmSilentConditionRange",
                            modelName: "startDate",
                            type: "date",
                            label: 'label.StartDate',
                            if: `conditionsData['com.itc.iris.alarming.entities.conditions.AlarmSilentConditionRange'].useRange && conditionsData['com.itc.iris.alarming.entities.conditions.AlarmSilentConditionRange'].rangeType == 'DATE'`
                        },
                        {
                            '@class': "com.itc.iris.alarming.entities.conditions.AlarmSilentConditionRange",
                            modelName: "endDate",
                            type: "date",
                            label: 'label.EndDate',
                            if: `conditionsData['com.itc.iris.alarming.entities.conditions.AlarmSilentConditionRange'].useRange && conditionsData['com.itc.iris.alarming.entities.conditions.AlarmSilentConditionRange'].rangeType == 'DATE'`
                        },
                        {
                            '@class': "com.itc.iris.alarming.entities.conditions.AlarmSilentConditionRange",
                            modelName: "valueStart",
                            type: "text",
                            label: 'label.Start',
                            if: `conditionsData['com.itc.iris.alarming.entities.conditions.AlarmSilentConditionRange'].useRange && conditionsData['com.itc.iris.alarming.entities.conditions.AlarmSilentConditionRange'].rangeType != 'DATE'`
                        },
                        {
                            '@class': "com.itc.iris.alarming.entities.conditions.AlarmSilentConditionRange",
                            modelName: "valueEnd",
                            type: "text",
                            label: 'label.End',
                            if: `conditionsData['com.itc.iris.alarming.entities.conditions.AlarmSilentConditionRange'].useRange && conditionsData['com.itc.iris.alarming.entities.conditions.AlarmSilentConditionRange'].rangeType != 'DATE'`
                        }
                    ],
                    conditionsObject = {},
                    valuesTrueIfExist = {};

                angular.forEach(conditions, (condition, index) => {
                    var name = condition['@class'] + '_' + condition.modelName;

                    condition.index = index;

                    conditionsObject[name] = condition;

                    if(condition.valueTrueIfExist) {
                        valuesTrueIfExist[condition.valueTrueIfExist] = valuesTrueIfExist[condition.valueTrueIfExist] || [];
                        valuesTrueIfExist[condition.valueTrueIfExist].push(name);
                    }
                });

                angular.forEach(srcConditionsArray, (condition, index) => {
                    var className = condition['@class'];

                    angular.forEach(condition, (fieldValue, fieldName) => {
                        var name = className + '_' + fieldName,
                            conditionObject = conditionsObject[name];

                        if(angular.isDefined(className) && angular.isDefined(conditionObject)) {
                            conditionObject.index = index;
                            conditionObject.value = condition[conditionObject.modelName] || conditionObject.value;

                            if(!conditionObject.virtual && valuesTrueIfExist[className]) {
                                angular.forEach(valuesTrueIfExist[className], foundName => {
                                    if(conditionsObject[foundName]) {
                                        conditionsObject[foundName].value = 1;
                                    }
                                });

                                delete valuesTrueIfExist[className];
                            }
                        }
                    });
                });

                return conditions;
            }
        })
        .controller('AlarmLimitsController', function ($scope, $filter, params, AlarmingService, TimeoutAlarmingLimits) {
            $scope.dataseries = params.dataseries;
            $scope.deviceId = params.deviceId;
            $scope.levelIdForNewLimit = null;
            $scope.addedLimit = false;

            $scope.limits = [];
            $scope.removeLimits = [];
            $scope.levels = [];

            $scope.state = { observed: $scope.dataseries.observed };

            TimeoutAlarmingLimits.query({'ds-ids': $scope.dataseries.id}).$promise.then((result) => {
                $scope.timeoutAlarmLimits = result
            });

            $scope.addNewLimit = function () {
                if ($scope.levelIdForNewLimit) {
                    var level = $filter('filter')($scope.levels, {id: $scope.levelIdForNewLimit}, false)[0];
                    $scope.limits.push(AlarmingService.createLimit(
                        {
                            dataSeries: [$scope.dataseries],
                            level: level,
                            lower: 0,
                            upper: 1
                        }
                    ));
                }
                refreshAddLimit();
                sortLimits();
            };

            $scope.removeLimit = function (limit) {
                $scope.removeLimits.push(limit);
                $scope.limits.splice($scope.limits.indexOf(limit), 1);
                refreshAddLimit();
                sortLimits();
            };

            $scope.levelIdForNewLimitChanged = (levelId) => {
                $scope.levelIdForNewLimit = levelId
            };

            $scope.$watch('levelIdForNewLimit', function () {
                refreshAddLimit();
            });

            function refreshAddLimit() {
                $scope.addedLimit = false;
                var level = $filter('filter')($scope.levels, {id: $scope.levelIdForNewLimit}, false)[0];
                if (level) {
                    angular.forEach($scope.limits, limit => {
                        if (limit.level.id === level.id) {
                            $scope.addedLimit = true;
                        }
                    });
                }
            }

            $scope.validateAllLimits = function () {
                var result = true;
                var prevLimit = undefined;
                angular.forEach($scope.limits, limitItem => {
                    if (!validateLimit(limitItem, prevLimit)) {
                        result = false;
                    }
                    prevLimit = angular.copy(limitItem);
                });
                $scope.AlarmLevelsForDsEditInvalid = !result;
                return result;
            }
            var validateLimit = function (limit, prevLimit) {

                if ((limit.lower !== null && typeof limit.lower !== "undefined") &&
                    (limit.upper !== null && typeof limit.upper !== "undefined") &&
                    (limit.lower >= limit.upper)) {
                    return false;
                }
                if ((limit.lower === null || typeof limit.lower === "undefined") &&
                    (limit.upper === null || typeof limit.upper === "undefined")) {
                    return false;
                }
                if (typeof prevLimit !== "undefined") {
                    if ((prevLimit.lower !== null && typeof prevLimit.lower !== "undefined") &&
                        (limit.lower !== null && typeof limit.lower !== "undefined") &&
                        prevLimit.lower <= limit.lower) {
                        return false;
                    }
                    if ((prevLimit.upper !== null && typeof prevLimit.upper !== "undefined") &&
                        (limit.upper !== null && typeof limit.upper !== "undefined") &&
                        prevLimit.upper >= limit.upper) {
                        return false;
                    }
                }
                return true;
            };

            AlarmingService.getLevels($scope.deviceId).then(levels => {
                $scope.levels = levels;
            });

            AlarmingService.getLimitsForDs([$scope.dataseries.id]).then(limits => {
                $scope.limits = limits;
                sortLimits();
            })

            var sortLimits = function () {
                $scope.limits.sort(function (a, b) {
                    return a.level.level - b.level.level;
                });
            }

            AlarmingService.getTimeoutAlarmLimits([$scope.dataseries.id]).then(limits => {
                if (limits.length > 0) {
                    $scope.timeoutLimit = limits[0];
                    $scope.originalTimeoutLimit = angular.copy(limits[0]);
                } else {
                    $scope.timeoutLimit = { };
                }
            });

            $scope.save = function() {
                if ($scope.timeoutAlarmLimits.value !== $scope.timeoutAlarmLimitsValue ||
                    $scope.timeoutAlarmLimits.isActive !== $scope.timeoutAlarmLimitsIsActive) {

                    $scope.timeoutAlarmLimits.value = $scope.timeoutAlarmLimitsValue;
                    $scope.timeoutAlarmLimits.isActive = $scope.timeoutAlarmLimitsIsActive;
                    TimeoutAlarmingLimits.save({
                        value: $scope.timeoutAlarmLimits.value,
                        isActive: $scope.timeoutAlarmLimits.isActive,
                        dataSeriesId: $scope.dataseries.id
                    })
                } else {
                    TimeoutAlarmingLimits.deactivate($scope.timeoutAlarmLimits.id)
                }

                $scope.$close({save: $scope.limits, remove: $scope.removeLimits})
            }
        });
})();