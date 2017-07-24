(function () {
    angular.module('irisApp').controller('DmsCtrl',
        function ($scope, $state, $translate, folders, dmsConfig, filterProjects, trashFolder,
                  filterWorkflows, SecurityService, projects, FoldersService, $uibModal,
                  dmsGridConfig, defaultActionsList, filesGridIsTrashDefaultColDefs, filesGridDefaultColDefs) {
            iris.loader.start('.module-content');
            $scope.dmsConfig = dmsConfig;
            $scope.projects = projects;
            $scope.folders = folders;
            $scope.trashFolder = trashFolder;

            $scope.dmsGridConfig = dmsGridConfig;
            $scope.defaultActionsList = defaultActionsList;
            $scope.filesGridIsTrashDefaultColDefs = filesGridIsTrashDefaultColDefs;
            $scope.filesGridDefaultColDefs = filesGridDefaultColDefs;

            $scope.breadcrumbs = {
                pathFolders: []
            };

            $scope.foldersFilter = {
                project: null
            };

            $scope.filterProjects = filterProjects;
            $scope.filterWorkflows = filterWorkflows;
            $scope.inProgressValues = [
                {id: "true", name: $translate.instant('label.dms.FileInProgress')},
                {id: "false", name: $translate.instant('label.dms.FileAvailable')}
            ];

            $scope.backToFolders = function () {
                $scope.breadcrumbs.pathFolders = [];
                //$state.go('dms.folders');
            };

            var notifyFolderModified = function (folder_id) {
                $scope.$broadcast('dms.folder.modified');
            };

            $scope.addFolder = function (target_folder_id) {
                if (angular.isUndefined(target_folder_id)) target_folder_id = null;

                if(!target_folder_id && !$scope.hasPermission('DMS', 'config', 'Module')) return;

                $scope.openEditFolder({parentId: target_folder_id});
            };

            $scope.openEditFolder = function (folder) {
                $scope.folder = FoldersService.createFolder(folder);

                $uibModal.open({
                    templateUrl: iris.config.moduleUrl + '/templates/dms.folders.edit.html',
                    controller: 'DmsFolderEditCtrl',
                    resolve: {
                        'folder': function () {
                            return angular.copy($scope.folder);
                        },
                        'folders': function () {
                            return $scope.folders;
                        },
                        'projects': function () {
                            return $scope.projects;
                        },
                        'dmsConfig': () => angular.copy($scope.dmsConfig),
                        'flags': () => FoldersService.getFolderFlagIcons()
                    }
                }).result.then(folder => {
                    $scope.folders = FoldersService.getFolders();
                    notifyFolderModified(folder.id);
                })
            };

            $scope.filterWorkflowStates = function() {
                return $scope.filter.workflowId ? $scope.filterWorkflows.filter(w => w.id == $scope.filter.workflowId)[0].workflowStates : [];
            };

            $scope.checkFilter = function() {
                if (!$scope.filter.workflowId) $scope.filter.workflowStateId = null;
            };

            $scope.clearFilter = function () {
                $scope.filter = {
                    is_advanced: false,
                    text: null,
                    is_text_comments: true,
                    is_text_created_by: true,
                    is_text_name: true,
                    is_text_content: false,
                    date_from: null,
                    date_to: null,
                    inProgress: null,
                    projectId: null,
                    workflowId: null,
                    workflowStateId: null
                };
            };
            $scope.clearFilter();

            if ($state.is('dms.search')) angular.extend($scope.filter, angular.fromJson($state.params.filter));

            $scope.search = function () {
                //console.log($scope.filter);
                $state.go('dms.search', {
                    filter: angular.toJson($scope.filter)
                });
            };

            $scope.openSmartFolderModal = function (filter, smartFolder) {
                $uibModal.open({
                    templateUrl: iris.config.moduleUrl + '/templates/dms.folders.smart-folder.html',
                    controller: 'DmsSmartFolderCtrl',
                    resolve: {
                        'filter': function () {
                            return filter;
                        },
                        'smartFoldersSettings': function (UserSettingsService) {
                            return UserSettingsService.getUserSettingsById('dms-smart-folders', iris.config.me.id).then(res => {
                                if (!res.settings || !res.settings.smartFolders) res.settings.smartFolders = [];
                                return res;
                            });
                        },
                        'smartFolder': () => angular.copy(smartFolder) || null
                    }
                }).result.then(smartFolders => {
                    $scope.$broadcast('updateSmartFolders', smartFolders);
                })
            };

            $scope.sidebar = {
                is_folder_info_shown: false,
                is_file_info_shown: false
            };

            $scope.folderTabs = {
                activeTab: 'Details'
            };

            $scope.hasPermission = function (folder_id, action, subject_name) {
                subject_name = subject_name || 'iris:repoContentFolder';
                return SecurityService.hasPermissions(folder_id, subject_name, action);
            }
        });
})();