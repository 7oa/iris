(function() {
    angular.module('irisBpmn')
        .factory('IrisBpmnElementsValidator', function(FabricLib) {
            function getResElement(results, elementInfo) {
                var res = results.find(t => t.elementInfo.element.id == elementInfo.element.id);
                if (!res) {
                    results.push({elementInfo, messages: []});
                    return getResElement(results, elementInfo);
                }
                return res;
            }

            return FabricLib.util.createClass({
                initialize: function (options) {
                    options || (options = {});
                    options.rules || (options.rules = []);

                    this.rules = options.rules;
                },

                validateElementsInfo: function(elementsInfo) {
                    var res = {
                        valid: true,
                        results: []
                    };

                    this.rules.forEach(r => {
                        elementsInfo.filter(e => r.filter(e.element)).forEach(e => {
                            var v = r.validate(e);
                            if (!v.valid) {
                                res.valid = false;
                                getResElement(res.results, e).messages.push(v.message);
                            }
                        })
                    });

                    return res;
                },

                validate: function(irisBpmn) {
                    var elementsInfo = irisBpmn.getElementsInfo();
                    return this.validateElementsInfo(elementsInfo);
                }
            });
        });
})();