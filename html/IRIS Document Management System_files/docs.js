(function() {

    angular.module('iris_docs').factory('Folders', function ($resource) {
        return $resource(iris.config.apiUrl + "/dms/folders/:id/:action/:target_folder_id", {
            id: '@id',
            action: '@action',
            target_folder_id: '@target_folder_id'
        },{
            toggleLocked: {
                method: 'POST',
                params: {action: 'toggle-locked'}
            },
            moveToFolder: {
                method: 'POST',
                params: {action: 'move-to'}
            },
            copyToFolder: {
                method: 'POST',
                params: {action: 'copy-to'}
            }
        });
    });

    angular.module('iris_docs').factory('Files', function ($resource) {
        return $resource(iris.config.apiUrl + "/dms/files/:id/:action/:target_folder_id", {
            id: '@id',
            action: '@action',
            target_folder_id: '@target_folder_id'
        },{
            toggleLocked: {
                method: 'POST',
                params: {action: 'toggle-locked'}
            },
            toggleInProgress: {
                method: 'POST',
                params: {action: 'toggle-in-progress'}
            },
            moveToFolder: {
                method: 'POST',
                params: {action: 'move-to'}
            },
            copyToFolder: {
                method: 'POST',
                params: {action: 'copy-to'}
            },
            removeVersion: {
                url: iris.config.apiUrl + "/dms/files/:fileId/versions/:versionId",
                method: 'DELETE',
                params: {fileId: '@fileId', versionId: '@versionId'}
            },
            share: {
                url: iris.config.apiUrl + "/dms/files/:fileId/share?end-date=:endDate&permalink=:permalink",
                method: 'POST',
                params: {fileId: '@fileId', endDate: '@endDate', permalink: '@permalink'}
            },
            changeWorkflowState: {
                url: iris.config.apiUrl + "/dms/files/:fileId/change-state/:stateId",
                method: 'POST',
                params: {fileId: '@fileId', stateId: '@stateId'}
            },
            saveFileInfo: {
                url: iris.config.apiUrl + "/dms/files/:fileId/info",
                method: 'POST',
                params: {fileId: '@fileId'}
            },
            getFilesByIds: {
                url: iris.config.apiUrl + "/dms/files?files-ids=:fileIds",
                method: 'GET',
                params: {fileIds: '@fileIds'},
                isArray: true
            },
            localEdit: {
                url: iris.config.apiUrl + "/dms/files/:fileId/content/local-edit?ip=:ip",
                method: 'POST',
                params: {
                    fileId: "@fileId",
                    ip: "@ip"
                }
            },
            restore: {
                url: iris.config.apiUrl + "/dms/files/:id/restore",
                method: 'POST',
                params: {
                    id: "@id"
                }
            },
            toggleInFavorite: {
                method: 'POST',
                params: {
                    id: '@id',
                    action: 'toggle-favorite'
                }
            },
        });
    });

    angular.module('iris_docs').factory('Links', function ($resource) {
        return $resource(iris.config.apiUrl + "/dms/links/:id/:action", {
            id: '@id',
            action: '@action'
        },{
            toggleActive: {
                method: 'POST',
                params: {action: 'toggle-active'}
            }
        });
    });

    angular.module('iris_docs').factory('DmsAppBundles', function ($resource) {
        return $resource(iris.config.apiUrl + "/dms/dmsapp/bundles/:bundleName", {
            bundleName: '@bundleName'
        }, {
            checkAppState: {
                url: iris.config.apiUrl + "/dms/files/subscribe/check?ip=:ip",
                method: 'GET',
                params: {
                    ip: '@ip'
                }
            }
        });
    });

    angular.module('iris_docs').factory('FilesSearch', function ($resource) {
        return $resource(iris.config.apiUrl + "/dms/files/search");
    });

    angular.module('iris_docs').factory('Mail', function ($resource) {
        return $resource(iris.config.apiUrl + "/dms/mail");
    });

    angular.module('iris_docs').factory('FolderFiles', function ($resource) {
        return $resource(iris.config.apiUrl + "/dms/folders/:folder_id/files/:id", {
            id: '@id',
            folder_id: '@folder_id'
        });
    });

    angular.module('iris_docs').factory('FileAttachments', function ($resource) {
        return $resource(iris.config.apiUrl + "/dms/files/:file_id/attachments/:id/:action/:target_folder_id", {
            id: '@id',
            file_id: '@file_id',
            target_folder_id: '@target_folder_id'
        },{
            copyToFolder: {
                method: 'POST',
                    params: {action: 'copy-to'}
            }
        });
    });

    angular.module('iris_docs').factory('FolderSecurity', function ($resource) {
        return $resource(iris.config.apiUrl + "/dms/security/folders/:id/permissions", {
            id: '@id'
        }, {
            setPermission: {
                method: 'POST',
                url: iris.config.apiUrl + "/dms/security/folders/:id/user-groups/:user_group_id/permission?inherit-to-subfolders=:inheritPermissions"
            },
            getAllPermissions: {
                url: iris.config.apiUrl + "/dms/security/permissions",
                isArray: true
            },
            removePermission: {
                method: 'DELETE',
                url: iris.config.apiUrl + "/dms/security/permissions/:permission_id?inherit-to-subfolders=:inheritPermissions"
            }
        });
    });

    angular.module('iris_docs').factory('FoldersService',
        function ($filter, $resource, Folders, FlagsService) {
            var folders = [];
            var expanded_folders = [];

            function deep (folder) {
                if (folder.children.length === 0) {
                    folder.fullFileCount = folder.fileCount;
                    return folder.fullFileCount;
                } else {
                    var c = folder.fileCount || 0;
                    for (var i = 0, l = folder.children.length; i < l; i++) {
                        c += deep(folder.children[i]);
                    }
                    folder.fullFileCount = c;
                    return c;
                }
            }

            return {
                createFolder: function(folder){
                    if(folder && folder.parentId == '/') folder.parentId = null;
                    return new Folders(folder);
                },

                getZipImportUrl: function (targetFolderId, format) {
                    return iris.config.apiUrl + '/dms/folders/' + targetFolderId + (format == 'ZIP' ? '/zip-file' : '/import') + '?token=' + iris.config.accessToken;
                },

                getExportXlsFolder: function (targetFolderId) {
                    return iris.config.apiUrl + '/dms/folders/' + targetFolderId + '/export?token=' + iris.config.accessToken;
                },

                remove: function (folder) {
                    var that = this;
                    return folder.$remove().then(function(data){
                        that.requestFolders();
                        return data;
                    });
                },

                save: function (folder) {
                    var that = this;
                    return folder.$save().then(function(data){
                        that.requestFolders();
                        return data;
                    });
                },

                getAllFoldersList: function () {
                    var all_folders = [];

                    var foldersToList = function (folders) {
                        for (var i = 0; i < folders.length; i++) {
                            var folder = folders[i];
                            all_folders.push(folder);
                            foldersToList(folder.children);
                        }
                    };
                    foldersToList(folders);

                    return all_folders;
                },

                requestFolders: function () {
                    var _this = this;
                    return Folders.query({},function (data) {
                        for (var i = folders.length - 1; i >= 0; i--) {
                            folders.splice(i,1);
                        }
                        for (var i = 0, c = data.length; i < c; i++) {
                            var folder = data[i];
                            folders.push(folder);
                        }

                        (function setFolders(folders) {
                            for (var i = 0, c = folders.length; i < c; i++) {
                                folders[i] = _this.createFolder(folders[i]);
                                setFolders(folders[i].children);
                            }
                        }) (folders);

                        //expand previously expanded folders
                        expanded_folders.forEach(folder_id => _this.toggleCollapsed(_this.getByIdInList(folder_id, true)));

                        for (var i = 0, l = folders.length; i < l; i++) {
                            deep(folders[i]);
                        }

                        return folders;
                    });
                },

                getFolderFilesCount: folder => deep(folder),

                getFolders: function () {
                    if(!folders.length) return this.requestFolders();
                    return folders;
                },

                getById: function(folder_id){
                    return Folders.get({id:folder_id});
                },

                getUploadUrl: function (folder) {
                    return iris.config.apiUrl + '/dms/folders/' + folder.id +  '/files?token=' + iris.config.accessToken;
                },

                toggleLockedFolder: function (folder) {
                    var that = this;
                    return folder.$toggleLocked().then(function(data){
                        that.requestFolders();
                        return data;
                    });
                },

                getFolderDownloadUrl: function (folder_id) {
                    return iris.config.apiUrl + '/dms/folders/' + folder_id +  '/download?token=' + iris.config.accessToken;
                },

                moveToFolder: function (folder_id, target_folder_id) {
                    var that = this;
                    if(target_folder_id !== null) {
                        var target_folder = this.getByIdInList(target_folder_id);
                        this.expandToFolder(target_folder);
                    } else target_folder_id = 'root';
                    return Folders.moveToFolder({id: folder_id, target_folder_id: target_folder_id}).$promise.then(function (res) {
                        that.requestFolders();
                        return res;
                    });
                },

                copyToFolder: function (folder_id, target_folder_id) {
                    var that = this;
                    if(target_folder_id !== null) {
                        var target_folder = this.getByIdInList(target_folder_id);
                        this.expandToFolder(target_folder);
                    } else target_folder_id = 'root';
                    return Folders.copyToFolder({id: folder_id, target_folder_id: target_folder_id}).$promise.then(function (res) {
                        that.requestFolders();
                        return res;
                    });
                },

                getParentsIds: function (folder) {
                    if(!folder) return [];

                    var parent_names = folder.path.split('/');
                    var folders_ids = [];
                    //the index 0 - is root folder
                    var j = 1;
                    (function goThroughFolders(folders){
                        for (var i = 0, c = folders.length; i < c; i++) {
                            if(folders[i].name == parent_names[j]){
                                folders_ids.push(folders[i].id);
                                j++;
                            }
                            if(j < parent_names.length){
                                goThroughFolders(folders[i].children);
                            }
                        }
                    })(folders);
                    return folders_ids;
                },

                getByIdInList: function (folder_id) {
                    var folder = null;
                    (function goThroughFolders(folders){
                        for (var i = 0, c = folders.length; i < c; i++) {
                            if(folders[i].id == folder_id){
                                folder = folders[i];
                                break;
                            }
                            goThroughFolders(folders[i].children);
                        }
                    })(folders);
                    return folder;
                },

                toggleCollapsed: function (folder, expanded) {
                    if(!folder) return;
                    expanded = angular.isDefined(expanded) ? expanded : !folder.expanded;
                    var i = expanded_folders.indexOf(folder.id);
                    folder.expanded = expanded;
                    if(folder.expanded){
                        if(i < 0) expanded_folders.push(folder.id);
                    } else {
                        expanded_folders.splice(i,0);
                    }
                },

                expandToFolder: function (folder) {
                    var parent_folders_ids = this.getParentsIds(folder);
                    for(var folder_id of parent_folders_ids) {
                        if(expanded_folders.indexOf(folder_id) < 0) {
                            this.toggleCollapsed(this.getByIdInList(folder_id));
                        }
                    }
                },

                findChildById: function (folder, child_folder_id) {
                    var child_folder = null;

                    (function goFolders(folders){
                        for (var i = 0, c = folders.length; i < c; i++) {
                            if(folders[i].id == child_folder_id) {
                                child_folder = folders[i];
                                return;
                            }
                            goFolders(folders[i].children);
                        }
                    })(folder.children);

                    return child_folder;
                },

                toggleCollapseFolders: function (folders, expanded) {
                    var _this = this;
                    var operateFolders = function (folders) {
                        for(var folder of folders){
                            if(folder.expanded !== expanded) _this.toggleCollapsed(folder);
                            operateFolders(folder.children);
                        }
                    };
                    operateFolders(folders);
                },

                getFolderFlagIcons: function () {
                    return FlagsService.getFlags();
                },

                getPathFolders: function (folder) {
                    if(!folder) return [];

                    var parent_names = folder.path.split('/');
                    var pathFolders = [];
                    var j = 1;
                    (function goThroughFolders(folders){
                        for (var i = 0, c = folders.length; i < c; i++) {
                            if(folders[i].name == parent_names[j]){
                                pathFolders.push(folders[i]);
                                j++;
                            }
                            if(j < parent_names.length){
                                goThroughFolders(folders[i].children);
                            }
                        }
                    })(folders);
                    return pathFolders;
                }
            }
        });

    angular.module('iris_docs').factory('FoldersSecurityService',
        function (FolderSecurity) {
            var dms_security_actions = [{
                alias: 'read',
                icon: 'fa-eye'
            }, {
                alias: 'update',
                icon: 'fa-pencil'
            }, {
                alias: 'delete',
                icon: 'fa-trash-o'
            }];

            return {
                getFolderPermissions: function (folder_id) {
                    return FolderSecurity.query({id: folder_id}).$promise;
                },

                getDMSSecurityActions: function () {
                    return dms_security_actions;
                },

                setPermission: function (folder_id, user_group_id, action, permission, inheritPermissions) {
                    return FolderSecurity.setPermission({user_group_id: user_group_id, id: folder_id, inheritPermissions: !!inheritPermissions}, {action: action, allowed: permission}).$promise;
                },

                removePermission: function (permission_id, inheritPermissions) {
                    return FolderSecurity.removePermission({permission_id: permission_id, inheritPermissions: !!inheritPermissions}).$promise;
                },

                getAllPermissions: function () {
                    return FolderSecurity.getAllPermissions().$promise;
                },

                transformPermissions: function (data) {
                    var permissions = {};

                    for(var group of data){
                        permissions[group.id] = permissions[group.id] || {};

                        var group_perms = permissions[group.id];
                        for(var subject of group.subjects) {
                            group_perms[subject.subjectId] = group_perms[subject.subjectId] || {};

                            var gs_perms = group_perms[subject.subjectId];
                            for(var permission of subject.permissions) {
                                gs_perms[permission.action] = permission.allowed;
                            }
                        }
                    }

                    return permissions;
                },

                //check permissions by user's user groups
                hasUGPermission: function (permissions, subjectId, user, action) {
                    if(user.isAdmin) return true;

                    var allowed = null;

                    for(var ug of user.userGroups) {
                        if(permissions[ug.id] && permissions[ug.id][subjectId] && angular.isDefined(permissions[ug.id][subjectId][action])) {
                            var perm = permissions[ug.id][subjectId][action];
                            allowed = allowed || perm;
                            allowed = allowed && perm;
                        }
                    }

                    return allowed;
                }
            }
        });

    angular.module('iris_docs').factory('DmsMapsService',
        function (Markers, Layers) {
            return {
                requestMarkerById: function (layer_id, id) {
                    return Markers.get({layer_id, id}).$promise
                },

                requestLayerById: function (id) {
                    return Layers.get({id}).$promise
                }
            }
        });

    angular.module('iris_docs').factory('FilesService',
        function ($filter, $interpolate, $resource, $translate, $uibModal, Files, FolderFiles, FilesSearch, FoldersService,
                  FileAttachments) {
        const WORD_MIME_TYPES = ['application/msword','application/vnd.oasis.opendocument.text',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.template',
            'application/vnd.ms-word.template.macroenabled.12',
            'application/vnd.ms-word.document.macroenabled.12',
            'application/vnd.oasis.opendocument.text-master',
            'application/vnd.oasis.opendocument.text-template',
            'application/vnd.sun.xml.writer',
            'application/vnd.sun.xml.writer.global'];
        const EXCEL_MIME_TYPES = ['application/vnd.ms-excel',
            'application/vnd.ms-excel.sheet.macroenabled.12',
            'application/vnd.ms-excel.template.macroenabled.12',
            'application/vnd.sun.xml.calc',
            'application/vnd.oasis.opendocument.spreadsheet',
            'application/vnd.oasis.opendocument.spreadsheet-template',
            'application/vnd.sun.xml.calc.template',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.template'];
        const POWERPOINT_MIME_TYPES = ['application/vnd.ms-powerpoint',
            'application/vnd.ms-powerpoint.addin.macroenabled.12',
            'application/vnd.ms-powerpoint.slide.macroenabled.12',
            'application/vnd.ms-powerpoint.slide.macroenabled.12',
            'application/vnd.ms-powerpoint.slideshow.macroenabled.12',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'application/vnd.openxmlformats-officedocument.presentationml.slide',
            'application/vnd.openxmlformats-officedocument.presentationml.slideshow',
            'application/vnd.openxmlformats-officedocument.presentationml.slideshow',
            'application/vnd.sun.xml.impress',
            'application/vnd.sun.xml.impress.template',
            'application/vnd.sun.xml.impress.template',
            'application/vnd.sun.xml.impress.template'];
        const ARCHIVE_MIME_TYPES = ['application/zip',
            'application/x-rar-compressed',
            'application/x-7z-compressed',
            'application/x-tar',
            'application/x-ace-compressed',
            'application/x-bzip',
            'application/x-bzip2',
            'application/java-archive',
            'application/vnd.ms-cab-compressed'];
        const MESSAGE_MIME_TYPES = ['message/rfc822', 'application/vnd.ms-outlook'];
        const HIDDEN_SYSTEM_FOLDERS = ['Thumbnails'];

            return {
                getFileById: function (id) {
                    return Files.get({id}).$promise;
                },

                getFilesByIds: function(fileIds) {
                    return Files.getFilesByIds({fileIds: angular.toJson(fileIds)}).$promise;
                },

                goToDMS: function (folderId, fileId) {
                    return $interpolate("dms/folders/{{folderId}}/files?file={{fileId}}")({folderId, fileId});
                },

                goToMaps: function (layer, marker) {
                    return $interpolate("maps/maps?X={{marker.position.lon}}&Y={{marker.position.lat}}&project={{layer.project_id}}&zoom=12&layers={{layer.id}}&map=osm&markers={{marker.id}}")({marker, layer});
                },

                getFileDownloadUrl: function (file_id) {
                    return this.getFileContentUrl(file_id) + '?download=true&token=' + iris.config.accessToken;
                },

                getAttachmentDownloadUrl: function (file_id, attachment_id) {
                    return this.getAttachmentContentUrl(file_id, attachment_id) + '?download=true&token=' + iris.config.accessToken;
                },

                getVersionDownloadUrl: function (file_id, version_id) {
                    return this.getVersionContentUrl(file_id, version_id) + '?download=true&token=' + iris.config.accessToken;
                },

                getFileContentUrl: function (file_id) {
                    return iris.config.apiUrl + '/dms/files/' + file_id +  '/content';
                },

                getAttachmentContentUrl: function (file_id, attachment_id) {
                    return iris.config.apiUrl + '/dms/files/' + file_id +  '/attachments/' + attachment_id + "/content";
                },

                getVersionContentUrl: function (file_id, version_id) {
                    return iris.config.apiUrl + '/dms/files/' + file_id + '/version/' + version_id +  '/content';
                },

                getFilePreviewUrl: function (file_id) {
                    return this.getFileContentUrl(file_id) + '?download=false&token=' + iris.config.accessToken;
                },

                getAttachmentPreviewUrl: function (file_id, attachment_id) {
                    return this.getAttachmentContentUrl(file_id, attachment_id) + '?download=false&token=' + iris.config.accessToken;
                },

                getVersionPreviewUrl: function (file_id, version_id) {
                    return this.getVersionContentUrl(file_id, version_id) + '?download=false&token=' + iris.config.accessToken;
                },

                previewAllowed: function (file) {
                    //console.log(file.mimeType);
                    if (!file || !file.mimeType) return false;
                    var info = file.mimeType.split('/'),
                        list_0 = ['image', 'text'],
                        list_1 = ['pdf'];
                    return list_0.indexOf(info[0]) >= 0
                        || list_1.indexOf(info[1]) >= 0
                        || file.mimeType == 'image/vnd.dwg'
                        || WORD_MIME_TYPES.indexOf(file.mimeType) >= 0
                        || POWERPOINT_MIME_TYPES.indexOf(file.mimeType) >= 0
                        || EXCEL_MIME_TYPES.indexOf(file.mimeType) >= 0
                        || MESSAGE_MIME_TYPES.indexOf(file.mimeType) >= 0;
                },

                getPreviewType: function (file) {
                    var that = this;

                    if (file.mimeType.indexOf('pdf') >= 0
                        || file.mimeType == 'image/vnd.dwg'
                        || WORD_MIME_TYPES.indexOf(file.mimeType) >= 0
                        || POWERPOINT_MIME_TYPES.indexOf(file.mimeType) >= 0) {
                        return 'pdf';
                    } else if (file.mimeType.indexOf('image') == 0) {
                        return 'image';
                    } else if (that.previewAllowed(file)) {
                        return 'document';
                    } else {
                        return null;
                    }
                },

                openPreviewVersion: function(fileId, versionId, fileInfo) {
                    var that = this;
                    var urls = {
                        previewUrl: that.getVersionPreviewUrl(fileId, versionId),
                        downloadUrl: that.getVersionDownloadUrl(fileId, versionId)
                    };
                    that.openPreviewFile(fileId, fileInfo, urls);
                },

                openPreviewFile: function (fileId, fileInfo, urls) {
                    var that = this;

                    if (!that.previewAllowed(fileInfo)) {
                        alertify.log($translate.instant("text.PreviewNotSupported"));
                        return;
                    }

                    urls || (urls = {
                        previewUrl: that.getFilePreviewUrl(fileId),
                        downloadUrl: that.getFileDownloadUrl(fileId)
                    });

                    $uibModal.open({
                        templateUrl: iris.config.baseUrl + '/modules/dms/templates/docs.preview.file.html',
                        animation: false,
                        backdrop: true,
                        controller: function($scope, file) {
                            $scope.file = file;
                        },
                        resolve: {
                            'file': function () {
                                return {
                                    name: fileInfo.name,
                                    typeFile: that.getPreviewType(fileInfo),
                                    fileLink: urls.previewUrl,
                                    downloadLink: urls.downloadUrl
                                };
                            },
                            'workflows': function () {
                                return [];
                            }
                        },
                        size: 'allSq'
                    });
                },

                openSelectFileModal: function (options) {
                    return $uibModal.open({
                        templateUrl: iris.config.componentsUrl + '/docs/templates/dms.file-select.modal.html',
                        controller: 'DmsFileSelectModalCtrl',
                        resolve: {
                            'options': () => options,
                            'dmsFolders': FoldersService.requestFolders().$promise.then(res => res.filter(t => !t.isSystem))
                        },
                        size: 'lg'
                    }).result;
                },

                getSelectedFilesDownloadUrl: function (files_ids) {
                    return iris.config.apiUrl + '/dms/files/download?ids=' + angular.toJson(files_ids) + '&token=' + iris.config.accessToken;
                },

                remove: function (file_id) {
                    return Files.remove({id:file_id}).$promise;
                },

                getFolderFiles: function (folder_id) {
                    return FolderFiles.query({folder_id:folder_id}).$promise.then(function (files) {
                        for (var i = 0, c = files.length; i < c; i++) {
                            files[i] = new Files(files[i]);
                        }
                        return files;
                    });
                },

                save: function (file) {
                    return file.$save().then(function(data){
                        return data;
                    });
                },

                createFile: function(file){
                    return new Files(file);
                },

                removeVersion: function(fileId, versionId) {
                    return Files.removeVersion({fileId, versionId}).$promise;
                },

                share: function(file, validFor, isPermalink) {
                    var endDate = new Date(new Date());
                    endDate.setDate(endDate.getDate() + validFor);
                    return Files.share({fileId: file.id, endDate: endDate.toISOString(), permalink: !!isPermalink}).$promise;
                },

                toggleLockedFile: function (file) {
                    return file.$toggleLocked().then(function(data){
                        return data;
                    });
                },

                toggleInProgress: function (file) {
                    return file.$toggleInProgress().then(function(data){
                        return data;
                    });
                },

                localEdit: function (fileId, ip) {
                    return Files.localEdit({fileId, ip}).$promise;
                },

                moveToFolder: function (file_id, target_folder_id) {
                    return Files.moveToFolder({id: file_id, target_folder_id: target_folder_id}).$promise;
                },

                copyToFolder: function (file_id, target_folder_id) {
                    return Files.copyToFolder({id: file_id, target_folder_id: target_folder_id}).$promise;
                },

                copyAttachmentToFolder: function (file_id, attachment_id, target_folder_id) {
                    return FileAttachments.copyToFolder({file_id: file_id, id: attachment_id, target_folder_id: target_folder_id}).$promise;
                },

                addFileComment: function (){

                },

                getDMSFileUrl: (folderId, fileId) => `${iris.config.baseUrl}/ui/ui/dms/folders/${folderId}/files?file=${fileId}`,

                getIcon: function (mime_type) {
                    if(!mime_type) return 'fa-file-o';
                    if(mime_type == 'application/pdf') return 'fa-file-pdf-o';
                    if(WORD_MIME_TYPES.indexOf(mime_type) >= 0) return 'fa-file-word-o';
                    if(EXCEL_MIME_TYPES.indexOf(mime_type) >= 0) return 'fa-file-excel-o';
                    if(POWERPOINT_MIME_TYPES.indexOf(mime_type) >= 0) return 'fa-file-powerpoint-o';
                    if(ARCHIVE_MIME_TYPES.indexOf(mime_type) >= 0) return 'fa-file-zip-o';
                    var type = mime_type.split('/')[0];
                    if(type == 'audio') return 'fa-file-audio-o';
                    if(type == 'video') return 'fa-file-video-o';
                    if(type == 'image') return 'fa-file-image-o';
                    return 'fa-file-o';
                },

                getColorIcon: function (mimeType) {
                    var icon = this.getIcon(mimeType);
                    switch (icon) {
                        case 'fa-file-o': return 'file.png';
                        case 'fa-file-audio-o': return 'audio.png';
                        case 'fa-file-video-o': return 'video.png';
                        case 'fa-file-image-o': return 'image.png';
                        case 'fa-file-zip-o': return 'zip.png';
                        case 'fa-file-word-o': return 'word.png';
                        case 'fa-file-excel-o': return 'excel.png';
                        case 'fa-file-pdf-o': return 'pdf.png';
                        default: return 'file.png';
                    }
                },

                searchFiles: function (filter, params) {
                    params = params || {};
                    //filter = filter || [];
                    filter && (params.filter = angular.toJson(filter));
                    //console.log(filter);
                    return FilesSearch.query(params).$promise;
                },

                changeWorkflowState: function (state) {
                    //console.log(state)
                    return Files.changeWorkflowState(state).$promise
                },

                saveFileInfo: function (file) {
                    return Files.saveFileInfo({fileId: file.id, layerId: file.layerId, markerId: file.markerId}).$promise;
                },

                restore: function (fileId) {
                    return Files.restore({id: fileId}).$promise;
                },

                toggleFavorite: (id) => Files.toggleInFavorite({id: id}).$promise,

                getHiddenSystemFolders: () => HIDDEN_SYSTEM_FOLDERS
            }
        });

    angular.module('iris_docs').factory('LinksService', function ($interpolate, Links) {
        return {
            query: () => Links.query().$promise,
            remove: entity => Links.remove(entity).$promise,
            toggleActive: (entity) => entity.$toggleActive(),
            getLinkUrl: (link) => $interpolate("{{apiUrl}}/dms/links/{{linkHash}}/download")({
                apiUrl: iris.config.apiUrl,
                linkHash: link.hash
            })
        }
    });

    angular.module('iris_docs').factory('DmsAppService', function ($q, $timeout, DmsAppBundles) {
        return {
            getAllBundles: () => DmsAppBundles.query().$promise,

            getBundle: (bundleName) => DmsAppBundles.get({bundleName}).$promise,

            getBundleUrl: (bundleName) => `${iris.config.apiUrl}/dms/dmsapp/bundles/${bundleName}?token=${iris.config.accessToken}`,

            checkAppState: (ip) => DmsAppBundles.checkAppState({ip}).$promise,

            getIP: function () {
                window.RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;   //compatibility for firefox and chrome
                var pc = new RTCPeerConnection({iceServers:[]}),
                    noop = function(){},
                    defer = $q.defer(),
                    isFound = false;

                // TIMEOUT TO FIND IP -> null if not found
                $timeout(() => { !isFound && defer.resolve(null); }, 1000);

                pc.createDataChannel("");    //create a bogus data channel
                pc.createOffer(pc.setLocalDescription.bind(pc), noop);    // create offer and set local description
                pc.onicecandidate = function(ice){  //listen for candidate events
                    if (!ice || !ice.candidate || !ice.candidate.candidate)  return;
                    var myIP = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/.exec(ice.candidate.candidate)[1];

                    !isFound && defer.resolve(myIP);
                    isFound = true;

                    pc.onicecandidate = noop;
                };

                return defer.promise;
            }
        }
    });

    angular.module('iris_docs').factory('MailService', function ($uibModal, $q, Mail, FilesService, LinksService) {
        return {
            openSendMailModal: function (to, files) {
                to = to || [];
                files = files || [];
                return $uibModal.open({
                    templateUrl: iris.config.componentsUrl + '/docs/templates/dms.mail.html',
                    resolve: {
                        'users': function () {
                            return to;
                        },
                        'files': function () {
                            return files;
                        },
                        'folders': function (FoldersService) {
                            return FoldersService.requestFolders().$promise.then(function (folders) {
                                return folders;
                            });
                        },
                        'contacts': function (ContactsService) {
                            return ContactsService.requestContacts();
                        }
                    },
                    controller: 'DmsMail',
                    size: 'lg'
                }).result;
            },
            generateLinks: function(attachedFiles, validFor, isPermaLink) {
                var defer = $q.defer();
                var attachedLinks = [];
                var promises = [];

                for(var i in attachedFiles) {
                    promises.push(FilesService.share(attachedFiles[i], validFor, isPermaLink));
                }
                $q.all(promises).then(res => {
                    var promisesLinks = [];
                    for(var i in res) {
                        promisesLinks.push(LinksService.getLinkUrl(res[i]));
                    }
                    $q.all(promisesLinks).then(links => {
                        for(var i in links) {
                            attachedLinks.push(links[i]);
                        }
                        defer.resolve(attachedLinks);
                    });
                });

                return defer.promise;
            },

            sendMail: function (mail, attached_files) {
                if (attached_files && mail.attachmentsAsLink){
                    return this.generateLinks(attached_files, mail.validFor, mail.isPermalink).then(function(attachedLinks){
                        for (var i in attachedLinks) {
                            mail.message += '<br><a href="' + attachedLinks[i] + '" >' + attached_files[i].name + '</a>';
                        }
                        attached_files = [];
                        mail.attachments =[];
                        return Mail.save(mail).$promise;
                    });
                }
                else {
                    return Mail.save(mail).$promise;
                }
            }
        }
    });

    angular.module('iris_docs').factory('ModuleFiles', function ($resource) {
        return $resource(iris.config.apiUrl + "/dms/files/module/:module/:action");
    });

    angular.module('iris_docs').factory('ModuleFolderService', function ($uibModal, ModuleFiles) {
        return {
            getModuleFiles: function (module, subject) {
                return ModuleFiles.query({module: module, subject: angular.toJson(subject)}).$promise;
            },

            getModuleFileUploadUrl: function (module, subject) {
                return iris.config.apiUrl + '/dms/files/module/' + module + '?subject=' + angular.toJson(subject);
            },

            getModuleBase64imageUploadUrl: function (module, subject, filename) {
                return iris.config.apiUrl + '/dms/files/module/' + module + '/base64image?subject=' + angular.toJson(subject) + '&filename=' + filename;
            },

            openModuleFilesModal: function (module, subjectName, subjectId, accept) {
                var subject = !subjectName || !subjectId ? null : [{
                    name: subjectName,
                    subjectId: subjectId
                }];
                return $uibModal.open({
                        templateUrl: iris.config.componentsUrl + '/docs/templates/dms.module.files.html',
                        controller: 'DmsModuleFilesCtrl',
                        resolve: {
                            'accept': function() {
                                return accept;
                            },
                            'subject': function () {
                                return subject;
                            },
                            'module': function(){
                                return module;
                            },
                            'module_files': function (ModuleFolderService) {
                                return ModuleFolderService.getModuleFiles(module, subject);
                            }
                        },
                        size: 'lg'
                    }).result
            },

            openModuleFilesModalExtended: function (module, subjects, accept) {
                subjects = subjects || [];
                return $uibModal.open({
                        templateUrl: iris.config.componentsUrl + '/docs/templates/dms.module.files.html',
                        controller: 'DmsModuleFilesCtrl',
                        resolve: {
                            'accept': function() {
                                return accept;
                            },
                            'subject': function () {
                                return subjects;
                            },
                            'module': function(){
                                return module;
                            },
                            'module_files': function (ModuleFolderService) {
                                return ModuleFolderService.getModuleFiles(module, subjects);
                            }
                        },
                        size: 'lg'
                    }).result
            }
        }
    });

    angular.module('iris_docs').controller('DmsModuleFilesCtrl',
        function ($scope, $uibModalInstance, $translate, $window, subject, accept,
                  module, module_files, ModuleFolderService, FileUploader, FilesService) {
            $scope.module_files = module_files;
            $scope.accept = accept;

            setPreviewType();

            $scope.selected_file = null;

            $scope.getFileContent = function (file_id) {
                return FilesService.getFilePreviewUrl(file_id);
            };

            $scope.selectFile = function (file) {
                if($scope.selected_file && $scope.selected_file.id == file.id) {
                    $scope.selected_file = null;
                    return;
                }

                $scope.selected_file = file;
            };

            $scope.uploader = new FileUploader({
                url: `${iris.config.apiUrl}/dms/files/module/${module}${!subject ? '' : '?subject=' + $window.encodeURIComponent(angular.toJson(subject))}`,
                removeAfterUpload: true,
                isHTML5: true,
                onBeforeUploadItem: function () {
                    iris.loader.start('.modal-body');
                    $scope.hasErrors = false;
                },
                onErrorItem: function (item, response, status, headers) {
                    alertify.error('Error uploading file ' + item.file.name);
                    $scope.hasErrors = true;
                },
                onCompleteItem: function (item, response, status, headers) {
                    iris.loader.stop();
                    if (!$scope.hasErrors) {
                        alertify.success($translate.instant('text.UploadSuccess'));
                    }

                    ModuleFolderService.getModuleFiles(module, subject).then(function (module_files) {
                        $scope.module_files = module_files;
                        setPreviewType();
                    })
                }
            });

            function setPreviewType() {
                $scope.module_files.forEach(f => {
                    f.previewType = FilesService.getPreviewType(f);
                });
            }

            $scope.getFileIcon = function (mime_type) {
                return FilesService.getIcon(mime_type);
            };

            //$scope.uploader.filters.push(function (item) {
            //    return !$scope.uploader.hasHTML5 ? true : /\/(png|jpeg|jpg|gif)$/.test(item.file.type);
            //});
        });

    angular.module('iris_docs').controller('DmsFileSelectModalCtrl',
        function ($scope, $interval, $timeout, $uibModalInstance, $translate, options, FileUploader, FoldersService,
                  FilesService, dmsFolders) {
        $scope.selectedFiles = [];
        $scope.files = [];
        $scope.dmsFoldersExist = !!dmsFolders.length;
        $scope.config = iris.config;

        $scope.options = options || {};
        $scope.options.multiple = $scope.options.multiple === undefined ? true : $scope.options.multiple;

        $scope.acceptSelection = function() {
            $uibModalInstance.close($scope.selectedFiles);
        };

        $scope.onSelectFolder = function (folder) {
            refreshUploaderUrl(folder);
            refreshFiles(folder);
            $scope.activeFolder = angular.copy(folder);
        };

        function refreshFiles(folder) {
            $scope.selectedFiles = [];

            if (folder && folder.id) {
                //iris.loader.start('.files-list');
                FilesService.getFolderFiles(folder.id).then(fRes => {
                    $scope.files = fRes;
                    //$timeout(() => {iris.loader.stop('.files-list')});
                })
            } else {
                $scope.files = [];
            }
        }

        function refreshUploaderUrl(folder) {
            $scope.uploader.url = (folder && folder.id) ? FoldersService.getUploadUrl(folder) : "";
        }

        $scope.getFileIcon = function (mime_type) {
            return FilesService.getIcon(mime_type);
        };

        $scope.refreshSelection = function() {
            $scope.selectedFiles = $scope.gridApi.selection.getSelectedRows();
            //console.log($scope.selectedFiles);
        };

        $scope.$watch("uploader.queue.length", function(nv, ov) {
            if (nv == ov) return;
            nv && $scope.uploader.uploadAll()
        });

        $scope.uploader = new FileUploader({
            url: "",
            removeAfterUpload: true,
            isHTML5: true,

            onBeforeUploadItem: function () {
                iris.loader.start('.modal-body');
                $scope.hasErrors = false;
            },
            onErrorItem: function (item, response, status, headers) {
                alertify.error('Error uploading file ' + item.file.name);
                $scope.hasErrors = true;
            },
            onCompleteItem: function (item, response, status, headers) {
                iris.loader.stop();
                if (!$scope.hasErrors) {
                    alertify.success($translate.instant('text.UploadSuccess'));
                }
                refreshFiles($scope.activeFolder);
            }
        });

        $scope.gridOptions = {
            data: 'files',

            enableFullRowSelection: true,
            enableRowHeaderSelection: true,
            enableSelectAll: true,
            selectionRowHeaderWidth: 35,
            multiSelect: $scope.options.multiple,

            onRegisterApi: function (gridApi) {
                $scope.gridApi = gridApi;

                gridApi.selection.on.rowSelectionChanged($scope, $scope.refreshSelection);
                gridApi.selection.on.rowSelectionChangedBatch($scope, $scope.refreshSelection);

                // call resize every 500 ms for 5 s after modal finishes opening - usually only necessary on a bootstrap modal
                $interval(function () {
                    $scope.gridApi.core.handleWindowResize();
                }, 500, 10);
            },

            columnDefs: [
                {
                    field: 'name',
                    width: '**',
                    displayName: $translate.instant('label.Name'),
                    enableSorting: true,
                    cellTemplate: `
                        <div class="ui-grid-cell-contents actions">
                            <i class="fa fa-fw {{::grid.appScope.getFileIcon(row.entity.mimeType)}}"></i> {{row.entity.name}}
                        </div>`
                },
                {
                    field: 'updatedOn',
                    width: '*',
                    displayName: $translate.instant('label.UpdatedOn'),
                    enableSorting: true,
                    cellFilter: `date:'dd.MM.yyyy HH:mm:ss'`
                },
                {
                    field: 'size',
                    width: '*',
                    displayName: $translate.instant('label.Size'),
                    enableSorting: true,
                    cellFilter: 'filesize'
                }
            ]
        };
    });

    angular.module('iris_docs').filter('dmsFilePreview', function (FilesService) {
        return function (fileId) {
            if(!fileId) return null;

            return FilesService.getFilePreviewUrl(fileId);
        }
    });

    angular.module('iris_docs').filter('dmsSystemFolders', function () {
        return function (folders, showSystemFolders) {
            showSystemFolders = showSystemFolders || false;
            return folders.filter(folder => {
                return folder.isSystem && showSystemFolders || !folder.isSystem
            });
        }
    });

    angular.module('iris_docs').filter('dmsProjectFolders', function () {
        return function (folders, projectId) {
            return folders.filter(folder => {
                return !projectId || (folder.projectId == projectId);
            });
        }
    });
})();

