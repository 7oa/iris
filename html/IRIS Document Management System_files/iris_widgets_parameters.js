(function () {
    angular.module('irisWidgetParameters', ['iris_utils']);
//      $translate.instant('label.widget.time.type.any'),
    angular.module('irisWidgetParameters').factory('WidgetParameterService', ['DevicesService', '$translate',
        function (DevicesService,$translate) {
            var parameters = {
                'date': {
                    model: 'date',
                    label: $translate.instant('label.widget.time.type.date'),
                    is_required: true,
                    type: 'date',
                    icon: 'fa-calendar',
                    date: {
                        date_type: 'date',
                        date: null,
                        ring: 0,
                        chainage: 1000
                    }
                },

                'period': {
                    model: 'period',
                    label: $translate.instant('label.widget.time.type.period'),
                    type: 'period',
                    icon: 'fa-calendar-o',
                    period: {
                        period_type: 'date',
                        date_start: null,
                        date_end: null,
                        ring_start: 0,
                        ring_end: 10,
                        chainage_start: 0,
                        chainage_end: 1000
                    },
                    controllers: {
                        'view': 'IWPPeriodCtrl',
                        'edit': 'IWPPeriodEditCtrl'
                    }
                },
                'project': {
                    label: 'Project',
                    model: 'project_id',
                    icon: 'fa-briefcase',
                    controllers: {
                        'view': 'IWPProjectCtrl',
                        'edit': 'IWPProjectCtrl'
                    }
                },
                'device': {
                    label: 'Device',
                    model: 'device_id',
                    icon: 'fa-subway',
                    controllers: {
                        'view': 'IWPDeviceCtrl',
                        'edit': 'IWPDeviceCtrl'
                    }
                },
                'project-device': {
                    label: 'Project device',
                    model: 'device_id',
                    icon: 'fa-subway',
                    depends: ['project'],
                    controllers: {
                        'view': 'IWPProjectDeviceViewCtrl',
                        'edit': 'IWPProjectDeviceEditCtrl'
                    }
                }
            };

            return {
                getParameters: function () {
                    return parameters;
                },

                getParameter: function (alias) {
                    return parameters[alias];
                },

                calcDatesParamsForTimeMismatch(widget, params, timeType) {
                    if(widget.directive == "iris-html") return;

                    var query = angular.copy(widget.settings.query);

                    if(!query){
                        console.log('Broken widget', widget, params, timeType);
                        return;
                    }

                    var targetTimeType = widget.settings.timeType;

                    if(query.timePeriodType != 'DATE') {
                        query.startDate = params[timeType] && (params[timeType].date || params[timeType].date_start) || params.date_start;
                        query.endDate = params[timeType] && params[timeType].date_end || params.date_end;
                    }

                    return DevicesService.getDeviceStateByQuery(params.device_id, params.project_id, query).then((state) => {
                        var oldParams = params[timeType];
                        if(targetTimeType == 'period') {
                            params.period = {
                                period_type: oldParams.period_type,
                                date_start: state.date,
                                ring_start: state.name,
                                chainage_start: state.chainage,
                                date_end: oldParams.date,
                                ring_end: oldParams.ring,
                                chainage_end: oldParams.chainage
                            }
                        } else {
                            params.date = {
                                period_type: oldParams.period_type,
                                date_start: state.start,
                                date: state.date,
                                date_end: state.end,
                                ring : state.name,
                                chainage: state.chainage
                            }
                        }
                    });
                },

                calcDatesParams: function (params) {
                    var promises = [];
                    var promise;
                    if(!params) return promises;
                    var device_id = params.device_id;
                    var project_id = params.project_id;

                    /*for(var i in params){
                        switch(params[i].model) {
                            case 'project_id' : project_id = params[i].project_id; break;
                            case 'device_id' : device_id = params[i].device_id; break;
                        }
                    }*/

                    if(!project_id || !device_id) return promises;

                    for(var i in params){
                        var p = params[i];
                        if (!p) {
                            continue;
                        }

                        switch(i) {
                            case 'period' :
                                /**
                                 date_start: 'today',
                                 date_end: 'today',
                                 ring_start: 0,
                                 ring_end: 10,
                                 chainage_start: 0,
                                 chainage_end: 1000
                                 */
                                if (p.period_type == 'chainage') {
                                    promise = DevicesService.getDeviceState(project_id,device_id,{chainage: p.chainage_start}).
                                        then(function(state){
                                            p.date_start = state.date;
                                            p.ring_start = state.name;
                                            p.chainage_start = state.chainage;
                                    });
                                    promises.push(promise);
                                    promise = DevicesService.getDeviceState(project_id,device_id,{chainage: p.chainage_end}).
                                        then(function(state){
                                            p.date_end = state.date;
                                            p.ring_end = state.name;
                                            p.chainage_end = state.chainage;
                                        });
                                    promises.push(promise);
                                } else if (p.period_type == 'ring' || p.period_type == 'advance') {
                                    promise = DevicesService.getDeviceState(project_id,device_id,{ring: p.ring_start}).
                                        then(function(state){
                                            p.date_start = state.start;
                                            p.ring_start = state.name;
                                            p.chainage_start = state.chainage;
                                        });
                                    promises.push(promise);
                                    promise = DevicesService.getDeviceState(project_id,device_id,{ring: p.ring_end}).
                                        then(function(state){
                                            p.date_end = state.end;
                                            p.ring_end = state.name;
                                            p.chainage_end = state.chainage;
                                        });
                                    promises.push(promise);
                                } else {

                                    promise = DevicesService.getDeviceState(project_id,device_id,{date: p.date_start}).
                                        then(function(state){
                                            p.ring_start = state.name;
                                            p.chainage_start = state.chainage;
                                        });
                                    promises.push(promise);
                                    promise = DevicesService.getDeviceState(project_id,device_id,{date: p.date_end}).
                                        then(function(state){
                                            p.ring_end = state.name;
                                            p.chainage_end = state.chainage;
                                        });
                                    promises.push(promise);
                                }
                                break;
                            case 'date' :
                                /**
                                 date: 'today',
                                 ring: 0,
                                 chainage: 1000
                                 */
                                if (p.date_type == 'chainage') {
                                    promise = DevicesService.getDeviceState(project_id,device_id,{chainage: p.chainage}).
                                        then(function(state){
                                            p.date_start=state.start;
                                            p.date = state.date;
                                            p.date_end=state.end;
                                            p.ring = state.name;
                                            p.chainage = state.chainage;
                                        });
                                    promises.push(promise);
                                } else if (p.date_type == 'ring' || p.period_type == 'advance') {
                                    promise = DevicesService.getDeviceState(project_id,device_id,{ring: p.ring}).
                                        then(function(state){
                                            p.date_start=state.start;
                                            p.date = state.date;
                                            p.date_end=state.end;
                                            p.ring = state.name;
                                            p.chainage = state.chainage;
                                        });
                                    promises.push(promise);
                                } else {
                                    promise = DevicesService.getDeviceState(project_id,device_id,{date: p.date}).
                                        then(function(state){
                                            p.date_start=state.start;
                                            p.date = state.date;
                                            p.date_end=state.end;
                                            p.ring = state.name;
                                            p.chainage = state.chainage;
                                        });
                                    promises.push(promise);
                                }
                                break;
                        }
                    }

                    return promises;
                }
            }
        }
    ]);

    angular.module('irisWidgetParameters').directive('irisWidgetParameter', ['$compile', 'WidgetParameterService',
        function ($compile, WidgetParameterService) {
            return {
                restrict: 'EA',
                scope: {
                    parameter: '=',
                    widget: '='
                },
                link: function (scope, element, attrs) {
                    scope.templateUrl = iris.config.widgetsUrl + '/widget-parameters/' + scope.parameter.type + '.' + attrs.mode + '.html';

                    //Get widget type parameter
                    var w_parameter = WidgetParameterService.getParameter(scope.parameter.type);
                    w_parameter.controllers = w_parameter.controllers || [];

                    //Load dynamic controller for mode
                    var ctrl = w_parameter.controllers[attrs.mode];
                    ctrl = ctrl ? 'ng-controller="' + ctrl + '"' : '';

                    var editable = attrs.mode == 'view' && attrs.editable == 'true'
                        ? 'ng-click="openEditParam(parameter)"' : '';

                    var template = '<div ng-include="templateUrl" ' + ctrl + ' ' + editable + '></div>';

                    element.html($compile(template)(scope));
                },
                controller: ['$scope', '$uibModal',
                    function ($scope, $uibModal) {

                        //TODO define providing dependant parameters

                        $scope.close = function () {
                            $scope.modalInstance.close();
                        };

                        $scope.openEditParam = function () {
                            $scope.widgetParam = angular.copy($scope.parameter);
                            $scope.modalInstance = $uibModal.open({
                                templateUrl: iris.config.widgetsUrl + "/widget-parameters/widget-parameter.edit.html",
                                scope: $scope
                            });
                        };

                        $scope.save = function () {
                            angular.extend($scope.parameter, $scope.widgetParam);
                            $scope.close();
                        };
                    }
                ]
            }
        }
    ]);

    angular.module('irisWidgetParameters').controller('IWPDeviceCtrl', ['$scope', 'DevicesService',
        function ($scope, DevicesService) {
            $scope.devices = DevicesService.getDevices();
        }
    ]);

    angular.module('irisWidgetParameters').controller('IWPProjectCtrl', ['$scope', 'ProjectsService',
        function ($scope, ProjectsService) {
            $scope.projects = ProjectsService.getProjects();
        }
    ]);

    angular.module('irisWidgetParameters').controller('IWPProjectDeviceViewCtrl', ['$scope', 'ProjectsService', 'DevicesService',
        function ($scope, ProjectsService, DevicesService) {
            $scope.devices = DevicesService.getDevices();
        }
    ]);

    angular.module('irisWidgetParameters').controller('IWPProjectDeviceEditCtrl', ['$translate','$scope', 'ProjectsService',
        function ($translate, $scope, ProjectsService) {
            var project_id = null;
            var parameters = $scope.widget.parameters;
            $scope.project_devices = [];

            if (!$scope.widget) {
                alertify.error( $translate.instant('text.WidgetNotSpecified'));
                return;
            }

            for (var i in parameters) {
                if (parameters[i].type == 'project') {
                    project_id = parameters[i][parameters[i].model];
                    if (project_id) {
                        var project = ProjectsService.getById(project_id);
                        if(project) $scope.project_devices = project.devices;
                    }
                    break;
                }
            }
        }
    ]);

    angular.module('irisWidgetParameters').controller('IWPPeriodCtrl', ['$scope',
        function ($scope) {
        }
    ]);

    angular.module('irisWidgetParameters').controller('IWPPeriodEditCtrl', ['$scope',
        function ($scope) {

        }
    ]);
})();