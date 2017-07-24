var TendencyDrawer = function (main_selector) {
    var Self = this;

    // Private variables
    var ColorStroke = "#3c4f56";
    var ColorFill = "#95AE24";
    var ColorWhite = "#ffffff";
    var CanvasSize = 0;
    var StrokeSize = 2;
    var PaddingPx = 0;
    var CanvasCenter = 0;
    var DrawingContext = null;
    var DrawingUtils = null;
    var Options = null;

    this.drawTendency = function (options, maxDeviation) {
        Options = options;
        var firstPoint = Options.machinePoints[0];
        var lastPoint = Options.machinePoints[Options.machinePoints.length - 1];
        var distanceAll = calculateDistance(firstPoint, lastPoint);
        var secondPointMultiplier = null;
        var thirdPointMultiplier = null;
        var arrayOfCoordinates = [];
        var arrows = [];
        arrayOfCoordinates.push([0, Options.machinePoints[0].deviationHz, Options.machinePoints[0].deviationVt]);
        if (!Options.isTwoPointMachine) {
            var secondPoint = Options.machinePoints[1];
            var thirdPoint = Options.machinePoints[2];
            var secondPointOffset = calculateDistance(firstPoint, secondPoint);
            var thirdPointOffset = calculateDistance(firstPoint, thirdPoint);
            secondPointMultiplier = secondPointOffset / distanceAll;
            thirdPointMultiplier = thirdPointOffset / distanceAll;
            arrayOfCoordinates.push([secondPointMultiplier, Options.machinePoints[1].deviationHz, Options.machinePoints[1].deviationVt]);
            arrayOfCoordinates.push([thirdPointMultiplier, Options.machinePoints[2].deviationHz, Options.machinePoints[2].deviationVt]);
            arrayOfCoordinates.push([1, Options.machinePoints[3].deviationHz, Options.machinePoints[3].deviationVt]);
            arrows.push([arrayOfCoordinates[0], arrayOfCoordinates[1]]);
            arrows.push([arrayOfCoordinates[2], arrayOfCoordinates[3]]);
        } else {
            arrayOfCoordinates.push([1, Options.machinePoints[1].deviationHz, Options.machinePoints[1].deviationVt]);
            arrows.push([arrayOfCoordinates[0], arrayOfCoordinates[1]]);
        }

        var aspectRatio = 2;
        var min_width = 260;
        var min_height = 130;
        var max_height = 200;

        var paper_plane_element = $(main_selector).find('.paper-plane')[0];

        var width = $(paper_plane_element).innerWidth();
        if(width < min_width) width = min_width;

        var height = Math.round(width / aspectRatio);
        if(height < min_height) height = min_height;
        if(height > max_height) height = max_height;

        width = width - 60;
        height = height - 20;

        renderVerticalTendencyD3(arrows, width, height, maxDeviation, 2, "vt-tendency-content", Options.isTwoPointMachine);
        renderHorizontalTendencyD3(arrows, height, width, maxDeviation, 1, "hz-tendency-content", Options.isTwoPointMachine);
    };

    function extractStartAndEndCoordsFromSVGLinePath(svgPath) {
        var regex = /^M(\-?[0-9]+(?:\.[0-9]+)?)[,](\-?[0-9]+(?:\.[0-9]+)?)L(\-?[0-9]+(?:\.[0-9]+)?)[,](\-?[0-9]+(?:\.[0-9]+)?)/;
        var match = regex.exec(svgPath);

        if(!match)
            return null;

        var result = {
            start: {
                x: Number(match[1]),
                y: Number(match[2])
            },
            end: {
                x: Number(match[3]),
                y: Number(match[4])
            }
        };

        return result;
    }

    function renderHorizontalTendencyD3(arrows, width, height, maxDeviation, indexInArray, selector, is2PointsTBM) {
        var index = indexInArray;

        maxDeviation = calcMaxDeviation(maxDeviation, arrows, is2PointsTBM, indexInArray);

        var y = d3.scale.linear().domain([-0.1, 1 + 0.1]).range([height, 0]);
        var x = d3.scale.linear().domain([- maxDeviation, maxDeviation]).range([0, width]);
        var line = d3.svg.line()
            .x(function (d, i) {
                return x(d[index]);
            })
            .y(function (d, i) {
                return y(d[0]);
            });
        var svgId = selector + "-svg";
        d3.select($(main_selector).find(" ." + selector + " ." + svgId)[0]).remove();
        var svg = d3.select($(main_selector).find(" ." + selector)[0])
            .append("svg:svg")
            .attr("shape-rendering", "geometricPrecision")
            .attr("class", svgId)
            .attr("style", "overflow:visible")
            .attr("width", width)
            .attr("height", height);
        var graph = svg
            .append("svg:g");

        svg.append("svg:defs").append("marker")
            .attr("id", "marker_id")
            .attr("viewBox", "0 0 10 10")
            .attr("refX", 0)
            .attr("refY", 5)
            .attr("markerUnits", "strokeWidth")
            .attr("markerWidth", 10)
            .attr("markerHeight", 10)
            .attr("orient", "auto")
            .append("path")
            .attr("d", "M 0 0 L 10 5 L 0 10 z");

        graph.append("line")
            .attr("x1", x(0))
            .attr("y1", y(0))
            .attr("x2", x(0))
            .attr("y2", y(1))
            .attr("stroke", "grey");

        for (var j in arrows) {
            var arrayOfCoordinates = arrows[j];
            var arrowSvgPath = line(arrayOfCoordinates);

            graph.append("svg:path")
                .attr("d", arrowSvgPath)
                .attr("stroke", "black")
                .attr("stroke-width", 1)
                .attr("marker-end", "url(#marker_id)");

            // Points at the beginning of the arrow
            graph.selectAll(".point")
                .data(arrayOfCoordinates)
                .enter().append("svg:circle")
                .attr("stroke", "black")
                .attr("fill", function (d, i) {
                    return "black"
                })
                .attr("cx", function (d, i) {
                    return x(d[index])
                })
                .attr("cy", function (d, i) {
                    return y(d[i])
                })
                .attr("r", function (d, i) {
                    if (arrayOfCoordinates.length - 1 == i) return 0;
                    return 3
                });

            var startAndEndCoords = extractStartAndEndCoordsFromSVGLinePath(arrowSvgPath);
            if(startAndEndCoords) {

                var textValue   = arrows.length == 1 || j > 0 ? Options.tendency.horizontal.frontValueF : Options.tendency.horizontal.rearValueF;
                var rect        = graph.append("rect");
                var text        = graph.append("text")
                    .attr("stroke", "black")
                    .attr("style",  "text-anchor: middle; font-size: 2em")
                    .text(textValue);

                var padding     = {x:1,y:-3};
                var textXPos    = (startAndEndCoords.start.x + startAndEndCoords.end.x) / 2;
                var textYPos    = (startAndEndCoords.start.y + startAndEndCoords.end.y) / 2;
                var textBBox    = text.node().getBBox();

                var textBBoxW   = textBBox.width;
                var textBBoxH   = textBBox.height;

                text.attr("dy",     "-6px")
                    .attr("x",      textXPos)
                    .attr("y",      textYPos);

                rect.attr("x",      textXPos - textBBoxW/2  - padding.x)
                    .attr("y",      textYPos - textBBoxH    - padding.y)
                    .attr("width",  textBBoxW  + 2 * padding.x)
                    .attr("height", textBBoxH  + 2 * padding.y)
                    .attr("style",  "fill:white;stroke:transparent");
            }
        }
    }

    function renderVerticalTendencyD3(arrows, width, height, maxDeviation, indexInArray, selector, is2PointsTBM) {
        var index = indexInArray;

        maxDeviation = calcMaxDeviation(maxDeviation, arrows, is2PointsTBM, indexInArray);

        var x = d3.scale.linear().domain([-0.1, 1 + 0.1]).range([0, width]);
        var y = d3.scale.linear().domain([-maxDeviation, maxDeviation]).range([height, 0]);
        var line = d3.svg.line()
            .x(function (d, i) {
                return x(d[0]);
            })
            .y(function (d, i) {
                return y(d[index]);
            });
        var svgId = selector + "-svg";
        d3.select($(main_selector).find(" ." + selector + " ." + svgId)[0]).remove();
        var svg = d3.select($(main_selector).find(" ." + selector)[0])
            .append("svg:svg")
            .attr("class", svgId)
            .attr("style", "overflow:visible")
            .attr("width", width)
            .attr("height", height);
        var graph = svg
            .append("svg:g");

        svg.append("svg:defs").append("marker")
            .attr("id", "marker_id")
            .attr("viewBox", "0 0 10 10")
            .attr("refX", 0)
            .attr("refY", 5)
            .attr("markerUnits", "strokeWidth")
            .attr("markerWidth", 10)
            .attr("markerHeight", 10)
            .attr("orient", "auto")
            .append("path")
            .attr("d", "M 0 0 L 10 5 L 0 10 z");

        graph.append("line")
            .attr("x1", x(0))
            .attr("y1", y(0))
            .attr("x2", x(1))
            .attr("y2", y(0))
            .attr("stroke", "grey");

        for (var j in arrows) {
            var arrayOfCoordinates = arrows[j];
            var arrowSvgPath = line(arrayOfCoordinates);

            graph.append("svg:path")
                .attr("d", arrowSvgPath)
                .attr("stroke", "black")
                .attr("stroke-width", 1)
                .attr("marker-end", "url(#marker_id)");

            // Points at the beginning of the arrow
            graph.selectAll(".point")
                .data(arrayOfCoordinates)
                .enter().append("svg:circle")
                .attr("stroke", "black")
                .attr("fill", function (d, i) {
                    return "black"
                })
                .attr("cx", function (d, i) {
                    return x(d[i])
                })
                .attr("cy", function (d, i) {
                    return y(d[index])
                })
                .attr("r", function (d, i) {
                    if (arrayOfCoordinates.length - 1 == i) return 0;
                    return 3
                });

            var startAndEndCoords = extractStartAndEndCoordsFromSVGLinePath(arrowSvgPath);
            if(startAndEndCoords) {
                var textValue   = arrows.length == 1 || j > 0 ? Options.tendency.vertical.frontValueF : Options.tendency.vertical.rearValueF;
                var rect        = graph.append("rect");
                var text        = graph.append("text")
                    .attr("stroke", "black")
                    .attr("style",  "text-anchor: middle; font-size: 2em")
                    .text(textValue);

                var padding     = {x:1,y:-3};
                var textXPos    = (startAndEndCoords.start.x + startAndEndCoords.end.x) / 2;
                var textYPos    = (startAndEndCoords.start.y + startAndEndCoords.end.y) / 2;
                var textBBox    = text.node().getBBox();
                var textBBoxW   = textBBox.width;
                var textBBoxH   = textBBox.height;

                text.attr("dy",     "+8px")
                    .attr("x",      textXPos)
                    .attr("y",      textYPos);

                rect.attr("x",      textXPos - textBBoxW / 2  - padding.x)
                    .attr("y",      textYPos - textBBoxH + 14 - padding.y)
                    .attr("width",  textBBoxW  + 2 * padding.x)
                    .attr("height", textBBoxH  + 2 * padding.y)
                    .attr("style",  "fill:white;stroke:transparent");
            }
        }

    }

    function calculateDistance(firstPoint, secondPoint) {
        return Math.abs(firstPoint.chainage - secondPoint.chainage);
    }

    function Point(x, y) {
        this.x = x;
        this.y = y;
    }

    function calcMaxDeviation(maxDeviation, arrows, is2PointsTBM, index){
        var totalCoords = is2PointsTBM ? arrows[0] : arrows[0].concat(arrows[1]);

        var max = d3.max(totalCoords, function (d) {
            return d[index];
        });
        if (max > maxDeviation) maxDeviation = max;

        var min = d3.min(totalCoords, function (d) {
            return d[index];
        });
        if (min < -maxDeviation) maxDeviation = -min;

        maxDeviation *= 1.1; //margins

        return maxDeviation;
    }
};