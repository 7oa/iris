(function() {
    angular.module('iris_process_mgmt')
        .constant('ProcessElementTypes', {
            task: "task",
            parallelGateway: "parallelGateway",
            exclusiveGateway: "exclusiveGateway",
            sequenceFlow: "sequenceFlow",

            meta: {
                task: {
                    collectionName: "tasks",
                    bpmnTag: "bpmn:Task"
                },
                parallelGateway: {
                    collectionName: "parallelGateways",
                    bpmnTag: "bpmn:ParallelGateway"
                },
                exclusiveGateway: {
                    collectionName: "exclusiveGateways",
                    bpmnTag: "bpmn:ExclusiveGateway"
                },
                sequenceFlow: {
                    collectionName: "sequenceFlows"
                }
            }
        });
})();