(function() {
    angular.module('irisForm')
        .directive('irisFormStructureEditor', function($translate, $uibModal, IrisFormStructureService) {
            return {
                restrict: 'AE',
                transclude: true,
                replace: true,

                scope: {
                    form: '=',
                    api: '=?'
                },

                templateUrl: iris.config.baseUrl + '/common/components/iris-form/templates/iris-form-structure.editor.html',

                controller: function($scope, $element, $attrs) {
                    $scope.defaultData = {};

                    $scope.form.structure || ($scope.form.structure = {});
                    $scope.form.structure.properties || ($scope.form.structure.properties = []);
                    $scope.aliasType = $attrs.aliasType || "GUID";

                    $scope.propertyTypes = IrisFormStructureService.getPropertyTypes();
                },

                link: function(scope) {
                    var clearValues = function(property) {
                        delete property.value;
                        if (property.properties && property.properties.length) {
                            property.properties.forEach(p => clearValues(p));
                        }
                    };

                    scope.$watch("defaultData", (nv) => console.log(nv), true);

                    scope.api = {
                        clearValues,

                        isValid: function(withErrorAlert) {
                            var validator = new IrisFormStructureService.validator(scope.form.structure);
                            validator.reset();
                            validator.validateNameNotNull();
                            validator.validateAliasNotNull();
                            validator.validate(scope.form.structure, p => {
                                return p.properties.length <= IrisFormStructureService.getInlineMaxLength();
                            }, p => {
                                return p.type == 'FORM' && p.settings.isInline;
                            });
                            if (withErrorAlert && !validator.isValid) {
                                alertify.error($translate.instant("message.document.StructureNotValid"));
                            }
                            return validator.isValid;
                        }
                    };
                }
            };
        });
})();