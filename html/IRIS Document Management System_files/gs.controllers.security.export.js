(function () {

    angular.module('iris_gs_security_export', []);

    angular.module('iris_gs_security_export').controller('ModuleUserExport',
        function ($scope, $controller, $translate, params, $uibModalInstance, UserService) {
            $scope.export = () => {
                UserService.exportUsers(params.type, params.projectId, params.companyId, $scope.includePermissions);
            };
        });
})();

