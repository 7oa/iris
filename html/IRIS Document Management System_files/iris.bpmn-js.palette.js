(function(BpmnJS) {
    function IrisBpmnPaletteProvider(palette, create, elementFactory, zoomScroll) {

        this._create = create;
        this._elementFactory = elementFactory;
        this._zoomScroll = zoomScroll;

        palette.registerProvider(this);
    }

    IrisBpmnPaletteProvider.$inject = [ 'palette', 'create', 'elementFactory', 'zoomScroll' ];

    IrisBpmnPaletteProvider.prototype.getPaletteEntries = function() {

        var elementFactory = this._elementFactory,
            create = this._create,
            zoomScroll = this._zoomScroll;

        function createAction(type, group, className, title, options) {

            function createListener(event) {
                var shape = elementFactory.createShape(angular.extend({ type: type }, options));

                if (options) {
                    shape.businessObject.di.isExpanded = options.isExpanded;
                }

                create.start(event, shape);
            }

            var shortType = type.replace(/^bpmn\:/, '');

            return {
                group: group,
                className: className,
                title: title || `Create ${shortType}`,
                action: {
                    dragstart: createListener,
                    click: createListener
                }
            };
        }

        return {
            'zoom-separator-before': {
                group: 'tools',
                className: 'iris-bpmn-tool-separator',
                action: { click: () => {} }
            },
            'zoom-in': {
                group: 'tools',
                className: 'iris-bpmn-icon-plus',
                title: 'Zoom in',
                action: {
                    click: function(event) {
                        zoomScroll.stepZoom(1);
                    }
                }
            },
            'zoom-out': {
                group: 'tools',
                className: 'iris-bpmn-icon-minus',
                title: 'Zoom out',
                action: {
                    click: function(event) {
                        zoomScroll.stepZoom(-1);
                    }
                }
            },
            'zoom-separator-after': {
                group: 'tools',
                className: 'iris-bpmn-tool-separator',
                action: { click: () => {} }
            },
            'create.parallel-gateway': createAction(
                'bpmn:ParallelGateway', 'gateway', 'bpmn-icon-gateway-parallel'
            ),
            'create.task': createAction(
                'bpmn:UserTask', 'activity', 'bpmn-icon-task'
            )
        };
    };

    BpmnJS.prototype._modules.push({
        __init__: ["irisBpmnPaletteProvider"],
        irisBpmnPaletteProvider: ["type", IrisBpmnPaletteProvider]
    });
})(window.BpmnJS);