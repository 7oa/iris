(function() {
    angular.module('iris_dpm').factory('DpmProtocols', function ($resource) {
        return $resource(iris.config.apiUrl + "/dpm/projects/:projectId/protocols/:protocolId/:action/:actionParam", {
            projectId: '@projectId',
            protocolId: '@protocolId',
            action: '@action',
            actionParam: '@actionParam'
        }, {
            getVersion: {
                method: "GET",
                params: {
                    action: "versions"
                }
            },
            count: {
                method: "GET",
                url: iris.config.apiUrl + "/dpm/projects/:projectId/protocols/count"
            },
            calculate: {
                method: "POST",
                params: {action: "calculate"}
            },
            assignToMe: {
                method: "POST",
                params: {action: "assign"}
            },
            unAssign: {
                method: "POST",
                params: {action: "unassign"}
            },
            changeState: {
                method: "POST",
                params: {action: "change-state"}
            },
            getHistoryList: {
                method: "GET",
                params: {action: "versions"},
                isArray: true
            },
            beanstanden: {
                method: "POST",
                url: iris.config.apiUrl + "/dpm/projects/:projectId/protocols/:protocolId/change-state/beanstandet?complain-comment=:actionParam"
            },
            remove: {method:'DELETE', isArray: true}
        });
    });

    angular.module('iris_dpm')
        .factory('DpmProtocolService', function (DpmProtocols) {
            return {
                query: (projectId, filter) => {
                    filter = filter || {};
                    angular.extend(filter, {
                        projectId: projectId
                    });
                    filter['order-by'] || (filter['order-by'] = angular.toJson([{
                        name: 'blockNumber',
                        value: 'desc'
                    }]));
                    return DpmProtocols.query(filter).$promise;
                },

                create: (params) => new DpmProtocols(params),

                get: (projectId, protocolId) => DpmProtocols.get({projectId, protocolId}).$promise,

                getVersion: (projectId, protocolId, versionId) => DpmProtocols.getVersion({projectId, protocolId, actionParam: versionId}).$promise,

                save: (item) => DpmProtocols.save({projectId: item.projectId, protocolId: item.protocolId}, item).$promise,

                remove: (item) => DpmProtocols.remove({projectId: item.projectId, protocolId: item.protocolId}).$promise,

                count: (projectId, filter) => {
                    filter = filter || {};
                    angular.extend(filter, {
                        projectId: projectId
                    });
                    return DpmProtocols.count(filter).$promise;
                },

                calculate: (item) => {
                    return DpmProtocols.calculate({projectId: item.projectId, protocolId: item.protocolId}, item).$promise;
                },

                assignToMe: (item) => {
                    return DpmProtocols.assignToMe({projectId: item.projectId, protocolId: item.protocolId}).$promise;
                },

                unAssign: (item, saveData) => {
                    return DpmProtocols.unAssign({projectId: item.projectId, protocolId: item.protocolId, 'save-data': !!saveData}, saveData ? item : null).$promise;
                },

                changeState: (item, newStateAlias) => {
                    return DpmProtocols.changeState({projectId: item.projectId, protocolId: item.protocolId, actionParam: newStateAlias}).$promise;
                },

                beanstanden: (item, complainComment) => {
                    return DpmProtocols.beanstanden({projectId: item.projectId, protocolId: item.protocolId, actionParam: complainComment}).$promise;
                },

                getHistoryList: (item) => {
                    return DpmProtocols.getHistoryList({projectId: item.projectId, protocolId: item.protocolId}).$promise;
                }
            }
        });
})();
