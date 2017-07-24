(function() {
    irisAppDependencies.add('iris_comments');

    angular.module('iris_comments', []);

    angular.module('iris_comments').factory('Comments', function ($resource) {
        return $resource(iris.config.apiUrl + "/comments/:moduleName/:entityName/:entityId/:id", {
            id: '@id',
            entityId: '@entityId',
            entityName: '@entityName',
            moduleName: '@moduleName'
        });
    });

    angular.module('iris_comments').factory('CommentsService',
        function ($filter, $resource, Comments) {
            return {
                query: function(params) {
                    return Comments.query(params).$promise;
                },

                getList: function(request_obj){
                    return Comments.query(request_obj);
                },

                create: function (params) {
                    return new Comments(params)
                },

                save: function (comment) {
                    return comment.$save();
                },

                remove: function(comment) {
                    return Comments.remove(comment).$promise;
                }
            }
        });

    angular.module('iris_comments').factory('CustomCommentsService',
        function ($filter, $resource) {
            return function(apiUrl) {
                this.Resource = $resource(iris.config.apiUrl + apiUrl + "/:id", {id: '@id'});

                this.query = function (params) {
                    return this.Resource.query(params).$promise;
                };

                this.getList = function (request_obj) {
                    return this.Resource.query(request_obj);
                };

                this.create = function (params) {
                    return new this.Resource(params)
                };

                this.save = function (comment) {
                    return comment.$save();
                };

                this.remove = function (comment) {
                    return this.Resource.remove(comment).$promise;
        }
            }
        });

    angular.module('iris_comments').directive('irisComments',
        function ($translate, CommentsService, CustomCommentsService) {
            return {
                restrict: 'EA',
                scope: {
                    apiUrl: '=',
                    onUpdate: '&'
                },
                templateUrl: iris.config.componentsUrl + '/comments/templates/comments.list.html',
                link: function (scope, element, attrs) {
                    scope.comments = [];
                    scope.request_object = {};
                    var Service = attrs.apiUrl ? new CustomCommentsService(scope.apiUrl) : CommentsService;

                    var textElement = element.find(".iris-comments-text");
                    textElement.bind('keypress', function(event) {
                        var code = event.keyCode || event.which;
                        if ((code === 13 && event.ctrlKey) || code === 10) {
                            scope.save();
                        }
                    });

                    (scope.clearForm = function () {
                        scope.comment = Service.create(scope.request_object);
                    })();

                    function requestComments() {
                        scope.comments = Service.getList(scope.request_object);
                    }

                    scope.init = function(){
                        scope.request_object = {moduleName: attrs.moduleName, entityName: attrs.entityName, entityId: attrs.entityId};
                        scope.clearForm();
                        requestComments();
                    };

                    scope.isEditable = function(comment) {
                        if (!comment || !comment.id || !comment.createdOn || !comment.createdBy) return false;
                        if (iris.config.me.isAdmin) return true;

                        var edgeDate = new Date();
                        edgeDate.setDate(edgeDate.getDate() - 1);
                        return comment.createdBy == iris.config.me.id && (new Date(comment.createdOn)) > edgeDate;
                    };

                    scope.save = function () {
                        if (scope.comment.comment) {

                            scope.comment.mentionedUsers = scope.comment.mentionedUsers || [];
                            var mu = scope.comment.comment.match(/([^\]\[]+)(?=\])/g);

                            for (var i = 0, l = scope.comment.mentionedUsers.length; i < l; i++) {
                                if (mu.indexOf(scope.comment.mentionedUsers[i].username) == -1) {
                                    scope.comment.mentionedUsers.splice(i, 1);
                                    i--;
                                    l--;
                                }
                            }

                            CommentsService.save(scope.comment).then(() => {
                                scope.clearForm();
                                requestComments();
                                scope.onUpdate && scope.onUpdate();
                            });
                        }
                    };

                    scope.edit = function(comment) {
                        scope.comment = angular.copy(comment);
                    };

                    scope.remove = function(comment) {
                        alertify.confirm($translate.instant('message.DeleteItemConfirm'), function (e) {
                            if (e) {
                                Service.remove(comment).then(() => {
                                    alertify.success($translate.instant('text.CommentRemoved'));
                                    scope.clearForm();
                                    requestComments();
                                    scope.onUpdate && scope.onUpdate();
                                });
                            }
                        });
                    };

                    attrs.$observe('entityId', function (nv, ov) {
                        if(!nv) {
                            scope.clearForm();
                            scope.comments = [];
                        } else {
                            scope.init();
                        }
                    });

                    scope.getPeopleTextRaw = function(item) {
                        scope.comment.mentionedUsers = scope.comment.mentionedUsers || [];
                        if (scope.comment.mentionedUsers.findIndex(u => u.username == item.username) == -1) {
                            scope.comment.mentionedUsers.push(item);
                            return '[' + item.username + ']';
                        }
                    };

                    scope.searchPeople = function(term) {
                        scope.users = iris.data.usersInfo.filter((item) => item.fullName.indexOf(term) != -1);
                    };
                }
            };
        });

})();