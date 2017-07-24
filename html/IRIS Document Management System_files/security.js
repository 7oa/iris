(function () {
    irisAppDependencies.add('iris_security');

    angular.module('iris_security', ['iris_subject_permissions']);

    angular.module('iris_security').factory('SubjectPermissions', function ($resource) {
        return $resource(iris.config.apiUrl + "/security/subjects/:subjectType/:subjectId/permissions", {

        }, {
            setPermission: {
                method: 'POST',
                url: iris.config.apiUrl + "/security/user-groups/:userGroupId/permissions"
            },
            removePermission: {
                method: 'DELETE',
                url: iris.config.apiUrl + "/security/user-groups/:userGroupId/permissions/:permissionId"
            }
        });
    });

    angular.module('iris_security').factory('SecurityService',
        function ($filter, $uibModal, SubjectPermissions) {
            var rights = iris.data.rights || {};

            return {
                createPermission: function (subjectType, subjectId, action, allowed) {
                    return {
                        subject: {
                            name: subjectType,
                            subjectId: subjectId
                        },
                        action: action,
                        allowed: allowed
                    }
                },

                setPermission: function (subjectType, subjectId, userGroupId, action, allowed) {
                    console.log(subjectType, subjectId, userGroupId, action, allowed)
                    var permission = this.createPermission(subjectType, subjectId, action, allowed);

                    return SubjectPermissions.setPermission({userGroupId: userGroupId}, permission).$promise;
                },

                removePermission: function (userGroupId, permissionId) {
                    return SubjectPermissions.removePermission({userGroupId: userGroupId, permissionId: permissionId}).$promise;
                },

                getSubjectPermissions: function (subjectType, subjectId) {
                    return SubjectPermissions.query({subjectType, subjectId}).$promise;
                },

                hasPermissions: function (subject_id, subject_name, action) {
                    if(iris.config.me.isAdmin) return true;

                    if(!subject_name || !action || angular.isUndefined(subject_id)) return false;

                    if(!rights[subject_name]) return false;

                    if(rights[subject_name]['*'] && angular.isArray(rights[subject_name]['*'])
                        && rights[subject_name]['*'].indexOf(action) > -1) return true;

                    if(subject_id && rights[subject_name][subject_id] && angular.isArray(rights[subject_name][subject_id])
                        && rights[subject_name][subject_id].indexOf(action) > -1) return true;

                    return false;
                },

                openSubjectPermissionsModal: function (subject, id, actions, restrictions) {
                    actions = actions || [];
                    restrictions = restrictions || [true, false]; //['allow', 'deny']

                    return $uibModal.open({
                        templateUrl: iris.config.componentsUrl + '/security/templates/iris-subject-permissions.modal.html',
                        resolve: {
                            'actions': () => actions,
                            'restrictions': () => restrictions,
                            'subject': () => subject,
                            'subjectId': () => id
                        },
                        controller: 'SubjectPermissionsModalCtrl'
                    }).result;
                },

                getPermByUGAndAction: function (permissions, userGroupId, action) {
                    var user_group_permissions = $filter('filter')(permissions, {id: userGroupId}, true);

                    if (!user_group_permissions || !user_group_permissions.length) return;

                    var subject = user_group_permissions[0].subjects[0];

                    var action_permissions = $filter('filter')(subject.permissions, {action: action}, true);

                    if (!action_permissions || !action_permissions.length) return;

                    return action_permissions[0];
                },

                hasUserGroupPermission: function (permissions, userGroupId, action) {
                    var permission = this.getPermByUGAndAction(permissions, userGroupId, action);

                    if (!permission) return;

                    return permission.allowed;
                }
            };
        });

    angular.module('iris_security').controller('SubjectPermissionsModalCtrl',
        function ($scope, $uibModalInstance, subject, subjectId, actions, restrictions) {
            $scope.subject = subject;
            $scope.subjectId = subjectId;
            $scope.actions = actions;
            $scope.restrictions = restrictions;
        });

})();