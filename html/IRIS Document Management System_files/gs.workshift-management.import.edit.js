((globals) => {

    'use strict';

    globals.angular.module('iris_gs_workshift_management_operating_state')
        .controller('ModuleImportEditCtrl', function ($scope, $rootScope, $translate, $uibModalInstance, params) {

            $scope.projectId = params.projectId;

            $scope.complete = (items, response, status, headers) => {
                if (status === 200) {
                    globals.alertify.success($translate.instant('message.ManualStatesUploaded'));
                } else {
                    globals.alertify.error($translate.instant(response.messages[0]));
                }
                $uibModalInstance.close();
                $rootScope.$broadcast('updateManualStates');
            }
        }
    );
})({
    angular: angular,
    irisConfig: iris.config,
    alertify: alertify
});