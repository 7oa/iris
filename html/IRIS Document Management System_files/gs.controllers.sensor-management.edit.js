(function () {

    angular.module('iris_gs_sensor_management_edit', []);

    //region interval-scanner edit controller
    angular.module('iris_gs_sensor_management_edit').controller('ModuleIntervalScannersEditCtrl',

        function ($scope,
                  $controller,
                  $translate,
                  $state,
                  $uibModal,
                  uiGridConstants,
                  $timeout,
                  $interval,
                  DevicesService,
                  IntervalScannerService,
                  DataSeriesService,
                  GlobalSettingsService) {

            var deviceId = $scope.getSelectedDeviceId();
            var scannerId = Math.max(0, $state.params.scannerId);

            $scope.scanner = null;
            $scope.gaps = [];
            $scope.gapOnWorkbench = {from: null, to: null};
            $scope.types = IntervalScannerService.getScannerTypes();

            $scope.uictrl = {
                displayMainScannerOption: false,
                disableMainScannerOption: false,
                disableIntervalNumberOption: false,
                displayIntervalNumberUi: false
            };

            function buildUiGapsList() {
                $scope.gaps = [];
                if($scope.scanner && $scope.scanner.ringNameGaps) {
                    $scope.gaps = Object.keys($scope.scanner.ringNameGaps)
                        .map(function(from){return {"from":from,"to":$scope.scanner.ringNameGaps[from]};})
                        .sort(function(o1,o2){return +o1.from < +o2.from ? -1 : 1;});
                }
                $scope.scannerGapsGridOptions.data = $scope.gaps;
            }

            function setupNewScanner(type) {
                var type = type || $scope.types.StartStop.value;
                // Save scanner that we have so far (if any).
                var scannerOnWorkbench = $scope.scanner;
                var scannerToWorkbench = IntervalScannerService.newScanner(deviceId, {
                    type: type,
                    name: scannerOnWorkbench ? scannerOnWorkbench.name : $translate.instant('label.New') + ' ' + $translate.instant('label.IntervalScanner') + ' *',
                    enabledIntervalNumber: scannerOnWorkbench ? scannerOnWorkbench.enabledIntervalNumber : false,
                    enabledCreateRelatedDS: true
                });
                switch (type) {
                    case $scope.types.StartStop.value:
                        scannerToWorkbench.mainNamedIntervalScanner = false;
                        scannerToWorkbench.enabledCondensedValue = false;
                        break;
                    case $scope.types.Based.value:
                        scannerToWorkbench.mainNamedIntervalScanner = true;
                        scannerToWorkbench.enabledCondensedValue = true;
                        break;
                    case $scope.types.ProvidedBySensor.value:
                        scannerToWorkbench.mainNamedIntervalScanner = true;
                        scannerToWorkbench.enabledIntervalNumber = true;
                        scannerToWorkbench.enabledCondensedValue = true;
                        break;
                }
                // Add initial condition, since scanners without any conditions are considered invalid !
                var condition = IntervalScannerService.newScannerCondition({
                    name: '',
                    condition: ''
                });
                scannerToWorkbench.conditions.push(condition);
                $timeout(() => {
                    $scope.scanner = scannerToWorkbench;
                    $scope.scannerConditionsGridOptions.data = $scope.scanner.conditions
                });

                return scannerToWorkbench;
            }

            function initPhaseConditions(scanner) {
                scanner.phaseConditions = [
                    { phase: "ADV", deviceId: deviceId, condition: null, expression: null },
                    { phase: "RING_BUILD", deviceId: deviceId, condition: null, expression: null },
                    { phase: "STOP", deviceId: deviceId, condition: null, expression: null }
                ];
            }

            $scope.$watch("scanner", function (scanner) {
                if (scanner) {
                    buildUiGapsList();
                }
                scannerId = (scanner && scanner.id > 0) ? scanner.id : 0;
            });

            // Watch interval-scanner type setting.
            $scope.$watch("scanner.type", function (newTypeValue, oldTypeValue) {

                if (!newTypeValue)
                    return;

                var scanner = $scope.scanner;

                if (scanner) {

                    // *oldTypeValue* is actually set, when the user switches the type
                    // from one value to the other. It is not, when the ui is initialized.
                    if (oldTypeValue) {
                        scanner = setupNewScanner(newTypeValue);
                    }

                    $scope.uictrl.displayMainScannerOption = scanner.isOfTypeBased() || scanner.isOfTypeSensor();
                    $scope.uictrl.disableMainScannerOption = scanner.isOfTypeBased() || scanner.isOfTypeSensor();
                    $scope.uictrl.disableIntervalNumberOption = scanner.isOfTypeSensor();
                    $scope.uictrl.displayIntervalNumberUi = !!scanner.enabledIntervalNumber && !scanner.isOfTypeSensor();

                    if(scanner.isOfTypeBased() && (!angular.isArray(scanner.phaseConditions) || angular.isArray(scanner.phaseConditions) && !scanner.phaseConditions.length)) {
                        initPhaseConditions(scanner);
                    } /*else if(!scanner.isOfTypeBased()) {
                        scanner.phaseConditions = [];
                    }*/
                }

                $scope.scannerConditionsGridUpdate();
            });

            // Watch interval-numbered setting.
            $scope.$watch("scanner.enabledIntervalNumber", function () {
                var scanner = $scope.scanner;
                if (scanner) {
                    $scope.uictrl.displayIntervalNumberUi = !!scanner.enabledIntervalNumber && !scanner.isOfTypeSensor();
                }
            });

            $scope.validateScannerGap = function () {
                if (!$scope.scanner)
                    return false;

                if (!$scope.gapOnWorkbench)
                    return false;

                var gapOnWorkbenchFrom = $scope.gapOnWorkbench.from;
                var gapOnWorkbenchTo = $scope.gapOnWorkbench.to;

                if (gapOnWorkbenchFrom === null || gapOnWorkbenchFrom === undefined)
                    return false;
                if (gapOnWorkbenchTo === null || gapOnWorkbenchTo === undefined)
                    return false;

                if (gapOnWorkbenchTo <= gapOnWorkbenchFrom)
                    return false;

                var haveIntersection = false;

                for (var fromValue in $scope.scanner.ringNameGaps) {

                    var toValue = $scope.scanner.ringNameGaps[fromValue];

                    if (gapOnWorkbenchFrom == fromValue)
                        continue;

                    // Check for intersection
                    if (gapOnWorkbenchFrom > fromValue && gapOnWorkbenchFrom < toValue ||
                        gapOnWorkbenchTo > fromValue && gapOnWorkbenchTo < toValue) {
                        haveIntersection = true;
                        break;
                    }
                }

                return !haveIntersection;
            };

            $scope.saveScannerGap = function () {
                $scope.scanner.ringNameGaps[+$scope.gapOnWorkbench.from] = $scope.gapOnWorkbench.to;
                buildUiGapsList();
            };

            $scope.removeScannerGap = function (gap) {
                alertify.confirm($translate.instant('message.DeleteItemConfirm'), function (confirmed) {
                    if (confirmed) {
                        if ($scope.scanner.ringNameGaps[gap.from] !== undefined) {
                            $scope.$apply(function () {
                                delete $scope.scanner.ringNameGaps[gap.from];
                                buildUiGapsList();
                            });
                        }
                    }
                });
            };

            $scope.removeCondition = function (condition) {
                alertify.confirm($translate.instant('message.DeleteItemConfirm'), function (confirmed) {
                    if (confirmed) {
                        var index = $scope.scannerConditionsGridOptions.data.indexOf(condition);
                        if (index < 0)
                            return;
                        $timeout(function () {
                            $scope.$apply(function () {
                                $scope.scannerConditionsGridOptions.data.splice(index, 1);
                            });
                        });
                    }
                });
            };

            $scope.save = function() {
                IntervalScannerService.saveScanner($scope.scanner).then(result => {$state.go("^.view",$state.params)});
            };

            $scope.cancel = function () {
                $state.go("^.view", $state.params);
            };

            $scope.prepareConditionAdd = function () {
                $scope.scannerConditionsGridApi.iris.prepareForAdd.apply($scope.scannerConditionsGridApi, [$scope.scanner.conditions]);
            };

            $scope.openExpressionDataSeriesSelect = function (intervalCondition) {
                DataSeriesService.openSelectDSListModal({
                        'params': function () {
                            return {
                                project_id: selectedProjectId,
                                device_id: deviceId
                            }
                        }
                    }
                ).then(function (dataSeries) {
                        if (typeof(intervalCondition.condition) != 'string') {
                            intervalCondition.condition = "";
                        }
                        intervalCondition.condition += (intervalCondition.condition ? ' ' : '') + 'ds(\"' + dataSeries.systemIndexName + '\")';
                    });
            };

            $scope.scannerConditionsGridUpdate = function () {
                if (!$scope.scannerConditionsGridApi) {
                    return;
                }

                var idGridCol               = $scope.scannerConditionsGridOptions.columnDefs.filter(function(o){return o.field == "id";})[0];
                var nameGridCol             = $scope.scannerConditionsGridOptions.columnDefs.filter(function(o){return o.field == "name";})[0];
                var startConditionGridCol   = $scope.scannerConditionsGridOptions.columnDefs.filter(function(o){return o.field == "startCondition";})[0];
                var rankGridCol             = $scope.scannerConditionsGridOptions.columnDefs.filter(function(o){return o.field == "rank";})[0];

                idGridCol.visible               = !$scope.scanner.isOfTypeSensor();
                nameGridCol.visible             = !$scope.scanner.isOfTypeSensor();
                startConditionGridCol.visible   = $scope.scanner.isOfTypeNormal();
                rankGridCol.visible             = !$scope.scanner.isOfTypeSensor();

                $scope.scannerConditionsGridApi.core.notifyDataChange(uiGridConstants.dataChange.COLUMN);
            };

            $scope.getSelectedCalculationTypes = function() {
                var types = [];

                angular.forEach($scope.condensedFilterTabs, function(tab, type) {
                    if(tab.active) {
                        this.push(type);
                    }
                }, types);

                return types;
            };

            $scope.openSelectDSModal = function (selectedCalculationTypes) {
                var dataSeriesList = [],
                    types = angular.isString(selectedCalculationTypes) ? [selectedCalculationTypes] : angular.isArray(selectedCalculationTypes) ? selectedCalculationTypes : $scope.getSelectedCalculationTypes();

                /*angular.forEach($scope.scanner.condensedValues, function(val) {
                    if(!types.length || types.indexOf(val.calculationType.toLowerCase()) > -1) {
                        this.push(angular.copy(val.source));
                    }
                }, dataSeriesList);*/

                DataSeriesService.openSelectDSListModal({
                    'params': function () {
                        return {
                            project_id: selectedProjectId,
                            device_id: $state.params.deviceId,
                            is_multiple: true,
                            result: dataSeriesList
                        }
                    }
                }).then(setCondensedValues(types));
            };

            $scope.removeCondensedValue = function (entity) {
                alertify.confirm($translate.instant('message.DeleteItemConfirm'), function (confirmed) {
                    if (confirmed) {
                        var id = entity.id || entity.$$id,
                            type = entity.calculationType,
                            index;

                        if(!id || !type) {
                            return;
                        }

                        if(!$scope.scanner.condensedValues.some((val, i) => {
                                if((val.id || val.$$id) == id && val.calculationType == type) {
                                    index = i;
                                    return true;
                                }
                            })) {
                            return;
                        }
                        $scope.$apply(function() {
                            $scope.scanner.condensedValues.splice(index, 1);
                            updateCondensedFilterTabs();
                        });
                    }
                });
            };

            $scope.setCondensedFilter = function(type) {
                if(angular.isUndefined(type) || angular.isUndefined($scope.condensedFilterTabs[type])) {
                    return;
                }

                $scope.condensedFilterTabs[type].active = !$scope.condensedFilterTabs[type].active;

                refreshCondensedValues();
            };

            $scope.resetSelectedCondensedFilterTabs = function() {
                angular.forEach($scope.condensedFilterTabs, function(tab) {
                    tab.active = false;
                });

                refreshCondensedValues();
            };

            $scope.getGroupType = function(col, row) {
                var entity = row.entity['$$' + col.uid],
                    type = entity.groupVal.toLowerCase();

                return type;
            };

            $scope.getGroupHeader = function(col, row) {
                var entity = row.entity['$$' + col.uid],
                    type = entity.groupVal,
                    count = entity.value;

                return type + ' (' + count + ')';
            };

            $scope.getPhaseIndex = function(entity, phaseName) {
                var phases = entity.phases;

                return angular.isArray(phases) ? phases.indexOf(phaseName) : -1;
            };

            $scope.toggleCheckbox = function(entity, checkboxName) {
                var phases = entity.phases;

                if(!angular.isArray(phases)) {
                    phases = entity.phases = [];
                }

                var index = $scope.getPhaseIndex(entity, checkboxName),
                    status;

                if(index > -1) {
                    phases.splice(index, 1);
                    status = false;
                } else {
                    phases.push(checkboxName);
                    status = true;
                }

                entity.$$phase = entity.$$phase || {};
                entity.$$phase[checkboxName] = status;

                return status;
            };

            var addCondensedValue = function(type, dataSerie, toArr) {
                var condensedValue = {
                    $$id: Math.random(),
                    calculationType: type.toUpperCase(),
                    phases: [],
                    source: dataSerie,
                    target: {
                        name: dataSerie.name
                    }
                };

                condensedValue.target.systemIndexName = getSystemIndexName(condensedValue);

                toArr.push(condensedValue);

                var index = toArr.length - 1;

                return index;
            };


            var getSystemIndexName = function(val) {
                var phases = angular.isArray(val.phases) ? val.phases : [],
                    name = val.source.name + "_" + val.calculationType + "_["+phases.join(',')+"]";

                return name;
            };

            var setCondensedValues = function(selectedCalculationTypes) {
                return function(dataSeriesList) {
                    var srcCondensedValues = $scope.scanner.condensedValues,
                        groups = {},
                        list = {};

                    if(!angular.isArray(srcCondensedValues)) {
                        srcCondensedValues = $scope.scanner.condensedValues = [];
                    }

                    angular.forEach(srcCondensedValues, function(val, i) {
                        var type = val.calculationType.toLowerCase(),
                            group = groups[type];

                        if(!group) {
                            group = groups[type] = {};
                        }

                        val.source.$$index = i;

                        if(selectedCalculationTypes.indexOf(type) > -1) {
                            list[val.source.id] = val.source;
                        }

                        group[val.source.id] = val.source;
                    });

                    angular.forEach(selectedCalculationTypes, function(type) {
                        angular.forEach(dataSeriesList, function(dataSerie) {
                            var data = groups[type],
                                exist = data && data[dataSerie.id];

                            if(!exist) {
                                addCondensedValue(type, dataSerie, srcCondensedValues);
                            }
                        });
                    });

                    updateCondensedFilterTabs();
                };
            };

            var updateCondensedFilterTabs = function() {
                var items = $scope.scanner && $scope.scanner.condensedValues ? $scope.scanner.condensedValues : [],
                    tabs = $scope.condensedFilterTabs = $scope.condensedFilterTabs || {
                            max: {
                                label: 'label.Max'
                            },
                            min: {
                                label: 'label.Min'
                            },
                            start: {
                                label: 'label.Start'
                            },
                            end: {
                                label: 'label.End'
                            },
                            avg: {
                                label: 'label.Avg'
                            },
                            mde: {
                                label: 'label.Mde'
                            },
                            sum: {
                                label: 'label.Sum'
                            },
                            change: {
                                label: 'label.Change'
                            }
                        };

                angular.forEach(tabs, function(tab) {
                    tab.count = 0;
                });

                angular.forEach(items, function(item) {
                    var type = item.calculationType;

                    if(!angular.isString(type)) {
                        return;
                    }

                    type = type.toLowerCase();

                    var tab = tabs[type];

                    if(angular.isUndefined(tab)) {
                        return;
                    }

                    tab.count++;

                    if(angular.isUndefined(tab.active) && tab.count) {
                        tab.active = true;
                    }
                });

                refreshCondensedValues();
            };

            var setCheckboxesColumns = function(columnDefs) {
                var checkboxes = [
                    "ADV",
                    "RING_BUILD",
                    "STOP"
                ];

                angular.forEach(checkboxes, function(checkbox) {
                    var column = {
                        field: checkbox,
                        displayName: checkbox,
                        enableSorting: false,
                        width: 80,
                        cellTemplate: `<div ng-if="!row.groupHeader" class="ui-grid-cell-contents" ng-init="row.entity.$$phase = row.entity.$$phase || {}; row.entity.$$phase['`+checkbox+`'] = grid.appScope.getPhaseIndex(row.entity, '`+checkbox+`') > -1;"><button class="btn btn-link" id="select_ds" ng-click="grid.appScope.toggleCheckbox(row.entity, '`+checkbox+`')" style="padding-left: 0; padding-right: 0;"><span class="fa" ng-class="{ 'fa-check text-success': row.entity.$$phase['` + checkbox + `'], 'fa-close text-danger': !row.entity.$$phase['` + checkbox + `'] }"></span></button></div>`
                    };

                    columnDefs.push(column);
                });
            };

            var refreshCondensedValues = function () {
                var strs = [];

                angular.forEach($scope.condensedFilterTabs, (tab, name) => {
                    if(!tab.active) {
                        return;
                    }

                    strs.push(name);
                });

                var str = strs.join('|'),
                    matcher = new RegExp(str, 'i'),
                    items = $scope.scanner && $scope.scanner.condensedValues ? $scope.scanner.condensedValues : [];

                $scope.condensedValues = items.filter(item => {
                    var textMatch;

                    if(str) {
                        var type = item.calculationType;
                        textMatch = type && type.match(matcher) ? true : false;
                    } else {
                        textMatch = false;
                    }

                    return textMatch !== false;
                });

                $scope.condensedGridOptions.totalItems = $scope.condensedValues.length;
            };

            $scope.condensedValues = [];
            $scope.condensedGridOptions = {
                data: 'condensedValues',
                paginationPageSize: 20,
                columnDefs: [{
                    field: 'calculationType',
                    displayName: 'Type',
                    enableSorting: true,
                    width: 130,
                    sort: { direction: uiGridConstants.ASC, priority: 0 },
                    grouping: { groupPriority: 1 },
                    cellTemplate: `<div ng-if="!col.grouping || col.grouping.groupPriority === undefined || col.grouping.groupPriority === null || ( row.groupHeader && col.grouping.groupPriority === row.treeLevel )" class="ui-grid-cell-contents" title="TOOLTIP" style="padding-top: 14px;">{{ grid.appScope.getGroupHeader(col, row) }} <button class="btn btn-link" ng-click="grid.appScope.openSelectDSModal(grid.appScope.getGroupType(col, row))" uib-tooltip="{{ 'label.AddToType' | translate }}"><span class="fa fa-plus"></span></button></div>`,
                },{
                    field: 'source.mergedName',
                    displayName: 'Name',
                    enableSorting: true,
                    width: '*'
                }],
                onRegisterApi: function(gridApi) {
                    $scope.condensedGridOptions.gridApi = gridApi;
                }
            };

            setCheckboxesColumns($scope.condensedGridOptions.columnDefs);

            $scope.condensedGridOptions.columnDefs.push({
                field: 'realTime',
                displayName: 'RT',
                enableSorting: true,
                width: 40,
                cellTemplate: `<div ng-if="!row.groupHeader" class="ui-grid-cell-contents"><button class="btn btn-link" id="select_ds" ng-click="row.entity.realTime = !row.entity.realTime" style="padding-left: 0; padding-right: 0;"><span class="fa" ng-class="{ 'fa-check text-success': row.entity.realTime, 'fa-close text-danger': !row.entity.realTime }"></span></button></div>`
            });

            $scope.condensedGridOptions.columnDefs.push({
                field: 'actions',
                displayName: 'Actions',
                enableSorting: false,
                width: 80,
                cellTemplate: `<div class="ui-grid-cell-contents" ng-if="!row.groupHeader"><button class="btn btn-danger" ng-click="grid.appScope.removeCondensedValue(row.entity)" uib-tooltip="{{\'label.Remove\' | translate}}"><span class="fa fa-trash-o"></span></button></div>`
            });

            $scope.phaseConditionsGridOptions = {
                data: 'scanner.phaseConditions',
                columnDefs: [{
                    field: 'phase',
                    displayName: 'Name',
                    enableSorting: true,
                    width: 100
                }, {
                    field: 'condition',
                    displayName: 'Condition',
                    enableSorting: true,
                    cellTemplate: `<div class="ui-grid-cell-contents">
                        <div class="input-group">
                            <input type="text" name="condition" class="form-control" required ng-model="row.entity.condition" />
                            <span class="input-group-btn">
                                <button style="" class="btn btn-default" ng-click="grid.appScope.openExpressionDataSeriesSelect(row.entity)" uib-tooltip="{{\'label.Add\' | translate}}">+</button>
                            </span>
                        </div>
                    </div>`,
                    width: '*'
                }, {
                    field: 'updatedBy',
                    displayName: 'Updated By',
                    enableSorting: true,
                    width: 80,
                    cellTemplate: `<div class="ui-grid-cell-contents">{{ row.entity.updatedBy | irisUser }}</div>`
                }, {
                    field: 'updatedOn',
                    displayName: 'Updated On',
                    enableSorting: true,
                    cellTemplate: '<div class="ui-grid-cell-contents">{{ row.entity.updatedOn | date:"dd.MM.yyyy HH:mm:ss" }}</div>',
                    width: 125
                }]
            };

            updateCondensedFilterTabs();

            $scope.scannerConditionsGridApi = null;

            $scope.scannerConditionsGridOptions = {
                data: [],

                onRegisterApi: function (gridApi) {

                    gridApi.registerMethodsFromObject({

                        iris: {

                            validateRow: function (gridRow) {
                                return true;
                            },

                            isRowInEditMode: function (gridRow) {
                                if(gridRow.editing === undefined && scannerId == 0){
                                    gridRow.editing = true;
                                }
                                return !!gridRow.editing;
                            },

                            isCellInEditMode: function (gridRow, gridCol) {
                                return this.api.iris.isRowInEditMode(gridRow);
                            },

                            findRowInEditMode: function (gridRow) {
                                return this.rows.filter(function (o) {
                                    return !!o.editing;
                                })[0];
                            },

                            toggleRowEditMode: function (gridRow) {
                                if (typeof(gridRow) == 'string')
                                    gridRow = this.rows.filter(function (o) {
                                        return o.uid == gridRow;
                                    })[0];

                                if (!gridRow)
                                    return false;

                                var result = true;
                                // Row shall switch from edit to non-edit mode.
                                if (gridRow.editing) {
                                    gridRow.editing = !this.api.iris.validateRow(gridRow);
                                }
                                // Row shall switch from non-edit to edit mode.
                                else {
                                    var gridRowInEditMode = this.api.iris.findRowInEditMode();
                                    if (gridRowInEditMode) {
                                        this.api.iris.validateRow(gridRowInEditMode);
                                        gridRowInEditMode.editing = false;
                                    }
                                    gridRow.editing = true;
                                }
                                return result;
                            },

                            prepareForAdd: function (conditions) {
                                var gridRowInEditMode = this.api.iris.findRowInEditMode();

                                if (gridRowInEditMode) {
                                    if (!gridRowInEditMode.entity.id) {
                                        return false;
                                    }
                                    this.api.iris.validateRow(gridRowInEditMode);
                                    gridRowInEditMode.editing = false;
                                }

                                var newCondition = IntervalScannerService.newScannerCondition({
                                    name: '',
                                    condition: ''
                                });

                                $timeout(() => {
                                    var previousNumberOfRows = this.rows.length;
                                    $scope.scannerConditionsGridOptions.data.push(newCondition);

                                    //listen when new row is added to grid and set its "editing" property to true.
                                    //works only when user is EDITING interval scanner
                                    //this is work-around solution because ui-grid does not emit event when new row is added
                                    var newRowAdded = $interval(() => {
                                        if(this.rows.length == previousNumberOfRows + 1){
                                            if(this.rows[this.rows.length - 1].editing === undefined && scannerId != 0){
                                                this.rows[this.rows.length - 1].editing = true;//new row
                                            }
                                            $interval.cancel(newRowAdded);
                                        }
                                    }, 100);
                                });

                                return true;
                            },

                            openDSEditorForRow: function (gridRow) {
                                if (!this.api.iris.isRowInEditMode(gridRow))
                                    return;
                                $scope.openExpressionDataSeriesSelect(gridRow.entity);
                            },

                            isDeleteRowsAvailable: function() {
                                return !$scope.scanner.isOfTypeSensor();
                            },

                            isRowDeletable: function(gridRow) {
                                return gridRow.grid.rows.length > 1;
                            }
                        }
                    });

                    $scope.scannerConditionsGridApi = gridApi;
                },

                sortInfo: {fields: ['rank'], directions: ['asc']},

                rowTemplate: '<div ng-click="grid.appScope.fnOne(row)" ng-repeat="col in colContainer.renderedColumns track by col.colDef.name" class="ui-grid-cell" ui-grid-cell></div>',

                columnDefs: [
                    {
                        field: 'id',
                        displayName: 'ID',
                        enableSorting: true,
                        width: 30
                    },
                    {
                        field: 'name',
                        displayName: $translate.instant('label.Name'),
                        cellTemplate: `
                            <div class="ui-grid-cell-contents">
                                <div class="form-group">
                                    <input type="text" name="name" class="form-control" required ng-model="row.entity.name" ng-disabled="!grid.api.iris.isCellInEditMode(row,col)" />
                                </div>
                            </div>`,
                        enableSorting: true,
                        width: '*'
                    },
                    {
                        field: 'startCondition',
                        displayName: $translate.instant('label.Condition.Start'),
                        cellTemplate: `
                            <div class="ui-grid-cell-contents">
                                <div class="form-group">
                                    <input type="checkbox" name="startCondition" class="form-control" ng-model="row.entity.startCondition" ng-disabled="!grid.api.iris.isCellInEditMode(row,col)" style="margin:0" />
                                </div>
                            </div>`,
                        enableSorting: false,
                        width: '*'
                    },
                    {
                        field: 'condition',
                        displayName: $translate.instant('label.Condition'),
                        cellTemplate: `
                            <div class="ui-grid-cell-contents">
                                <div class="input-group">
                                    <input type="text" name="condition" class="form-control" required ng-model="row.entity.condition" ng-disabled="!grid.api.iris.isCellInEditMode(row,col)" />
                                    <span class="input-group-btn">
                                        <button style="" class="btn btn-default" ng-click="grid.api.iris.openDSEditorForRow(row)" ng-disabled="!grid.api.iris.isCellInEditMode(row,col)" uib-tooltip="{{\'label.Add\' | translate}}">+</button>
                                    </span>
                                </div>
                            </div>`,
                        enableSorting: true,
                        width: '**'
                    },
                    {
                        field: 'rank',
                        displayName: $translate.instant('label.Order'),
                        cellTemplate: `
                            <div class="ui-grid-cell-contents">
                                <div class="form-group">
                                    <input type="number" name="rank" class="form-control" ng-model="row.entity.rank" ng-disabled="!grid.api.iris.isCellInEditMode(row,col)" />
                                </div>
                            </div>`,
                        enableSorting: true,
                        sort: {
                            direction: uiGridConstants.ASC,
                            priority: 0
                        },
                        sortingAlgorithm: function sortByRank(r1, r2) {
                            var rank1IsNull = r1 === null;
                            var rank2IsNull = r2 === null;
                            var dir = 0;
                            if (rank1IsNull ^ rank2IsNull) {
                                dir = rank1IsNull ? -1 : 1;
                            } else if (rank1IsNull && rank2IsNull) {
                                dir = 0;
                            } else {
                                dir = r1 < r2 ? -1 : (r1 == r2 ? 0 : 1);
                            }
                            return dir;
                        },
                        width: '*'
                    },
                    {
                        field: 'options',
                        width: '*',
                        displayName: $translate.instant('label.Options'),
                        cellTemplate: `
                            <div class="ui-grid-cell-contents actions">
                                <a href="javascript:void(0)"
                                    ng-click="grid.api.iris.toggleRowEditMode(row)"
                                    class="btn btn-default" 
                                    ng-class="{'active': grid.api.iris.isRowInEditMode(row)}"
                                    uib-tooltip="{{grid.api.iris.isRowInEditMode(row) ? 'label.Ok' : 'label.Edit' | translate}}">
                                    <i class="fa fa-{{grid.api.iris.isRowInEditMode(row) ? 'check' : 'pencil'}} fa-fw"></i>
                                </a>
                                <button class="btn btn-danger"
                                    ng-click="grid.appScope.removeCondition(row.entity)"
                                    ng-disabled="!grid.api.iris.isRowDeletable(row)"
                                    ng-show="grid.api.iris.isDeleteRowsAvailable(this)"
                                    uib-tooltip="{{'label.Remove' | translate}}">
                                    <i class="fa fa-trash-o"></i>
                                </button>
                            </div>`,
                        enableSorting: false
                    }
                ]
            };

            $scope.scannerGapsGridOptions = {

                data: [],
                columnDefs: [
                    {
                        field: 'from',
                        displayName: $translate.instant('label.From'),
                        enableSorting: true,
                        width: 100
                    },
                    {
                        field: 'to',
                        displayName: $translate.instant('label.range.To'),
                        enableSorting: true,
                        width: 100
                    },
                    {
                        field: 'options',
                        displayName: $translate.instant('label.Options'),
                        enableSorting: false,
                        cellTemplate: `
                            <div class="ui-grid-cell-contents">
                                <button class="btn btn-danger" ng-click="grid.appScope.removeScannerGap(row.entity)" uib-tooltip="{{::'label.Remove' | translate}}">
                                    <i class="fa fa-trash-o"></i>
                                </button>
                            </div>`,
                        width: '*'
                    }
                ]
            };

            if(scannerId) {
                IntervalScannerService.getScanner(0,scannerId).then(function(scanner){
                    $scope.scanner = scanner;
                    $scope.scannerConditionsGridOptions.data = $scope.scanner.conditions;
                    updateCondensedFilterTabs();
                });
            } else {
                setupNewScanner($scope.types.StartStop.value);
            }
        }
    );
    //endregion

    //region virtual-data-series edit controller
    angular.module('iris_gs_sensor_management_edit').controller('ModuleVirtualDataSeriesEditCtrl',

        function ($scope,
                  $state,
                  $filter,
                  $translate,
                  $uibModal,
                  DevicesService,
                  DataSeriesService,
                  VirtualDataSeriesService,
                  $q,
                  ProjectDeviceService,
                  irisUnitsMap,
                  SensorsService) {
            var deviceId = $scope.devices.selectedId;
            var vdseriesId = Math.max(0, $state.params.vdseriesId);

            $scope.vdseries = null;
            $scope.availableSensors = null;
            $scope.availableIrisUnits = $filter('toArray')(irisUnitsMap).filter(a => typeof a.unit !== "undefined");
            $scope.availableNonWrappedDataSeries = null;
            $scope.availableIrisUnitConverts = null;
            $scope.availableSensorStates = SensorsService.getSensorStates();

            function loadDataSeries() {
                return VirtualDataSeriesService.getById(vdseriesId).then(function (result) {
                    $scope.vdseries = result;
                    $scope.setupPossibleUnitConverts();
                });
            }

            function loadAvailableSensors() {
                return DevicesService.getSensors(deviceId).$promise.then(function (result) {
                    $scope.availableSensors = result;
                });
            }

            function loadAvailableNonWrappedDataSeries() {
                //$scope.availableNonWrappedDataSeries = NonWrappedDataSeriesREST.query({id:deviceId});

                //VirtualDataSeriesService.getByDeviceId(deviceId).then(function(result){
                //    $scope.availableNonWrappedDataSeries = result;
                //});

                DataSeriesService.getNonWrappedByDeviceId(deviceId).then(function (result) {
                    $scope.availableNonWrappedDataSeries = result;
                });
            };
            
            $scope.setTargetDataSeries = function() {
                DataSeriesService.getDSBySensorAndType($scope.vdseries.deviceSensorID, DataSeriesService.getTypes('VIRTUAL')[0].type).then(function (result) {
                    if (!result.length) {
                        $scope.availableNonWrappedDataSeries = [];
                        return;
                    }
                    $scope.availableNonWrappedDataSeries = result;
                    $scope.vdseries.targetDataSeriesID = result[0].id;
                    $scope.setTargetDataSeriesAttributes();
                });
            };

            $scope.setupPossibleUnitConverts = function () {
                var unitsList = $scope.availableIrisUnits;
                var targetUnit = $scope.vdseries.targetDataSeriesUnit;
                var possibleConvert;
                // Find String array of possible converts from IrisUnit list
                for (var i = 0; i < unitsList.length; i++) {
                    if (unitsList[i].unit == targetUnit) {
                        possibleConvert = unitsList[i].possibleConvert;
                        break;
                    }
                }
                // Create IrisUnit Object Array from possible converts String array
                $scope.availableIrisUnitConverts = [];
                if (possibleConvert) {
                    for (var i = 0; i < possibleConvert.length; i++) {
                        for (var y = 0; y < unitsList.length; y++) {
                            if (possibleConvert[i] == unitsList[y].unit) {
                                $scope.availableIrisUnitConverts.push(unitsList[y]);
                                break;
                            }
                        }
                    }
                }
                // Reset expression unit on change, if target data series unit doesn't support
                // converting to current expression unit.
                var indexOf = possibleConvert ? possibleConvert.indexOf($scope.vdseries.expressionUnit) : -1;
                if (indexOf < 0) {
                    $scope.vdseries.expressionUnit = null;
                }
            };

            $scope.setTargetDataSeriesAttributes = function () {
                var targetDataSeries = $filter('filter')($scope.availableNonWrappedDataSeries, {id: $scope.vdseries.targetDataSeriesID}, true)[0] || {};
                $scope.vdseries.targetDataSeriesDigits = targetDataSeries.digits;
                $scope.vdseries.targetDataSeriesUnit = targetDataSeries.irisUnit;
                $scope.setupPossibleUnitConverts();
            };

            $scope.$watch("vdseries",function(vdseries){});

            loadAvailableSensors();
            loadAvailableNonWrappedDataSeries();

            if (vdseriesId) {
                loadDataSeries();
            } else {
                $scope.vdseries = VirtualDataSeriesService.newSeries(deviceId, {});
            }

            var expressionInfoDialog;

            $scope.openExpressionInfo = function () {
                // Needs translation first, html template will render this via ng-bind-html
                $scope.expressionInfoDescription = $translate.instant('label.ExpressionInfoDescription');
                expressionInfoDialog = $uibModal.open({
                    templateUrl: iris.config.componentsUrl + '/global-settings/templates/other/virtual-data-series.expression-info.html',
                    scope: $scope
                });
            };

            $scope.closeExpressionInfo = function () {
                if (expressionInfoDialog) {
                    expressionInfoDialog.close();
                }
            };

            $scope.openExpressionDataSeriesSelect = function () {
                var promise = [];
                promise.push(ProjectDeviceService.getAllProjectDevices());

                $q.all(promise).then(
                    results => {
                        var projects = results[0].filter(res => res.deviceId == $scope.vdseries.deviceID);
                        var projectId;
                        if (!projects.length || projects.find(p => p.id == selectedProjectId) != null) {
                            projectId = selectedProjectId;
                        }
                        else {
                            projectId = projects[0].projectId;
                        }
                        DataSeriesService.openSelectDSListModal({
                            'params': function () {
                                return {
                                    project_id: projectId,
                                    device_id: $scope.vdseries.deviceID,
                                    is_project_device_fixed: true,
                                    result: []
                                }
                            }
                        }).then(function (dataSeries) {
                            console.log(dataSeries);
                            if ($scope.vdseries.expression) {
                                $scope.vdseries.expression = $scope.vdseries.expression + ' ds(\"' + dataSeries.systemIndexName + '\")';
                            }
                            else {
                                $scope.vdseries.expression = 'ds(\"' + dataSeries.systemIndexName + '\")';
                            }
                        });
                    }
                );
            };

            $scope.save = function () {
                iris.loader.start();

                // TODO: The virtual data series controller (server side) has no return value). This is suboptimal and should propably changed.
                //VirtualDataSeriesService.saveSeries($scope.vdseries)
                //.then(function(result){
                //    $state.go("^.view",$state.params);
                //}).finally(function(){
                //    iris.loader.stop();
                //});

                VirtualDataSeriesService.saveSeries($scope.vdseries, function () {
                    iris.loader.stop();
                    $state.go("^.view", $state.params);
                });
            };

            $scope.cancel = function () {
                $state.go("^.view", $state.params);
            }
        }
    );
//endregion

    //region SensorGroup
    angular.module('iris_gs_sensor_management_edit').controller('ModuleSensorGroupsEditCtrl', function ($scope,
                                                                                                        $state,
                                                                                                        $translate,
                                                                                                        params,
                                                                                                        $uibModal,
                                                                                                        $uibModalInstance,
                                                                                                        $stateParams,
                                                                                                        DevicesService,
                                                                                                        SensorGroupsService) {
            $scope.devices = [];
            DevicesService.getDevices().$promise.then(devices => {
                $scope.devices = devices;
            });

            if (params.object_id) {
                $scope.sensorGroup = SensorGroupsService.getSensorGroup(params.data, params.object_id)
                    .then(group=> {
                        $scope.sensorGroup = group;
                        $scope.sensorGroup.device = DevicesService.getById($scope.sensorGroup.deviceId)
                    });

            } else {
                $scope.sensorGroup = {};
                $scope.sensorGroup.device = DevicesService.getById(params.data)
            }

            $scope.save = function () {
                SensorGroupsService.saveSensorGroup(params.data, $scope.sensorGroup).then(sg => {
                    $uibModalInstance.close(sg);
                    alertify.success($translate.instant('label.SensorGroupSaved'));
                });
            };
        }
    );


    angular.module('iris_gs_sensor_management_edit').controller('ModuleEditSensorsEditCtrl',
        function ($scope,
                  $state,
                  $translate,
                  params,
                  $uibModal,
                  $uibModalInstance,
                  $stateParams,
                  DevicesService,
                  SensorGroupsService) {

            var deviceId = params.data;
            var sensorGroupId = params.object_id;
            $scope.available_sensors = [];
            $scope.sensorsIds = [];
            $scope.sensorGroup = {};
            SensorGroupsService.getSensorGroup(deviceId, sensorGroupId)
                .then(result=> {
                    $scope.sensorGroup = result;
                    if (result.sensors) {
                        result.sensors.forEach(sensor => {
                            $scope.sensorsIds.push(sensor.id);
                        });
                    }
                }
            );

            $scope.getSensorsForDevice = function () {
                iris.loader.start();
                DevicesService.getSensors(params.data).$promise.then(
                    function (sensors) {
                        $scope.available_sensors = sensors;
                        iris.loader.stop();
                    }
                );
            };

            $scope.save = function () {
                $scope.sensorGroup.sensors = $scope.available_sensors.filter(sensor => {
                    return $scope.sensorsIds.indexOf(sensor.id + '') > -1;
                });

                SensorGroupsService.saveSensorGroup(deviceId, $scope.sensorGroup).then(()=>$uibModalInstance.close($scope.sensorsIds));

            };
            $scope.getSensorsForDevice();

        });
//endregion

})();
