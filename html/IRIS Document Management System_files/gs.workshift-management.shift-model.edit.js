(function() {

    'use strict';

    angular.module('iris_gs_workshift_management_shift_model').controller('ModuleShiftModelEditCtrl',
        function($scope, $controller, $translate, $filter, params, $uibModalInstance,
                 $rootScope, ShiftModelService) {

            const modelId = params.id;
            const projectId = params.projectId;
            let bundleIds = [];

            $scope.bundles = [];

            ShiftModelService.findAllBundlesByProject(projectId).then((bundles) => {
                $scope.bundles = bundles;
                bundleIds = bundles.map((b) => b.id);
            });

            if (modelId) {
                ShiftModelService.getById(modelId).then((model) => $scope.model = model)
            } else {
                $scope.model = ShiftModelService.createShiftModel();
                $scope.model.projectId = projectId
            }

            $scope.save = function() {
                const bundleId = this._getSelectedBundleId($scope.model.bundleId);
                if (!bundleId && $scope.model.bundleId) {
                    const bundleTitle = $scope.model.bundleId.trim();
                    ShiftModelService.createBundle(projectId, bundleTitle).then((bundle) => {
                        $scope.model.bundleId = bundle.id;
                        $scope._updateShiftModel($scope.model);
                    })
                } else {
                    $scope._updateShiftModel($scope.model);
                }
            };

            $scope._updateShiftModel = (model) => {
                ShiftModelService.save(model).then(function() {
                    alertify.success($translate.instant('message.ShiftModelSaved'));
                    $uibModalInstance.close();
                    $rootScope.$broadcast('updateShiftModels');
                })
            };

            $scope._getSelectedBundleId = (bundleId) => {
                const bundles = $scope.bundles;

                try {
                    bundleId = parseInt(bundleId)
                } catch(all) {
                    return null;
                }

                const bundle = bundles.find((b) => b.id === bundleId);

                if (bundle) {
                    return bundle.id
                } else {
                    return null;
                }
            };

            //TODO: ng-pattern is not working
            $scope.validateStartTime = () => {
                return $scope.model && moment($scope.model.startTime, 'HH:mm:ss').isValid()
            };

            $scope.validateDurationTime = () => {
                return $scope.model && moment($scope.model.durationTime, 'HH:mm:ss').isValid()
            };
        }
    );
})();