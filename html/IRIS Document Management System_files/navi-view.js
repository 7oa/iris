(function () {

    'use strict';

    angular.module('iris_navi_view').factory('NaviData', function ($resource) {
        return $resource(iris.config.apiUrl + "/tunneling/projects/:project_id/devices/:device_id/:action", {
            project_id: '@project_id',
            device_id: '@device_id',
            action: '@action'
        }, {
            getNaviData: {
                method: "GET",
                params: {action: 'navigation-data'}
            },
            getBoundaries: {
                method: "GET",
                params: {action: 'boundaries'}
            }
        });
    });

    angular.module('iris_navi_view').directive('irisNaviView', function ($timeout, $interval, $window, $filter, $translate,
                                                                         DevicesService, ProjectsService, IrisNaviViewService,
                                                                         UserSettingsService, ProjectSettingsService, NaviConfigService,
                                                                         DeviceSettingsService, IrisUnitsService) {
            return {
                restrict: 'EA',
                scope: {
                    params: '=',
                    widget: '='
                },
                templateUrl: iris.config.widgetsUrl + '/iris-navi-view/templates/iris-navi-view.view.html',
                link: function (scope, element, attrs) {
                    scope.show_controls = scope.$eval(attrs.showControls) || false;

                    scope.steps = {};
                    UserSettingsService.getUserSettingsById('steps', currentUserId).then(function (settings) {
                        scope.steps = settings;
                    });

                    scope.devices = [];
                    DevicesService.getDevices().$promise.then(function (devices) {
                        scope.devices = devices;
                    });

                    scope.projects = [];
                    ProjectsService.getProjects().$promise.then(function (projects) {
                        scope.projects = projects;
                    });

                    //console.log('params:',scope.params);
                    scope.controls = {
                        date: scope.params.date && scope.params.date.date ? new Date(scope.params.date.date) : new Date(),
                        chainage: 0,
                        advance: 0,
                        tunnelmeter: 0
                    };

                    scope.$on('user-settings.steps.updated', function (event, new_settings) {
                        //console.log('steps updated', new_settings);
                        if (scope.steps.userId == new_settings.userId)
                            scope.steps = new_settings;
                    });

                    scope.isModelCorrect = function(model){
                        if(!model.referencePointFront || !model.referencePointRear || !model.referencePointCenter && !model.isTwoPointMachine)
                            return false;

                        if(!model.machinePoint0 || !model.machinePoint1 || (!model.machinePoint2 || !model.machinePoint3) && !model.isTwoPointMachine)
                            return false;

                        return true;
                    };

                    scope.setDevice = function (id) {
                        //console.log('device', id);
                        if(!id){
                            scope.navi_view = {
                                is_shown: false
                            };
                            return;
                        }

                        scope.device = DevicesService.getById(+id);
                        scope.navi_view = IrisNaviViewService.createNaviView(scope.params.project_id, +id);

                        //if no Navi view was created because of missing parameters - show error message
                        if(!scope.navi_view) {
                            scope.navi_view = {
                                is_shown: false
                            };
                            return;
                        }

                        scope.params.device_id = id;
                        scope.navi_view.model.$promise.then(function (data) {
                            if(!scope.isModelCorrect(data)){
                                alertify.error($translate.instant('text.WrongNaviSensorsConfig'));
                                scope.navi_view.is_shown = false;
                                return;
                            }
                            scope.navi_view.is_shown = true;
                            scope.navi_view_arrow_config = {};
                            DeviceSettingsService.getDeviceSettingsById('arrow',id).then(function (config) {
                                scope.navi_view_arrow_config = config.settings;
                                scope.updatePaperPlane(data);
                            })
                        });

                        scope.navi_view.boundaries.$promise.then((boundaries) => {
                            var maxDate = new Date(boundaries.endDate);
                            var minDate = new Date(boundaries.startDate);

                            var paramsDate = scope.params.date && scope.params.date.date ? new Date(scope.params.date.date) : new Date;
                            if(paramsDate < minDate) paramsDate = minDate;
                            if(paramsDate > maxDate) paramsDate = maxDate;

                            scope.controls.date = new Date(paramsDate);
                            scope.controls.advance = boundaries.endAdvance;

                            //first get digits configuration then apply digits to values
                            scope.navi_view.model.$promise.then(function (data) {
                                scope.controls.chainage = boundaries.endChainage = IrisNaviViewService.toDigits(boundaries.endChainage, data.settings.digitsForChainage);
                                scope.controls.tunnelmeter = boundaries.endTunnelMeter = IrisNaviViewService.toDigits(boundaries.endTunnelMeter, data.settings.digitsForChainage);
                            });
                        });

                        scope.navi_config = null;
                        NaviConfigService.getAll().$promise.then(function () {
                            scope.navi_config = NaviConfigService.getByDeviceId(id);
                        });
                    };

                    scope.setProject = function (id) {
                        //console.log('project', id);
                        id = id || scope.params.project_id || selectedProjectId;
                        if(!id) return;
                        scope.project = ProjectsService.getById(+id);
                        scope.params.project_id = id;
                        scope.timezone = scope.project.timeZone;
                        scope.units = {};
                        ProjectSettingsService.getProjectSettingsById('units', +id).then(function (units) {
                            var glob_units = IrisUnitsService.getUnits();

                            units.settings.digitsForDeviations = angular.isNumber(units.settings.digitsForDeviations) ? units.settings.digitsForDeviations
                                : glob_units[units.settings.unitForDeviations].digits;
                            units.settings.digitsForChainage = angular.isNumber(units.settings.digitsForChainage) ? units.settings.digitsForChainage
                                : glob_units[units.settings.unitForChainage].digits;
                            units.settings.digitsForAngle = angular.isNumber(units.settings.digitsForAngle) ? units.settings.digitsForAngle
                                : glob_units[units.settings.unitForAngle].digits;
                            units.settings.digitsForTendency = angular.isNumber(units.settings.digitsForTendency) ? units.settings.digitsForTendency
                                : glob_units[units.settings.unitForTendency].digits;

                            scope.units = units;
                        });
                        //check if current device is in project and if not - select the first from project
                        var project_devices = scope.project.devices;
                        var flag = false;
                        for (var i = 0, c = project_devices.length; i < c; i++) {
                            var device = project_devices[i];
                            if(device.id == scope.params.device_id) {
                                flag = true;
                                break;
                            }
                        }
                        if(!flag) scope.params.device_id = scope.project.devices.length ? scope.project.devices[0].id : null;
                        scope.setDevice(scope.params.device_id);
                    };
                    if(scope.params && scope.params.project_id) scope.setProject(scope.params.project_id);

                    scope.reference_types = IrisNaviViewService.getReferenceTypes();

                    (scope.setReferenceType = function (reference_type) {
                        scope.reference_type = reference_type;
                    })(scope.params.date && scope.params.date.date ? 'date' : scope.reference_types[0].type);

                    scope.updatePaperPlane = function (model) {
                        IrisNaviViewService.drawPaperPlane(model, scope, element);
                    };

                    scope.$watch(function(){
                        return scope.params;
                    },function(nv,ov){
                        if(angular.equals(nv,ov)) return;

                        if(nv.date && ov.date && nv.date.date != ov.date.date && nv.date.date){
                            //console.log('navi-view params $watch date',nv,ov);
                            scope.controls.date = new Date(nv.date.date);
                        }
                    },true);

                    // if user change from 1 paper plane to 2 - update paper plane
                    // because it changes the width of its container
                    var paper_plane_element = $(element).find('.navigation-view')[0];
                    scope.$watch(() => $(paper_plane_element).innerWidth(), (nv, ov) => {
                        if(!nv || nv==ov) return;
                        if(!scope.navi_view || !scope.navi_view.model) return;
                        scope.navi_view.model.$promise.then(function (data) {
                            scope.updatePaperPlane(data);
                        })
                    }, true);

                    scope.timeout = null;
                    element.on('$destroy', function() {
                        $interval.cancel(scope.timeout);
                    });
                },
                controller: ['$scope', 'UserSettingsService', '$interval',
                    function (scope,UserSettingsService, $interval) {
                        var removeTimeouts = function () {
                            $interval.cancel(scope.timeout);
                        };
                        var setDate = function(date){
                            if(angular.isDate(date)) return date;
                            return new Date(date);
                        };

                        var getBoundary = function (ref_type, is_min) {
                            var res = null;
                            var boundaries = scope.navi_view.boundaries;
                            if(ref_type == 'chainage') {
                                res = is_min ? boundaries.startChainage : boundaries.endChainage
                            } else if(ref_type == 'advance') {
                                res = is_min ? boundaries.startAdvance : boundaries.endAdvance
                            } else if(ref_type == 'tunnelmeter') {
                                res = is_min ? boundaries.startTunnelMeter : boundaries.endTunnelMeter
                            } else if (ref_type == 'date') {
                                res = is_min ? setDate(boundaries.startDate) : setDate(boundaries.endDate)
                            }
                            return res || 0;
                        };

                        var getStep = function (ref_type) {
                            //console.log(scope.steps);
                            return ref_type == 'date'
                                ? scope.steps.settings.timeStepInMinutes * 60 * 1000
                                : (scope.steps.settings[ref_type + 'StepInUnit'] || 1);
                        };

                        scope.next = function (is_back, is_take_last) {
                            is_take_last = is_take_last || false;
                            var ref_type = scope.reference_type;
                            var ref_value = getBoundary(ref_type,is_back);

                            // Get settings to use digits configuration
                            if(!scope.navi_view.model) return;
                            var settings = scope.navi_view.model.settings;

                            if (is_take_last) {
                                return scope.controls[ref_type] = ref_type != 'date' && IrisNaviViewService.isDigitsConversionNeeded(ref_type)
                                    ? IrisNaviViewService.toDigits(ref_value, settings.digitsForChainage)
                                    : ref_value;
                            }

                            var new_value = 0;
                            if(ref_type == 'date'){
                                new_value = new Date(scope.controls[ref_type].getTime() + (is_back ? -1 : +1) * getStep(ref_type));
                            }
                            else if (ref_type== 'chainage') {
                                if (scope.navi_view.boundaries.chainageDirection == 'ASC') {
                                    new_value = scope.controls[ref_type] + (is_back ? -1 : +1) * getStep(ref_type);
                                }
                                else {
                                    new_value = scope.controls[ref_type] + (is_back ? 1 : -1) * getStep(ref_type);
                                    scope.controls[ref_type] = is_back
                                        ? (new_value < ref_value ? new_value : ref_value)
                                        : (new_value > ref_value ? new_value : ref_value);

                                    // Use digits configuration
                                    return scope.controls[ref_type] = IrisNaviViewService.toDigits(scope.controls[ref_type], settings.digitsForChainage);
                                }
                            }
                            else {
                                new_value = scope.controls[ref_type] + (is_back ? -1 : +1) * getStep(ref_type);
                            }

                            scope.controls[ref_type] = is_back
                                ? (new_value < ref_value ? ref_value : new_value)
                                : (new_value > ref_value ? ref_value : new_value);

                            // Use digits configuration
                            if (ref_type != 'date' && IrisNaviViewService.isDigitsConversionNeeded(ref_type)) {
                                scope.controls[ref_type] = IrisNaviViewService.toDigits(scope.controls[ref_type], settings.digitsForChainage);
                            }

                            return scope.controls[ref_type];
                        };

                        var uploadData = function (params) {
                            if(!scope.navi_view.model) return;
                            var new_model = IrisNaviViewService.requestModel(scope.navi_view,params);
                            new_model.$promise.then(function(data){
                                //to avoid blinking when new data is equals to existing data
                                if(angular.equals(data, scope.navi_view.model)) return;

                                scope.navi_view.setModel(data);
                                if(!scope.isModelCorrect(data)){
                                    if(scope.navi_view.is_shown)
                                        alertify.error($translate.instant('text.WrongNaviSensorsConfig'));
                                    scope.navi_view.is_shown = false;
                                    return;
                                }
                                scope.navi_view.is_shown = true;
                                scope.updatePaperPlane(data);

                                // Update controls with current requested data result without updating the current selected ref_type
                                // which user enters manually
                                var settings = data.settings;
                                var ref_type = scope.reference_type;
                                if(ref_type != 'date') scope.controls.date = data.date;
                                if(ref_type != 'advance') scope.controls.advance = IrisNaviViewService.toDigits(data.advance, 0);
                                if(ref_type != 'chainage') scope.controls.chainage = IrisNaviViewService.toDigits(data.chainage, settings.digitsForChainage);
                                if(ref_type != 'tunnelmeter') scope.controls.tunnelmeter = IrisNaviViewService.toDigits(data.tunnelMeter, settings.digitsForChainage);
                            })
                        };

                        var user_settings_request;
                        var navi_view_user_settings;
                        var reloadData = function () {
                            if(!user_settings_request) {
                                user_settings_request = UserSettingsService.getUserSettingsById('update-frequency-navigation-view',currentUserId);
                            }
                            user_settings_request.then(function (user_settings) {
                                navi_view_user_settings = navi_view_user_settings || user_settings;

                                if (scope.reference_type == 'reload' && navi_view_user_settings.settings.updateFrequencyInSeconds > 0) {
                                    removeTimeouts();
                                    scope.timeout = $interval(() => {
                                        scope.controls.date = new Date();
                                        uploadData();
                                        reloadData();
                                    }, navi_view_user_settings.settings.updateFrequencyInSeconds * 1000);
                                }
                            });
                        };
                        scope.$on('user-settings.update-frequency-navigation-view.updated', function (event, new_settings) {
                            //console.log('frequency navi updated', new_settings);
                            navi_view_user_settings = new_settings;
                        });

                        var filter = {};

                        // watch changing reference type and this type's value
                        scope.$watch(function () {
                            filter.type = scope.reference_type;
                            filter.value = scope.controls[scope.reference_type];
                            return filter;
                        }, function (nv, ov) {
                            if (!nv) return;

                            var params = {};
                            if(nv.type != 'reload') {
                                params[nv.type] = nv.value;
                                removeTimeouts();
                                uploadData(params);
                            } else {
                                scope.controls.date = new Date();
                                uploadData();
                                reloadData();
                            }
                        },true);
                    }
                ]
            };
        });

    angular.module('iris_navi_view').factory('NaviView',
        function () {

            var NaviView = function (project_id, device_id) {
                this.project_id = project_id;
                this.device_id = device_id;
                this.model = null;
                this.boundaries = null;

                this.setModel = function (model) {
                    this.model = model;
                };
                this.setBoundaries = function (boundaries) {
                    //todo let API return date in correct format 'yyyy-MM-dd HH:ss'
                    boundaries.$promise.then(function(){
                        boundaries.endDate = boundaries.endDate ? boundaries.endDate : new Date();
                    });
                    this.boundaries = boundaries;
                }
            };

            return NaviView;
        });

})();
