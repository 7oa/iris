(function() {

    'use strict';

    angular.module('iris_gs_notification_mgmt_states', []);

    angular.module('iris_gs_notification_mgmt_states').config(
        function ($stateProvider) {
            $stateProvider
                .state('module.notification-mgmt', {
                    url: '/notification-mgmt',
                    resolve: {
                    },
                    controller: 'ModuleNotificationTemplatesViewCtrl',
                    template: '<div class="flex-col-auto b-window" ui-view></div>'
                })
                .state('module.notification-mgmt.templates', {
                    url: '/notification-templates',
                    controller: 'NotificationTemplateCtrl',
                    templateUrl: `${iris.config.componentsUrl}/global-settings/templates/notification-mgmt/notification-templates.html`,
                    resolve: {
                        'notificationTypes': function(NotificationsService){
                            return NotificationsService.getNotificationTypes();
                        }
                    }
                })
        }
    )
})();
