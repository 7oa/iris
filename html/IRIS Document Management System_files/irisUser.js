(function () {
    irisAppDependencies.add('iris_user');

    angular.module('iris_user', []);

    angular.module('iris_user').directive('irisUser',
        function ($translate) {
            return {
                replace: true,
                restrict: 'EA',
                scope: {
                    userId: '='
                },
                templateUrl: iris.config.baseUrl + '/common/directives/irisUser/templates/iris-user.html',
                link: function (scope, element, attrs) {

                    scope.noUserLabel = attrs.noUserLabel || 'label.NoUser';
                    scope.onlyAvatar = angular.isDefined(attrs.short);
                    scope.showCompany = attrs.showCompany || false;

                    var avatarFileId;
                    var user;

                    function updateUser() {
                        if (attrs.forCurrentUser) {
                            user = iris.config.me;
                            avatarFileId = user.profile.avatarFileId;
                        } else {
                            user = iris.data.usersInfo.find(it => it.id == scope.userId);
                            avatarFileId = user ? user.avatarFileId : null;
                        }
                    }
                    updateUser();

                    scope.$watch("userId", function (nv, ov) {
                        if (nv != ov) {
                            updateUser();
                        }
                    });

                    scope.userExists = function() {
                        return !!user;
                    }

                    scope.getCompany = function() {
                        return (user && user.profile.company) ? user.profile.company.name : null;
                    }

                    scope.getUserId = function() {
                        return user ? user.id : null;
                    }

                    scope.hasAvatar = function() {
                        return !!avatarFileId;
                    }

                    scope.getAvatarLink = function() {
                        return generateAvatarLink(avatarFileId);
                    }

                    function generateAvatarLink(fileId) {
                        return iris.config.apiUrl + '/dms/files/' + fileId + '/content?download=false&token=' + iris.config.accessToken;
                    }
                }
            };
        });
})();