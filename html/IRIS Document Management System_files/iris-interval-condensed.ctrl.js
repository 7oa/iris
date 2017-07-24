(function () {
    angular.module('iris_interval_condensed').controller('IntervalCondensedEditCtrl', function ($scope, $uibModal, $filter, $controller, $translate, $timeout, IrisIntervalCondensedService, uiGridConstants) {
        angular.extend($scope, $controller('IntervalCondensedDefaultCtrl', { $scope: $scope }));

        $scope.editDataSeries = function (widget, dataseries) {
            dataseries.forEach(ds => IrisIntervalCondensedService.editDataSeries($scope.widget, ds));
        };

        $scope.toggleOrder = function () {
            var grid = $scope.widget.$$gridOptions;

            angular.forEach(grid.columnDefs, function (col) {
                switch(col.field) {
                    case 'date_start':
                        var direction = $scope.widget.settings && !!$scope.widget.settings.is_asc ? uiGridConstants.ASC : uiGridConstants.DESC;

                        col.sort = col.sort || {};
                        col.sort.direction = direction;
                        break;
                }
            });

            if(grid.gridApi) {
                var columnsWithSorting = grid.gridApi.grid.getColumnSorting();

                angular.forEach(columnsWithSorting, col => {
                    if(col.colDef && col.colDef.sort) {
                        col.sort = col.colDef.sort;
                    }
                });

                grid.gridApi.core.notifyDataChange(uiGridConstants.dataChange.COLUMN);
            }
        };

        $scope.$on('iris.widget.saved', function () {
            $scope.gridOptions.columnDefs = $scope.widget.settings.columns;
            $scope.widget.$$gridOptions = $scope.gridOptions;
        });

        $scope.tabs = [{
            title: $translate.instant('label.ViewOptions'),
            contentUrl: iris.config.widgetsUrl + '/iris-interval-condensed/templates/iris-interval-condensed.tabs.config.html'
        }];

        $scope.show_controls = true;

        IrisIntervalCondensedService.setDataToGrid($scope.widget, IrisIntervalCondensedService.getDemoData($scope.widget.settings.columns));
    });

    angular.module('iris_interval_condensed').controller('IntervalCondensedDefaultCtrl', function ($scope, $uibModal, $filter, $controller, IrisIntervalCondensedDefaults, IrisIntervalCondensedService, DevicesService, ProjectsService, DataSeriesService, UserGroupsService, DeviceDataService) {
        $scope.refreshGrid = function () {
            $scope.params.period.date_end = $scope.params.period.date_end || new Date();

            if ($scope.widget.settings.mode == "demo") {
                IrisIntervalCondensedService.setDataToGrid($scope.widget, IrisIntervalCondensedService.getDemoData($scope.widget.settings.columns));
            } else {
                IrisIntervalCondensedService.initData($scope.params, $scope.widget, $scope.widget.$$gridOptions, $scope);
            }
        };

        $scope.hasPermission = function (subject_id, subject_name, action) {
            return UserGroupsService.hasPermissions(subject_id, subject_name, action);
        };

        $scope.getDigitsByDSId = function (ds_id) {
            return ds_id && $scope.device_dataseries && $scope.device_dataseries[ds_id] && angular.isNumber($scope.device_dataseries[ds_id].digits)
                ? $scope.device_dataseries[ds_id].digits : 3;
        };

        $scope.setDevice = function (id) {
            if (!id) {
                $scope.device_settings = null;
                return;
            }

            $scope.params.device_id = id;

            var settingsBefore = angular.copy($scope.widget.settings),
                filter = {
                    project_id: $scope.params.project_id,
                    device_id: $scope.params.device_id
                };

            angular.extend($scope.widget.settings, { columns: IrisIntervalCondensedDefaults.columns }, settingsBefore);

            $scope.device = $scope.project.devices.find(d => d.id == id);

            if ($scope.params.date && $scope.params.date.date) {
                filter.to = $scope.params.date.date;
            }

            DeviceDataService.getAdvances(filter).then(function (advances) {
                $scope.widget.advances = advances;
            });

            if (!$scope.is_report) {
                DevicesService.getDeviceSettingsById('interval-condensed', $scope.params.device_id).then(function (device_settings) {
                    $scope.device_settings = device_settings;
                    if (!device_settings || !device_settings.settings) return;

                    angular.extend($scope.widget.settings, $scope.device_settings.settings);

                    // restore first 3 columns with translations
                    var columns = $scope.widget.settings.columns;
                    $scope.widget.settings.columns = IrisIntervalCondensedDefaults.columns.concat(columns.splice(3, columns.length - 3));
                    $scope.widget.$$gridOptions.columnDefs = $scope.widget.settings.columns;
                    $scope.refreshGrid();
                });
            } else {
                $scope.refreshGrid();
            }

        };

        $scope.setProject = function (id) {
            id = id || $scope.params.project_id;
            $scope.project = ProjectsService.getProjectById(id);
            $scope.params.project_id = id;
            if (id) {
                //set timezone to output dates and to Highcharts
                $scope.timezone = $scope.project.timeZone;

                //check if current device is in project and if not - select the first from project
                var flag = $scope.project.devices.find(d => d.id == $scope.params.device_id);

                //if new selected project has the same device set it, if not - change to the first in list
                if (!flag) {
                    $scope.setDevice($scope.project.devices.length ? $scope.project.devices[0].id : null);
                } else {
                    $scope.setDevice($scope.params.device_id);
                }
            }
        };

        $scope.saveDeviceSettings = function () {
            $scope.device_settings.settings = $scope.widget.settings;
            DevicesService.saveDeviceSettings('interval-condensed', $scope.device_settings, $scope.params.device_id).then(function (settings) {
                $scope.device_settings = settings;
            });
        };

        $scope.openDSEditModal = function () {
            var result = [];
            var columns = $scope.widget.settings.columns;

            for (var i in columns) {
                if (i < 3) continue; //First 3 columns don't have ds
                result.push({id: columns[i].ds.id});
            }

            var dataseries = {
                project_id: $scope.widget.project_id,
                device_id: $scope.widget.device_id,
                is_multiple: true,
                allowed_ds_types: ['CONDENSED', 'VIRTUAL', 'MANUAL'],
                result: result
            };

            DataSeriesService.openSelectDSListModal({
                'params': function () {
                    return dataseries
                }
            }).then(function (ds) {
                columns.splice(3, columns.length - 3);
                $scope.editDataSeries($scope.widget, ds);
                $scope.widget.$$gridOptions.columnDefs = $scope.widget.settings.columns;
                $scope.refreshGrid();
            });
        };

        $scope.editDataSeries = function (widget, dataseries) {
            dataseries.forEach(ds => IrisIntervalCondensedService.editDataSeries($scope.widget, ds));
            $scope.saveDeviceSettings();
        };

        $scope.isHaveDevice = function () {
            var projectId = parseInt($scope.widget.projectId, 10),
                deviceId = parseInt($scope.widget.deviceId, 10);

            $scope.widget.project_id = !isNaN(projectId) ? projectId : undefined;
            $scope.widget.device_id = !isNaN(deviceId) ? deviceId : undefined;

            //todo rewrite
            if (angular.isDefined($scope.widget.parameters.project_id)) {
                $scope.widget.project_id = $scope.widget.parameters.project_id;
            }
            if (angular.isDefined($scope.widget.parameters.device_id)) {
                $scope.widget.device_id = $scope.widget.parameters.device_id;
            }

            return !!($scope.widget.device_id && $scope.widget.project_id);
        };

        $scope.devices = DevicesService.getDevices();
        $scope.projects = ProjectsService.getProjects();

        $scope.widget = $scope.widget || {};
        $scope.widget.settings = $scope.widget.settings || {};
        $scope.widget.settings.columns = $scope.widget.settings.columns || [];
        $scope.widget.$$data = $scope.widget.$$data || [];

        $scope.params = $scope.params || {};
        $scope.params.period = $scope.params.period || {};

        $scope.is_report = !!$scope.widget.settings.columns;

        $scope.widget.$$gridOptions = {
            enableSorting: false,
            data: 'widget.$$data',
            columnDefs: $scope.widget.settings.columns,
            paginationPageSizes: 0,
            paginationPageSize: 15,
            virtualizationThreshold: 30,
            onRegisterApi: function (gridApi) {
                $scope.widget.$$gridOptions.gridApi = gridApi;
            }
        };

        $scope.gridOptions = $scope.widget.$$gridOptions;

        $scope.setProject($scope.widget.projectId);
    });
})();