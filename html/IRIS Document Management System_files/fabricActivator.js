(function() {
    angular.module('fabric.core')
        .service('FabricActivator', function ($timeout, FabricConstant, FabricLib) {
            function createId() {
                return Math.floor(Math.random() * 10000).toString();
            }

            return {
                canvasDefaultOptions : {
                    backgroundColor: '#fff',
                    selectionBorderColor: 'rgba(147, 190, 61, 0.75)',
                    selectionColor: 'rgba(147, 190, 61, 0.2)',
                    fixAspectRatio: false,
                    aspectRatio: 1,

                },

                createEditor: function(element, options, readonly)
                {
                    options || (options = {});
                    angular.extend(this.canvasDefaultOptions, options);

                    if (this.canvasDefaultOptions.fixAspectRatio && this.canvasDefaultOptions.aspectRatio > 0) {
                        var elementWidth = element.attr("width") || FabricConstant.initialCanvasWidth;
                        element.attr("width", elementWidth);
                        element.attr("height", elementWidth / this.canvasDefaultOptions.aspectRatio);
                    }

                    var elementId = element.attr("id") || createId();
                    element.attr("id", elementId);

                    //var fabricEditor = readonly
                    //    ? new FabricLib.StaticCanvas(elementId, this.canvasDefaultOptions)
                    //    : new FabricLib.Canvas(elementId, this.canvasDefaultOptions);

                    var fabricEditor = new FabricLib.Canvas(elementId, this.canvasDefaultOptions);

                    if (readonly) {
                        fabricEditor.selection = false;
                        fabricEditor.on("object:added", function (e) {
                            if (e && e.target) {
                                e.target.selectable = false;
                            }
                        });
                    }

                    fabricEditor.wrapperEl || (fabricEditor.wrapperEl = fabricEditor.lowerCanvasEl);
                    fabricEditor.keyboardSupport(!readonly);
                    fabricEditor.dblClickSupport();

                    return fabricEditor;
                }
            };
        });
})();