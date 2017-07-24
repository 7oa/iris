(function () {
    irisAppDependencies.add("charttool_templates");

    angular.module('charttool_templates', []);

    angular.module('charttool_templates').factory('CharttoolTemplates', function ($resource) {
        return $resource(iris.config.apiUrl + "/charttool/templates/:id", {
            id: '@id'
        });
    });

    angular.module('charttool_templates').factory('CharttoolTemplatesService',
            function ($filter, CharttoolTemplates) {
                var templates = CharttoolTemplates.query({}, function (value) {
                    return value;
                });
                return {

                    createTemplate: function () {
                        var params = {
                            charttoolCharts: [],
                            view: "list",
                            shareType: 'private'
                        };
                        return new CharttoolTemplates(params);
                    },
                    getTemplates: function () {
                        return templates;
                    },

                    requestTemplates: () => CharttoolTemplates.query().$promise,

                    saveTemplate: function (template) {
                        var is_new = !template.id > 0;
                        return CharttoolTemplates.save({},angular.copy(template), function (value) {
                            angular.merge(template,value);
                            if (is_new) {
                                templates.push(template);
                            }
                            return value;
                        }).$promise;
                    },

                    removeTemplate: function (template) {
                        var deleteTemplateId = template.id;
                        return template.$remove({}, function (value) {
                            var deletedTemplate = $filter('filter')(templates, {id: deleteTemplateId}, true)[0];
                            var index = templates.indexOf(deletedTemplate);
                            templates.splice(index, 1);
                        });
                    },

                    filter: function (filter, strict) {
                        filter = filter || {};
                        strict = strict || true;
                        return $filter('filter')(templates, filter, strict);
                    },

                    getById: function (id) {
                        return CharttoolTemplates.get({id: id}).$promise;
                    }
                };
            });

})();