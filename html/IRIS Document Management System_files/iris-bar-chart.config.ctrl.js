(function () {
    var module = angular.module('iris_bar_chart');
    module.controller('BarChartConfigCtrl',
        function ($scope, $translate, $uibModal, $filter, DevicesService, DataSeriesService, IrisUnitsService) {
            $scope.tabs = [{
                alias: 'ViewOptions', // for form validation
                title: $translate.instant('label.ViewOptions'),
                contentUrl: iris.config.widgetsUrl + '/iris-bar-chart/templates/iris-bar-chart.tabs.config.html'
            }];

            $scope.units = IrisUnitsService.getUnitsAsArray();

            $scope.widget.settings.dataSeries = $scope.widget.settings.dataSeries || [];

            $scope.openDataSeriesSelector = function () {
                var allowed_ds_types = ['CONDENSED'];
                var allowed_ds_units = IrisUnitsService.getPossibleConvertsForUnit($scope.widget.settings.dataSeriesUnit);
                allowed_ds_units = allowed_ds_units.map(u => u.unit);

                DataSeriesService.openSelectDSListModal({
                    'params': function () {
                        return {
                            project_id: $scope.widget.projectId,
                            device_id: $scope.widget.deviceId,
                            is_multiple: true,
                            allowed_ds_types: allowed_ds_types,
                            result: $scope.widget.settings.dataSeries,
                            allowed_ds_units: allowed_ds_units
                        }
                    }
                }).then(function (new_list) {
                    //Merge changed names to new array
                    var current_list = $scope.widget.settings.dataSeries;
                    for (var i = 0, c = current_list.length; i < c; i++) {
                        for (var j = 0; j < new_list.length; j++) {
                            if (new_list[j].id == current_list[i].id) {
                                new_list[j].name = current_list[i].name;
                                break;
                            }
                        }
                    }
                    $scope.widget.settings.dataSeries = angular.copy(new_list);
                });
            };

            $scope.removeDataSeries = function (dataSeries) {
                var index = $scope.widget.settings.dataSeries.indexOf(dataSeries);
                $scope.widget.settings.dataSeries.splice(index, 1);
            };

        });

})();