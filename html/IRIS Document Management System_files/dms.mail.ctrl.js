(function () {
    angular.module('iris_docs').controller('DmsMail',
        function ($scope, $translate, users, contacts, files, folders, FilesService, MailService) {
            iris.loader.stop();

            $scope.max_attachments_size = 20 * 1024 * 1024;
            $scope.contacts = contacts;
            $scope.selected = {};
            $scope.file_filter = {};
            $scope.folders = folders;
            $scope.mail = {
                to: users || [],
                attachments: [],
                attachmentsAsLink: false,
                validFor: 1,
                isPermalink: false
            };
            $scope.attached_files = [];
            $scope.tabs = {
                activeTab: 'Message'
            };
            $scope.getFileIcon = function (mime_type) {
                return FilesService.getIcon(mime_type);
            };

            $scope.selectFolder = function (folder) {
                $scope.selected.folder = folder;

                $scope.folder_files = [];

                FilesService.getFolderFiles(folder.id).then(function (data) {
                    $scope.folder_files = data;
                })
            };

            $scope.toggleSelectFile = function (file) {
                var index = $scope.mail.attachments.indexOf(file.id);
                if(index > -1){
                    $scope.mail.attachments.splice(index, 1);
                    for(var i in $scope.attached_files) {
                        if($scope.attached_files[i].id == file.id) {
                            $scope.attached_files.splice(i, 1);
                            break;
                        }
                    }
                } else {
                    $scope.mail.attachments.push(file.id);
                    $scope.attached_files.push(file);
                }
            };

            files.forEach(f => {
                $scope.toggleSelectFile(f);
            });

            $scope.sendMailInputInvalid = function() {
                return !($scope.mail && $scope.mail.to && $scope.mail.to.length && $scope.mail.subject && $scope.mail.message);
            };

            $scope.sendMail = function () {
                MailService.sendMail($scope.mail, $scope.attached_files)
                    .then(function () {
                        alertify.success($translate.instant('label.dms.MessageSent'));
                        $scope.$close();
                    })
                    .catch(function (e){
                        alertify.error($translate.instant('label.dms.ErrorSendEmail'));
                    })
            };

            $scope.maxAttachmentsSizeExceeded = function() {
                var result = false;
                if ($scope.attached_files.length && !$scope.mail.attachmentsAsLink) {
                    var attachementsSize = $scope.attached_files.reduce((total, file)  => total + file.size, 0);
                    result = attachementsSize > $scope.max_attachments_size;
                }
                return result;
            };
        });
})();