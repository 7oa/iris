(function (undefined) {

    angular.module('iris_gs_segment_management_view', []);

    angular.module('iris_gs_segment_management_view').controller('ModuleSegmentConfigurationViewCtrl',
        function ($scope, $controller, $timeout, $translate, $state, $stateParams, $filter,
                  SegmentColumnsService, GlobalSettingsService, ProjectsService, WorkflowService, BuildingService) {
            angular.extend($scope, $controller('ModuleDirectoriesBaseViewCtrl', {$scope}));

            $scope.disableAddButton = true;
            $scope.items = [];
            $scope.filter = {};

            $scope.columnTypes = SegmentColumnsService.getColumnTypes();

            //$scope.projects = ProjectsService.getProjects();
            //$scope.buildings = $scope.buildings || [];

            $scope.params = angular.fromJson($stateParams.params);
            $scope.filter.projectId = ($scope.params && $scope.params.projectId) ? $scope.params.projectId : null;
            $scope.filter.buildingId = ($scope.params && $scope.params.buildingId) ? $scope.params.buildingId : null;

            //$scope.$watch('filter.projectId', function (newValue, oldValue) {
            //    $scope.items = [];
            //
            //    if ($scope.filter.projectId) {
            //        $state.go($state.current.name, {
            //            params: angular.toJson({'projectId': $scope.filter.projectId})
            //        }, {
            //            inherit: true,
            //            notify: false
            //        });
            //
            //        var params = {
            //            filter: angular.toJson([ { f:'type', v:['TUNNEL', 'STORAGE'] } ]),
            //            projectId: $scope.filter.projectId
            //        };
            //
            //        ProjectsService.getProjectBuildingsByProjectId(params).$promise.then((res) => {
            //            $scope.buildings = res;
            //            if (res.length && !$scope.filter.buildingId) $scope.filter.buildingId = res[0].id;
            //        });
            //    } else {
            //        $scope.filter.buildingId = null;
            //        $scope.buildings = [];
            //    }
            //});

            $scope.$watch('filter.buildingId', function (newValue, oldValue) {
                if ($scope.filter.buildingId) {
                    $state.go($state.current.name, {
                        params: angular.toJson({'projectId': $scope.filter.projectId, 'buildingId': $scope.filter.buildingId})
                    }, {
                        inherit: true,
                        notify: false
                    });

                    $scope.disableAddButton = false;
                    loadItems();
                }
                else {
                    $scope.disableAddButton = true;
                    $scope.items = [];
                }
            });

            WorkflowService.getAllWorkflowsByType('SEGMENT').then((res) => {
                $scope.allWorkflowStates = [];
                res.forEach(w => {
                    w.workflowStates.forEach(ws => {
                        $scope.allWorkflowStates.push(ws);
                    })
                });
            });

            function loadItems() {
                SegmentColumnsService.query($scope.filter.buildingId).then(function (items) {
                    items.sort((a, b) => a.orderIndex - b.orderIndex);

                    var order = 0;
                    items.forEach(s => s.orderIndex = order++);

                    $scope.items = items;
                });
            }

            function copyItemsFrom(buildingId) {
                return SegmentColumnsService.copyFrom($scope.filter.buildingId, buildingId);
                //return SegmentColumnsService.query(buildingId).then(function (items) {
                //    items.forEach(item => {
                //        item.id = null;
                //        item.buildingId = $scope.filter.buildingId;
                //        SegmentColumnsService.save(item);
                //    });
                //});
            }

            $scope.copyFrom = function() {
                BuildingService.selectProjectBuildingModal().then(res => {
                    if ($scope.filter.buildingId == res) return;
                    copyItemsFrom(res).then(() => loadItems());
                });
            };

            $scope.toggleDisplay = function(item) {
                item.isShown = !item.isShown;
                SegmentColumnsService.save(item);

            };

            $scope.toggleMobile = function(item) {
                item.isMobile = !item.isMobile;
                SegmentColumnsService.save(item);
            };

            $scope.addFieldsToGrid([{
                field: 'isShown',
                width: 80,
                displayName: $translate.instant('label.Display'),
                cellTemplate: `
                            <div class="ui-grid-cell-contents">
                                <button class="btn btn-link"
                                        uib-tooltip="{{'label.Toggle' | translate}}"
                                        ng-click="grid.appScope.toggleDisplay(row.entity); $event.stopPropagation();">
                                    <i class="fa"
                                       ng-class="{'fa-check text-success': row.entity.isShown,
                                                  'fa-times text-danger': !row.entity.isShown}"></i>
                                </button>
                            </div>`
            }, {
                field: 'isMobile',
                width: 80,
                displayName: $translate.instant('label.Mobile'),
                cellTemplate: `
                            <div class="ui-grid-cell-contents">
                                <button class="btn btn-link"
                                        uib-tooltip="{{'label.Toggle' | translate}}"
                                        ng-click="grid.appScope.toggleMobile(row.entity); $event.stopPropagation();">
                                    <i class="fa"
                                       ng-class="{'fa-check text-success': row.entity.isMobile,
                                                  'fa-times text-danger': !row.entity.isMobile}"></i>
                                </button>
                            </div>`
            }, {
                name: 'name',
                displayName: $translate.instant('label.Name'),
                width: '*'
            }, {
                name: 'type',
                displayName: $translate.instant('label.Type'),
                width: '*',
                cellFilter: 'IrisFilterField:[grid.appScope.columnTypes]'
            }, {
                name: 'defaultValue',
                displayName: $translate.instant('label.DefaultValue'),
                width: '*',
                cellTemplate: `
                            <div class="ui-grid-cell-contents">
                                {{grid.appScope.getDefaultValue(row.entity)}}
                            </div>`
            }, {
                name: 'importHeader',
                displayName: $translate.instant('label.segment.ImportHeader'),
                width: '*'
            }]);

            $scope.getDefaultValue = function(entity) {
                if (entity.type == "BOOLEAN" && entity.defaultValue !== undefined)
                    return entity.defaultValue == 1
                        ? (entity.trueValue ? $filter("irisTranslate")(entity.trueValue, entity.trueValueTranslations) : $translate.instant("label.True"))
                        : (entity.falseValue ? $filter("irisTranslate")(entity.falseValue, entity.falseValueTranslations) : $translate.instant("label.False"));
                if (entity.type == "WORKFLOW" && entity.defaultValue)
                    return $filter("IrisFilterField")(entity.defaultValue, [$scope.allWorkflowStates]);
                if ((entity.type == "DATE" || entity.type == "DATETIME") && entity.defaultValue)
                    return $filter("irisTime")(entity.defaultValue, this, entity.dateTimeFormat);
                return entity.defaultValue;
            };

            $scope.gridOptions.rowTemplate = `<div iris-ui-grid-row-draggable></div>`;
            $scope.gridOptions.columnDefs.filter(d => d.name == "id")[0].visible = false;
            $scope.gridOptions.onRegisterApi = function (gridApi) {
                $scope.gridOptions.gridAPI = gridApi;

                gridApi.draggableRows.on.rowDropped($scope, function (info, dropTarget) {
                    if (info.toIndex == info.fromIndex) return;
                    var shift = info.toIndex < info.fromIndex ? 1 : -1,
                        shiftBegin = Math.min(info.toIndex, info.fromIndex),
                        shiftEnd = Math.max(info.toIndex, info.fromIndex);
                    $scope.items.forEach(s => {
                        if (s.orderIndex >= shiftBegin && s.orderIndex <= shiftEnd) {
                            s.orderIndex = s.orderIndex + shift;
                            SegmentColumnsService.save(s);
                        }
                    });
                    info.draggedRowEntity.orderIndex = info.toIndex;
                    SegmentColumnsService.save(info.draggedRowEntity);
                });
            };

            $scope.openModuleSettingsModal = function (row) {
                GlobalSettingsService.openEditModuleSettings($stateParams.module, $stateParams.settings, row && row.entity ? row.entity.id : null, {
                    projectId: $scope.filter.projectId,
                    buildingId: $scope.filter.buildingId,
                    primaryIdentifierExists: !!$scope.items.filter(t => t.isPrimaryIdentificator && (!row || !row.entity || t.id != row.entity.id)).length,
                    assemblyElementExists: !!$scope.items.filter(t => t.isAssemblyElement && (!row || !row.entity || t.id != row.entity.id)).length,
                    items: $scope.items
                }).then(function () {
                    loadItems();
                });
            };

            $scope.remove = function (item) {
                alertify.confirm($translate.instant('message.DeleteItemConfirm'), function (e) {
                    if (e) {
                        SegmentColumnsService.remove($scope.filter.buildingId, item.id).then(function () {
                            alertify.success($translate.instant('message.DeleteItemSuccessful'));
                            loadItems();
                        });
                    }
                });
            };

            $timeout(() => {
                $(window).trigger('resize');
            });
        });
})();