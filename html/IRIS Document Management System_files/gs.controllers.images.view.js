(function () {

    angular.module('iris_gs_images_view', []);

    angular.module('iris_gs_images_view').controller('ModuleImagesViewCtrl',
        function ($scope, $uibModal, $state, $controller, $translate, FileUploader, ImageService, ProjectsService) {

            $scope.images = [];
            $scope.projectId = $scope.projectId || iris.config.favProjectId || 0;
            $scope.projects = ProjectsService.getProjects();

            $scope.gridOptions = {
                data: "images",
                enablePaginationControls: false,
                paginationPageSize: 10,
                showGridFooter: true,
                columnDefs: [
                    {
                        field: 'id',
                        displayName: 'ID',
                        enableSorting: true,
                        width: 40
                    },
                    {
                        field: 'name',
                        width: '**',
                        displayName: $translate.instant('label.Name'),
                        enableSorting: true
                    },
                    {
                        field: 'alias',
                        width: '**',
                        displayName: $translate.instant('label.Alias'),
                        enableSorting: true
                    },
                    {
                        field: 'geo_type',
                        width: '**',
                        displayName: $translate.instant('label.Type'),
                        enableSorting: true
                    },
                    {
                        name: 'actions',
                        displayName: $translate.instant('label.Actions'),
                        width: 150,
                        enableSorting: false,
                        cellTemplate: `
                    <div class="ui-grid-cell-contents actions">
                        <a href="javascript:void(0)" ng-click="grid.appScope.openImageSettings(row)" class="btn btn-default">
                            <i class="fa fa-pencil"></i> {{'label.Edit' | translate}}
                        </a>
                        <button class="btn btn-danger" ng-click="grid.appScope.remove(row.entity)" uib-tooltip="{{\'label.Remove\' | translate}}">
                            <i class="fa fa-trash-o"></i>
                        </button>
                        <a class="btn btn-default" ng-if="row.entity.dms_file_id" ng-href="{{::grid.appScope.getDownloadLink(row.entity)}}" uib-tooltip="{{'label.Download' | translate}}">
                            <i class="fa fa-download"></i>
                        </a>
                    </div>`
                    }
                ],
                onRegisterApi: function (gridApi) {
                    $scope.gridOptions.gridAPI = gridApi;
                }
            };

            $scope.openImageSettings = function (row) {

                if (row && row.entity.id) {
                    object_id = row.entity.id;
                    data = row.entity;

                    $state.go('module.images.image', {imageId: row.entity.id});
                }
            }

            $scope.openImageImportModal = function () {

                return $uibModal.open({
                    templateUrl: iris.config.componentsUrl + '/global-settings/templates/module.settings.images.image.upload.html',
                    controller: 'ModuleImagesImportCtrl',
                    resolve: {
                        'projectId': function () {
                            return $scope.projectId;
                        }
                    },
                    scope: $scope,
                    size: 'lg'
                }).result.then(() => {
                    console.log('openImageImportModal done');
                });

            };

            $scope.remove = function (image) {

                alertify.confirm($translate.instant('message.ConfirmDeleteImage'), function (e) {
                    if (e) {
                        ImageService.deleteImage(image).then(function () {
                            $scope.refresh();
                            alertify.success($translate.instant('message.ImageDeleted'));
                        });
                    }
                });
            }

            $scope.download = function (image) {
                return ImageService.downloadImage(image);
            }

            $scope.getDownloadLink = function (image) {
                return ImageService.getDownloadLink(image);
            }

            $scope.refresh = function () {
                iris.loader.start();
                ImageService.getImagesForProject($scope.projectId).then(images => {
                    $scope.images = images;
                    iris.loader.stop();
                });
            };

            $scope.getProjectId = function () {
                return $scope.projectId;
            }

            $scope.changeProject = function (projectId) {
                $scope.projectId = projectId;
                console.log('Project-ID: ' + $scope.projectId);
                $scope.refresh();
            }

        });

    angular.module('iris_gs_images_view').controller('ModuleImagesImportCtrl',
        function ($scope, $uibModalInstance, $translate, projectId, FileUploader) {
            $scope.projectId = projectId;

            $scope.uploader = new FileUploader({
                removeAfterUpload: true,
                queueLimit: 1,
                url: iris.config.apiUrl + '/images/images/image-import/project/' + $scope.projectId,
                onBeforeUploadItem: function () {
                    iris.loader.start('.modal-body')
                },
                onErrorItem: function (item, response, status, headers) {
                    iris.loader.stop();
                    alertify.error('Error uploading file ' + item.file.name);
                    $scope.hasErrors = true;
                },
                onCompleteItem: function (item, response, status, headers) {
                    iris.loader.stop();
                    if (!$scope.hasErrors) {
                        alertify.success($translate.instant('label.AddedSuccessfully'));
                    }
                    $scope.refresh();
                    $uibModalInstance.close();
                }
            });


        });

})();