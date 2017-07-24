(function() {
    angular.module('irisBpmn')
        .factory('IrisBpmnElementsValidatorRuleBase', function(FabricLib) {
            return FabricLib.util.createClass({
                initialize: function () {
                    this.errorPattern = "";
                },

                filter: function (element) {
                    return true;
                },

                validate: function(elementInfo) {
                    var res = {
                        element: elementInfo.element,
                        valid: this.validateCore(elementInfo)
                    };
                    !res.valid && (res.message = this.errorMessage(elementInfo));
                    return res;
                },

                validateCore: function(elementInfo) {
                    return true;
                },

                errorMessage: function(element) {
                    return this.errorPattern.replace("{name}", element.name);
                }
            });
        });

    angular.module('irisBpmn')
        .factory('IrisBpmnElementsValidatorRule', function(FabricLib, IrisBpmnElementsValidatorRuleBase) {
            return FabricLib.util.createClass(IrisBpmnElementsValidatorRuleBase, {
                initialize: function (filterPredicate, validateRule, errorPattern) {
                    this.filterPredicate = filterPredicate;
                    this.errorPattern = errorPattern;
                    this.validateRule = validateRule;
                },

                filter: function (element) {
                    return this.filterPredicate(element);
                },

                validateCore: function(elementInfo) {
                    return this.validateRule(elementInfo);
                }
            });
        });
})();