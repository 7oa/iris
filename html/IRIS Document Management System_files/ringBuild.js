(function(undefined) {
    window.irisFabricWidgets || (window.irisFabricWidgets = {});
    window.irisFabricWidgets.RingBuild = fabric.util.createClass(fabric.Group, {
        initialize: function (options) {
            options || (options = {});
            this.callSuper('initialize', [], options);

            this.lockUniScaling = true;

            fabric.util.object.extend(this, {
                ringRadius: options.radius || (this.width / 2),
                ringWidth: 6,
                ringStrokeWidth: 2,
                ringStroke: "#888",
                keyStoneVisible: options.keyStoneVisible === undefined ? true : !!options.keyStoneVisible,
                keyStoneAngle: options.keyStoneAngle || 0,
                keyStoneShape: options.keyStoneShape || "circle",
                keyStoneSize: options.keyStoneSize || 15,
                keyStoneFill: options.keyStoneFill || "#c00",
                ringTypeVisible: options.ringTypeVisible === undefined ? true : !!options.ringTypeVisible,
                ringTypeLabel: options.ringTypeLabel || "Ring Type",
                ringTypeValue: options.ringTypeValue || "?",
                keyPositionVisible: options.keyPositionVisible === undefined ? true : !!options.keyPositionVisible,
                keyPositionLabel: options.keyPositionLabel || "Key Stone Position",
                keyPositionValue: options.keyPositionValue || "?",
                labelFill: "#424242"
            });
        },

        scale: function (val) { return val / this.scaleX; },
        norm: function (val) { return val * this.scaleX; },

        render: function (ctx) {
            this._objects = [];

            this.addRing(this);
            if (this.keyStoneVisible) { this.addKeyStone(this); }
            this.callSuper('render', ctx);
            if (this.ringTypeVisible || this.keyPositionVisible) { this.addInners(ctx, this); }
        },

        addRing: function(settings) {
            var ringOuter = new fabric.Circle({
                radius: settings.ringRadius,
                fill: null,
                left: -1 * settings.ringRadius,
                top: -1 * settings.ringRadius,
                strokeWidth: this.scale(settings.ringStrokeWidth),
                stroke: settings.ringStroke
            });

            var ringInner = new fabric.Circle({
                radius: settings.ringRadius - this.scale(settings.ringWidth),
                fill: null,
                left: -1 * settings.ringRadius + this.scale(settings.ringWidth),
                top: -1 * settings.ringRadius + this.scale(settings.ringWidth),
                strokeWidth: this.scale(settings.ringStrokeWidth),
                stroke: settings.ringStroke
            });

            this.add(ringOuter);
            this.add(ringInner);
        },

        addKeyStone: function (settings) {
            var keyStone,
                keyStoneSize = this.scale(settings.keyStoneSize),
                keyStoneCircleRadius = settings.ringRadius - this.scale((settings.ringWidth + settings.ringStrokeWidth) / 2),
                keyStoneAngle = (settings.keyStoneAngle || 0) * Math.PI / 180,
                keyStoneOptions = {
                    width: keyStoneSize,
                    height: keyStoneSize,
                    radius: keyStoneSize / 2,
                    fill: settings.keyStoneFill,
                    top: -1 * keyStoneCircleRadius * Math.cos(keyStoneAngle) - keyStoneSize / 2,
                    left: keyStoneCircleRadius * Math.sin(keyStoneAngle) - keyStoneSize / 2
                };

            switch (settings.keyStoneShape) {
                case "triangle":
                    keyStone = new fabric.Triangle(keyStoneOptions);
                    break;
                case "rect":
                    keyStone = new fabric.Rect(keyStoneOptions);
                    break;
                default:
                    keyStone = new fabric.Circle(keyStoneOptions);
            }

            this.add(keyStone);
        },

        addInners: function(ctx, settings) {
            var minLabelFontSize = 8,
                emptySpace = this.norm(settings.ringRadius) * 0.1,
                params = {
                    minLabelFontSize,
                    emptySpace,
                    labelFontSize: Math.max(this.norm(settings.ringRadius) * 0.2, minLabelFontSize),
                    valueFontSize: this.norm(settings.ringRadius) * 0.4
                };

            if (this.ringTypeVisible) {
                params.labelText = settings.ringTypeLabel;
                params.valueText = "[ " + (settings.ringTypeValue || "?") + " ]";
                params.maxLabelWidth = this.norm(settings.ringRadius) * 2 * ((settings.keyPositionVisible ? 0.65 : 0.85));
                params.verticalPosition = this.top + this.norm(this.ringRadius) - (settings.keyPositionVisible ? params.valueFontSize : 0);

                this.addInnerBlock(ctx, params);
            }

            if (this.keyPositionVisible) {
                params.labelText = settings.keyPositionLabel;
                params.valueText = "[ " + (settings.keyPositionValue || "?") + " ]";
                params.maxLabelWidth = this.norm(settings.ringRadius) * 2 * ((settings.ringTypeVisible ? 0.8 : 0.85));
                params.verticalPosition = this.top + this.norm(this.ringRadius) + (settings.ringTypeVisible ? params.labelFontSize + params.emptySpace : 0);

                this.addInnerBlock(ctx, params);
            }
        },

        addInnerBlock: function(ctx, params) {
            var labelFontSize = params.labelFontSize;

            ctx.textBaseline = "middle";
            ctx.fillStyle = params.labelFill;
            ctx.font = "normal normal " + labelFontSize + "px Helvetica";

            while (ctx.measureText(params.labelText).width > params.maxLabelWidth && labelFontSize > params.minLabelFontSize) {
                labelFontSize = labelFontSize - 1;
                ctx.font = "normal normal " + labelFontSize + "px Helvetica";
            }

            ctx.fillText(params.labelText, -ctx.measureText(params.labelText).width / 2 + this.left + this.norm(this.ringRadius), params.verticalPosition - labelFontSize);

            ctx.font = "normal normal " + params.valueFontSize + "px Helvetica";
            ctx.fillText(params.valueText, -ctx.measureText(params.valueText).width / 2 + this.left + this.norm(this.ringRadius), params.verticalPosition + params.emptySpace);
        }
    });
})();