(function() {
    fabric.FaIcon = fabric.util.createClass(fabric.Object , {
        type: 'faIcon',

        lockUniScaling: true,
        size: 20,

        initialize: function (options) {
            this.callSuper('initialize', options);
        },

        render: function(ctx, noTransform) {
            this.width = this.size;
            this.height = this.size;
            this.callSuper('render', ctx);
        },

        _getNonTransformedDimensions: function() {
            return { x: this.width, y: this.height };
        },

        _render: function(ctx) {
            var text = String.fromCharCode("0x" + this.charCode);
            ctx.font = this.size + "px FontAwesome";
            ctx.fillStyle = this.fill;
            ctx.textBaseline = "middle";
            ctx.fillText(text, -ctx.measureText(text).width / 2, 0);
        }
    });

    fabric.FaIcon.fromObject = function(object) {
        return new fabric.FaIcon(fabric.util.object.clone(object));
    };
})();