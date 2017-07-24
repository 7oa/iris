(function () {
    var module = angular.module('irisTunnelmeterPerformanceWidget');
    module.controller('TunnelmeterPerformanceWidgetConfigCtrl', function ($scope, $translate, $filter, IrisUnitsService, DataSeriesService, WorkDaysConfigurationService, IrisTunnelmeterPerformanceWidgetService) {
        $scope.tabs = [{
            alias: 'ViewOptions', // for form validation
            title: $translate.instant('label.ViewOptions'),
            contentUrl: iris.config.widgetsUrl + '/iris-tunnelmeter-performance/templates/iris-tunnelmeter-performance.tabs.config.html'
        }];

        $scope.periods = IrisTunnelmeterPerformanceWidgetService.getPeriods();
        $scope.units = IrisUnitsService.getPossibleConvertsForUnit('MILLIMETER');
        $scope.workDaysConfigurations = [];

        $scope.widget.settings.barChartLegend || ($scope.widget.settings.barChartLegend = $translate.instant("label.Performance"));
        $scope.widget.settings.lineChartLegend || ($scope.widget.settings.lineChartLegend = $translate.instant("label.AveragePerformance"));
        $scope.widget.settings.xAxisFormat || ($scope.widget.settings.xAxisFormat = "DD.MM");

        function refreshWorkDaysConfigurations(projectId, autoSetDefault) {
            if (projectId) {
                WorkDaysConfigurationService.getWorkDaysConfigurations(projectId).then(res => {
                    $scope.workDaysConfigurations = res;
                    if (autoSetDefault) {
                        var defaultConf = $scope.workDaysConfigurations.filter(t => t.isDefault);
                        defaultConf.length && ($scope.widget.settings.workDaysConfigurationId = defaultConf[0].id);
                    }
                })
            } else {
                $scope.workDaysConfigurations = [];
            }
        }
        refreshWorkDaysConfigurations($scope.widget.projectId);

        $scope.$watch("widget.projectId", function(nv, ov) {
            if (angular.equals(nv, ov)) return;
            refreshWorkDaysConfigurations(nv, true);
        });

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

        $scope.getDate = function() {
            $scope.formatInfoExample = new Date();
            $scope.formatInfoExampleTry = $scope.widget.settings.xAxisFormat;
        }
    });
})();