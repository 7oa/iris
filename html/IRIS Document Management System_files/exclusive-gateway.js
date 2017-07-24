(function (undefined) {
    angular.module('iris_process_mgmt').factory('ProcessExclusiveGatewayElement', function (FabricLib, ProcessBaseElement) {
        return FabricLib.util.createClass(ProcessBaseElement, {
            elementType: "exclusiveGateway",

            initialize: function (processDefinition, options) {
                this.callSuper('initialize', processDefinition, options);

                this.incoming = [];
                this.outgoing = [];
            },

            toObject: function () {
                return angular.extend(this.callSuper('toObject'), {
                    name: this.name,
                    incoming: this.incoming.map(t => t.id),
                    outgoing: this.outgoing.map(t => t.id),
                    properties: this.properties
                });
            }
        })
    });
})();