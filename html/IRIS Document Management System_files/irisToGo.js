(function(globals) {
    'use strict' ;

    globals.angular.module('irisApp').directive('irisToGo',
        function (FilesService, LinksService, $uibModal) {
            return {
                replace: true,
                restrict: 'EA',
                scope: {
                    text: '=',
                    file: '=',
                    validDays: '=',
                    permanentLink: '=',
                    typeNumber: '=?',
                    correctionLevel: '=?',
                    size: '=?',
                    inputMode: '=?',
                    renderImage: '=?'
                },
                templateUrl: iris.config.baseUrl + '/common/directives/irisToGo/templates/iris-to-go.main.html',
                link: function (scope, element, attrs) {
                    var supportedMimeTypes = ['application/pdf', 'image/png', 'image/jpeg'];

                    scope.fileSupported = scope.file && scope.file.mimeType && (supportedMimeTypes.indexOf(scope.file.mimeType) > -1);

                    scope.openIrisToGoModal = function() {
                        scope.$parent.$close && scope.$parent.$close();
                        FilesService.share(scope.file, scope.validDays, scope.permanentLink).then(link => {
                            $uibModal.open({
                                templateUrl: iris.config.baseUrl + '/common/directives/irisToGo/templates/iris-to-go.dialog.html',
                                resolve: {
                                    'qrData': function () { return generateQrData(link); },
                                    'qrSettings' : function() { return {
                                        fileSupported: scope.fileSupported,
                                        typeNumber: scope.typeNumber || 0,
                                        correctionLevel: scope.correctionLevel || 'M',
                                        size: scope.size || 200,
                                        inputMode: scope.inputMode || '8bit',
                                        renderImage: scope.renderImage || true
                                    }; }
                                },
                                controller: function($scope, $resource, $uibModalInstance, qrData, qrSettings) {
                                    $scope.config = iris.config;
                                    $scope.qrData = qrData;
                                    $scope.fileSupported = qrSettings.fileSupported || false;
                                    $scope.typeNumber = qrSettings.typeNumber || 0;
                                    $scope.correctionLevel = qrSettings.correctionLevel || 'M';
                                    $scope.size = qrSettings.size || 200;
                                    $scope.inputMode = qrSettings.inputMode || '8bit';
                                    $scope.renderImage = qrSettings.renderImage || true;
                                }

                            });
                        });


                    };

                    function generateQrData(fileLink) {
                        var qrData = '';
                        if (fileLink) {
                            qrData = 'iris2go#';
                            qrData += LinksService.getLinkUrl(fileLink);
                            qrData += ('#' + scope.file.mimeType);
                            qrData += ('#' + scope.validDays);
                            qrData += ('#' + (scope.permanentLink ? '1' : '0'));
                            qrData += ('#' + scope.file.name);
                        }
                        return qrData;
                    }
                }
            };
        });
})({
    angular: angular,
    config: iris.config
});