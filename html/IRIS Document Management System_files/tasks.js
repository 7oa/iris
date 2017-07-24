(function () {
    angular.module('iris_taskmanagement').factory('Tasks', function ($resource) {
        return $resource(iris.config.apiUrl + '/task-management/tasks/:id', {
            id: '@id'
        }, {
            getByFile: {
                method: 'GET',
                url: iris.config.apiUrl + '/task-management/tasks/by-file/:fileId',
                params: {
                    fileId: '@fileId'
                },
                isArray: true
            },
            toggleFollow: {
                method: 'POST',
                url: iris.config.apiUrl + '/task-management/tasks/:id/toggle-follow'
            },
            assignTo: {
                method: 'POST',
                url: iris.config.apiUrl + '/task-management/tasks/:id/assign-to/:userId',
                params: {
                    id: '@id',
                    userId: '@userId'
                }
            },
            addTag: {
                method: 'POST',
                url: iris.config.apiUrl + '/task-management/tasks/:id/tags/:tagId',
                params: {
                    id: '@id',
                    tagId: '@tagId'
                }
            },
            removeTag: {
                method: 'DELETE',
                url: iris.config.apiUrl + '/task-management/tasks/:id/tags/:tagId',
                params: {
                    id: '@id',
                    tagId: '@tagId'
                }
            },
            addFile: {
                method: 'POST',
                url: iris.config.apiUrl + '/task-management/tasks/:id/attachments/:fileId',
                params: {
                    id: '@id',
                    fileId: '@fileId'
                }
            },
            removeFile: {
                method: 'DELETE',
                url: iris.config.apiUrl + '/task-management/tasks/:id/attachments/:fileId',
                params: {
                    id: '@id',
                    fileId: '@fileId'
                }
            },
            setState: {
                method: 'POST',
                url: iris.config.apiUrl + '/task-management/tasks/:id/set-state/:workflowStateAlias?processResolution=:processResolution',
                params: {
                    id: '@id',
                    workflowStateAlias: '@workflowStateAlias',
                    processResolution: '@processResolution'
                }
            },
            getReminders: {
                method: 'GET',
                url: iris.config.apiUrl + '/task-management/tasks/:taskId/reminders',
                params: {
                    taskId: '@taskId'
                },
                isArray: true
            },
            getReminder: {
                method: 'GET',
                url: iris.config.apiUrl + '/task-management/tasks/:taskId/reminders/:id',
                params: {
                    taskId: '@taskId',
                    id: '@id'
                }
            },
            addReminder: {
                method: 'POST',
                url: iris.config.apiUrl + '/task-management/tasks/:taskId/reminders',
                params: {
                    taskId: '@taskId',
                    id: '@id'
                }
            },
            deleteReminder: {
                method: 'DELETE',
                url: iris.config.apiUrl + '/task-management/tasks/:taskId/reminders/:id',
                params: {
                    taskId: '@taskId',
                    id: '@id'
                }
            },
            getHistory: {
                method: 'GET',
                url: iris.config.apiUrl + '/task-management/tasks/:taskId/history',
                params: {
                    taskId: '@taskId'
                },
                isArray: true
            }
        });
    });

    angular.module('iris_taskmanagement').factory('TasksPriority', function ($resource) {
        return $resource(iris.config.apiUrl + '/task-management/priorities');
    });

    angular.module('iris_taskmanagement')
        .factory('TasksService', function ($translate, Tasks, TasksPriority, $filter, UserGroupsService, $q) {
            const today = new Date();

            const taskQuickFilters = [
                { alias: "all", label: $translate.instant('label.tm.AllTasks'), iconClass: "fa-bars", filter: null },
                { alias: "assignedToMe", label: $translate.instant('label.tm.AssignedToMe'), iconClass: "fa-user", filter: [{f: "assigneeId", v: [iris.config.me.id]}] },
                { alias: "createdByMe", label: $translate.instant('label.tm.CreatedByMe'), iconClass: "fa-user-plus", filter: [{f: "creatorId", v: [iris.config.me.id]}] },
                { alias: "today", label: $translate.instant('label.tm.Today'), iconClass: "fa-calendar-o", filter: [{f: "dateEnd", v: [new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0), new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59)], m: 'btw', s: false }] },
                { alias: "overdue", label: $translate.instant('label.tm.Overdue'), iconClass: "fa-exclamation-triangle", filter: [{f: "dateEnd", v: [null, new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0)], m: 'btw', s: false }] },
                { alias: "watched", label: $translate.instant('label.tm.Watched'), iconClass: "fa-star", type: "query", param: "observers", filter: `[${iris.config.me.id}]` }
            ];

            const taskSidebarFilters = [
                { property: 'title', value: 'title', m: "contains" },
                { property: 'description', value: 'description', m: "contains" },
                { property: 'projectId', value: 'projectIds', m: "multiselect" },
                { property: 'workGroupId', value: 'workGroupIds', m: "multiselect" },
                { property: 'assigneeId', value: 'assigneeIds', m: "multiselect" },
                { property: 'creatorId', value: 'creatorIds', m: "multiselect" },
                { property: 'priority', value: 'priorityIds', m: "multiselect" },
                { property: 'tags', value: 'tagsIds', m: "url" },
                { property: 'resolution', value: 'resolution', checks: [{f:'open', v: 'null'}, {f:'resolved', v: '"RESOLVED"'}, {f:'rejected', v: '"REJECTED"'}], m: "checklist" },
                { property: 'active', value: 'active', checks: [{f:'inactive', v: false}, {f:'active', v: true}], m: "checklist" }
            ];

            const reminderSendTo = [
                { name: $translate.instant('label.tm.Assignee'), value: 'ASSIGNEE' },
                { name: $translate.instant('label.tm.AssigneeAndMembers'), value: 'ASSIGNEE_AND_MEMBERS' },
                { name: $translate.instant('label.tm.Members'), value: 'MEMBERS' },
                { name: $translate.instant('label.Creator'), value: 'CREATOR' },
                { name: $translate.instant('label.All'), value: 'ALL' }
            ];

            const referenceTypes = [
                { name: $translate.instant('label.Date'), value: 'DATE' },
                { name: $translate.instant('label.tm.Deadline'), value: 'DEADLINE' }
            ];

            const reminderParams = {
                options: [
                    { name: $translate.instant('label.tm.OnDateOfEvent'), value: 'DATE_OF_EVENT'},
                    { name: $translate.instant('label.tm.5MinutesBefore'), value: 'MIN_BEFORE_5'},
                    { name: $translate.instant('label.tm.10MinutesBefore'), value: 'MIN_BEFORE_10'},
                    { name: $translate.instant('label.tm.15MinutesBefore'), value: 'MIN_BEFORE_15'},
                    { name: $translate.instant('label.tm.1HoursBefore'), value: 'HOURS_BEFORE_1'},
                    { name: $translate.instant('label.tm.2HoursBefore'), value: 'HOURS_BEFORE_2'},
                    { name: $translate.instant('label.tm.1DaysBefore'), value: 'DAYS_BEFORE_1'},
                    { name: $translate.instant('label.tm.2DaysBefore'), value: 'DAYS_BEFORE_2'},
                ],
                quickDate: [
                    { value: '1', label: 'label.tm.in1Day' },
                    { value: '2', label: 'label.tm.in2Day' },
                    { value: '7', label: 'label.tm.in1Week' },
                    { value: '14', label: 'label.tm.in2Weeks' },
                    { value: '30', label: 'label.tm.in1Month' },
                ]
            };

            const taskTypes = [
                { id: "FEATURE", name: $translate.instant('label.tm.Feature') },
                { id: "BUG", name: $translate.instant('label.tm.Bug') }
            ];

            let promises = [], taskFieldsMapping;
            promises.push(UserGroupsService.getWorkgroups());

            $q.all(promises).then(results => {
                taskFieldsMapping = {
                    dateStart: { name: $translate.instant('label.tm.StartDate'), type: 'date' },
                    dateEnd: { name: $translate.instant('label.tm.FinishDate'), type: 'date' },
                    title: { name: $translate.instant('label.Title'), type: 'text' },
                    workflowStateAlias: { name: $translate.instant('label.WorkflowState'), type: 'text' },
                    workGroupId: { name: $translate.instant('label.tm.Workgroup'), type: 'id', filter: 'IrisFilterField', filterArray: results[0]},
                    isActive: { name: $translate.instant('label.Active'), type: 'flag' },
                    creatorId: { name: $translate.instant('label.tm.Creator'), type: 'id', filter: 'irisUser' },
                    assigneeId: { name: $translate.instant('label.tm.Assignee'), type: 'id', filter: 'irisUser' },
                    priority: { name: $translate.instant('label.tm.Priority'), type: 'text' },
                    observers: { name: $translate.instant('label.tm.Observers'), type: 'array' },
                    // reminders: { name: $translate.instant('label.tm.Reminders'), type: 'array' },
                    // tags: { name: $translate.instant('label.tm.Tags'), type: 'array' },
                    // attachments: { name: $translate.instant('label.Attachments'), type: 'array' },
                    members: { name: $translate.instant('label.tm.Members'), type: 'array' },
                    checkList: { name: $translate.instant('label.CheckList'), type: 'array' },
                    // subTasks: { name: $translate.instant('label.tm.SubTasks'), type: 'array' },
                    isDone: { name: $translate.instant('label.Done'), type: 'flag' },
                    description: { name: $translate.instant('label.Description'), type: 'text' }
                };
            });

            let prepareFieldFromFieldsMapping = (name, val, index) => {
                let label = '',
                    notSet = $translate.instant('label.NotSet');
                switch(taskFieldsMapping[name].type) {

                    case 'id':
                        if (val == null) {
                            label += notSet;
                        } else {
                            if (taskFieldsMapping[name].filter.length) {
                                label = taskFieldsMapping[name].filterArray ? $filter(taskFieldsMapping[name].filter)(val, [taskFieldsMapping[name].filterArray, 'name']) : $filter(taskFieldsMapping[name].filter)(val);
                            } else {
                                label = val;
                            }
                        }
                        break;

                    case 'date':
                        if (val == null) {
                            label = notSet;
                        } else {
                            label = $filter('irisTime')(val, this, '@{date}');
                        }
                        break;

                    case 'array':
                        switch (name) {
                            case 'observers':
                            case 'members':
                                label =  val[index].profile.fullName;
                                break;

                            /* case 'reminders':
                             label += $translate.instant('label.tm.SendTo') + ': '
                             + reminderSendTo.find(s => s.value === val[index].sendTo).name
                             + ', ' + $translate.instant('label.Date') + ': ';
                             if (val[index].referenceType === 'DEADLINE') {
                             label += reminderOptions.find(s => s.value === val[index].reminderOption).name;
                             } else if (val[index].referenceType === 'DATE') {
                             label += $filter('irisTime')(val[index].referenceDate);
                             }

                             break;*/

                            /*case 'tags':
                             label += val[index].isPrivate ? $translate.instant('label.Private') : $translate.instant('label.Public');
                             label += ' ' + val[index].name;
                             break;*/

                            /* case 'attachments':
                             label += val[index].file.name;
                             break;*/

                            case 'checkList':
                                if (index === 'isDone') {
                                    label = $translate.instant('label.CheckItem') + ' "' + val.title + '" ' +
                                        (val.isDone ? $translate.instant('label.isMarketAsResolved') :
                                            $translate.instant('label.isMarketAsNotResolved'));
                                } else if (index === 'title') {
                                    label = $translate.instant('label.CheckItem') + $translate.instant('label.Title') +
                                        ' "' + val.title + '"';
                                } else {
                                    label = $translate.instant('label.CheckItem') + ' "' + val[index].title + '"';
                                }
                                break;

                            /*case 'subTasks':
                             label += val[index].taskId + ' ' + val[index].title;
                             break;*/
                        }
                        break;

                    default:
                        if (val == null) {
                            label = notSet;
                        } else {
                            label = val;
                        }
                        break;
                }
                return label;
            };

            function getTasks(params) {
                params = params || {};
                params.filter = params.filter ? angular.fromJson(params.filter) : [];
                var activeFilter = params.filter.find(f => f.f === "active");
                if(!activeFilter) {
                    var active = params.active ? angular.fromJson(params.active) : [];
                    params.filter.push({f: 'isActive', v: active && active.length ? active : [true]});
                }
                params.filter = angular.toJson(params.filter);
                params['order-by'] || (params['order-by'] = angular.toJson([{ name: 'updateOn', value: 'desc'}]));
                return Tasks.query(params).$promise;
            }

            return {
                getTaskTypes: () => taskTypes,
                getTaskViewUrl: (id) => `${iris.config.baseUrl}/ui/ui/taskmanagement/tasks/${id}/view`,

                getTasks,

                getUserTasks: (userId, params) => {
                    params || (params = {});
                    params.filter || (params.filter = []);
                    var meFilter = [
                        { f: "assigneeId", v: [userId] },
                        { f: "active", v: [true] }
                    ];
                    params.filter.push(...meFilter);
                    params.filter = angular.toJson(params.filter);

                    return getTasks(params);
                },

                getTasksByIds: (taskIds) => getTasks({
                    filter: angular.toJson([
                        { f: "id", v: taskIds },
                        { f: "active", v: [true, false] }
                    ])
                }),

                getTask: id => Tasks.get({id}).$promise,

                saveTask: task => Tasks.save(task).$promise,

                createTask: params => new Tasks(params),

                removeTask: task => Tasks.remove({id: task.id}).$promise,

                getPreloadedTaskPriorities: () => iris.data.taskPriorities || [],
                getTaskPriorities: () => TasksPriority.query().$promise,

                toggleFollow: (taskId) => Tasks.toggleFollow({id: taskId}).$promise,

                assignTo: (taskId, userId) => Tasks.assignTo({id: taskId, userId}).$promise,

                addTag: (taskId, tagId) => Tasks.addTag({id: taskId, tagId}).$promise,
                removeTag: (taskId, tagId) => Tasks.removeTag({id: taskId, tagId}).$promise,

                addFile: (taskId, fileId) => Tasks.addFile({id: taskId, fileId}).$promise,
                removeFile: (taskId, fileId) => Tasks.removeFile({id: taskId, fileId}).$promise,
                getByFile: (fileId) => Tasks.getByFile({fileId}).$promise,

                setState: (taskId, workflowStateAlias, processResolution) => Tasks.setState({id: taskId, workflowStateAlias, processResolution}).$promise,

                getQuickFilters: () => taskQuickFilters,
                getSidebarFilters: () => taskSidebarFilters,

                getTaskCommentsApiUrl: (task) => `/task-management/tasks/${task.id}/comments`,

                getTaskReminders: (taskId) => Tasks.getReminders({taskId: taskId}).$promise,

                getTaskReminder: (taskId, id) => Tasks.getReminder({taskId: taskId, id: id}).$promise,

                addTaskReminder: (reminder) => Tasks.addReminder(reminder).$promise,

                removeTaskReminder: (taskId, reminderId) => Tasks.deleteReminder({taskId: taskId, id: reminderId}).$promise,

                getReminderSendTo: () => reminderSendTo,

                getReminderReferenceTypes: () => referenceTypes,

                getReminderReminderParams: () => reminderParams,

                getHistory: taskId => Tasks.getHistory({taskId: taskId}).$promise,

                getTaskFieldsMapping: () => taskFieldsMapping,

                prepareHistory: (history) => {

                    if (history.length < 2) {
                        return [];
                    }
                    let diffs = [],
                        sortedHistory = $filter('orderBy')(history, 'updatedOn');

                    for (var i = 0, l = history.length; i < l; i++) {
                        if (sortedHistory[i + 1]) {
                            angular.forEach(taskFieldsMapping, (val, key) => {
                                if (val.type !== 'array' && sortedHistory[i][key] !== sortedHistory[i + 1][key]) {
                                    let isHTML = key === 'description';
                                    diffs.push({
                                        label: taskFieldsMapping[key].name,
                                        oldVal: prepareFieldFromFieldsMapping(key, sortedHistory[i][key]),
                                        newVal: prepareFieldFromFieldsMapping(key, sortedHistory[i + 1][key]),
                                        date: sortedHistory[i + 1].updatedOn,
                                        userId: sortedHistory[i + 1].updatedBy,
                                        isAction: false,
                                        isHTML: isHTML
                                    });
                                } else if (val.type === 'array') {
                                    let lOld = sortedHistory[i][key] ? sortedHistory[i][key].length : 0,
                                        lNew = sortedHistory[i + 1][key] ? sortedHistory[i + 1][key].length : 0;
                                    if (lOld !== lNew) {
                                        if (lNew > lOld) {
                                            diffs.push({
                                                label: taskFieldsMapping[key].name,
                                                oldVal: $translate.instant('label.Add'),
                                                newVal: prepareFieldFromFieldsMapping(key, sortedHistory[i + 1][key], lNew - 1),
                                                date: sortedHistory[i + 1].updatedOn,
                                                userId: sortedHistory[i + 1].updatedBy,
                                                isAction: true
                                            })
                                        } else if (lNew < lOld) {
                                            for (let j = 0; i < lOld; j++) {
                                                if (sortedHistory[i][key][j].id !== sortedHistory[i + 1][key][j].id
                                                    || !sortedHistory[i + 1][key][j]) {
                                                    diffs.push({
                                                        label: taskFieldsMapping[key].name,
                                                        oldVal: prepareFieldFromFieldsMapping(key, sortedHistory[i][key], j),
                                                        newVal: $translate.instant('label.Remove'),
                                                        date: sortedHistory[i + 1].updatedOn,
                                                        userId: sortedHistory[i + 1].updatedBy,
                                                        isAction: true
                                                    });
                                                }
                                            }
                                        }
                                    } else if (lOld === lNew && lOld > 0 && lNew > 0 && key === 'checkList') {
                                        for (let j = 0; j < lNew; j++) {
                                            if (!Object.is(sortedHistory[i][key][j], sortedHistory[i + 1][key][j])) {
                                                let index;
                                                if (sortedHistory[i][key][j].isDone !== sortedHistory[i + 1][key][j].isDone)
                                                    index = 'isDone';
                                                if (sortedHistory[i][key][j].title !== sortedHistory[i + 1][key][j].title)
                                                    index = 'title';
                                                if (index) {
                                                    diffs.push({
                                                        label: taskFieldsMapping[key].name,
                                                        oldVal: $translate.instant('label.Edit'),
                                                        newVal: prepareFieldFromFieldsMapping(key, sortedHistory[i + 1][key][j], index),
                                                        date: sortedHistory[i + 1]['updatedOn'],
                                                        userId: sortedHistory[i + 1]['updatedBy'],
                                                        isAction: true
                                                    });
                                                }
                                            }
                                        }
                                    }
                                }
                            });
                        }
                    }

                    return diffs;
                }
            }
        });
})();