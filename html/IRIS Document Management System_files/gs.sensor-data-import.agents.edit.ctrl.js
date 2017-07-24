(function () {
    angular.module('iris_gs_sensor_data_import').controller('ModuleAgentsEditCtrl',
        function ($scope, $translate, $state, projects, agent, ProgramAgentsService) {
            $scope.agent = agent;
            $scope.types = ProgramAgentsService.getTypes();
            $scope.modules = ProgramAgentsService.getModules();
            $scope.methods = ProgramAgentsService.getMethods();
            $scope.projects = projects;
            $scope.forms = {};

            $scope.save = function () {
                ProgramAgentsService.save($scope.agent).then(() => {
                    $scope.requestList();
                    $state.go("^");
                });
            };
        })
})();
