(function() {
    angular.module('irisBpmn')
        .service('IrisBpmnTypes', function($translate) {
            var editableTypes = ["bpmn:UserTask", "bpmn:ParallelGateway", "bpmn:ExclusiveGateway", "bpmn:SequenceFlow", "bpmn:StartEvent", "bpmn:EndEvent", "bpmn:Lane"],
                taskTypes = ["bpmn:UserTask", "bpmn:Task"],
                connectionTypes = ["bpmn:SequenceFlow"],
                exclusiveGatewayTypes = ["bpmn:ExclusiveGateway"],
                parallelGatewayTypes = ["bpmn:ParallelGateway"],
                containerTypes = ["bpmn:Participant", "bpmn:Lane"];

            var typesMeta = [
                { alias: "task", type: "bpmn:Task", description: $translate.instant("label.Task"), icon: "fa-user-circle-o" },
                { alias: "parallelGateway", type: "bpmn:ParallelGateway", description: $translate.instant("label.pm.ParallelGateway"), icon: "fa-plus" },
                { alias: "exclusiveGateway", type: "bpmn:ExclusiveGateway", description: $translate.instant("label.pm.ExclusiveGateway"), icon: "fa-times" },
                { alias: "sequenceFlow", type: "bpmn:SequenceFlow", description: $translate.instant("label.pm.SequenceFlow"), icon: "fa-expand" },
                { alias: "startEvent", type: "bpmn:StartEvent", description: $translate.instant("label.pm.StartEvent"), icon: "fa-play-circle-o" },
                { alias: "endEvent", type: "bpmn:EndEvent", description: $translate.instant("label.pm.EndEvent"), icon: "fa-stop-circle-o" },
                { alias: "task", type: "bpmn:UserTask", description: $translate.instant("label.Task"), icon: "fa-user-circle-o" },
                { alias: "lane", type: "bpmn:Lane", description: $translate.instant("label.Workgroup"), icon: "fa-users" },
                { alias: "participant", type: "bpmn:Participant" }
            ];

            var getTypeMeta = (type) => typesMeta.find(t => t.type == type);

            return {
                editableTypes,
                isEditable: (type) => editableTypes.indexOf(type) >= 0,

                isTask: (type) => taskTypes.indexOf(type) >= 0,
                isParallelGateway: (type) => parallelGatewayTypes.indexOf(type) >= 0,
                isExclusiveGateway: (type) => exclusiveGatewayTypes.indexOf(type) >= 0,
                isGateway: (type) => parallelGatewayTypes.indexOf(type) >= 0 || exclusiveGatewayTypes.indexOf(type) >= 0,
                isConnection: (type) => connectionTypes.indexOf(type) >= 0,
                isContainer: (type) => containerTypes.indexOf(type) >= 0,

                getTypeMeta,
                getTypeAlias: (type) => getTypeMeta(type).alias,
                getTypeDescription: (type) => getTypeMeta(type).description,
                getTypeIcon: (type) => getTypeMeta(type).icon,

                task: typesMeta[0],
                parallelGateway: typesMeta[1],
                exclusiveGateway: typesMeta[2],
                sequenceFlow: typesMeta[3],
                startEvent: typesMeta[4],
                endEvent: typesMeta[5],
                userTask: typesMeta[6],
                lane: typesMeta[7],
                participant: typesMeta[8]
            }
        });
})();