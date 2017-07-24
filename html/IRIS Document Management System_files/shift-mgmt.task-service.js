(function() {
    'use strict';

    const module = angular.module('iris_shiftmgmt_service');

    module.factory('ShiftTask', function($resource) {
        return $resource(`${iris.config.apiUrl}/shift/task/:id/:action/:paramId`, {
            id: '@id',
            paramId: '@paramId',
            targetOpStateId: '@targetOpStateId'
        }, {
            get: {isArray: false},
            splitToCPM: {params: {action: 'splitforcpmcompliance'}, method: 'PUT'},
            merge: {params: {action: 'merge'}, method: 'POST'},
            copy: {params: {action: 'copytoopstate'}, method: 'POST'},
            restore: {params: {action: 'restore'}, method: 'POST'},
            remove: {params: {action: 'delete'}, method: 'POST'},
            getComments: {isArray: true, params: {action: 'comments'}, method: 'GET'},
            saveComment: {isArray: false, params: {action: 'comment'}, method: 'POST'},
            adapt: {isArray: false, params: {action: 'adapt'}, method: 'POST'}
        })
    });

    module.factory('ShiftTaskService', function(ShiftTask) {

        return {
            updateTask(task, protocolId, affectedTaksIds, ignoreOverlaps) {
                const operationState = task.row.model;
                const to = task.model.to.toDate();
                const from = task.model.from.toDate();
                const id = task.model.data ? task.model.id : null;

                return ShiftTask.save({ affectedTaksIds, ignoreOverlaps }, {
                    startTime: from,
                    endTime: to,
                    id,
                    opStateId: operationState.id,
                    critical: task.model.data && task.model.data.critical,
                    protocolId
                }).$promise
            },

            restoreTask(task, protocolId) {
                const operationState = task.row.model;
                const to = task.model.to.toDate();
                const from = task.model.from.toDate();
                const id = task.model.data ? task.model.id : null;

                return ShiftTask.restore({
                    startTime: from,
                    endTime: to,
                    deleted: false,
                    id,
                    opStateId: operationState.id,
                    critical: task.model.data && task.model.data.critical,
                    protocolId
                }).$promise
            },

            getTask(id) {
                return ShiftTask.get({id}).$promise;
            },

            removeTasks: (tasks) => {
                if (!tasks.length) {
                    return;
                }
                const id = new Set();
                tasks.forEach((t) => id.add(t.model.id));
                return ShiftTask.remove(id).$promise;
            },

            splitToCPM: (task) => {
                return ShiftTask.splitToCPM(task).$promise;
            },

            merge: (tasks) => {
                const id = new Set();
                tasks.forEach((t) => { id.add(t.model.id) });
                return ShiftTask.merge(id).$promise;
            },

            copy: (tasks, rowId) => {
                const id = new Set();
                tasks.forEach((t) => { id.add(t.model.id) });
                return ShiftTask.copy({targetOpStateId: rowId}, id).$promise
            },

            getComments(id) {
                return ShiftTask.getComments({id}).$promise
            },

            saveComment(taskId, text, publicComment) {
                return ShiftTask.saveComment({text, publicComment, taskId}).$promise
            },

            adapt(task1, task2) {
                return ShiftTask.adapt({id: task1.model.id, paramId: task2.model.id}).$promise
            },

            exportCSV(query) {
                const encodedJson = window.encodeURIComponent(angular.toJson(query));
                window.location.href = `${iris.config.apiUrl}/reporting/shifttask/export?query=${encodedJson}&token=${iris.config.accessToken}`
            }
        }
    })
})();