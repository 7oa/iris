(function() {
    angular.module('irisForm')
        .directive('irisFormStructureEditorForm', function($translate, $window, $uibModal, IrisFormStructureService) {
            return {
                restrict: 'AE',

                scope: {
                    property: '=',
                    propertyContainer: '=',
                    rootForm: '=',
                    aliasType: '=',
                    readonly: '='
                },

                templateUrl: iris.config.baseUrl + '/common/components/iris-form/templates/iris-form-structure.editor.form.html',

                controller: function($scope, $element, $attrs) {
                    $scope.propertyTypes = IrisFormStructureService.getPropertyTypes();
                    $scope.isReadonly = $scope.readonly || $scope.property.documentFormId;

                    function editPropertyModal(parentProperty, property, mode) {
                        return $uibModal.open({
                            templateUrl: iris.config.baseUrl + '/common/components/iris-form/templates/iris-form-structure.editor.property.modal.html',
                            controller: "IrisFormStructureEditorPropertyModalCtrl",
                            size: 'md',
                            resolve: {
                                'property': () => property,
                                'propertyTypes': () => $scope.propertyTypes,
                                'parentProperty': () => parentProperty,
                                'rootForm': () => $scope.rootForm,
                                'aliasType': () => $scope.aliasType,
                                'mode': () => mode || "EDIT"
                            }
                        }).result;
                    };

                    $scope.addProperty = function(parentProperty, propertyType) {
                        if (propertyType.id == "FORM" && parentProperty && parentProperty.settings && parentProperty.settings.isInline) return;

                        editPropertyModal(parentProperty, IrisFormStructureService.newProperty(propertyType, $scope.aliasType), "ADD").then(res => {
                            parentProperty.properties.push(res);
                        });
                    };

                    $scope.editProperty = function(parentProperty, property) {
                        var propertyIndex = parentProperty.properties.indexOf(property);
                        editPropertyModal(parentProperty, angular.copy(property)).then(res => {
                            parentProperty.properties[propertyIndex] = res;
                        });
                    };

                    $scope.removeProperty = function(parentProperty, property) {
                        alertify.confirm($translate.instant('message.DeleteItemConfirm'), function (e) {
                            if (e) {
                                var propertyIndex = parentProperty.properties.indexOf(property);
                                parentProperty.properties.splice(propertyIndex, 1);
                                $scope.$apply();
                            }
                        });
                    };

                    $scope.moveProperty = function(parentProperty, property, shift) {
                        var propertyIndex = parentProperty.properties.indexOf(property);
                        if (propertyIndex + shift < 0 || propertyIndex + shift >= parentProperty.properties.length) return;
                        var temp = parentProperty.properties[propertyIndex + shift];
                        parentProperty.properties[propertyIndex + shift] = parentProperty.properties[propertyIndex];
                        parentProperty.properties[propertyIndex] = temp;
                    };

                    $scope.copyProperty = function(property) {
                        $uibModal.open({
                            templateUrl: iris.config.baseUrl + '/common/components/iris-form/templates/iris-form-structure.editor.property.copy.modal.html',
                            controller: "IrisFormStructureEditorPropertyCopyModalCtrl",
                            resolve: {
                                rootForm: () => $scope.rootForm,
                                property: () => property
                            }
                        });
                    };
                }
            };
        });
})();