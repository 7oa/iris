(function() {
    angular.module('irisProtocolStructure')
        .directive('irisProtocolStructureFieldDescription', function($translate, $compile) {
            return {
                restrict: 'AE',

                scope: {
                    property: '=',
                    ngModel: '='
                },

                template: '',

                link: function(scope, element, attrs) {
                    scope.property.settings || (scope.property.settings = {});

                    function recompile() {
                        var template = `<p class="form-control-static">`;

                        if (scope.property.settings.isInline) {
                            template += `${$translate.instant('label.Inline')}`;
                            if (scope.property.settings.isMultiple) template += ` (${$translate.instant('label.Multiple')}); `;
                            else template += `; `;
                        }

                        if (scope.property.settings.isRequired) template += `${$translate.instant('label.Required')}; `;
                        if (scope.property.settings.isBarcode) template += `${$translate.instant('label.Barcode')}; `;
                        if (scope.property.settings.isCalculated) template += `${$translate.instant('label.Calculated')}; `;
                        if (scope.property.type == 'selection' && scope.property.settings.isMultiple) template += `${$translate.instant('label.Multiple')}; `;
                        if (scope.property.type == 'textarea') template += `${$translate.instant('label.Height')}: ${scope.property.settings.height}; `;
                        template += `</p>`;
                        element.html($compile(template)(scope));
                    }
                    recompile();

                    scope.$watch("property", function(nv, ov) {
                        if (angular.equals(nv, ov)) return;
                        recompile();
                    }, true);
                }
            };
        });
})();