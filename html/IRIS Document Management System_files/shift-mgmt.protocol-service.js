(function () {
    'use strict';

    const module = angular.module('iris_shiftmgmt_service');

    module.factory('ShiftProtocol', function ($resource) {
        return $resource(`${iris.config.apiUrl}/shift/protocol/:id/:action/:paramId`, {
                id: '@id',
                paramId: '@paramId',
                userId: '@userId',
                shiftModelIds: '@shiftModelIds',
                bundleIds: '@bundleIds',
                stuffIds: '@stuffIds',
                comment: '@comment'
            }, {
                get: {isArray: false},
                getTasks: {isArray: false, params: {action: 'full-model'}},
                getBundleStates: {isArray: false, params: {action: 'bundle-states'}},
                getShiftModelStates: {isArray: false, params: {action: 'shift-model-states'}},
                adjustConflictValues: { isArray: false, params: { action: 'adjust-conflicts' }, method: 'POST'},
                finalize: {isArray: false, params: {action: 'finalize'}},
                ignoreConflict: {isArray: false, params: {action: 'ignore-conflict'}},
                findByProjectAndBundle: {isArray: true, params: {action: 'findByProjectAndBundle'}, method: 'GET'},
                requestUnlock: {isArray: false, params: {action: 'request-unlock'}},
                rejectUnlock: {isArray: false, params: {action: 'reject-unlock'}},
                unlock: {isArray: false, params: {action: 'unlock'}},
                lock: {isArray: false, params: {action: 'lock'}},
                syncAutoStates: {isArray: false, params: {action: 'sync'}},
                getStatistics: {isArray: false, params: {action: 'statistics'}},
                saveComment: {isArray: false, params: {action: 'save-comment'}, method: 'POST'},
                getDateTimeOfLastProtocolUpdate: {isArray: false, params: {action: 'lastUpdate'}},
                saveDayComment: {isArray: false, params: {action: 'save-day-comment'}, method: 'POST'},
                checkbits: {isArray: true, params: { action: 'checkbits'}, method: 'GET'},
                searchWithAdvanceInfo: {isArray: true, params: {
                    action: 'searchWithAdvanceInfo',
                    'exclude-fields': angular.toJson(['shiftStaffs','automaticOperatingStates','manualOperatingStates','assignableJobTitles'])
                }, method: 'GET'},
                countProtocols: {isArray: false, params: {
                    action: 'count'
                }, method: 'GET'}
            });
        }
    );

    module.factory('ShiftStaff', function ($resource) {
        return $resource(`${iris.config.apiUrl}/shift/protocol/stuff`, {
            projectId: '@projectId',
            bundleId: '@bundleId',
            modelIds: '@modelIds'
        }, {
            query: {isArray: true}
        });
    });

    module.factory('ShiftProtocolStatistics', function ($resource) {
        return $resource(`${iris.config.apiUrl}/shiftmanagement/statistics/get`, { }, {
            query: {isArray: false}
        });
    });

    module.factory('ProjectShiftProtocolsStates', function($resource) {
        return $resource(`${iris.config.apiUrl}/shift/protocol/get-protocols-states`)
    });

    module.factory('ShiftProtocolService', function ($q, ShiftProtocol, ShiftProtocolStatistics, ProjectShiftProtocolsStates, ShiftProtocolDemo, ShiftProtocolDemoFullModel, ShiftStaff) {

        var currentProjectId = function () {
            return window.selectedProjectId;
        };

        return {
            findAll: () =>
                ShiftProtocol.query().$promise,

            getAllForProject: (projectId) =>
                ShiftProtocol.query({projectId: projectId}).$promise,

            searchWithAdvanceInfo: (projectId, boundaries, modelIds, stuffIds, comment, deviceId, pageNumber, pageSize) =>
                ShiftProtocol.searchWithAdvanceInfo({
                    projectId: projectId,
                    shiftModelIds: modelIds,
                    stuffIds: stuffIds,
                    comment: comment,
                    start: boundaries && boundaries.date_start,
                    end: boundaries && boundaries.date_end,
                    deviceId: deviceId,
                    pageNumber: pageNumber,
                    pageSize: pageSize
                }).$promise,

            countProtocols: (projectId, boundaries, modelIds, stuffIds, comment, deviceId) =>
                ShiftProtocol.countProtocols({
                    projectId: projectId,
                    shiftModelIds: modelIds,
                    stuffIds: stuffIds,
                    comment: comment,
                    start: boundaries && boundaries.date_start,
                    end: boundaries && boundaries.date_end,
                    deviceId: deviceId
                }).$promise,

            search: (projectId, boundaries, modelIds, stuffIds, comment, deviceId, pageNumber, pageSize) =>
                ShiftProtocol.query({
                    projectId: projectId,
                    shiftModelIds: modelIds,
                    stuffIds: stuffIds,
                    comment: comment,
                    start: boundaries && boundaries.date_start,
                    end: boundaries && boundaries.date_end,
                    deviceId: deviceId,
                    pageNumber: pageNumber,
                    pageSize: pageSize
                }).$promise,

            findAllByProjectAndBundle(projectId, bundleId) {
                return ShiftProtocol.findByProjectAndBundle({projectId, bundleId, limit: 20}).$promise;
            },

            save: (protocol) =>
                ShiftProtocol.save(protocol).$promise,

            create: (protocol) =>
                ShiftProtocol.save(protocol).$promise,

            delete: (protocol) => {
                return ShiftProtocol.delete({id: angular.isNumber(protocol) ? protocol : protocol.id }).$promise;
            },

            newShiftProtocol: (properties) => angular.extend(new ShiftProtocol(), properties || {}, {
                    projectId: currentProjectId(),
                    assignedProfiles: []
                }
            ),

            getById: (id) =>
                ShiftProtocol.get({id}).$promise,

            getDemoFullModel() {
                var q = new $q.defer();
                q.resolve(angular.copy(ShiftProtocolDemoFullModel));
                return q.promise;
            },

            getFullModelById: (id) =>
                ShiftProtocol.getTasks({id}).$promise,

            findAllProtocolOperatingStatesByBundleId(bundleId) {
                return ShiftProtocol.getBundleStates({paramId: bundleId}).$promise
            },

            findAllProtocolOperatingStatesByShiftModelIds(shiftModelIds) {
                return ShiftProtocol.getShiftModelStates({shiftModelIds}).$promise
            },

            findShiftProtocolsByWidgetParams(params) {
                const sendParams = angular.copy(params);

                if (params.shiftModelIds) {
                    const shiftModelIds = sendParams.shiftModelIds.slice();
                    sendParams.shiftModelIds = shiftModelIds.map((m) => parseInt(m))
                }

                return ShiftProtocol.findByProjectAndBundle(sendParams).$promise
            },

            adjustConflictValues(protocol) {
                return ShiftProtocol.adjustConflictValues(protocol).$promise
            },

            exportPDF(widget, params, name, templateId) {
                // Add tomcat application context in front of url, if you want to run this in browser (e.g."/iris")
                console.log(`/ui/ui/shift-mgmt/preview?params=${angular.toJson(params)}&widget=${angular.toJson(widget)}`);
                const previewUrl = `/ui/ui/shift-mgmt/preview?params=${angular.toJson(params)}&widget=${angular.toJson(widget)}`;
                const encodedPreviewUrl = encodeURIComponent(previewUrl);
                const printServiceUrl = `${iris.config.apiUrl}/reporting/reports/generate`;
                const printParams = {
                    name: name,
                    templateId,
                    template: {
                        pageSize: 'A4',
                        pageOrientation: 'LANDSCAPE'
                    }
                };

                if (templateId) {
                    printParams.templateId = templateId
                }

                window.location.href = `${printServiceUrl}?url=${encodedPreviewUrl}&token=${iris.config.accessToken}&params=${encodeURIComponent(angular.toJson(printParams))}`;
                // Use this to enable debugging in browser
                //window.location.href = previewUrl
            },

            ignoreConflict(protocolId) {
                return ShiftProtocol.ignoreConflict({
                    id: protocolId
                }).$promise
            },

            finalize(protocolId, finalize) {
                return ShiftProtocol.finalize({
                    id: protocolId,
                    finalize: finalize
                }).$promise
            },

            requestUnlock(protocolId) {
                return ShiftProtocol.requestUnlock({id: protocolId}).$promise
            },

            rejectUnlock(protocolId, userId) {
                return ShiftProtocol.rejectUnlock({id: protocolId, userId}).$promise
            },

            lock(protocolId) {
                return ShiftProtocol.lock({id: protocolId}).$promise
            },

            unlock(protocolId) {
                return ShiftProtocol.unlock({id: protocolId}).$promise
            },

            syncAutoStates(protocolId) {
                return ShiftProtocol.syncAutoStates({id: protocolId}).$promise
            },

            getDemoStatistics(dataIndex) {
                var q = new $q.defer();
                q.resolve(ShiftProtocolDemo.getStatistics(dataIndex));
                return q.promise;
            },

            getDemoStatisticsDynamic(params) {
                var q = new $q.defer();
                q.resolve(ShiftProtocolDemo.getStatisticsDynamic(params.columns, params.showSummary));
                return q.promise;
            },

            getStatistics(params) {
                return ShiftProtocolStatistics.query({query: angular.toJson(params)}).$promise
            },

            saveDayComment(protocolId, comment) {
                return ShiftProtocol.saveDayComment({id: protocolId}, comment).$promise
            },

            getDateTimeOfLastProtocolUpdate(protocolId) {
                return ShiftProtocol.getDateTimeOfLastProtocolUpdate({id: protocolId}).$promise;
            },

            getProtocolsStates: (protocolsIds) => {
                return ProjectShiftProtocolsStates.get({ protocolsIds: angular.toJson(protocolsIds) }).$promise;
            },

            findStuff(projectId, bundleId, modelIds) {
                return ShiftStaff.query({projectId, bundleId, modelIds}).$promise
            },

            calculateCheckbits(protocolId) {
                return ShiftProtocol.checkbits({ id: protocolId }).$promise
            }
        }
    })
})();