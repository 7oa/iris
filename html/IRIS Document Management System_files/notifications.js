/**
 * Created by kulmann on 06.08.15.
 */
(function() {

    irisAppDependencies.add('iris_notifications');

    const irisNotifications = angular.module('iris_notifications', []);

    irisNotifications.factory('Severity', function ($resource) {
            return $resource(iris.config.apiUrl + "/notification/enums/severities", {})
        }
    );
    
    
    irisNotifications.factory('Channel', function ($resource) {
            return $resource(iris.config.apiUrl + "/notification/enums/channels", {})
        });

    
    irisNotifications.factory('NotificationType', function ($resource) {
            return $resource(iris.config.apiUrl + "/notification/enums/notification-types", {})
        }
    );
    

    irisNotifications.factory('NotificationLog', function ($resource) {
            return $resource(iris.config.apiUrl + "/notification/logs/:id", {id: '@id'})
        }
    );


    irisNotifications.factory('NotificationTemplate', function($resource) {
        return $resource(`${iris.config.apiUrl}/notification/notification-templates/:type`, {
            type: '@type'
        })
    });


    irisNotifications.factory('NotificationMessage', function($resource) {
        return $resource(`${iris.config.apiUrl}/notification/messages/:id/:action`, {
            id: '@id',
            action: '@action'
        }, {
            setRead: {
                method: 'GET',
                params: { action: 'read' },
                isArray: false
            }
        })
    });



    angular.module('iris_notifications').factory('NotificationsService',
        function(NotificationMessage, NotificationLog, NotificationType, Channel, Severity, NotificationTemplate,
                 $translate) {
            return {
                getNotificationTypes: function () {
                    return NotificationType.query().$promise;
                },

                getChannels: function () {
                    return Channel.query().$promise;
                },

                getSeverities: function () {
                    return Severity.query().$promise;
                },

                getAllNotificationMessages: function () {
                    return NotificationMessage.query().$promise;
                },

                getAllNotificationLogs: function () {
                    return NotificationLog.query().$promise;
                },

                getExportURL: function (params) {
                    return iris.config.apiUrl + "/notification/messages/export?" + $.param(params);
                },

                saveTypeTemplates(typeTemplates) {
                    return typeTemplates.$save();
                },

                removeTypeTemplates(typeTemplates) {
                    return NotificationTemplate.delete({type: typeTemplates.id}).$promise;
                },

                getTypeTemplates(type) {
                    return NotificationTemplate.get({type}).$promise;
                },

                setMessageAsRead(hash) {
                    return NotificationMessage.setRead({id:hash}).$promise
                },

                getUserNotifications: function (user_id, limit, offset) {

                    var params = {
                        filter: angular.toJson([
                                { f: 'channel', v: ['POPUP'] },
                                { f: 'userId', v: [user_id] }
                            ]),
                        'order-by': angular.toJson([{name:'eventDate', value:'desc'}])
                    };

                    if (limit) {
                        params['limit'] = limit;
                    }

                    if (offset) {
                        params['offset'] = offset;
                    }

                    return NotificationMessage.query(params).$promise;
                },

                prepareSentDateLabel: function (sent_date) {
                    let curDate = moment(new Date()),
                        ddays = curDate.diff(moment(new Date(sent_date)), 'days');
                    
                    if(ddays === 0) {
                        let dhours = curDate.diff(moment(new Date(sent_date)), 'hours');
                        if (dhours === 0) {
                            let dminutes = curDate.diff(moment(new Date(sent_date)), 'minutes');
                            if (dminutes === 0) {
                                return $translate.instant('label.RightNow');
                            }
                            return dminutes + ' ' + $translate.instant('label.MinutesAgo');
                        }
                        return dhours + ' ' + $translate.instant('label.HoursAgo');
                    }
                    return ddays + ' ' + $translate.instant('label.DaysAgo');
                }
            }
        }
    );

})();