(function() {

    'use strict';

    const module = angular.module('iris_gs_workshift_management_shift_model');

    module.factory('ProjectShiftModel', function($resource) {
        return $resource(`${iris.config.apiUrl}/shiftmanagement/shift-models/project/:projectId/:id`, {
            projectId: '@projectId',
            id: '@id'
        })
    });

    module.factory('BundleShiftModel', function($resource) {
        return $resource(`${iris.config.apiUrl}/shiftmanagement/shift-models/bundle/:bundleId`, {
            bundleId: '@bundleId'
        })
    });

    module.factory('ShiftModel', function($resource) {
        return $resource(`${iris.config.apiUrl}/shiftmanagement/shift-models/:action/:id`, {
            id: '@id',
            action: '@action'
        }, {
            query: {isArray: false}
        })
    });

    module.factory('ProjectShiftModelBundle', function($resource) {
        return $resource(`${iris.config.apiUrl}/shiftmanagement/shift-model-bundles/project/:projectId/:id`, {
            projectId: '@projectId',
            id: '@id'
        })
    });

    module.factory('ShiftModelBundle', function($resource) {
        return $resource(`${iris.config.apiUrl}/shiftmanagement/shift-model-bundles/:action/:id`, {
            id: '@id'
        }, {
            query: {isArray: false},
            changeOrder: {params: {action: 'change-order', id: null}, method: 'POST', isArray: true},
            setStartModel: {params: {action: 'set-start-model'}, method: 'POST', isArray: false}
        })
    });

    const TIME_FORMAT = 'HH:mm';

    function formatTime(hours, minutes) {
        return `${('0' + hours).slice(-2)}:${('0' + minutes).slice(-2)}`;
    }

    function getMinutes(time) {
        try {
            return moment.duration(time, TIME_FORMAT).asMinutes()
        } catch(all) {
            return 0
        }
    }

    function getTime(minutes) {
        try {
            var d = moment.duration(minutes, 'minutes');
            return moment()
                .minutes(d.minutes())
                .hours(d.hours())
                .format(TIME_FORMAT)
        } catch(all) {
            return '00:00'
        }
    }

    function getDuration(minutes) {
        try {
            var d = moment.duration(minutes, 'minutes');
            return formatTime(d.asHours(), d.minutes())
        } catch(all) {
            return '00:00'
        }
    }

    function setTimes(item) {
        item.startTime = getTime(item.start);
        item.durationTime = getDuration(item.duration)
    }

    function setMinutes(item) {
        item.start = getMinutes(item.startTime);
        item.duration = getMinutes(item.durationTime);
    }

    function extractDurationTimes(list) {
        let array = list.map((a) => {
            let start = moment(a[0], TIME_FORMAT);
            let minutes = getMinutes(a[1]);
            let end = angular.copy(start).add(minutes, 'minutes');
            return [start, end]
        });
        array.sort((a, b) => compareMillis(a[0], b[0]));
        return array.map((a) => [a[0].format(TIME_FORMAT), a[1].format(TIME_FORMAT)]);
    }

    function compareMillis(a, b) {
        if (a.toDate().getTime() < b.toDate().getTime()) return -1;
        if (a.toDate().getTime() > b.toDate().getTime()) return 1;
        return 0;
    }

    module.factory('ShiftTimeService', function(){
        return {
            formatTime,
            getMinutes,
            getTime,
            getDuration,
            setTimes,
            setMinutes,
            extractDurationTimes,
            compareMillis
        }
    });

    module.factory('ShiftModelService', function($filter, ProjectShiftModel, ShiftModel,
         ProjectShiftModelBundle, ShiftModelBundle, BundleShiftModel) {
        return {
            findAllByProject: (projectId) =>
                ProjectShiftModel.query({projectId: projectId}).$promise.then(function(items) {
                    items.forEach(setTimes);
                    return items
                }),

            findAllBundlesByProject: (projectId) =>
                ProjectShiftModelBundle.query({projectId: projectId}).$promise,

            findBundleById: (id) =>
                ShiftModelBundle.query({id}).$promise,

            findAllByBundleId: (bundleId) =>
                BundleShiftModel.query({bundleId}).$promise,

            saveBundle: (bundle) =>
                bundle.$save(),

            getById: (id) =>
                ShiftModel.query({id: id}).$promise.then(function(item) {
                    setTimes(item);
                    return item;
                }),

            save(model) {
                setMinutes(model);
                return model.$save()
            },

            createShiftModel: () =>
                new ProjectShiftModel(),

            createBundle: (projectId, bundleName) => {
                const bundle = new ProjectShiftModelBundle();
                bundle.title = bundleName;
                bundle.projectId = projectId;
                return bundle.$save();
            },

            remove(id) {
                return ShiftModel.delete({id}).$promise
            },
            removeBundle: (id) =>
                ShiftModelBundle.delete({id}).$promise,

            getBundleStartTime: (bundleShiftModels) => {
                if (bundleShiftModels.length > 0) {
                    return bundleShiftModels[0].startTime;
                } else {
                    return null;
                }
            },

            getBundleDuration: (bundleShiftModels) => {
                const durations = bundleShiftModels.map((m) => moment.duration(m.durationTime, TIME_FORMAT));
                const sum = moment.duration();
                durations.forEach((d) => sum.add(d));
                return formatTime(sum.asHours(), sum.minutes());
            },

            hasGapsInBundle: (bundleShiftModels) => {
                if (bundleShiftModels.length == 0) {
                    return true
                }

                var times = extractDurationTimes(
                    bundleShiftModels.map((m) => [m.startTime, m.durationTime]));

                for (var i = 1; i < times.length; i++) {
                    let prev = times[i - 1];
                    let current = times[i];
                    if (current[0] !== prev[1]) {
                        return true;
                    }
                }
                return times[0][0] !== times[times.length - 1][1];
            },

            setStartModelInBundle: (shiftModel) => {
                return ShiftModelBundle.setStartModel(shiftModel).$promise;
            },

            sortModels(startId, models) {
                if (!models.length) {
                    return
                }

                const result = [];

                let model = models.find((m) => m.id === startId);
                if (!model) {
                    model = models[0]
                }

                models.splice(models.indexOf(model), 1);
                result.push(model);

                let startTime = model.startTime;

                let findNearestStartDateModelId = (time) => {
                    const target = moment(time, TIME_FORMAT);
                    let minDiff = null;
                    let id = null;
                    const startDayMoment = moment('00:00', TIME_FORMAT);
                    const endDayMoment = moment('24:00', TIME_FORMAT);

                    models.forEach((m) => {
                        const startTime = moment(m.startTime, TIME_FORMAT);
                        let diff = startTime.diff(target);
                        if (diff < 0) {
                            diff = endDayMoment.diff(target) + startTime.diff(startDayMoment);
                        }

                        if (minDiff === null || minDiff > diff) {
                            minDiff = diff;
                            id = m.id;
                        }
                    });

                    return id;
                };

                while (models.length > 0) {
                    const id = findNearestStartDateModelId(startTime);
                    let index = models.findIndex((m) => m.id === id);
                    let model = models[index];
                    models.splice(index, 1);
                    result.push(model);
                }

                return result;
            }
        }
    })
})();