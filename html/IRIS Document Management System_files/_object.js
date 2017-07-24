(function() {
    fabric.util.object.extend(fabric.Object.prototype, {
        moveCenterH: function () {
            this.canvas.moveCenterH(this);
        },

        moveCenterV: function () {
            this.canvas.moveCenterV(this);
        },

        moveLeft: function () {
            this.canvas.moveObjectLeft(this);
        },

        moveRight: function () {
            this.canvas.moveObjectRight(this);
        },

        moveTop: function () {
            this.canvas.moveObjectTop(this);
        },

        moveBottom: function () {
            this.canvas.moveObjectBottom(this);
        },

        getMostTop: function () {
            return this.getCenterPoint().y - this.getBoundingRectHeight() / 2;
        },

        getMostLeft: function () {
            return this.getCenterPoint().x - this.getBoundingRectWidth() / 2;
        },

        scaleWithFactor: function (factorWidth, factorHeight) {
            if (!factorWidth) return;
            factorHeight = factorHeight || factorWidth;

            //if (this.type === "image") {
            //    this.width = this.width * factorWidth;
            //    this.height = this.height * factorHeight;
            //} else {
            this.scaleX = this.scaleX * factorWidth;
            this.scaleY = this.scaleY * factorHeight;
            //}
            this.left = this.left * factorWidth;
            this.top = this.top * factorHeight;
            this.setCoords();
        },

        setOriginToCenter: function () {
            this._originalOriginX = this.originX;
            this._originalOriginY = this.originY;

            var center = this.getCenterPoint();

            this.set({
                originX: 'center',
                originY: 'center',
                left: center.x,
                top: center.y
            });
        },

        setCenterToOrigin: function () {
            var originPoint = this.translateToOriginPoint(
                this.getCenterPoint(),
                this._originalOriginX,
                this._originalOriginY);

            this.set({
                originX: this._originalOriginX,
                originY: this._originalOriginY,
                left: originPoint.x,
                top: originPoint.y
            });
        }
    });

    //function FixedShadowPatch(ctor) {
    //    ctor.prototype.lockUniScaling = true;
    //
    //    ctor.prototype.render = function(ctx, noTransform) {
    //        this.strokeWidth = 5;
    //        this.stroke = (new fabric.Color(this.fill)).setAlpha(0.4).toRgba();
    //        this.callSuper('render', ctx, noTransform);
    //    }
    //
    //    return ctor;
    //};
    //
    //fabric.FixedShadowCircle = FixedShadowPatch(fabric.util.createClass(fabric.Circle, {
    //    type: 'circle',
    //
    //    lockRotation: true,
    //    hasRotatingPoint: false,
    //
    //    initialize: function (options) {
    //        this.callSuper('initialize', options);
    //    }
    //}));
    //
    //fabric.FixedShadowRect = FixedShadowPatch(fabric.util.createClass(fabric.Rect, {
    //    type: 'rect',
    //
    //    initialize: function (options) {
    //        this.callSuper('initialize', options);
    //    }
    //}));
    //
    //fabric.FixedShadowTriangle = FixedShadowPatch(fabric.util.createClass(fabric.Triangle, {
    //    type: 'triangle',
    //
    //    initialize: function (options) {
    //        this.callSuper('initialize', options);
    //    }
    //}));

    //fabric.ITextWithBorder = fabric.util.createClass(fabric.IText , {
    //    type: 'iTextWithBorder',
    //
    //    lockUniScaling: true,
    //    borderFill: '#000',
    //    borderWidth: 1,
    //    borderVisible: false,
    //
    //    initialize: function (text, options) {
    //        this.callSuper('initialize', text, options);
    //    },
    //
    //    toObject : function() {
    //        return fabric.util.object.extend(this.callSuper('toObject'), {
    //            borderFill : this.borderFill,
    //            borderWidth : this.borderWidth,
    //            borderVisible: this.borderVisible
    //        });
    //    },
    //
    //    _render: function(ctx) {
    //        this.callSuper('_render', ctx);
    //
    //        this.padding = this.borderVisible ? this.borderWidth * this.scaleX : 0;
    //        if (this.borderVisible) this._renderBorder(ctx);
    //    },
    //
    //    _renderBorder: function(ctx) {
    //        var fullWidth = this.width + this.borderWidth,
    //            fullHeight = this.height + this.borderWidth;
    //
    //        ctx.strokeStyle = this.borderFill;
    //        ctx.lineWidth = this.borderWidth;
    //        ctx.strokeRect(-fullWidth / 2, -fullHeight / 2, fullWidth, fullHeight);
    //    }
    //});
    //
    //fabric.ITextWithBorder.fromObject = function(object) {
    //    return new fabric.ITextWithBorder(object.text, fabric.util.object.clone(object));
    //};
})();