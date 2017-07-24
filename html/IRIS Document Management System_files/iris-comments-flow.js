(function() {
    angular.module('irisCommentsFlow').directive('irisCommentsFlow', function ($window, $q, IrisCommentsFlowService, CommentsService, TasksService, FilesService, NotificationsService) {
        return {
            restrict: 'AE',

            scope: {
                params: '=?',
                widget: '=?'
            },

            templateUrl: iris.config.widgetsUrl + '/iris-comments-flow/templates/iris-comments-flow.view.html',

            controller: function ($scope) {
                $scope.getFileIcon = function (mime_type) {
                    return FilesService.getIcon(mime_type);
                };

                $scope.getFileUrl = function (folderId, fileId) {
                    return folderId && fileId ? FilesService.getDMSFileUrl(folderId, fileId) : '#';
                };

                $scope.getTaskUrl = function (taskId) {
                    return TasksService.getTaskViewUrl(taskId);
                };

                $scope.getDateLabel = (date) => {
                    return NotificationsService.prepareSentDateLabel(date);
                };
            },

            link: function (scope, element, attrs) {
                scope.widget = scope.widget || {};
                scope.widget.settings = scope.widget.settings || {};
                scope.params = scope.params || {};
                scope.params = angular.extend({}, scope.params, IrisCommentsFlowService.getDefaultSettings(), scope.widget.settings);

                scope.items = [];
                var loadCounter = 1,
                    queries;

                function getCommentsQuery(commentType) {
                    return CommentsService.query({
                        moduleName: commentType.moduleName,
                        entityName: commentType.entityName,
                        limit: scope.params.limit * loadCounter,
                        'order-by': angular.toJson([ {name: 'updatedOn', value: 'desc'} ])
                    })
                }

                function getEntityIds(comments) {
                    var entityIds = comments.map(c => c.entityId),
                        uniqueEntityIds = [];
                    for (let i = 0; i < entityIds.length; i++) {
                        if (uniqueEntityIds.indexOf(entityIds[i]) < 0) {
                            uniqueEntityIds.push(entityIds[i]);
                        }
                    }
                    return uniqueEntityIds;
                }

                function getEntitiesQuery(commentType, entityIds) {
                    switch (commentType.entityName) {
                        case 'task':
                            return TasksService.getTasksByIds(entityIds);
                        case 'files':
                            return FilesService.getFilesByIds(entityIds);
                        default:
                            return null;
                    }
                }

                function processComments() {
                    var comments = [];

                    queries.forEach(q => {
                        q.commentsRes.forEach(c => {
                            c.entityType = q.type.entityName;
                            c.entity = q.entitiesRes.find(e => e.id == c.entityId);
                            comments.push(c);
                        });
                    });

                    comments.sort((a,b) => new Date(b.updatedOn) - new Date(a.updatedOn));
                    scope.canLoadMore = (comments.length >= scope.params.limit * loadCounter);
                    scope.items = comments.slice(0, scope.params.limit * loadCounter - 1);
                    loadCounter++;
                }

                scope.getItems = function () {
                    queries = scope.params.commentTypes.map(t => {
                        return {
                            type: t,
                            comments: getCommentsQuery(t),
                            commentsRes: [],
                            entities: null,
                            entitiesRes: []
                        };
                    });

                    $q.all(queries.map(q => q.comments)).then(qRes => {
                        for (let i = 0; i < queries.length; i++) {
                            queries[i].commentsRes = qRes[i];
                            queries[i].entities = getEntitiesQuery(queries[i].type, getEntityIds(queries[i].commentsRes));
                        }

                        var entitiesQueries = queries.filter(q => !!q.entities);
                        if (entitiesQueries.length) {
                            $q.all(entitiesQueries.map(q => q.entities)).then(eRes => {
                                for (let i = 0; i < entitiesQueries.length; i++) {
                                    entitiesQueries[i].entitiesRes = eRes[i];
                                }
                                processComments();
                            })
                        } else {
                            processComments();
                        }
                    });
                };
                scope.getItems();
            }
        }
    });
})();