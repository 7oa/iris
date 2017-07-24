(function() {
    irisAppDependencies.add('iris_segment');

    angular.module('iris_segment', []);

    angular.module('iris_segment').factory('Segments', function ($resource) {
        return $resource(iris.config.apiUrl + "/construction/segment-management/tunnels/:tunnelId/segments/:id", {
            id: '@id',
            tunnelId: '@buildingId'
        }, {
            assignTo: {
                url: iris.config.apiUrl + "/construction/segment-management/tunnels/:tunnelId/segments/assign-to/:newTunnelId?ids=:segmentIds",
                params: {
                    tunnelId: '@buildingId',
                    newTunnelId: '@newBuildingId',
                    segmentIds: '@segmentIds'
                },
                method: "POST",
                isArray: true
            },
            queryByRing: {
                url: iris.config.apiUrl + "/construction/segment-management/tunnels/:tunnelId/rings/:ringNumber/segments",
                params: {
                    tunnelId: '@buildingId',
                    ringNumber: '@ringNumber'
                },
                method: "GET",
                isArray: true
            },
            bulkRemove: {
                url: iris.config.apiUrl + "/construction/segment-management/tunnels/:tunnelId/segments",
                params: {
                    tunnelId: '@buildingId'
                },
                method: "DELETE",
                isArray: true
            },
            bulkUpdate: {
                url: iris.config.apiUrl + "/construction/segment-management/tunnels/:tunnelId/segments/bulk-update",
                params: {
                    tunnelId: '@buildingId'
                },
                method: "POST",
                isArray: true
            }
        });
    });

    angular.module('iris_segment')
        .factory('SegmentsService', function (Segments, $filter, IrisTimeService) {
            return {
                query: (params) => Segments.query(angular.isObject(params) ? params : { tunnelId: params }).$promise,

                queryByRing: (tunnelId, ringNumber) => Segments.queryByRing({tunnelId, ringNumber}).$promise,

                get: (tunnelId, id) => Segments.get({tunnelId, id}).$promise,

                create: (params) => new Segments(params),

                remove: (tunnelId, id) => Segments.remove({tunnelId, id}).$promise,

                export: _export,

                save: _save,

                validate: _validate,

                validateAndSave: _validateAndSave,

                bulkRemove: _bulkRemove,

                assignTo: (tunnelId, newTunnelId, segmentIds) => Segments.assignTo({buildingId: tunnelId, newBuildingId: newTunnelId, segmentIds: angular.toJson(segmentIds)}).$promise
            };

            function _export (tunnelId, columns, ids, format, isRawData) {
                var params = [
                    "columns="+angular.toJson(columns),
                    "format="+format,
                    "ids="+angular.toJson(ids)
                ];

                return iris.config.apiUrl + "/construction/segment-management/tunnels/" + tunnelId + "/segments/export" + (!isRawData ? "-preprocessed":"") + "?" + params.join("&");
            }

            function _bulkRemove (tunnelId, ids) {
                var params = {
                    tunnelId,
                    "ids": angular.toJson(ids)
                };

                return Segments.bulkRemove(params).$promise;
            }

            function _bulkUpdate (params, segments, columns, data, fields, newStateId) {
                var indexField = columns.filter(column => column.isPrimaryIdentificator).pop(),
                    ids = segments.map(segment => segment.id),
                    body = { ids, values: angular.copy(data.segment) };

                delete body.values[indexField.importHeader];

                var newStateHeader = null;
                var newStateValue = null;
                var wfField = fields.find(f => f.modelName=='$workflowId' && f.checked);
                var wfColumn = columns.find(c => c.type=='WORKFLOW');
                if(wfField && wfColumn && newStateId){
                    newStateHeader = wfColumn.headers[newStateId];
                    newStateValue = body.values[newStateHeader];
                }

                fields.filter(f => f.disabled || !f.checked).forEach(f => {
                    delete body.values[f.modelName];
                });

                if(wfField && wfColumn && newStateId){
                    body.values[newStateHeader] = newStateValue;
                }

                return Segments.bulkUpdate(params, body).$promise;
            }

            function _save (params, item) {
                return Segments.save(params, item).$promise;
            }

            function _validate (segment, columns) {
                var result = [],
                    fields = {},
                    data = segment.segment || {};

                angular.forEach(columns, (column) => {
                    fields[column.importHeader] = column;
                });

                angular.forEach(data, (fieldValue, fieldName) => {
                    var field = fields[fieldName];

                    if(angular.isUndefined(field)) {
                        return;
                    }

                    switch(field.type.toLowerCase()) {
                        case 'number':
                            if(!field.isZeroAllowed && fieldValue == "0") {
                                result.push({ text: 'text.FieldNotNull', params: { name: field.importHeader } });
                            }
                            break;
                    }
                });

                return result;
            }

            function _validateAndSave (tunnelId, segment, columns, srcData, tz, fields) {
                var data = angular.copy(srcData),
                    messages = _validate(data, columns);

                if(messages.length) {
                    return messages;
                }

                //First apply dates and then check WF
                columns.forEach(column => {
                    switch(column.type.toLowerCase()) {
                        case 'date':
                        case 'datetime':
                            var formats = IrisTimeService.getAllDateTimeFormats();
                            var format = formats.find(f => f.defaultJavaFormatString == column.dateTimeFormat).momentjsFormatString;
                            var oldDate = data.segment[column.importHeader];
                            var newDate = iris.Time.convertTimeToOutputString(oldDate, format, 'UTC');

                            data.segment[column.importHeader] = newDate == "Invalid date" ? null : newDate;
                            break;
                    }
                });
                columns.forEach(column => {
                    switch(column.type.toLowerCase()) {
                        case 'workflow':
                            if(data.segment.$workflowId) {
                                data.segment.configuredData = data.segment.configuredData || {};
                                data.segment.configuredData[column.id] = data.segment.configuredData[column.id] || {};

                                if(data.segment.configuredData[column.id].current != data.segment.$workflowId) {
                                    var formats = IrisTimeService.getDateTimeFormats(),
                                        format = formats.find(f => f.defaultJavaFormatString == column.dateTimeFormat).momentjsFormatString,
                                        now = iris.Time.convertTimeToOutputString(new Date(), format, 'UTC');

                                    data.segment[column.headers[data.segment.$workflowId]] = now;
                                }
                            }
                            break;
                    }
                });

                var newStateId = data.segment.$workflowId || null;
                if(data.segment.$workflowId) {
                    delete data.segment.$workflowId;
                    delete data.segment.configuredData;
                }

                if(angular.isDefined(data.segment.null)) {
                    delete data.segment.null;
                }

                if(angular.isArray(segment)) {
                    return _bulkUpdate({tunnelId: tunnelId}, segment, columns, data, fields, newStateId);
                } else {
                    return _save({tunnelId: tunnelId, id: segment.id}, data);
                }
            }
        });
})();