(function(BpmnJS) {
    function IrisBpmnViewerPaletteProvider(palette, zoomScroll) {
        this._zoomScroll = zoomScroll;
        palette.registerProvider(this);
    }

    IrisBpmnViewerPaletteProvider.$inject = [ 'palette', 'zoomScroll' ];

    IrisBpmnViewerPaletteProvider.prototype.getPaletteEntries = function() {
        var zoomScroll = this._zoomScroll;

        return {
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
            }
        };
    };

    var __paletteProvider = BpmnJS.prototype._modules.find(m => !!m["paletteProvider"]);
    var __palette = __paletteProvider.__depends__.find(m => !!m["palette"]);
    var __toolManager = __palette.__depends__.find(m => !!m["toolManager"]);
    var __dragging = __toolManager.__depends__.find(m => !!m["dragging"]);

    BpmnJS.NavigatedViewer.prototype._modules.push({
        __init__: ["dragging"],
        dragging: ["type", __dragging["dragging"][1]]
    });
    BpmnJS.NavigatedViewer.prototype._modules.push({
        __init__: ["palette"],
        palette: ["type", __palette["palette"][1]]
    });
    BpmnJS.NavigatedViewer.prototype._modules.push({
        __init__: ["IrisBpmnViewerPaletteProvider"],
        IrisBpmnViewerPaletteProvider: ["type", IrisBpmnViewerPaletteProvider]
    });
})(window.BpmnJS);