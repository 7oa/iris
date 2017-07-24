(function () {


    angular.module('iris_reports', ['iris_widgets', 'iris_dataseries']);

    angular.module('iris_reports').factory('Templates', ['$resource', function ($resource) {
        return $resource(iris.config.apiUrl + "/reporting/templates/:id", {
            id: '@id'
        });
    }]);

    /*angular.module('irisApp').factory('Widgets', ['$resource', function ($resource) {
     return $resource(iris.config.apiUrl + "/reporting/widgets/:id", {
     id: '@id'
     });
     }]);*/

    angular.module('iris_reports').factory('WidgetTypes', ['$resource', function ($resource) {
        return $resource(iris.config.apiUrl + "/reporting/widget-types/:id", {
            id: '@id'
        });
    }]);

    angular.module('iris_reports').factory('DeviceSensors', ['$resource', function ($resource) {
        return $resource(iris.config.apiUrl + "/devices/:device_id/sensors/:id", {
            device_id: '@device_id',
            id: '@id'
        });
    }]);

    angular.module('iris_reports').factory('Reports', ['$resource', function ($resource) {
        return $resource(iris.config.apiUrl + "/reporting/reports/:id", {
            id: '@id'
        });
    }]);

    angular.module('iris_reports').factory('ReportTemplates', function ($resource) {
        return $resource(iris.config.apiUrl + "/reporting/report-templates/:id", {
            id: '@id'
        });
    });

    angular.module('iris_reports').factory('ReportCondensation', function ($resource) {
        return $resource(iris.config.apiUrl + "/reporting/condensations");
                    });

    //angular.module('iris_reports').factory('ReportCondensations', function($resource, $translate) {
    //    return $resource(`${iris.config.apiUrl}/reporting/reports/condensation-types`, { }, {
    //        get: {
    //            isArray: true,
    //            transformResponse(data) {
    //                return angular.fromJson(data).reportCondensationList.map((it) => {
    //                    return {
    //                        id: it,
    //                        name: $translate.instant(`label.ReportCondensation.${it}`)
    //                    }
    //                });
    //            }
    //        }
    //    })
    //});

    angular.module('iris_reports').factory('ReportWidgets', ['$resource', function ($resource) {
        return $resource(iris.config.apiUrl + "/reporting/reports/:report_id/widgets/:id", {
            id: '@id',
            report_id: '@report_id'
        });
    }]);

    angular.module('iris_reports').factory('ReportsService',
        function ($filter, $translate, Reports, WidgetService, WidgetTypeService, Templates,
                  /*ReportCondensations,*/ReportCondensation, ReportTemplates) {
            var reports = Reports.query({}, function (reports) {
                for (var i = 0, c = reports.length; i < c; i++) {
                    initReport(reports[i]);
                }

                return reports;
            });

            var initReport = function (report) {
                report.widgets = report.widgets || [];
                for (var i = 0, c = report.widgets.length; i < c; i++) {
                    report.widgets[i] = WidgetService.initWidget(report.widgets[i]);
                }
            };

            function getCondensationTypes() {
                return [
                    {id: "FREE", name: $translate.instant("label.Free")},
                    {id: "DAY", name: $translate.instant("label.Day")},
                    {id: "WEEK", name: $translate.instant("label.Week")},
                    {id: "MONTH", name: $translate.instant("label.Month")},
                    {id: "YEAR", name: $translate.instant("label.Year")},
                    {id: "ADVANCE", name: $translate.instant("label.Advance")},
                    {id: "SHIFT_REPORT", name: $translate.instant("label.ShiftReport")}
                ];
            }

            function getPartialIncludeModes() {
                return  [
                    {id: "NONE", name: $translate.instant("label.None")},
                    {id: "FULL", name: $translate.instant("label.Full")},
                    {id: "PARTIAL", name: $translate.instant("label.Partial")}
                ];
            }

            function calcTunnelmeterPerIntervals(dsValues, intervals) {
                if (!dsValues || !dsValues.length) return intervals.map(i => 0);
                var res = [],
                    begin = 0,
                    end = 0;
                for (var i = 0; i < intervals.length; i++) {
                    var intervalData = dsValues.filter(d => {
                        var date = new Date(d.date);
                        return date >= intervals[i].from && date < intervals[i].to;
                    });
                    var intervalDataNext = i < intervals.length - 1 ? dsValues.filter(d => {
                        var date = new Date(d.date);
                        return date >= intervals[i + 1].from && date < intervals[i + 1].to;
                    }) : [];

                    if (end || i == 0) begin = intervalData.length ? intervalData[0].value : end;
                    end = intervalDataNext.length ? intervalDataNext[0].value : (intervalData.length ? intervalData[intervalData.length - 1].value : 0);

                    res.push(Math.max(end - begin, 0));
                }
                return res;
            }

            return {
                getCondensationTypes,
                getPartialIncludeModes,

                calcTunnelmeterPerIntervals,

                query: function (filter) {
                    filter = filter || {};
                    return Reports.query(filter).$promise;
                },

                getReports: function () {
                    return reports;
                },

                getTemplates: function() {
                    return Templates.query();
                },

                getReportTemplates() {
                    return ReportTemplates.query().$promise;
                },

                saveReportTemplate(report, configTemplate) {
                    const reportTemplate = angular.extend(angular.copy(report), {
                        id: configTemplate.id,
                        name: configTemplate.name
                    });
                    return ReportTemplates.save(reportTemplate).$promise;
                },

                removeReportTemplate(id) {
                    return ReportTemplates.delete({id}).$promise;
                },

                createNewReportTemplate() {
                    return new ReportTemplates();
                },

                //getCondensations() {
                //    return ReportCondensations.get();
                //},

                evaluateCondensations(params) {
                    return ReportCondensation.query(params).$promise;
                },

                getPageOrientations: function() {
                    return [
                        {name: $translate.instant('label.Portrait'),id:'portrait'},
                        {name: $translate.instant('label.Landscape'),id:'landscape'}];
                },

                remove: function (report) {
                    return report.$remove({}, function (value) {
                        reports.splice(reports.findIndex(r => r.id == value.id), 1);
                        return value;
                    });
                },

                create: function () {
                    return new Reports({
                        settings: {
                            page: {},
                            layouts: [{
                                rows: [
                                    {
                                        columns: [
                                            {
                                                width: 12
                                            }
                                        ]
                                    }
                                ]
                            }]
                        },
                        params: {}
                    });
                },

                filter: function (filter, strict) {
                    strict = strict || true;
                    return $filter('filter')(reports, filter, strict);
                },

                getReport: function (id) {
                    return Reports.get({id}).$promise
                },

                save: function (report) {
                    var is_new = !report.id;
                    return report.$save(function (report) {
                        initReport(report);
                        if (is_new) reports.push(report);
                        return report;
                    })
                },

                addColumn: function (row) {
                    row.columns.push({
                        width: null
                    });
                    this.calcColWidth(row);
                },

                addRow: function (layout) {
                    layout.rows.push({
                        columns: [
                            {
                                width: 12
                            }
                        ]
                    });
                },

                addLayout(report) {
                    report.settings.layouts.push({
                        rows: [
                            {
                                columns: [
                                    {
                                        width: 12
                                    }
                                ]
                            }
                        ]
                    })
                },

                removeColumn: function (report, layoutIndex, row, index) {
                    this.clearCell(report, row, index);

                    row.columns.splice(index, 1);
                    if (row.columns.length == 0) {
                        index = report.settings.layouts[layoutIndex].rows.indexOf(row);
                        report.settings.layouts[layoutIndex].rows.splice(index, 1);
                    } else {
                        this.calcColWidth(row);
                    }
                },

                removeLayout: function(report, layoutIndex) {
                    report.settings.layouts[layoutIndex].rows.forEach(row => {
                        for (var colIndex=0; colIndex < row.columns.length; colIndex++) {
                            this.clearCell(report, row, colIndex);
                        }
                    })
                    report.settings.layouts.splice(layoutIndex, 1);
                },

                clearCell: function (report, row, index) {
                    var column = row.columns[index];
                    if (column) {
                        if (column.widget_id) {
                            var widget = this.getReportWidget(report, column.widget_id);
                            if(widget) {
                                for (var i in widget.parameters) {
                                    var wp_index = widget.parameters[i].key;
                                    for (var j in report.parameters) {
                                        var param_r = report.parameters[j];
                                        if (param_r.widgets_mapping) {
                                            delete param_r.widgets_mapping[wp_index];
                                            if (!Object.keys(param_r.widgets_mapping).length) {
                                                var p_index = report.parameters.indexOf(param_r);
                                                report.parameters.splice(p_index, 1);
                                            }
                                        }
                                    }
                                }
                            }
                            WidgetService.remove(WidgetService.getWidget(column.widget_id));
                            delete column.widget_id;
                        }
                    }
                },

                calcColWidth: function (row) {
                    var width = 12 / row.columns.length;
                    for (var i in row.columns) {
                        row.columns[i].width = width;
                    }
                },

                getReportWidget: function (report, id) {
                    return $filter('filter')(report.widgets, {id: id}, true)[0];
                },

                setWidget: function (report, widget, cell) {
                    return WidgetService.save(widget).then(function (widget) {
                        const hasWidget = report.widgets.find((it) => it.id == widget.id);
                        if (!hasWidget) {
                            report.widgets.push(widget);
                        }
                        cell.widget_id = widget.id;
                        return widget;
                    })
                }
            };
        }
    );

    angular.module('iris_reports').factory('PageSizes', function () {
        return [
            {type: 'A4', width: '595', height: '842'},
            {type: 'A3', width: '842', height: '1190'},
            {type: 'A2', width: '1190', height: '1684'},
            {type: 'A1', width: '1684', height: '2380'},
            {type: 'A0', width: '2380', height: '3368'},
            {type: 'A5', width: '421', height: '595'},
            {type: 'A6', width: '297', height: '421'},
            {type: 'A7', width: '210', height: '297'},
            {type: 'A8', width: '148', height: '210'},
            {type: 'A9', width: '105', height: '148'},
            {type: 'A10', width: '74', height: '105'},
            {type: 'LETTER', width: '612', height: '792'},
            {type: 'NOTE', width: '540', height: '720'},
            {type: 'LEGAL', width: '612', height: '1008'},
            {type: 'B0', width: '2836', height: '4008'},
            {type: 'B1', width: '2004', height: '2836'},
            {type: 'B2', width: '1418', height: '2004'},
            {type: 'B3', width: '1002', height: '1418'},
            {type: 'B4', width: ' 709', height: '1002'},
            {type: 'B5', width: '501', height: '709'},
            {type: 'B6', width: '353', height: '497'},
            {type: 'B7', width: '252', height: '353'},
            {type: 'B8', width: '173', height: '252'},
            {type: 'B9', width: '122', height: '173'},
            {type: 'B10', width: '86', height: '122'},
            {type: 'C0', width: '2599', height: '3679'},
            {type: 'C1', width: '1836', height: '2599'},
            {type: 'C2', width: '1296', height: '1836'},
            {type: 'C3', width: '922', height: '1296'},
            {type: 'C4', width: '648', height: '922'},
            {type: 'C5', width: '461', height: '648'},
            {type: 'C6', width: '324', height: '461'},
            {type: 'C7', width: '230', height: '324'},
            {type: 'C8', width: '158', height: '230'},
            {type: 'C9', width: '115', height: '158'},
            {type: 'C10', width: '79', height: '115'},
            {type: 'ARCH_E', width: '2592', height: '3456'},
            {type: 'ARCH_D', width: '1728', height: '2592'},
            {type: 'ARCH_C', width: '1296', height: '1728'},
            {type: 'ARCH_B', width: '864', height: '1296'},
            {type: 'ARCH_A', width: '648', height: '864'},
            {type: 'FLSA', width: '612', height: '936'},
            {type: 'FLSE', width: '612', height: '936'},
            {type: 'HALFLETTER', width: '396', height: '612'},
            {type: '_11X17', width: '792', height: '1224'},
            {type: 'LEDGER', width: '1224', height: '792'}];
    });

})();
