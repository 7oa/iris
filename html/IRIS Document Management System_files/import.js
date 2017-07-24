(function () {
    irisAppDependencies.add('iris_import');

    angular.module('iris_import', []);


    angular.module('iris_import').factory('ImportSettings', function ($resource) {
        return $resource(iris.config.apiUrl + "/import-settings/devices/:deviceId/settings/:id/:action", {
            id: '@id',
            deviceId: '@deviceId',
            action: '@action'
        }, {
            getMeta: {
                method: "POST",
                params: {action: 'meta'},
                isArray: false
            },
            getAll: {
                url: iris.config.apiUrl + "/import-settings/settings",
                isArray: true
            }
        });
    });


    angular.module('iris_import').factory('ImportSettingsService',
        function ($uibModal, $translate, IrisTimeService, FileUploader, ImportSettings) {
            return {
                getImportDefaults: () => {
                    return {
                        separator: ';',
                        decimalSeparator: '.',
                        pointDecimalSeparator: true,
                        metaRow: 1,
                        startRow: 2,
                        timeZoneId: iris.config.timezone
                    }
                },

                openImportModal: function (deviceId, uploadUrl, fieldsMapping, importSettings, params, controllerName, templateUrl, size) {
                    if (!uploadUrl || !fieldsMapping) {
                        alertify.error($translate.instant('text.import.SomeParamsAreMissing'));
                        return;
                    }
                    size = size || 'lg';
                    templateUrl = templateUrl || iris.config.componentsUrl + '/import/templates/import.modal.html';
                    controllerName = controllerName || 'ImportModalBaseCtrl';
                    importSettings = importSettings || this.getImportDefaults();
                    params = params || {};
                    var analysisUrl = `${iris.config.apiUrl}/import-settings/devices/${deviceId}/settings/meta`;

                    return $uibModal.open({
                        templateUrl: templateUrl,
                        controller: controllerName,
                        size: size,
                        resolve: {
                            'analysisUrl': function () {
                                return analysisUrl
                            },
                            'uploadUrl': function () {
                                return uploadUrl;
                            },
                            'importSettings': function () {
                                return importSettings;
                            },
                            'fieldsMapping': function () {
                                return fieldsMapping;
                            },
                            'params': function () {
                                return params;
                            }
                        }
                    }).result
                },

                getAllImportSettings: (filter) => {
                    filter = filter || {};
                    return ImportSettings.getAll(filter).$promise
                },

                getImportSettings: deviceId => ImportSettings.query({deviceId}).$promise,

                getImportSettingById: (deviceId, id) => ImportSettings.get({deviceId, id}).$promise,

                saveImportSetting: (deviceId, setting) =>{
                    return ImportSettings.save({deviceId, id: setting.id}, setting).$promise;
                },

                deleteImportSetting: function (deviceId,setting) {
                    return ImportSettings.delete({deviceId,id:setting.id}, setting).$promise;
                }
            }
        });

    angular.module('iris_import').controller('ImportModalBaseCtrl',
        function ($scope, $uibModalInstance, analysisUrl, uploadUrl, importSettings, fieldsMapping, params,
                  ImportSettingsService, $translate, IrisTimeService, FileUploader) {
            $scope.timezones = IrisTimeService.getTimezones();
            $scope.dateFormats = IrisTimeService.getAllDateTimeFormats();
            $scope.state = 'analysis';
            $scope.import = importSettings;
            $scope.fields = fieldsMapping;
            $scope.params = params;
            $scope.analysisUrl = analysisUrl;
            $scope.uploadUrl = uploadUrl;

            $scope.setDateTimeFormat = function () {
                var format = IrisTimeService.getDateTimeFormatById($scope.import.dateFormatId).momentjsFormatString;
                $scope.import.dateFormat = format;

                //set format for all fields with type 'date'
                $scope.fields.forEach(field => {
                    if (field.type == 'date') field.format = format;
                });
            };

            $scope.startAnalysis = function (item) {
                item.url = `${$scope.analysisUrl}?setting=${angular.toJson($scope.import)}`;
                item.upload();
            };

            $scope.uploadFile = function () {
                var item = $scope.uploader.queue[0];
                $scope.import.pointDecimalSeparator = $scope.import.decimalSeparator === '.';
                $scope.import.columns = angular.copy($scope.fields).map(field => {
                    return {
                        name: field.name,
                        format: field.format,
                        defaultValue: field.defaultValue,
                        index: field.index
                    }
                });
                item.url = `${$scope.uploadUrl}?setting=${angular.toJson($scope.import)}`;
                item.upload();
            };

            $scope.refresh=function(){};
            $scope.uploader = new FileUploader({
                url: analysisUrl,
                removeAfterUpload: false,
                queueLimit: 1,
                onBeforeUploadItem: function () {
                    iris.loader.start('.modal-body');
                },
                onErrorItem: () => iris.loader.stop(),
                onSuccessItem: function (item, response, status, headers) {
                    iris.loader.stop();
                    alertify.success($translate.instant('text.UploadSuccess'));

                    if ($scope.state == 'analysis') {
                        $scope.state = 'fill';
                        $scope.columns = angular.copy(response.columns);
                        $scope.result = response;
                    } else {
                        $scope.state = 'result';
                        $scope.tab = 'Success';
                        $scope.result = response;
                    }
                    $scope.refresh();
                }
            });

        });


})();