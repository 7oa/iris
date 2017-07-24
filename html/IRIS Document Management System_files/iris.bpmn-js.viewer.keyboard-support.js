(function(BpmnJS) {
    function Keyboard(config, eventBus, zoomScroll, canvas) {
        var self = this;

        this._config = config || {};
        this._eventBus = eventBus;
        this._zoomScroll = zoomScroll;
        this._canvas = canvas;

        this._listeners = [];

        this._keyHandler = function(event) {
            var i, l,
                target = event.target,
                listeners = self._listeners,
                code = event.keyCode || event.charCode || -1;

            if (target && (target.localName == 'input' || target.localName == 'textarea' || target.contentEditable === 'true')) {
                return;
            }

            for (i = 0; (l = listeners[i]); i++) {
                if (l(code, event)) {
                    event.preventDefault();
                    event.stopPropagation();
                }
            }
        };

        eventBus.on('diagram.destroy', function() {
            self._fire('destroy');

            self.unbind();
            self._listeners = null;
        });

        eventBus.on('diagram.init', function() {
            self._fire('init');

            if (config && config.bindTo) {
                self.bind(config.bindTo);
            }
        });

        this._init();
    }

    Keyboard.$inject = [ 'config.keyboard', 'eventBus', 'zoomScroll', 'canvas' ];

    Keyboard.prototype.bind = function(node) {
        this.unbind();
        this._node = node;
        angular.element(node).on('keydown', this._keyHandler);
        this._fire('bind');
    };

    Keyboard.prototype.unbind = function() {
        var node = this._node;
        if (node) {
            this._fire('unbind');
            angular.element(node).off('keydown', this._keyHandler);
        }
        this._node = null;
    };

    Keyboard.prototype._fire = function(event) {
        this._eventBus.fire('keyboard.' + event, { node: this._node, listeners: this._listeners });
    };

    Keyboard.prototype._init = function() {
        var listeners = this._listeners;

        var zoomScroll = this._zoomScroll,
            canvas = this._canvas,
            config = this._config;

        function zoomIn(key, modifiers) {
            if ((key === 107 || key === 187 || key === 171 || key === 61) && isCmd(modifiers)) {
                zoomScroll.stepZoom(1);
                return true;
            }
        }

        function zoomOut(key, modifiers) {
            if ((key === 109 || key === 189 || key === 173)  && isCmd(modifiers)) {
                zoomScroll.stepZoom(-1);
                return true;
            }
        }

        // function zoomDefault(key, modifiers) {
        //     if ((key === 96 || key === 48) && isCmd(modifiers)) {
        //         canvas.zoom({ value: 1 });
        //         return true;
        //     }
        // }

        function moveCanvas(key, modifiers) {
            if ([37, 38, 39, 40].indexOf(key) >= 0) {
                var opts = {
                    invertY: config.invertY,
                    speed: (config.speed || 50)
                };

                switch (key) {
                    case 37:    // Left
                        opts.direction = 'left';
                        break;
                    case 38:    // Up
                        opts.direction = 'up';
                        break;
                    case 39:    // Right
                        opts.direction = 'right';
                        break;
                    case 40:    // Down
                        opts.direction = 'down';
                        break;
                }

                var dx = 0,
                    dy = 0,
                    invertY = opts.invertY,
                    speed = opts.speed;

                var actualSpeed = speed / Math.min(Math.sqrt(canvas.viewbox().scale), 1);

                switch (opts.direction) {
                    case 'left':    // Left
                        dx = actualSpeed;
                        break;
                    case 'up':    // Up
                        dy = actualSpeed;
                        break;
                    case 'right':    // Right
                        dx = -actualSpeed;
                        break;
                    case 'down':    // Down
                        dy = -actualSpeed;
                        break;
                }

                if (dy && invertY) {
                    dy = -dy;
                }

                canvas.scroll({ dx: dx, dy: dy });

                return true;
            }
        }

        listeners.push(zoomIn);
        listeners.push(zoomOut);
        //listeners.push(zoomDefault);
        listeners.push(moveCanvas);
    };


    Keyboard.prototype.addListener = function(listenerFn) {
        this._listeners.push(listenerFn);
    };

    Keyboard.prototype.hasModifier = hasModifier;
    Keyboard.prototype.isCmd = isCmd;
    Keyboard.prototype.isShift = isShift;

    function hasModifier(modifiers) {
        return (modifiers.ctrlKey || modifiers.metaKey || modifiers.shiftKey || modifiers.altKey);
    }

    function isCmd(modifiers) {
        return modifiers.ctrlKey || modifiers.metaKey;
    }

    function isShift(modifiers) {
        return modifiers.shiftKey;
    }

    BpmnJS.NavigatedViewer.prototype._modules.push({
        __init__: ["keyboard"],
        keyboard: ["type", Keyboard]
    });
})(window.BpmnJS);