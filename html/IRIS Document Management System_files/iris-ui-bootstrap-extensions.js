(function () {
    angular.module('irisApp').directive('modalHeader', function ($compile) {
        return {
            restrict: 'C',
            link: function (scope, element) {
                $(element).attr('ondblclick', 'iris.modal.toogleStickModal()');
                if(!$(element).find('button.close').length){
                    var close_button_template = `
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close" ng-click="$dismiss()">
                        <span aria-hidden="true"><i class="fa fa-lg fa-times"></i></span>
                    </button>`;
                    element.prepend($compile(close_button_template)(scope));
                }
            }
        }
    });

    angular.module('irisApp').directive('modalFooter', function ($compile) {
        return {
            restrict: 'C',
            link: function (scope, element) {
                if(!$(element).find('button[ng-click="$dismiss()"] i.fa-times').length){
                    var close_button_template = `
                    <button type="button" class="btn btn-default" ng-click="$dismiss()">
                        <i class="fa fa-times"></i> {{'label.Close' | translate}}
                    </button>`;
                    element.append($compile(close_button_template)(scope));
                }
            }
        }
    });

    angular.module("uib/template/datepickerPopup/popup.html", []).run(["$templateCache", function($templateCache) {
        $templateCache.put("uib/template/datepickerPopup/popup.html",
            "<ul class=\"uib-datepicker-popup iris-datepicker dropdown-menu uib-position-measure\" dropdown-nested ng-if=\"isOpen\" ng-keydown=\"keydown($event)\" ng-click=\"$event.stopPropagation()\">\n" +
            "	<li ng-transclude></li>\n" +
            "  <li ng-if=\"showButtonBar\" class=\"uib-button-bar\">\n" +
            "		<span class=\"btn-group pull-left\">\n" +
            "      <button type=\"button\" class=\"btn btn-sm btn-info uib-datepicker-current\" ng-click=\"select('today', $event)\" ng-disabled=\"isDisabled('today')\">{{ getText('current') }}</button>\n" +
            "      <button type=\"button\" class=\"btn btn-sm btn-danger uib-clear\" ng-click=\"select(null, $event)\">{{ getText('clear') }}</button>\n" +
            "		</span>\n" +
            "    <button type=\"button\" class=\"btn btn-sm btn-success pull-right uib-close\" ng-click=\"close($event)\">{{ getText('close') }}</button>\n" +
            "	</li>\n" +
            "</ul>\n" +
            "");
    }]);
})();