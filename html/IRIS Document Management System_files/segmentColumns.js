(function() {
    irisAppDependencies.add('iris_segment_configuration');

    angular.module('iris_segment_configuration', []);

    angular.module('iris_segment_configuration').factory('SegmentColumns', function ($resource) {
        return $resource(iris.config.apiUrl + "/construction/segment-management/tunnels/:tunnelId/segment-columns/:id", {
            id: '@id',
            tunnelId: '@buildingId'
        }, {
            copyFrom: {
                method: "POST",
                url: iris.config.apiUrl + "/construction/segment-management/tunnels/:tunnelId/segment-columns/copy-from/:sourceTunnelId",
                params: {
                    tunnelId: '@tunnelId',
                    sourceTunnelId: '@sourceTunnelId'
                },
                isArray: true
            }
        });
    });

    angular.module('iris_segment_configuration')
        .factory('SegmentColumnsService', function ($translate, SegmentColumns) {
            var columnTypes = [{
                id: 'TEXT',
                name: $translate.instant('label.Text')
            }, {
                id: 'NUMBER',
                name: $translate.instant('label.Number')
            }, {
                id: 'BOOLEAN',
                name: $translate.instant('label.Boolean')
            }, {
                id: 'DATE',
                name: $translate.instant('label.Date')
            }, {
                id: 'DATETIME',
                name: $translate.instant('label.DateTime')
            }, {
                id: 'DROPDOWN',
                name: $translate.instant('label.Dropdown')
            }, {
                id: 'WORKFLOW',
                name: $translate.instant('label.Workflow')
            }];

            return {
                query: (tunnelId) => SegmentColumns.query({tunnelId}).$promise,

                get: (tunnelId, id) => SegmentColumns.get({tunnelId, id}).$promise,

                save: (item) => SegmentColumns.save(item).$promise,

                create: (params) => new SegmentColumns(params),

                remove: (tunnelId, id) => SegmentColumns.remove({tunnelId, id}).$promise,

                getColumnTypes: () => columnTypes,

                copyFrom: (tunnelId, sourceTunnelId) => SegmentColumns.copyFrom({tunnelId, sourceTunnelId}).$promise
            }
        });
})();
