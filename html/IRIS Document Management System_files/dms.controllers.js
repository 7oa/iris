(function() {

angular.module('irisApp').controller('DmsFoldersCtrl',
    function ($scope, $uibModal, $state, $stateParams, $translate, $rootScope, $q, $timeout, projects, FoldersService,
              FilesService, FileUploader, smartFoldersSettings, UserSettingsService, hiddenSystemFolders) {
        iris.loader.stop();
        $scope.folders = FoldersService.getFolders();
        $scope.projects = projects;
        $scope.folderUploaders = {};
        $scope.smartFolders = smartFoldersSettings.settings.smartFolders;

        function uploadFile(uploader, folder, file) {
            $timeout(function() {
                file.url = FoldersService.getUploadUrl(folder);

                if (file.ownerId) {
                    file.url += (file.url.indexOf("?") > 0 ? "&" : "?") + `ownerId=${file.ownerId}`;
                }

                uploader.uploadAll();
            });
        }

        $scope.getFolderUploader = function(folder) {
            if (!$scope.folderUploaders[folder.id]) {
                $scope.folderUploaders[folder.id] = new FileUploader({
                    url: FoldersService.getUploadUrl(folder),
                    onAfterAddingFile: function (item) {
                        iris.loader.start('.app-body-container');
                        item.ownerId = iris.config.me.id;
                        uploadFile(this, folder, item);
                    },
                    onErrorItem: function (fileItem) {
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
            }

            return $scope.folderUploaders[folder.id];
        };

        function updateFolders() {
            FoldersService.requestFolders();
        }
        $scope.$on('dms.folder.content-changed', updateFolders);

        $scope.sidebar.showSystemFolders = false;
        $scope.dmsSystemFolders = function (folder) {
            return folder.isSystem && $scope.sidebar.showSystemFolders || !folder.isSystem
        };

        $scope.toggleCollapseFolders = function (expanded) {
            FoldersService.toggleCollapseFolders($scope.folders, expanded);
        };

        $scope.toggleFolderCollapsed = function (folder) {
            FoldersService.toggleCollapsed(folder);
        };

        $scope.importZipFolder = function(target_folder_id, format) {
            format = format || 'ZIP';
            if (!target_folder_id) target_folder_id = "root";
            $scope.openImportZip(target_folder_id, format);
        };

        $scope.getExportXlsFolder = function(target_folder_id) {
            return FoldersService.getExportXlsFolder(target_folder_id);
        };

        $scope.openImportZip = function (targetFolderId, format) {
            $uibModal.open({
                templateUrl: iris.config.moduleUrl + '/templates/docs.uploadZip.html',
                controller: 'DmsZipUploadCtrl',
                resolve: {
                    'projects': function() {
                        return $scope.projects;
                    },
                    'targetFolderId': function () {
                        return targetFolderId;
                    },
                    'format': function () {
                        return format
                    }
                }
            }).result.then(function () {
                    $state.go($state.current, $state.params, {reload: true});
                });
        };
        $scope.setSelectedFolder = function (folder) {
            $scope.sidebar.is_folder_info_shown = !!($scope.sidebar.is_folder_info_shown && $state.params.folder_id && $state.params.folder_id == folder.id ? null : folder);
        };
        $scope.removeFolder = function (folder) {
            alertify.confirm($translate.instant('text.dms.FolderRemoveConfirm'), function (e) {
                if (e) {
                    FoldersService.remove(folder).then(function () {
                        alertify.success($translate.instant('text.dms.FolderRemoved'));
                        if ($state.includes('dms.folders.files')) {
                            if ($state.params.folder_id == folder.id || FoldersService.findChildById(folder, $state.params.folder_id) != null) {
                                if (folder.parentId == "/" || folder.parentId == null) {
                                    $scope.breadcrumbs.pathFolders = [];
                                    $state.go('dms.folders');
                                } else {
                                    $state.go('dms.folders.files', {folder_id: folder.parentId});
                                }
                            }
                        }
                    });
                }
            });
        };

        $scope.folderDrop = function(dragData, dropData) {
            var dropFolderId = dropData["folderId"];
            if (!dropFolderId) return;

            var dragFileIds = dragData.getData("getterData");
            dragFileIds && (dragFileIds = dragFileIds.split(","));
            dragFileIds || (dragFileIds = []);

            var dragFileId = dragData.getData("fileId");
            if (dragFileId && dropFolderId) {
                if (dropFolderId == $state.params.folder_id) return;
                dragFileIds = dragFileIds.indexOf(dragFileId) >= 0 ? dragFileIds : [dragFileId];

                iris.loader.start();
                var promises = dragFileIds.map(fileId => FilesService.moveToFolder(fileId, dropFolderId));
                $q.all(promises).then(function() {
                    alertify.success($translate.instant('label.dms.FilesMoved'));
                    $scope.$broadcast("dms.files.moved");
                    iris.loader.stop();
                });
            }

            var dragFolderId = dragData.getData("folderId");
            if (dragFolderId && dropFolderId && dragFolderId != dropFolderId) {
                iris.loader.start();
                FoldersService.moveToFolder(dragFolderId, dropFolderId).then(function () {
                    alertify.success($translate.instant('text.dms.FolderMoved'));
                    iris.loader.stop();
                });
            }
        };

        $scope.toggleLockedFolder = function (folder) {
            FoldersService.toggleLockedFolder(folder).then(function (folder) {
                $scope.folder = folder;
                alertify.success($translate.instant(folder.isLocked ? 'text.dms.FolderLocked' : 'text.dms.FolderUnlocked'));
                notifyFolderModified(folder.id);
            });
        };

        $scope.getFolderDownloadUrl = function (folder_id) {
            return FoldersService.getFolderDownloadUrl(folder_id);
        };

        function openSelectFolderModal(folder, label) {
            return $uibModal.open({
                templateUrl: iris.config.moduleUrl + '/templates/dms.files.move.html',
                controller: 'DmsFileMoveCtrl',
                size:'sm',
                resolve: {
                    'folder': () => folder,
                    'enable_root': () => folder.parentId != null,
                    'is_folder_moved': () => true,
                    'action_label': () => label || "Move"
                }
            }).result;
        }

        $scope.openMoveFolder = function (folder) {
            openSelectFolderModal(folder, "Move").then(function (target_folder) {
                iris.loader.start();
                target_folder = target_folder || {id: null};
                FoldersService.moveToFolder(folder.id, target_folder.id).then(function () {
                    alertify.success($translate.instant('text.dms.FolderMoved'));
                    iris.loader.stop();
                });
            });
        };

        $scope.openCopyFolder = function (folder) {
            openSelectFolderModal(folder, "Copy").then(function (target_folder) {
                iris.loader.start();
                target_folder = target_folder || {id: null};
                FoldersService.copyToFolder(folder.id, target_folder.id).then(function () {
                    alertify.success($translate.instant('text.dms.FolderCopied'));
                    iris.loader.stop();
                });
            });
        };

        $scope.hideSystemFolders = function (folder) {
            if (folder && !folder.isSystem) return true;
            if (hiddenSystemFolders.findIndex(f => f === folder.name) !== -1) return false;
            return true;
        }

        $scope.$on('updateSmartFolders', function (event, data) {
            $scope.smartFolders = data;
        });

        $scope.deleteSmartFolder = function (smartFolerId) {
            alertify.confirm($translate.instant('message.DeleteItemConfirm'), function (e) {
                if (e) {
                    $scope.smartFolders.splice($scope.smartFolders.findIndex(f => f.id === smartFolerId), 1);
                    UserSettingsService.saveUserSettings('dms-smart-folders', smartFoldersSettings, iris.config.me.id);
                }
            });
        };
    });

angular.module('irisApp').controller('DmsFilesBaseCtrl',
    function ($scope, $uibModal, $filter, $timeout, $interpolate, $translate, workflowsFull, FilesService, TasksService) {
        $scope.selected_file = null;
        $scope.workflowsFull = workflowsFull;
        $scope.permissions = {
            inherit: false
        };

        $scope.getSelectedFilesIds = function () {
            var selected_files_ids = [];
            var selected_files = $filter('filter')($scope.files, {selected: true});
            for (var i = 0, c = selected_files.length; i < c; i++) {
                var file = selected_files[i];
                selected_files_ids.push(file.id);
            }
            return selected_files_ids;
        };

        $scope.getFileIcon = function (mime_type) {
            return FilesService.getIcon(mime_type);
        };

        $scope.getFileDownloadUrl = function (file_id) {
            return FilesService.getFileDownloadUrl(file_id);
        };

        $scope.getAttachmentDownloadUrl = function (file_id, attachment_id) {
            return FilesService.getAttachmentDownloadUrl(file_id, attachment_id);
        }

        $scope.getTaskUrl = function(task) {
            return TasksService.getTaskViewUrl(task.id);
        };

        $scope.updateSelectedFile = function (file) {
            if(!$scope.selected_file && !file) return;
            if (file) $scope.selected_file = file;

            if ($scope.selected_file.attachedIn && $scope.selected_file.attachedIn.length) {
                $scope.selected_file.tasks = [];
                TasksService.getByFile($scope.selected_file.id).then(tRes => {
                    $scope.selected_file.tasks = tRes;
                });
            }

            var fileWorkflow = $scope.workflowsFull.filter((w) => w.id == $scope.selected_file.workflowId);
            if (fileWorkflow.length === 1) {
                var fileWorkflowState = fileWorkflow[0].workflowStates.filter((s) => s.id == $scope.selected_file.workflowStateId);
                if (fileWorkflowState.length === 1) {
                    $scope.selected_file.workflowState = fileWorkflowState[0];
                    $scope.selected_file.workflowStateValid = fileWorkflowState[0].mergedUsers.filter((u) => u.id == iris.config.me.id).length > 0;
                } else {
                    delete $scope.selected_file.workflowState;
                    delete $scope.selected_file.workflowStateValid;
                }
            }

            $scope.selected_file.versions = $filter('filter')($scope.selected_file.history, {action: "label.dms.Upload"}, true);
            $scope.sidebar.file_tab = 'info';

            $scope.selected_file.previewType = FilesService.getPreviewType($scope.selected_file);
            if ($scope.selected_file.previewType !== null) {
                //Math.random is needed here to update preview if new image was uploaded (url is not changed otherwise)
                $scope.selected_file.previewLink = FilesService.getFilePreviewUrl($scope.selected_file.id) + '&version=' + Math.random(1000);
            }

            $scope.selected_file.history.forEach(h => h.params = !h.args ? {} : h.args.reduce((res, next, i) => {
                res[`p${i}`] = next;
                return res;
            }, {}))

            var url = $interpolate(location.origin + "{{page}}/folders/{{folderId}}/files?file={{fileId}}")({
                page: iris.config.pageUrl,
                folderId: $scope.selected_file.parentId,
                fileId: $scope.selected_file.id
            });
            $scope.selected_file_dms_link = url;

            if ($scope.selected_file.thumbId)
                $scope.selected_file.thumbLink = FilesService.getFilePreviewUrl($scope.selected_file.thumbId) +
                    '&version=' + Math.random(1000);
        };

        $scope.setSelectedFile = function (file) {
            $scope.selected_file = $scope.sidebar.is_file_info_shown && $scope.selected_file && $scope.selected_file.id == file.id ? null : file;
            $scope.sidebar.is_file_info_shown = !!$scope.selected_file;
            if ($scope.selected_file) {
                $scope.updateSelectedFile();
            }
        };

        $scope.selectFile = function (entity) {
            let index = $scope.files.findIndex(f => f.id === entity.id);
            if (index !== -1) $scope.files[index].selected = !$scope.files[index].selected;
        };

        $scope.openPreviewFile = function (file, version) {
            if (version) {
                FilesService.openPreviewVersion(file.id, version.id, file);
            } else {
                FilesService.openPreviewFile(file.id, file);
            }
        };

        $scope.getSelectedFilesDownloadUrl = function () {
            return FilesService.getSelectedFilesDownloadUrl($scope.getSelectedFilesIds());
        };

        $scope.getVersionDownloadUrl = function (file, version) {
            return FilesService.getVersionDownloadUrl(file.id, version.id);
        };
    });

angular.module('irisApp').controller('DmsFileShareModalCtrl',
    function ($scope, $translate, $interpolate, $timeout, file, FilesService, LinksService) {
        $scope.linkSettings = {
            validFor: 3,
            isPermalink: false
        };

        $scope.link = null;

        $scope.targetFile = file;

        $scope.generateLink = function() {
            console.log($scope);
            FilesService.share(file, $scope.linkSettings.validFor, $scope.linkSettings.isPermalink).then(function(link) {
                $scope.showLink(LinksService.getLinkUrl(link));
            });
        };

        $scope.showLink = function(link) {
            $scope.link = link;
        };
    });
})();
