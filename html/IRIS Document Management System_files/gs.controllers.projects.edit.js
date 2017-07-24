(function () {

    angular.module('iris_gs_projects_edit', []);

    angular.module('iris_gs_projects_edit').controller('ModuleProjectsEditCtrl',
        function ($scope, $controller, $translate, $filter, $timeout, $q, params, $uibModalInstance, ProjectsService, CompaniesService, SecurityService, UserGroupsService, WorkflowService, CountriesService) {
            if (!params.object_id) {
                var project = {};
                var parentProject = params.data && params.data.parentProject ? params.data.parentProject : null;
                if (parentProject) {
                    parentProject.settings = parentProject.settings || {};
                    angular.extend(project,{
                        projectId: parentProject.id,
                        timeZone: parentProject.timeZone,
                        companyId: parentProject.companyId,
                        from: parentProject.from,
                        to: parentProject.to,
                        settings: {
                            color: parentProject.settings.color
                        }
                    });
                }
                $scope.project = ProjectsService.createProject(project);
            }
            else {

                var projectInStore = ProjectsService.getById(params.object_id);

                // To avoid dirty objects on 'cancel'-operation,
                // load the object from server, that we want to
                // put on workbench.

                ProjectsService.loadById(params.object_id).then(function (project) {
                    project.$$treeLevel = projectInStore.$$treeLevel;
                    $scope.project = project;
                    $scope.parentProject = $scope.project ? ProjectsService.getById($scope.project.projectId) : null;

                    console.log($scope.project);
                });
            }

            $scope.projectId = params.object_id;
            $scope.isNew = !$scope.projectId;

            $scope.forms = {};
            $scope.tabs = {};

            function setActiveTab(tab) {
                $scope.tabs.active = tab;
            }

            $scope.tabSelect = function() {
                $timeout(() => iris.grid.fixWidth($scope.userGroupsGridOptions.gridAPI), 50);
            };

            $scope.selectableCompanies = [];

            $scope.selectableWorkflows = [];

            $scope.selectableCountries = [];

            $scope.selectableTimeZones = iris.Time.GetAllTimeZoneNames().map(function (s) {
                return {value: s, label: s.replace(/\_/g, ' ')};
            });

            $scope.selectableTypes = [{
                value: "tunnel",
                label: "label.Tunnel"
            }, {
                value: "geomonitoring",
                label: "label.Geomonitoring"
            }, {
                value: "driftmining",
                label: "label.Driftmining"
            }];

            $scope.selectableTunnelTypes = [{
                value: "macro",
                label: "label.TunnelType.macro"
            }, {
                value: "segmentalLining",
                label: "label.TunnelType.segmentalLining"
            }, {
                value: "cutAndCover",
                label: "label.TunnelType.cutConver"
            }, {
                value: "natm",
                label: "label.TunnelType.natm"
            }];

            CompaniesService.getCompanies().$promise.then(function (companies) {
                $scope.selectableCompanies = companies;
            });

            WorkflowService.getAllWorkflowsByType('PROJECT').then(workflows => {
                $scope.selectableWorkflows = workflows;
                console.log('workflows', workflows);
            });

            CountriesService.query().then(countries => {
                $scope.selectableCountries = countries;
                console.log('countries', countries);
            });

            $scope.addWorkflowState = function(workflowId) {
                $scope.project.workflowStateId = null;

/*                if (workflowId) {
                    WorkflowService.getWorkflowStates(workflowId).then(states => {
                        console.log('states', states);
                        if (states && states.length) {
                            var startState = $filter('filter')(states, {type:'START'})[0];
                            console.log('start state', startState);
                            $scope.project.workflowStateId = startState.id;
                        } else {
                            $scope.project.workflowStateId = null;
                        }
                    });
                } else {
                    $scope.project.workflowStateId = null;
                }*/
            };

            $scope.save = function () {
                if (!$scope.hasAnyPermission()) {
                    setActiveTab('UserGroups');
                    alertify.error($translate.instant('message.config.NoUserGroupPermissions'));
                    return;
                }

                ProjectsService.saveProject($scope.project).then(function(project) {
                    if ($scope.isNew) {
                        $scope.projectId = project.id;
                        $scope.isNew = false;

                        var realGroups = UserGroupsService.getUserGroups(),
                            promises = [];

                        $scope.userGroups.forEach(g => {
                            var realGroup = realGroups.find(rg => rg.id == g.id),
                                addPermissions = [];
                            if (!realGroup) return;
                            ['read', 'update'].forEach(a => {
                                if (g[a] && g[a].allowed) {
                                    addPermissions.push(setPermission(realGroup, a, true));
                                }
                            });
                            addPermissions.length && promises.push(UserGroupsService.addPermissionsToUserGroup(realGroup.id, addPermissions).then(pRes => {
                                realGroup.permissions = pRes.permissions;
                            }));
                        });

                        $q.all(promises).then(() => {
                            alertify.success($translate.instant('label.ProjectSaved'));
                            $uibModalInstance.close($scope.project);
                        });
                    } else {
                        alertify.success($translate.instant('label.ProjectSaved'));
                        $uibModalInstance.close($scope.project);
                    }
                });
            };

            $scope.processName = function() {
                if ($scope.project.code) return;

                $timeout(() => {
                    var pattern = /([A-Z]|[0-9]+|\s[a-z]|^[a-z])/g,
                        parts = $scope.project.name.match(pattern),
                        res = '';
                    if (!parts || !parts.length || parts.length == 1) {
                        res = ($scope.project.name || '').trim().toUpperCase();
                    } else {
                        parts.forEach(p => res += p.trim().toUpperCase());
                    }
                    $scope.project.code = res;
                });
            };

            $scope.userGroups = $scope.isNew
                ? UserGroupsService.getUserGroups().map(g => angular.copy(g))
                : UserGroupsService.getUserGroups();

            $scope.userCanChangePermission = function (userGroup, action) {
                return true;
            };

            $scope.hasAnyPermission = function() {
                if ($scope.isNew) {
                    for (let i = 0; i < $scope.userGroups.length; i++) {
                        if (($scope.userGroups[i]['read'] && $scope.userGroups[i]['read'].allowed)
                            || ($scope.userGroups[i]['update'] && $scope.userGroups[i]['update'].allowed))
                            return true;
                    }
                    return false;
                } else {
                    return true;
                }
            };

            function getPermission(userGroup, action) {
                return $scope.isNew ? userGroup[action] : UserGroupsService.getUserGroupPermissionForSubjectAndAction(userGroup, $scope.projectId, 'Project', action);
            }

            function createPermission(action, allowed) {
                return $scope.isNew ? {allowed: allowed} : SecurityService.createPermission('Project', $scope.projectId, action, allowed);
            }

            $scope.hasPermission = function (userGroup, action) {
                var permission = getPermission(userGroup, action);
                return permission ? permission.allowed : false;
            };

            function setPermission(userGroup, action, allowed) {
                var permission = getPermission(userGroup, action);
                if (permission) {
                    permission.allowed = allowed;
                } else {
                    permission = createPermission(action, allowed);
                    if ($scope.isNew) {
                        userGroup[action] = permission;
                    } else {
                        userGroup.permissions.push(permission);
                    }
                }
                return permission;
            }

            $scope.togglePermission = function (userGroup, action) {
                var permission = setPermission(userGroup, action, !$scope.hasPermission(userGroup, action));

                if (action == 'read' && !permission.allowed) {
                    setPermission(userGroup, 'update', false);
                } else if (action == 'update' && permission.allowed) {
                    setPermission(userGroup, 'read', true);
                }
            };

            $scope.userGroupsGridOptions = {
                data: 'userGroups',

                enableSorting: true,
                enableFiltering: true,
                enableVerticalScrollbar: true,

                onRegisterApi(gridApi) {
                    $scope.userGroupsGridOptions.gridAPI = gridApi;
                },

                columnDefs: [
                    {
                        field: 'name',
                        displayName: $translate.instant('label.GroupName'),
                        width: '*'
                    }, {
                        name: 'read',
                        displayName: $translate.instant('label.Read.present'),
                        enableSorting: false,
                        enableFiltering: false,
                        width: '*',
                        cellTemplate: `
                            <div class="ui-grid-cell-contents">
                                <button class="btn btn-link disabled-visible"
                                        ng-disabled="!grid.appScope.userCanChangePermission(row.entity, 'read')"
                                        ng-click="grid.appScope.togglePermission(row.entity, 'read')">
                                    <i class="fa" ng-class="grid.appScope.hasPermission(row.entity, 'read') ? 'fa-check' : 'fa-square-o'"/>
                                </button>
                            </div>`
                    }, {
                        name: 'edit',
                        displayName: $translate.instant('label.Edit'),
                        enableSorting: false,
                        enableFiltering: false,
                        width: '*',
                        cellTemplate: `
                            <div class="ui-grid-cell-contents">
                                <button class="btn btn-link disabled-visible"
                                        ng-disabled="!grid.appScope.userCanChangePermission(row.entity, 'update')"
                                        ng-click="grid.appScope.togglePermission(row.entity, 'update')">
                                    <i class="fa" ng-class="grid.appScope.hasPermission(row.entity, 'update') ? 'fa-check' : 'fa-square-o'"/>
                                </button>
                            </div>`
                    }
                ]
            };
        });

    angular.module('iris_gs_projects_edit').controller('ModuleProjectDevicesEditCtrl',
        function ($scope, $controller, $translate, params, uiGridConstants, $uibModalInstance, ProjectsService, DevicesService, SecurityService) {

            $scope.project = params.data && params.data.project ? params.data.project : null;

            $scope.selectableDevices = [];
            $scope.hasPermissionToAddProjectDevices = false;

                /* selectable devices with update-permissions */
            DevicesService.getDevices().$promise.then(devices => {
                devices.forEach(d => {
                    if (SecurityService.hasPermissions(d.id, 'Device', 'update')) {
                        $scope.selectableDevices.push(d)
                    }
                });
                $scope.hasPermissionToAddProjectDevices = SecurityService.hasPermissions($scope.project.id, 'Project', 'update') && $scope.selectableDevices.length > 0;
            });

            $scope.items = ProjectsService.getProjectDevicesByProjectId($scope.project.id);

            $scope.hasPermissionToRemoveProjectDevice = function (item) {
                return SecurityService.hasPermissions(item.projectId, 'Project', 'update')
                    && SecurityService.hasPermissions(item.deviceId, 'Device', 'update');
            }

            function setupNewProjectDevice() {
                $scope.projectDevice = ProjectsService.createProjectDevice({
                    projectId: $scope.project.id,
                    from: $scope.project.from,
                    until: $scope.project.to
                });
            }

            setupNewProjectDevice();

            $scope.isProjectDeviceDatesValid = function () {
                var pd = $scope.projectDevice;
                return !pd.until || !pd.from || new Date(pd.from).getTime() <= new Date(pd.until).getTime();
            };

            $scope.save = function () {

                if (!$scope.projectDevice)
                    return;

                if (!$scope.projectDevice.deviceId)
                    return;

                ProjectsService.saveProjectDevice($scope.projectDevice).then(function (o) {
                    setupNewProjectDevice();
                });
            };

            $scope.gridOptions = {
                data: 'items',
                enablePaginationControls: false,
                paginationPageSize: 10,
                showGridFooter: true,
                sortInfo: {
                    fields: ["from"], directions: [uiGridConstants.DESC]
                },
                columnDefs: [
                    {
                        name: 'id',
                        width: 40
                    },
                    {
                        name: 'device',
                        displayName: $translate.instant('label.Device'),
                        cellTemplate: `
                            <div class="ui-grid-cell-contents">
                                {{row.entity.deviceId | IrisFilterField:[grid.appScope.selectableDevices,"name"]}}
                            </div>`
                    }, {
                        name: 'from',
                        displayName: $translate.instant('label.From'),
                        cellTemplate: `
                            <div class="ui-grid-cell-contents">
                                <iris-time-object-output value="row.entity.from" format="'DD.MM.YYYY HH:mm:ss'" zone="grid.appScope.project.timeZone"></iris-time-object-output>
                            </div>`
                    }, {
                        name: 'until',
                        displayName: $translate.instant('label.range.To'),
                        cellTemplate: `
                            <div class="ui-grid-cell-contents">
                                <iris-time-object-output value="row.entity.until" format="'DD.MM.YYYY HH:mm:ss'" zone="grid.appScope.project.timeZone"></iris-time-object-output>
                            </div>`
                    }, {
                        name: 'actions',
                        width: 60,
                        enableFiltering: false,
                        displayName: $translate.instant('label.Actions'),
                        enableSorting: false,
                        cellTemplate: `
                            <div class="action-bar">
                                <button ng-if="grid.appScope.hasPermissionToRemoveProjectDevice(row.entity)" ng-click="grid.appScope.remove(row.entity)" 
                                        class="btn btn-danger" uib-tooltip="{{'label.Remove' | translate}}">
                                    <i class="fa fa-trash-o"></i>
                                </button>
                            </div>`
                    }
                ],
                rowTemplate: `
                            <div ng-dblclick="grid.appScope.onDblClick(row)" ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name" 
                                 class="ui-grid-cell" ng-class="{ 'ui-grid-row-header-cell': col.isRowHeader }"
                                 ui-grid-cell>                 
                            </div>`,
                onRegisterApi: function (gridApi) {
                    $scope.gridApi = gridApi;
                    $scope.gridOptions.gridAPI = gridApi;
                }
            };

            $scope.remove = function (projectDevice) {
                alertify.confirm($translate.instant('message.DeleteItemConfirm'), function (e) {
                    if (e) {
                        iris.loader.start();
                        ProjectsService.removeProjectDevice(projectDevice).then(function (result) {
                            iris.loader.stop();
                            alertify.success($translate.instant('message.DeleteItemSuccessful'));
                        });
                    }
                });
            };

        });

    angular.module('iris_gs_projects_edit').controller('ModuleProjectBuildingsEditCtrl',
        function ($scope, $translate, params, ProjectsService, BuildingService) {
            $scope.selectedList = [];
            $scope.fullList = [];
            $scope.availableList = [];
            $scope.project = params.data && params.data.project ? params.data.project : null;

            var filter = [{f:'type', v:['TUNNEL', 'STORAGE']}];
            var params = {
                filter: angular.toJson(filter),
                levels:angular.toJson([0,1])
            };

            BuildingService.query(filter).then(buildings =>  {
                $scope.fullList = buildings;
                refresh();
            });

            function create() {
                $scope.projectBuilding = ProjectsService.createProjectBuilding({
                    projectId: $scope.project.id
                });
            }

            function refresh() {
                params.projectId = $scope.project.id;

                ProjectsService.getProjectBuildingsByProjectId(params).$promise.then(res => {
                    $scope.selectedList = res;
                    var selectedIds = $scope.selectedList.map(t => t.id);
                    $scope.availableList = $scope.fullList.filter(t => selectedIds.indexOf(t.id) < 0);
                    create();
                });
            }

            $scope.save = function () {
                if (!$scope.projectBuilding || !$scope.projectBuilding.id) return;
                ProjectsService.saveProjectBuilding($scope.projectBuilding).then(() => {
                    refresh();
                });
            };

            $scope.remove = function (item) {
                if (item.id == $scope.project.mainBuildingId) return;

                alertify.confirm($translate.instant('message.DeleteItemConfirm'), function (e) {
                    if (e) {
                        iris.loader.start();
                        ProjectsService.removeProjectBuilding(item, $scope.project.id).then(() => {
                            iris.loader.stop();
                            refresh();
                            alertify.success($translate.instant('message.DeleteItemSuccessful'));
                        });
                    }
                });
            };

            $scope.gridOptions = {
                data: 'selectedList',
                enablePaginationControls: false,
                paginationPageSize: 10,
                showGridFooter: true,
                columnDefs: [
                    {
                        name: 'building',
                        displayName: $translate.instant('label.Building'),
                        cellTemplate: `
                            <div class="ui-grid-cell-contents">
                                {{row.entity.id | IrisFilterField:[grid.appScope.fullList,"name"]}}
                            </div>`
                    },
                    {
                        name: 'actions',
                        width: 60,
                        enableFiltering: false,
                        displayName: $translate.instant('label.Actions'),
                        enableSorting: false,
                        cellTemplate: `
                            <div class="ui-grid-cell-contents">
                                <button class="btn btn-danger"
                                        ng-if="row.entity.id != grid.appScope.project.mainBuildingId"
                                        ng-click="grid.appScope.remove(row.entity)" 
                                        uib-tooltip="{{'label.Remove' | translate}}">
                                    <i class="fa fa-trash-o"></i>
                                </button>
                            </div>`
                    }
                ],
                rowTemplate: "<div ng-dblclick=\"grid.appScope.onDblClick(row)\" ng-repeat=\"(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name\" class=\"ui-grid-cell\" ng-class=\"{ 'ui-grid-row-header-cell': col.isRowHeader }\" ui-grid-cell ></div>",
                onRegisterApi: function (gridApi) {
                    $scope.gridApi = gridApi;
                    $scope.gridOptions.gridAPI = gridApi;
                }
            };
        });

})();