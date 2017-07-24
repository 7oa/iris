(function () {
    irisAppDependencies.add('iris_tag_selector');

    angular.module('iris_tag_selector', []);

    angular.module('iris_tag_selector').directive('irisTagSelector',
        function (TagsService) {
            return {
                replace: true,
                restrict: 'EA',
                scope: {
                    onSelect: '&',
                    excludeItems: '='
                },
                templateUrl: iris.config.baseUrl + '/common/directives/irisTagSelector/templates/iris-tag-selector.html',
                link: function (scope, element, attrs) {
                    scope.popover = {isOpen: false};
                    scope.tags = [];

                    scope.filter = {
                        name: '',
                        type: 'Tag',
                        isPrivate: attrs.isPrivate == "true"
                    };

                    scope.selectTag = function (tag) {
                        scope.onSelect({tag});
                        scope.popover.isOpen = false;
                        scope.filter.name = '';
                        scope.filter.value = '';
                    };

                    scope.addTag = function () {
                        scope.filter.value = scope.filter.name;
                        TagsService.saveTag(scope.filter).then(scope.selectTag);
                    };

                    scope.requestTags = function () {
                        var filter = [{
                            f: 'isPrivate', v: [scope.filter.isPrivate]
                        }];
                        if (scope.filter.name) {
                            filter.push({
                                f: 'name', v: ['%' + scope.filter.name + '%'], s:false
                            });
                        }
                        TagsService.getTags({filter})
                            .then(tags => {scope.tags = tags;
                            console.log(scope.tags)});
                    };

                    scope.exclude = function (tag) {
                        var show = true;
                        if(scope.excludeItems && scope.excludeItems.length) {
                            show = !scope.excludeItems.find(it => it.id == tag.id);
                        }
                        return show;
                    };

                    scope.requestTags();

                }
            };
        });
})()