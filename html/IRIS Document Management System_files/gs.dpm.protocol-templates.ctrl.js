(function () {
    angular.module('iris_gs_dpm').controller('ModuleDpmProtocolTemplatesCtrl',
        function ($scope, $state, $timeout, $translate, $uibModal, DpmProtocolTemplateService, ProjectsService, BuildingService) {
            var projectId = $state.params.projectId;

            $scope.protocolTemplates = [];
            $scope.filter = $state.params.filter ? angular.fromJson($state.params.filter) : {};
            let isInit = !$scope.filter.subBuildingId;

            var refreshBuildings = function () {
                if (projectId) {
                    ProjectsService.getProjectBuildingsByProjectId({
                        filter: angular.toJson([{f: 'type', v: ['TUNNEL']}]),
                        'order-by': angular.toJson([{"name": "order", "value": "desc"}]),
                        projectId: projectId,
                        'only-fields': angular.toJson(['id','name','type','parentId'])
                    }).$promise.then((res) => {
                        $scope.buildings = res;
                        if ($scope.filter.buildingId && res.map(t => t.id).indexOf($scope.filter.buildingId) < 0) {
                            $scope.filter.buildingId = null;
                        }
                        if (res.length && !$scope.filter.buildingId) $scope.filter.buildingId = res[0].id;
                        $scope.processBuildingId($scope.filter.buildingId);
                    });
                }
                else {
                    $scope.filter.buildingId = null;
                    $scope.buildings = [];
                    $scope.processBuildingId(null);
                }
            };
            refreshBuildings();

            var refreshSubBuildings = function (buildingId) {
                if (buildingId) {
                    BuildingService.query([
                        {f: 'parentId', v: [buildingId]},
                        {f: 'type', v: ["TUNNEL"]}
                    ], {
                        'only-fields': angular.toJson(['id','name','type','parentId'])
                    }).then(res => {
                        $scope.subBuildings = res;
                        if ($scope.filter.subBuildingId && res.map(t => t.id).indexOf($scope.filter.subBuildingId) < 0) {
                            $scope.filter.subBuildingId = null;
                        }
                        //if (res.length && !$scope.filter.subBuildingId) $scope.filter.subBuildingId = res[0].id;
                        $scope.processSubBuildingId($scope.filter.subBuildingId);
                    });
                }
                else {
                    $scope.filter.subBuildingId = null;
                    $scope.subBuildings = [];
                    $scope.processSubBuildingId(null);
                }
            };

            $scope.processBuildingId = function (buildingId) {
                $state.go($state.current.name, {
                    filter: buildingId ? angular.toJson({buildingId}) : null
                }, {
                    inherit: true,
                    notify: false
                });

                refreshSubBuildings(buildingId);
            };

            $scope.processSubBuildingId = function (subBuildingId) {
                $state.go($state.current.name, {
                    filter: subBuildingId ? angular.toJson({buildingId: $scope.filter.buildingId, subBuildingId}) : null
                }, {
                    inherit: true,
                    notify: false
                });

                if(!isInit) {
                    refreshProtocolTemplates();
                }
            };

            if(isInit) {
                refreshProtocolTemplates();
                isInit = false;
            }

            function setProtocolTemplates(res) {
                $scope.protocolTemplates = res;
                $scope.create();
                iris.loader.stop('.app-content');
            }

            function refreshProtocolTemplates() {
                iris.loader.start('.app-content');
                if ($scope.filter.subBuildingId) {
                    DpmProtocolTemplateService.getProtocolTemplatesByBuilding(projectId, $scope.filter.subBuildingId)
                        .then(setProtocolTemplates);
                } else {
                    let params = {
                        'only-fields': angular.toJson(['id','projectId','name','alias','code','description', 'settings', 'documentNumberAlias'])
                    };
                    DpmProtocolTemplateService.query(projectId, params)
                        .then(setProtocolTemplates);
                }
            }

            $scope.create = function () {
                $scope.gridOptions && $scope.gridOptions.gridAPI && $scope.gridOptions.gridAPI.selection.clearSelectedRows();
                $scope.protocolTemplate = DpmProtocolTemplateService.create({projectId});
            };
            $scope.create();

            $scope.save = function () {
                DpmProtocolTemplateService.save($scope.protocolTemplate).then(() => {
                    alertify.success($translate.instant('label.SavedSuccessfully'));
                    refreshProtocolTemplates();
                });
            };

            $scope.remove = function (item) {
                alertify.confirm($translate.instant('message.DeleteItemConfirm'), function (e) {
                    if (e) {
                        DpmProtocolTemplateService.remove(item).then(() => {
                            alertify.success($translate.instant('message.DeleteItemSuccessful'));
                            refreshProtocolTemplates();
                        });
                    }
                });
            };

            $scope.copyStructureTo = function (item) {
                $uibModal.open({
                    templateUrl: `${iris.config.componentsUrl}/global-settings/templates/dpm/ms.dpm.protocol-templates.copy.modal.html`,
                    size: 'md',
                    resolve: {
                        'sourceProtocolTemplate': () => item,
                        'protocolTemplates': () => $scope.protocolTemplates,
                        'protocolTemplatesFilter': () => angular.extend({}, $scope.filter, {projectId: projectId}),
                        'projects': () => $scope.projects
                    },
                    controller: 'ModuleDpmProtocolTemplatesCopyModalCtrl'
                }).result.then(() => {
                    alertify.success($translate.instant('message.dpm.CopyStructureSuccessful'));
                    refreshProtocolTemplates();
                });
            };

            $scope.assignProtocolToBuilding = function (item) {
                $uibModal.open({
                    templateUrl: `${iris.config.componentsUrl}/global-settings/templates/dpm/ms.dpm.protocol-templates.building.modal.html`,
                    size: 'md',
                    resolve: {
                        'protocolTemplate': () => item,
                        'protocolTemplatesFilter': () => angular.extend({}, $scope.filter, {projectId: projectId}),
                        'projects': () => $scope.projects,
                        'buildings': () => ProjectsService.getProjectBuildingsByProjectId({
                            filter: angular.toJson([{f: 'type', v: ['TUNNEL']}]),
                            'order-by': angular.toJson([{"name": "order", "value": "desc"}]),
                            projectId: projectId,
                            levels: angular.toJson([0, 1])
                        }).$promise
                    },
                    controller: 'ModuleDpmProtocolTemplatesBuildingModalCtrl'
                }).result.then(() => {
                    refreshProtocolTemplates();
                });
            };

            $scope.assignProtocolsToBuildingsCommon = function (item) {
                var modalInstance = $uibModal.open({
                    templateUrl: `${iris.config.componentsUrl}/global-settings/templates/dpm/ms.dpm.protocol-templates.buildings.modal.html`,
                    size: 'lg',
                    resolve: {
                        'protocolTemplates': () => DpmProtocolTemplateService.query(projectId),
                        'buildings': () => ProjectsService.getProjectBuildingsByProjectId({
                            filter: angular.toJson([{f: 'type', v: ['TUNNEL']}]),
                            'order-by': angular.toJson([{"name": "order", "value": "desc"}]),
                            projectId: projectId,
                            levels: angular.toJson([0, 1])
                        }).$promise
                    },
                    controller: 'ModuleDpmProtocolTemplatesBuildingsModalCtrl'
                });

                modalInstance.result.then(() => {
                    refreshProtocolTemplates();
                });

                modalInstance.rendered.then(() => {
                    $(document).ready(() => {
                        var th = $('.modal-footer').offset().top - $('.fixed-header-tbody').offset().top;
                        if (th < 200) {
                            th = 200;
                        }
                        $('.fixed-header-tbody').css('height', th + 'px');
                    });
                });
            };

            $scope.gridOptions = {
                data: 'protocolTemplates',
                enableFullRowSelection: true,
                enableSelectAll: false,
                selectionRowHeaderWidth: 35,
                multiSelect: false,
                columnDefs: [
                    {
                        field: 'name',
                        width: '*',
                        displayName: $translate.instant('label.Name'),
                        cellFilter: `irisTranslate : row.entity.translations.name`
                    },
                    {
                        field: 'code',
                        width: '100',
                        displayName: $translate.instant('label.Code')
                    },
                    {
                        field: 'description',
                        width: '*',
                        displayName: $translate.instant('label.Description')
                    },
                    {
                        name: 'actions',
                        displayName: $translate.instant('label.Actions'),
                        width: 230,
                        enableSorting: false,
                        cellTemplate: `
                        <div class="ui-grid-cell-contents actions">
                            <a ui-sref="module.dpm.protocol-templates.header({protocolTemplateId: row.entity.id})"
                               uib-tooltip="{{::'label.dpm.GoToHeaderStructure' | translate}}"
                               ng-click="$event.stopPropagation();"
                               class="btn btn-link">
                                <i class="fa fa-header"></i>
                            </a>
                            <a ui-sref="module.dpm.protocol-templates.body({protocolTemplateId: row.entity.id})"
                               uib-tooltip="{{::'label.dpm.GoToBodyStructure' | translate}}"
                               ng-click="$event.stopPropagation();"
                               class="btn btn-link">
                                <i class="fa fa-bold"></i>
                            </a>
                            <button class="btn btn-link"
                                    uib-tooltip="{{'label.dpm.CopyStructureTo' | translate}}"
                                    ng-click="grid.appScope.copyStructureTo(row.entity); $event.stopPropagation();">
                                <i class="fa fa-clone"></i>
                            </button>
                            <button class="btn btn-link"
                                    uib-tooltip="{{'label.dpm.AssignToBuilding' | translate}}"
                                    ng-click="grid.appScope.assignProtocolToBuilding(row.entity); $event.stopPropagation();">
                                <i class="fa fa-cubes"></i>
                            </button>
                            <button class="btn btn-link"
                                    uib-tooltip="{{'label.Remove' | translate}}"
                                    ng-click="grid.appScope.remove(row.entity); $event.stopPropagation();">
                                <i class="fa fa-trash-o"></i>
                            </button>
                        </div>`
                    }
                ],
                onRegisterApi: function (gridApi) {
                    $scope.gridOptions.gridAPI = gridApi;

                    gridApi.selection && gridApi.selection.on.rowSelectionChanged($scope, function (row, event) {
                        if ($scope.protocolTemplate.id == row.entity.id) {
                            $scope.create();
                        } else {
                            $scope.protocolTemplate = angular.copy(row.entity);
                        }
                    });
                }
            };
        });
})();
