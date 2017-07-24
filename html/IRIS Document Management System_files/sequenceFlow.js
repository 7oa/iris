(function (undefined) {
    angular.module('iris_process_mgmt').factory('ProcessSequenceFlowElement', function (FabricLib, ProcessBaseElement) {
        return FabricLib.util.createClass(ProcessBaseElement, {
            elementType: "sequenceFlow",

            initialize: function (processDefinition, options) {
                this.callSuper('initialize', processDefinition, options);

                this.source = this.processDefinition.findElementForSequenceFlow(options['sourceRef']);
                this.target = this.processDefinition.findElementForSequenceFlow(options['targetRef']);
            },

            toObject: function () {
                return angular.extend(this.callSuper('toObject'), {
                    name: this.name,
                    sourceRef: this.source.id,
                    targetRef: this.target.id,
                    properties: this.properties
                });
            }
        })
    });
})();