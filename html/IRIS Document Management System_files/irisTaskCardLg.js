(function () {
    angular.module('iris_taskmanagement').directive('irisTaskCardLg',
        function ($uibModal, TasksService, ProcessTemplateService) {
            return {
                replace: true,
                restrict: 'EA',

                scope: {
                    task: '=',
                    onTaskClick: '&',
                    onTaskDblClick: '&',
                    highlighted: '=?',
                    processTemplates: '=?'
                },

                templateUrl: iris.config.baseUrl + '/common/components/taskmanagement/templates/iris-task-card-lg.html',

                controller: function($scope) {
                    $scope.me = iris.config.me;

                    $scope.checkDeadline = function(task) {
                        if (!task || !task.dateEnd || task.isResolved) return false;
                        return moment(new Date()).diff(moment(new Date(task.dateEnd))) > 0;
                    };

                    $scope.isFavorite = () => !!$scope.task.observers.find(o => o.id == $scope.me.id);

                    $scope.showCommentsModal = function() {
                        $uibModal.open({
                            templateUrl: iris.config.baseUrl + '/modules/taskmanagement/templates/taskmanagement.task.comments.modal.html',
                            size: 'md',
                            resolve: {
                                'task': () => $scope.task
                            },
                            controller: function ($scope, task) {
                                $scope.task = task;
                                $scope.taskCommentsApiUrl = TasksService.getTaskCommentsApiUrl(task);
                            }
                        });
                    };

                    $scope.toggleFavorite = function() {
                        TasksService.toggleFollow($scope.task.id).then(tRes => {
                            $scope.task = tRes;
                        })
                    };

                    $scope.processTemplates || (function() {
                        $scope.processTemplates = [];
                        ProcessTemplateService.query({'only-fields': angular.toJson(['id', 'name'])}).then(pRes => {
                            $scope.processTemplates = pRes;
                        });
                    })();
                },

                link: function (scope, element, attrs) {
                    if (scope.onTaskClick) {
                        element.css("cursor", "pointer");
                    }
                }
            };
        });
})();