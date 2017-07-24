(function() {
    fabric.HalfCircleSpeedometer = fabric.util.createClass(fabric.BaseCircleSpeedometer, {
        type: 'halfCircleSpeedometer',

        initialize: function (options) {
            options || (options = {});
            options.gaugeLengthCoef = 1;
            options.width || (options.width = 100);
            options.height = options.width * 0.6;

            this.callSuper('initialize', options);
        },

        _getCtxOptions: function() {
            var ctxScale = this.width / 2 / 100,
                res = {};

            res.centerRadius = this._relCenterRadius * ctxScale;
            res.gaugeWidth = this._relGaugeWidth * ctxScale;
            res.gaugeRadius = this.width / 2 - res.gaugeWidth / 2;
            res.gaugeLineWidth = this._relGaugeLineWidth * ctxScale;
            res.gaugeLineLong = res.gaugeWidth * 2;
            res.gaugeLineShort = res.gaugeLineLong * 0.75;
            res.gaugeLineStep = 100 / this.gaugeStepCount;
            if (this.gaugeStepMiddle) res.gaugeLineStep = res.gaugeLineStep / 2;
            res.gaugeStepMiddle = this.gaugeStepMiddle;
            res.posRight = 0;
            res.posBottom = this.height / 2 - res.centerRadius;
            res.labelPadding = res.gaugeLineWidth / 2;
            res.labelHeight = res.centerRadius - 2 * res.labelPadding;
            res.boundsLabelRadius = res.centerRadius + res.gaugeLineWidth + res.labelPadding;
            res.boundsLabelBottom = res.posBottom + res.centerRadius;
            res.progressLabelRadius = res.centerRadius;

            return res;
        }
    });

    fabric.HalfCircleSpeedometer.fromObject = function(object) {
        delete object.fill;
        return new fabric.HalfCircleSpeedometer(object);
    };
})();