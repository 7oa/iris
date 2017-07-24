(function () {

    angular.module('irisFabric').factory('IrisFabricLineElement', function (FabricLib, IrisFabricBaseElement) {
        var constructor = FabricLib.util.createClass(IrisFabricBaseElement, {
            initFields: function() {
                this.callSuper('initFields');

                this.elementType = "line";
                this.relWidth = 8;

                this.stateDefault = {
                    viewObject: {
                        lineType: "solid",
                        firstArrowType: "none",
                        secondArrowType: "none",
                        strokeWidth: 5,
                        stroke: "#424242",
                        visible: true
                    }
                };
            },

            createViewObject: function(options) {
                return new FabricLib.ArrowedLine(options);
            }
        });

        constructor.fromObject = function(fabricEditor, options) {
            return new constructor(fabricEditor, options);
        };

        return constructor;
    });
})();