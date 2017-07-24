(function () {
    angular.module('irisSpoilManagement').factory('IrisSpoilManagementService', function ($translate, ReportsService) {
        var default_params = {
            xAxis: 'length',
            range: 15,
            barsAmount: 10,
            show_current_values_mass: 1,
            show_current_values_volume: 1,
            show_current_settings: 1,
            show_dry_mass: 1,
            show_current_dry_mass: 1,
            show_volume: 1,
            show_current_volume: 1
        };

        var line_stroke_xAxis = {
            type: 'linear',
            crosshair: true,
            title: {
                text: $translate.instant('label.StrokeLength')
            }
        };

        var line_time_xAxis = {
            type: 'datetime',
            crosshair: true,
            title: {
                text: $translate.instant('label.StrokeTime')
            }
        };

        var line_stroke_xAxis_header = '<span style="font-size: 10px"><b>{series.xAxis.userOptions.title.text}:</b> {point.key:,.0f}</span><br/>';

        var line_time_xAxis_header = '<span style="font-size: 10px"><b>{series.xAxis.userOptions.title.text}:</b> {point.key}</span><br/>';

        var demo_line = [{
            values: [[0, 0],
                [100, 0],
                [100, 1.33],
                [200, 1.33],
                [200, 1.95],
                [300, 1.95],
                [300, 2.5],
                [400, 2.5],
                [400, 3.47],
                [500, 3.47],
                [500, 4],
                [600, 4],
                [600, 4.783],
                [700, 4.783],
                [700, 5.323],
                [800, 5.323],
                [800, 6.703],
                [900, 6.703],
                [900, 7.443],
                [1000, 7.443],
                [1000, 8.23],
                [1100, 8.23],
                [1100, 9.23],
                [1200, 9.23],
                [1200, 10.3],
                [1300, 10.3],
                [1300, 12.3],
                [1400, 12.3]]
        }, {
            values: [[0, 0],
                [1400, 11]]
        }, {
            values: [[0, 0],
                [1400, 11 * 1.15]]
        }, {
            values: [[0, 0],
                [1400, 11 * 0.85]]
        }];

        var demo_bar = [{
            values: [
                [576, 0],
                [577, 6.338],
                [578, 5.950],
                [579, 11.56],
                [580, 5.476],
                [581, 0.507],
                [582, 5.531]]
        }, {
            values: [
                [576, 6],
                [582, 6]
            ]
        }];

        return {
            getDefaultSettings: function () {
                return default_params;
            },

            getDefaultRange: function () {
                return default_params.range;
            },

            getDefaultBarsAmount: function () {
                return default_params.barsAmount;
            },

            getDemoData: function (chart) {
                if (chart == 'bar') {
                    return demo_bar;
                }
                return demo_line;
            },

            getLineXAxisParams: function (type) {
                return type == 'time' ? line_time_xAxis : line_stroke_xAxis;
            },

            getLineXAxisHeader: function (type) {
                return type == 'time' ? line_time_xAxis_header : line_stroke_xAxis_header;
            },

            diffInSec: function (date1, date2) {
                var diff = (new Date(date2).getTime() / 1000 - new Date(date1).getTime() / 1000).toFixed(0);
                return diff < 0 ? 0 : diff;
            },

            prepareFlowVals: function (ds_values, last_date) {
                var cur_value = 0;

                for (var i = 0, c = ds_values.length - 1; i < c; i++) {
                    ds_values[i].value = cur_value + ds_values[i].value * this.diffInSec(ds_values[i].date, ds_values[i].dateEnd);
                    cur_value = ds_values[i].value;
                }

                if (!last_date || last_date && ds_values[i].dateEnd && ds_values[i].dateEnd <= last_date) last_date = ds_values[i].dateEnd;
                ds_values[i].value = last_date ? cur_value + ds_values[i].value * this.diffInSec(ds_values[i].date, last_date) : cur_value;
            },

            updateDSValues: function (advance, ds_values, new_values, ds_id) {
                if (angular.isUndefined(new_values) || angular.isUndefined(new_values[ds_id])) return false;
                var vals = new_values[ds_id];

                if (!ds_values[advance][ds_id]) {
                    ds_values[advance][ds_id] = vals;
                    return true;
                }

                var n = ds_values[advance][ds_id].length - 1;
                var last_old_val = ds_values[advance][ds_id][n];

                n = vals.length - 1;
                var last_new_val = vals[n];

                if (last_new_val.id != last_old_val.id) {
                    ds_values[advance][ds_id] = vals;
                    return true;
                }
                return false;

            },

            getSupportedDSAliases: function () {
                return ['current_dry_mass_ds',
                    'current_stroke_ds',
                    'current_volume_ds',
                    'density_calibration_ds',
                    'dry_mass_condensed_ds',
                    'flow_calibration_ds',
                    'insitu_density_ds',
                    'soil_particle_density_ds',
                    'practicle_density_ds',
                    'target_dry_mass_ds',
                    'target_stroke_ds',
                    'target_volume_ds',
                    'soil_calibration_factor_ds',
                    'mass_alarm_ds',
                    'range_ds',
                    'bentonite_calibration_factor_ds',
                    'volume_condensed_ds'];
            },

            generateUrl: function (project_id, device_id, advance) {
                //var report=ReportsService.filter({name: "SpoilManagement"}); have no idea why not works
                var report = null;
                return ReportsService.getReports().$promise.then(reports => {
                    report = reports.find(r => r.name == 'SpoilManagement');

                    if (!report) return null;
                    var params = {
                        date: {
                            date_type: "ring",
                            ring: advance
                        },
                        project_id,
                        device_id
                    };
                    return `${iris.config.apiUrl}/reporting/reports/${report.id}/generate?params=${angular.toJson(params)}`;
                });


            }
        };
    });

})();

