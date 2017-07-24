(function(globals) {

    'use strict';

    globals.angular.module('iris_gs_workshift_management_shift_model').controller('ModuleShiftModelBundleEditCtrl',
        function ($scope, $controller, $translate, $rootScope, $filter, params, $uibModalInstance, ShiftModelService) {

            const bundleId = params.id;

            $scope.save = () => {
                ShiftModelService.saveBundle($scope.bundle).then(() => {
                    globals.alertify.success($translate.instant('message.ShiftModelBundleSaved'));
                    $uibModalInstance.close();
                    $rootScope.$broadcast('updateShiftModels');
                })
            };

            $scope.init = () => {
                ShiftModelService.findBundleById(bundleId).then((bundle) => $scope.bundle = bundle);
            };
        }
    );
})({
    angular: angular,
    alertify: alertify
});