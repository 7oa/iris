(function (undefined) {
    var module = angular.module('irisShiftManagementWidget');
    module.controller('ShiftManagementWidgetBaseConfigCtrl', function ($scope, $translate, $uibModal,
                      WorkDaysConfigurationService, ShiftModelService, OperatingStateService, ShiftProtocolService) {
        $scope.shiftBundles = [];
        $scope.shiftModels = [];

        $scope.manualOperatingStates = [];
        $scope.autoOperatingStates = [];

        //function refreshProtocols() {
        //    ShiftProtocolService.findShiftProtocolsByWidgetParams(angular.extend({}, $scope.widget.settings, {
        //        projectId: $scope.widget.projectId,
        //        deviceId: $scope.widget.deviceId
        //    })).then(res => {
        //        $scope.protocols = res;
        //    });
        //}
        //refreshProtocols();

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

        $scope.sortableOptions = {
            handle: '.drag-target'
        };
    });
})();