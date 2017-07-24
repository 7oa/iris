(function() {
    fabric.ArrowedLine = fabric.util.createClass(fabric.Object , {
        type: 'arrowedLine',

        lockUniScaling: true,

        lineType: "solid",
        firstArrowType: "line",
        secondArrowType: "line",

        initialize: function (options) {
            this.callSuper('initialize', options);
        },

        toObject: function () {
            return fabric.util.object.extend(this.callSuper('toObject'), {
                lineType: this.lineType,
                firstArrowType: this.firstArrowType,
                secondArrowType: this.secondArrowType
            });
        },

        render: function(ctx, noTransform) {
            this.height = Number(this.strokeWidth);
            this.scaleY = 1;
            this.callSuper('render', ctx);
        },

        _getNonTransformedDimensions: function() {
            return { x: this.width, y: this.height };
        },

        _render: function(ctx) {
            var ctxOptions = {
                lineWidth: Number(this.strokeWidth),
                scaleLineWidth: Number(this.strokeWidth) / this.scaleX
            };

            ctx.beginPath();
            ctx.strokeStyle = this.stroke;
            ctx.fillStyle = this.stroke;

            this._renderLine(ctx, ctxOptions);
            this._renderArrows(ctx, ctxOptions);
        },

        _renderLine: function(ctx, ctxOptions) {
            var dashStep = ctxOptions.scaleLineWidth;
            switch (this.lineType) {
                case "dotted":
                    ctx.setLineDash([dashStep, dashStep]);
                    break;
                case "dashed":
                    ctx.setLineDash([dashStep * 2, dashStep]);
                    break;
                default:
                    ctx.setLineDash([]);
                    break;
            }

            ctx.moveTo(-this.width / 2, 0);
            ctx.lineTo(this.width / 2, 0);
            ctx.lineWidth = ctxOptions.lineWidth;
            ctx.stroke();
        },

        _renderArrows: function(ctx, ctxOptions) {
            var arrowX = this.width / 2,
                arrowY = 0;

            switch (this.firstArrowType) {
                case "circle":
                    this._renderCircleArrow(ctx, ctxOptions, arrowX, arrowY);
                    break;
                case "square":
                    this._renderSquareArrow(ctx, ctxOptions, arrowX, arrowY);
                    break;
                case "triangle":
                    this._renderTriangleArrow(ctx, ctxOptions, arrowX, arrowY, 1);
                    break;
                case "line":
                    this._renderLineArrow(ctx, ctxOptions, arrowX, arrowY, 1);
                    break;
            }

            switch (this.secondArrowType) {
                case "circle":
                    this._renderCircleArrow(ctx, ctxOptions, -1 * arrowX, arrowY);
                    break;
                case "square":
                    this._renderSquareArrow(ctx, ctxOptions, -1 * arrowX, arrowY);
                    break;
                case "triangle":
                    this._renderTriangleArrow(ctx, ctxOptions, -1 * arrowX, arrowY, -1);
                    break;
                case "line":
                    this._renderLineArrow(ctx, ctxOptions, -1 * arrowX, arrowY, -1);
                    break;
            }
        },

        _renderCircleArrow: function(ctx, ctxOptions, x, y) {
            ctx.beginPath();
            ctx.ellipse(x, y, ctxOptions.scaleLineWidth, ctxOptions.lineWidth, 0, 0, 2 * Math.PI);
            ctx.fill();
        },
        _renderSquareArrow: function(ctx, ctxOptions, x, y) {
            ctx.beginPath();
            ctx.fillRect(x - ctxOptions.scaleLineWidth, y - ctxOptions.lineWidth, ctxOptions.scaleLineWidth * 2, ctxOptions.lineWidth * 2);
        },
        _renderTriangleArrow: function(ctx, ctxOptions, x, y, direction) {
            ctx.beginPath();
            ctx.moveTo(x + direction * ctxOptions.scaleLineWidth, y);
            ctx.lineTo(x - direction * ctxOptions.scaleLineWidth, y - ctxOptions.lineWidth);
            ctx.lineTo(x - direction * ctxOptions.scaleLineWidth, y + ctxOptions.lineWidth);
            ctx.fill();
        },
        _renderLineArrow: function(ctx, ctxOptions, x, y, direction) {
            ctx.beginPath();
            ctx.moveTo(x + direction * ctxOptions.scaleLineWidth, y);
            ctx.lineTo(x - direction * ctxOptions.scaleLineWidth, y - ctxOptions.lineWidth);
            ctx.lineTo(x, y);
            ctx.lineTo(x - direction * ctxOptions.scaleLineWidth, y + ctxOptions.lineWidth);
            ctx.fill();
        }
    });

    fabric.ArrowedLine.fromObject = function(object) {
        return new fabric.ArrowedLine(fabric.util.object.clone(object));
    };
})();