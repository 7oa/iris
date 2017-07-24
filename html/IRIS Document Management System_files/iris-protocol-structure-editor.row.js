(function() {
    angular.module('irisProtocolStructure')
        .directive('irisProtocolStructureEditorRow', function($translate, $window, $uibModal, IrisProtocolStructureService) {
            return {
                restrict: 'AE',

                scope: {
                    property: '=',
                    propertyContainer: '='
                },

                templateUrl: iris.config.baseUrl + '/common/components/iris-protocol-structure/templates/iris-protocol-structure-editor.row.html',

                controller: function($scope, $element, $attrs) {
                    $scope.fieldTypes = IrisProtocolStructureService.getFieldTypes();

                    $scope.canExpand = () => $scope.property.type == "page" || $scope.property.type == "group";
                    $scope.isField = () => $scope.property.type != "page" && $scope.property.type != "group";

                    $scope.getNamePlaceholder = function() {
                        switch ($scope.property.type) {
                            case "page":
                                return $translate.instant("label.PageName");
                            case "group":
                                return $translate.instant("label.GroupName");
                            default:
                                return $translate.instant("label.PropertyName");
                        }
                    };

                    $scope.mapToOptionsDirectory = function(property) {
                        property.options || (property.options = []);
                        $scope.optionsDirectory = property.options.map(o => { return { value: o }; });
                    };
                    $scope.mapToOptionsDirectory($scope.property);

                    $scope.removeProperty = function(properties, property) {
                        var propertyIndex = properties.indexOf(property);
                        properties.splice(propertyIndex, 1);
                    };

                    $scope.editProperty = function(parentProperty, property) {
                        var propertyIndex = parentProperty.properties.indexOf(property);
                        $uibModal.open({
                            templateUrl: iris.config.baseUrl + '/common/components/iris-protocol-structure/templates/iris-protocol-structure-editor.field.modal.html',
                            controller: "IrisProtocolStructureEditorFieldModalCtrl",
                            size: 'md',
                            resolve: {
                                'field': () => angular.copy(property),
                                'fieldTypes': () => $scope.fieldTypes,
                                'parentProperty': () => parentProperty
                            }
                        }).result.then(res => {
                                parentProperty.properties[propertyIndex] = res;
                            });
                    };

                    $scope.moveProperty = function(properties, property, shift) {
                        var propertyIndex = properties.indexOf(property);
                        if (propertyIndex + shift < 0 || propertyIndex + shift >= properties.length) return;
                        var temp = properties[propertyIndex + shift];
                        properties[propertyIndex + shift] = properties[propertyIndex];
                        properties[propertyIndex] = temp;
                    };

                    $scope.selectImage = function() {
                        var dialog = $window.document.createElement('input');
                        dialog.type = 'file';

                        dialog.addEventListener('change', function() {
                            if (!dialog.files.length) return;

                            var reader  = new FileReader();
                            reader.onloadend = function () {
                                $scope.property.defaultValue = reader.result;
                                $scope.$apply();
                            };
                            reader.readAsDataURL(dialog.files[0]);
                        }, false);

                        dialog.click();
                    };

                    $scope.clearImage = function() {
                        $scope.property.defaultValue = null;
                    };

                    $scope.$watch("property.type", function(nv, ov) {
                        if (!nv || nv == ov) return;
                        $scope.property.defaultValue = null;
                    });
                }
            };
        });
})();