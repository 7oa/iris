(function () {

    angular.module('iris_gs_security_edit', []);

    angular.module('iris_gs_security_edit').controller('ModuleCompaniesEditCtrl',
        function ($scope, $controller, $translate, $timeout, $q, params, $uibModalInstance, CompaniesService, UserGroupsService, SecurityService) {
            $scope.companyId = params.object_id;
            $scope.isNew = !$scope.companyId;

            $scope.forms = {};
            $scope.tabs = {};

            function setActiveTab(tab) {
                $scope.tabs.active = tab;
            }

            $scope.tabSelect = function() {
                $timeout(() => iris.grid.fixWidth($scope.userGroupsGridOptions.gridAPI), 50);
            };

            if (!params.object_id) {
                $scope.company = CompaniesService.createCompany();
            }
            else {
                $scope.company = CompaniesService.getCompany(params.object_id);
            }

            $scope.save = function () {
                if (!$scope.hasAnyPermission()) {
                    setActiveTab('UserGroups');
                    alertify.error($translate.instant('message.config.NoUserGroupPermissions'));
                    return;
                }

                CompaniesService.saveCompany($scope.company).then(function (company) {
                    if ($scope.isNew) {
                        $scope.companyId = company.id;
                        $scope.isNew = false;

                        var realGroups = UserGroupsService.getUserGroups(),
                            promises = [];

                        $scope.userGroups.forEach(g => {
                            var realGroup = realGroups.find(rg => rg.id == g.id),
                                addPermissions = [];
                            if (!realGroup) return;
                            ['read'].forEach(a => {
                                if (g[a] && g[a].allowed) {
                                    addPermissions.push(setPermission(realGroup, a, true));
                                }
                            });
                            addPermissions.length && promises.push(UserGroupsService.addPermissionsToUserGroup(realGroup.id, addPermissions).then(pRes => {
                                realGroup.permissions = pRes.permissions;
                            }));
                        });

                        $q.all(promises).then(() => {
                            alertify.success($translate.instant('label.CompanySaved'));
                            $uibModalInstance.close($scope.company);
                        });
                    } else {
                        alertify.success($translate.instant('label.CompanySaved'));
                        $uibModalInstance.close($scope.company);
                    }
                })
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
                        if (($scope.userGroups[i]['read'] && $scope.userGroups[i]['read'].allowed))
                            return true;
                    }
                    return false;
                } else {
                    return true;
                }
            };

            function getPermission(userGroup, action) {
                return $scope.isNew ? userGroup[action] : UserGroupsService.getUserGroupPermissionForSubjectAndAction(userGroup, $scope.companyId, 'Company', action);
            }

            function createPermission(action, allowed) {
                return $scope.isNew ? {allowed: allowed} : SecurityService.createPermission('Company', $scope.companyId, action, allowed);
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
                    }
                ]
            };
        });

    angular.module('iris_gs_security_edit').controller('ModuleUsersEditCtrl',
        function ($scope, $controller, $translate, $filter, params, $uibModalInstance, UserService, CompaniesService, UserGroupsService, StaffService, ProjectsService) {
            $scope.isNewUser = !params.object_id;
            $scope.me = UserService.getCurUser();
            $scope.password_generated = false;
            $scope.projects = [];

            $scope.user = UserService.createUser();
            $scope.profilesWithoutUser = [];
            StaffService.getAllStaff().then(profiles => {
                $scope.profilesWithoutUser = $filter('filter')(profiles, {userId: null}, false);
                console.log('profiles available', $scope.profilesWithoutUser);
            });
            $scope.selectedProfileId = null;
            if (params.object_id) {
                UserService.getUser(params.object_id).then(function (user) {
                    $scope.user = user;
                    if (params.data && params.data.copy) {
                        params.data.copy = false;
                        $scope.user = $scope.copyUser($scope.user)
                    }
                    fixUserName($scope.user);
                    initAvailableUserGroups();
                });
            }

            $scope.user_groups = UserGroupsService.getUserGroups();
            $scope.user_groups.$promise.then(function () {
                initAvailableUserGroups();
            });
            $scope.companies = CompaniesService.getCompanies();
            $scope.dateFormats = iris.Time.Format.GetForTypeDate();
            $scope.timeFormats = iris.Time.Format.GetForTypeTime();
            $scope.dateTimeFormats = iris.Time.Format.GetForTypeDateTime();

            $scope.profileSelected = function (selectedProfileId) {
                if (!selectedProfileId) {
                    $scope.user.profile = {};
                }
                else {
                    $scope.user.profile = $filter('filter')($scope.profilesWithoutUser, {id: selectedProfileId}, false)[0];
                }
            };

            ProjectsService.getProjects().$promise.then((p) => {
                $scope.allProjects = p;
            });

            $scope.save = function () {

                //add user group if user forgot to push plus button
                if ($scope.user_group_id) {
                    $scope.addUserToGroup();
                }

                var user_groups = [];
                var reloadPage = false;
                if (!$scope.user.id) {
                    user_groups = angular.copy($scope.user.userGroups);
                } else if ($scope.user.id === iris.config.me.id) {
                    if ($scope.user.profile.language !== iris.config.me.profile.language ||
                        $scope.user.profile.avatarFileId !== iris.config.me.profile.avatarFileId) {
                        // Reload the whole page in case of a language or avatar change for the own user.
                        reloadPage = true;
                    }
                }

                // Autofill username if empty
                if (!$scope.user.username) {
                    var email = $scope.user.email;
                    var username = email.substr(0, email.indexOf('@'))
                    console.log("Parsed username: ", username);
                    $scope.user.username = username;
                }

                UserService.saveUser($scope.user).then(function (user) {
                    //If user was new - call link user to groups
                    user_groups.forEach(ug => UserGroupsService.addUserToGroup(ug.id, user.id));

                    alertify.success($translate.instant('label.UserSaved'));
                    if ($scope.isCopy) {
                        $scope.isCopy = false;
                        $scope.user = $scope.copyUser($scope.user);
                        return;
                    } else {
                        $uibModalInstance.close($scope.user);
                        if (reloadPage) {
                            window.location.reload();
                        }
                    }
                })
            };

            $scope.copyUser = (user) => {
                user = angular.copy(user);
                user.id = null;
                user.email = null;
                user.password = null;
                user.username = null;
                user.profile.id = null;
                user.profile.firstname = null;
                user.profile.lastname = null;
                user.profile.phone = null;
                user.profile.address = null;
                user.profile.city = null;
                user.profile.zip = null;
                return user;
            };

            $scope.setCompanyById = function () {

                var companyId = $scope.user.profile.companyId;

                if (companyId) {
                    $scope.user.profile.company = $filter('filter')($scope.companies, {id: +companyId}, true)[0];
                }
                else {
                    $scope.user.profile.company = null;
                }
            };

            $scope.gridOptions = {
                data: 'user.userGroups',
                columnDefs: [
                    {
                        name: '#',
                        displayName: '#',
                        width: 40,
                        enableSorting: false,
                        cellTemplate: '<div class="ui-grid-cell-contents">{{rowRenderIndex + 1}}</div>'
                    }, {
                        name: 'name',
                        displayName: $translate.instant('label.Name'),
                        width: '*',
                        sort: {
                            direction: 'asc',
                            priority: 1
                        }
                    },
                    {
                        name: 'actions',
                        width: 50,
                        displayName: '',
                        enableSorting: false,
                        cellTemplate: '\
                            <div class="ui-grid-cell-contents actions">\
                                <button class="btn btn-danger" uib-tooltip="{{\'label.RemoveUserFromGroup\' | translate}}"\
                                        ng-click="grid.appScope.removeUserFromGroup(row.entity.id)">\
                                    <i class="fa fa-trash-o"></i>\
                                </button>\
                            </div>'
                    }
                ]
            };

            $scope.available_user_groups = [];
            var initAvailableUserGroups = function () {
                $scope.available_user_groups = $scope.user_groups.reduce(function (res, next) {
                    for (var i in $scope.user.userGroups) {
                        var user_group = $scope.user.userGroups[i];
                        if (user_group.id == next.id) return res;
                    }
                    res.push(next);
                    return res;
                }, []);
            };

            function setFavProject() {
                $scope.projects = [];
                const userGroups = $scope.user.userGroups;
                if ($scope.user.isAdmin) {
                    $scope.projects = $scope.allProjects;
                } else {
                    userGroups.forEach((userGroup) => {
                        userGroup.permissions.forEach((permission) => {
                            if (permission.subject.name === 'Project') {
                                const projectId = parseInt(permission.subject.subjectId);
                                const project = $scope.allProjects.find((p) => p.id === projectId);
                                if (project) {
                                    $scope.projects.push(project);
                                }
                            }
                        })
                    });
                }

                if ($scope.user.profile && $scope.user.profile.favProjectId && !$scope.user.isAdmin) {
                    if (!$scope.projects.find(p => p.id == $scope.user.profile.favProjectId)) {
                        $scope.user.profile.favProjectId = null;
                    }
                }
            }

            $scope.$watchCollection('user.userGroups', () => {
                setFavProject();
            });

            $scope.$watch('user.isAdmin', () => {
                setFavProject();
            })

            $scope.addUserToGroup = function () {
                if ($scope.user.id) {
                    UserGroupsService.addUserToGroup($scope.user_group_id, $scope.user.id).then(function (user_group) {
                        $scope.user.userGroups.push(user_group);
                        initAvailableUserGroups();
                    });
                } else {
                    $scope.user.userGroups.push(UserGroupsService.filter({id: +$scope.user_group_id})[0]);
                    initAvailableUserGroups();
                }
                $scope.user_group_id = null;


            };

            $scope.removeUserFromGroup = function (user_group_id) {
                if (!$scope.user.id) {
                    for (var i in $scope.user.userGroups) {
                        if ($scope.user.userGroups[i].id == user_group_id) {
                            $scope.user.userGroups.splice(i, 1);
                            initAvailableUserGroups();
                            break;
                        }
                    }
                } else {
                    alertify.confirm($translate.instant('message.DeleteItemConfirm'), function (e) {
                        if (e) {
                            iris.loader.start();
                            UserGroupsService.removeUserFromGroup(user_group_id, $scope.user.id).then(function () {
                                for (var i = 0, c = $scope.user.userGroups.length; i < c; i++) {
                                    if ($scope.user.userGroups[i].id == user_group_id) {
                                        $scope.user.userGroups.splice(i, 1);
                                        initAvailableUserGroups();
                                        break;
                                    }
                                }
                                iris.loader.stop();
                                alertify.success($translate.instant('message.DeleteItemSuccessful'));
                            });
                        }
                    });
                }
            };

            $scope.generatePassword = function () {

                UserService.generatePassword($scope.user).then(function (result) {
                    $scope.user.password = result.password;
                    $scope.password_generated = true;
                })
            }
        });

    angular.module('iris_gs_security_edit').controller('ModuleUserGroupsEditCtrl',
        function ($scope, $filter, $controller, $q, $translate, $timeout, params, $uibModalInstance,
                  UserGroupsService, CompaniesService, ModuleService, ProjectsService, DevicesService, SecurityService) {

            $scope.userGroup = UserGroupsService.createUserGroup();
            $scope.companies = CompaniesService.getCompanies();
            $scope.modules = ModuleService.getActiveModules();

            /* projects tab */

            $scope.projects = [];

            $scope.gridOptions4Projects = {
                enableSorting: true,
                enableFiltering: true,
                showTreeExpandNoChildren: false,
                enableVerticalScrollbar: true,
                onRegisterApi() {
                    $timeout(() => {
                        $(window).trigger('resize')
                    });
                },
                columnDefs: [
                    {
                        name: 'id',
                        width: 50
                    }, {
                        name: 'name',
                        displayName: $translate.instant('label.Name'),
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
                                        ng-disabled="!grid.appScope.hasCurrentUserPermission(row.entity.id, 'Project', 'read')"
                                        ng-click="grid.appScope.togglePermission(row.entity.id, 'Project', 'read')">
                                    <i class="fa"
                                       ng-class="{'fa-check':grid.appScope.hasPermission(row.entity.id, 'Project', 'read'), 'fa-square-o':!grid.appScope.hasPermission(row.entity.id, 'Project', 'read')}"/>
                                </button>
                            </div>`
                    }, {
                        name: 'add',
                        displayName: $translate.instant('label.Add'),
                        enableSorting: false,
                        enableFiltering: false,
                        width: '*',
                        cellTemplate: `
                            <div class="ui-grid-cell-contents" ng-if="!row.entity.id">
                                <button class="btn btn-link disabled-visible"
                                   ng-disabled="!grid.appScope.hasCurrentUserPermission(row.entity.id, 'Project', 'add')"
                                   ng-click="grid.appScope.togglePermission(row.entity.id, 'Project', 'add')">
                                    <i class="fa"
                                   ng-class="{'fa-check':grid.appScope.hasPermission(row.entity.id, 'Project', 'add'), 'fa-square-o':!grid.appScope.hasPermission(row.entity.id, 'Project', 'add')}"/>
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
                                   ng-disabled="!grid.appScope.hasCurrentUserPermission(row.entity.id, 'Project', 'update')"
                                   ng-click="grid.appScope.togglePermission(row.entity.id, 'Project', 'update')">
                                    <i class="fa"
                                   ng-class="{'fa-check':grid.appScope.hasPermission(row.entity.id, 'Project', 'update'), 'fa-square-o':!grid.appScope.hasPermission(row.entity.id, 'Project', 'update')}"/>
                                </button>
                            </div>`
                    }, {
                        name: 'remove',
                        displayName: $translate.instant('label.Remove'),
                        enableSorting: false,
                        enableFiltering: false,
                        width: '*',
                        cellTemplate: `
                            <div class="ui-grid-cell-contents" ng-if="!row.entity.id">
                                <button class="btn btn-link disabled-visible"
                                   ng-disabled="!grid.appScope.hasCurrentUserPermission(row.entity.id, 'Project', 'delete')"
                                   ng-click="grid.appScope.togglePermission(row.entity.id, 'Project', 'delete')">
                                    <i class="fa"
                                   ng-class="{'fa-check':grid.appScope.hasPermission(row.entity.id, 'Project', 'delete'), 'fa-square-o':!grid.appScope.hasPermission(row.entity.id, 'Project', 'delete')}"/>
                                </button>
                            </div>`
                    }
                ],
                data: []
            };

            const fillGrid4Projects = (dataItems, gridItems, currLevel) => {
                currLevel = currLevel || 0;
                if (dataItems && dataItems.length) {
                    dataItems.forEach((item) => {
                        item.$$treeLevel = currLevel;
                        gridItems.push(item);
                        fillGrid4Projects(item.projects, gridItems, currLevel + 1);
                    });
                }
            };

            ProjectsService.getProjects().$promise.then((p) => {
                $scope.projects = p;
                $scope.rootProjects = [
                    {id: null, name: 'Projects'}
                ];
                $scope.rootProjects = $scope.rootProjects.concat(p.filter((it) => {
                    return it.projectId == null
                }));

                fillGrid4Projects($scope.rootProjects, $scope.gridOptions4Projects.data);
            });

            /* devices tab */

            $scope.devices = [{id: null, name: 'Devices'}];

            DevicesService.getDevices().$promise.then(devices => {
                devices.forEach(d => $scope.devices.push(d));
            });

            $scope.gridOptions4Devices = {
                data: "devices",
                enableSorting: true,
                enableFiltering: true,
                enableVerticalScrollbar: true,
                onRegisterApi: function (gridApi) {
                    $scope.gridOptions4Devices.gridAPI = gridApi;
                },
                columnDefs: [
                    {
                        name: 'id',
                        width: 50
                    }, {
                        name: 'name',
                        displayName: $translate.instant('label.Name'),
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
                                   ng-disabled="!grid.appScope.hasCurrentUserPermission(row.entity.id, 'Device', 'read')"
                                   ng-click="grid.appScope.togglePermission(row.entity.id, 'Device', 'read')">
                                    <i class="fa"
                                   ng-class="{'fa-check':grid.appScope.hasPermission(row.entity.id, 'Device', 'read'), 'fa-square-o':!grid.appScope.hasPermission(row.entity.id, 'Device', 'read')}"/>
                                </button>
                            </div>`
                    }, {
                        name: 'add',
                        displayName: $translate.instant('label.Add'),
                        enableSorting: false,
                        enableFiltering: false,
                        width: '*',
                        cellTemplate: `
                            <div class="ui-grid-cell-contents" ng-if="!row.entity.id">
                                <button class="btn btn-link disabled-visible"
                                   ng-disabled="!grid.appScope.hasCurrentUserPermission(row.entity.id, 'Device', 'add')"
                                   ng-click="grid.appScope.togglePermission(row.entity.id, 'Device', 'add')">
                                    <i class="fa"
                                   ng-class="{'fa-check':grid.appScope.hasPermission(row.entity.id, 'Device', 'add'), 'fa-square-o':!grid.appScope.hasPermission(row.entity.id, 'Device', 'add')}"/>
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
                                   ng-disabled="!grid.appScope.hasCurrentUserPermission(row.entity.id, 'Device', 'update')"
                                   ng-click="grid.appScope.togglePermission(row.entity.id, 'Device', 'update')">
                                    <i class="fa"
                                   ng-class="{'fa-check':grid.appScope.hasPermission(row.entity.id, 'Device', 'update'), 'fa-square-o':!grid.appScope.hasPermission(row.entity.id, 'Device', 'update')}"/>
                                </button>
                            </div>`
                    }, {
                        name: 'remove',
                        displayName: $translate.instant('label.Remove'),
                        enableSorting: false,
                        enableFiltering: false,
                        width: '*',
                        cellTemplate: `
                            <div class="ui-grid-cell-contents" ng-if="!row.entity.id">
                                <button class="btn btn-link disabled-visible"
                                   ng-disabled="!grid.appScope.hasCurrentUserPermission(row.entity.id, 'Device', 'delete')"
                                   ng-click="grid.appScope.togglePermission(row.entity.id, 'Device', 'delete')">
                                    <i class="fa"
                                   ng-class="{'fa-check':grid.appScope.hasPermission(row.entity.id, 'Device', 'delete'), 'fa-square-o':!grid.appScope.hasPermission(row.entity.id, 'Device', 'delete')}"/>
                                </button>
                            </div>`
                    }
                ]
            };

            /* ------------------ */


            $scope.activateGridTab = function () {
                $timeout(() => {
                    $(window).trigger('resize')
                }, 50);
            };

            $scope.actions = UserGroupsService.getActions();

            if (params.object_id) {
                UserGroupsService.getUserGroup(params.object_id).then(function (group) {
                    $scope.userGroup = group;
                });
            }

            function saveUserGroup() {
                var promises = [];
                var addPermissions = [];
                var removePermissions = [];
                for (var i = 0; i < $scope.userGroup.permissions.length; i++) {
                    var permission = $scope.userGroup.permissions[i];
                    if (permission.id && permission.subject.id) {
                        if (!permission.allowed && $scope.userGroup.id) {
                            // is removed permission
                            removePermissions.push(permission);
                            promises.push(UserGroupsService.removePermissionFromUserGroup($scope.userGroup.id, permission.id));
                        }
                    } else {
                        // is new permission
                        addPermissions.push(permission);
                    }
                }
                // remove permissions
                for (var permission of removePermissions) {
                    var index = -1;
                    for (var i = 0; i < $scope.userGroup.permissions.length; i++) {
                        if (angular.equals($scope.userGroup.permissions[i], permission)) {
                            index = i;
                        }
                    }
                    if (index != -1) {
                        $scope.userGroup.permissions.splice(index, 1);
                    }
                }

                if ($scope.userGroup.id) {
                    $q.all(promises).then(() => {
                        UserGroupsService.addPermissionsToUserGroup($scope.userGroup.id, addPermissions).then(function (updatedUserGroup) {
                            $scope.userGroup.permissions = updatedUserGroup.permissions;
                            UserGroupsService.saveUserGroup($scope.userGroup).then(function (userGroup) {
                                alertify.success($translate.instant('label.UserGroupSaved'));
                                $uibModalInstance.close($scope.userGroup);
                            });
                        });
                    });
                } else {
                    // is new user-group
                    $scope.userGroup.permissions = [];
                    UserGroupsService.saveUserGroup($scope.userGroup).then(function (userGroup) {
                        $scope.userGroup = userGroup;
                        UserGroupsService.addPermissionsToUserGroup(userGroup.id, addPermissions).then(function (updatedUserGroup) {
                            $scope.userGroup.permissions = updatedUserGroup.permissions;
                            alertify.success($translate.instant('label.UserGroupSaved'));
                            $uibModalInstance.close($scope.userGroup);
                        });
                    });
                }
            }

            function isUserInTheGroup() {
                return $scope.userGroup.users && $scope.userGroup.users.filter(u => u.id = iris.config.me.id).length;
            }

            function werePermissionsRemoved() {
                return $scope.userGroup.id && $scope.userGroup.permissions.filter(p => p.id && p.subject && !p.allowed).length;
            }

            $scope.save = function () {

                if (!iris.config.me.isAdmin && isUserInTheGroup() && werePermissionsRemoved()) {
                    /* request additional confirmation if the user is about to remove his own permissions */
                    alertify.confirm($translate.instant('text.AreYouSureYouWantToRemoveRightsFromYourOwnGroup'),
                        function (e) {
                            if (e) {
                                saveUserGroup();
                                window.location.reload();
                            }
                        }
                    );
                } else {
                    saveUserGroup();
                }
            };

            $scope.hasCurrentUserPermission = function (subjectId, subjectGroup, action) {
                return SecurityService.hasPermissions(subjectId, subjectGroup, action);
            }

            $scope.togglePermission = function (subjectId, subjectGroup, action) {

                var permission = UserGroupsService.getUserGroupPermissionForSubjectAndAction($scope.userGroup, subjectId, subjectGroup, action);

                if (permission) {
                    permission.allowed = !permission.allowed;
                } else {
                    permission = SecurityService.createPermission(subjectGroup, subjectId, action, true);
                    $scope.userGroup.permissions.push(permission);
                }

                // @TODO add 'Company' for Task IRIS-2658
                var subjectGroupsWithLinkedReadAndEditRights = {'Module': ['access', 'config'], 'Project': ['read', 'update'], 'Device': ['read', 'update']};
                if (subjectGroup in subjectGroupsWithLinkedReadAndEditRights && subjectGroupsWithLinkedReadAndEditRights[subjectGroup].indexOf(action) > -1) {
                    var read = subjectGroupsWithLinkedReadAndEditRights[subjectGroup][0];
                    var edit = subjectGroupsWithLinkedReadAndEditRights[subjectGroup][1];
                    // When removing read-permission automatically deactivate edit-permission:
                    if (action == read && !permission.allowed) {
                        var editPermission = UserGroupsService.getUserGroupPermissionForSubjectAndAction($scope.userGroup, subjectId, subjectGroup, edit);
                        if (editPermission && editPermission.allowed) {
                            editPermission.allowed = false;
                        }
                    } else if (action == edit && permission.allowed) {
                        // When providing edit-permission for a module / project / device / company automatically activate read-permission.
                        var readPermission = UserGroupsService.getUserGroupPermissionForSubjectAndAction($scope.userGroup, subjectId, subjectGroup, read);
                        if (readPermission) {
                            readPermission.allowed = true;
                        } else {
                            readPermission = SecurityService.createPermission(subjectGroup, subjectId, read, true);
                            $scope.userGroup.permissions.push(readPermission);
                        }
                    }
                }

                // propagate selection to sub-projects
                if (subjectGroup == 'Project') {
                    const project = $scope.projects.find((it) => it.id == subjectId);
                    if (project && project.projects) {
                        project.projects.forEach((subProject) => {
                            var subPermission = UserGroupsService.getUserGroupPermissionForSubjectAndAction($scope.userGroup, subProject.id, subjectGroup, action);
                            if (subPermission) {
                                if (permission.allowed ? !subPermission.allowed : subPermission.allowed) { // XOR
                                    subPermission.allowed = permission.allowed;
                                }
                            } else if (permission.allowed) {
                                subPermission = SecurityService.createPermission(subjectGroup, subProject.id, action, true);
                                $scope.userGroup.permissions.push(subPermission);
                            }
                        })
                    }
                }
            };

            $scope.hasPermission = function (subjectId, subjectGroup, action) {
                var permission = UserGroupsService.getUserGroupPermissionForSubjectAndAction($scope.userGroup, subjectId, subjectGroup, action);

                return permission ? permission.allowed : null;
            };

        });


    angular.module('iris_gs_security_edit').controller('ModuleUsersToGroupEditCtrl',
        function ($scope, $controller, $translate, $filter, params, $uibModalInstance, UserService, UserGroupsService) {
            $scope.group;
            $scope.user_id = null;

            $scope.reloadAllUsers = function() {
                $scope.users_in_group = [];
                $scope.users_not_in_group = [];
                UserService.getUsers().$promise.then(users => {
                    users.forEach(user => {
                        if (user.userGroups.find(it => it.id == $scope.group.id)) {
                            $scope.users_in_group.push(user);
                        } else {
                            $scope.users_not_in_group.push(user);
                        }
                    })
                });
            }

            if (params.object_id) {
                UserGroupsService.getUserGroup(params.object_id).then(group => {
                    $scope.group = group;
                    $scope.reloadAllUsers();
                });
            }

            $scope.addUserToGroup = function (user_id) {
                var index = $scope.users_not_in_group.findIndex(u => u.id == user_id);
                if (index != -1) {
                    var user = $scope.users_not_in_group[index];
                    iris.loader.start();
                    UserGroupsService.addUserToGroup($scope.group.id, user_id).then(() => {
                        $scope.users_not_in_group.splice(index, 1);
                        $scope.users_in_group.push(user);
                        iris.loader.stop();
                        alertify.success($translate.instant('label.AddedSuccessfully'));
                    });
                }
            };

            $scope.removeUserFromGroup = function (user_id) {
                var index = $scope.users_in_group.findIndex(u => u.id == user_id);
                if (index != -1) {
                    var user = $scope.users_in_group[index];
                    alertify.confirm($translate.instant('message.DeleteItemConfirm'), function (e) {
                        if (e) {
                            iris.loader.start();
                            UserGroupsService.removeUserFromGroup($scope.group.id, user_id).then(function () {
                                $scope.users_in_group.splice(index, 1);
                                $scope.users_not_in_group.push(user);
                                iris.loader.stop();
                                alertify.success($translate.instant('message.DeleteItemSuccessful'));
                            });
                        }
                    });
                }
            };

            $scope.gridOptions = {
                data: 'users_in_group',
                paginationPageSize: 10,
                columnDefs: [
                    {
                        name: 'username',
                        displayName: $translate.instant('label.Username'),
                        width: '*'
                    }, {
                        name: 'profile.fullName',
                        displayName: $translate.instant('label.Name'),
                        width: '*'
                    }, {
                        name: 'profile.company.name',
                        displayName: $translate.instant('label.Company'),
                        enableFiltering: false,
                        width: '*'
                    }, {
                        name: 'actions',
                        width: 50,
                        displayName: '',
                        enableSorting: false,
                        cellTemplate: `
                            <div class="ui-grid-cell-contents actions">
                                <button class="btn btn-danger" uib-tooltip="{{\'label.RemoveUserFromGroup\' | translate}}"
                                        ng-click="grid.appScope.removeUserFromGroup(row.entity.id)">
                                    <i class="fa fa-trash-o"></i>
                                </button>
                            </div>`
                    }
                ]
            };
        });
})();