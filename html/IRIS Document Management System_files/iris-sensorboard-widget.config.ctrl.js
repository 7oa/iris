(function () {
    var module = angular.module('irisSensorboardWidget');
    module.controller('SensorboardWidgetConfigCtrl', function ($scope, $translate, SensorboardsService) {
        $scope.tabs = [{
            alias: 'Settings', // for form validation
            title: $translate.instant('label.Settings'),
            contentUrl: iris.config.widgetsUrl + '/iris-sensorboard-widget/templates/iris-sensorboard-widget.tabs.settings.html'
        }];

        $scope.allSensorboards = [];
        function refreshSensorboards() {
            SensorboardsService.getSensorboardsList().then(res => {
                $scope.allSensorboards = res;
                filterSensorboards($scope.widget.projectId, $scope.widget.deviceId);
            })
        }
        refreshSensorboards();

        $scope.sensorboards = [];
        function filterSensorboards(projectId, deviceId) {
            $scope.sensorboards = $scope.allSensorboards.filter(sb => {
                var res = true;
                res = res && (projectId && projectId == sb.projectDevice.projectId || !projectId);
                res = res && (deviceId && deviceId == sb.projectDevice.deviceId || !deviceId);
                return res;
            })
        }

        $scope.$watch("widget.projectId", function(nv, ov) {
            if (angular.equals(nv, ov)) return;
            filterSensorboards(nv, $scope.widget.deviceId);
        });

        $scope.$watch("widget.deviceId", function(nv, ov) {
            if (angular.equals(nv, ov)) return;
            filterSensorboards($scope.widget.projectId, nv);
        });
    });
})();