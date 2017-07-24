(function () {
    angular.module('iris_workgroup_selector').controller('AddWorkGroupCtrl',
        function ($scope, users, workGroup, $uibModalInstance, $q, UserGroupsService, ModuleFolderService) {
            $scope.users = users;
            $scope.forms = {};
            $scope.selectedItem = workGroup;

            $scope.saveWorkGroup = function() {
                if(!$scope.selectedItem.users.length) return;
                iris.loader.start('.modal-body');
                var users = angular.copy($scope.selectedItem.users);

                UserGroupsService.saveWorkgroup($scope.selectedItem).then(sRes => {
                    var promises = users.map(user => UserGroupsService.addUserToGroup(sRes.id, user.id));
                    $q.all(promises).then(res => {
                        iris.loader.stop('.modal-body');
                        $uibModalInstance.close(sRes);
                    })
                });
            };

            $scope.selectIcon = function() {
                ModuleFolderService.openModuleFilesModalExtended('PROCESS_MGMT', [{
                    name: "Workgroups",
                    subjectId: 0,
                    folderName: "Workgroups",
                    isSecured: false
                }], ".jpg, .jpeg, .png").then(function (file) {
                    $scope.selectedItem.imageFileId = file.id;
                });
            };

            $scope.clearIcon = function() {
                $scope.selectedItem.imageFileId = null;
            };

            $scope.addUser = function (user) {
                $scope.selectedItem.users = $scope.selectedItem.users || [];
                if($scope.selectedItem.users.find(o => o.id == user.id)) return;
                $scope.selectedItem.users.push(user);
            };

            $scope.removeUser = function (user) {
                var index = $scope.selectedItem.users.findIndex(o => o.id == user.id);
                if(index < 0) return;
                $scope.selectedItem.users.splice(index, 1);
            };
        });
})();