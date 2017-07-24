(function () {

    angular.module('irisFabric').factory('IrisFabricIconElement', function ($interpolate, $filter, FabricLib, IrisFabricBaseElement) {
        var constructor = FabricLib.util.createClass(IrisFabricBaseElement, {
            initFields: function() {
                this.callSuper('initFields');

                this.elementType = "icon";

                this.stateDefault = {
                    viewObject: {
                        charCode: "F047",
                        fill: "#424242",
                        visible: true
                    }
                };
            },

            initialize: function (fabricEditor, options) {
                this.callSuper('initialize', fabricEditor, options);
            },

            createViewObject: function(options) {
                return new FabricLib.FaIcon(options);
            }
        });

        constructor.fromObject = function(fabricEditor, options) {
            return new constructor(fabricEditor, options);
        };

        return constructor;
    });
})();