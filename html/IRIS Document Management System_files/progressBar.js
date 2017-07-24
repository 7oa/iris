(function(undefined) {
    fabric.ProgressBar = fabric.util.createClass(fabric.Rect, {
        type: 'progressBar',

        fill: "#424242",
        fillProgress: "#93be3d",
        fillLabel: "#fff",
        showLabel: false,
        showUnits: false,
        units: null,
        fontStyle: null,
        fontWeight: null,
        fontSize: null,
        fontFamily: "Helvetica",
        labelPlaceholder: "n/a",
        labelDecimals: 3,
        labelAngle: 0,
        textAlign: "center",

        progress: null,
        minValue: 0,
        maxValue: 100,

        initialize: function (options) {
            this.callSuper('initialize', options);
        },

        toObject : function() {
            return fabric.util.object.extend(this.callSuper('toObject'), {
                fillProgress : this.fillProgress,
                fillLabel : this.fillLabel,
                showLabel: this.showLabel,
                showUnits: this.showUnits,
                units: this.units,
                fontSize: this.fontSize,
                fontFamily: this.fontFamily,
                fontWeight: this.fontWeight,
                fontStyle: this.fontStyle,
                labelPlaceholder: this.labelPlaceholder,
                textAlign: this.textAlign,
                labelDecimals: this.labelDecimals,
                labelAngle: this.labelAngle
            });
        },

        _render: function (ctx) {
            this.callSuper('_render', ctx);

            var absProgressPadding = 3,
                absLabelPadding = absProgressPadding / 2;

            var ctxOptions = {
                labelPadding: absLabelPadding / this.scaleY,
                progressWidth: this.width - 2 * absProgressPadding / this.scaleX,
                progressHeight: this.height - 2 * absProgressPadding / this.scaleY
            };

            if (this.progress) {
                this.progress = Math.max(this.progress, this.minValue);
                this.progress = Math.min(this.progress, this.maxValue);
            }

            this._renderProgress(ctx, ctxOptions);
            if (this.showLabel) this._renderLabel(ctx, ctxOptions);
        },

        _renderProgress: function(ctx, options) {
            var progress = this.progress ? this.progress - this.minValue : 0,
                maxValue = this.maxValue - this.minValue;

            ctx.fillStyle = this.fillProgress;
            ctx.fillRect(-options.progressWidth / 2, -options.progressHeight / 2, progress * options.progressWidth / maxValue, options.progressHeight);
        },

        _renderLabel: function(ctx, options) {
            var progressLabel = this.progress || this.progress == 0 ? this.progress.toFixed(this.labelDecimals) : this.labelPlaceholder,
                unitsLabel = this.units ? " " + this.units.toString() : "",
                label = (this.showLabel ? progressLabel : "") + (this.showUnits ? unitsLabel : "");

            this.fontSize = this.fontSize || options.progressHeight - 2 * options.labelPadding;
            this.textAlign = this.textAlign || "center";

            var angle = this.labelAngle * Math.PI / 180,
                labelContainerWidth = (options.progressWidth - 2 * options.labelPadding) * Math.cos(angle) * this.scaleX + (options.progressHeight - 2 * options.labelPadding) * Math.sin(angle) * this.scaleY,
                fontSettings = {
                    fontStyle: this.fontStyle || "normal",
                    fontWeight: this.fontWeight || "normal",
                    fontSize: this.fontSize + "px",
                    fontFamily: this.fontFamily || "Helvetica",
                };

            ctx.scale(1 / this.scaleX, 1 / this.scaleY);
            ctx.rotate(angle);
            ctx.font = fontSettings["fontStyle"] + " " + fontSettings["fontWeight"] + " " + fontSettings["fontSize"] + " " + fontSettings["fontFamily"];
            ctx.fillStyle = this.fillLabel;
            ctx.textBaseline = "middle";

            switch (this.textAlign) {
                case "left":
                    ctx.fillText(label, -labelContainerWidth / 2 + Math.min(0, Math.cos(angle), Math.sin(angle)) * ctx.measureText(label).width, 0);
                    break;
                case "center":
                    ctx.fillText(label, -ctx.measureText(label).width / 2, 0);
                    break;
                case "right":
                    ctx.fillText(label, labelContainerWidth / 2 - Math.max(0, Math.cos(angle), Math.sin(angle)) * ctx.measureText(label).width, 0);
                    break;
                default:
                    ctx.fillText(label, -ctx.measureText(label).width / 2, 0);
                    break;
            }
        }
    });

    fabric.ProgressBar.fromObject = function(object) {
        return new fabric.ProgressBar(fabric.util.object.clone(object));
    };
})();