(function () {
    irisAppDependencies.add('iris_user_selector');

    angular.module('iris_user_selector', []);

    angular.module('iris_user_selector').directive('irisUserSelector',
        function ($translate) {
            return {
                replace: true,
                restrict: 'EA',
                scope: {
                    onSelect: '&',
                    excludeItems: '='
                },
                templateUrl: iris.config.baseUrl + '/common/directives/irisUserSelector/templates/iris-user-selector.html',
                link: function (scope, element, attrs) {
                    scope.users = angular.copy(iris.data.usersInfo);
                    scope.config = iris.config;
                    scope.me = iris.config.me;
                    scope.popover = {isOpen: false};
                    scope.icon = attrs.icon || 'fa-pencil';
                    var meIndex = scope.users.findIndex(u => u.id == scope.me.id);
                    scope.users.splice(meIndex, 1);

                    scope.filteredUsers = function () {
                        if (scope.excludeItems && scope.excludeItems.length) {
                            return scope.users.filter(u => scope.checkUserInExcludeItemsArray(u));
                        }
                        return scope.users;
                    };

                    scope.checkUserInExcludeItemsArray = function (user) {
                        if (scope.excludeItems && scope.excludeItems.length) {
                            return scope.excludeItems.findIndex(i => user.id == i.id) == -1;
                        }
                        return true;
                    };

                    scope.selectUser = function (user) {
                        scope.onSelect({user});
                        scope.popover.isOpen = false;
                    };
                }
            };
        });
})();