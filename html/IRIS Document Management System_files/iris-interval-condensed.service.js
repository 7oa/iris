(function () {
    angular.module('iris_interval_condensed').service('IrisIntervalCondensedService', function ($q, $filter, $translate, IrisIntervalCondensedDefaults, DeviceDataService, DataSeriesService, uiGridConstants) {
        this.getDefaultSettings = function () {
            return IrisIntervalCondensedDefaults;
        };

        this.editDataSeries = function (widget, ds) {
            var ds_name = ds.name + ' ' + $filter('irisUnits')(ds.irisUnit, 'short', true),
                column = {
                    field: "" + ds.id,
                    displayName: ds_name,
                    name: new Date().getTime() + "_" + ds.id,
                    enableSorting: false,
                    ds: ds,
                    headerCellTemplate: `<div><span uib-tooltip="${ds_name}">${ds_name}</span></div>`
                };

            widget.settings.columns = widget.settings.columns || [];
            widget.settings.columns.push(column);
            ds.col_name = column.name;
        };

        this.setDataToGrid = function(widget, data) {
            widget.$$data = data;

            if(widget.$$gridOptions && widget.$$gridOptions.gridApi) {
                widget.$$gridOptions.gridApi.core.notifyDataChange(uiGridConstants.dataChange.ALL);
            }
        };

        this.initData = function (params, widget, gridOptions, scope) {
            var dataseries = [],
                ds_ids = [];

            scope.device_dataseries = {};

            this.setDataToGrid(widget, []);

            widget.$$data.splice(0, widget.$$data.length);

            if (widget.settings) {
                iris.loader.start('.iris-interval-condensed');

                if (!gridOptions.columnDefs || !gridOptions.columnDefs.length) {
                    gridOptions.columnDefs = widget.settings.columns;
                }

                for (var i = 3; i < widget.settings.columns.length; i++) {
                    var column = widget.settings.columns[i],
                        ds = { id: column.ds.id, targetUnit: column.ds.irisUnit };

                    dataseries.push(ds);
                    ds_ids.push(column.ds.id);
                }

                var get_ds = DataSeriesService.getAll({
                        'ids': angular.toJson(ds_ids),
                        'only-fields': angular.toJson(['id', 'name', 'irisUnit', 'digits'])
                    }).then(function (values) {
                        for (var i = 0, c = values.length; i < c; i++) {
                            var ds = values[i];
                            scope.device_dataseries[ds.id] = ds;
                        }
                    }),
                    data = DataSeriesService.getValues({
                        project: params.project_id,
                        device: params.device_id,
                        dataseries: angular.toJson(dataseries),
                        'date-start': params['period'].date_start,
                        'date-end': params['period'].date_end,
                        'only-last': true,
                        'exclude-fields': angular.toJson([ 'id', 'grouped', 'deviceId', 'projectId', 'dataseriesId', 'unit', 'date', 'dateEnd' ]),
                        'group-by': angular.toJson([{ type: 'advance' }, { type: 'field', value: 'dataseriesId' }])
                    }),
                    irisTime = iris.Time.GetGlobalObject();

                data.then(function (values) {
                    delete values[""];
                    get_ds.then(function () {
                        for (var advance in values) {
                            var rows = values[advance];
                            for (var id in rows) {
                                var ds = rows[id],
                                    value = ds[ds.length - 1].value; //if we have many values of dataseries for this ring - take the last

                                rows[id] = $filter('number')(value, scope.getDigitsByDSId(id));
                            }
                            rows.advance = advance;
                            var sel_adv = widget.advances.find(a => a.name == advance);
                            if (sel_adv) {
                                rows.date_start = sel_adv.startTime;
                                rows.date_end = sel_adv.endTime;
                            }

                            widget.$$data.push(rows);
                        }

                        iris.loader.stop('.iris-interval-condensed');
                    })
                });
            }
        };

        this.getDemoData = function (columns) {
            var getRnd = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,
                rows = [],
                additionalColumns = columns.filter(column => angular.isDefined(column.ds));

            for(var i = 0, c = getRnd(20, 100); i < c; i++) {
                var dt = moment().subtract(getRnd(10,30), 'days'),
                    row = {
                        advance: getRnd(1, 5),
                        date_start: dt.toISOString(),
                        date_end: dt.add(getRnd(1,9), 'days').toISOString()
                    };

                angular.forEach(additionalColumns, column => {
                    row[column.field] = getRnd(1, 99);
                });

                rows.push(row);
            }

            return rows;
        }
    });

    angular.module('iris_interval_condensed').factory('IrisIntervalCondensedDefaults', function ($translate, uiGridConstants) {
        return {
            columns: [
                {
                    field: 'advance',
                    displayName: $translate.instant('label.Advance'),
                    type: 'number',
                    sort: {
                        direction: uiGridConstants.DESC,
                        priority: 0
                    }
                }, {
                    field: 'date_start',
                    displayName: $translate.instant('label.StartDate'),
                    cellFilter: 'irisTime:grid.appScope'
                }, {
                    field: 'date_end',
                    displayName: $translate.instant('label.EndDate'),
                    cellFilter: 'irisTime:grid.appScope'
                }
            ]
        };
    });
})();

