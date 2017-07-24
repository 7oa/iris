(function () {
    angular.module('iris_process_mgmt').factory('ProcessDefinitionElementActivator',
        function (ProcessElementTypes, ProcessTaskElement, ProcessParallelGatewayElement, ProcessExclusiveGatewayElement, ProcessSequenceFlowElement) {
            return {
                create: function (processDefinition, elementType, options) {
                    switch (elementType) {
                        case ProcessElementTypes.task:
                            return new ProcessTaskElement(processDefinition, options);
                        case ProcessElementTypes.parallelGateway:
                            return new ProcessParallelGatewayElement(processDefinition, options);
                        case ProcessElementTypes.exclusiveGateway:
                            return new ProcessExclusiveGatewayElement(processDefinition, options);
                        case ProcessElementTypes.sequenceFlow:
                            return new ProcessSequenceFlowElement(processDefinition, options);
                        default:
                            return {};
                    }
                }
            };
        });
})();