(function () {
    irisAppDependencies.add('iris_workgroup_selector');

    angular.module('iris_workgroup_selector', []);

    angular.module('iris_workgroup_selector').directive('irisWorkgroupSelector',
        function (UserGroupsService, $uibModal) {
            return {
                replace: true,
                restrict: 'EA',
                scope: {
                    onSelect: '&'
                },
                templateUrl: iris.config.baseUrl + '/common/directives/irisWorkgroupSelector/templates/iris-workgroup-selector.html',
                link: function (scope, element, attrs) {
                    var refreshWorkGroups = function () {
                        scope.workgroups = [];
                        UserGroupsService.getWorkgroups().then(wRes => {
                            scope.workgroups = wRes;
                        });
                    };
                    refreshWorkGroups();

                    scope.config = iris.config;
                    scope.popover = {isOpen: false};

                    scope.selectItem = function (workgroup) {
                        scope.onSelect({workgroup});
                        scope.popover.isOpen = false;
                    };

                    scope.openCreateWorkGroup = function (name) {
                        $uibModal.open({
                            templateUrl: iris.config.baseUrl + "/common/directives/irisWorkgroupSelector/templates/add-workgroup.modal.html",
                            resolve: {
                                'users': UserService => UserService.getPreloadedUsers(),
                                'workGroup': () => {return {name, users: [], isActive: true, isWorkgroup: true};}
                            },
                            controller: 'AddWorkGroupCtrl'
                        }).result.then(wg => {
                            scope.selectItem(wg);
                            refreshWorkGroups();
                        })
                    }
                }
            };
        });
})();