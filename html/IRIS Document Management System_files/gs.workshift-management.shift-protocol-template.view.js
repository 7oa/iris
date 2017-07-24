(function() {

    'use strict';

    const EDIT_TEMPLATE_URL = 'module.settings.workshift-management.shift-protocol-template.edit.html';
    const EDIT_CONTROLLER_NAME = 'ModuleShiftProtocolTemplateEditCtrl';

    angular.module('iris_gs_workshift_management_protocol_template')
        .controller('ModuleShiftProtocolTemplateViewCtrl', function(
            $scope, $controller, $translate, $stateParams, ShiftProtocolTemplateService) {

            angular.extend($scope, $controller('PopupMixin', { $scope }));
            angular.extend($scope, $controller('ModuleDirectoriesBaseViewCtrl', { $scope }));
            angular.extend($scope, $controller('FavoriteProjectMixin', {$scope}));

            var fields = [
                {
                    name: 'name',
                    displayName: $translate.instant('label.Name'),
                    width: '*'
                },
                {
                    name: 'deviceName',
                    displayName: $translate.instant('label.Device'),
                    width: '*'
                }
            ];

            $scope.addFieldsToGrid(fields);
            $scope.loadTemplates = function(selProjectId) {
                if (selProjectId) {
                    $scope.selProjectId = selProjectId;
                    $scope.items = [];
                    $scope.templates = ShiftProtocolTemplateService.findAllByProject(selProjectId);
                    $scope.templates.then((data) => $scope.items = data);

                }
            };

            $scope.remove = function(model) {
                alertify.confirm($translate.instant('message.ConfirmDeletionShiftProtocolTemplate'), function(confirm) {
                    if (confirm) {
                        ShiftProtocolTemplateService.remove(model.id).then(function() {
                            alertify.success($translate.instant('message.ShiftProtocolTemplateDeleted'));
                            $scope.loadTemplates($scope.selProjectId)
                        })
                    }
                })
            };

            $scope.openModuleSettingsModal = function(row) {
                const id = row && row.entity ? row.entity.id : null;
                const projectId = $scope.selProjectId;

                $scope.popup.openComponents('global-settings', EDIT_TEMPLATE_URL, EDIT_CONTROLLER_NAME,
                    { id, projectId }).then(() => $scope.loadTemplates($scope.selProjectId));
            };
        }
    );
})();