(function() {
    angular.module('irisForm')
        .directive('irisFormStructureEditorPropertyInfo', function($translate, $compile) {
            return {
                restrict: 'AE',

                scope: {
                    property: '='
                },

                template: '',

                link: function(scope, element, attrs) {
                    var label = attrs["label"];
                    scope.property.settings || (scope.property.settings = {});

                    function recompile() {
                        var template = `<p class="form-control-static"><i class="fa fa-info-circle"></i>&nbsp;`,
                            innerText = "";

                        if (scope.property.settings.isInline) {
                            innerText += `${$translate.instant('label.Inline')}`;
                            if (scope.property.settings.isMultiple) innerText += ` (${$translate.instant('label.Multiple')}); `;
                            else innerText += `; `;
                        }

                        if (scope.property.settings.isRequired) innerText += `${$translate.instant('label.Required')}; `;
                        if (scope.property.settings.isDisabled) innerText += `${$translate.instant('label.Disabled')}; `;
                        if (scope.property.settings.isCalculated) innerText += `${$translate.instant('label.Calculated')}; `;
                        if (scope.property.type == 'selection' && scope.property.settings.isMultiple) innerText += `${$translate.instant('label.Multiple')}; `;
                        if (scope.property.type == 'textarea') innerText += `${$translate.instant('label.Height')}: ${scope.property.settings.height}; `;

                        if (label) {
                            innerText = innerText.length ? `${label}: ${innerText}` : label;
                        };

                        template += `${innerText}
                            <button class="btn btn-link btn-xs"
                                    ng-click="property.settings.isKey = !property.settings.isKey">
                                <i ng-if="property.settings.isKey" class="fa fa-key" uib-tooltip="{{::'label.doc.ToggleIsKey' | translate}}"></i>
                                <i ng-if="!property.settings.isKey" class="fa fa-minus" uib-tooltip="{{::'label.doc.ToggleIsKey' | translate}}"></i>
                            </button>
                            <button class="btn btn-link btn-xs"
                                    ng-click="property.settings.isHidden = !property.settings.isHidden">
                                <i ng-if="property.settings.isHidden" class="fa fa-eye-slash" uib-tooltip="{{::'label.doc.ToggleVisibility' | translate}}"></i>
                                <i ng-if="!property.settings.isHidden" class="fa fa-eye" uib-tooltip="{{::'label.doc.ToggleVisibility' | translate}}"></i>
                            </button>
                        </p>`;

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