(function(globals) {
    'use strict' ;

    globals.angular.module('irisApp').directive('irisPrintDialog',
        function(LocaleService, ReportsService, $uibModal) {
            return {
                restrict: 'EA',
                scope: {
                    url: '='
                },
                replace: true,

                template: `
                    <a href="javascript:void(0)" ng-click="openExportModal()">
                        <i class="fa fa-file-pdf-o"></i>
                        PDF
                    </a>`,

                controller: function($scope, $attrs) {
                    $scope.isConcurrentExportEnabled = $attrs.concurrentExportEnabled == "true";

                    $scope.openExportModal = () => {
                        $uibModal.open({
                            templateUrl: iris.config.baseUrl + '/common/directives/templates/print-dialog.html',
                            backdrop: true,
                            resolve: {
                                'url': function() {
                                    return $scope.url;
                                },
                                'isConcurrentExportEnabled': function() {
                                    return $scope.isConcurrentExportEnabled;
                                },
                                'templateId': function() {
                                    return $attrs["templateId"] || 0;
                                }
                            },
                            controller: function($scope, $resource, $translate, $uibModalInstance, ReportsService, PageSizes, url, isConcurrentExportEnabled, templateId) {
                                $scope.isConcurrentExportEnabled = isConcurrentExportEnabled;
                                $scope.downloadStrategy = 'onDemand';
                                $scope.notificationPopup = true;
                                $scope.notificationEmail = false;
                                $scope.templates = ReportsService.getTemplates();
                                $scope.orientations = ReportsService.getPageOrientations();
                                $scope.pageSizes = PageSizes;
                                $scope.pageSize = 'A4';
                                $scope.orientation = 'portrait';
                                $scope.printParams = {};

                                $scope.print = () => {
                                    const previewUrl = url || `${window.location.pathname}${$scope.templateId ? '?print=true&print-template=' + $scope.templateId : ''}`;
                                    const encodedPreviewUrl = encodeURIComponent(previewUrl);

                                    const params = {
                                        templateId: $scope.templateId ? $scope.templateId : null,
                                        template:{ pageSize:$scope.pageSize, pageOrientation:$scope.orientation}
                                    };

                                    var printServiceUrl;
                                    if($scope.downloadStrategy == 'onDemand') {
                                        printServiceUrl = `${iris.config.apiUrl}/reporting/reports/generate`;
                                        window.location.href = `${printServiceUrl}?url=${encodedPreviewUrl}&params=${encodeURIComponent(angular.toJson(params))}&token=${iris.config.accessToken}`;
                                    }
                                    else {
                                        printServiceUrl = `${iris.config.apiUrl}/reporting/reports/generate-concurrent`;
                                        var notificationChannels = [];
                                        if ($scope.notificationPopup) notificationChannels.push('POPUP');
                                        if ($scope.notificationEmail) notificationChannels.push('EMAIL');
                                        const exportRequest = `{exportFormat: "PDF", notificationChannels:${angular.toJson(notificationChannels)}}`
                                        $resource(`${printServiceUrl}?url=${encodedPreviewUrl}&params=${encodeURIComponent(angular.toJson(params))}&exportRequest=${encodeURIComponent(exportRequest)}&token=${iris.config.accessToken}`).get();
                                    }

                                    $uibModalInstance.close();
                                };

                                $scope.setTemplate = function () {
                                    if(!$scope.templateId) return;

                                    var template = $scope.templates.find(d => d.id == $scope.templateId);
                                    $scope.orientation = template.pageOrientation;
                                    $scope.pageSize = template.pageSize;
                                };

                                if (templateId) {
                                    $scope.templates.$promise.then(() => {
                                        $scope.templateId = templateId;
                                        $scope.setTemplate();
                                    });
                                }
                            }
                        })
                    };
                }
            }
    });
    /*
     * Decorator for above directive
     * When attribute 'getCanvasFunction' is defined, this decorator overwrites scope.openExportModal,
     * otherwise original directive is used.
     * Image is created from canvas and saved to DMS. Link to DMS file is provided as parameter in print-URL.
     */
    angular.module('irisApp').decorator('irisPrintDialogDirective', ['$delegate', 'LocaleService', 'ReportsService', '$http', '$uibModal',
        function ($delegate, LocaleService, ReportsService, $http, $uibModal) {

            var link;
            var directive = $delegate[0];

            angular.extend(directive.scope, {
                getCanvasFunction: '=',
                moduleCode: '='
            });

            link = function myLinkFnOverride(scope, element, attrs) {

                if (scope.getCanvasFunction && scope.moduleCode) {

                    scope.openExportModal = function () {
                        $uibModal.open({
                            templateUrl: iris.config.baseUrl + '/common/directives/templates/print-dialog.html',
                            backdrop: true,
                            resolve: {
                                'getCanvasFunction': function () {
                                    return scope.getCanvasFunction;
                                },
                                'moduleCode' : function() {
                                    return scope.moduleCode;
                                },
                                'url': function () {
                                    return scope.url;
                                }
                            },
                            controller: function ($scope, url, getCanvasFunction, moduleCode, $translate, ReportsService, PageSizes) {
                                $scope.templates = ReportsService.getTemplates();
                                $scope.orientations = ReportsService.getPageOrientations();
                                $scope.pageSizes = PageSizes;
                                $scope.pageSize = 'A4';
                                $scope.orientation = 'portrait';
                                $scope.print = () => {
                                    // get the canvas from DOM
                                    var canvas = $scope.$eval(getCanvasFunction);
                                    if (canvas) {
                                        // create base64 image from canvas
                                        var base64
                                        try {
                                            base64 = canvas.toDataURL('image/png');
                                        } catch (err) {
                                            /* error might be caused by crossOrigin validation */
                                            alertify.error($translate.instant('error.CanvasToDataUrlError') + ": " + err );
                                        }
                                        if (base64) {
                                            // submit image to DMS
                                            var request = {
                                                method: 'POST',
                                                url: iris.config.apiUrl + '/dms/upload4/printing/canvas/module/' + moduleCode,
                                                headers: {
                                                    'Accept': 'application/json',
                                                    'Content-Type': 'application/json'
                                                },
                                                data: {image: base64}
                                            };
                                            $http(request).then(function success(response) {
                                                // get DMS file-id as response
                                                var dmsFileId = response.data.dmsFileId;
                                                if (dmsFileId) {
                                                    // add link to DMS file as parameter 'src'
                                                    var printURL = (url || window.location.pathname + '/print');
                                                        (printURL.indexOf('?') == -1) ? printURL += '?' : printURL += '&';
                                                        printURL += 'src=/restful/dms/files/' + dmsFileId + '/content';
                                                    const encodedPreviewUrl = encodeURIComponent(printURL);
                                                    const printServiceUrl = `${iris.config.apiUrl}/reporting/reports/generate`;
                                                    const params = `{templateId:${$scope.templateId ? $scope.templateId : null},template:{pageSize:"${$scope.pageSize}", pageOrientation:"${$scope.orientation}"}}`;
                                                    const href = `${printServiceUrl}?url=${encodedPreviewUrl}&params=${encodeURIComponent(params)}&token=${iris.config.accessToken}`;
                                                    window.location.href = href
                                                }
                                            }, function error(response) {
                                                console.log("ERROR");
                                                console.log(response);
                                            });
                                        }
                                    }
                                };

                                $scope.setTemplate = function () {
                                    if (!$scope.templateId) return;

                                    var template = $scope.templates.find(d => d.id == $scope.templateId);
                                    $scope.orientation = template.pageOrientation;
                                    $scope.pageSize = template.pageSize;
                                }
                            }
                        });
                    }
                }
            }

            directive.compile = function () {
                return function (scope, element, attrs) {
                    link.apply(this, arguments);
                };
            };

            return $delegate;
        }]);
})({
    angular: angular,
    config: iris.config
});
