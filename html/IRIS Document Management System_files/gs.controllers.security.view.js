(function () {

    angular.module('iris_gs_security_view', []);

    angular.module('iris_gs_security_view').controller('ModuleCompaniesViewCtrl',
        function ($scope, $controller, $translate, $stateParams, CompaniesService) {
            $scope.items = CompaniesService.getCompanies();

            angular.extend($scope, $controller('ModuleDirectoriesBaseViewCtrl', {$scope: $scope}));

            var table_fields = [
                {
                    name: 'name',
                    displayName: $translate.instant('label.CompanyName'),
                    width: '*'
                }
            ];
            $scope.addFieldsToGrid(table_fields);

            $scope.remove = function (company) {
                alertify.confirm($translate.instant('message.DeleteItemConfirm'), function (e) {
                    if (e) {
                        iris.loader.start();
                        CompaniesService.removeCompany(company).then(function (result) {
                            iris.loader.stop();
                            alertify.success($translate.instant('message.DeleteItemSuccessful'));
                        });
                    }
                });
            };


        });

    angular.module('iris_gs_security_view').controller('ModuleUsersViewCtrl',
        function ($scope, $controller, $translate, $stateParams, UserService, CompaniesService, ProjectsService) {
            $scope.items = [];
            UserService.getUsersFromDb().then(users => $scope.items = users);
            $scope.projects = ProjectsService.getProjects();

            angular.extend($scope, $controller('PopupMixin', {$scope}));

            angular.extend($scope, $controller('ModuleDirectoriesBaseViewCtrl', {$scope: $scope}));

            function checkUserLimits() {
                UserService.isUserLimitReached().then((response) => {
                    $scope.disableAddButton = response.limitReached;
                    if (response.limitReached) {
                        $scope.addButtonTooltip = $translate.instant('message.MaxUserNumberReached')
                    } else {
                        $scope.addButtonTooltip = null;
                    }
                });
            }

            checkUserLimits();

            $scope.projectId = null;
            $scope.companyId = null;

            $scope.companies = CompaniesService.getCompanies();

            $scope.gridOptions.enableFiltering = true;
            var table_fields = [{
                name: 'username',
                displayName: $translate.instant('label.Username'),
                width: '*'
            }, {
                name: 'email',
                displayName: $translate.instant('label.Email'),
                width: '*'
            }, {
                name: 'profile.firstname',
                displayName: $translate.instant('label.FirstName'),
                width: '*'
            }, {
                name: 'profile.lastname',
                displayName: $translate.instant('label.LastName'),
                width: '*'
            }, {
                name: 'profile.company.name',
                displayName: $translate.instant('label.Company'),
                enableFiltering: false,
                width: '*'
            }, {
                name: 'profile.enabled',
                displayName: $translate.instant('label.Enabled'),
                enableFiltering: false,
                width: 80,
                cellTemplate: '<div class="ui-grid-cell-contents"><i class="fa fa-fw fa-check" ng-if="row.entity.enabled"></i></div>'
            }];

            $scope.addFieldsToGrid(table_fields);
            $scope.removeFieldFromGrid("actions");

            $scope.$on('modalClosed', (() => {
                checkUserLimits();
            }));

            $scope.refreshList = () => {
                UserService.getUsersFromDb().then(users => $scope.items = users);
            };

            var gridRowAction =
                {
                    name: 'actions',
                    width: 150,
                    displayName: $translate.instant('label.Actions'),
                    enableFiltering: false,
                    enableSorting: false,
                    cellTemplate: '<div class="ui-grid-cell-contents actions"><a href="javascript:void(0)" ng-if="grid.appScope.hasPermissionToUpdate(row.entity)" ng-click="grid.appScope.openModuleSettingsModal(row).then(grid.appScope.refreshList, grid.appScope.refreshList)" class="btn btn-default" title="{{\'label.Edit\' | translate}}"><i class="fa fa-pencil"></i></a>' +
                    '&nbsp;<button class="btn btn-default" ng-if="grid.appScope.hasPermissionToCopy(row.entity)" ng-click="grid.appScope.openModuleSettingsModal(row, {copy: true})" uib-tooltip="{{\'label.Copy\' | translate}}"><i class="fa fa-copy"></i></button>' +
                    '&nbsp;<button class="btn btn-danger" ng-if="grid.appScope.hasPermissionToDelete(row.entity)" ng-click="grid.appScope.remove(row.entity)" uib-tooltip="{{\'label.Remove\' | translate}}"><i class="fa fa-trash-o"></i></button></div>'
                };

            $scope.gridOptions.columnDefs.push(gridRowAction);

            $scope.hasPermissionToDelete = function (item) {
                if ($scope.hasPermissionToDelete) {
                    if (iris.config.me.id != item.id) { // cannot delete yourself
                        if (iris.config.me.isAdmin || !item.isAdmin) { // need to be admin to delete admin users
                            return true;
                        }
                    }
                }
                return false;
            }

            $scope.hasPermissionToCopy = function (item) {
                if (iris.config.me.isAdmin || !item.isAdmin) { // need to be admin to copy admin users
                    return true;
                }
                return false;
            }

            $scope.remove = function (user) {
                alertify.confirm($translate.instant('message.DeleteItemConfirm'), function (e) {
                    if (e) {
                        iris.loader.start();
                        UserService.removeUser(user).then(function (result) {
                            iris.loader.stop();
                            alertify.success($translate.instant('message.DeleteItemSuccessful'));
                            $scope.refreshList();
                        });
                    }
                });
            };

            $scope.companySelected = (companyId) => {
                $scope.companyId = companyId;
                UserService.getByProjectIdAndCompany($scope.projectId, $scope.companyId).then((users) => {
                    $scope.items = users;
                });

            };

            $scope.projectSelected = (projectId) => {
                $scope.projectId = projectId;
                UserService.getByProjectIdAndCompany($scope.projectId, $scope.companyId).then((users) => {
                    $scope.items = users;
                });
            };

            $scope.openCsvExportModal = () => {
                $scope.popup.openComponents('global-settings/controllers/security', 'security.tasks-export.html', 'ModuleUserExport',
                    {projectId: $scope.projectId, companyId: $scope.companyId, type: 'csv'});
            };

            $scope.openExcelExportModal = () => {
                $scope.popup.openComponents('global-settings/controllers/security', 'security.tasks-export.html', 'ModuleUserExport',
                    {projectId: $scope.projectId, companyId: $scope.companyId, type: 'excel'});
            }
        });

    angular.module('iris_gs_security_view').controller('ModuleUserGroupsViewCtrl',
        function ($scope, $controller, $translate, $stateParams, $uibModal, UserGroupsService, CompaniesService) {
            $scope.items = UserGroupsService.getUserGroups();

            angular.extend($scope, $controller('ModuleDirectoriesBaseViewCtrl', {$scope: $scope}));

            $scope.companies = CompaniesService.getCompanies();

            angular.extend($scope.gridRowActions, {
                users: {
                    order: 15,
                    template: `
                        <a href="javascript:void(0)"
                           ng-click="grid.appScope.openUsersModal(row)"
                           class="btn btn-default"
                           title="{{::'label.Users' | translate}}">
                            <i class="fa fa-users"></i>
                        </a>`
                }
            });
            $scope.updateGridRowActions();

            var table_fields = [
                {
                    field: 'name',
                    displayName: $translate.instant('label.GroupName'),
                    sort: {
                        direction: 'asc',
                        priority: 1
                    }
                },
                {
                    field: 'companyId',
                    displayName: $translate.instant('label.CompanyName'),
                    cellTemplate: '\
                        <div class="ui-grid-cell-contents">\
                            {{row.entity.companyId | IrisFilterField:[grid.appScope.companies]}}\
                        </div>'
                }
            ];
            $scope.addFieldsToGrid(table_fields);

            $scope.openUsersModal = function (row) {
                $uibModal.open({
                    templateUrl: iris.config.componentsUrl + '/global-settings/controllers/security/templates/security.users-to-group.edit.html',
                    resolve: {
                        'params': function () {
                            return {
                                'object_id': row.entity.id
                            }
                        }

                    },
                    size: 'lg',
                    controller: 'ModuleUsersToGroupEditCtrl'
                });
            };

            $scope.exportGroups = function (type) {
                UserGroupsService.exportGroups(type);
            };

            $scope.remove = function (userGroup) {
                alertify.confirm($translate.instant('message.DeleteItemConfirm'), function (e) {
                    if (e) {
                        iris.loader.start();
                        UserGroupsService.removeUserGroup(userGroup).then(function (result) {
                            iris.loader.stop();
                            alertify.success($translate.instant('message.DeleteItemSuccessful'));
                        });
                    }
                });
            };
        });

})();