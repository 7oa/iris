(function() {
    angular.module('irisProtocolStructure')
        .directive('irisProtocolStructureEditor', function($translate, $uibModal, IrisProtocolStructureService) {
            return {
                restrict: 'AE',
                transclude: true,
                replace: true,

                scope: {
                    structure: '=',
                    api: '=?'
                },

                templateUrl: iris.config.baseUrl + '/common/components/iris-protocol-structure/templates/iris-protocol-structure-editor.html',

                controller: function($scope, $element, $attrs) {
                    var emptyTemplateNameLabel = $translate.instant("label.NoName");

                    $scope.structure.properties || ($scope.structure.properties = []);
                    $scope.useGuidAlias = ($attrs.useGuidAlias == "true");

                    $scope.fieldTypes = IrisProtocolStructureService.getFieldTypes();

                    function openCopyTemplatesModal(templates, targetProperties, emptyTemplate) {
                        $uibModal.open({
                            templateUrl: iris.config.baseUrl + '/common/components/iris-protocol-structure/templates/iris-protocol-structure-editor.copy-templates.modal.html',
                            scope: $scope,
                            controller: "IrisProtocolStructureEditorCopyTemplatesModalCtrl",
                            resolve: {
                                templates: () => templates,
                                targetProperties: () => targetProperties,
                                emptyTemplate: () => emptyTemplate
                            }
                        });
                    }

                    var getTemplatesToCopy = function(property, propertyType, namePrefix) {
                        var notRoot = !!property;

                        namePrefix = namePrefix ? (namePrefix + " > ") : "";
                        property || (property = $scope.structure);

                        var templates = [],
                            templateLabel = namePrefix + (property.name || emptyTemplateNameLabel);
                        if (property && property.type == propertyType) {
                            templates.push(new IrisProtocolStructureService.copyTemplate(namePrefix + (property.name || emptyTemplateNameLabel), property));
                        }

                        if (property.properties && property.properties.length) {
                            property.properties.forEach(p => {
                                getTemplatesToCopy(p, propertyType, notRoot ? templateLabel : null).forEach(t => {
                                    templates.push(t);
                                });
                            });
                        }

                        return templates;
                    };

                    var addPropertyWithCopy = function(parentProperty, propertyType) {
                        var templates = getTemplatesToCopy(null, propertyType);
                        if (!templates.length) {
                            parentProperty.properties.push(new IrisProtocolStructureService[propertyType]($scope.useGuidAlias));
                        } else {
                            openCopyTemplatesModal(templates, parentProperty.properties, new IrisProtocolStructureService[propertyType]($scope.useGuidAlias));
                        }
                    };

                    $scope.addPageProperty = function() {
                        addPropertyWithCopy($scope.structure, "page");
                    };

                    $scope.addGroupProperty = function(parentProperty) {
                        addPropertyWithCopy(parentProperty, "group");
                    };

                    $scope.addFieldProperty = function(parentProperty, fieldType) {
                        $uibModal.open({
                            templateUrl: iris.config.baseUrl + '/common/components/iris-protocol-structure/templates/iris-protocol-structure-editor.field.modal.html',
                            controller: "IrisProtocolStructureEditorFieldModalCtrl",
                            size: 'md',
                            resolve: {
                                'field': () => new IrisProtocolStructureService.field(fieldType.id, {settings: angular.copy(fieldType.defaultSettings)}, $scope.useGuidAlias),
                                'fieldTypes': () => $scope.fieldTypes,
                                'parentProperty': () => parentProperty
                            }
                        }).result.then(res => {
                                parentProperty.properties.push(res);
                            });
                    };
                },

                link: function(scope) {
                    var clearValues = function(property) {
                        delete property.value;
                        if (property.properties && property.properties.length) {
                            property.properties.forEach(p => clearValues(p));
                        }
                    };

                    scope.api = {
                        clearValues,

                        isValid: function(withErrorAlert) {
                            var validator = new IrisProtocolStructureService.validator(scope.structure);
                            validator.reset();
                            validator.validateFieldsNameNotNull();
                            validator.validateAliasNotNull();
                            validator.validate(scope.structure, p => {
                                return p.properties.length <= 10;
                            }, p => {
                                return p.type == 'group' && p.settings.isInline;
                            });
                            if (withErrorAlert && !validator.isValid) {
                                alertify.error($translate.instant("message.dpm.StructureNotValid"));
                            }
                            return validator.isValid;
                        },

                        showPreview: function() {
                            var structure = angular.copy(scope.structure);
                            clearValues(structure);

                            $uibModal.open({
                                templateUrl: iris.config.baseUrl + '/common/components/iris-protocol-structure/templates/iris-protocol-structure.preview.html',
                                size: 'lg',
                                resolve: {
                                    'structure': () => structure
                                },
                                controller: function ($scope, structure) {
                                    $scope.structure = structure;
                                }
                            });
                        }
                    };
                }
            };
        });

    angular.module('irisProtocolStructure')
        .controller('IrisProtocolStructureEditorCopyTemplatesModalCtrl', function ($scope, $uibModalInstance, templates, targetProperties, emptyTemplate, IrisProtocolStructureService) {
            $scope.templates = templates;
            $scope.selectedTemplate = templates[0];

            $scope.create = function() {
                targetProperties.push(emptyTemplate);
                $uibModalInstance.close();
            };

            $scope.copy = function() {
                var clonedProperty = IrisProtocolStructureService.flushAliases(angular.copy($scope.selectedTemplate.template), true);
                targetProperties.push(clonedProperty);
                $uibModalInstance.close();
            };

            $scope.close = function() {
                $uibModalInstance.close();
            };
        });
})();