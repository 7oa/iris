(function () {
    angular.module('irisSpoilManagement').directive('irisSpoilManagement',
        function ($timeout, $filter, $translate, $uibModal,
                  DevicesService, ProjectsService, IrisSpoilManagementService, DeviceDataService,
                  DataSeriesService, GlobalSettingsService, UserService, UserGroupsService) {
            return {
                restrict: 'EA',
                replace: true,
                scope: {
                    params: '=',
                    widget: '='
                },
                templateUrl: iris.config.widgetsUrl + '/iris-spoil-management/templates/iris-spoil-management.view.html',
                link: function (scope, element, attrs) {
                    scope.widget = scope.widget || {};
                    scope.widget.settings = scope.widget.settings || {};
                    scope.params = scope.params || {};

                    scope.me = UserService.getCurUser();

                    scope.config = iris.config;
                    scope.show_controls = scope.$eval(attrs.showControls) || false;
                    scope.auto_reload = scope.$eval(attrs.reload) || false;
                    scope.devices = DevicesService.getDevices();
                    scope.projects = ProjectsService.getProjects();

                    /**
                     * Last update date, doesn't matter if auto-updated or updated by user (refresh button)
                     * @type {Date}
                     */
                    scope.lastUpdate = null;

                    /**
                     * Represents the Date from which the last data is (In UI: 'Last Data from')
                     * @type {Date}
                     */
                    scope.dataDate = null;

                    scope.hasPermission = function (subject_id, subject_name, action) {
                        return UserGroupsService.hasPermissions(subject_id, subject_name, action);
                    };

                    var defaultSettings = IrisSpoilManagementService.getDefaultSettings();
                    angular.merge(scope.params, defaultSettings, scope.widget.settings);
                    scope.params.demo = attrs.mode == 'demo';

                    scope.timeout = null;

                    scope.$on('$destroy', () => {
                        scope.clearTimeout();
                    });

                    function defineBarsAmount(settings) {
                        return settings.barsAmount > 0 && settings.barsAmount <= 20
                            ? settings.barsAmount
                            : IrisSpoilManagementService.getDefaultBarsAmount();
                    }

                    function setAdvanceRange(advance){
                        if(!advance) {
                            scope.params.advancesForBars = [];
                            return;
                        }

                        var numOfAdvances = scope.params.barsAmount;
                        scope.params.advancesForBars = (scope.device.advances || []).filter(a => a.name < +advance).slice(0, numOfAdvances);
                    }

                    function getAdvanceName(advance, isStart){
                        setAdvanceRange(advance);
                        if(!scope.params.advancesForBars || !scope.params.advancesForBars.length) return;

                        var numOfAdvances = scope.params.advancesForBars.length;
                        return scope.params.advancesForBars[isStart ? 0 : numOfAdvances - 1].name;
                    }

                    /**
                     * observe if dataseries values are changing
                     */
                    scope.$watch('ds_values', function (newVal, oldVal) {
                        console.log('DS values changed', newVal, oldVal);
                        console.log('currend advance', scope.params.advance);

                        // Getting end date from the current stroke data series
                        scope.dataDate = scope.getDSEndDate('current_stroke_ds');

                    }, true);

                    /**
                     * fetch advances for selected devices and check if it's neccessary to auto-select
                     * the latest advance
                     */
                    scope.updateDeviceAdvance = function () {
                        var orderedAdvances = $filter('orderBy')(scope.device.advances, 'name');
                        console.log('ordered available advances', orderedAdvances);

                        var currentNumberOfAdvances = orderedAdvances.length;
                        var selectedAdvance = $filter('filter')(orderedAdvances, {name: scope.params.advance}, true)[0];
                        var lastAdvanceIsSelected = orderedAdvances.indexOf(selectedAdvance) === (currentNumberOfAdvances - 1);
                        console.log('last advance is selected', lastAdvanceIsSelected);

                        var filter = {
                            project_id: scope.params.project_id,
                            device_id: scope.params.device_id
                        };

                        if (scope.params.date && scope.params.date.date) {
                            filter.to = scope.params.date.date;
                        }

                        DeviceDataService.getAdvances(filter).then(function (fetchedAdvances) {
                            scope.device.advances = fetchedAdvances;
                            if (fetchedAdvances && fetchedAdvances.length) {

                                // Only automatically set latest advance, if user has selected last advance
                                if (lastAdvanceIsSelected && (fetchedAdvances.length === currentNumberOfAdvances + 1)) {
                                    scope.setAdvance(fetchedAdvances[0].name);
                                }
                            }
                        });
                    };

                    scope.refresh = function () {
                        scope.getDSValues(scope.params.advance);
                        scope.updateDeviceAdvance();
                    };

                    scope.clearTimeout = function () {
                        if (scope.timeout) clearTimeout(scope.timeout);
                    };

                    scope.updateDSValues = function () {
                        /**
                         * last advance is always unprocessed, but if more than one advance
                         * is unprocessed it contains to a finished advance
                         */
                        var unprocessedFinishedAdvanceAvailable = $filter('filter')(scope.device.advances, {processed: false}, true).length > 1;
                        scope.timeout = setTimeout(function () {
                            // if unprocessed finished advances available, catch all ds values and not only update
                            scope.getDSValues(scope.params.advance, !unprocessedFinishedAdvanceAvailable, false);
                            scope.updateDeviceAdvance();
                            scope.updateDSValues();
                        }, 10000);
                    };

                    scope.setNextAdvance = function (isForward) {
                        if(!scope.device || !scope.device.advances || scope.params.advance == null) return;

                        var currentAdvance = scope.device.advances.find(a => a.name == scope.params.advance);
                        if(!currentAdvance) return;

                        var advanceIndex = scope.device.advances.indexOf(currentAdvance);
                        var numOfAdvances = scope.device.advances.length;

                        if(advanceIndex < 0
                            || numOfAdvances == 0
                            || isForward && advanceIndex == 0
                            || !isForward && advanceIndex == numOfAdvances - 1) return;

                        var targetAdvanceIndex = isForward ? advanceIndex - 1 : advanceIndex + 1;
                        var targetAdvance = scope.device.advances[targetAdvanceIndex];

                        scope.setAdvance(targetAdvance.name);
                    };

                    scope.setAdvance = function (advance) {
                        if(scope.params.demo) return;

                        scope.params.advance = advance;
                        setAdvanceRange(advance);

                        if (!advance) {
                            scope.getDSValues();
                            scope.clearTimeout();
                            return;
                        } else {
                            scope.getDSValues(advance);
                        }

                        //don't set timeout and autoreload data if parameter is not set
                        if (!scope.auto_reload) return;

                        var is_timeout_set = false;
                        for (var i = 0, c = scope.device.advances.length; i < c; i++) {
                            var adv = scope.device.advances[i];
                            if (adv.name == advance) {
                                //remove previous timeout if exists
                                scope.clearTimeout();

                                //set new timeout
                                scope.updateDSValues();

                                is_timeout_set = true;
                                break;
                            }
                        }
                        //if current interval is processed - remove timeout
                        if (!is_timeout_set) scope.clearTimeout();
                    };

                    scope.setDevice = function (id, init) {
                        if(scope.params.device_id == id && !init) return;

                        scope.clearTimeout();

                        if(scope.params.demo) return;

                        if (!id) {
                            scope.device_settings = null;
                            scope.device = null;
                            return;
                        }
                        scope.device = $filter('filter')(scope.project.devices, {id: +id}, true)[0];
                        scope.params.device_id = id;
                        scope.params.show_calibration_factors = 0;
                        scope.params.barsAmount = 10;

                        var filter = {
                            project_id: scope.params.project_id,
                            device_id: scope.params.device_id
                        };
                        if (scope.params.date && scope.params.date.date_end) { //@Leo why was date instead date_end?
                            filter.to = scope.params.date.date_end;
                        }

                        DeviceDataService.getAdvances(filter).then(function (advances) {
                            scope.device.advances = advances;
                            if (scope.params.date && scope.params.date.ring) {
                                scope.setAdvance(scope.params.date.ring);
                            } else {
                                if (advances && advances.length) {
                                    var advance = scope.params.advance!=null ? advances.find(a => a.name == scope.params.advance) : null;
                                    scope.setAdvance(advance ? +scope.params.advance : advances[0].name);
                                } else {
                                    scope.setAdvance(null);
                                }
                            }
                        });

                        scope.device_settings_promise = DevicesService.getDeviceSettingsById('spoil-management', id).then(function (device_settings) {
                            scope.device_settings = device_settings;
                            scope.params.range = device_settings.settings.range;
                            scope.params.barsAmount = defineBarsAmount(device_settings.settings);
                            setAdvanceRange(scope.params.advance);
                            scope.params.showAverageDryMass = device_settings.settings.show_average_dry_mass;
                            scope.params.showAverageVolume = device_settings.settings.show_average_volume;
                            scope.params.show_calibration_factors = device_settings.settings.bentonite_calibration_factor_ds
                                || device_settings.settings.soil_calibration_factor_ds ? 1 : 0;
                            var ds_ids = [];
                            var aliases = IrisSpoilManagementService.getSupportedDSAliases();
                            for (var i in aliases) {
                                var alias = aliases[i];
                                var ds_id = +device_settings.settings[alias];
                                if (ds_id > 0 && ds_ids.indexOf(ds_id) < 0) {
                                    ds_ids.push(ds_id);
                                }
                            }

                            scope.device_dataseries = {};
                            DataSeriesService.getAll({
                                'ids': angular.toJson(ds_ids),
                                'only-fields': angular.toJson(['id', 'name', 'irisUnit', 'digits', 'type'])
                            }).then(function (values) {
                                for (var i = 0, c = values.length; i < c; i++) {
                                    var ds = values[i];
                                    scope.device_dataseries[ds.id] = ds;
                                }
                            });

                        });
                    };

                    scope.getTZOffset = function (timestamp) {
                        return -moment.tz(timestamp, scope.timezone).utcOffset();
                    };

                    scope.setProject = function (id, init) {
                        if(scope.params.project_id == id && !init) return;

                        scope.clearTimeout();

                        if(scope.params.demo) return;

                        id = id || scope.params.project_id;
                        scope.project = ProjectsService.getProjectById(id);
                        scope.params.project_id = id;

                        //set timezone to output dates and to Highcharts
                        scope.timezone = scope.project.timeZone;

                        //check if current device is in project and if not - select the first from project
                        var flag = scope.project.devices.find(d => d.id == scope.params.device_id);

                        //if new selected project has the same device set it, if not - change to the first in list
                        if (!flag) {
                            scope.setDevice(scope.project.devices.length ? scope.project.devices[0].id : null, init);
                        } else {
                            scope.setDevice(scope.params.device_id, init);
                        }
                    };
                    scope.setProject(scope.params.project_id, true);

                    scope.openDSEditValueModal = function (settings_ds) {
                        scope.ds_value_modal = $uibModal.open({
                            templateUrl: iris.config.widgetsUrl + '/iris-spoil-management/templates/iris-spoil-management.edit-ds-value.html',
                            resolve: {
                                'dataseries': function () {
                                    return {
                                        project_id: scope.params.project_id,
                                        device_id: scope.params.device_id,
                                        dataseries_id: scope.device_settings.settings[settings_ds],
                                        value: scope.getDSValue(settings_ds),
                                        time: new Date()
                                    }
                                }
                            },
                            controller: 'DataSeriesController'
                        }).result.then(function (ds) {
                                DataSeriesService.setValue(ds).then(function () {
                                    scope.getDSValues(scope.params.advance);
                                });
                            });
                    };

                    scope.getDigits = function (ds_alias) {
                        return scope.device_dataseries && scope.device_settings && scope.device_dataseries[scope.device_settings.settings[ds_alias]]
                        && angular.isNumber(scope.device_dataseries[scope.device_settings.settings[ds_alias]].digits)
                            ? scope.device_dataseries[scope.device_settings.settings[ds_alias]].digits : 3;
                    };

                    scope.getDigitsByDSId = function (ds_id) {
                        return ds_id && scope.device_dataseries && scope.device_dataseries[ds_id] && angular.isNumber(scope.device_dataseries[ds_id].digits)
                            ? scope.device_dataseries[ds_id].digits : 3;
                    };

                    scope.getDSUnits = function (ds_alias) {
                        return scope.device_dataseries
                            && scope.device_settings
                            && scope.device_dataseries[scope.device_settings.settings[ds_alias]]
                            && scope.device_dataseries[scope.device_settings.settings[ds_alias]].irisUnit
                                ? scope.device_dataseries[scope.device_settings.settings[ds_alias]].irisUnit : "UNSPECIFIED";
                    };


                    scope.getDSValues = function (advance, is_update, show_loader) {
                        scope.lastUpdate = new Date();
                        is_update = is_update || false;
                        show_loader = (show_loader && show_loader == false) ? false : true; // default true
                        scope.device_settings_promise.then(function () {
                            if (!scope.device_settings || !scope.device_settings.settings) {
                                scope.ds_values = {};
                                return;
                            }
                            var dataseries = [];
                            var settings = scope.device_settings.settings;

                            //in ds filter each ds should be presented only once
                            var ds_ids = [];
                            var aliases = IrisSpoilManagementService.getSupportedDSAliases();
                            for (var i of aliases) {
                                if (settings[i] != null && ds_ids.indexOf(settings[i]) < 0) {
                                    ds_ids.push(settings[i]);
                                    dataseries.push({id: settings[i]});
                                }
                            }

                            if (!is_update && show_loader) iris.loader.start(element);
                            //if no advance is selected - request the last data for DS's - needed to show the last values for manual DS
                            if (angular.isUndefined(advance) || advance == null) {
                                var now = new Date();
                                scope.ds_values = {};
                                DataSeriesService.getValues({
                                    dataseries: angular.toJson(dataseries),
                                    'date-start': now,
                                    'date-end': now,
                                    project: scope.params.project_id,
                                    device: scope.params.device_id,
                                    'group-by': angular.toJson([{type: 'field', value: 'dataseriesId'}])
                                }).then(function (result) {
                                    delete result[""];

                                    scope.ds_values = {
                                        "last": result
                                    };

                                    iris.loader.stop();
                                });
                                return;
                            }

                            // todo take real advance - 10 (from list), not calculated
                            // 11 means that we take 10 to show on the bar chart and one current/selected on the line chart
                            // First requesting data for current advance for all necessary DS's
                            var requestFilter = {
                                dataseries: angular.toJson(dataseries),
                                'advance-start': advance,
                                'advance-end': advance,
                                project: scope.params.project_id,
                                device: scope.params.device_id,
                                'exclude-fields': angular.toJson(['grouped', 'projectId', 'deviceId', 'id', 'unit', 'dataseriesId']),
                                'group-by': angular.toJson([{type: 'advance'}, {type: 'field', value: 'dataseriesId'}])
                            };

                            //Commented relating to IRIS-1904
                            /*if(!settings.is_dry_mass_calculated) {
                                requestFilter['compression-intervals'] = 1000;
                            }*/

                            DataSeriesService.getValues(requestFilter).then(function (result) {
                                delete result[""];

                                //For dry mass and volume we have only flow (speed of excavation) - the code below calculates the sum to show on chart
                                // IRIS-1531 - Apply flow calculation only if this set up in settings
                                if (result && result[advance]
                                    && result[advance][settings.current_stroke_ds]
                                    && result[advance][settings.current_stroke_ds].length
                                    && settings.is_dry_mass_calculated) {

                                    var n = result[advance][settings.current_stroke_ds].length - 1;

                                    if (result[advance][settings.current_dry_mass_ds]) {
                                        IrisSpoilManagementService.prepareFlowVals(result[advance][settings.current_dry_mass_ds], result[advance][settings.current_stroke_ds][n].dateEnd);
                                    }

                                    //commented due to IRIS-1034
                                    /*if(result[advance][settings.current_volume_ds]){
                                     IrisSpoilManagementService.prepareFlowVals(result[advance][settings.current_volume_ds],result[advance][settings.current_stroke_ds][n].dateEnd);
                                     }*/
                                }

                                //If update - check does the values changed and if so - update ds_values and broadcast down to charts the event to redraw charts
                                if (is_update) {
                                    if (angular.isUndefined(scope.ds_values[advance])) scope.ds_values[advance] = {};
                                    if (result && result[advance]) {
                                        var is_vals_changed = false;
                                        is_vals_changed += IrisSpoilManagementService.updateDSValues(advance, scope.ds_values, result[advance], settings.range_ds);

                                        is_vals_changed += IrisSpoilManagementService.updateDSValues(advance, scope.ds_values, result[advance], settings.mass_alarm_ds);

                                        is_vals_changed += IrisSpoilManagementService.updateDSValues(advance, scope.ds_values, result[advance], settings.current_stroke_ds);

                                        is_vals_changed += IrisSpoilManagementService.updateDSValues(advance, scope.ds_values, result[advance], settings.current_dry_mass_ds);

                                        is_vals_changed += IrisSpoilManagementService.updateDSValues(advance, scope.ds_values, result[advance], settings.current_volume_ds);

                                        is_vals_changed += IrisSpoilManagementService.updateDSValues(advance, scope.ds_values, result[advance], settings.target_dry_mass_ds);

                                        is_vals_changed += IrisSpoilManagementService.updateDSValues(advance, scope.ds_values, result[advance], settings.target_volume_ds);

                                        is_vals_changed += IrisSpoilManagementService.updateDSValues(advance, scope.ds_values, result[advance], settings.dry_mass_condensed_ds);

                                        is_vals_changed += IrisSpoilManagementService.updateDSValues(advance, scope.ds_values, result[advance], settings.volume_condensed_ds);

                                        if (is_vals_changed) {
                                            scope.$broadcast('spoilmgt.values_changed');
                                        }
                                    }
                                    iris.loader.stop();
                                } else {
                                    scope.ds_values = result;

                                    // Then request data only for condensed DS's - for the bar charts

                                    dataseries = [];
                                    if (settings.dry_mass_condensed_ds) dataseries.push({id: settings.dry_mass_condensed_ds});
                                    if (settings.volume_condensed_ds) dataseries.push({id: settings.volume_condensed_ds});
                                    if (settings.current_stroke_ds) dataseries.push({id: settings.current_stroke_ds});
                                    if (!dataseries.length) {
                                        iris.loader.stop();
                                        return;
                                    }

                                    var advanceStart = getAdvanceName(advance, false);
                                    var advanceEnd = getAdvanceName(advance, true);

                                    console.log(advanceStart, advanceEnd, scope.params.advancesForBars, scope.device.advances);

                                    if(!advanceStart && advanceStart!=0 || !advanceEnd && advanceEnd!=0) {
                                        scope.params.averageDryMass = null;
                                        scope.params.averageVolume = null;
                                        scope.params.averageDeltaStroke = null;
                                        iris.loader.stop();
                                        return;
                                    }

                                    DataSeriesService.getValues({
                                        dataseries: angular.toJson(dataseries),
                                        'advance-start': advanceStart,
                                        'advance-end': advanceEnd,
                                        project: scope.params.project_id,
                                        device: scope.params.device_id,
                                        'only-last': true,
                                        'exclude-fields': angular.toJson(['grouped', 'projectId', 'deviceId', 'id', 'unit', 'dataseriesId']),
                                        'group-by': angular.toJson([{type: 'advance'}, {
                                            type: 'field',
                                            value: 'dataseriesId'
                                        }])
                                    }).then(function (result) {
                                        delete result[""];

                                        for (var i in result) {
                                            if (+i != +advance) {
                                                scope.ds_values[i] = result[i];
                                            }
                                        }

                                        scope.params.averageDryMass = null;
                                        scope.params.averageVolume = null;
                                        scope.params.averageDeltaStroke = null;
                                        var bars = (scope.params.advancesForBars || []).map(advance => advance.name);

                                        if(bars.length) {
                                            var averageDryMass = null;
                                            var averageVolume = null;
                                            var averageDeltaStroke = null;
                                            for (var next of bars) {
                                                if(scope.params.showAverageDryMass && settings.dry_mass_condensed_ds) {
                                                    averageDryMass += result[next]
                                                        && result[next][settings.dry_mass_condensed_ds]
                                                        && result[next][settings.dry_mass_condensed_ds][0]
                                                        && result[next][settings.dry_mass_condensed_ds][0].value || 0;
                                                }

                                                if(scope.params.showAverageVolume && settings.volume_condensed_ds) {
                                                    averageVolume += result[next]
                                                        && result[next][settings.volume_condensed_ds]
                                                        && result[next][settings.volume_condensed_ds][0]
                                                        && result[next][settings.volume_condensed_ds][0].value || 0;
                                                }

                                                if((scope.params.showAverageDryMass || scope.params.showAverageVolume) && settings.current_stroke_ds) {
                                                    averageDeltaStroke += result[next]
                                                        && result[next][settings.current_stroke_ds]
                                                        && result[next][settings.current_stroke_ds][0]
                                                        && result[next][settings.current_stroke_ds][0].value || 0;
                                                }
                                            }
                                            scope.params.averageDryMass = averageDryMass / bars.length;
                                            scope.params.averageVolume = averageVolume / bars.length;
                                            scope.params.averageDeltaStroke = averageDeltaStroke / bars.length;
                                        }

                                        scope.$broadcast('spoil.data.loaded');

                                        iris.loader.stop();
                                    })
                                }
                            });


                        })
                    };

                    scope.getDSValue = function (ds) {
                        var advance = scope.params.advance;
                        var settings = scope.device_settings && scope.device_settings.settings && scope.device_settings.settings[ds]
                            ? scope.device_settings.settings[ds] : null;

                        if (!scope.ds_values || !settings) return null;

                        // if no advance selected - take from the "last"
                        if (angular.isUndefined(advance) || advance == null) {
                            advance = "last";
                        }

                        if (!scope.ds_values[advance] || !scope.ds_values[advance][settings]) return null;

                        var num_of_vals = scope.ds_values[advance][settings].length;
                        if (num_of_vals == 0) return null;

                        var value = scope.ds_values[advance][settings][num_of_vals - 1].value;
                        if (!value && value != 0) value = null;

                        return value;
                    };

                    scope.getDSEndDate = function (ds) {
                        var advance = scope.params.advance;
                        var settings = scope.device_settings && scope.device_settings.settings && scope.device_settings.settings[ds]
                            ? scope.device_settings.settings[ds] : null;

                        if (!scope.ds_values || !settings) return null;

                        // if no advance selected - take from the "last"
                        if (angular.isUndefined(advance) || advance == null) {
                            advance = "last";
                        }

                        if (!scope.ds_values[advance] || !scope.ds_values[advance][settings]) return null;

                        var num_of_vals = scope.ds_values[advance][settings].length;
                        if (num_of_vals == 0) return null;

                        var endDate = scope.ds_values[advance][settings][num_of_vals - 1].dateEnd || scope.ds_values[advance][settings][num_of_vals - 1].date;
                        if (!endDate) endDate = null;

                        return new Date(endDate);
                    };

                    scope.openConfigModal = function () {
                        var device_id = scope.device_settings.id ? scope.device_settings.deviceId : null;
                        GlobalSettingsService.openEditModuleSettings('spoil-mgt', 'spoil-management', device_id, null, 'md').then(function (settings) {
                            scope.device_settings = settings;
                            scope.params.barsAmount = defineBarsAmount(settings.settings);
                            scope.params.showAverageDryMass = settings.settings.show_average_dry_mass;
                            scope.params.showAverageVolume = settings.settings.show_average_volume;
                            scope.getDSValues(scope.params.advance);
                            scope.params.show_calibration_factors = settings.settings.bentonite_calibration_factor_ds
                                || device_settings.settings.soil_calibration_factor_ds ? 1 : 0;
                        })
                    };

                    scope.pdfUrl = null;

                    scope.$watch('params', function (nv, ov) {
                        if (!nv || angular.equals(nv, ov) || !nv.project_id || !nv.device_id || !angular.isNumber(nv.advance)) return;

                        console.log(scope.params.date)
                        if (scope.params.date && scope.params.date.ring && scope.params.advance != scope.params.date.ring) {
                            scope.setAdvance(scope.params.date.ring);
                        }
                        IrisSpoilManagementService.generateUrl(
                            nv.project_id,
                            nv.device_id,
                            nv.advance).then(function (url) {
                                scope.pdfUrl = url;
                            });
                    }, true);


                }
            };
        });

})();

