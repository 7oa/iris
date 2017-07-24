(function () {
    angular.module('irisSegmentTableWidget').factory('IrisSegmentTableWidgetService',
        function (SegmentsService) {
            var defaultSettings = {
                header: {
                    visible: true,
                    label: "Ring Build",
                    translations: {}
                },
                columnHeader: {
                    visible: true
                },
                splitCount: 1,
                sortColumnIndex: 1,
                columns: []
            };

            var demoData = [];

            function refreshDemoData(segmentAttributes) {
                var res = [];

                for (var i = 0; i < 7; i++) {
                    var item = {};

                    segmentAttributes.forEach(attribute => {
                        var rand = Math.random();
                        switch (attribute.type) {
                            case "TEXT":
                                item[attribute.id] = "ABC" + Math.floor(rand * 10);
                                break;
                            case "NUMBER":
                                item[attribute.id] = rand * 100;
                                break;
                            case "BOOLEAN":
                                item[attribute.id] = rand > 0.5;
                                break;
                            case "DATE":
                                item[attribute.id] = new Date();
                                break;
                            case "DROPDOWN":
                                item[attribute.id] = "ITEM" + Math.floor(rand * 10);
                                break;
                            case "WORKFLOW":
                                item[attribute.id] = "Planned";
                                break;
                            //case "WORKFLOW_STATE":
                            //    item[attribute.id] = "State" + Math.floor(rand * 10);
                            //    break;
                        }
                    });

                    res.push(item);
                }

                demoData = res;
            }

            return {
                refreshDemoData,

                getDemoData: () => demoData,

                getDefaultSettings: function () {
                    return defaultSettings;
                },

                getData: function(tunnelId, ringNumber) {
                    return SegmentsService.queryByRing(tunnelId, ringNumber);
                }
            };
        });

})();

