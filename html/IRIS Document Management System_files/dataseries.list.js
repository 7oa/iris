(function () {
    angular.module('iris_dataseries').directive('irisDataSeriesList',
        function ($filter, $timeout, $translate, $q,
                  ProjectsService, DevicesService, SensorGroupsService, SensorsService,
                  IrisUtilsService, DataSeriesService, NaviConfigService) {
            return {
                restrict: 'EA',
                scope: {
                    params: '=',
                    onSelect: '&'
                },
                templateUrl: iris.config.componentsUrl + '/dataseries/templates/iris-data-series-list.html',
                link: function (scope, element, attrs) {
                    scope.allDevices = DevicesService.getDevices();
                    scope.devices = [];
                    scope.projects = ProjectsService.getPreloadedProjects();
                    scope.sensor_groups = [];
                    scope.sensor_types = SensorsService.getSensorTypes(scope.params.allowed_sensor_types);
                    scope.ds_types = DataSeriesService.getTypes(scope.params.allowed_ds_types);
                    scope.filter = {};
                    scope.res_ds = [];
                    var ds_list_request = null;
                    scope.units = [];
                    IrisUtilsService.getUnitsList().$promise.then(function () {
                        scope.units = IrisUtilsService.filterUnits(scope.params.allowed_ds_units);
                    });

                    scope.params.result = scope.params.result || [];

                    //If some DS were predefined as to be selected - request them
                    if(scope.params.result.length) {
                        DataSeriesService.getAll({
                            ids: angular.toJson(scope.params.result.map(ds => ds.id))
                        }).then(ds_list => scope.params.result = ds_list);
                    }

                    scope.setDevice = function (deviceId, isInit) {

                        //to avoid extra setDevice call on init
                        if(+scope.filter.device_id != +deviceId) {
                            scope.filter.device_id = deviceId;
                            if(!isInit) return;
                        }

                        scope.sensor_groups = [];
                        scope.filter.sensor_group = null;
                        scope.device_sensors = [];
                        scope.device_dataseries = [];
                        scope.deviceNaviConfig = {};
                        clearSensorFilter();
                        var promises = [];
                        ds_list_request = null;

                        if(!deviceId) return;

                        scope.filter.device_id = deviceId;
                        SensorGroupsService.getSensorGroups(deviceId).then(values => scope.sensor_groups = values);

                        iris.loader.start('.modal-body');

                        scope.device_sensors = DevicesService.getSensors(deviceId,{
                            'only-fields':angular.toJson(['id','name','sensorGroups','sensorDataSourceType']),
                            'ds-types':angular.toJson(scope.params.allowed_ds_types),
                            'types':angular.toJson(scope.params.allowed_sensor_types)
                        });
                        promises.push(scope.device_sensors.$promise);

                        ds_list_request = DataSeriesService.getAllByDevice(deviceId);
                        ds_list_request.then(ds_list => scope.device_dataseries = ds_list);
                        promises.push(ds_list_request);

                        var naviConfigRequest = NaviConfigService.getDeviceNaviConfig(deviceId);
                        naviConfigRequest.then(config => scope.deviceNaviConfig = config);

                        $q.all(promises).then(scope.applyFilter);

                    };

                    scope.setProject = function (id) {

                        if(!id) {
                            scope.devices = DevicesService.getDevices();
                            return;
                        }

                        //to avoid extra setProject call on init
                        if(+scope.filter.project_id != +id) {
                            scope.filter.project_id = id;
                            return;
                        }

                        scope.devices = [];
                        scope.project = ProjectsService.getProjectById(id);
                        scope.devices = scope.project.devices;

                        if(!scope.devices.length) return;

                        //check if current device is in project and if not - select the first from project
                        var device = scope.project.devices.find(d => d.id == scope.filter.device_id || d.id == scope.params.device_id);

                        //if new selected project has the same device set it, if not - change to the first in list
                        if (!device) {
                            scope.setDevice(scope.project.devices.length ? scope.project.devices[0].id : null);
                        } else {
                            scope.setDevice(device.id);
                        }
                    };
                    scope.setProject(+scope.params.project_id);

                    //if only device was set when open the modal
                    if(scope.params.device_id && !scope.params.project_id) {
                        $timeout(()=>{
                            scope.setDevice(scope.params.device_id, true);
                        });
                    }

                    function clearSensorFilter() {
                        scope.filter.deviceSensorId = null;
                        scope.filter.dataType = null
                    }

                    scope.setSensorFilter = function (sensorId, dataType) {
                        if(scope.filter.dataType != dataType || scope.filter.deviceSensorId != sensorId) {
                            scope.filter.deviceSensorId = sensorId;
                            scope.filter.dataType = dataType
                        } else {
                            clearSensorFilter();
                        }
                        scope.applyFilter();
                    };

                    scope.applyFilter = function () {
                        iris.loader.start('.modal-body');
                        scope.res_ds = [];

                        if(!scope.device_sensors || !scope.device_sensors.length || !ds_list_request) {
                            iris.loader.stop();
                            return;
                        }

                        ds_list_request.then(function (values) {
                            scope.all_ds = values;

                            if(!scope.filter.device_id || !scope.device_sensors.$resolved || !values.length) {
                                iris.loader.stop();
                                return;
                            }

                            scope.res_ds = values;

                            if(scope.filter.text) {
                                scope.res_ds = $filter('filter')(scope.res_ds,{mergedName: scope.filter.text});
                            }

                            //if filters are set - we check for accordance dataseries and filter values
                            scope.res_ds = scope.res_ds.filter(ds => {
                                var res = true;
                                if(scope.filter.deviceSensorId) {
                                    res = res && ds.deviceSensorId == scope.filter.deviceSensorId && ds.dataType == scope.filter.dataType;
                                }

                                if(scope.filter.units) {
                                    res = res && ds.irisUnit == scope.filter.units;
                                }

                                if(scope.filter.ds_type) {
                                    res = res && ds.type == scope.filter.ds_type;
                                } else if(scope.params.allowed_ds_types && scope.params.allowed_ds_types.length) {
                                    res = res && scope.params.allowed_ds_types.indexOf(ds.type) >= 0;
                                }
                                if(scope.params.allowed_ds_units && scope.params.allowed_ds_units.length){
                                    res = res && scope.params.allowed_ds_units.indexOf(ds.irisUnit) >= 0;
                                }

                                return res;
                            });

                            //todo refactor after filter implementation
                            //Filter by sensor id
                            scope.device_sensors.$promise.then(function () {
                                var res = [];
                                for(var i = 0, c = scope.device_sensors.length; i < c; i++) {
                                    var sensor = scope.device_sensors[i];

                                    if(scope.filter.sensor_type && sensor.sensorDataSourceType != scope.filter.sensor_type) continue;

                                    //Check that sensor belongs to selected group
                                    if(scope.filter.sensor_group){
                                        var sensorGroup = scope.sensor_groups.filter(sensorGroup => sensorGroup.id == +scope.filter.sensor_group)[0];
                                        if(!sensorGroup) continue;

                                        var sensor_in_group = sensorGroup.sensors.filter(s => s.id == sensor.id);
                                        if(!sensor_in_group.length) continue;
                                    }

                                    res = res.concat($filter('filter')(scope.res_ds,{deviceSensorId:sensor.id},true));
                                }
                                scope.res_ds = res;

                                //After applying filter the filtered array changed - let selected rows be selected again
                                //If it is not multiple then just select without calling callback
                                if(scope.params.result.length) {
                                    $timeout(function () {
                                        var selected_ds = angular.copy(scope.params.result);
                                        selected_ds.forEach(ds => {
                                            if(ds.deviceId == scope.filter.device_id) scope.toggleSelected(ds,true)
                                        })
                                    });
                                }

                                iris.loader.stop();
                            });
                        });
                    };

                    scope.toggleSelected = function (ds,is_init) {
                        is_init = is_init || false;
                        for(var j = 0, cc = scope.res_ds.length; j < cc; j++) {
                            if(scope.res_ds[j].id == ds.id){
                                //console.log(1,is_init,ds);
                                if(is_init) {
                                    scope.res_ds[j].selected = false;
                                    scope.gridOptions.gridAPI.selection.selectRow(scope.res_ds[j],scope.params.is_multiple);
                                } else {
                                    scope.gridOptions.gridAPI.selection.toggleRowSelection(scope.res_ds[j],scope.params.is_multiple);
                                }
                                break;
                            }
                        }
                    };

                    // Reset filter to incoming params
                    scope.clearFilter = function () {
                        var selectedProjectId = scope.filter.project_id;
                        var selectedDeviceId = scope.filter.device_id;
                        scope.filter = {};
                        if (scope.params.is_project_device_fixed && selectedDeviceId != null) {
                            scope.filter.device_id =   selectedDeviceId;
                        }
                        scope.setProject(selectedProjectId == null ? scope.params.project_id : selectedProjectId);
                    };

                    scope.$watch('filter', function (nv, ov) {
                        if(nv != ov){
                            scope.applyFilter();
                        }
                    },true);

                    scope.gridOptions = {
                        data: 'res_ds',
                        paginationPageSize: 10,
                        minRowsToShow: 10,
                        enableFullRowSelection: !!scope.params.is_multiple,
                        enableSelectAll: !!scope.params.is_multiple,
                        selectionRowHeaderWidth: 35,
                        multiSelect: !!scope.params.is_multiple,
                        columnDefs: [
                            {
                                field: 'id',
                                displayName: 'ID',
                                enableSorting: true,
                                width: 50
                            },
                            {
                                field: 'deviceSensorId',
                                width: 80,
                                displayName: $translate.instant('label.SensorID'),
                                enableSorting: true
                            },
                            {
                                field: 'mergedName',
                                width: '**',
                                displayName: $translate.instant('label.DataSeries'),
                                enableSorting: true
                            },
                            {
                                field: 'irisUnit',
                                width: 50,
                                displayName: $translate.instant('label.Unit'),
                                enableSorting: true,
                                cellTemplate:'<div class="ui-grid-cell-contents">{{row.entity.irisUnit | irisUnits}}</div>'
                            }
                        ],
                        rowTemplate: "<div ng-dblclick=\"grid.appScope.selectDS(row.entity,true)\" ng-repeat=\"(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name\" class=\"ui-grid-cell\" ng-class=\"{ 'ui-grid-row-header-cell': col.isRowHeader }\" ui-grid-cell ></div>",
                        onRegisterApi: function(gridApi){
                            scope.gridOptions.gridAPI = gridApi;

                            gridApi.selection.on.rowSelectionChanged(scope,function(row,event){
                                //console.log(!!scope.params.is_multiple || row.isSelected);
                                if(!!scope.params.is_multiple || row.isSelected) {
                                    scope.selectDS(row.entity, null, !event);
                                }
                            });

                            gridApi.selection.on.rowSelectionChangedBatch(scope,function(rows){
                                //todo bug in ui-grid - this callback is fired even if is multiple false
                                if(!!scope.params.is_multiple) {
                                    for (var i in rows) {
                                        scope.selectDS(rows[i].entity);
                                    }
                                }
                            });
                        },
                        gridFooterTemplate: `
                        <div class="ui-grid-footer-info ui-grid-grid-footer">
                            <span>{{'label.TotalItems' | translate}} {{grid.rows.length}}</span> 
                            <span class="ngLabel dropup">
                                <a href id="selected-ds" class='dropdown-toggle' data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                    ({{"label.SelectedDataseries" | translate}} 
                                    {{grid.appScope.params.result.length}})
                                </a>
                                <ul class="dropdown-menu" role="menu" aria-labelledby="selected-ds">
                                    <li ng-repeat="ds in grid.appScope.params.result">
                                        <a href="javascript:void(0)"
                                           ng-click='grid.appScope.toggleSelected(ds)'
                                           uib-tooltip="{{'label.Deselect' | translate}}">
                                            <i class="fa fa-check text-success"></i> 
                                            {{ds.deviceId | IrisFilterField:[grid.appScope.allDevices]}} - {{ds.mergedName}}
                                        </a>
                                    </li>
                                </ul>
                            </span>
                            <span class='pull-right'>
                                <span>{{'label.CurrentPage' | translate}}: {{ grid.appScope.gridOptions.gridAPI.pagination.getPage() }} of {{ grid.appScope.gridOptions.gridAPI.pagination.getTotalPages() }}</span>
                                <button class="btn btn-link" ng-click="grid.appScope.gridOptions.gridAPI.pagination.previousPage()"><i class="fa fa-angle-left"></i> {{'label.PreviousPage' | translate}}</button> 
                                <button class="btn btn-link" ng-click="grid.appScope.gridOptions.gridAPI.pagination.nextPage()">{{'label.NextPage' | translate}} <i class="fa fa-angle-right"></i></button>
                            </span>
                        </div>`
                    };

                    // if not multiple - resolve the selected DS and close the modal
                    // otherwise just mark DS as selected and update list of all selected DS (result)
                    scope.selectDS = function (ds, from_dblclick, is_callback) {
                        if(!scope.params.is_multiple) {
                            // is_callback is true on init window, so when we open the modal with on preselected DS - don't close the modal
                            if(is_callback) return;

                            scope.onSelect({result:ds});
                        } else {
                            //avoid doubleclick on mutliselect
                            if(from_dblclick) return;

                            if(ds.selected) {
                                for(var i in scope.params.result){
                                    if(scope.params.result[i].id == ds.id) {
                                        scope.params.result.splice(i,1);
                                        break;
                                    }
                                }
                            } else {
                                var ds_in_list = scope.params.result.filter(res_ds => res_ds.id == ds.id).length;
                                if (!ds_in_list) scope.params.result.push(ds);
                            }
                            ds.selected = !ds.selected;
                        }
                    }
                }
            };
        });
})();