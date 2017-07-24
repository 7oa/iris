(function () {
    angular.module('irisDamageRepairWidget').factory('IrisDamageRepairWidgetService',
        function (DocumentService) {
            var defaultSettings = {

            };

            return {
                getDemoData: (settings) => {
                    var res = [];
                    if (!settings.groupColumns || !settings.groupColumns.length || !settings.infoColumns || !settings.infoColumns.length) return res;

                    var rowCount = Math.pow(2, settings.groupColumns.length);
                    for (let k = 0; k < rowCount; k++) {
                        var item = {
                            protocols: []
                        };

                        for (let g = 0; g < settings.groupColumns.length; g++) {
                            item[settings.groupColumns[settings.groupColumns.length - g - 1].alias] = Math.floor(k / Math.pow(2, g)) % 2;
                        }

                        var count = k ? 1 + Math.floor(Math.random() * 4) : 4;
                        for (let t = 0; t < count; t++) {
                            var protocol = {
                                date: new Date(),
                                damages: []
                            };
                            for (let d = 0; d < 2 + Math.floor(Math.random() * 4); d++) {
                                var damage = {};
                                settings.infoColumns.forEach(c => {
                                    damage[c.alias] = `data`;
                                });
                                protocol.damages.push(damage);
                            }
                            item.protocols.push(protocol);
                        }

                        res.push(item);
                    }

                    for (let g = 0; g < settings.groupColumns.length; g++) {
                        var counter = 0,
                            startIndex = 0;
                        for (let k = 0; k < rowCount; k++) {
                            if (k == 0 || res[k][settings.groupColumns[g].alias] == res[k-1][settings.groupColumns[g].alias]) counter++;
                            if (k != 0 && res[k][settings.groupColumns[g].alias] != res[k-1][settings.groupColumns[g].alias]) {
                                res[startIndex][settings.groupColumns[g].alias + '#rowspan'] = counter;
                                startIndex = k;
                                counter = 1;
                            }
                        }
                        res[startIndex][settings.groupColumns[g].alias + '#rowspan'] = counter;
                    }

                    return res;
                },

                getDefaultSettings: function () {
                    return defaultSettings;
                },

                getData: function(projectId, documentCollectionAlias, documentTemplateId) {
                    return DocumentService.queryByDocumentTemplate(projectId, documentCollectionAlias, documentTemplateId);
                }
            };
        });

})();

