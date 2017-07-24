(function() {
    fabric.BaseCircleSpeedometer = fabric.util.createClass(fabric.Rect, {
        type: 'baseCircleSpeedometer',

        fill: null,
        lockUniScaling: true,

        progressFill: "#f00",
        centerPointFill: "#424242",
        centerPointStrokeStyle: "#93be3d",
        gaugeFill: "#424242",
        backgroundFill: null,
        fillLabel: "#424242",

        gaugeStepCount: 10,
        gaugeStepMiddle: true,

        showProgressLabel: false,
        showBoundsLabel: false,
        showUnits: false,
        units: null,
        fontStyle: null,
        fontWeight: null,
        fontSize: null,
        fontFamily: "Helvetica",
        labelPlaceholder: "n/a",
        labelDecimals: 3,
        labelAngle: 0,

        gaugeLengthCoef: 1,

        progress: null,
        minValue: 0,
        maxValue: 100,

        _relCenterRadius: 20,
        _relGaugeWidth: 10,
        _relGaugeLineWidth: 3,

        initialize: function (options) {
            options || (options = {});
            this.callSuper('initialize', options);
        },

        toObject : function() {
            return fabric.util.object.extend(this.callSuper('toObject'), {
                progressFill : this.progressFill,
                fillLabel : this.fillLabel,
                showProgressLabel: this.showProgressLabel,
                showBoundsLabel: this.showBoundsLabel,
                showUnits: this.showUnits,
                units: this.units,
                fontSize: this.fontSize,
                fontFamily: this.fontFamily,
                fontWeight: this.fontWeight,
                fontStyle: this.fontStyle,
                labelPlaceholder: this.labelPlaceholder,
                centerPointFill: this.centerPointFill,
                centerPointStrokeStyle: this.centerPointStrokeStyle,
                gaugeFill: this.gaugeFill,
                backgroundFill: this.backgroundFill,
                gaugeStepCount: this.gaugeStepCount,
                gaugeStepMiddle: this.gaugeStepMiddle,
                labelDecimals: this.labelDecimals,
                labelAngle: this.labelAngle
            });
        },

        _render: function (ctx) {
            this.callSuper('_render', ctx);

            this.minValue = this.minValue || 0;
            this.maxValue = this.maxValue || 0;

            var ctxOptions = this._getCtxOptions();

            this._renderGauge(ctx, ctxOptions);
            this._renderCenterPoint(ctx, ctxOptions);
            this._renderProgress(ctx, ctxOptions);
            if (this.showProgressLabel || this.showBoundsLabel) this._renderLabels(ctx, ctxOptions);
        },

        _getCtxOptions: function() {
            return {};
        },

        _renderCenterPoint: function(ctx, options) {
            ctx.beginPath();
            ctx.arc(options.posRight, options.posBottom, options.centerRadius, 0, 2 * Math.PI, false);
            ctx.fillStyle = this.centerPointFill;
            ctx.fill();
            ctx.lineWidth = options.gaugeLineWidth;
            ctx.strokeStyle = this.centerPointStrokeStyle;
            ctx.stroke()
        },

        _renderGauge: function(ctx, options) {
            if (this.backgroundFill) {
                ctx.beginPath();
                ctx.arc(options.posRight, options.posBottom, options.gaugeRadius, Math.PI, Math.PI + this.gaugeLengthCoef * Math.PI, false);
                ctx.lineTo(options.posRight, options.posBottom);
                ctx.fillStyle = this.backgroundFill;
                ctx.fill();
            }

            ctx.beginPath();
            ctx.arc(options.posRight, options.posBottom, options.gaugeRadius, Math.PI, Math.PI + this.gaugeLengthCoef * Math.PI, false);
            ctx.lineWidth = options.gaugeWidth;
            ctx.strokeStyle = this.gaugeFill;
            ctx.stroke();

            this._renderGaugeLines(ctx, options);
        },

        _renderGaugeLines: function(ctx, options) {
            var startRadius = options.gaugeRadius + options.gaugeWidth / 2,
                endRadius = startRadius - options.gaugeLineLong,
                endMiddleRadius = startRadius - options.gaugeLineShort;

            for (var step = 0; step <= 100 / options.gaugeLineStep; step++) {
                var angle = Math.PI * this.gaugeLengthCoef * step * options.gaugeLineStep / 100,
                    posStartX = - Math.cos(angle) * startRadius,
                    posStartY = - Math.sin(angle) * startRadius,
                    posEndX = - Math.cos(angle) * (options.gaugeStepMiddle ? (step % 2 == 0 ? endRadius : endMiddleRadius) : endRadius),
                    posEndY = - Math.sin(angle) * (options.gaugeStepMiddle ? (step % 2 == 0 ? endRadius : endMiddleRadius) : endRadius);

                ctx.beginPath();
                ctx.moveTo(posStartX + options.posRight, posStartY + options.posBottom);
                ctx.lineTo(posEndX + options.posRight, posEndY + options.posBottom);
                ctx.lineWidth = options.gaugeLineWidth;
                ctx.stroke();
            }
        },

        _renderProgress: function(ctx, options) {
            if (this.progress) {
                this.progress = Math.max(this.progress, this.minValue);
                this.progress = Math.min(this.progress, this.maxValue);
            }

            var progress = this.progress ? this.progress - this.minValue : 0,
                maxValue = this.maxValue - this.minValue,
                angle = progress * Math.PI * this.gaugeLengthCoef / maxValue,
                posStartX = - Math.cos(angle) * (options.centerRadius + options.gaugeLineWidth / 2),
                posStartY = - Math.sin(angle) * (options.centerRadius + options.gaugeLineWidth / 2),
                posEndX = - Math.cos(angle) * options.gaugeRadius,
                posEndY = - Math.sin(angle) * options.gaugeRadius;

            ctx.beginPath();
            ctx.moveTo(posStartX + options.posRight, posStartY + options.posBottom);
            ctx.lineTo(posEndX + options.posRight, posEndY + options.posBottom);
            ctx.lineWidth = options.gaugeLineWidth;
            ctx.strokeStyle = this.progressFill;
            ctx.globalAlpha = 0.7;
            ctx.stroke();
        },

        _renderLabels: function(ctx, options) {
            var progressLabel = this.progress || this.progress == 0 ? this.progress.toFixed(this.labelDecimals) : this.labelPlaceholder,
                unitsLabel = this.units ? " " + this.units.toString() : "",
                minLabel = this.minValue.toFixed(this.labelDecimals),
                maxLabel = this.maxValue.toFixed(this.labelDecimals),
                label = progressLabel + (this.showUnits ? unitsLabel : "");

            this.fontSize = this.fontSize || options.labelHeight;

            var angle = this.labelAngle * Math.PI / 180,
                fontSettings = {
                    fontStyle: this.fontStyle || "normal",
                    fontWeight: this.fontWeight || "normal",
                    fontSize: this.fontSize + "px",
                    boundsFontSize: Math.min(this.fontSize, options.labelHeight) + "px",
                    fontFamily: this.fontFamily || "Helvetica"
                };

            ctx.globalAlpha = 1;
            ctx.fillStyle = this.fillLabel;

            if (this.showBoundsLabel) {
                ctx.font = fontSettings["fontStyle"] + " " + fontSettings["fontWeight"] + " " + fontSettings["boundsFontSize"] + " " + fontSettings["fontFamily"];
                ctx.textBaseline = "bottom";

                var minLabelFlip = Math.cos(this.angle * Math.PI / 180) <= 0;
                if (minLabelFlip) {
                    ctx.rotate(Math.PI);
                    ctx.fillText(minLabel, options.boundsLabelRadius - options.posRight, Math.min(this.fontSize, options.labelHeight) - options.boundsLabelBottom);
                    ctx.rotate(-1 * Math.PI);
                } else {
                    ctx.fillText(minLabel, options.posRight - options.boundsLabelRadius - ctx.measureText(minLabel).width, options.boundsLabelBottom);
                }

                var maxLabelAngle = Math.PI * (this.gaugeLengthCoef - 1),
                    maxLabelFlip = Math.cos(this.angle * Math.PI / 180 + Math.PI * (this.gaugeLengthCoef - 1)) <= 0;
                if (maxLabelFlip) {
                    ctx.rotate(Math.PI + maxLabelAngle);
                    ctx.fillText(maxLabel, options.posRight - options.boundsLabelRadius - ctx.measureText(maxLabel).width, Math.min(this.fontSize, options.labelHeight) - options.boundsLabelBottom);
                    ctx.rotate(-1 * (Math.PI + maxLabelAngle));
                } else {
                    ctx.rotate(maxLabelAngle);
                    ctx.fillText(maxLabel, options.boundsLabelRadius - options.posRight, options.boundsLabelBottom);
                    ctx.rotate(-1 * maxLabelAngle);
                }
            }

            if (this.showProgressLabel) {
                ctx.font = fontSettings["fontStyle"] + " " + fontSettings["fontWeight"] + " " + fontSettings["fontSize"] + " " + fontSettings["fontFamily"];
                ctx.textBaseline = "middle";
                ctx.rotate(Math.PI * (this.gaugeLengthCoef - 1) / 2);
                ctx.rotate(angle);
                var labelRadius = options.progressLabelRadius + this.fontSize / 2;
                var progressLabelX = -1 * ctx.measureText(label).width / 2 * Math.cos(angle) + (options.posBottom - labelRadius) * Math.sin(angle) - ctx.measureText(label).width * (Math.max(Math.sin(angle), 0) - Math.min(Math.cos(angle), 0));
                var progressLabelY = (options.posBottom - labelRadius) * Math.cos(angle);
                ctx.fillText(label, progressLabelX, progressLabelY);
            }
        },
    });
})();