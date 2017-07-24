(function () {
    angular.module('iris_subject_permissions', []);

    angular.module('iris_subject_permissions').directive('irisSubjectPermissions',
        function (SecurityService, UserGroupsService) {
            return {
                restrict: 'EA',
                scope: {
                    subject: '=',
                    subjectId: '=',
                    actions: '=',
                    restrictions: '='
                },
                templateUrl: iris.config.componentsUrl + '/security/directives/iris-subject-permissions.html',
                link: function (scope, attrs, element) {
                    scope.userGroups = [];
                    UserGroupsService.getUserGroups().$promise.then(function (userGroups) {
                        scope.userGroups = userGroups;
                    });

                    var requestPermissions = function () {
                        scope.permissions = [];
                        SecurityService.getSubjectPermissions(scope.subject, scope.subjectId).then(permissions => {
                            scope.permissions = permissions;
                        })
                    };
                    scope.$watchGroup(['subject', 'subjectId'], requestPermissions);

                    scope.setPermission = function (userGroupId, action, allowed) {
                        //if permission exists - remove, otherwise update
                        //todo refactor if performance needed
                        if (SecurityService.hasUserGroupPermission(scope.permissions, userGroupId, action) == allowed) {
                            var perm = SecurityService.getPermByUGAndAction(scope.permissions, userGroupId, action);
                            SecurityService.removePermission(perm.userGroupId, perm.id)
                                .then(requestPermissions)
                        } else {
                            SecurityService.setPermission(scope.subject, scope.subjectId, userGroupId, action, allowed)
                                .then(requestPermissions);
                        }
                    };

                    scope.hasSubjectPermission = function (userGroupId, action) {
                        return SecurityService.hasUserGroupPermission(scope.permissions, userGroupId, action);
                    }
                }
            };
        });
})();