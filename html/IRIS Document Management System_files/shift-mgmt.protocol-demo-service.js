(function (undefined) {
    'use strict';

    const module = angular.module('iris_shiftmgmt_service');

    module.factory('ShiftProtocolDemo', function () {
        var demoStatistics = [
            {
                "rows" : [ [ "#ff0000", "Advance", 11.3005207042, 1823, 30.3833333333, 1.2659722222 ], [ "#ffff00", "Ring", 40.0694272254, 6464, 107.7333333333, 4.4888888888875 ], [ "#0000ff", "Ring Build", 15.4661542276, 2495, 41.5833333333, 1.7326388888875 ], [ "#009d00", "Downtime", 20.1834862385, 3256, 54.2666666667, 2.2611111111125 ], [ "#ff8040", "System out", 4.9652863873, 801, 13.35, 0.55625 ], [ "#ffff80", "Logistics", 1.7666749318, 285, 4.75, 0.1979166667 ], [ "#0080ff", "Cutter Head Intervention", 4.3763947434, 706, 11.7666666667, 0.4902777778 ], [ "#00ff80", "Operational disturbances", 1.8596578230, 300, 5, 0.2083333333 ], [ "#80ffff", "Modification TBM", 0.0123977188, 2, 0.0333333333, 0.0013888888875 ] ],
                "summary" : null
            },
            {
                "rows" : [ [ "#ff0000", "Advance", 24.4379107575, 1413, 23.55, 0.98125 ], [ "#0000ff", "Ring Build", 24.1265997925, 1395, 23.25, 0.96875 ], [ "#ffff00", "Ring", 12.4524386026, 720, 12, 0.5 ], [ "#009d00", "Downtime", 25.8561051539, 1495, 24.9166666667, 1.0381944444 ], [ "#ff8040", "System out", 7.8692493947, 455, 7.5833333333, 0.3159722222 ], [ "#ffff80", "Logistics", 1.6430300934, 95, 1.5833333333, 0.0659722222 ], [ "#0080ff", "Cutter Head Intervention", 3.6146662055, 209, 3.4833333333, 0.1451388888875 ] ],
                "summary" : null
            },
            {
                "rows" : [ [ "#ffff00", "Ring", 33, 17.5, 0.29, 0.01215 ], [ "#ff8040", "System out", 67, 35, 0.5833333333, 0.0243055556 ] ],
                "summary" : null
            }
        ];

        return {
            getStatistics: function(dataIndex) {
                var rand = Math.random(),
                    demoIndex = dataIndex === undefined || dataIndex < 0 || dataIndex >= demoStatistics.length ? Math.floor((rand / (1 / demoStatistics.length))) : dataIndex;
                return demoStatistics[demoIndex];
            },

            getStatisticsDynamic: function(columns, showSummary) {
                var randomColor = function() {
                    var letters = '0123456789ABCDEF';
                    var color = '#';
                    for (var i = 0; i < 6; i++ ) {
                        color += letters[Math.floor(Math.random() * 16)];
                    }
                    return color;
                };
                var res = {
                    rows: [],
                    summary: []
                };

                for (let i = 0; i < 3; i++) {
                    var row = [];
                    for (let j = 0; j < columns.length; j++) {
                        if (columns[j] == "COLOR") {
                            row[j] = randomColor();
                            res.summary[j] = null;
                        } else if (columns[j] == "CODE_NAME") {
                            row[j] = "data";
                            res.summary[j] = null;
                        } else {
                            row[j] = Math.random() * 10;
                            res.summary[j] || (res.summary[j] = 0);
                            res.summary[j] += row[j];
                        }
                    }
                    res.rows.push(row);
                }

                if (!showSummary) res.summary = null;
                return res;
            }
        };
    });

    module.constant('ShiftProtocolDemoFullModel', {
        "protocol" : {
            "finalized" : false,
            "startTime" : "2016-04-25T15:00:00.000Z",
            "endTime" : "2016-04-26T03:00:00.000Z",
            "startRingNumber" : 21,
            "endRingNumber" : 21,
            "startChainage" : null,
            "endChainage" : null,
            "startTunnelMeter" : null,
            "endTunnelMeter" : null,
            "showRings" : false,
            "showStations" : false,
            "comment" : "",
            "dayComment" : null,
            "displayRefreshInterval" : 60,
            "defaultGridResolution" : "10m",
            "showConstructionIntervals" : true,
            "constructionIntervalsLabel" : "Ring",
            "autofinalizeDelay" : null,
            "headerTemplate" : "<table border=\"1\" cellpadding=\"1\" cellspacing=\"1\" style=\"height:100%; width:100%\">\n\t<tbody>\n\t\t<tr>\n\t\t\t<td><strong>Protocol No.</strong></td>\n\t\t\t<td>{{info.name}}</td>\n\t\t\t<td><strong>Shift engineer</strong></td>\n\t\t\t<td>{{info.job2}}</td>\n\t\t\t<td><strong>Ring advance start</strong></td>\n\t\t\t<td>{{info.advance.interval.start}}</td>\n\t\t</tr>\n\t\t<tr>\n\t\t\t<td><strong>Shift periode</strong></td>\n\t\t\t<td>{{info.period}}</td>\n\t\t\t<td><strong>Foreman</strong></td>\n\t\t\t<td>{{info.job3}}</td>\n\t\t\t<td><strong>Ring advance end</strong></td>\n\t\t\t<td>{{info.advance.interval.end}}</td>\n\t\t</tr>\n\t\t<tr>\n\t\t\t<td><strong>Shift</strong></td>\n\t\t\t<td>{{info.shift.name}}</td>\n\t\t\t<td><strong>TBM Driver</strong></td>\n\t\t\t<td>{{info.job1}}</td>\n\t\t\t<td><strong>Build Rings</strong></td>\n\t\t\t<td>{{info.advance.interval.end-info.advance.interval.start}}</td>\n\t\t</tr>\n\t</tbody>\n</table>\n\n<p>&nbsp;</p>\n",
            "lastDataImport" : null,
            "lastUpdate" : "2016-09-23T09:37:20.000Z",
            "projectId" : 5,
            "deviceId" : 3,
            "assignableJobTitles" : [ {
                "name" : "Shift Engineer",
                "description" : "",
                "id" : 2,
                "createdBy" : 1,
                "createdOn" : "2016-04-08T07:30:37.000Z",
                "updatedBy" : 1,
                "updatedOn" : "2016-04-08T07:30:37.000Z"
            }, {
                "name" : "TBM Driver",
                "description" : "",
                "id" : 1,
                "createdBy" : 1,
                "createdOn" : "2016-04-08T07:27:15.000Z",
                "updatedBy" : 1,
                "updatedOn" : "2016-04-08T07:27:15.000Z"
            }, {
                "name" : "Foreman",
                "description" : "",
                "id" : 3,
                "createdBy" : 1,
                "createdOn" : "2016-04-08T07:30:43.000Z",
                "updatedBy" : 1,
                "updatedOn" : "2016-04-08T07:30:43.000Z"
            } ],
            "shiftStaffs" : [ ],
            "originModelId" : 4,
            "originTemplateId" : 1,
            "validateStartShift" : false,
            "criticalPathTolerance" : null,
            "displayName" : "NS-2016-04-25",
            "endDate" : "2016-04-26T00:00:00.000Z",
            "startDate" : "2016-04-25T00:00:00.000Z",
            "endTimeTT" : "2016-04-26T03:00:00.000Z",
            "startTimeTT" : "2016-04-25T15:00:00.000Z",
            "errorNotificationRecipientAddressList" : null,
            "reportTemplateId" : null,
            "shiftModelBundleId" : 2,
            "advanceInfoCompleted" : false,
            "id" : 28,
            "createdBy" : 16,
            "createdOn" : "2016-04-25T10:29:59.000Z",
            "updatedBy" : 1,
            "updatedOn" : "2016-09-23T09:37:20.000Z"
        },
        "advanceInfo" : {
            "startRingNumber" : 21,
            "endRingNumber" : 21,
            "startChainage" : null,
            "endChainage" : null,
            "startTunnelMeter" : null,
            "endTunnelMeter" : null,
            "completed" : false
        },
        "shiftName" : "Night Shift",
        "rows" : [ {
            "name" : "Advance",
            "code" : 100,
            "id" : 1,
            "movable" : false,
            "tasks" : [ ],
            "ringRow" : false
        }, {
            "name" : "Ring",
            "code" : 200,
            "id" : 62,
            "movable" : false,
            "tasks" : [ {
                "classes" : [ ],
                "id" : 412,
                "rowId" : 62,
                "name" : "",
                "from" : "2016-04-25T15:00:00.000Z",
                "to" : "2016-04-26T03:00:00.000Z",
                "data" : {
                    "menu" : true,
                    "comments" : [ ]
                },
                "color" : "#ffff00",
                "isAutomaticState" : true
            } ],
            "ringRow" : false
        }, {
            "name" : "Ring Build",
            "code" : 200,
            "id" : 2,
            "movable" : false,
            "tasks" : [ ],
            "ringRow" : false
        }, {
            "name" : "Downtime",
            "code" : 300,
            "id" : 3,
            "movable" : {
                "allowResizing" : false
            },
            "tasks" : [ ],
            "ringRow" : false
        }, {
            "name" : "System out",
            "code" : 400,
            "id" : 4,
            "movable" : true,
            "tasks" : [ {
                "classes" : [ "critical" ],
                "id" : 410,
                "rowId" : 4,
                "name" : "",
                "from" : "2016-04-25T15:29:00.000Z",
                "to" : "2016-04-25T15:52:00.000Z",
                "data" : {
                    "menu" : true,
                    "critical" : true,
                    "comments" : [ ]
                },
                "color" : "#ff8040",
                "isAutomaticState" : false
            } ],
            "ringRow" : false
        }, {
            "name" : "Extensions",
            "code" : 410,
            "id" : 12,
            "parent" : 4,
            "movable" : true,
            "tasks" : [ {
                "classes" : [ "critical" ],
                "id" : 413,
                "rowId" : 12,
                "name" : "",
                "from" : "2016-04-25T15:43:00.000Z",
                "to" : "2016-04-25T16:23:00.000Z",
                "data" : {
                    "menu" : true,
                    "critical" : true,
                    "comments" : [ ]
                },
                "color" : "#ff8040",
                "isAutomaticState" : false
            } ],
            "ringRow" : false
        }, {
            "name" : "Extend air and water lines",
            "code" : 411,
            "id" : 50,
            "parent" : 12,
            "movable" : true,
            "tasks" : [ {
                "classes" : [ "critical" ],
                "id" : 414,
                "rowId" : 50,
                "name" : "",
                "from" : "2016-04-25T15:48:00.000Z",
                "to" : "2016-04-25T16:37:00.000Z",
                "data" : {
                    "menu" : true,
                    "critical" : true,
                    "comments" : [ ]
                },
                "color" : "#ff8040",
                "isAutomaticState" : false
            } ],
            "ringRow" : false
        }, {
            "name" : "Extend tracks",
            "code" : 412,
            "id" : 52,
            "parent" : 12,
            "movable" : true,
            "tasks" : [ ],
            "ringRow" : false
        }, {
            "name" : "Extend power lines",
            "code" : 413,
            "id" : 49,
            "parent" : 12,
            "movable" : true,
            "tasks" : [ ],
            "ringRow" : false
        }, {
            "name" : "Extend air ventilation duct",
            "code" : 414,
            "id" : 48,
            "parent" : 12,
            "movable" : true,
            "tasks" : [ ],
            "ringRow" : false
        }, {
            "name" : "Convert survey",
            "code" : 420,
            "id" : 17,
            "parent" : 4,
            "movable" : true,
            "tasks" : [ ],
            "ringRow" : false
        }, {
            "name" : "Cleaning",
            "code" : 430,
            "id" : 43,
            "parent" : 4,
            "movable" : true,
            "tasks" : [ ],
            "ringRow" : false
        }, {
            "name" : "Clean shield tail",
            "code" : 431,
            "id" : 60,
            "parent" : 43,
            "movable" : true,
            "tasks" : [ ],
            "ringRow" : false
        }, {
            "name" : "Clean injection unit and tubes",
            "code" : 432,
            "id" : 61,
            "parent" : 43,
            "movable" : true,
            "tasks" : [ ],
            "ringRow" : false
        }, {
            "name" : "Logistics",
            "code" : 500,
            "id" : 6,
            "movable" : true,
            "tasks" : [ ],
            "ringRow" : false
        }, {
            "name" : "Waiting periods",
            "code" : 510,
            "id" : 22,
            "parent" : 6,
            "movable" : true,
            "tasks" : [ ],
            "ringRow" : false
        }, {
            "name" : "Waiting for grout",
            "code" : 511,
            "id" : 46,
            "parent" : 22,
            "movable" : true,
            "tasks" : [ ],
            "ringRow" : false
        }, {
            "name" : "Waiting for segments",
            "code" : 512,
            "id" : 44,
            "parent" : 22,
            "movable" : true,
            "tasks" : [ ],
            "ringRow" : false
        }, {
            "name" : "Deconstruction ring/segments",
            "code" : 520,
            "id" : 42,
            "parent" : 6,
            "movable" : true,
            "tasks" : [ ],
            "ringRow" : false
        }, {
            "name" : "Repair ring/segments",
            "code" : 530,
            "id" : 19,
            "parent" : 6,
            "movable" : true,
            "tasks" : [ ],
            "ringRow" : false
        }, {
            "name" : "Shift Handover",
            "code" : 540,
            "id" : 24,
            "parent" : 6,
            "movable" : true,
            "tasks" : [ ],
            "ringRow" : false
        }, {
            "name" : "Cutter Head Intervention",
            "code" : 600,
            "id" : 5,
            "movable" : true,
            "tasks" : [ ],
            "ringRow" : false
        }, {
            "name" : "Lower / Re-fill",
            "code" : 610,
            "id" : 14,
            "parent" : 5,
            "movable" : true,
            "tasks" : [ ],
            "ringRow" : false
        }, {
            "name" : "Inspection of tools / tunnel face",
            "code" : 620,
            "id" : 15,
            "parent" : 5,
            "movable" : true,
            "tasks" : [ ],
            "ringRow" : false
        }, {
            "name" : "Change tools",
            "code" : 630,
            "id" : 18,
            "parent" : 5,
            "movable" : true,
            "tasks" : [ ],
            "ringRow" : false
        }, {
            "name" : "Repairs",
            "code" : 640,
            "id" : 25,
            "parent" : 5,
            "movable" : true,
            "tasks" : [ ],
            "ringRow" : false
        }, {
            "name" : "Repair Disc Cutter",
            "code" : 641,
            "id" : 56,
            "parent" : 25,
            "movable" : true,
            "tasks" : [ ],
            "ringRow" : false
        }, {
            "name" : "Repair drilling probes equipment",
            "code" : 642,
            "id" : 55,
            "parent" : 25,
            "movable" : true,
            "tasks" : [ ],
            "ringRow" : false
        }, {
            "name" : "Repair of disc cutter after checking with special tool.",
            "code" : 643,
            "id" : 59,
            "parent" : 25,
            "movable" : true,
            "tasks" : [ ],
            "ringRow" : false
        }, {
            "name" : "Repair boulder-crusher",
            "code" : 644,
            "id" : 57,
            "parent" : 25,
            "movable" : true,
            "tasks" : [ ],
            "ringRow" : false
        }, {
            "name" : "Repair suction grill",
            "code" : 645,
            "id" : 58,
            "parent" : 25,
            "movable" : true,
            "tasks" : [ ],
            "ringRow" : false
        }, {
            "name" : "Remove obstacles at tunnel face",
            "code" : 650,
            "id" : 35,
            "parent" : 5,
            "movable" : true,
            "tasks" : [ ],
            "ringRow" : false
        }, {
            "name" : "Operational disturbances",
            "code" : 700,
            "id" : 9,
            "movable" : true,
            "tasks" : [ ],
            "ringRow" : false
        }, {
            "name" : "Boulder-crusher",
            "code" : 710,
            "id" : 40,
            "parent" : 9,
            "movable" : true,
            "tasks" : [ ],
            "ringRow" : false
        }, {
            "name" : "Electricity boulder-crusher",
            "code" : 711,
            "id" : 51,
            "parent" : 40,
            "movable" : true,
            "tasks" : [ ],
            "ringRow" : false
        }, {
            "name" : "Hydraulics boulder-crusher",
            "code" : 712,
            "id" : 53,
            "parent" : 40,
            "movable" : true,
            "tasks" : [ ],
            "ringRow" : false
        }, {
            "name" : "Cutting wheel",
            "code" : 720,
            "id" : 10,
            "parent" : 9,
            "movable" : true,
            "tasks" : [ ],
            "ringRow" : false
        }, {
            "name" : "Electricity cutting wheel",
            "code" : 721,
            "id" : 45,
            "parent" : 10,
            "movable" : true,
            "tasks" : [ ],
            "ringRow" : false
        }, {
            "name" : "Cutting wheel in general",
            "code" : 722,
            "id" : 47,
            "parent" : 10,
            "movable" : true,
            "tasks" : [ ],
            "ringRow" : false
        }, {
            "name" : "Stop valve",
            "code" : 730,
            "id" : 29,
            "parent" : 9,
            "movable" : true,
            "tasks" : [ ],
            "ringRow" : false
        }, {
            "name" : "Erector",
            "code" : 740,
            "id" : 20,
            "parent" : 9,
            "movable" : true,
            "tasks" : [ ],
            "ringRow" : false
        }, {
            "name" : "Erector vacuum system",
            "code" : 741,
            "id" : 54,
            "parent" : 20,
            "movable" : true,
            "tasks" : [ ],
            "ringRow" : false
        }, {
            "name" : "Modification TBM",
            "code" : 800,
            "id" : 7,
            "movable" : true,
            "tasks" : [ ],
            "ringRow" : false
        }, {
            "name" : "TBM assembly",
            "code" : 810,
            "id" : 23,
            "parent" : 7,
            "movable" : true,
            "tasks" : [ ],
            "ringRow" : false
        }, {
            "name" : "Start phase TBM until injection position",
            "code" : 820,
            "id" : 28,
            "parent" : 7,
            "movable" : true,
            "tasks" : [ ],
            "ringRow" : false
        }, {
            "name" : "Grouting at launching construction(Tunnel Safe Eye Grouting)",
            "code" : 830,
            "id" : 13,
            "parent" : 7,
            "movable" : true,
            "tasks" : [ ],
            "ringRow" : false
        }, {
            "name" : "Tailskin assembly",
            "code" : 840,
            "id" : 39,
            "parent" : 7,
            "movable" : true,
            "tasks" : [ ],
            "ringRow" : false
        }, {
            "name" : "Pipeline modification",
            "code" : 850,
            "id" : 37,
            "parent" : 7,
            "movable" : true,
            "tasks" : [ ],
            "ringRow" : false
        }, {
            "name" : "Test run / settingTBM",
            "code" : 860,
            "id" : 34,
            "parent" : 7,
            "movable" : true,
            "tasks" : [ ],
            "ringRow" : false
        }, {
            "name" : "Track modification",
            "code" : 870,
            "id" : 27,
            "parent" : 7,
            "movable" : true,
            "tasks" : [ ],
            "ringRow" : false
        }, {
            "name" : "Drive scheduling",
            "code" : 880,
            "id" : 36,
            "parent" : 7,
            "movable" : true,
            "tasks" : [ ],
            "ringRow" : false
        }, {
            "name" : "Disassembly of TBM",
            "code" : 890,
            "id" : 38,
            "parent" : 7,
            "movable" : true,
            "tasks" : [ ],
            "ringRow" : false
        }, {
            "name" : "Others",
            "code" : 900,
            "id" : 8,
            "movable" : true,
            "tasks" : [ ],
            "ringRow" : false
        }, {
            "name" : "Heave/settlements",
            "code" : 910,
            "id" : 26,
            "parent" : 8,
            "movable" : true,
            "tasks" : [ ],
            "ringRow" : false
        }, {
            "name" : "Cave-in",
            "code" : 920,
            "id" : 16,
            "parent" : 8,
            "movable" : true,
            "tasks" : [ ],
            "ringRow" : false
        }, {
            "name" : "Fire",
            "code" : 930,
            "id" : 11,
            "parent" : 8,
            "movable" : true,
            "tasks" : [ ],
            "ringRow" : false
        }, {
            "name" : "Accident",
            "code" : 940,
            "id" : 41,
            "parent" : 8,
            "movable" : true,
            "tasks" : [ ],
            "ringRow" : false
        }, {
            "name" : "Special instruction",
            "code" : 950,
            "id" : 21,
            "parent" : 8,
            "movable" : true,
            "tasks" : [ ],
            "ringRow" : false
        }, {
            "name" : "Training",
            "code" : 960,
            "id" : 30,
            "parent" : 8,
            "movable" : true,
            "tasks" : [ ],
            "ringRow" : false
        }, {
            "name" : "Client",
            "code" : 980,
            "id" : 31,
            "parent" : 8,
            "movable" : true,
            "tasks" : [ ],
            "ringRow" : false
        }, {
            "name" : "Client stops the construction",
            "code" : 990,
            "id" : 32,
            "parent" : 8,
            "movable" : true,
            "tasks" : [ ],
            "ringRow" : false
        }, {
            "name" : "Critical Path",
            "movable" : false,
            "tasks" : [ {
                "from" : "2016-04-25T15:00:00.000Z",
                "to" : "2016-04-25T15:29:00.000Z",
                "type" : "Y",
                "name" : "",
                "tooltips" : false,
                "classes" : [ "checkbit" ],
                "color" : "#FFFF00"
            }, {
                "from" : "2016-04-25T15:29:00.000Z",
                "to" : "2016-04-25T15:43:00.000Z",
                "type" : "G",
                "name" : "",
                "tooltips" : false,
                "classes" : [ "checkbit" ],
                "color" : "#00FF00"
            }, {
                "from" : "2016-04-25T15:43:00.000Z",
                "to" : "2016-04-25T16:23:00.000Z",
                "type" : "R",
                "name" : "",
                "tooltips" : false,
                "classes" : [ "checkbit" ],
                "color" : "#FF0000"
            }, {
                "from" : "2016-04-25T16:23:00.000Z",
                "to" : "2016-04-25T16:37:00.000Z",
                "type" : "G",
                "name" : "",
                "tooltips" : false,
                "classes" : [ "checkbit" ],
                "color" : "#00FF00"
            }, {
                "from" : "2016-04-25T16:37:00.000Z",
                "to" : "2016-04-26T03:00:00.000Z",
                "type" : "Y",
                "name" : "",
                "tooltips" : false,
                "classes" : [ "checkbit" ],
                "color" : "#FFFF00"
            } ],
            "ringRow" : false,
            "classes" : [ "check-bits" ],
            "checkBit" : true
        } ],
        "conflictProtocol" : null,
        "lockUser" : null,
        "hasAdvanceUpdates" : false,
        "displayDayComment" : false
    });
})();