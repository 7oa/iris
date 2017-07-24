(function() {
    angular.module('irisProtocolStructure')
        .factory('IrisProtocolStructureService', ["GUID", "$translate", function (GUID, $translate) {
            var fieldTypes =  [
                { id: "barcode", name: $translate.instant("label.Barcode"), defaultSettings: {} }, // TO REMOVE
                { id: "text", name: $translate.instant("label.Text"), defaultSettings: {} },
                { id: "textarea", name: $translate.instant("label.TextArea"), defaultSettings: {height: 100} },
                { id: "float", name: $translate.instant("label.Float"), defaultSettings: {decimals: 3} },
                { id: "integer", name: $translate.instant("label.Integer"), defaultSettings: {} },
                { id: "boolean", name: $translate.instant("label.Boolean"), defaultSettings: {} },
                { id: "date", name: $translate.instant("label.Date"), defaultSettings: {} },
                { id: "datetime", name: $translate.instant("label.DateTime"), defaultSettings: {} },
                { id: "selection", name: $translate.instant("label.Selection"), defaultSettings: {options: [], isMultiple: false} },
                { id: "radio", name: $translate.instant("label.RadioButtons"), defaultSettings: {options: [$translate.instant("label.NoInformation")]} },
                { id: "image", name: $translate.instant("label.Image"), defaultSettings: {} },
                { id: "relatedPlans", name: $translate.instant("label.dpm.RelatedPlans"), defaultSettings: {} }
            ];

            var formulaLanguages = [
                { id: "GROOVY", name: "Groovy" },
                { id: "MATHLAB", name: "MathLab" },
                { id: "R", name: "R" }
            ];

            var fillDefaultValues = function(property, overwrite) {
                if (property.defaultValue) {
                    property.value = overwrite ? property.defaultValue : (property.value || property.defaultValue);
                }

                if (property.properties && property.properties.length) {
                    property.properties.forEach(p => fillDefaultValues(p, overwrite));
                }

                return property;
            };

            var getInitialAlias = function(useGuid) {
                return useGuid ? GUID.create() : "";
            };

            var flushAliases = function(property, useGuid) {
                property.alias = getInitialAlias(useGuid);
                if (property.properties && property.properties.length) {
                    property.properties.forEach(p => flushAliases(p, useGuid));
                }
                return property;
            };

            return {
                fillDefaultValues,
                flushAliases,

                getFieldTypes: () => fieldTypes,
                getFormulaLanguages: () => formulaLanguages,

                copyTemplate: function(label, template) {
                    this.label = label;
                    this.template = template;
                },

                page: function(useGuid) {
                    this.i18n = "";
                    this.name = "";
                    this.type = "page";
                    this.alias = getInitialAlias(useGuid)
                    this.properties = [];
                },

                group: function(useGuid) {
                    this.i18n = "";
                    this.name = "";
                    this.type = "group";
                    this.alias = getInitialAlias(useGuid);
                    this.properties = [];
                    this.isInline = false;
                    this.isMultiple = false;
                    this.barcodeSplit = 'separator';
                },

                field: function(type, options, useGuid) {
                    angular.extend(this, options);
                    this.i18n = "";
                    this.name = "";
                    this.type = type;
                    this.alias = getInitialAlias(useGuid);
                    this.isBarcode = false;
                },

                validator: function(structure) {
                    var that = this;
                    that.structure = structure;
                    that.isValid = true;

                    function validationReset(property) {
                        if (property.type) property.invalid = false;
                        property.properties && property.properties.forEach(p => validationReset(p));
                    }

                    that.reset = function() {
                        validationReset(that.structure);
                        that.isValid = true;
                    };

                    that.validate = function(property, validatorFn, propertyPredicate) {
                        if (property.type && (!propertyPredicate || (propertyPredicate && propertyPredicate(property)))) {
                            property.invalid = property.invalid || !validatorFn(property);
                            that.isValid = that.isValid && !property.invalid;
                        }
                        property.properties && property.properties.forEach(p => that.validate(p, validatorFn, propertyPredicate));
                    };

                    that.validateFieldsNameNotNull = function() {
                        that.validate(that.structure, p => {
                            return !!p.name;
                        }, p => {
                            return p.type != 'page' && p.type != 'group'
                        });
                    };

                    that.validateAliasNotNull = function() {
                        that.validate(that.structure, p => {
                            return !!p.alias;
                        });
                    };
                }
            }
        }]);
})();