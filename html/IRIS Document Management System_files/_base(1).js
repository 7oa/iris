(function (undefined) {
    angular.module('iris_process_mgmt').factory('ProcessBaseElement', function (FabricLib, GUID) {
        return FabricLib.util.createClass({
            initFields: function() {
                this.id = GUID.create();
            },

            initialize: function (processDefinition, options) {
                options || (options = {});

                this.processDefinition = processDefinition;
                this.initFields();

                angular.merge(this, options);
            },

            toObject: function () {
                return {
                    id: this.id
                };
            }
        })
    });
})();