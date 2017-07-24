(function () {
    angular.module('iris_gs_base').controller('ModuleProjectsBaseCtrl',

        function($scope, $state, ProjectsService) {
            var projects = $scope.projects = ProjectsService.getPreloadedProjects();

            var haveProjects;
            if (projects && projects.length > 0)
                haveProjects = true;
            else
                haveProjects = false;

            var projectNotSetOrFound =
                !$state.params.projectId ||
                $state.params.projectId == '-' ||
                (haveProjects && !projects.filter(function(o){return o.id == $state.params.projectId;}).length);

            // Redirect to self with a valid project, if it was not set !
            if(projectNotSetOrFound && haveProjects) {
                $state.params.projectId = selectedProjectId;
                $state.go($state.current.name,$state.params,{reload:true});
            }

            $scope.getSelectedProjectId = function() {
                return $scope.projects ? +$scope.projects.selectedId : 0;
            };

            $scope.getSelectedProject = function() {
                if(!$scope.projects || !$scope.projects.length || !$scope.projects.selectedId)
                    return null;
                var filterResult = $scope.projects.filter(function(o){return o.id == $scope.projects.selectedId;});
                return filterResult.length ? filterResult[0] : null;
            };

            $scope.refresh = function(force) {
                if($scope.projects.selectedId != $state.params.projectId || force) {
                    $scope.projects.selected = $scope.getSelectedProject();
                    $state.params.projectId  = $scope.projects.selectedId;
                    $state.go($state.current.name,$state.params,{reload:true});
                }
            };

            $scope.$watch("projects.selectedId",function() {
                $scope.refresh();
            });

            if($state.params.projectId && projects.filter(function(o) {return o.id == $state.params.projectId;}).length) {
                $scope.projects.selectedId = $state.params.projectId;
            } else {
                $scope.projects.selectedId = $scope.projects.length ? $scope.projects[0].id : 0;
            }

            $scope.projects.selected =  $scope.getSelectedProject();
            $state.params.projectId  = +$scope.projects.selectedId;
        }
    );
})()