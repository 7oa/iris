(function () {

    angular.module('iris_gs_segment_management_edit', []);

    angular.module('iris_gs_segment_management_edit').controller('ModuleSegmentConfigurationEditCtrl',
        function ($scope, $controller, $translate, params, $uibModalInstance, $filter, WorkflowService, IrisTimeService, SegmentColumnsService) {
            $scope.columnTypes = SegmentColumnsService.getColumnTypes();
            $scope.dateFormats = IrisTimeService.getDateFormats();
            $scope.dateTimeFormats = IrisTimeService.getDateTimeFormats();
            $scope.booleanDefaultValues = [{
                id: 1, name: $translate.instant("label.True")
            }, {
                id: 0, name: $translate.instant("label.False")
            }];

            $scope.item = {};
            $scope.workflows = [];
            $scope.workflowStates = [];

            function refreshWorkflowStates(workflowId, withHeaders) {
                if (workflowId) {
                    var workflow = $scope.workflows.filter(w => w.id == workflowId);
                    $scope.workflowStates = workflow.length ? workflow[0].workflowStates : [];
                } else {
                    $scope.workflowStates = [];
                }

                if ($scope.item.type == "WORKFLOW" && withHeaders) $scope.item.headers = $scope.workflowStates.map((s) => {
                    return {workflowStateId: s.id, column: $filter("IrisFilterField")(workflowId, [$scope.workflows]) + "_" + s.name};
                });
            }

            WorkflowService.getAllWorkflowsByType('SEGMENT').then((res) => {
                $scope.workflows = res;
                refreshWorkflowStates($scope.item.workflowId);
            });

            $scope.$watch("item.workflowId", function(nv, ov) {
                if (angular.equals(nv, ov)) return;
                refreshWorkflowStates(nv, nv && ov);
            });

            $scope.isNew = !params.object_id;
            $scope.primaryIdentifierExists = params.data.primaryIdentifierExists;
            $scope.assemblyElementExists = params.data.assemblyElementExists;

            $scope.typeTemplatesUrl = iris.config.componentsUrl + "/global-settings/templates/segment-management/";

            $scope.mapToEntries = function(item) {
                item.entriesMap || (item.entriesMap = []);
                item.entries = item.entriesMap.map(e => { return { value: e }; });
                return item;
            };

            function mapToApi(item) {
                var res = $scope.mapToEntries(item);

                if (res.type == "DATE")
                    res.dateTimeFormat && (res.dateTimeFormat = $filter("IrisFilterField")(res.dateTimeFormat, [$scope.dateFormats, "defaultJavaFormatString"]));
                if (res.type == "DATETIME" || res.type == "WORKFLOW")
                    res.dateTimeFormat && (res.dateTimeFormat = $filter("IrisFilterField")(res.dateTimeFormat, [$scope.dateTimeFormats, "defaultJavaFormatString"]));

                if (!res.defaultValue) res.defaultValue = null;
                return res;
            };

            function mapFromApi(item) {
                item.entries || (item.entries = []);
                item.entriesMap = item.entries.map(e => e.value);
                return item;
            };

            if ($scope.isNew) {
                $scope.item = mapFromApi(SegmentColumnsService.create({
                    projectId: params.data.projectId,
                    buildingId: params.data.buildingId,
                    type: "TEXT",
                    decimals: 0,
                    orderIndex: params.data.items.length
                }));
            } else {
                SegmentColumnsService.get(params.data.buildingId, params.object_id).then((res) => {
                    $scope.item = mapFromApi(res);
                });
            }

            $scope.typeChange = function() {
                $scope.item.defaultValue = null;
                $scope.item.workflowStateId = null;
                if ($scope.item.type == "DATE") $scope.item.dateTimeFormat = iris.config.me.profile.dateFormatId;
                if ($scope.item.type == "DATETIME" || $scope.item.type == "WORKFLOW") $scope.item.dateTimeFormat = iris.config.me.profile.dateTimeFormatId;
            };

            $scope.save = function() {
                SegmentColumnsService.save(mapToApi($scope.item)).then(function (res) {
                    alertify.success($translate.instant('label.SavedSuccessfully'));
                    $uibModalInstance.close(value);
                });
            };
        });
})();