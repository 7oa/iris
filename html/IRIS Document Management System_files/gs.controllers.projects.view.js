(function () {

    angular.module('iris_gs_projects_view', []);

    angular.module('iris_gs_projects_view').controller('ModuleProjectsViewCtrl',
        function ($scope, $controller, $translate, $stateParams, uiGridConstants, $timeout, ProjectsService, CompaniesService, GlobalSettingsService) {

            var projectList = ProjectsService.getProjects();

            $scope.projectList = projectList;
            $scope.items = [];

            $scope.companies = [];
            CompaniesService.getCompanies().$promise.then(function (companies) {
                $scope.companies = companies;
            });

            function prepareItems(projects, currentLevel) {

                if (!projects)
                    projects = projectList.filter(function (o) {
                        return !o.projectId;
                    });
                else
                    projects = projects.slice();

                projects.sort(function (o1, o2) {

                    var uFromTStamp1 = new Date(o1.from).valueOf();
                    var uFromTStamp2 = new Date(o2.from).valueOf();

                    return uFromTStamp1 > uFromTStamp2 ? -1 : +1;
                });

                currentLevel = currentLevel > 0 ? +currentLevel : 0;

                if (!currentLevel)
                    $scope.items.splice(0, $scope.items.length);

                for (var i = 0; i < projects.length; i++) {

                    var project = projects[i];

                    if (!project)
                        continue;

                    project = projectList.filter(function (o) {
                        return o.id == project.id;
                    })[0];

                    if (!project)
                        continue;

                    project.$$treeLevel = currentLevel;

                    $scope.items.push(project);

                    var childProjects = projectList.filter(function (o) {
                        return o.projectId == project.id;
                    });

                    if (childProjects.length)
                        arguments.callee.apply(this, [childProjects, currentLevel + 1]);
                }
            }

            projectList.$promise.then(function (projects) {

                prepareItems();

                $scope.$watchCollection("projectList", function (oldList, newList) {
                    prepareItems();
                });
            });

            angular.extend($scope, $controller('ModuleDirectoriesBaseViewCtrl', {$scope: $scope}));

            $scope.gridOptions.columnDefs.filter(function(o){return o.name == "actions";})[0].width = 250;
            angular.extend($scope.gridRowActions, {
                add: {
                    order: 1,
                    template: `
                        <a href="javascript:void(0)" 
                           ng-if="grid.appScope.hasPermissionToAdd"
                           ng-click="grid.appScope.openAddProjectModal(row.entity)" 
                           class="btn btn-default" 
                           title="{{::'label.AddSubproject' | translate}}">
                            <i class="fa fa-plus"></i>
                        </a>`
                },
                devices: {
                    order: 2,
                    template: `
                        <a href="javascript:void(0)" 
                           ng-click="grid.appScope.openDevicesAssignemtsModal(row.entity)" 
                           class="btn btn-default" 
                           title="{{::'label.Devices' | translate}}" id="setDevice">
                            <i class="fa fa-train"></i>
                        </a>`
                },
                buildings: {
                    order: 3,
                    template: `
                        <a href="javascript:void(0)"
                           ng-click="grid.appScope.openBuildingsAssignemtsModal(row.entity)"
                           class="btn btn-default"
                           title="{{::'label.Buildings' | translate}}">
                            <i class="fa fa-cubes"></i>
                        </a>`
                }
            });

            $scope.updateGridRowActions();

            $scope.openAddProjectModal = function (parentProject) {
                var data = {parentProject};

                GlobalSettingsService.openEditModuleSettings($stateParams.module, $stateParams.settings, null, data).then(function (result) {
                    prepareItems();
                });
            };

            $scope.openDevicesAssignemtsModal = function (project) {
                var data = {project};

                GlobalSettingsService.openEditModuleSettings($stateParams.module, "project-devices", null, data, 'lg').then(function (result) {
                });
            };

            $scope.openBuildingsAssignemtsModal = function (project) {
                var data = {project};

                GlobalSettingsService.openEditModuleSettings($stateParams.module, "project-buildings", null, data, 'lg').then(function (result) {
                });
            };

            $scope.openModuleSettingsModal = function (row) {
                var objectId = row && row.entity ? row.entity.id : null;

                var data = {parentProject: null};

                return GlobalSettingsService.openEditModuleSettings($stateParams.module, $stateParams.settings, objectId, data);
            };

            angular.extend($scope.gridOptions, {
                showTreeExpandNoChildren: false,
                groupsCollapsedByDefault: false,
                gridFooterTemplate: '',
                showGridFooter: false,
                paginationPageSize: 1000000,
                onRegisterApi: function (gridApi) {
                    $scope.gridOptions.gridAPI = gridApi;
                }
            });

            //<iris-time-object-output value="row.entity.from" format="\'DD.MM.YYYY HH:mm:ss\'" zone="row.entity.timezone"></iris-time-object-output>
            var table_fields = [{
                name: 'name',
                displayName: $translate.instant('label.Name'),
                cellTemplate: `
                        <div class="ui-grid-cell-contents treelevel-{{row.entity.$$treeLevel}}">
                            <i class="fa fa-fw" 
                               ng-class="row.entity.settings.type.__value == 'tunnel' ? 'fa-cubes' : 'fa-briefcase'" 
                               ng-style="{'color':row.entity.settings.color || '#000000'}"></i>
                            {{row.entity.name}} 
                        </div>`,
                width: '*'
            }, {
                name: 'code',
                displayName: $translate.instant('label.Code'),
                width: '*'
            }, {
                name: 'companyId',
                displayName: $translate.instant('label.Company'),
                cellTemplate: `
                        <div class="ui-grid-cell-contents">
                            {{row.entity.companyId | IrisFilterField:[grid.appScope.companies]}}
                        </div>`,
                width: '*'
            }, {
                name: 'from',
                displayName: $translate.instant('label.From'),
                cellTemplate: `
                        <div class="ui-grid-cell-contents">
                            <iris-time-object-output value="row.entity.from" format="'DD.MM.YYYY HH:mm:ss'" zone="row.entity.timeZone"></iris-time-object-output>
                        </div>`,
                width: 120
            }, {
                name: 'to',
                displayName: $translate.instant('label.range.To'),
                cellTemplate: `
                        <div class="ui-grid-cell-contents">
                            <iris-time-object-output value="row.entity.to" format="'DD.MM.YYYY HH:mm:ss'" zone="row.entity.timeZone"></iris-time-object-output>
                        </div>`,
                width: 120
            }, {
                name: 'timeZone',
                displayName: $translate.instant('label.TimeZone'),
                cellTemplate: `
                        <div class="ui-grid-cell-contents">
                            {{row.entity.timeZone | irisTimeZoneOutput}}
                        </div>`,
                width: '*'
            }];
            $scope.addFieldsToGrid(table_fields);

            $scope.remove = function (project) {
                alertify.confirm($translate.instant('message.DeleteItemConfirm'), function (e) {
                    if (e) {
                        iris.loader.start();
                        ProjectsService.removeProject(project).then(function (result) {
                            iris.loader.stop();
                            alertify.success($translate.instant('message.DeleteItemSuccessful'));
                            ProjectsService.requestProjects().then(projects => {
                                projectList = projects;
                                $scope.projectList = projectList;
                                prepareItems();
                            });
                        });
                    }
                });
            };
        });

})();