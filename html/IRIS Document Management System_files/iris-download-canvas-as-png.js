(function(globals) {
    'use strict' ;

    globals.angular.module('irisApp').directive('irisDownloadCanvasAsPng',
        function($translate) {

            return {
                restrict: 'EA',
                scope: {
                    getCanvasFunction: '=',
                    fileName: '='
                },
                replace: true,

                template: `
                    <a href="javascript:void(0)">
                        <i class="fa fa-file-pdf-o"></i>
                        PNG
                    </a>`,

                link: function (scope, element, attrs) {

                    element.bind('click', function() {

                        element.attr('download', scope.fileName);

                        // get the canvas from DOM
                        var canvas = scope.$eval(scope.getCanvasFunction);
                        if (canvas) {
                            // create base64 image from canvas
                            var base64
                            try {
                                base64 = canvas.toDataURL('image/png');
                            } catch (err) {
                                /* error might be caused by crossOrigin validation */
                                alertify.error($translate.instant('error.CanvasToDataUrlError') + ": " + err);
                            }
                            if (base64) {
                                element.attr('href', base64);
                            }
                        }
                    });
                }
            }
    });
})({
    angular: angular,
    config: iris.config
});
