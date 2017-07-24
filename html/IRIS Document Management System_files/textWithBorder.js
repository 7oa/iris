(function() {
    fabric.TextWithBorder = fabric.util.createClass(fabric.Text , {
        type: 'textWithBorder',

        lockUniScaling: true,
        borderFill: '#000',
        borderWidth: 1,
        borderVisible: false,

        initialize: function (text, options) {
            this.callSuper('initialize', text, options);
        },

        toObject : function() {
            return fabric.util.object.extend(this.callSuper('toObject'), {
                borderFill : this.borderFill,
                borderWidth : this.borderWidth,
                borderVisible: this.borderVisible
            });
        },

        _render: function(ctx) {
            this.callSuper('_render', ctx);

            this.padding = this.borderVisible ? this.borderWidth * this.scaleX : 0;
            if (this.borderVisible) this._renderBorder(ctx);
        },

        _renderBorder: function(ctx) {
            var fullWidth = this.width + this.borderWidth,
                fullHeight = this.height + this.borderWidth;

            ctx.strokeStyle = this.borderFill;
            ctx.lineWidth = this.borderWidth;
            ctx.strokeRect(-fullWidth / 2, -fullHeight / 2, fullWidth, fullHeight);
        }
    });

    fabric.TextWithBorder.fromObject = function(object) {
        return new fabric.TextWithBorder(object.text, fabric.util.object.clone(object));
    };
})();