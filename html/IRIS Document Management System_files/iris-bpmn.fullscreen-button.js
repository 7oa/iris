(function (undefined) {
    angular.module('irisBpmn')
        .directive('irisBpmnFullscreenButton', function ($compile, $translate) {
            return {
                restrict: 'A',

                // scope: {
                //     irisBpmnModel: '='
                // },

                link: function (scope, element, attrs) {
                    var backdropTemplate = `<div class="iris-bpmn-fs-backdrop"></div>`;
                    var containerTemplate = `<div class="iris-bpmn-fs-container">
                                                <div class="iris-bpmn-fs-content">
                                                    <div class="iris-bpmn-fs-header">
                                                        <span class="iris-bpmn-fs-title">{{title}}</span>
                                                        <span ng-click="close()" class="iris-bpmn-fs-close-button pull-right">
                                                            <i class="fa fa-lg fa-times"></i>        
                                                        </span>
                                                    </div>
                                                    <div class="iris-bpmn-fs-body"></div>
                                                </div>
                                             </div>`;

                    var bodyElement = angular.element("body"),
                        backdropElement, containerElement,
                        irisBpmnElement = angular.element(`#${attrs["irisBpmnFullscreenButton"]}`),
                        irisBpmnParentElement = irisBpmnElement.parent();

                    scope.title = attrs["irisBpmnFullscreenTitle"] || $translate.instant('label.ProcessTemplate')

                    element.bind("click", function(e){
                        e.preventDefault();
                        e.stopPropagation();

                        backdropElement = angular.element(backdropTemplate);
                        containerElement = $compile(containerTemplate)(scope);

                        backdropElement.appendTo(bodyElement);
                        containerElement.appendTo(bodyElement);

                        irisBpmnElement.appendTo(angular.element(".iris-bpmn-fs-body"));
                        scope.$apply();
                    });

                    scope.close = function() {
                        irisBpmnElement.appendTo(irisBpmnParentElement);

                        backdropElement.remove();
                        containerElement.remove();
                    };
                }
            }
        })
})();