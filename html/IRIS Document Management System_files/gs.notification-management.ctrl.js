(function() {
    angular.module('iris_gs_notification_mgmt').controller('ModuleNotificationTemplatesViewCtrl',
        function($scope, $state) {
            $state.go("module.notification-mgmt.templates", $state.params);
        }
    );

    angular.module('iris_gs_notification_mgmt').controller('NotificationTemplateCtrl',
        function($scope, $state, $controller, $translate, notificationTypes, NotificationsService) {
            angular.extend($scope, $controller('PopupMixin', { $scope }));
            angular.extend($scope, $controller('ModuleDirectoriesBaseViewCtrl', { $scope }));

            $scope.notificationTypes = notificationTypes;

            delete $scope.gridOptions.columnDefs[1];
            $scope.addFieldsToGrid([{
                name: 'NotificationType',
                displayName: $translate.instant('label.NotificationType'),
                cellTemplate: '<div class="ui-grid-cell-contents">{{row.entity.name}}</div>',
                width: '*'
            }]);
            $scope.removeFieldFromGrid("actions");

            // TODO later add condition for reset based on the template being default or not
            var gridRowAction =
            {
                name: 'actions',
                width: 150,
                displayName: $translate.instant('label.Actions'),
                enableSorting: false,
                cellTemplate: '<div class="ui-grid-cell-contents actions"><a href="javascript:void(0)" ng-click="grid.appScope.openModuleSettingsModal(row)" class="btn btn-default" title="{{\'label.Edit\' | translate}}"><i class="fa fa-pencil"></i></a>' +
                '&nbsp;<button class="btn btn-danger" ng-if="!row.entity.isDefault" ng-click="grid.appScope.remove(row.entity)" uib-tooltip="{{\'label.Reset\' | translate}}"><i class="fa fa-repeat"></i></button></div>'
            };
            $scope.gridOptions.columnDefs.push(gridRowAction);



            function getTypes() {
                NotificationsService.getNotificationTypes().then(types => {
                    $scope.items = types ? types : [];
                });
            }
            getTypes();


            $scope.openModuleSettingsModal = function(row) {
                const type = (row && row.entity) ? row.entity.id : null;

                $scope.popup.openComponents('global-settings',
                    'module.settings.notification-management.notification-templates.edit.html',
                    'NotificationEditTemplateCtrl', {type});
            }
            
            
            $scope.remove = function(notificationType) {
                alertify.confirm($translate.instant('message.ResetItemConfirm'), function (e) {
                    if (e) {
                        iris.loader.start();
                        NotificationsService.removeTypeTemplates(notificationType).then(function () {
                            iris.loader.stop();
                            alertify.success($translate.instant('message.ResetItemSuccessful'));
                        });
                    }
                });
            }
        }
    );

    angular.module('iris_gs_notification_mgmt').controller('NotificationEditTemplateCtrl',
        function($scope, $rootScope, $state, $controller, $translate, params, $uibModalInstance, NotificationsService) {
                        
            $scope.channels = [];
            $scope.selectionTypes = [{id:'TYPE_TEXT', name:$translate.instant('label.Text')},{id:'TYPE_CODE', name:$translate.instant('label.Code')}];
            $scope.selectionType = $scope.selectionTypes[0].id;
            NotificationsService.getChannels().then(channels => {
                $scope.channels = channels;
                $scope.selectedChannel = channels[0].id;
            });
            
            NotificationsService.getTypeTemplates(params.type).then((typeTemplates) => {
                $scope.typeTemplates = typeTemplates ? typeTemplates : {};
            });

            $scope.save = () => {
                NotificationsService.saveTypeTemplates($scope.typeTemplates).then(() => {
                    alertify.success($translate.instant('message.NotificationTemplateSaved'));
                    $uibModalInstance.close();
                })
            }
        }
    );
})();

