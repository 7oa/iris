(function () {
    angular.module('irisTableWidget').directive('irisTableWidgetCell',
        function ($q, $filter, $compile, IrisTableWidgetService) {
            return {
                restrict: 'EA',
                scope: {
                    widget: '=',
                    cell: '=',
                    interval: '='
                },
                template: '',

                controller: function ($scope) {
                },

                link: function (scope, element, attrs) {
                    var mode = attrs["mode"],
                        condensationShift = attrs["condensationShift"] || 0;

                    element.html($compile(`<div ${scope.cell.type.directive} widget='widget' cell='cell' interval='interval' condensation-shift='${condensationShift}' mode='${mode}' />`)(scope));
                }
            };
        });
})();

