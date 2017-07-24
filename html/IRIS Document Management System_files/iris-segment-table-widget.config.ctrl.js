(function () {
    var module = angular.module('irisSegmentTableWidget');
    module.controller('SegmentTableWidgetConfigCtrl', function ($scope, $translate, $filter, ProjectsService, SegmentColumnsService, IrisSegmentTableWidgetService) {
        $scope.tabs = [{
            alias: 'ViewOptions', // for form validation
            title: $translate.instant('label.ViewOptions'),
            contentUrl: iris.config.widgetsUrl + '/iris-segment-table-widget/templates/iris-segment-table-widget.tabs.config.html'
        }];

        $scope.buildings = [];
        function reloadBuildings(setDefault) {
            if ($scope.widget.projectId) {
                var params = {
                    filter: angular.toJson([ { f:'type', v:['TUNNEL'] } ]),
                    projectId: $scope.widget.projectId
                };

                ProjectsService.getProjectBuildingsByProjectId(params).$promise.then((res) => {
                    $scope.buildings = res;
                    if (setDefault && res.length) $scope.widget.settings.buildingId = $scope.buildings[0].id;
                });
            } else {
                $scope.buildings = [];
                $scope.widget.settings.buildingId = null;
            }
        }
        reloadBuildings();

        $scope.$watch("widget.projectId", function(nv, ov) {
            if (angular.equals(nv, ov)) return;
            reloadBuildings(true);
        });

        function getAttribute(attributeId) {
            var attribute = $scope.segmentAttributes.filter(s => s.id == attributeId);
            return attribute.length ? attribute[0] : null;
        }

        $scope.segmentAttributes = [];
        function reloadSegmentAttributes() {
            if ($scope.widget.settings.buildingId) {
                SegmentColumnsService.query($scope.widget.settings.buildingId).then((res) => {
                    $scope.segmentAttributes = res.sort((a, b) => a.orderIndex - b.orderIndex);
                    if (res && res.length) {
                        if (!$scope.widget.settings.columns.length) {
                            var primaryIdentifier = res.filter(r => r.isPrimaryIdentifier);
                            if (primaryIdentifier && primaryIdentifier.length) {
                                $scope.widget.settings.columns.push({ attributeId: primaryIdentifier[0].id });
                                $scope.initColumn($scope.widget.settings.columns.length - 1, true);
                                var i = 0;
                                while ($scope.widget.settings.columns.length == 1 && i < res.length) {
                                    if (res[i].id != primaryIdentifier[0].id) {
                                        $scope.widget.settings.columns.push({attributeId: res[i].id});
                                        $scope.initColumn($scope.widget.settings.columns.length - 1, true);
                                    }
                                    i = i + 1;
                                }
                            } else {
                                $scope.widget.settings.columns.push({ attributeId: res[0].id });
                                $scope.initColumn($scope.widget.settings.columns.length - 1, true);
                                if (res.length > 1) {
                                    $scope.widget.settings.columns.push({ attributeId: res[1].id });
                                    $scope.initColumn($scope.widget.settings.columns.length - 1, true);
                                }
                            }
                        }

                        $scope.widget.settings.columns.forEach(column => {
                            column.attribute = getAttribute(column.attributeId);
                        });
                        IrisSegmentTableWidgetService.refreshDemoData(res);
                    }
                });
            } else {
                $scope.segmentAttributes = [];
                IrisSegmentTableWidgetService.refreshDemoData([]);
            }
        }
        reloadSegmentAttributes();

        $scope.$watch("widget.settings.buildingId", function(nv, ov) {
            if (angular.equals(nv, ov)) return;
            reloadSegmentAttributes();
        });

        $scope.addColumn = function() {
            if ($scope.widget.settings.columns.length >= $scope.segmentAttributes.length) return;

            $scope.widget.settings.columns.push({
                attributeId: $scope.segmentAttributes[Math.min($scope.widget.settings.columns.length, $scope.segmentAttributes.length - 1)].id
            });
            $scope.initColumn($scope.widget.settings.columns.length - 1);
        };

        $scope.removeColumn = function(colIndex) {
            if ($scope.widget.settings.columns.length <= 1) return;
            $scope.widget.settings.columns.splice(colIndex, 1);
        };

        $scope.initColumn = function(colIndex, noDataUpdate)
        {
            var column = $scope.widget.settings.columns[colIndex];
            column.caption = $filter("IrisFilterField")(column.attributeId, [$scope.segmentAttributes, "name"]);
            column.captionTranslations = {};
            column.attribute = getAttribute(column.attributeId);
            if (!noDataUpdate) IrisSegmentTableWidgetService.refreshDemoData($scope.segmentAttributes);
        };

        $scope.sortableOptions = {
            handle: '.drag-target'
        };
    });
})();