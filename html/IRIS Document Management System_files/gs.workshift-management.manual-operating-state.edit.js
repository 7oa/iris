((globals) => {

    'use strict';

    globals.angular.module('iris_gs_workshift_management_operating_state')
        .controller('ModuleManualOperatingStateEditCtrl', function ($scope, $controller, params,
            OperatingStateService, $uibModalInstance, $translate, $rootScope) {

            let manualStateId, parentId, projectId;

            $scope.init = () => {
                manualStateId = params.id;
                parentId = params.parentStateId;
                projectId = params.projectId;

                if (manualStateId) {
                    OperatingStateService.getById(manualStateId).then((model) =>
                        $scope.model = model
                    );
                } else {
                    $scope.model = OperatingStateService.createManualState();
                    $scope.model.projectId = projectId;
                    if (parentId) {
                        $scope.model.parentStateId = parentId;
                    }
                }
            };

            $scope.save = () => {
                OperatingStateService.saveManualState($scope.model).then(() => {
                    globals.alertify.success($translate.instant('message.ManualStateSaved'));
                    $uibModalInstance.close();

                    $rootScope.$broadcast('updateManualStates');
                })
            };
        })
})({
    angular: angular,
    alertify: alertify
});