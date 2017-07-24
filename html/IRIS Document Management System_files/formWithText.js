(function() {
    fabric.CircleWithText = fabric.util.createClass(fabric.Circle, {
        type: 'circleWithText',

        fill: "#424242",

        text: "",
        fillText: "#fff",
        fontStyle: null,
        fontWeight: null,
        fontSize: null,
        fontFamily: "Helvetica",
        textAlign: "center",

        shadowBorder: false,

        initialize: function (options) {
            this.callSuper('initialize', options);
        },

        toObject: function () {
            return fabric.util.object.extend(this.callSuper('toObject'), {
                text: this.text,
                shadowBorder: this.shadowBorder,
                fontSize: this.fontSize,
                fontFamily: this.fontFamily,
                fontWeight: this.fontWeight,
                fontStyle: this.fontStyle,
                textAlign: this.textAlign
            });
        },

        render: function (ctx, noTransform) {
            if (this.shadowBorder) {
                this.strokeWidth = this.width * 0.2;
                this.stroke = (new fabric.Color(this.fill)).setAlpha(0.4).toRgba();
            }
            this.callSuper('render', ctx, noTransform);
        },

        _render: function (ctx) {
            this.callSuper('_render', ctx);
            this._renderText(ctx);
        },

        _renderText: function(ctx) {
            this.fontSize = this.height * this.scaleY / 2;
            this.textAlign = this.textAlign || "center";

            var fontSettings = {
                fontStyle: this.fontStyle || "normal",
                fontWeight: this.fontWeight || "normal",
                fontSize: this.fontSize + "px",
                fontFamily: this.fontFamily || "Helvetica",
            };

            ctx.scale(1 / this.scaleX, 1 / this.scaleY);
            ctx.font = fontSettings["fontStyle"] + " " + fontSettings["fontWeight"] + " " + fontSettings["fontSize"] + " " + fontSettings["fontFamily"];
            ctx.fillStyle = this.fillText;
            ctx.textBaseline = "middle";

            switch (this.textAlign) {
                case "left":
                    ctx.fillText(this.text, -this.width / 2, 0);
                    break;
                case "center":
                    ctx.fillText(this.text, -ctx.measureText(this.text).width / 2, 0);
                    break;
                case "right":
                    ctx.fillText(this.text, this.width / 2 - ctx.measureText(this.text).width, 0);
                    break;
                default:
                    ctx.fillText(this.text, -ctx.measureText(this.text).width / 2, 0);
                    break;
            }
        }
    });

    fabric.CircleWithText.fromObject = function(object) {
        return new fabric.CircleWithText(fabric.util.object.clone(object));
    };
})();