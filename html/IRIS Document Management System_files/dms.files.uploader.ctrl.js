(function () {
    angular.module('irisApp').controller('DmsFilesUploadCtrl',
        function ($scope, $uibModal, $uibModalInstance, $translate, $window, $timeout, folder, FileUploader, FoldersService, workflows,
                  WorkflowService, folderFiles, users, languages, dmsConfig, TagsService,  $q, $filter) {
            $scope.folder = folder;
            $scope.folderFiles = folderFiles;
            $scope.languages = languages;
            $scope.workflows = workflows;
            $scope.dmsConfig = dmsConfig;
            $scope.users = users;
            $scope.workflowStates = [];
            $scope.customParameters = {};

            $scope.popover = {
                template: "'" + iris.config.moduleUrl + "/templates/dms.commentPopover.html'",
                isOpen: false
            };

            $scope.requestWorkflowStates = function (workflowId) {
                $scope.file.workflowStateId = null;
                $scope.workflowStates = [];
                if(!workflowId) return;
                WorkflowService.getWorkflowStates(workflowId).then(workflowStates => $scope.workflowStates = workflowState);
            };

            $scope.commentedItem = null;
            $scope.setCommentedItem = function(file) {
                $scope.commentedItem = file;
            };

            $scope.refreshAllUrls = function () {
                var promises = [];
                $scope.dmsConfig.properties.forEach(p => {
                    if(p.value) {
                        promises.push(TagsService.saveTag({
                            type: p.name,
                            value: p.value,
                            name: $filter('IrisFilterField')(p.value, [p.directory])
                        }));
                    }
                });
                $q.all(promises).then(tags => {
                    var tagsIds = tags.map(t => t.id);
                    $scope.uploader.queue.forEach(f => $scope.refreshUrl(f, tagsIds));
                });
            };

            $scope.refreshUrl = function(file, tagsIds) {
                $timeout(function() {
                    file.url = FoldersService.getUploadUrl(folder);

                    if (file.workflowId) {
                        var workflow = $scope.workflows.filter(w => w.id == file.workflowId)[0];
                        if (workflow) {
                            var startState = workflow.workflowStates.filter(s => s.type == 'START')[0];
                            var startStateId = startState ? startState.id : null;
                            file.url += `?workflowId=${file.workflowId}` + (startStateId ? `&workflowStateId=${startStateId}` : '');
                        }
                    }

                    if (file.comment) {
                        file.url += (file.url.indexOf("?") > 0 ? "&" : "?") + `comment=${$window.encodeURIComponent(file.comment)}`;
                    }

                    if (file.ownerId) {
                        file.url += (file.url.indexOf("?") > 0 ? "&" : "?") + `ownerId=${file.ownerId}`;
                    }

                    if (file.contentLanguage) {
                        file.url += (file.url.indexOf("?") > 0 ? "&" : "?") + `contentLanguage=${file.contentLanguage}`;
                    }

                    if(tagsIds) {
                        file.url += (file.url.indexOf("?") > 0 ? "&" : "?") + `tags=${angular.toJson(tagsIds)}`;
                    }
                });
            };

            $scope.checkIfFileExists = function(fileName) {
                var list = $scope.folderFiles;
                for (var i = 0; i < list.length; i++) {
                    if (list[i].name == fileName) {
                        return true;
                    }
                }
                return false;
            };

            $scope.uploader = new FileUploader({
                url: FoldersService.getUploadUrl(folder),
                headers : {
                    'x-iris-access-token': iris.config.accessToken
                },
                onAfterAddingFile: function (item) {
                    item.ownerId = iris.config.me.id;
                    $scope.refreshUrl(item);
                },
                onErrorItem: function(fileItem, response, status, headers) {
                    alertify.error($translate.instant('text.dms.FileUploadedError') + ": " + fileItem.file.name);
                    $scope.hasErrors = true;
                },
                onCompleteAll: function () {
                    if (!$scope.hasErrors) alertify.success($translate.instant('text.dms.FilesUploadedSuccess'));
                    $uibModalInstance.close();
                }
            });
        });
})();