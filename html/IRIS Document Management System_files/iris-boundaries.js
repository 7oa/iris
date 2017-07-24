(function () {
    angular.module('iris_device_boundaries', []);

    angular.module('iris_device_boundaries').directive('irisBoundaries',
        function ($filter, $q, $translate, $controller, ProjectDeviceService, DevicesService,
                  IrisBoundariesService, ProjectsService, IrisNaviViewService, DataSeriesService,
                  ShiftService) {
            var promises = [];
            promises.push(ProjectDeviceService.getAllProjectDevices());


            return {
                restrict: 'EA',
                replace: true,
                scope: {
                    value: '=',
                    extTimeZone: '=timezone',
                    disabled: '=ngDisabled',
                    required: '=ngRequired',
                    projectDeviceId: '=projectDevice',
                    layout: '=layout',
                    exclude: '=exclude',
                    onUpdate: '&',
                    dsSelection: '=dsSelection',
                    api: '=?'
                },
                template: '<div ng-include="templateUrl"></div>',
                link: function (scope, element, attrs) {
                    scope.showRefreshButton = attrs.showRefreshButton != 'false';

                    if (scope.layout == 'vertical') {
                        scope.templateUrl = iris.config.componentsUrl + '/devices/directives/iris-boundaries-vertical.html';
                    } else {
                        scope.templateUrl = `${iris.config.componentsUrl}/devices/directives/iris-boundaries.html`;
                    }
                    scope.lastRequestDate = null;
                    scope.mode = attrs.mode || 'range';
                    scope.project_devices = [];
                    scope.project_device = null;
                    scope.reference_types = IrisBoundariesService.getReferenceTypes();
                    if (scope.exclude) {
                        scope.reference_types = scope.reference_types.filter((it) => scope.exclude.indexOf(it.type) < 0)
                    }
                    scope.filter = {};
                    scope.pdBoundaries = {};
                    scope.dsBoundaries = {};
                    scope.comfortOptions = {};
                    var showQuickSelect = angular.isDefined(attrs.showQuickSelect) ? attrs.showQuickSelect == 'true' : true; // default is true
                    var showJumpButtons = angular.isDefined(attrs.showJumpButtons) ? attrs.showJumpButtons == 'true' : true; // default is true
                    scope.comfortOptions.showJumpButtons = showJumpButtons;
                    scope.comfortOptions.showQuickSelect = scope.mode === 'specific' ? false : showQuickSelect;

                    function setTimeZone(tz) {
                        scope.timezone = !attrs.timezone ? tz : scope.extTimeZone;
                    }
                    setTimeZone(iris.config.timezone);

                    scope.setReferenceType = function (rt) {
                        scope.reference_type = rt;
                        scope.value.period_type = rt;
                    };

                    scope.setReferenceType('date');

                    scope.fetchDsBoundaries = function () {
                        var dsBounds = {
                            chainageMin: null,
                            chainageMax: null,
                            tunnelmeterMin: null,
                            tunnelmeterMax: null,
                            advanceMin: null,
                            advanceMax: null,
                            dateMin: null,
                            dateMax: null
                        };

                        if (scope.isDsBoundariesMode() && scope.dsSelection.length > 0) {
                            // because project device selection is not shown on date selection, project device id should be always undefined
                            var pDeviceId = scope.reference_type == 'date' ? undefined : scope.filter.projectDeviceId;
                            DataSeriesService.getLimits(pDeviceId, scope.dsSelection).then(limits => {
                                console.log('ds boundaries', limits);
                                dsBounds.chainageMin = +parseFloat(limits.minChainage).toFixed(3);
                                dsBounds.chainageMax = +parseFloat(limits.maxChainage).toFixed(3);
                                dsBounds.tunnelmeterMin = +parseFloat(limits.minTunnelMeter).toFixed(3);
                                dsBounds.tunnelmeterMax = +parseFloat(limits.maxTunnelMeter).toFixed(3);
                                dsBounds.advanceMin = limits.minAdvance;
                                dsBounds.advanceMax = limits.maxAdvance;
                                dsBounds.dateMin = limits.minDate ? new Date(limits.minDate) : null;
                                dsBounds.dateMax = limits.maxDate ? new Date(limits.maxDate) : null;
                                scope.dsBoundaries = dsBounds;
                            });
                        }
                    };

                    scope.isDsBoundariesMode = function() {
                        if (scope.dsSelection) {
                            return true;
                        }
                        return false;
                    };

                    scope.getBoundaries = function() {
                        if (scope.isDsBoundariesMode()) {
                            return scope.dsBoundaries;
                        }
                        return scope.pdBoundaries;
                    };

                    /**
                     * if the selected dataseries change, refetch the boundaries of the selected dataseries
                     */
                    scope.$watchGroup(['dsSelection', 'reference_type'], () => {
                        scope.fetchDsBoundaries();
                    });

                    var setPD = function (pdId) {
                        scope.project_device = null;

                        if(!pdId || !scope.project_devices.length) {
                            setTimeZone(iris.config.timezone);
                            scope.pdBoundaries = {};
                            return;
                        }

                        scope.project_device = $filter('filter')(scope.project_devices, {id: +pdId}, true)[0];

                        var project = ProjectsService.getProjectById(scope.project_device.projectId);
                        var device = DevicesService.getById(scope.project_device.deviceId);
                        setTimeZone(project.timeZone);

                        scope.pdBoundaries = {};
                        IrisNaviViewService.requestBoundaries({project_id: project.id, device_id: device.id}).$promise
                            .then(boundaries => {
                                scope.pdBoundaries = boundaries;
                                scope.reference_types.forEach(refType => {
                                    scope.pdBoundaries[refType.type + 'Min'] = getPdBoundary(refType.type, true);
                                    scope.pdBoundaries[refType.type + 'Max'] = getPdBoundary(refType.type, false);
                                });
                                console.log('pd boundaries', scope.pdBoundaries);
                            });

                        scope.requestDeviceStatus();
                    };

                    function getPdBoundary(referenceType, isMin) {
                        var res = null;
                        var boundaries = scope.pdBoundaries;
                        if(referenceType == 'chainage') {
                            res = isMin ? boundaries.startChainage : boundaries.endChainage
                        } else if(referenceType == 'advance') {
                            res = isMin ? boundaries.startAdvance : boundaries.endAdvance
                        } else if(referenceType == 'tunnelmeter') {
                            res = isMin ? boundaries.startTunnelMeter : boundaries.endTunnelMeter
                        }
                        return +parseFloat(res).toFixed(3) || 0;
                    }

                    scope.requestDeviceStatus = function (nv,ov) {
                        if(nv && ov && angular.equals(nv, ov)) return;

                        var pd = scope.project_device;
                        var ref_type = scope.reference_type;

                        if(!pd && ref_type!='date' || !scope.value) return;

                        var value_start = scope.value[ref_type + '_start'];
                        var value_end = scope.value[ref_type + '_end'];

                        if (!value_start && scope.mode == 'range' || !value_end) return;

                        //validations for 'date' type if mode is range
                        if(ref_type == 'date' && scope.mode == 'range'){
                            //date_start is in future
                            if(moment(value_start).unix() > moment().unix()) {
                                alertify.alert($translate.instant('label.SensorDataTable.DateStartInFuture')); return;
                            }
                            //date_start is after date_end
                            if(moment(value_start).unix() >= moment(value_end).unix()){
                                alertify.alert($translate.instant('label.SensorDataTable.DateStartAfterDateEnd'));
                                return;
                            }
                            //the difference between two times is less than one minute
                            var durationInSeconds = moment.duration(moment(value_end).diff(moment(value_start))).asSeconds();
                            if(durationInSeconds < 60){alertify.alert($translate.instant('label.SensorDataTable.StartEndDifferenceLessThanMinute')); return;}
                        }

                        var params_start = {}, params_end = {};
                        params_start[ref_type] = value_start;
                        params_end[ref_type] = value_end;

                        scope.lastRequestDate = new Date();

                        //If reference type is date - don't request boundaries
                        if(ref_type == 'date') {
                            scope.onUpdate({boundaries: scope.value});
                            return;
                        }

                        var promises = [];
                        if (scope.mode == 'range') promises.push(DevicesService.getDeviceState(pd.projectId, pd.deviceId, params_start));
                        promises.push(DevicesService.getDeviceState(pd.projectId, pd.deviceId, params_end));

                        $q.all(promises).then(result => {
                            var start = result[0];
                            var end = scope.mode == 'range' ? result[1] : result[0];

                            var values_copy = angular.copy(scope.value);

                            scope.value.date_start = start.start;
                            scope.value.advance_start = start.name;
                            scope.value.chainage_start = +parseFloat(start.chainage).toFixed(3);
                            scope.value.tunnelmeter_start = +parseFloat(start.tunnel).toFixed(3);
                            if (scope.mode == 'range') {


                                //Restore inputted by user data in case of empty incomming data
                                scope.value[ref_type + '_start'] = values_copy[ref_type + '_start'];
                            }

                            scope.value.date_end = end.end;
                            scope.value.advance_end = end.name;
                            scope.value.chainage_end = +parseFloat(end.chainage).toFixed(3);
                            scope.value.tunnelmeter_end = +parseFloat(end.tunnel).toFixed(3);

                            //Restore inputted by user data in case of empty incomming data
                            scope.value[ref_type + '_end'] = values_copy[ref_type + '_end'];
                            scope.onUpdate({boundaries: scope.value});
                        });
                    };

                    scope.api = scope.api || {};
                    scope.api.getBoundaries = scope.requestDeviceStatus;
                    scope.api.BoundariesForm = scope.api.BoundariesForm || {};

                    $q.all(promises).then(results => {
                        scope.project_devices = results[0];

                        scope.$watch('projectDeviceId', (nv) => {
                            scope.filter.projectDeviceId = nv;
                        });
                        scope.$watch('filter.projectDeviceId', pDeviceId => {
                            setPD(pDeviceId);

                            if (scope.dsSelection) {
                                scope.fetchDsBoundaries();
                            }

                            if(!pDeviceId && scope.reference_type!='date') {
                                scope.value[scope.reference_type + '_start'] = undefined;
                                scope.value[scope.reference_type + '_end'] = undefined;
                            }
                        });
                        scope.$watch('value', scope.requestDeviceStatus);
                    });

                    /**
                     * For Date
                     * @param days (size of jump)
                     * @param direction (-1: jump backwords, 1: jump forwards
                     */
                    scope.jumpDate = function (days, direction) {
                        if (scope.value.date_start) {
                            scope.value.date_start = new Date(new Date(scope.value.date_start).getTime() + ((days * 24 * 60 * 60 * 1000) * direction));
                        }
                        if (scope.value.date_end) {
                            scope.value.date_end = new Date(new Date(scope.value.date_end).getTime() + ((days * 24 * 60 * 60 * 1000) * direction));
                        }
                    };

                    /**
                     * For Advance
                     * @param step (size of jump)
                     * @param direction (-1: jump backwords, 1: jump forwards
                     */
                    scope.jumpAdvance = function (step, direction) {
                        if (scope.value.advance_start != null) {
                            scope.value.advance_start += (step * direction);
                        }
                        if (scope.value.advance_end != null) {
                            scope.value.advance_end += (step * direction);
                        }
                    };

                    /**
                     * For Tunnelmeter and chainage
                     * @param step (size of jump)
                     * @param direction (-1: jump backwords, 1: jump forwards
                     */
                    scope.jumpMeter = function (step, direction) {
                        var ref_type = scope.reference_type;
                        if (scope.value[ref_type + '_start'] != null) {
                            scope.value[ref_type + '_start'] = +parseFloat(scope.value[ref_type + '_start'] + (step * direction)).toFixed(3);
                        }
                        if (scope.value[ref_type + '_end'] != null) {
                            scope.value[ref_type + '_end'] = +parseFloat(scope.value[ref_type + '_end'] + (step * direction)).toFixed(3);
                        }
                    };

                    scope.selectLastDays = function (days) {
                        scope.value.date_start = new Date(new Date().getTime() - (days * 24 * 60 * 60 * 1000));
                        scope.value.date_end = new Date();
                    };

                    scope.selectLastRings = function (rings) {
                        var bounds = scope.getBoundaries();
                        var ref_type = scope.reference_type;
                        if (bounds[ref_type + 'Max'] != null) {
                            scope.value[ref_type + '_end'] = bounds[ref_type + 'Max'];
                            var newStart = bounds[ref_type + 'Max'] - rings;
                            if (newStart >= bounds[ref_type + 'Min']) {
                                scope.value[ref_type + '_start'] = newStart;
                            }
                            else {
                                scope.value[ref_type + '_start'] = bounds[ref_type + 'Min'];
                            }
                        }
                    };

                    scope.selectLastMeters = function (meters) {
                        var bounds = scope.getBoundaries();
                        var ref_type = scope.reference_type;
                        if (bounds[ref_type + 'Max'] != null) {
                            scope.value[ref_type + '_end'] = bounds[ref_type + 'Max'];
                            if (ref_type === 'chainage' && bounds.chainageDirection === 'DESC') {
                                var newStart = bounds[ref_type + 'Max'] + meters;
                                if (newStart <= bounds[ref_type + 'Min']) {
                                    scope.value[ref_type + '_start'] = newStart;
                                }
                                else {
                                    scope.value[ref_type + '_start'] = bounds[ref_type + 'Min'];
                                }
                            }
                            else {
                                var newStart = bounds[ref_type + 'Max'] - meters;
                                if (newStart >= bounds[ref_type + 'Min']) {
                                    scope.value[ref_type + '_start'] = newStart;
                                }
                                else {
                                    scope.value[ref_type + '_start'] = bounds[ref_type + 'Min'];
                                }
                            }
                        }
                    };

                    scope.projectDuration = function () {
                        var bounds = scope.getBoundaries();
                        var ref_type = scope.reference_type;
                        scope.value[ref_type + '_start'] = bounds[ref_type + 'Min'];
                        scope.value[ref_type + '_end'] = bounds[ref_type + 'Max'];
                    };

                    scope.$watch('project_device', () => {
                        if (scope.project_device) {
                            const projectId = scope.project_device.projectId;
                            ShiftService.findAllBundlesByProject(projectId)
                                .then((bundles) => {
                                    scope.shiftProtocol.bundles = bundles;
                                });
                        }
                    });

                    scope = angular.extend(scope, {
                        shiftProtocol: {
                            bundles: [],
                            protocols: [],

                            bundleSelected() {
                                const bundleId = scope.shiftProtocol.bundleId;
                                const projectId = scope.shiftProtocol.projectId || scope.filter.projectDeviceId;
                                ShiftService.findAllByProjectAndBundle(projectId, bundleId, 1000000000)
                                    .then(result => {
                                        scope.shiftProtocol.protocols = result;
                                    });
                            }
                        }
                    });
                }
            };
        });

    angular.module('iris_device_boundaries').factory('ProjectShiftModelBundle', function($resource) {
        return $resource(`${iris.config.apiUrl}/shiftmanagement/shift-model-bundles/project/:projectId/:id`, {
            projectId: '@projectId',
            id: '@id'
        })
    });

    angular.module('iris_device_boundaries').factory('ShiftProtocol', function ($resource) {
        return $resource(`${iris.config.apiUrl}/shift/protocol/:action`, {
            projectId: '@projectId',
            bundleId: '@bundleId'
        }, {
            findByProjectAndBundle: {isArray: true, params: {action: 'findByProjectAndBundle'}, method: 'GET'},
        });
    });

    angular.module('iris_device_boundaries').factory('ShiftService',
        function(ProjectShiftModelBundle, ShiftProtocol) {
            return {
                findAllBundlesByProject(projectId) {
                    return ProjectShiftModelBundle.query({projectId: projectId}).$promise
                },
                findAllByProjectAndBundle(projectId, bundleId, limit) {
                    return ShiftProtocol.findByProjectAndBundle({projectId, bundleId, limit}).$promise;
                },
            }
        }
    );

    angular.module('iris_device_boundaries').factory('IrisBoundariesService',
        function ($translate) {
            var reference_types = [{
                type: 'date',
                name: $translate.instant('label.Time'),
                order: 2,
                icon: 'fa-clock-o'
            }, {
                type: 'chainage',
                name: $translate.instant('label.Chainage'),
                order: 3,
                icon: 'fa-link'
            }, {
                type: 'advance',
                name: $translate.instant('label.Advance'),
                order: 4,
                icon: 'fa-circle-o-notch'
            }, {
                type: 'tunnelmeter',
                name: $translate.instant('label.Tunnelmeter'),
                order: 5,
                icon: 'fa-text-width'
            }, {
                type: 'protocol',
                name: $translate.instant('label.ShiftProtocol'),
                order: 5,
                icon: 'fa-gavel'
            }];

            return {
                getReferenceTypes: () => reference_types
            }
        });
})();