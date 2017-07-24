(function (BpmnJS, undefined) {
    angular.module('irisBpmn')
        .directive('irisBpmn', function (GUID, IrisBpmnTypes, TasksConst) {
            return {
                restrict: 'AE',
                transclude: true,
                replace: true,

                scope: {
                    diagramXml: '=',
                    elementsData: '=',
                    validator: '=',
                    api: '=?'
                },

                template: `<div class="iris-bpmn djs-scrollable" style="height: 100%;">
                           </div>`,

                controller: function ($scope) {
                },

                link: function ($scope, $element, $attrs) {
                    var rootProcessId = "Process_1",
                        highestPriority = 2000,
                        readonly = $attrs["readonly"] == "true",
                        bpmnOptions = {
                            container: $element,
                            keyboard: { bindTo: document }
                        },
                        containerWidth = $element.width(),
                        poolMargin = 25,
                        poolRight = 0,
                        poolTop = 70,
                        poolHeight = 300;

                    $scope.bpmnEditor = readonly ? new BpmnJS.NavigatedViewer(bpmnOptions) : new BpmnJS(bpmnOptions);

                    // console.log($scope.bpmnEditor)
                    //$scope.bpmnEditor.createDiagram();

                    $scope.diagramXml || ($scope.diagramXml =  `<?xml version="1.0" encoding="UTF-8"?>
                                                                <bpmn:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" targetNamespace="http://bpmn.io/schema/bpmn" id="Definitions_1">
                                                                    <bpmn:collaboration id="Collaboration_1">
                                                                        <bpmn:participant id="Participant_1" processRef="Process_1" />
                                                                    </bpmn:collaboration>
                                                                    <bpmn:process id="Process_1" isExecutable="true">
                                                                        <bpmn:startEvent id="StartEvent_1" />
                                                                    </bpmn:process>
                                                                    <bpmndi:BPMNDiagram id="BPMNDiagram_1">
                                                                        <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Collaboration_1">
                                                                            <bpmndi:BPMNShape id="Participant_1_di" bpmnElement="Participant_1">
                                                                                <dc:Bounds x="${poolRight + poolMargin}" y="${poolTop + poolMargin}" width="${containerWidth - poolRight - 2 * poolMargin - 50}" height="${poolHeight}" />
                                                                            </bpmndi:BPMNShape>
                                                                            <bpmndi:BPMNShape id="StartEvent_1_di" bpmnElement="StartEvent_1">
                                                                                <dc:Bounds x="${poolRight + 2 * poolMargin + 50}" y="${poolMargin + poolHeight / 2 - 18}" width="36" height="36" />
                                                                            </bpmndi:BPMNShape>
                                                                        </bpmndi:BPMNPlane>
                                                                      </bpmndi:BPMNDiagram>
                                                                </bpmn:definitions>`);

                    $scope.bpmnEditor.importXML($scope.diagramXml, function(err) {
                        if (err) {
                            return console.error('could not import BPMN 2.0 diagram', err);
                        }

                        var canvas = $scope.bpmnEditor.get('canvas');
                        canvas.zoom('fit-viewport');
                    });

                    var modeling = !readonly && $scope.bpmnEditor.get('modeling');
                    var elementFactory = $scope.bpmnEditor.get('elementFactory');
                    var elementRegistry = $scope.bpmnEditor.get('elementRegistry');
                    var bpmnRenderer = $scope.bpmnEditor.get('bpmnRenderer');
                    var moddle = $scope.bpmnEditor.get('moddle');
                    var bpmnRules = !readonly && $scope.bpmnEditor.get('bpmnRules');
                    var eventBus = $scope.bpmnEditor.get('eventBus');
                    var selection = $scope.bpmnEditor.get('selection');
                    var labelEditingProvider = !readonly && $scope.bpmnEditor.get('labelEditingProvider');

                    bpmnRules && bpmnRules.addRule('shape.resize', highestPriority, function(context) {
                        var shape = context.shape,
                            newBounds = context.newBounds;

                        if (IrisBpmnTypes.isTask(shape.type)) {
                            return !newBounds || (newBounds.width >= 100 && newBounds.height >= 80);
                        }
                        if (IrisBpmnTypes.isContainer(shape.type)) {
                            return !newBounds || (newBounds.width >= 250 && newBounds.height >= 100);
                        }

                        return false;
                    });

                    // deny deleting of Participant
                    bpmnRules && bpmnRules.addRule('elements.delete', highestPriority, function(context) {
                        return context.elements.filter(function(e) {
                            return !e.businessObject.$instanceOf(IrisBpmnTypes.participant.type);
                        });
                    });

                    // function getRoot() {
                    //     return elementRegistry.get(rootProcessId);
                    // }

                    function refreshElement(element) {
                        // eventBus.fire('commandStack.changed', {
                        //     element: element
                        // });

                        eventBus.fire('element.changed', {
                            element: getElementById(element.id)
                        });
                    };

                    function setSelection(element) {
                        selection.select(element);
                    }

                    function getElements() {
                        var res = elementRegistry.getAll();
                        return res;
                    }

                    function getEditableElements() {
                        var res = elementRegistry.filter(t => IrisBpmnTypes.isEditable(t.type));
                        return res;
                    }

                    function getLaneElements() {
                        var res = elementRegistry.filter(t => t.type == IrisBpmnTypes.lane.type);
                        return res;
                    }

                    function getLastLane() {
                        var lanes = getLaneElements();
                        return lanes && lanes.length && lanes[lanes.length - 1];
                    }

                    function getElementById(id) {
                        return getElements().find(t => t.id == id);
                    }

                    function getElementPropertiesById(elementId) {
                        var res = $scope.elementsData.find(t => t.id == elementId);
                        if (!res) {
                            $scope.elementsData.push({id: elementId});
                            return getElementPropertiesById(elementId);
                        }
                        res.properties || (res.properties = {});
                        return res.properties;
                    }

                    function getElementProperties(element) {
                        return getElementPropertiesById(element.id);
                    }

                    function appendTasksData(tasks) {
                        tasks.forEach(t => {
                            var element = getElementById(t.processTaskId);
                            if (!element) return;

                            var elementData = getElementProperties(element);
                            elementData.task = t;

                            refreshElement(element);
                        });
                    }

                    function fillElementProperties(properties, element) {
                        var businessObject = element.businessObject || {};
                        if (businessObject.lanes && businessObject.lanes.length) {
                            properties.workGroupId = ''+getElementPropertiesById(businessObject.lanes[0].id).workGroupId;
                        } else {
                            delete properties.workGroupId;
                        }
                    }

                    function getElementInfo(element) {
                        var properties = getElementProperties(element);
                        if (!IrisBpmnTypes.isContainer(element.type)) fillElementProperties(properties, element);
                        return {
                            element: element,
                            properties: properties
                        };
                    }

                    function getElementsInfo() {
                        var res = [];
                        getEditableElements().forEach(e => {
                            res.push(getElementInfo(e));
                        });
                        return res;
                    }

                    function getLanesInfo() {
                        var res = [];
                        getLaneElements().forEach(e => {
                            var properties = getElementProperties(e);
                            res.push({
                                element: e,
                                properties: properties
                            });
                        });
                        return res;
                    }

                    function getFilteredData(predicate) {
                        var itemIds = getElements().filter(predicate).map(t => t.id);
                        return $scope.elementsData.filter(t => itemIds.indexOf(t.id) >= 0);
                    }

                    function getTasksData() {
                        return getFilteredData(t => IrisBpmnTypes.isTask(t.type));
                    }
                    function getConnectionsData() {
                        return getFilteredData(t => IrisBpmnTypes.isConnection(t.type));
                    }
                    function getParallelGatewaysData() {
                        return getFilteredData(t => IrisBpmnTypes.isParallelGateway(t.type));
                    }
                    function getExclusiveGatewaysData() {
                        return getFilteredData(t => IrisBpmnTypes.isExclusiveGateway(t.type));
                    }
                    function getLanesData() {
                        return getFilteredData(t => t.type == IrisBpmnTypes.lane.type);
                    }

                    function trimElementsData() {
                        var elementIds = getElements().map(t => t.id),
                            item = $scope.elementsData.find(t => elementIds.indexOf(t.id) < 0);
                        while (item) {
                            $scope.elementsData.splice($scope.elementsData.indexOf(item), 1);
                            item = $scope.elementsData.find(t => elementIds.indexOf(t.id) < 0);
                        }
                    }

                    function prepareElementsData() {
                        trimElementsData();

                        $scope.elementsData.forEach(t => {
                            var element = getElementById(t.id),
                                businessObject = element && element.businessObject || {};
                            t.name = businessObject.name;
                            t.incomings = businessObject.incoming && Array.isArray(businessObject.incoming) && businessObject.incoming.map(k => k.id) || null;
                            t.outgoings = businessObject.outgoing && Array.isArray(businessObject.outgoing) && businessObject.outgoing.map(k => k.id) || null;

                            if (IrisBpmnTypes.isConnection(element.type)) {
                                t.sourceRef = element.businessObject.sourceRef.id;
                                t.targetRef = element.businessObject.targetRef.id;
                            }

                            fillElementProperties(t, element);
                        });
                    }

                    function updateParticipantName(val) {
                        var firstParticipant = elementRegistry.filter(t => t.type == IrisBpmnTypes.participant.type)[0];
                        modeling.updateProperties(firstParticipant, {name: val});
                    }

                    function createLane(properties, elementProperties) {
                        var lastLane = getLastLane(),
                            firstParticipant = elementRegistry.filter(t => t.type == IrisBpmnTypes.participant.type)[0];

                        var element = lastLane
                            ? modeling.addLane(getLastLane(), "bottom")
                            : modeling.createShape({type: IrisBpmnTypes.lane.type}, {
                                x: firstParticipant.x + 30,
                                y: firstParticipant.y,
                                width: firstParticipant.width - 30,
                                height: firstParticipant.height
                            }, firstParticipant);

                        //element.businessObject.di.id = GUID.create();
                        properties && modeling.updateProperties(element, properties);

                        if (elementProperties) {
                            var data = getElementProperties(element);
                            for (var name in elementProperties) {
                                if (elementProperties.hasOwnProperty(name)) {
                                    data[name] = elementProperties[name];
                                }
                            }
                        }

                        return element;
                    }

                    function removeElement(element) {
                        modeling.removeShape(element);
                    }

                    // function createParticipant(properties) {
                    //     var element = modeling.createShape(elementFactory.createParticipantShape(), {x:0, y:0}, getRoot());
                    //     element.businessObject.di.id = GUID.create();
                    //     properties && modeling.updateProperties(element, properties);
                    //     return element;
                    // }

                    // function createShape(type, properties, position) {
                    //     var element = modeling.createShape({type: type, isExpanded: true}, position || {x:50, y:50}, getRoot());
                    //     element.businessObject.di.id = GUID.create();
                    //     modeling.updateProperties(element, properties);
                    //     return element;
                    // }
                    //
                    // function createConnection(sourceId, targetId, properties) {
                    //     var element = modeling.createConnection(getElementById(sourceId), getElementById(targetId), {type: IrisBpmnTypes.sequenceFlow.type}, getRoot());
                    //     element.businessObject.di.id = GUID.create();
                    //     modeling.updateProperties(element, properties);
                    //     return element;
                    // }

                    function setCondition(element, condition) {
                        var item = moddle.create('bpmn:FormalExpression', {
                            body: '${ ' + condition + ' }'
                        });
                        modeling.updateProperties(element, { conditionExpression: item });
                    }

                    function processExclusiveConditions() {
                        getElements().filter(t => IrisBpmnTypes.isExclusiveGateway(t.type) && t.businessObject.outgoing).forEach(g => {
                            g.businessObject.outgoing.forEach(f => {
                                setCondition(getElementById(f.id), `id == "${f.targetRef.id}"`);
                            });
                        });
                    }

                    function updateElementProperties(element, properties) {
                        modeling.updateProperties(element, properties);
                        labelEditingProvider.update(element, properties.name);
                    }

                    function getXml(callback) {
                        $scope.bpmnEditor.saveXML({ format: true }, callback);
                    }

                    function setValidator(validator) {
                        $scope.validator = validator;
                    }

                    $scope.bpmnEditor.on('selection.changed', function (e) {
                        $scope.$emit('irisBpmn:element:selected', e.newSelection && e.newSelection.length == 1 ? e.newSelection[0] : null);
                    });

                    $scope.bpmnEditor.on('import.render.complete', function() {
                        var button = $element.find(".djs-palette-toggle"),
                            palette = $element.find(".djs-palette"),
                            dragFn = (event) => {
                                palette.css("left", Math.max(0, event.clientX + $scope.paletteDrag.left));
                                palette.css("top", Math.max(0, event.clientY + $scope.paletteDrag.top));
                                event.preventDefault();
                                return false;
                            };
                        button.attr("draggable", "true");
                        button.on("dragstart", (event) => {
                            $scope.paletteDrag = {
                                left: parseInt(palette.css("left")) - event.clientX,
                                top: parseInt(palette.css("top")) - event.clientY
                            };
                        });
                        button.on("drag", dragFn);
                        button.on("dragend", dragFn);

                        $scope.$emit('irisBpmn:rendered');
                    });

                    $scope.bpmnEditor.on('render.shape', highestPriority, function(evt, context) {
                        var element = context.element,
                            properties = getElementProperties(element),
                            visuals = context.gfx,
                            shape = bpmnRenderer.drawShape(visuals, element),
                            snapShape = Snap(shape);

                        if ($scope.validator && IrisBpmnTypes.isEditable(element.type) && !IrisBpmnTypes.isContainer(element.type)) {
                            var elementInfo = getElementInfo(element),
                                v = $scope.validator.validateElementsInfo([elementInfo]);
                            if (!v.valid) snapShape.attr({ stroke: TasksConst.notValidStrokeColor });
                        }

                        switch (element.type) {
                            case IrisBpmnTypes.userTask.type:
                                if (properties && properties.task) {
                                    snapShape.attr({ strokeWidth: TasksConst.strokeWidth });
                                    snapShape.attr({ stroke: properties.task.active ? TasksConst.activeStrokeColor : TasksConst.notActiveStrokeColor });
                                    properties.task.current && snapShape.attr({ stroke: TasksConst.currentStrokeColor });
                                }
                                break;
                        }

                        return shape;
                    });

                    $scope.bpmnEditor.on('render.connection', highestPriority, function(evt, context) {
                        var element = context.element,
                            properties = getElementProperties(element),
                            visuals = context.gfx;

                        var shape = bpmnRenderer.drawConnection(visuals, element);
                        properties && properties.color && angular.element(shape).css("stroke", properties.color);
                        return shape;
                    });

                    $scope.api = {
                        getEditor: function () {
                            return $scope.bpmnEditor;
                        },
                        getElementById,
                        getElements,
                        getEditableElements,
                        getElementProperties,
                        getXml,

                        getElementsInfo,
                        getLanesInfo,

                        getTasksData,
                        getConnectionsData,
                        getParallelGatewaysData,
                        getExclusiveGatewaysData,
                        getLanesData,

                        appendTasksData,

                        trimElementsData,
                        prepareElementsData,

                        processExclusiveConditions,

                        // createShape,
                        // createConnection,

                        createLane,

                        removeElement,

                        updateParticipantName,

                        updateElementProperties,
                        refreshElement,

                        setSelection,
                        setValidator
                    };
                }
            };
        });
})(window.BpmnJS);