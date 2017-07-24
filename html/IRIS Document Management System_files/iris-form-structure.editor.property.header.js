(function() {
    angular.module('irisForm')
        .directive('irisFormStructureEditorPropertyHeader', function() {
            return {
                restrict: 'AE',

                scope: {
                    property: '=',
                    propertyContainer: '=',
                    actionScope: '=',
                    readonly: '='
                },

                templateUrl: iris.config.baseUrl + '/common/components/iris-form/templates/iris-form-structure.editor.property.header.html',

                link: function(scope, element, attrs) {
                }
            };
        });
})();