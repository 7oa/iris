(function(BpmnJS) {
    function ChangeSupport(eventBus, canvas, elementRegistry, graphicsFactory) {
        eventBus.on('element.changed', function(event) {
            var element = event.element;

            if (element.parent || element === canvas.getRootElement()) {
                event.gfx = elementRegistry.getGraphics(element);
            }

            if (!event.gfx) {
                return;
            }

            var type = element.type == 'bpmn:SequenceFlow' ? 'connection' : 'shape';
            eventBus.fire(type + '.changed', event);
        });

        eventBus.on('elements.changed', function(event) {
            var elements = event.elements;

            elements.forEach(function(e) {
                eventBus.fire('element.changed', { element: e });
            });

            graphicsFactory.updateContainments(elements);
        });

        eventBus.on('shape.changed', function(event) {
            graphicsFactory.update('shape', event.element, event.gfx);
        });

        eventBus.on('connection.changed', function(event) {
            graphicsFactory.update('connection', event.element, event.gfx);
        });
    }

    ChangeSupport.$inject = [ 'eventBus', 'canvas', 'elementRegistry', 'graphicsFactory' ];

    BpmnJS.Viewer.prototype._modules.push({
        __init__: ["changeSupport"],
        changeSupport: ["type", ChangeSupport]
    });

    BpmnJS.NavigatedViewer.prototype._modules.push({
        __init__: ["changeSupport"],
        changeSupport: ["type", ChangeSupport]
    });
})(window.BpmnJS);