(function() {
    angular.module('irisForm')
        .factory('IrisFormStructureService', function (GUID, $translate) {
            var propertyTypes =  [
                { id: "FORM", name: $translate.instant("label.Form"), defaultSettings: {layout: "group", barcodeSeparationType: "symbol", barcodeSeparator: "-", properties: []}, hasExtraEditor: true },
                { id: "BARCODE", name: $translate.instant("label.Barcode"), defaultSettings: {}, hasExtraEditor: false },
                { id: "TEXT", name: $translate.instant("label.Text"), defaultSettings: {}, hasExtraEditor: true },
                { id: "TEXTAREA", name: $translate.instant("label.TextArea"), defaultSettings: {height: 100}, hasExtraEditor: true },
                { id: "FLOAT", name: $translate.instant("label.Float"), defaultSettings: {digits: 3}, hasExtraEditor: true },
                { id: "NUMBER", name: $translate.instant("label.Number"), defaultSettings: {}, hasExtraEditor: true },
                { id: "BOOLEAN", name: $translate.instant("label.Boolean"), defaultSettings: {}, hasExtraEditor: false },
                { id: "DATE", name: $translate.instant("label.Date"), defaultSettings: {}, hasExtraEditor: false },
                { id: "DATETIME", name: $translate.instant("label.DateTime"), defaultSettings: {}, hasExtraEditor: false },
                { id: "SELECTION", name: $translate.instant("label.Selection"), defaultSettings: {options: [], isMultiple: false}, hasExtraEditor: true },
                { id: "RADIO", name: $translate.instant("label.RadioButtons"), defaultSettings: {options: [$translate.instant("label.NoInformation")]}, hasExtraEditor: true },
                { id: "IMAGE", name: $translate.instant("label.Image"), defaultSettings: {}, hasExtraEditor: true, noDefault: true },
                { id: "RELATED_PLANS", name: $translate.instant("label.dpm.RelatedPlans"), defaultSettings: {}, hasExtraEditor: false, noDefault: true },
                { id: "BUILDING", name: $translate.instant("label.Building"), defaultSettings: {}, hasExtraEditor: true },
                { id: "ATTACHMENT", name: $translate.instant("label.Attachments"), defaultSettings: {isMultiple: true}, hasExtraEditor: true, noDefault: true },
                { id: "SVG", name: "SVG", defaultSettings: {}, hasExtraEditor: false, noDefault: true }
            ];

            var formulaLanguages = [
                { id: "GROOVY", name: "Groovy" },
                { id: "MATHLAB", name: "MathLab" },
                { id: "R", name: "R" }
            ];

            var formLayouts = [
                { id: "group", name: $translate.instant("label.Group") },
                { id: "dynamicImage", name: $translate.instant("label.DynamicImage") }
            ];

            var fillDefaultValues = function(property, overwrite) {
                property.value = overwrite ? property.defaultValue : (property.value || property.defaultValue);

                if (property.properties && property.properties.length) {
                    property.properties.forEach(p => fillDefaultValues(p, overwrite));
                }

                return property;
            };

            var getInitialAlias = function(aliasType) {
                switch (aliasType) {
                    case "GUID":
                        return GUID.create();
                }
                return "";
            };

            var flushAlias = function(property, aliasType) {
                property.alias = getInitialAlias(aliasType);
                return property;
            }

            var flushAliases = function(property, aliasType) {
                flushAlias(property, aliasType);
                if (property.properties && property.properties.length) {
                    property.properties.forEach(p => flushAliases(p, aliasType));
                }
                return property;
            };

            var property = function(type, options, aliasType) {
                angular.extend(this, options);

                (type == "FORM") && (this.properties = []);

                this.name = "";
                this.type = type;
                this.alias = getInitialAlias(aliasType);
            };

            return {
                fillDefaultValues,
                flushAliases,
                flushAlias,

                getPropertyTypes: () => propertyTypes,
                getFormulaLanguages: () => formulaLanguages,
                getFormLayouts: () => formLayouts,

                getInlineMaxLength: () => 10,

                property,
                newProperty: function(propertyType, aliasType) {
                    return new property(propertyType.id, {settings: angular.copy(propertyType.defaultSettings || {})}, aliasType);
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

                    that.validateNameNotNull = function() {
                        that.validate(that.structure, p => {
                            return !!p.name;
                        }, p => {
                            return p.type != 'FORM'
                        });
                    };

                    that.validateAliasNotNull = function() {
                        that.validate(that.structure, p => {
                            return !!p.alias;
                        });
                    };
                }
            }
        });
})();