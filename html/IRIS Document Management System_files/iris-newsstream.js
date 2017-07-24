(function() {
    angular.module('irisNewsstream').directive('irisNewsstream', function (IrisNewsstreamService, NotificationsService) {
        return {
            restrict: 'AE',

            scope: {
                params: '=?',
                widget: '=?'
            },

            templateUrl: iris.config.widgetsUrl + '/iris-newsstream/templates/iris-newsstream.view.html',

            controller: function ($scope) {

            },

            link: function (scope, element, attrs) {
                scope.widget = scope.widget || {};
                scope.widget.settings = scope.widget.settings || {};
                scope.params = scope.params || {};
                scope.params = angular.extend({}, scope.params, IrisNewsstreamService.getDefaultSettings(), scope.widget.settings);

                scope.userNotifications = [];

                scope.setRead = (notification) => {
                    NotificationsService.setMessageAsRead(notification.hash).then(() => {
                        var index = scope.userNotifications.findIndex(n => n.id == notification.id);
                        scope.userNotifications[index].read = true;
                    });
                };

                var loadCounter = 1;

                scope.getItems = function () {
                    NotificationsService.getUserNotifications(iris.config.me.id, scope.params.limit * loadCounter, 0).then((res) => {
                        res.forEach(t => {
                            if (!scope.userNotifications.find(n => n.id == t.id)) scope.userNotifications.push(t);
                        });
                        scope.userNotifications.sort((a,b) => new Date(b.eventDate) - new Date(a.eventDate));

                        scope.canLoadMore = res.length && (res.length >= scope.params.limit * loadCounter);
                        loadCounter++;
                    });
                };
                scope.getItems();

                scope.prepareNotifSentDate = (sent_date) => {
                    return NotificationsService.prepareSentDateLabel(sent_date);
                };
            }
        }
    });
})();