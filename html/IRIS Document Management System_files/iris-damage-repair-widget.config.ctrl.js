(function (undefined) {
    var module = angular.module('irisDamageRepairWidget');
    module.controller('DamageRepairWidgetConfigCtrl', function ($scope, $translate, $filter, DocumentCollectionService, DocumentTemplateService, IrisDamageRepairWidgetService) {
        $scope.tabs = [{
            alias: 'ViewOptions', // for form validation
            title: $translate.instant('label.ViewOptions'),
            contentUrl: iris.config.widgetsUrl + '/iris-damage-repair-widget/templates/iris-damage-repair-widget.tabs.config.html'
        }];

        $scope.propertiesForDamages = [];
        $scope.propertiesForGroup = [];
        $scope.propertiesForInfo = [];

        $scope.documentCollections = [];
        DocumentCollectionService.query().then(cRes => {
            $scope.documentCollections = cRes;
        });

        $scope.documentTemplates = [];
        function reloadDocumentTemplates() {
            if ($scope.widget.projectId && $scope.widget.settings.documentCollectionId) {
                DocumentTemplateService.queryByCollection($scope.widget.projectId, $scope.widget.settings.documentCollectionId).then((res) => {
                    $scope.documentTemplates = res;
                    processInsDocumentTemplate();
                });
            } else {
                $scope.documentTemplates = [];
                $scope.widget.settings.insDocumentTemplateId = null;
                $scope.widget.settings.refDocumentTemplateId = null;
            }
        }
        reloadDocumentTemplates();

        function getDamagesForm(form, currentPath) {
            currentPath = currentPath === undefined ? '' : `${currentPath}["${form.alias}"]`;
            if (currentPath == $scope.widget.settings.damagesPath) return form.properties.find(f => f.type == "FORM");

            var res = null;
            form.properties && form.properties.filter(f => f.type == "FORM").forEach(f => {
                res = getDamagesForm(f, currentPath);
            });
            return res;
        }

        function getPropertiesForDamages(form, currentLabel, currentPath, currentRes) {
            currentLabel = currentLabel === undefined ? $translate.instant('label.Root') : `${currentLabel} > ${form.name}`;
            currentPath = currentPath === undefined ? '' : `${currentPath}["${form.alias}"]`;
            var res = currentRes || [];

            if (form.settings && form.settings.layout == "dynamicImage") {
                res.push({id: currentPath, name: currentLabel});
            }

            form.properties && form.properties.filter(f => f.type == "FORM").forEach(f => {
                res = getPropertiesForDamages(f, currentLabel, currentPath, res);
            });

            return res;
        }

        function processInsDocumentTemplate(withInit) {
            var documentTemplate = $scope.documentTemplates.find(t => t.id == $scope.widget.settings.insDocumentTemplateId);

            if (!documentTemplate || !$scope.widget.settings.insDocumentTemplateId) {
                $scope.propertiesForDamages = [];
                $scope.propertiesForGroup = [];
                $scope.widget.settings.groupColumns = [];
                return;
            }

            $scope.propertiesForGroup = documentTemplate.headerDocumentFormStructure.properties.filter(f => f.type != "FORM").map(f => {
                return {
                    id: f.alias,
                    name: f.name
                };
            });

            $scope.propertiesForDamages = getPropertiesForDamages(documentTemplate.bodyDocumentFormStructure);

            if (withInit) {
                $scope.widget.settings.groupColumns = documentTemplate.keyElements.map(t => {
                    return {
                        alias: t.alias,
                        caption: t.name
                    }
                });

                $scope.propertiesForDamages.length && ($scope.widget.settings.damagesPath = $scope.propertiesForDamages[0].id);
            } else {
                processDamages(withInit);
            }
        }

        function processDamages(withInit) {
            var documentTemplate = $scope.documentTemplates.find(t => t.id == $scope.widget.settings.insDocumentTemplateId);

            if (!documentTemplate || !$scope.widget.settings.damagesPath) {
                $scope.widget.settings.infoColumns = [];
                $scope.propertiesForInfo = [];
                return;
            }

            var damagesInfoForm = getDamagesForm(documentTemplate.bodyDocumentFormStructure);
            if (damagesInfoForm) {
                $scope.propertiesForInfo = damagesInfoForm.properties.map(f => {
                    return {
                        id: f.alias,
                        name: f.name
                    };
                });
            } else {
                $scope.propertiesForInfo = [];
                $scope.widget.settings.infoColumns = [];
            }

            if (withInit || !$scope.widget.settings.infoColumns) {
                $scope.widget.settings.infoColumns = [];
            }
        }

        $scope.$watch("widget.projectId", function(nv, ov) {
            if (angular.equals(nv, ov)) return;
            reloadDocumentTemplates();
        });
        $scope.$watch("widget.settings.documentCollectionId", function(nv, ov) {
            if (angular.equals(nv, ov)) return;
            if (nv) {
                $scope.widget.settings.documentCollectionAlias = $scope.documentCollections.find(t => t.id == nv).alias;
            } else {
                $scope.widget.settings.documentCollectionAlias = null;
            }
            reloadDocumentTemplates();
        });

        $scope.$watch("widget.settings.insDocumentTemplateId", function(nv, ov) {
            if (angular.equals(nv, ov)) return;
            processInsDocumentTemplate(true);
        });

        $scope.$watch("widget.settings.damagesPath", function(nv, ov) {
            if (angular.equals(nv, ov)) return;
            processDamages(true);
        });

        $scope.addColumn = function(columns) {
            columns.push({});
        };

        $scope.removeColumn = function(columns, colIndex) {
            if (!columns.length) return;
            columns.splice(colIndex, 1);
        };

        $scope.initColumn = function(columns, source, colIndex)
        {
            var column = columns[colIndex];
            column.caption = $filter("IrisFilterField")(column.alias, [source, "name"]);
            column.captionTranslations = {};
        };

        $scope.groupSortableOptions = {
            handle: '.drag-target'
        };
        $scope.damagesSortableOptions = {
            handle: '.drag-target'
        };
    });
})();