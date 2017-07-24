(function () {
    var module = angular.module('irisShiftBarChartWidget');
    module.controller('ShiftBarChartWidgetConfigCtrl', function ($scope, $translate,
                      IrisShiftBarChartWidgetService, ShiftProtocolService, ShiftModelService, WorkDaysConfigurationService, DataSeriesService) {
        $scope.tabs = [{
            alias: 'Settings', // for form validation
            title: $translate.instant('label.Settings'),
            contentUrl: iris.config.widgetsUrl + '/iris-shift-bar-chart-widget/templates/iris-shift-bar-chart-widget.tabs.settings.html'
        }, {
            title: $translate.instant('label.Codes'),
            contentUrl: iris.config.widgetsUrl + '/iris-shift-bar-chart-widget/templates/iris-shift-bar-chart-widget.tabs.codes.html'
        }];

        $scope.workDaysConfigurations = [];
        $scope.shiftBundles = [];
        $scope.shiftModels = [];

        $scope.condensationTypes = IrisShiftBarChartWidgetService.getCondensationTypes();
        $scope.shiftSumUnits = IrisShiftBarChartWidgetService.getShiftSumUnits();

        $scope.manualOperatingStates = [];
        $scope.autoOperatingStates = [];

        function refreshWorkDaysConfigurations(projectId) {
            if (projectId) {
                WorkDaysConfigurationService.getWorkDaysConfigurations(projectId).then(res => {
                    $scope.workDaysConfigurations = res;
                })
            } else {
                $scope.workDaysConfigurations = [];
            }
        }
        refreshWorkDaysConfigurations($scope.widget.projectId);

        function refreshShiftBundles(projectId, autoSelect) {
            if (projectId) {
                ShiftModelService.findAllBundlesByProject(projectId).then(res => {
                    $scope.shiftBundles = res;
                    if (autoSelect && res.length) $scope.widget.settings.shiftBundleId = $scope.shiftBundles[0].id;
                });
            } else {
                $scope.shiftBundles = [];
                $scope.widget.settings.shiftBundleId = null;
            }
        }
        refreshShiftBundles($scope.widget.projectId);

        function refreshShiftModels(projectId, shiftBundleId, autoSelect) {
            if (shiftBundleId) {
                ShiftModelService.findAllByBundleId(shiftBundleId).then(res => {
                    $scope.shiftModels = res;
                    if (autoSelect) $scope.widget.settings.shiftModels = res.map(t => t.id);
                })
            } else if (projectId) {
                ShiftModelService.findAllByProject(projectId).then(res => {
                    $scope.shiftModels = res;
                    if (autoSelect) $scope.widget.settings.shiftModels = res.map(t => t.id);
                });
            } else {
                $scope.shiftModels = [];
                $scope.widget.settings.shiftModels = null;
            }
        }
        refreshShiftModels($scope.widget.projectId, $scope.widget.settings.shiftBundleId);

        function refreshOperatingStates(shiftBundleId, shiftModels) {
            if (shiftModels && shiftModels.length) {
                ShiftProtocolService.findAllProtocolOperatingStatesByShiftModelIds(shiftModels).then(res => {
                    $scope.manualOperatingStates = res.manual;
                    $scope.autoOperatingStates = res.automatic;
                });
            } else if (shiftBundleId) {
                ShiftProtocolService.findAllProtocolOperatingStatesByBundleId(shiftBundleId).then(res => {
                    $scope.manualOperatingStates = res.manual;
                    $scope.autoOperatingStates = res.automatic;
                });
            } else {
                $scope.manualOperatingStates = [];
                $scope.autoOperatingStates = [];
            }
        }
        refreshOperatingStates($scope.widget.settings.shiftBundleId, $scope.widget.settings.shiftModels);

        $scope.$watch("widget.projectId", function(nv, ov) {
            if (nv == ov) return;
            refreshWorkDaysConfigurations(nv);
            refreshShiftBundles(nv, true);
            refreshShiftModels(nv, null, true);
        });

        $scope.$watch("widget.deviceId", function(nv, ov) {
            if (nv == ov) return;
        });

        $scope.$watch("widget.settings.shiftBundleId", function(nv, ov) {
            if (nv == ov) return;
            refreshShiftModels($scope.widget.projectId, nv, true);
            refreshOperatingStates(nv, null);
        });

        $scope.$watch("widget.settings.shiftModels", function(nv, ov) {
            if (nv == ov) return;
            refreshOperatingStates($scope.widget.settings.shiftBundleId, nv);
        }, true);

        $scope.getDate = function() {
            $scope.formatInfoExample = new Date();
            $scope.formatInfoExampleTry = $scope.widget.settings.xAxisFormat;
        };

        $scope.openSelectDSModal = function() {
            if ($scope.widget.settings.dataSeries && $scope.widget.settings.dataSeries.id) {
                $scope.widget.settings.dataSeries = null;
                return;
            }

            return DataSeriesService.openSelectDSListModal({
                'params': () => {
                    return {
                        project_id: $scope.widget.projectId,
                        device_id: $scope.widget.deviceId,
                        is_project_device_fixed: false,
                        is_multiple: false,
                        autoSelectTunnelmeter: true,
                        result: []
                    }
                }
            }).then(function (ds) {
                $scope.widget.settings.dataSeries = ds;
                $scope.widget.settings.unit = $scope.widget.settings.dataSeries ? $scope.widget.settings.dataSeries.irisUnit : null;
            });
        };
    });
})();