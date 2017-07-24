(function(){
    angular.module('irisApp').controller('DmsFilesCtrl',
        function ($scope, $window, $state, $q, $timeout, $filter, $uibModal, $translate, $controller, $stateParams, files, folder,
                  projects, workflows, localIp, FoldersService, FoldersSecurityService, MailService,
                  UserGroupsService, FilesService, WorkflowService, CompaniesService, DmsMapsService, LangList,
                  DmsAppService, FileUploader, UserSettingsService) {

            angular.extend($scope, $controller('WebSocketMixin', { $scope }));
            angular.extend($scope, $controller('DmsFilesBaseCtrl', {$scope: $scope, workflowsFull: workflows}));
            angular.extend($scope, $controller('DmsFilesCommonCtrl', { $scope: $scope }));

            $scope.gridIsRender = true;

            $scope.localIp = localIp;
            $scope.appState = {
                ip: localIp,
                active: false
            };

            if (!folder) {
                $state.go('dms.folders');
            }
            if (folder.isTrashBin) $scope.sidebar.showSystemFolders = true;

            console.log(folder.id, localIp, iris.config.me.id);
            $scope.webSocket
                .connect('/websocket')
                .subscribe(`/global-broker/dms/folders/${folder.id}/files`, (response) => {
                    // filter out broadcasts that were caused by own actions
                    $timeout(() => {
                        console.log("Updates on folder " + folder.name + " by user " + response.user + " received.");
                        var files = [];
                        response.files.forEach(file => {
                            files.push(FilesService.createFile(file));
                        });
                        $scope.updateWithFiles(files);
                    });
                }).subscribe(`/user-broker/${iris.config.me.id}/dms/app-subscribe/${localIp}`, (response) => {
                    // filter out broadcasts that were caused by own actions
                    $timeout(() => {
                        console.log("DMSApp subscribed " + response.subscribed + " by user " + response.user + " received.");
                        $scope.appState.active = response.subscribed;
                    });
                });

            $scope.$on('$destroy', function () {
                if ($scope.webSocket) {
                    console.log("Unsubscribe folder "  + folder.name);
                    $scope.webSocket.unsubscribe(`/global-broker/dms/folders/${folder.id}/files`);
                    $scope.webSocket.unsubscribe(`/user-broker/${iris.config.me.id}/dms/app-subscribe/${localIp}`);
                }
            });
            $scope.permissions = {
                inherit: false,
                companyId: "all" //iris.config.me.profile && iris.config.me.profile.companyId ? iris.config.me.profile.companyId : null
            };
            $scope.companies = [];
            CompaniesService.getCompanies().$promise.then(companies => {
                $scope.companies = companies;
                $scope.companies.push({id: "all", name: $translate.instant('label.dms.AllUserGroups')})
                $scope.companies.push({id: "none", name: $translate.instant('label.dms.WithoutCompany')})
            });

            $scope.workflows = workflows.filter((w) => !!w.workflowStates.length);
            $scope.files = files;
            $scope.projects = projects;
            $scope.filtered_files = $scope.files;
            $scope.folder = folder;
            $scope.folder.fileCount = FoldersService.getFolderFilesCount($scope.folder);
            if ($scope.folder.isTrashBin) $scope.sidebar.showSystemFolders = true;

            $scope.selected_file = null;
            $scope.all_folders = FoldersService.getAllFoldersList();

            $scope.currentUser = iris.config.me;
            $scope.breadcrumbs.pathFolders = FoldersService.getPathFolders(folder);

            $scope.actions = FoldersSecurityService.getDMSSecurityActions();

            $scope.user_groups = [];
            UserGroupsService.getUserGroups().$promise.then(function (groups) {
                $scope.user_groups = groups;
            });

            $scope.getFolderPermissions($scope.folder);

            $scope.getUserGroups = function() {
                //var filterCompanyId = $scope.permissions.companyId === "all" ? $scope.projects.filter(p => p.id == $scope.folder.projectId)[0].companyId : $scope.permissions.companyId;
                //return $scope.user_groups.filter(g => g.companyId == filterCompanyId);
                if($scope.permissions.companyId === "all") return $scope.user_groups;
                return $scope.user_groups.filter(g => $scope.permissions.companyId === "none" && g.companyId == null || g.companyId == $scope.permissions.companyId);
            };

            $scope.updateAppState = function () {
                var defer = $q.defer();
                DmsAppService.checkAppState(localIp).then(state => {
                    $scope.appState.active = state.isInstalled;
                    defer.resolve($scope.appState);
                });
                return defer.promise;
            };
            $scope.updateAppState();

            $scope.setPermission = function (user_group_id, action, permission) {
                //if permission exists - remove, otherwise update
                //todo refactor if performance needed
                if ($scope.hasFolderPermission(user_group_id, action) == permission) {
                    var perm = getPermByUGAndAction(user_group_id, action);
                    FoldersSecurityService.removePermission(perm.id, $scope.permissions.inherit).then(function () {
                        $scope.getFolderPermissions($scope.folder);
                    })
                } else {
                    FoldersSecurityService.setPermission($scope.folder.id, user_group_id, action, permission, $scope.permissions.inherit).then(function () {
                        $scope.getFolderPermissions($scope.folder);
                    });
                }
            };

            $scope.hasFolderPermission = function (user_group_id, action) {
                var permission = getPermByUGAndAction(user_group_id, action);

                if (!permission) return;

                return permission.allowed;
            };

            var getPermByUGAndAction = function (user_group_id, action) {
                var user_group_permissions = $filter('filter')($scope.folder_permissions, {id: user_group_id}, true);

                if (!user_group_permissions || !user_group_permissions.length) return;

                var subject = user_group_permissions[0].subjects[0];

                var action_permissions = $filter('filter')(subject.permissions, {action: action}, true);

                if (!action_permissions || !action_permissions.length) return;

                return action_permissions[0];
            };

            $scope.$on('dms.folder.modified', ()=>{
                $scope.updateFolder();
            });
            $scope.$on("dms.files.moved", ()=>{
                $scope.updateFolderFiles();
            });

            $scope.$watch('filter.text', $scope.applyFilesFilter);

            $scope.getFileWorkflowColor = function(file) {
                var workflow = workflows.filter((w) => w.id == file.workflowId);
                return workflow.length ? workflow[0].color : null;
            };

            function updateUserSettigns(){
                UserSettingsService.saveUserSettings('dms-files-grid-config-v2', $scope.dmsGridConfig, iris.config.me.id)
                    .then(res => angular.extend($scope.dmsGridConfig, res));
            }

            $scope.setActionsVisibility = function (action) {
                let actions = $scope.dmsGridConfig.settings.actions;
                actions.visibility[action] = !actions.visibility[action];
                updateUserSettigns();
            };

            $scope.gridOptions = {
                data: 'filtered_files',
                minRowsToShow: 100,
                enableFullRowSelection: false,
                enableSelectAll: true,
                selectionRowHeaderWidth: 35,
                enableGridMenu: !$scope.folder.isTrashBin,
                multiSelect: true,
                columnDefs: !$scope.folder.isTrashBin ? $scope.filesGridDefaultColDefs : $scope.filesGridIsTrashDefaultColDefs,
                rowTemplate: `<div ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name"
                               class="ui-grid-cell"
                               ng-class="{ 'ui-grid-row-header-cell': col.isRowHeader, 'row-selected':row.entity.id == grid.appScope.selected_file.id}"
                               ui-grid-cell></div>`,
                onRegisterApi: function (gridApi) {
                    $scope.gridOptions.gridAPI = gridApi;

                    gridApi.selection.on.rowSelectionChanged($scope, function (row, event) {
                        $scope.selectFile(row.entity);
                    });

                    gridApi.selection.on.rowSelectionChangedBatch($scope, function (rows) {
                        for (var i in rows) {
                            $scope.selectFile(rows[i].entity);
                        }
                    });

                    //After going to folder from search result - select file
                    if($stateParams.file) {
                        $timeout(function () {
                            for(var file of files) {
                                if(file.id == $stateParams.file) {
                                    $scope.gridOptions.gridAPI.selection.selectRow(file);
                                    break;
                                }
                            }
                        });
                    }

                    if (!$scope.folder.isTrashBin) {
                        gridApi.core.on.columnVisibilityChanged( $scope, function (changedColumn) {
                            $scope.dmsGridConfig.settings.columns.visibility[changedColumn.colDef.name] = changedColumn.colDef.visible;
                            updateUserSettigns();
                        });

                        gridApi.colMovable.on.columnPositionChanged($scope, function(colDef, originalPosition, newPosition) {
                            let order = $scope.dmsGridConfig.settings.columns.order;
                            order.splice(originalPosition - 1, 1);
                            order.splice(newPosition - 1, 0, colDef.name);
                            updateUserSettigns();
                        });
                    }
                }
            };

            $scope.restore = function (fileId) {
                iris.loader.start('.app-content');
                FilesService.restore(fileId).then(() => {
                    $scope.updateFolder().then(() => {
                        $scope.filtered_files.splice($scope.filtered_files.findIndex(f => f.id == fileId), 1);
                        iris.loader.stop('.app-content');
                    });
                })
            };

            $scope.previewAllowed = function (file) {
                return FilesService.previewAllowed(file);
            };

            $scope.openPreviewAttachment = function (file, attachment) {
                var urls = {
                    previewUrl: FilesService.getAttachmentPreviewUrl(file.id, attachment.id),
                    downloadUrl: FilesService.getAttachmentDownloadUrl(file.id, attachment.id),

                };
                FilesService.openPreviewFile(attachment.id, attachment, urls);
            };

            $scope.moveAttachmentToCurrentFolder = function (file_id, attachment_id, target_folder_id) {
                iris.loader.start('.app-content');
                FilesService.copyAttachmentToFolder(file_id, attachment_id, target_folder_id, true).then(() => {
                    $scope.updateFolder().then(() => {
                        iris.loader.stop('.app-content');
                    });
                })
            };

            $scope.openEditFileLocal = function (file) {
                iris.loader.start('.app-content');
                $scope.updateAppState().then(state => {
                    if(!state.active) {
                        alertify.error($translate.instant('label.dms.CheckoutPluginNotRunning'));
                        return;
                    }
                    FilesService.localEdit(file.id, $scope.localIp).then(file => {
                        iris.loader.stop('.app-content');
                    });
                });
            };

            //Open full path to selected folder
            FoldersService.expandToFolder(folder);

            $scope.openUploaderForm = function () {
                $uibModal.open({
                    templateUrl: iris.config.moduleUrl + '/templates/dms.uploader.html',
                    controller: 'DmsFilesUploadCtrl',
                    resolve: {
                        'folder': function () {
                            return $scope.folder;
                        },
                        'workflows': function () {
                            return $scope.workflows;
                        },
                        'folderFiles': function () {
                            return FilesService.getFolderFiles(folder.id);
                        },
                        'users': () => iris.data.usersInfo,
                        'languages': () => LangList.query(),
                        'dmsConfig': () => angular.copy($scope.dmsConfig)
                    },
                    size: 'xl'
                }).result.then(function () {
                        $scope.updateFolderFiles();
                    });
            };

            $scope.openChangeStateModal = function (file) {
                if(!file.workflowId) return;

                $uibModal.open({
                    templateUrl: iris.config.moduleUrl + '/templates/dms.file.workflow.change-state.modal.html',
                    controller: 'DmsFileChangeWfStateCtrl',
                    resolve: {
                        'file': function () {
                            return file;
                        },
                        'workflowStates': function (WorkflowService) {
                            if(!file.workflowId) return [];

                            return file.workflowStateId
                                ? WorkflowService.getWorkflowNextStates(file.workflowId, file.workflowStateId)
                                : WorkflowService.getWorkflowStates(file.workflowId);
                        }
                    }
                }).result.then(function () {
                    $scope.updateFolderFiles();
                    });
            };

            $scope.removeFile = function (file) {
                alertify.confirm($translate.instant('text.dms.FileRemoveConfirm'), function (e) {
                    if (e) {
                        FilesService.remove(file.id).then(function () {
                            alertify.success($translate.instant('label.dms.FileRemoved'));
                            $scope.updateFolderFiles();
                        });
                    }
                });
            };

            $scope.openEditFile = function (file) {
                $uibModal.open({
                    templateUrl: iris.config.moduleUrl + '/templates/dms.files.edit.html',
                    controller: 'DmsFileEditCtrl',
                    resolve: {
                        'file': function () {
                            return file;
                        },
                        'workflows': function () {
                            return $scope.workflows;
                        },
                        'users': () => iris.data.usersInfo,
                        'languages': () => LangList.query(),
                        'dmsConfig': () => angular.copy($scope.dmsConfig)
                    }
                }).result.then(function () {
                    $scope.updateFolderFiles();
                    });
            };

            $scope.openUploadNewVersion = function (file) {
                $uibModal.open({
                    templateUrl: iris.config.moduleUrl + '/templates/docs.uploadNewVersion.html',
                    controller: 'DmsFileUploadCtrl',
                    resolve: {
                        'file': function () {
                            return file;
                        }
                    }
                }).result.then(function () {
                    $scope.updateFolderFiles();
                    });
            };

            function openSelectFolderModal(label) {
                return $uibModal.open({
                    templateUrl: iris.config.moduleUrl + '/templates/dms.files.move.html',
                    controller: 'DmsFileMoveCtrl',
                    size:'sm',
                    resolve: {
                        'folder': () => $scope.folder,
                        'enable_root': () => false,
                        'is_folder_moved': () => false,
                        'action_label': () => label || "Move"
                    }
                }).result;
            }

            $scope.openMoveFiles = function (file) {
                var selected_files_ids = !file ? $scope.getSelectedFilesIds() : [file.id];
                openSelectFolderModal("Move").then(function (target_folder) {
                    iris.loader.start();
                    var promises = selected_files_ids.map(fileId => FilesService.moveToFolder(fileId, target_folder.id));
                    $q.all(promises).then(function() {
                        alertify.success($translate.instant('label.dms.FilesMoved'));
                        $scope.updateFolderFiles();
                        iris.loader.stop();
                    })
                });
            };

            $scope.openCopyFiles = function (file) {
                var selected_files_ids = !file ? $scope.getSelectedFilesIds() : [file.id];
                openSelectFolderModal("Copy").then(function (target_folder) {
                    iris.loader.start();
                    var promises = selected_files_ids.map(fileId => FilesService.copyToFolder(fileId, target_folder.id));
                    $q.all(promises).then(function() {
                        alertify.success($translate.instant('label.dms.FilesCopied'));
                        $scope.updateFolderFiles();
                        iris.loader.stop();
                    })
                });
            };

            $scope.toggleLockedFile = function (file) {
                FilesService.toggleLockedFile(file).then(function (file) {
                    $scope.file = file;
                    $scope.updateSelectedFile();
                });
            };

            $scope.shareFile = function (file) {
                $uibModal.open({
                    templateUrl: iris.config.moduleUrl + '/templates/dms.files.share.html',
                    controller: 'DmsFileShareModalCtrl',
                    resolve: {
                        'file': function () { return file; },
                        'FilesService' : function() { return FilesService; }
                    }
                });
            };

            $scope.openToggleInProgress = function (file) {
                $scope.updateAppState();
                $uibModal.open({
                    templateUrl: iris.config.moduleUrl + '/templates/dms.files.toggle-in-progress.html',
                    controller: 'DmsFileToggleInProgressModalCtrl',
                    scope: $scope,
                    resolve: {
                        'dmsAppState': function (DmsAppService) {
                            return DmsAppService.getIP().then(ip => {
                                //console.log(ip);
                                ip = '172.17.42.1';
                                return DmsAppService.checkAppState(ip).then(state => {
                                    //console.log(state);
                                    return {
                                        ip: ip,
                                        active: state.isInstalled
                                    }
                                });
                            });
                        }
                    }
                }).result.then(isOpenUpload => {
                        if(isOpenUpload) $scope.openUploadNewVersion($scope.selected_file);
                    });
            };

            $scope.openWorkflowStatesDiagram = function (workflowId) {
                $uibModal.open({
                    templateUrl: iris.config.componentsUrl + '/global-settings/templates/workflows/ms.workflows.workflow.states.diagram.html',
                    controller: 'ModuleWorkflowStatesDiagramCtrl',
                    size: 'lg',
                    resolve: {
                        'states': function (WorkflowService) {
                            return WorkflowService.getWorkflowStates(workflowId);
                        }
                    }
                })
            };

            $scope.removeSelectedFiles = function () {
                alertify.confirm($translate.instant('text.dms.FilesRemoveConfirm'), function (e) {
                    if (e) {
                        iris.loader.start('.app-body-container');
                        var promises = [];
                        for (var file of $scope.files) {
                            if (!file.selected) continue;
                            promises.push(FilesService.remove(file.id));
                        }
                        $q.all(promises).then(function () {
                            iris.loader.stop();
                            alertify.success($translate.instant('text.FilesRemoved'));
                            $scope.updateFolderFiles();
                        })
                    }
                });
            };

            $scope.openSendMessageModal = function () {
                iris.loader.start('.app-body');

                var selected_files = $scope.gridOptions.gridAPI.selection.getSelectedRows();

                MailService.openSendMailModal(null, selected_files);
            };

            $scope.getWorkflowStateName = function (workflowId, workflowStateId) {
                var workflows = $scope.workflows.filter(w => w.id == workflowId);
                if(!workflows.length) return;

                var workflowStates = workflows[0].workflowStates.filter(s => s.id == workflowStateId);
                if(!workflowStates.length) return;

                return workflowStates[0].name;
            };

            $scope.hasLinkToMaps = function(file) {
                if (file && file.layerId && file.markerId) {
                    if (!file.markerNotFound && !file.goToMapsLink) {
                        /* first time call with given file */
                        file.markerNotFound = true;
                        DmsMapsService.requestLayerById(file.layerId).then(layer => {
                            DmsMapsService.requestMarkerById(file.layerId, file.markerId)
                                .then(marker => {
                                    if (marker.layer_id == file.layerId) {
                                        file.goToMapsLink = FilesService.goToMaps(layer, marker);
                                        file.markerNotFound = false;
                                    }
                                })
                        })
                    }
                    return !file.markerNotFound && file.goToMapsLink;
                }
                return false;
            };

            $scope.goToMaps = function (file) {
                $window.open(file.goToMapsLink, '_blank');
            };

            $scope.refreshUrl = function(file) {
                $timeout(function() {
                    file.url = FoldersService.getUploadUrl(folder);

                    if (file.ownerId) {
                        file.url += (file.url.indexOf("?") > 0 ? "&" : "?") + `ownerId=${file.ownerId}`;
                    }

                    $scope.uploader.uploadAll();
                });
            };

            $scope.uploader = new FileUploader({
                url: FoldersService.getUploadUrl(folder),
                onAfterAddingFile: function (item) {
                    iris.loader.start('.app-body-container');
                    item.ownerId = iris.config.me.id;
                    $scope.refreshUrl(item);
                },
                onErrorItem: function(fileItem, response, status, headers) {
                    iris.loader.stop();
                    alertify.error($translate.instant('text.dms.FileUploadedError') + ": " + fileItem.file.name);
                    $scope.hasErrors = true;
                },
                onCompleteAll: function () {
                    iris.loader.stop();
                    $scope.$broadcast('dms.folder.modified');
                    if (!$scope.hasErrors) alertify.success($translate.instant('text.dms.FilesUploadedSuccess'));
                }
            });

            $scope.openPreviousVersionsModal = function (folder, file) {
                return $uibModal.open({
                    templateUrl: iris.config.moduleUrl + '/templates/dms.files.previous-versions.html',
                    size: 'lg',
                    controller: 'DmsPreviousVersionsCtrl',
                    resolve: {
                        'file': () => file,
                        'folder': () => folder
                    }
                }).result;
            };

            $scope.toggleAsFavorite = function (file_id) {
                FilesService.toggleFavorite(file_id).then(file => $scope.filtered_files.find(f => f.id === file.id).isFavorite = file.isFavorite);
            };
        });

})();