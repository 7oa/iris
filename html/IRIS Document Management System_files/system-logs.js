/**
 * Created by kulmann on 25.10.16.
 */
(function() {

    irisAppDependencies.add('iris_system_logs');

    angular.module('iris_system_logs', []);

    angular.module('iris_system_logs').factory('SystemLogs', function ($resource) {
            return $resource(iris.config.apiUrl + "/system-logs/")
        }
    );

    angular.module('iris_system_logs').factory('SystemModules', function ($resource) {
            return $resource(iris.config.apiUrl + "/system-logs/modules/", {})
        }
    );


    angular.module('iris_system_logs').factory('SystemLogService',
        function(SystemLogs, SystemModules) {
            return {
                getSystemLogs: function(filter) {
                    var filterArray = [];

                    filterArray.push({f:'createdOn', v:[filter.dateFrom, filter.dateTo], m:'btw'});
                    if (filter.severity) {
                        filterArray.push({f: 'severity', v: [filter.severity]});
                    }
                    if (filter.module) {
                        filterArray.push({f: 'originModuleCode', v: [filter.module]});
                    }

                    return SystemLogs.query({filter: angular.toJson(filterArray)}).$promise;
                },

                getModules: function() {
                    return SystemModules.query().$promise;
                }
            }
        }
    );
})();