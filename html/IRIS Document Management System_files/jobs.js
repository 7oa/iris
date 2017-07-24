(function () {

    irisAppDependencies.add('iris_jobs');

    angular.module('iris_jobs', []);

    angular.module('iris_jobs').factory('Jobs', ['$resource', function ($resource) {
        return $resource(iris.config.apiUrl + "/jobs/:moduleName/:entityName/:entityId/:id", {
            id: '@id',
            entityId: '@entityId',
            entityName: '@entityName',
            moduleName: '@moduleName'
        });
    }]);

    angular.module('iris_jobs').factory('JobsService', ['$filter', '$http', '$resource', 'Jobs',
        function ($filter, $http, $resource, Jobs) {
            return {
                getList: function (request_obj) {
                    return Jobs.query(request_obj);
                },

                create: function (params) {
                    return new Jobs(params)
                },

                save: function (job) {
                    return job.$save();
                },

                delete: function (job) {
                    return Jobs.delete(job);
                },

                testConnection: function (job) {
                    var request = {
                        method: 'POST',
                        url: iris.config.apiUrl + '/system/ftp/connection/test',
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json'
                        },
                        data: job.settings.connection
                    };
                    return $http(request);
                },

                testCronExpression: function (cronExpression) {
                    var request = {
                        method: 'POST',
                        url: iris.config.apiUrl + '/system/cron/expression/test',
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json'
                        },
                        data: cronExpression
                    };
                    return $http(request);
                }
            }
        }
    ]);

    angular.module('iris_jobs').directive('irisJobs', ['$translate', '$uibModal', 'JobsService',
        function ($translate, $uibModal, JobsService) {
            return {
                restrict: 'EA',
                scope: {},
                templateUrl: iris.config.componentsUrl + '/jobs/templates/jobs.list.html',
                link: function (scope, element, attrs) {
                    scope.jobs = [];
                    scope.request_object = {};

                    scope.init = function () {
                        scope.request_object = {
                            moduleName: attrs.moduleName,
                            entityName: attrs.entityName,
                            entityId: attrs.entityId,
                        };
                        scope.jobs = JobsService.getList(scope.request_object);
                    };

                    attrs.$observe('entityId', function (nv, ov) {
                        if (!nv) {
                            scope.jobs = [];
                        } else {
                            scope.init();
                        }
                    });

                    scope.deleteJob = function (job) {
                        JobsService.delete(job);
                        alertify.success($translate.instant('text.JobDeleted'));
                        scope.jobs.splice(scope.jobs.indexOf(job), 1);
                    }

                    scope.toggleActivation = function (job) {
                        if (job.activated) {
                            job.activated = false;
                            JobsService.save(job);
                            alertify.success($translate.instant('label.Deactivated'));
                        } else {
                            JobsService.testConnection(job).then(function success(response) {
                                if (response.data.success) {
                                    job.activated = true;
                                    JobsService.save(job);
                                    alertify.success($translate.instant('label.Activated'));
                                } else if (response.data.error) {
                                    job.activated = false;
                                    alertify.error(response.data.error);
                                }
                            });
                        }
                    }

                    scope.openJobSettingsModal = function (job) {
                        var isNew = false;
                        if (!job) {
                            isNew = true;
                            job = JobsService.create(scope.request_object);
                        }
                        $uibModal.open({
                            templateUrl: iris.config.componentsUrl + '/jobs/templates/job.edit.html',
                            controller: 'JobEditModalCtrl',
                            resolve: {
                                'job': () => job,
                                'timeType': () => attrs.timeType
                            }
                        }).result.then((res) => {
                                if (isNew) {
                                    scope.jobs.push(res);
                                }
                            });
                    };
                }
            };
        }
    ]);

    angular.module('iris_jobs').controller('JobEditModalCtrl',
        function ($scope, $uibModalInstance, $timeout, $translate, job, timeType, JobsService, ExportService, IrisTimeService) {

            $scope.job = job;
            $scope.timeType = timeType;

            $scope.dateFormats = IrisTimeService.getDateTimeFormats();
            $scope.timezones = IrisTimeService.getTimezones();
            $scope.exportFormats = ExportService.getExportFormats();
            var globalExportDefaults = ExportService.getExportDefaults();
            var dateFormat = iris.config.me.profile.dateTimeFormatId ?
                IrisTimeService.getDateTimeFormatById(iris.config.me.profile.dateTimeFormatId) : $scope.dateFormats[0];

            $scope.job.settings = $scope.job.settings ||
                {
                    connection: {
                        port: 21,
                        path: '/'
                    },
                    export: {
                        timezone: iris.config.timezone,
                        dateFormat: dateFormat.momentjsFormatString,
                        decimalSeparator: globalExportDefaults.decimalSeparator || '.',
                        separator: globalExportDefaults.separator || ';'
                    },
                    data: {}
                };

            $scope.jobType;
            if ($scope.entityName == 'report' || $scope.job.entityName == 'report') {
                $scope.jobType = 'report';
                $scope.job.settings.export.format = 'PDF';
            } else {
                $scope.jobType = 'table';
            }

            $scope.parametersComplete = function () {
                return $scope.job.settings.connection.server && $scope.job.settings.connection.path && $scope.job.settings.connection.port && $scope.job.settings.connection.user && $scope.job.settings.connection.password;
            }

            $scope.connectionTested = $scope.job.activated;
            $scope.testConnection = function () {
                JobsService.testConnection($scope.job).then(function success(response) {
                    if (response.data.success) {
                        $scope.connectionTested = true;
                        alertify.success($translate.instant('label.Success'));
                    } else if (response.data.error) {
                        alertify.error(response.data.error);
                    }
                });
            }

            $scope.$watchCollection('job.settings.connection', function (newConnectionSettings, oldConnectionSettings) {
                if (oldConnectionSettings && !angular.equals(newConnectionSettings, oldConnectionSettings)) {
                    $scope.connectionTested = false;
                    $scope.job.activated = false;
                }
            });

            $scope.canSave = function () {
                return ($scope.connectionTested || !$scope.job.activated) && !$scope.forms.JobEditForm.$invalid
            }

            $scope.save = function () {
                var isNew = $scope.job.id;
                /* duration for data-period to ISO-format */
                if ($scope.job.settings.data.period) {
                    var duration = moment.duration($scope.job.settings.data.period);
                    if (moment.isDuration(duration)) {
                        $scope.job.settings.data.period = duration.toISOString();
                    } else {
                        delete $scope.job.settings.data.period;
                    }
                }
                JobsService.save($scope.job).then(function (job) {
                    alertify.success($translate.instant('text.JobSaved'));
                    $uibModalInstance.close($scope.job);
                });
            };

            /* VALIDATOR FUNCTIONS */

            const CRONEXPRESSION_REGEX_MINUTES = /^\*|[0-5]?[0-9]|\*\/[0-9]+$/;
            const CRONEXPRESSION_REGEX_HOURLY = /^\*|1?[0-9]|2[0-3]|\*\/[0-9]+$/;
            const CRONEXPRESSION_REGEX_DAILY = /^\*|[1-2]?[0-9]|3[0-1]|\*\/[0-9]+$/;
            const CRONEXPRESSION_REGEX_MONTHLY = /^\*|[0-9]|1[0-2]|\*\/[0-9]+|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec$/;
            const CRONEXPRESSION_REGEX_WEEKLY = /^\*|\*\/[0-9]+|[0-7]|sun|mon|tue|wed|thu|fri|sat$/;

            var cronExpressionValidatorMessage = '';
            $scope.cronValidator = () => {
                return isCronExpressionValid($scope.job.cron_expression);
            };

            function isCronExpressionValid(cronExpression) {
                cronExpressionValidatorMessage = '';
                if (cronExpression) {
                    var fields = cronExpression.split(" ");
                    if (fields.length != 5) {
                        cronExpressionValidatorMessage = "incorrect length";
                        return false;
                    }
                    if (!CRONEXPRESSION_REGEX_MINUTES.test(fields[0].trim())) {
                        cronExpressionValidatorMessage = "first field (minutes) incorrect";
                        return false;
                    }
                    if (!CRONEXPRESSION_REGEX_HOURLY.test(fields[1].trim())) {
                        cronExpressionValidatorMessage = "second field (hours) incorrect";
                        return false;
                    }
                    if (!CRONEXPRESSION_REGEX_DAILY.test(fields[2].trim())) {
                        cronExpressionValidatorMessage = "third field (days) incorrect";
                        return false;
                    }
                    if (!CRONEXPRESSION_REGEX_MONTHLY.test(fields[3].trim())) {
                        cronExpressionValidatorMessage = "fourth field (months) incorrect";
                        return false;
                    }
                    if (!CRONEXPRESSION_REGEX_WEEKLY.test(fields[4].trim())) {
                        cronExpressionValidatorMessage = "fifth field (weekdays) incorrect";
                        return false;
                    }
                    return true;
                } else {
                    return false;
                }
            }
            const CRONEXPRESSION_HELP = "Cron-expression: Minutes Hours Days Months Weekdays";

            $scope.showCronExpressionValidatorMessage = function () {
                var modelValue = $scope.job.cron_expression;
                if (!isCronExpressionValid(modelValue)) {
                    var message = CRONEXPRESSION_HELP + "<br/>" + cronExpressionValidatorMessage;
                    alertify.alert(message, function (e) {
                        console.log(e)
                    });
                } else {
                    JobsService.testCronExpression(modelValue).then(function success(response) {
                        if (response.data.success) {
                            var result = JSON.parse(response.data.result);
                            var datePattern = $scope.job.settings.export.dateFormat;
                            var nextExecutions = '';
                            result.forEach(date => {
                                nextExecutions += ('<br/>' + moment(date).format(datePattern));
                            });
                            alertify.alert("Next execution: " + nextExecutions, function (e) {
                                console.log(e)
                            });
                        } else {
                            alertify.error("Pattern " + modelValue + " cannot be parsed.", modelValue);
                        }
                    });
                }
            }

            $scope.ipv4Validator = function () {
                var modelValue = $scope.job.settings.connection.host;
                if (!(modelValue)) return true;
                var fields = modelValue.split(".");
                if (fields.length != 4) {
                    console.log("incorrect length");
                    return false;
                }
                for (var i = 0; i < 4; i++) {
                    var num = +fields[i].trim();
                    if (!num || (num < 0) || (num > 255)) {
                        console.log("wrong field at " + (i + 1));
                        return false;
                    }
                }
                return true;
            };

            const ASCII_REGEX = /^[\x00-\x7F]*$/;

            $scope.pathValidator = function () {
                var modelValue = $scope.job.settings.connection.path;
                if (!(modelValue)) return true;
                var fields = modelValue.split("\/");
                var result = true;
                fields.forEach(str => {
                    if (!ASCII_REGEX.test(str)) {
                        console.log("invalid at " + str);
                        result = false;
                    }
                });
                return result;
            };

            var timeDurationValidatorMessage = '';

            $scope.cronValidator = () => {
                return isCronExpressionValid($scope.job.cron_expression);
            };

            $scope.timeDurationValidator = function() {
                return isTimeDurationExpressionValid($scope.job.settings.data.period);
            }

            function isTimeDurationExpressionValid(expression) {
                timeDurationValidatorMessage = '';
                if (expression) {
                    // @see:  http://momentjs.com/docs/durations/
                    var duration = moment.duration(expression);
                    if (duration && duration.asMinutes() > 0) {
                        timeDurationValidatorMessage = "Duration: "
                            + duration.years() + " years, "
                            + duration.months() + " months, "
                            + duration.days() + " days, "
                            + duration.hours() + " hours, "
                            + duration.minutes() + " minutes.";
                    } else {
                        timeDurationValidatorMessage = "Not valid duration: " + expression;
                        return false;
                    }
                    return true;
                } else {
                    return false;
                }
            }

            const TIMEDURATION_EXPRESSION_HELP = "Time-duration expression: ISO 8601 e.g. 'PnYnMnDTnHnMnS' or 'PnW'";

            $scope.showTimeDurationValidatorMessage = function() {
                var modelValue = $scope.job.settings.data.period;
                if (!isTimeDurationExpressionValid(modelValue)) {
                    var message = TIMEDURATION_EXPRESSION_HELP + "<br/>" + timeDurationValidatorMessage;
                    alertify.alert(message, function (e) {
                        console.log(e)
                    });
                } else {
                    alertify.alert(timeDurationValidatorMessage, function (e) {
                        console.log(e)
                    });
                }

            }
        })
})();