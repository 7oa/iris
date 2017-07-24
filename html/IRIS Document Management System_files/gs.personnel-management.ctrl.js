
(function() {

    angular.module('iris_gs_personnel_mgmt').controller('ModulePersonnelMgmtCtrl',

        function($scope, $state, companies) {
            $scope.companies = companies;

            // If the state directly addresses this controller, try to forward it to a child controller.
            if($state.is("module.personnel-mgmt")) {
                    $state.go("module.personnel-mgmt.job-titles", $state.params);
            }
        }
    );
})();