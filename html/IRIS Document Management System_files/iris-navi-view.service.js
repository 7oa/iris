(function(){
    'use strict';

    angular.module('iris_navi_view').factory('IrisNaviViewService',
        function ($translate, $filter, NaviData, NaviView) {
            var reference_types = [{
                type: 'reload',
                name: $translate.instant('label.Reload'),
                order: 1,
                icon: 'fa-refresh'
            }, {
                type: 'date',
                name: $translate.instant('label.Time'),
                order: 2,
                icon: 'fa-clock-o'
            }, {
                type: 'chainage',
                name: $translate.instant('label.Chainage'),
                order: 3,
                isDigitsNeeded: true,
                icon: 'fa-link'
            }, {
                type: 'advance',
                name: $translate.instant('label.Advance'),
                order: 4,
                icon: 'fa-circle-o-notch'
            }, {
                type: 'tunnelmeter',
                name: $translate.instant('label.Tunnelmeter'),
                isDigitsNeeded: true,
                order: 5,
                icon: 'fa-text-width'
            }];

            return {
                demo_mode: true,

                getReferenceTypes: function () {
                    return reference_types;
                },

                isDigitsConversionNeeded: function (refType) {
                    return reference_types.filter(referenceType => referenceType.type == refType).length;
                },

                requestData: function (navi_view) {
                    return NaviData.getData({
                        device_id: navi_view.device_id,
                        project_id: navi_view.project_id
                    }, function (data) {
                        return data;
                    });
                },

                requestModel: function (navi_view,params) {
                    params = params || {};
                    var reqest_params = angular.extend({
                        device_id: navi_view.device_id,
                        project_id: navi_view.project_id
                    },params);
                    return NaviData.getNaviData(reqest_params, function (data) {
                        return data;
                    });
                },

                toDigits: function (data, digits) {
                    digits = angular.isNumber(digits) ? digits : 3;

                    if(!data) return null;

                    return parseFloat($filter('number')(data, digits));
                },

                requestBoundaries: function (navi_view) {
                    var _this = this;
                    return NaviData.getBoundaries({
                        device_id: navi_view.device_id,
                        project_id: navi_view.project_id
                    }, (data) => data);
                },

                createNaviView: function (project_id, device_id) {
                    if (device_id == null || project_id == null) return null;

                    var navi_view = new NaviView(project_id, device_id);
                    navi_view.setModel(this.requestModel(navi_view));
                    navi_view.setBoundaries(this.requestBoundaries(navi_view));
                    return navi_view;
                },

                getDefaultSettings: function(){
                    return {
                        device_id:1,
                        project_id:1
                    };
                },

                getDemoScope: function() {
                    return {
                        show_controls: false,
                        navi_view_arrow_config: {
                            "strokeSize": 3,
                            "colorFill": "#95AE24",
                            "msPerFrame": 30,
                            "rearArrowSize": 50,
                            "frontArrowSize": 40,
                            "isTwoPointMachine": true,
                            "toleranceCircleRadius": 901.0,
                            "arrowAnimated": false,
                            "rollExaggeration": 80.0,
                            "colorStroke": "#3c4f56",
                            "maxDeviation": 100.0,
                            "numberOfStrokesPerDirection": 5
                        },
                        navi_view: {
                            model: {
                                "referencePointFront" : {
                                    "deviationHz" : 5.488657928038791,
                                    "deviationVt" : 1.4886579241599454,
                                    "chainage" : 2847.0043288293414
                                },
                                "referencePointCenter" : null,
                                "referencePointRear" : {
                                    "deviationHz" : -3.919097902912171,
                                    "deviationVt" : -7.919097915125473,
                                    "chainage" : 2842.3004534646625
                                },
                                "machinePoint0" : {
                                    "deviationHz" : 5.488657928038791,
                                    "deviationVt" : 1.488657924131524,
                                    "chainage" : 2847.0043288293414
                                },
                                "machinePoint1" : {
                                    "deviationHz" : -2.8908465911315755,
                                    "deviationVt" : -6.8908466014442284,
                                    "chainage" : 2842.8145788422353
                                },
                                "machinePoint2" : null,
                                "machinePoint3" : null,
                                "machinePartFront" : {
                                    "driftVt" : 1.9999394296821293,
                                    "driftHz" : 1.9999984190826048,
                                    "roll" : 0.0,
                                    "pitch" : 6.999393565665368
                                },
                                "machinePartRear" : null,
                                "chainage" : 2847.0043288293414,
                                "advance" : 17.0,
                                "tunnelMeter" : 2338.0458138371623,
                                "rollInRadian" : 0.0,
                                "date" : "2016-03-02T14:23:59.000Z",
                                "isTwoPointMachine" : true
                            }
                        },
                        units: {
                            "settings" : {
                                "unitForDeviations" : "MILLIMETER",
                                "unitForChainage" : "METER",
                                "unitForAngle" : "MILLIMETERPERMETER",
                                "unitForTendency" : "MILLIMETERPERMETER",
                                "digitsForDeviations" : 0,
                                "digitsForChainage" : 2,
                                "digitsForAngle" : 0,
                                "digitsForTendency" : 0,
                                "lengthUnits" : [ "METER", "KILOMETER", "HECTOMETER", "DECAMETER", "DECIMETER", "CENTIMETER", "MILLIMETER", "MICROMETER", "NANOMETER", "FEET", "INCH" ],
                                "angleUnits" : [ "RADIAN", "DEGREE", "GON", "MILLIRAD", "MILLIMETERPERMETER" ]
                            }
                        }
                    }
                },

                drawPaperPlane: function (model, scope, element) {
                    var nav_settings = angular.copy(model);
                    nav_settings.diameterForTolerance = nav_settings.toleranceCircleRadius;

                    //todo refactor this code after API changes
                    var nav_data = angular.copy(model);
                    nav_data.machinePoints = [];
                    nav_data.referencePoints = [];

                    if(!nav_data.isTwoPointMachine) {
                        nav_data.machinePoints.push(nav_data.machinePoint3);
                        nav_data.machinePoints.push(nav_data.machinePoint2);
                    }
                    nav_data.machinePoints.push(nav_data.machinePoint1);
                    nav_data.machinePoints.push(nav_data.machinePoint0);

                    nav_data.referencePoints.push(nav_data.referencePointFront);
                    if (!nav_data.isTwoPointMachine) nav_data.referencePoints.push(nav_data.referencePointCenter);
                    nav_data.referencePoints.push(nav_data.referencePointRear);


                    //Draw paper plane
                    var container_paper_plane = $(element).find('.paper-plane')[0];
                    $(container_paper_plane).html('');


                    if(scope.navi_view_arrow_config) {
                        var view_config = scope.navi_view_arrow_config;

                        var calculateMaxDeviationExcessOfPaperPlane = function(view_config,nav_data) {

                            function calculateMaxDeviationExcessOfPoint(point) {
                                let nMaxExcess = 0;
                                let nHzExcess = Math.abs(point.deviationHz) - view_config.maxDeviation;
                                let nVtExcess = Math.abs(point.deviationVt) - view_config.maxDeviation;
                                return Math.max(nHzExcess, nVtExcess, 0);
                            }

                            function calculateMaxDeviationExcessOfPointArray(points) {
                                let nMaxExcess = 0;
                                for (var i = 0; i < points.length; i++) {
                                    nMaxExcess = Math.max(nMaxExcess, calculateMaxDeviationExcessOfPoint(points[i]));
                                }
                                return nMaxExcess;
                            }

                            var pointsToBeChecked = [
                                nav_data.referencePointFront,
                                {
                                    deviationHz: nav_data.referencePointRear.deviationHz + view_config.rearArrowSize / 2,
                                    deviationVt: nav_data.referencePointRear.deviationVt
                                },
                                {
                                    deviationHz: nav_data.referencePointRear.deviationHz - view_config.rearArrowSize / 2,
                                    deviationVt: nav_data.referencePointRear.deviationVt
                                },
                                {
                                    deviationHz: nav_data.referencePointRear.deviationHz,
                                    deviationVt: nav_data.referencePointRear.deviationVt + view_config.rearArrowSize / 2
                                },
                                {
                                    deviationHz: nav_data.referencePointRear.deviationHz,
                                    deviationVt: nav_data.referencePointRear.deviationVt - view_config.rearArrowSize / 2
                                }
                            ];

                            return calculateMaxDeviationExcessOfPointArray(pointsToBeChecked);
                        };

                        // Calcualte max deviation excess of paper plane.
                        let nMaxDeviationExcess = calculateMaxDeviationExcessOfPaperPlane(view_config,nav_data);

                        // Scale X- and Y-axes if paper plane exceeds the max deviation, to fit into the circle.
                        if(nMaxDeviationExcess > 0) {
                            var nScaleFactor = 50;
                            let nAdjustedMaxDeviation = (Math.floor((view_config.maxDeviation + nMaxDeviationExcess)/nScaleFactor) + 1) * nScaleFactor;
                            view_config.maxDeviation = nAdjustedMaxDeviation;
                        }

                        scope.context = new itc.naviviewlib.Context(view_config, container_paper_plane);

                        /*
                         var tunnel = new itc.naviviewlib.layer.Tunnel3D(nav_settings, nav_alignment_deltas, scope.context);
                         scope.context.removeLayer("tunnel");
                         scope.context.addLayer("tunnel", tunnel);
                         */

                        var roll = new itc.naviviewlib.layer.RollIndicator(view_config, nav_data.rollInRadian, scope.context);
                        scope.context.removeLayer("roll");
                        scope.context.addLayer("roll", roll);

                        var grid = new itc.naviviewlib.layer.GridLayer(view_config, scope.context);
                        scope.context.removeLayer("grid");
                        scope.context.addLayer("grid", grid);


                        if (view_config.type == 'points') {
                            var cross = new itc.naviviewlib.layer.Crosshair(view_config, nav_data, scope.context);
                            scope.context.removeLayer("cross");
                            scope.context.addLayer("cross", cross);
                        } else {
                            var arrow = new itc.naviviewlib.layer.Arrow(view_config, nav_data, scope.context);
                            scope.context.removeLayer("arrow");
                            scope.context.addLayer("arrow", arrow);
                        }

                        scope.context.renderContext();

                        nav_data.tendency = {
                            horizontal: {
                                rearValueF:  nav_data.machinePartRear  && scope.units.settings ? $filter("number")(nav_data.machinePartRear.driftHz,  scope.units.settings.digitsForTendency) : "",
                                frontValueF: nav_data.machinePartFront && scope.units.settings ? $filter("number")(nav_data.machinePartFront.driftHz, scope.units.settings.digitsForTendency) : ""
                            },
                            vertical: {
                                rearValueF:  nav_data.machinePartRear  && scope.units.settings ? $filter("number")(nav_data.machinePartRear.driftVt,  scope.units.settings.digitsForTendency) : "",
                                frontValueF: nav_data.machinePartFront && scope.units.settings ? $filter("number")(nav_data.machinePartFront.driftVt, scope.units.settings.digitsForTendency) : ""
                            }
                        };

                        //Draw tendencies
                        scope.tendency_drawer = new TendencyDrawer(element);
                        scope.tendency_drawer.drawTendency(nav_data, view_config.maxDeviation);
                    }
                }
            };
        });
})();