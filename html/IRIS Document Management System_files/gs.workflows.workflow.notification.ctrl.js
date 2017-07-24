(function () {
    angular.module('iris_gs_workflows').controller('ModuleWorkflowNotificationCtrl', function ($scope, workflow) {
        $scope.workflow = angular.copy(workflow);

        $scope.placeholders = [
            {alias: "{{user.name}}", description: "label.workflows.placeholders.UserName"},
            {alias: "{{file.name}}", description: "label.workflows.placeholders.FileName"},
            {alias: "{{project.name}}", description: "label.workflows.placeholders.ProjectName"},
            {alias: "{{status.old}}", description: "label.workflows.placeholders.StatusOld"},
            {alias: "{{status.new}}", description: "label.workflows.placeholders.StatusNew"},
            {alias: "{{status.new.by}}", description: "label.workflows.placeholders.StatusNewBy"},
            {alias: "{{file.link}}", description: "label.workflows.placeholders.FileLink"},
            {alias: "{{file.download.link}}", description: "label.workflows.placeholders.FileDownloadLink"}
        ];

        $scope.insertPlaceholder = function (placeholder) {
            $scope.workflow.notificationMessage += ` ${placeholder}`;
        }
    })
})();