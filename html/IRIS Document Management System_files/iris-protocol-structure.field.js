(function(undefined) {
    angular.module('irisProtocolStructure')
        .directive('irisProtocolStructureField', function($translate, $compile, $timeout, IrisProtocolStructureService) {
            return {
                restrict: 'AE',

                scope: {
                    property: '=',
                    parent: '=?',
                    ngModel: '='
                },

                template: '',

                link: function(scope, element, attrs) {
                    var readonly = attrs["readonly"] == "true",
                        inline = attrs["inline"] == "true",
                        intable = attrs["intable"] == "true",
                        isDefault = attrs["isDefault"] == "true",
                        optionsReady = false;

                    scope.property.settings || (scope.property.settings = {});

                    function recompileDisplay() {
                        var template;

                        if (scope.property.type == "image") {
                            template = `<div class="form-group">
                                            <div class="col-xs-12">
                                                <p class="form-control-static" style="text-align: center;">
                                                    <img ng-src="{{property.defaultValue}}" style="max-height: 400px; max-width: 100%" alt="{{property.name}}" />
                                                </p>
                                            </div>
                                        </div>`;
                        } else if (scope.property.type == "relatedPlans") {
                            if (inline) {
                                template = `<div class="form-group">
                                                <iris-protocol-structure-field-plans property="property" ng-model="ngModel" readonly="true"></iris-protocol-structure-field-plans>
                                            </div>`;
                            } else {
                                template = `<div class="form-group">
                                                <label class="col-xs-5 control-label">{{property.name}}</label>
                                                <div class="col-xs-7">
                                                    <iris-protocol-structure-field-plans property="property" ng-model="ngModel" readonly="true"></iris-protocol-structure-field-plans>
                                                </div>
                                            </div>`;
                            }
                        } else {
                            template = `<div class="form-group"> `;

                            if (inline) {
                                if (intable) {
                                    template += `<div><p class="form-control-static"> `;
                                } else {
                                    template += `<div class="col-xs-12"><p class="col-xs-12 form-control-static"> `;
                                }
                            } else {
                                template += `<label class="col-xs-5 control-label">{{property.name}}</label><div class="col-xs-7"><p class="form-control-static"> `
                            }

                            switch (scope.property.type) {
                                case "text":
                                case "barcode":
                                    template += `{{property.value}}`;
                                    break;
                                case "textarea":
                                    template += `{{property.value}}`;
                                    break;
                                case "integer":
                                    template += `{{property.value}}`;
                                    break;
                                case "float":
                                    if (scope.property.settings.decimals === undefined || scope.property.settings.decimals === null) {
                                        template += `{{property.value}}`;
                                    } else {
                                        template += `{{property.value | number:${scope.property.settings.decimals}}}`;
                                    }
                                    break;
                                case "boolean":
                                    template += scope.property.value ? `<i class="fa fa-check-square-o"></i>` : `<i class="fa fa-square-o"></i>`;
                                    break;
                                case "date":
                                    template += `{{property.value | irisTime:this:'@{date}'}}`;
                                    break;
                                case "datetime":
                                    template += `{{property.value | irisTime:this:'@{datetime}'}}`;
                                    break;
                                case "selection":
                                    if (scope.property.settings.isMultiple) {
                                        scope.property.value || (scope.property.value = []);
                                        var val = "";
                                        for (let i = 0; i < scope.property.value.length; i++) {
                                            if (i > 0) val += " | ";
                                            val += scope.property.value[i];
                                        }
                                        template += val;
                                    } else if (scope.property.value) {
                                        template += `{{property.value}}`;
                                    } else {
                                        template += "{{::'label.noSelection' | translate}}"
                                    }
                                    break;
                                case "radio":
                                    template += `{{property.value}}`;
                                    break;
                            }

                            template += `</p></div></div>`;
                        }

                        element.html($compile(template)(scope));
                    }

                    function recompileEditor() {
                        var template;

                        if (scope.property.type == "image") {
                            template = `<div class="form-group">
                                            <div class="col-xs-12">
                                                <p class="form-control-static" style="text-align: center;">
                                                    <img ng-src="{{property.defaultValue}}" style="max-height: 400px; max-width: 100%" alt="{{property.name}}" />
                                                </p>
                                            </div>
                                        </div>`;
                        } else if (scope.property.type == "relatedPlans") {
                            if (inline) {
                                template = `<div class="form-group">
                                                <iris-protocol-structure-field-plans property="property" ng-model="ngModel"></iris-protocol-structure-field-plans>
                                            </div>`;
                            } else {
                                template = `<div class="form-group">
                                                <label class="col-xs-5 control-label">{{property.name}}</label>
                                                <div class="col-xs-7">
                                                    <iris-protocol-structure-field-plans property="property" ng-model="ngModel"></iris-protocol-structure-field-plans>
                                                </div>
                                            </div>`;
                            }
                        } else if (scope.property.type == "radio") {
                            if (inline) {
                                template = ``;
                            } else {
                                template = `<div class="form-group">
                                                <label class="col-xs-5 control-label">{{property.name}}</label>
                                                <div class="col-xs-7">`;
                            }

                            template += `<div class="btn-group" style="margin-bottom: 15px">`;
                            scope.property.settings.options || (scope.property.settings.options = []);
                            scope.property.settings.options.forEach(o => {
                                template += `<label class="btn btn-default" ng-model="ngModel" uib-btn-radio="'${o}'">${o}</label>`;
                            });
                            template += `</div>`;

                            if (!inline) template += `</div></div>`;
                        } else {
                            template = `<div iris-field `;

                            if (inline) {
                                template += `inline iris-field-offset="0" `;
                            } else {
                                template += `iris-field-label="{{property.name}}" iris-field-offset="6" `
                            }

                            if (scope.property.settings.isCalculated || (scope.parent && scope.parent.type == 'group' && scope.parent.settings.isBarcode && scope.property.type != 'barcode')) {
                                template += `disabled="true" `;
                            }

                            if (scope.property.settings.isRequired && !isDefault) {
                                template += `required="true" `;
                            }

                            switch (scope.property.type) {
                                case "text":
                                    template += `type="text" `;
                                    break;
                                case "barcode":
                                    template += `type="text" ng-change="processBarcode()" ng-model-options="{ updateOn: 'blur' }"`;
                                    break;
                                case "textarea":
                                    template += `type="textarea" height="${scope.property.settings.height || 70}" `;
                                    break;
                                case "integer":
                                    template += `type="number" step="1" `;
                                    break;
                                case "float":
                                    template += `type="number" step="any" `;
                                    break;
                                case "boolean":
                                    template += `type="checkbox" `;
                                    break;
                                case "date":
                                    template += `type="date" `;
                                    break;
                                case "datetime":
                                    template += `type="datetime" `;
                                    break;
                                case "selection":
                                    scope.property.settings.options || (scope.property.settings.options = []);
                                    scope.optionsDirectory = scope.property.settings.options.map(o => {
                                        return {value: o};
                                    });
                                    template += `type="selectize" iris-select-null="label.PleaseSelect" iris-select-directory="optionsDirectory" iris-select-text="value" iris-select-value="value" `;
                                    if (scope.property.settings.isMultiple) {
                                        if(!scope.property.value || scope.property.value.length == 0)
                                        scope.property.value = scope.property.defaultValue;
                                        template += `multiple="true" `;
                                    }
                                    break;
                            }

                            var innerNgModel = element.find('input').length > 0
                                ? element.find('input').controller('ngModel')
                                : element.find('select').controller('ngModel');
                            if (innerNgModel) {
                                innerNgModel.$formatters = [];
                                innerNgModel.$parsers = [];
                            }

                            template += `ng-model="ngModel"></div>`;
                        }

                        element.html($compile(template)(scope));
                    }

                    scope.processBarcode = function() {
                        $timeout(function() {
                            if (!scope.parent || scope.parent.type != 'group' || !scope.parent.settings || !scope.parent.settings.isBarcode || !scope.parent.properties) return;
                            var newValue = scope.ngModel,
                                barcodeProperties = scope.parent.properties.filter(t => t.type != 'barcode');

                            switch (scope.parent.settings.barcodeSplit) {
                                case "separator":
                                    if (!scope.parent.settings.barcodeSeparator) return;
                                    var barcodeParts = newValue.split(scope.parent.settings.barcodeSeparator);
                                    for (let i = 0; i < barcodeProperties.length; i++) {
                                        barcodeProperties[i].value = i < barcodeParts.length ? barcodeParts[i] : "";
                                    }
                                    break;
                                case "length":
                                    barcodeProperties.forEach(p => {
                                        if (!p.settings) return;
                                        p.value = newValue.substring(p.settings.barcodeFrom, p.settings.barcodeTo + 1);
                                    });
                                    break;
                            }
                        });
                    };

                    //function recompile(afterOptions) {
                    //    if (readonly) {
                    //        recompileDisplay(afterOptions);
                    //    } else {
                    //        recompileEditor(afterOptions);
                    //    }
                    //
                    //    afterOptions && (optionsReady = true);
                    //}
                    //recompile();

                    //scope.$watch("property.type", function(nv, ov) {
                    //    if (!nv || nv == ov) return;
                    //    scope.property.defaultValue = null;
                    //    recompile();
                    //});
                    //scope.$watch("property.options", function(nv, ov) {
                    //    if (!nv || nv == ov) return;
                    //    if (optionsReady) scope.property.defaultValue = null;
                    //    recompile(true);
                    //});
                    //scope.$watch("property.multiple", function(nv, ov) {
                    //    if (nv == ov) return;
                    //    scope.property.defaultValue = null;
                    //    recompile();
                    //});

                    function recompile() {
                        if (readonly) {
                            recompileDisplay();
                        } else {
                            recompileEditor();
                        }
                    }
                    recompile();

                    scope.$watch("property.settings", function(nv, ov) {
                        if (angular.equals(nv, ov)) return;
                        recompile();
                    }, true);
                }
            };
        });
})();