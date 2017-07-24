(function () {
    angular.module('iris_user_settings', []);

    angular.module('iris_user_settings').factory('Users', ['$resource', function ($resource) {
        var Users = $resource(iris.config.apiUrl + "/security/users/:id/:action/:avatar",
            {
                id: '@id',
                action: '@action',
                avatar: '@avatar'
            },
            {
                checkPincode: {
                    method: 'POST',
                    params: {
                        id: 'me',
                        action: 'check-pin-code'
                    }
                },
                checkPassword: {
                    method: 'POST',
                    params: {
                        id: 'me',
                        action: 'check-password'
                    }
                },
                generatePassword: {
                    method: 'POST',
                    params: {
                        action: 'pwd-generate',
                        id: '@id'
                    }
                },
                removeDashboard: {
                    method: 'POST',
                    params: {
                        action: 'remove-dashboard',
                        id: '@id'
                    }
                },
                setDashboard: {
                    method: 'POST',
                    params: {
                        action: 'set-dashboard',
                        id: '@id'
                    }
                },
                saveAvatar: {
                    method: 'POST',
                    url: iris.config.apiUrl + '/security/users/:id/:action?avatar=:avatar',
                    params: {
                        action: 'save-avatar'
                    }
                },

                limitReached: {
                    method: 'GET',
                    isArray: false,
                    params: {
                        action: 'limit-reached'
                    }
                }
            });


        Users.prototype.userGroupsList = function() {
            if (!this.userGroups || !this.userGroups.length) return "";
            var list = this.userGroups.reduce((p, c) => p + c.name + ", ", "");
            return list.substring(0, list.length - 2);
        };

        return Users;
    }]);


    angular.module('iris_user_settings').factory('ProjectUsers', ['$resource', function ($resource) {
        return $resource(iris.config.apiUrl + "/security/users/filter-project-company", {
            projectId: '@projectId',
            companyId: '@companyId'
        });
    }]);

    angular.module('iris_user_settings').factory('UserSettings', ['$resource', function ($resource) {
        return $resource(iris.config.apiUrl + "/user-settings/:alias/:id",
            {
                id: '@id',
                alias: '@alias'
            });
    }]);

    angular.module('iris_user_settings').factory('UserService', ['Users', 'ProjectUsers', '$filter',
        function (Users, ProjectUsers, $filter) {
            var users = Users.query({}, function (value) {
                return value;
            });

            var me = Users.get({id: 'me'}, function (value) {
                return value;
            });

            return {
                checkPincode: (pin) => Users.checkPincode(null, {pinCode: pin}).$promise,
                checkPassword: (password) => Users.checkPassword(null, {password}).$promise,

                getPreloadedUsers: () => iris.data.usersInfo,
                getUsers: function () {
                    return users;
                },

                getUsersFromDb: () => Users.query().$promise,

                getUser: function (id) {
                    return Users.get({id: id}).$promise;
                },

                getCurUser: function () {
                    return me;
                },

                isUserLimitReached() {
                    return Users.limitReached().$promise
                },

                getByProjectIdAndCompany(projectId, companyId) {
                    return ProjectUsers.query({projectId, companyId}).$promise;
                },

                exportUsers(type, projectId, companyId, permissions) {
                    const companyParam = companyId ? `&companyId=${companyId}` : '';
                    const projectParam = projectId ? `&projectId=${projectId}` : '';
                    const permissionsParam =  `permissions=${permissions}`;
                    window.location.href =
                       `${iris.config.apiUrl}/security/users/export-${type}?${permissionsParam}${companyParam}${projectParam}&token=${iris.config.accessToken}`
                },

                removeUser: function (user) {
                    return user.$remove({}, function (value) {
                        for (var i = 0, c = users.length; i < c; i++) {
                            if (users[i].id == value.id) {
                                users.splice(i, 1);
                                break;
                            }
                        }
                        return value;
                    });
                },

                createUser: function () {
                    return new Users({
                        enabled: true,
                        userGroups: []
                    });
                },

                filter: function (filter, strict) {
                    strict = strict || true;
                    return $filter('filter')(users, filter, strict);
                },

                saveUser: function (user) {
                    var is_new = !user.id;
                    var _this = this;
                    return user.$save(function (user) {
                        if (is_new) {
                            users.push(user);
                        } else {
                            for (var i = 0, c = users.length; i < c; i++) {
                                var u = users[i];
                                if (u.id == user.id) {
                                    angular.extend(u, user);
                                    break;
                                }
                            }
                        }
                        return user;
                    })
                },

                saveUserAvatar(userId, avatar) {
                    return Users.saveAvatar({id: userId, avatar: avatar}).$promise;
                },

                saveDefaultDashboard(dashboardId) {
                    return Users.setDashboard({id: dashboardId}).$promise;
                },

                removeDefaultDashboard(dashboardId) {
                    return Users.removeDashboard({id: dashboardId}).$promise;
                },

                generatePassword: function (user) {
                    return Users.generatePassword({id: user.id ? user.id : -1}).$promise;
                }
            };
        }
    ]);

/*    angular.module('iris_user_settings').factory('CurrentUser', ['$resource', function ($resource) {
            return $resource(iris.config.apiUrl + "/user");
    }]);*/


    angular.module('iris_user_settings').factory('UserSettingsService',
        function (UserSettings, $rootScope) {
            return {
                getUserSettingsList: function (alias) {
                    return UserSettings.query({alias: alias}).$promise;
                },

                getUserSettingsById: function (alias, user_id) {
                    user_id = user_id || 'default';
                    var user_settings = UserSettings.get({alias: alias, id: user_id});
                    return user_settings.$promise.then(function (result) {
                        if (result.userId != user_id && user_id != 'default')
                            result.id = null;
                        return result;
                    });
                },

                saveUserSettings: function (alias, settings, user_id) {
                    var is_new = !settings.userId > 0 && user_id != 'default';
                    if (user_id != 'default' && user_id != null)
                        settings.userId = user_id;

                    return UserSettings.save({alias: alias, id: is_new ? null : user_id}, settings, function (value) {
                        $rootScope.$broadcast('user-settings.' + alias + '.updated', value);
                        return value;
                    }).$promise;
                },

                removeUserSettings: function (alias, settings) {
                    return UserSettings.remove({alias: alias, id: settings.userId > 0 ? settings.userId : "default"}, function (value) {
                        return value;
                    }).$promise;
                }
            };
        });
})();
