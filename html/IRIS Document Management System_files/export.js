(function () {
    irisAppDependencies.add('iris_export');

    angular.module('iris_export', []);

    angular.module('iris_export').factory('ExportService', function ($uibModal, $translate, UserSettingsService) {
        return {
            getExportDefaults: () => {
                return {
                    decimalSeparator: '.',
                    separator: ';',
                    dateFormatId: iris.config.me.profile.dateTimeFormatId
                };
            },

            openExportModal: function (export_url, params, isConcurrentExportEnabled) {
                return $uibModal.open({
                    templateUrl: iris.config.componentsUrl + "/export/templates/export.modal.html",
                    resolve: {
                        'export_url': () => export_url,
                        'params': () => params || {},
                        'isConcurrentExportEnabled': () => isConcurrentExportEnabled
                    },
                    controller: function ($scope, $resource, export_url, params, isConcurrentExportEnabled, IrisTimeService) {
                        $scope.params = params;
                        $scope.timezone = params.timezone;
                        $scope.isConcurrentExportEnabled = isConcurrentExportEnabled;
                        $scope.downloadStrategy = 'onDemand';
                        $scope.notificationPopup = true;
                        $scope.notificationEmail = false;
                        $scope.timezones = IrisTimeService.getTimezones();
                        $scope.userExportSettings = {settings: {}};

                        if(export_url.indexOf('format=') < 0 && $scope.params.type) {
                            export_url += `?format=${$scope.params.type}`
                        }

                        $scope.download = function() {
                            exportFile();
                            $scope.$close();
                        };

                        $scope.saveAndDownload = function() {
                            UserSettingsService.saveUserSettings('export-csv', $scope.userExportSettings, iris.config.me.id).then(function () {
                                exportFile();
                                alertify.success($translate.instant('label.SavedSuccessfully'));
                                $scope.$close();
                            });
                        };

                        const exportFile = function() {
                            if ($scope.downloadStrategy == 'concurrent') {
                                var notificationChannels = [];
                                if ($scope.notificationPopup) notificationChannels.push('POPUP');
                                if ($scope.notificationEmail) notificationChannels.push('EMAIL');

                                var baseUrl = export_url.substring(0, export_url.indexOf('?'));
                                var parameters = export_url.substring(export_url.indexOf('?'), export_url.size);
                                var concurrentUrl = baseUrl + '-concurrent' + parameters;

                                $resource(concurrentUrl)
                                    .get({
                                        separator: $scope.userExportSettings.settings.separator,
                                        decimalSeparator: $scope.userExportSettings.settings.decimalSeparator,
                                        dateFormat: $scope.userExportSettings.settings.dateFormat,
                                        timeZone: $scope.timezone,
                                        exportRequest: angular.toJson({
                                            exportFormat:$scope.params.type,
                                            notificationChannels:notificationChannels
                                        })
                                    });
                            }
                            else {
                                window.location.href = `${export_url}&separator=${$scope.userExportSettings.settings.separator}&decimalSeparator=${$scope.userExportSettings.settings.decimalSeparator}&dateFormat=${$scope.userExportSettings.settings.dateFormat}&timeZone=${$scope.timezone}&token=${iris.config.accessToken}`;
                            }
                        };
                    },
                    size: 'md'
                })
            },

            getExportFormats: () => [{id: 'XLSX', name: 'XLSX'}, {id: 'XLS', name: 'XLS'}, {id: 'CSV', name: 'CSV'}]
        }
    });

    angular.module('iris_export').directive('irisUserExportSettings', function ($q, ExportService, IrisTimeService, GlobalSettingsService, UserSettingsService) {

        return {
            restrict: 'EA',
            templateUrl: iris.config.componentsUrl + "/export/templates/export.form.html",
            link: function ($scope) {
                $scope.dateFormats = IrisTimeService.getDateTimeFormats();
                $scope.decimalSeparators = [',', '.'];
                var globalExportDefaults = ExportService.getExportDefaults();

                $scope.settings = {};
                $scope.globalExportSettings = {};

                var promises = [];
                promises.push(GlobalSettingsService.getGlobalSettingsById('export-csv'));
                promises.push(UserSettingsService.getUserSettingsById('export-csv', iris.config.me.id));

                $q.all(promises).then(function (results) {
                    var globalExportSettings = results[0];
                    globalExportSettings.value = globalExportSettings.value || globalExportDefaults;

                    angular.extend($scope.userExportSettings, results[1]);
                    $scope.userExportSettings.settings = $scope.userExportSettings.settings || globalExportSettings.value;
                    $scope.settings = $scope.userExportSettings.settings;

                    $scope.setDateTimeFormat();
                });

                $scope.setDateTimeFormat = function () {
                    $scope.userExportSettings.settings.dateFormat = IrisTimeService.getDateTimeFormatById($scope.settings.dateFormatId).momentjsFormatString;
                };
            }
        }

    });


})();