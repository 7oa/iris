var itc = itc || {};
itc.naviviewlib = itc.naviviewlib || {};
itc.naviviewlib.layer = itc.naviviewlib.layer || {};

/*
 * ***********************************************
 * IRIS.NAVIVIEW Context
 * ***********************************************
 * */
itc.naviviewlib.Context = function (settings, elementID) {

    this.contextId = Date.now();
    this.settings = settings;
    this.layers = {};
    this.margin = settings.margin || 50;
    this.element = $(elementID);
    this.size = this.element.innerWidth() - this.margin * 2 - 15; // -15 px = margins which are not calculated correctly in FFF
    this.domain = settings.maxDeviation;
    this.xscale = d3.scale.linear().domain([-Math.abs(this.domain), this.domain]).range([0, this.size]);
    this.yscale = d3.scale.linear().domain([this.domain, -Math.abs(this.domain)]).range([0, this.size]);
    this.context_svg = this.initSvg(elementID, this.margin, this.size);

}
itc.naviviewlib.Context.prototype = {

    constructor: itc.naviviewlib.Context,

    addLayer: function (name, layer) {
        if (typeof(layer.render) !== 'undefined' && typeof(layer.layer_svg) !== 'undefined') {
            layer.display = true;
            layer.name = name;
            this.layers[name] = layer;
        } else console.error("No valid layer!")
        return this;
    },

    removeLayer: function (name) {
        delete this.layers[name];
        return this;
    },

    showLayer: function (name) {
        this.layers[name].display = true;
        return this;
    },

    hideLayer: function (name) {
        this.layers[name].display = false;
        return this;
    },

    renderContext: function () {
        for (var layerName in this.layers) {
            var layer = this.layers[layerName];
            if (layer.display) {
                layer.render();
            } else {
                layer.layer_svg.selectAll("*").remove();
            }
        }
    },

    initSvg: function (elementID, margin, size) {
        var svg = d3.select(elementID).append("svg")
            .attr("width", size + margin * 2)
            .attr("height", size + this.margin * 2);
        return svg.append("g").attr("transform", "translate(" + margin + "," + margin + ")");
    },

    rotatePoint: function (pointX, pointY, originX, originY, angle) {
        return {
            x: Math.cos(angle) * (pointX - originX) - Math.sin(angle) * (pointY - originY) + originX,
            y: Math.sin(angle) * (pointX - originX) + Math.cos(angle) * (pointY - originY) + originY
        };
    },

    rotateRadian: function (angle_in_radian, rotation_in_radian) {
//        console.log("angle: " + angle_in_radian * 180 / Math.PI + ", Rotation: " + rotation_in_radian * 180 / Math.PI);
        var newAngleInDegree = (angle_in_radian * 180 / Math.PI) + (rotation_in_radian * 180 / Math.PI)
        var newRadian = newAngleInDegree * Math.PI / 180;
//        console.log(newRadian);
        return newRadian;
    }
}


/*
 * ***********************************************
 * IRIS.NAVIVIEW Grid
 * ***********************************************
 * */
itc.naviviewlib.layer.GridLayer = function (settings, context) {

    this.xscale = context.xscale;
    this.yscale = context.yscale;
    this.layer_svg = context.context_svg.append("g");
    this.numberOfStrokesPerDirection = settings.numberOfStrokesPerDirection || 5;
    this.maxDeviation = settings.maxDeviation || 100;
    this.diameterForTolerance = settings.diameterForTolerance || 100;
    this.strokeSize = settings.strokeSize || 3;
    this.colorStroke = settings.colorStroke || "#3c4f56";
    this.colorFill = settings.colorFill || "#ff0018";
    this.toleranceColor = "#B45F04";
    this.tickFormatFuncXAxis = settings.tickFormatFuncXAxis instanceof Function ? settings.tickFormatFuncXAxis : m => String(m);
    this.tickFormatFuncYAxis = settings.tickFormatFuncYAxis instanceof Function ? settings.tickFormatFuncYAxis : m => String(m);
}
itc.naviviewlib.layer.GridLayer.prototype = {

    constructor: itc.naviviewlib.layer.GridLayer,

    render: function () {
        var r = this.xscale(this.maxDeviation) / 2;
        var tolerance = this.xscale(this.diameterForTolerance - this.maxDeviation);
        var ticks = this.numberOfStrokesPerDirection * 2 + 1;
        var arc = d3.svg.arc().innerRadius(tolerance).outerRadius(tolerance);
        this.layer_svg.selectAll("*").remove();

        this.layer_svg.append("circle").attr({
            cx: this.xscale(0),
            cy: this.yscale(0),
            r: r + 15,
            fill: "none",
            stroke: "black"
        });

        var tickValues = [];
        var tickStep = this.maxDeviation / this.numberOfStrokesPerDirection;

        //console.log("radius: " + r + ", max-deviation: " + this.maxDeviation);
        if(r < 125 && this.maxDeviation > 1000) {
            this.layer_svg.attr("class","sm-ticks");
        }

        //"+ tickStep" - to avoid JS rounding problems, otherwise sometimes last tick is missing
        for (var i = -this.maxDeviation + 0; i < this.maxDeviation + tickStep; i += tickStep) {
            tickValues.push(i);
        }

        var xAxis = d3.svg.axis().scale(this.xscale).ticks(ticks).tickValues(tickValues).tickFormat(this.tickFormatFuncXAxis);
        this.layer_svg.append("g").attr("class", "x axis")
            .attr("transform", "translate(0," + r + ")").call(xAxis);

        var yAxis = d3.svg.axis().scale(this.yscale).orient("left").ticks(ticks).tickValues(tickValues).tickFormat(this.tickFormatFuncYAxis);
        this.layer_svg.append("g").attr("class", "y axis")
            .attr("transform", "translate(" + r + ",0)").call(yAxis);


        this.layer_svg.append("circle").attr({
            cx: this.xscale(0),
            cy: this.yscale(0),
            r: tolerance,
            fill: "none",
            stroke: this.toleranceColor
        });

        this.layer_svg.append("text")
            .attr("x", this.xscale(this.diameterForTolerance) - 13)
            .attr("y", this.yscale(2))
            .attr("fill", this.toleranceColor)
            .style("text-anchor", "middle")
            .text(this.diameterForTolerance);

        this.layer_svg.append("text")
            .attr("x", this.xscale(-this.diameterForTolerance) + 13)
            .attr("y", this.yscale(2))
            .attr("fill", this.toleranceColor)
            .style("text-anchor", "middle")
            .text(this.diameterForTolerance);


    },

    getTextPositionForRadiusAndAngle: function (radius, degrees) {
        var pos = {};
        var radians = degrees * Math.PI / 180;
        //console.log("Radiant: " + radians);
        pos.x = Math.cos(radians) * radius;
        pos.y = Math.sin(radians) * radius;
        //console.log(pos.x);
        return pos;
    }
}


/*
 * ***********************************************
 * IRIS.NAVIVIEW Crosshair
 * ***********************************************
 * */
itc.naviviewlib.layer.Crosshair = function (settings, data, context) {

    this.data = data;
    this.context = context;
    this.xscale = context.xscale;
    this.yscale = context.yscale;
    this.layer_svg = context.context_svg.append("g").attr("class", "crosslines");
    this.numberOfStrokesPerDirection = settings.numberOfStrokesPerDirection || 5;
    this.maxDeviation = settings.maxDeviation || 100;
    this.diameterForTolerance = settings.diameterForTolerance || 100;
    this.strokeSize = settings.strokeSize || 3;
    this.colorStroke = settings.colorStroke || "#3c4f56";
    this.colorFill = settings.colorFill || "#ff0018";
    this.toleranceColor = "#B45F04";
}
itc.naviviewlib.layer.Crosshair.prototype = {

    constructor: itc.naviviewlib.layer.Crosshair,

    render: function () {

        var tolerance = this.xscale(this.diameterForTolerance - this.maxDeviation);
        var ticks = this.numberOfStrokesPerDirection * 2;
        var cross_settings = {
            radius_start: 12,
            radius_step: 5,
            circle_opacity: 0.5,
            circle_color: ["#58ACFA", "#2E9AFE", "#0080FF", "#0174DF"]
        };
        this.layer_svg.selectAll("*").remove();


        var radius_current = cross_settings.radius_start;
        for (var i = 0; i < this.data.referencePoints.length; i++) {
            var refPoint = this.data.referencePoints[i];
            refPoint.roll = this.data.rollInRadian;
            this.appendCross(this.layer_svg, radius_current, cross_settings.circle_color[i], cross_settings.circle_opacity, refPoint);
            if (this.data.referencePoints.length > i + 1) {
                this.appendCrossLink(this.layer_svg, refPoint, this.data.referencePoints[i + 1])
            }

            radius_current += cross_settings.radius_step;
        }

    },

    appendCross: function (svg, radius, color, opacity, refPoint) {
        var x = refPoint.deviationHz;
        var y = refPoint.deviationVt;

        var crossLength = radius * 1.5;
        var roll = -(refPoint.roll || 0);
        var px1 = this.context.rotatePoint(x + crossLength, y, x, y, roll);
        var px2 = this.context.rotatePoint(x - crossLength, y, x, y, roll);
        svg.append("line")
            .attr("x1", this.xscale(px1.x))
            .attr("y1", this.yscale(px1.y))
            .attr("x2", this.xscale(px2.x))
            .attr("y2", this.yscale(px2.y));

        var py1 = this.context.rotatePoint(x, y + crossLength, x, y, roll);
        var py2 = this.context.rotatePoint(x, y - crossLength, x, y, roll);
        svg.append("line")
            .attr("x1", this.xscale(py1.x))
            .attr("y1", this.yscale(py1.y))
            .attr("x2", this.xscale(py2.x))
            .attr("y2", this.yscale(py2.y));

        this.layer_svg.append("circle").attr({
            cx: this.xscale(x),
            cy: this.yscale(y),
            r: this.xscale(radius - this.maxDeviation),
            fill: this.colorFill,
            stroke: this.colorStroke
        }).attr("fill-opacity", opacity);
    },

    appendCrossLink: function (svg, refPointA, refPointB) {
        svg.append("line")
            .attr("x1", this.xscale(refPointA.deviationHz))
            .attr("y1", this.yscale(refPointA.deviationVt))
            .attr("x2", this.xscale(refPointB.deviationHz))
            .attr("y2", this.yscale(refPointB.deviationVt));
    }


}

/*
 * ***********************************************
 * IRIS.NAVIVIEW Tunnel3D
 * ***********************************************
 * */
itc.naviviewlib.layer.Tunnel3D = function (settings, nav_alignment_deltas, context) {

    this.maxDeviation = settings.maxDeviation || 100;
    this.nav_alignment_deltas = nav_alignment_deltas;
    this.xscale = context.xscale;
    this.yscale = context.yscale;
    this.layer_svg = context.context_svg.append("g").attr("class", "crosslines").attr("clip-path", "url(#tunnelArea)");
    this.overlayDeviation = 15;

}
itc.naviviewlib.layer.Tunnel3D.prototype = {

    constructor: itc.naviviewlib.layer.Tunnel3D,

    render: function () {
        this.layer_svg.selectAll("*").remove();
        var radius_step = 5;
        var current_radius = this.maxDeviation * 1 || 100;
        for (var i = 0; i < this.nav_alignment_deltas.length; i++) {
            var data = this.nav_alignment_deltas[i];
            this.layer_svg.append("circle").attr({
                cx: this.xscale(data.DeltaHz),
                cy: this.yscale(data.DeltaVt),
                r: this.xscale(current_radius - this.maxDeviation) + this.overlayDeviation,
                fill: this.colorLuminance("#FAFAFA", -0.08 * (i + 1)),
                stroke: "none"
            });
            current_radius -= radius_step;
        }
        this.appendClipPath(this.layer_svg);
    },

    appendClipPath: function (svg) {
        svg.append("clipPath")
            .attr("id", "tunnelArea")
            .append("circle").attr({
                cx: this.xscale(0),
                cy: this.yscale(0),
                r: this.xscale(0) + this.overlayDeviation
            });
    },

    colorLuminance: function (hex, lum) {

        // validate hex string
        hex = String(hex).replace(/[^0-9a-f]/gi, '');
        if (hex.length < 6) {
            hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
        }
        lum = lum || 0;

        // convert to decimal and change luminosity
        var rgb = "#", c, i;
        for (i = 0; i < 3; i++) {
            c = parseInt(hex.substr(i * 2, 2), 16);
            c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
            rgb += ("00" + c).substr(c.length);
        }
        return rgb;
    }
}


/*
 * ***********************************************
 * IRIS.NAVIVIEW Roll
 * ***********************************************
 * */
itc.naviviewlib.layer.RollIndicator = function (settings, roll, context) {

    this.maxDeviation = settings.maxDeviation || 100;
    this.roll = roll;
    this.xscale = context.xscale;
    this.yscale = context.yscale;
    this.layer_svg = context.context_svg.append("g").attr("class", "roll");

}
itc.naviviewlib.layer.RollIndicator.prototype = {

    constructor: itc.naviviewlib.layer.RollIndicator,

    render: function () {
        this.layer_svg.selectAll("*").remove();
        var arc = d3.svg.arc()
            .innerRadius(this.xscale(this.maxDeviation - this.maxDeviation) + 15)
            .outerRadius(this.xscale(this.maxDeviation - this.maxDeviation) + 40)
            .startAngle(7 * (Math.PI / 4)) //converting from degs to radians
            .endAngle(9 * (Math.PI / 4)) //just radians

        var roll = d3.svg.arc()
            .innerRadius(this.xscale(this.maxDeviation - this.maxDeviation) + 15)
            .outerRadius(this.xscale(this.maxDeviation - this.maxDeviation) + 40)
            .startAngle(this.roll - 0.01) //converting from degs to radians
            .endAngle(this.roll + 0.01) //just radians

        this.layer_svg.append("path")
            .attr("d", arc)
            .attr("fill", "none")
            .attr("stroke", "black")
            .attr("transform", "translate(" + this.xscale(0) + "," + this.yscale(0) + ")")

        this.layer_svg.append("path")
            .attr("d", roll)
            .attr("fill", "orange")
            .attr("stroke", "none")
            .attr("transform", "translate(" + this.xscale(0) + "," + this.yscale(0) + ")")
    }
}


/*
 * ***********************************************
 * IRIS.NAVIVIEW Arrow
 * ***********************************************
 * */
itc.naviviewlib.layer.Arrow = function (settings, nav_data, context) {
    this.nav_data = nav_data;
    this.settings = settings;
    this.context = context;
    this.xscale = context.xscale;
    this.yscale = context.yscale;
    this.layer_svg = context.context_svg.append("g").attr("class", "arrow");

}
itc.naviviewlib.layer.Arrow.prototype = {

    constructor: itc.naviviewlib.layer.Arrow,

    render: function () {
        this.layer_svg.selectAll("*").remove();

        var gradient = this.layer_svg.append("svg:defs")
            .append("svg:linearGradient")
            .attr("id", this.context.contextId)
            .attr("x1", "0%")
            .attr("y1", "0%")
            .attr("x2", "100%")
            .attr("y2", "100%")
            .attr("spreadMethod", "pad");

        // Define the gradient colors
        gradient.append("svg:stop")
            .attr("offset", "0%")
            .attr("stop-color", "#6E6E6E")
            .attr("stop-opacity", 0.9);

        gradient.append("svg:stop")
            .attr("offset", "50%")
            .attr("stop-color", this.settings.colorFill)
            .attr("stop-opacity", 0.9);

        var cross_settings = {
            radius_start: 0,
            radius_step: this.settings.rearArrowSize ? this.settings.rearArrowSize / 2 : 20
        };


        var radius_current = cross_settings.radius_start;
        var roll = this.nav_data.rollInRadian;
        for (var i = 0; i < this.nav_data.referencePoints.length - 1; i++) {
            var radiusOrigin = radius_current * 1;
            radius_current += cross_settings.radius_step;
            var gradient = this.nav_data.referencePoints.length == i + 2 ? true : false;
            this.renderArrow(this.nav_data.referencePoints[i + 1], this.nav_data.referencePoints[i], radius_current, radiusOrigin, roll, gradient);
        }
    },

    // Maps radian to quadrant, ATTENTION: Range {0,PI} and {0,-PI}, 0 = 45 Degrees, PI = 270 Degrees
    // Returns a quadrant with it's closest quadrant, first and second
    getQuadrant: function (radian, roll) {
        radian = this.context.rotateRadian(radian, roll);
        if (radian > Math.PI) radian = Math.PI;
        if (radian < -Math.PI) radian = -Math.PI;
        if (radian >= 0 && radian < Math.PI / 2) {
            return {
                quadrant: 1,
                closestPoint: (radian > Math.PI / 4 ) ? {first: 1, second: 2} : {first: 2, second: 1},
                oppositeQuadrant: -(3 * Math.PI / 4)
            }
        } else if (radian > Math.PI / 2 && radian <= Math.PI) {
            return {
                quadrant: 2,
                closestPoint: (radian > 3 * Math.PI / 4 ) ? {first: 4, second: 1} : {first: 1, second: 4},
                oppositeQuadrant: -(Math.PI / 4)
            }
        } else if (radian < Math.PI / -2 && radian >= -1 * Math.PI) {
            return {
                quadrant: 3,
                closestPoint: (Math.abs(radian) > 3 * Math.PI / 4 ) ? {first: 4, second: 3} : {first: 3, second: 4},
                oppositeQuadrant: Math.PI / 4
            }
        } else {
            return {
                quadrant: 4,
                closestPoint: (Math.abs(radian) > Math.PI / 4 ) ? {first: 3, second: 2} : {first: 2, second: 3},
                oppositeQuadrant: 3 * Math.PI / 4
            }
        }
    },

    renderArrow: function (refPointOrigin, refPointTarget, radiusOrigin, radiusTarget, roll, gradient) {
        // Radian of direction to origin
        var directionToOrigin = this.getRadiantToPoint(refPointTarget, refPointOrigin);
        var quadrantOfOriginDirection = this.getQuadrant(directionToOrigin, roll);
        var oppositeQuadrant = this.getQuadrant(quadrantOfOriginDirection.oppositeQuadrant, roll);

        var renderOrder = [];
        renderOrder[0] = oppositeQuadrant.closestPoint.first;
        renderOrder[1] = oppositeQuadrant.closestPoint.second;
        renderOrder[2] = quadrantOfOriginDirection.closestPoint.second;
        renderOrder[3] = quadrantOfOriginDirection.closestPoint.first;
        //console.log(renderOrder.toString());

        for (var i = 0; i < renderOrder.length; i++) {
            var point = renderOrder[i];
            var offsets = this.getOffsets(point, radiusOrigin, radiusTarget);
            this.renderFin(offsets, refPointOrigin, refPointTarget, gradient);
        }
    },

    renderFin: function (offset, refPointOrigin, refPointTarget, gradient) {
        var points = [];
        var roll = this.nav_data.rollInRadian || 0;

        points[0] = [this.xscale(offset.xOrigin + refPointOrigin.deviationHz), this.yscale(offset.yOrigin + refPointOrigin.deviationVt)];
        points[1] = [this.xscale(offset.xTarget + refPointTarget.deviationHz), this.yscale(offset.yTarget + refPointTarget.deviationVt)];
        points[2] = [this.xscale(refPointTarget.deviationHz), this.yscale(refPointTarget.deviationVt)];
        points[3] = [this.xscale(refPointOrigin.deviationHz), this.yscale(refPointOrigin.deviationVt)];

        points[0] = this.rotate(points[0], points[3], roll);
        points[1] = this.rotate(points[1], points[2], roll);

        var that = this;
        var fin = this.layer_svg.append("g")
            .attr("class", "polygon")
            .datum(points)
            .attr("stroke", "black")
            .attr("stroke-width", 1);
        if (gradient) {
            fin.attr('fill', 'url(#'+this.context.contextId+')')
        } else {
            fin.attr('fill', this.settings.colorFill).attr("fill-opacity", 0.9);
        }
        fin.append("path").call(this.positionPath);
        return points;
    },

    positionPath: function (path) {
        path.attr("d", function (d) {
            return "M" + d.join("L") + "Z";
        });
    },

    getOffsets: function (orderNumber, radiusOrigin, radiusTarget) {
        switch (orderNumber) {
            case 1:
                return {
                    xOrigin: 0, yOrigin: radiusOrigin, xTarget: 0, yTarget: radiusTarget
                };
                break;
            case 2:
                return {
                    xOrigin: radiusOrigin, yOrigin: 0, xTarget: radiusTarget, yTarget: 0
                };
                break;
            case 3:
                return {
                    xOrigin: 0, yOrigin: -radiusOrigin, xTarget: 0, yTarget: -radiusTarget
                };
                break;
            case 4:
                return {
                    xOrigin: -radiusOrigin, yOrigin: 0, xTarget: -radiusTarget, yTarget: 0
                };
                break;
        }
    },

    getRadiantToPoint: function (refPoint, refPointOrigin) {
        var x = refPoint.deviationHz - refPointOrigin.deviationHz;
        var y = refPoint.deviationVt - refPointOrigin.deviationVt;
        return Math.atan2(y, x);
    },

    rotate: function (target, origin, angle) {
        var res = this.context.rotatePoint(target[0], target[1], origin[0], origin[1], angle);
        return [res.x, res.y];
    }
}