(function () {
    angular.module('iris_user_groups', []);

    angular.module('iris_user_groups').factory('UserGroups', function ($resource) {
        return $resource(iris.config.apiUrl + "/security/user-groups/:id",
            {
                id: '@id'
            },
            {
                addUser: {
                    url: iris.config.apiUrl + "/security/user-groups/:id/users/:userId",
                    method: 'POST',
                    params: {
                        userId: '@userId'
                    }
                },
                removeUser: {
                    url: iris.config.apiUrl + "/security/user-groups/:id/users/:userId",
                    method: 'DELETE'
                },
                addPermission: {
                    url: iris.config.apiUrl + "/security/user-groups/:id/permissions",
                    method: 'POST'
                },
                addPermissions: {
                    url: iris.config.apiUrl + "/security/user-groups/:id/permissions/list",
                    method: 'POST'
                },
                removePermission: {
                    url: iris.config.apiUrl + "/security/user-groups/:id/permissions/:permissionId",
                    method: 'DELETE'
                }
            }
        );
    });

    angular.module('iris_user_groups').factory('Actions', function ($resource) {
        return $resource(iris.config.apiUrl + "/security/actions");
    });

    angular.module('iris_user_groups').factory('UserGroupsService',
        function (UserGroups, $filter, UserService, Actions) {
            var userGroups = UserGroups.query({filter: angular.toJson([{f: "isWorkgroup", v:[false, null]}]), 'exclude-fields':angular.toJson(['userGroups'])}, function (value) {
                return value;
            });

            var actions = Actions.query({}, function (value) {
                return value;
            });

            var security = window.security || {};

            return {
                getActions: function () {
                    return actions;
                },

                getPreloadedWorkgroups: () => iris.data.workgroups || [],
                getWorkgroups: function(params) {
                    params = params || {};
                    params.filter = params.filter || [];
                    params.filter.push({f: "isWorkgroup", v:[true]});
                    params.filter = angular.toJson(params.filter);
                    return UserGroups.query(params).$promise;
                },

                getUserGroups: function () {
                    return userGroups;
                },

                getUserGroup: function (id) {
                    return UserGroups.get({id: id}).$promise;
                },

                removeUserGroup: function (userGroup) {
                    return userGroup.$remove({}, function (value) {
                        for (var i = 0; i < userGroups.length; i++) {
                            if (userGroups[i].id == value.id) {
                                userGroups.splice(i, 1);
                                break;
                            }
                        }
                        return value;
                    });
                },

                createWorkgroup: function() {
                    return new UserGroups({
                        permissions: [],
                        isWorkgroup: true,
                        isActive: true
                    });
                },

                createUserGroup: function () {
                    return new UserGroups({
                        permissions: []
                    });
                },

                exportGroups(type) {
                    window.location.href = `${iris.config.apiUrl}/security/user-groups/export-${type}`
                },

                filter: function (filter, strict) {
                    strict = strict || true;
                    return $filter('filter')(userGroups, filter, strict);
                },

                saveWorkgroup: function(item) {
                    return UserGroups.save(item).$promise;
                },

                saveUserGroup: function (userGroup) {
                    var is_new = !userGroup.id;
                    return userGroup.$save(function (userGroup) {
                        if (is_new) {
                            userGroups.push(userGroup);
                        }
                        else {
                            for (var i = 0; i < userGroups.length; i++) {
                                var el = userGroups[i];
                                if (el.id == userGroup.id) {
                                    angular.extend(el, userGroup);
                                    break;
                                }
                            }
                        }
                        return userGroup;
                    })
                },

                addUserToGroup: function (userGroupId, userId) {
                    return UserGroups.addUser({id:userGroupId, userId: userId}).$promise;
                },

                removeUserFromGroup: function (userGroupId, userId) {
                    return UserGroups.removeUser({id:userGroupId, userId: userId}).$promise;
                },

                addPermissionToUserGroup: function(userGroupId, permission) {
                    return UserGroups.addPermission({id:userGroupId}, permission).$promise;
                },

                addPermissionsToUserGroup: function(userGroupId, permissions) {
                    return UserGroups.addPermissions({id:userGroupId}, permissions).$promise;
                },

                removePermissionFromUserGroup: function(userGroupId, permissionId) {
                    return UserGroups.removePermission({id:userGroupId, permissionId: permissionId}).$promise;
                },

                getUserGroupPermissionForSubjectAndAction: function (userGroup, subjectId, subjectGroup, action) {
                    for (var permission of userGroup.permissions) {
                        if(permission.subject.name == subjectGroup && permission.subject.subjectId == subjectId && permission.action == action) return permission;
                    }
                    return null;
                },

                hasPermissions: function (subjectId, subjectName, action) {
                    var me = UserService.getCurUser();

                    if(me.isAdmin) return true;

                    if(!subjectName || !action || angular.isUndefined(subjectId)) return false;

                    if(!security[subjectName] || !security[subjectName][action]) return false;

                    return !!security[subjectName][action][subjectId];
                }
            };
        });

})();
