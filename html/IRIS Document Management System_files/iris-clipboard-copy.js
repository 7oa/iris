(function(globals) {
    'use strict';

    globals.angular.module('irisApp').directive('irisClipboardCopy',
        function ($compile, $translate, $timeout) {
            return {
                restrict: 'EA',

                scope: {
                    ngModel: '='
                },

                controller: function($scope) {
                    function createId() {
                        return Math.floor(Math.random() * 10000).toString();
                    }

                    $scope.clipboardInputId = "clipboard_" + createId();
                    $scope.clipboardButtonId = $scope.clipboardInputId + "_btn";
                },

                link: function (scope, element, attrs) {
                    function createId() {
                        return Math.floor(Math.random() * 10000).toString();
                    }

                    var fieldTemplate =
                        `<div class="col-md-10">
                            <div iris-field
                                 readonly="true"
                                 iris-field-offset="0"
                                 iris-field-label=""
                                 type="text"
                                 ng-model="ngModel"
                                 data-clipboard-text="{{ngModel}}"
                                 id="{{clipboardInputId}}"></div>
                        </div>
                        <div class="col-md-2">
                            <button tooltip={{options.tooltip}}
                                    class="btn btn-default"
                                    data-clipboard-text="{{ngModel}}"
                                    data-clipboard-target="#{{clipboardInputId}}"
                                    id="{{clipboardButtonId}}">
                                <i class={{options.iconClass}}></i>
                            </button>
                        </div>`;

                    var iconTemplate =
                        `<button class="btn btn-link"
                                 tooltip={{options.tooltip}}
                                 id="{{clipboardButtonId}}"
                                 data-clipboard-text="{{ngModel}}"
                                 data-clipboard-target="#{{clipboardButtonId}}">
                            <i class={{options.iconClass}}></i>
                        </button>`;

                    scope.options = {
                        type: attrs.type || "field",
                        iconClass: attrs.buttonIcon ? ("fa fa-" + attrs.buttonIcon) : "fa fa-copy",
                        tooltip: $translate.instant(attrs.tooltip || 'label.Copy')
                    };
                    scope.clipboardInputId = "clipboard_" + createId();
                    scope.clipboardButtonId = scope.clipboardInputId + "_btn";

                    var template = fieldTemplate;
                    if (scope.options.type === "icon") {
                        template = iconTemplate;
                    }

                    element.after($compile(template)(scope));
                    element.remove();

                    $timeout(() => {
                        var clipboard = new Clipboard("#" + scope.clipboardButtonId);

                        clipboard.on('success', function(e) {
                            alertify.success($translate.instant('text.ClipboardCopySuccess'));
                            e.clearSelection();
                        });

                        clipboard.on('error', function(e) {
                            alertify.success($translate.instant('text.ClipboardCopyError'));
                        });
                    })
                }
            }
        });
})({
    angular: angular,
    config: iris.config
});