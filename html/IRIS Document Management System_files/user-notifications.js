/**
 * Created by alexander.zakshevskii on 26.07.16.
 */

(function(globals) {
    globals.angular.module('irisApp').directive('userNotifications', function() {
        return {
            restrict: 'EA',

            scope: {
                url: '='
            },

            replace: true,

            templateUrl: `${globals.config.baseUrl}/common/directives/templates/user-notification-template.html`,

            controller($scope, $controller, $timeout, NotificationsService, $interpolate) {
                globals.angular.extend($scope, $controller('WebSocketMixin', { $scope }));

                $scope.userId = globals.userId;
                $scope.config = iris.config;

                NotificationsService.getUserNotifications(iris.config.me.id, 10, 0).then(
                    res => {
                        $scope.notificationList = res || [];
                    }
                );


                $scope.displayNotification = (notification) => {
                    $timeout(() => {
                        $scope.notificationList.unshift(notification);
                        alertify.success($interpolate(notification.message)($scope));
                    });
                };

                $scope.closeNotification = (notification) => {
                    $scope.notificationList = $scope.notificationList.filter((it) => it !== notification);
                };

                $scope.prepareNotifSentDate = (sent_date) => {
                    return NotificationsService.prepareSentDateLabel(sent_date);
                };

                $scope.webSocket.connect('/websocket')
                    .subscribe(`/user-broker/${globals.userId}/notification`, (response) => {
                        response.template = `${globals.config.baseUrl}/common/directives/templates/notification-message.html`;
                        $scope.displayNotification(response.notification);
                    })
                    .subscribe(`/user-broker/${globals.userId}/protocol/unlock-requested`, (response) => {
                        response.template = `${globals.config.baseUrl}/common/directives/templates/unlock-shift-protocol.html`;
                        $scope.displayNotification(response.notification);
                    });
            }
        }
    });

    globals.angular.module('irisApp').controller('NotificationMessageCtrl', function($scope, NotificationsService) {
        $scope.setRead = (notification) => {
            NotificationsService.setMessageAsRead(notification.hash).then(() => {
                var index = $scope.$parent.notificationList.findIndex(n => n.id == notification.id);
                $scope.$parent.notificationList[index].read = true;
            });
        }
    });

    globals.angular.module('irisApp').controller('UnlockShiftProtocolUserNotification', function($scope, $timeout, $resource) {
        const user = $scope.notification.user;

        $scope.notification = $scope.$parent.notification;
        $scope.message = `${user.firstname || ''}
                    ${user.lastname || ''}
                    ${user.companyName || ''}
                    ${user.email || ''}
                    ${user.phone || ''}
                    asks to unlock shift protocol `;

        $scope.countDown = 6 * 60;
        $scope.interval = setInterval(() => {
            if ($scope.countDown > 0) {
                $timeout(() => {
                    $scope.countDown--;
                });
            } else {
                clearInterval($scope.interval);
                $scope.unlock();
            }
        }, 1000);

        const resource = $resource(`${globals.config.apiUrl}/shift/protocol/:id/:action`, {
            id: '@id',
            userId: '@userId',
        }, {
            rejectUnlock: {isArray: false, params: {action: 'reject-unlock'}},
            unlock: {isArray: false, params: {action: 'unlock'}}
        });

        $scope.reject = () => {
            resource.rejectUnlock({id: $scope.notification.protocolId, userId: user.userId}).$promise.then(() => {
                $scope.$parent.closeNotification($scope.notification);
            });
        };

        $scope.unlock = () => {
            resource.unlock({id: $scope.notification.protocolId}).$promise.then(() => {
                $scope.$parent.closeNotification($scope.notification);
            });
        };
    });
})({angular, userId: iris.config.me.id, config: iris.config});
