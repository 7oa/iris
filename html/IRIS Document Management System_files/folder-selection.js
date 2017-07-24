(function () {
    irisAppDependencies.add('iris_server_folder_selection');

    angular.module('iris_server_folder_selection', []);

    angular.module('iris_server_folder_selection').factory('ServerFolders', function ($resource) {
        return $resource(iris.config.apiUrl + "/sensor-import/import-data-folders");
    });

    angular.module('iris_server_folder_selection').factory('ServerFolderSelectorService', function ($uibModal, ServerFolders) {

        return {

            getRootFolder() {
                return ServerFolders.get().$promise;
            },

            openSelectFolderModal: function () {
                return $uibModal.open({
                    templateUrl: iris.config.componentsUrl + '/folder-selection/templates/folder-selection.modal.html',
                    controller: 'ServerFolderSelectCtrl',
                    size: 'lg',
                    resolve: {
                        rootFolder: function (ServerFolderSelectorService) {
                            return ServerFolderSelectorService.getRootFolder();
                        }
                    }
                }).result;
            }

        }
    });

    angular.module('iris_server_folder_selection').controller('ServerFolderSelectCtrl',
        function($scope, $uibModalInstance,
                 ServerFolderSelectorService, rootFolder){

            $scope.listOfFolders = [];

            $scope.selectedFolder = null;
            $scope.selectedFolderPrevious = null;

            $scope.onClickSidebarFolder = function (scope) {
                $scope.listOfTiles = scope.node.nodes;

                if($scope.selectedFolderPrevious && $scope.selectedFolderPrevious != scope.node){
                    $scope.selectedFolderPrevious.isSelected = false;
                }

                scope.node.isSelected = !scope.node.isSelected;

                if(scope.node.isSelected){
                    $scope.selectedFolder = scope.node;
                    $scope.selectedFolderPrevious = $scope.selectedFolder;
                }else{
                    $scope.selectedFolder = null;
                }
                
            };

            $scope.onClickTile = function (scope) {
                if($scope.selectedFolderPrevious && $scope.selectedFolderPrevious != scope.tile){
                    $scope.selectedFolderPrevious.isSelected = false;
                }

                scope.tile.isSelected = !scope.tile.isSelected;

                if(scope.tile.isSelected){
                    $scope.selectedFolder = scope.tile;
                    $scope.selectedFolderPrevious = $scope.selectedFolder;
                }else{
                    $scope.selectedFolder = null;
                }
            };

            var prepareFolders = function (node) {
                node.nodes.forEach(function(subnode){
                    subnode.isExpanded = true;
                    subnode.isSelected = false;
                    if(subnode.nodes.length > 0)
                    {
                        prepareFolders(subnode);
                    }
                });
            };

            var requestFolders = function () {
                rootFolder.isExpanded = true;
                rootFolder.isSelected = false;

                prepareFolders(rootFolder);

                $scope.listOfFolders.push(rootFolder);
                $scope.listOfTiles = rootFolder.nodes;
            };
            requestFolders();

        });
    
})();
