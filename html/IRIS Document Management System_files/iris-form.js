(function() {
    angular.module('irisForm')
        .directive('irisForm', function() {
            return {
                restrict: 'AE',
                transclude: true,
                replace: true,

                scope: {
                    form: '=',
                    data: '=',
                    rootForm: '=',
                    rootData: '=',
                    document: '=',
                    editable: '=',
                    fullPath: '=',
                    subPath: '='
                },

                templateUrl: iris.config.baseUrl + '/common/components/iris-form/templates/iris-form.html',

                controller: function($scope, $element, $attrs) {
                    $scope.data || ($scope.data = $scope.form.settings && $scope.form.settings.isInline ? [] : {});

                    $scope.nextSubPath = $scope.form.documentFormId ? ($scope.fullPath || '') : ($scope.subPath || '');

                    $scope.getFullPath = function (propertyAlias) {
                        return `${$scope.fullPath || ''}["${propertyAlias}"]`;
                    };

                    $scope.isEditable = function(property) {
                        return $scope.editable && property.settings && (!property.settings.isKey || !$scope.readonlyKeys);
                    };

                    $scope.getVisibleProperties = function() {
                        return $scope.form.properties.filter(p => !p.settings.isHidden);
                    };

                    $scope.generateInlineRow = function(container) {
                        var res = {};
                        container.properties.forEach(p => {
                            res[p.alias] = p.defaultValue;
                        });
                        return res;
                    };

                    $scope.removeInlineRow = function(containerData, dataRow) {
                        var index = containerData.indexOf(dataRow);
                        containerData.splice(index, 1);
                    };
                },

                link: function(scope, element, attrs) {
                    scope.readonlyKeys = attrs["readonlyKeys"] == "true";
                    scope.fillDefault = attrs["fillDefault"] == "true";
                }
            };
        });
})();