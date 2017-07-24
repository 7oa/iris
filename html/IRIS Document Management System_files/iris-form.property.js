(function(undefined) {
    angular.module('irisForm')
        .directive('irisFormProperty', function($translate, $compile, $timeout, $filter, BuildingService, ProjectsService, FilesService) {
            return {
                restrict: 'AE',

                scope: {
                    property: '=',
                    propertyContainer: '=?',
                    rootForm: "=",
                    rootData: "=",
                    document: '=',
                    ngModel: '='
                },

                template: '',

                link: function(scope, element, attrs) {
                    var readonly = attrs["readonly"] == "true",
                        fillDefault = attrs["fillDefault"] == "true",
                        inline = attrs["inline"] == "true",
                        forDefault = attrs["forDefault"] == "true",
                        fullPath = attrs["fullPath"] || '',
                        subPath = attrs["subPath"] || '';

                    if (scope.property.type == "SVG") {
                        scope.damagesDataPath = `${fullPath.substring(0, fullPath.lastIndexOf("["))}["damages"]`;
                        //console.log(scope.damagesDataPath);

                        scope.getPointTooltip = function(point) {
                            var damageProperties = scope.propertyContainer.properties.find(t => t.alias == "damages");
                            damageProperties && (damageProperties = damageProperties.properties);

                            var res = "";
                            if (damageProperties) {
                                for (let i = 0; i < damageProperties.length; i++) {
                                    if (damageProperties[i].settings.isHidden) continue;
                                    res += point[damageProperties[i].alias] ? `${damageProperties[i].type == "BOOLEAN" ? $filter("irisTranslate")(damageProperties[i].name, damageProperties[i].translations.name) : point[damageProperties[i].alias]} | ` : '';
                                }
                            } else {
                                for (var pName in point) {
                                    if (point.hasOwnProperty(pName) && pName.indexOf("$") != 0) {
                                        res += point[pName] ? `${point[pName]} | ` : '';
                                    }
                                }
                            }
                            return res.substring(0, res.length - 2);
                        };

                        scope.getPointStyle = function(id, point) {
                            var svg = angular.element(`#${id}`),
                                svgWidth = svg.width(),
                                svgHeight = svg.height(),
                                backColor = point["color"] && (point["color"].length == 7) ? point["color"] : "#93be3d";
                            return {
                                'top': point["positionTop"] * svgHeight / 1000 - 15,
                                'left': point["positionLeft"] * svgWidth / 1000 - 15,
                                'background-color': backColor,
                                'color': $filter('colorIsDark')(backColor) ? '#fff' : '#424242'
                            };
                        };
                    }

                    scope.property.settings || (scope.property.settings = {});
                    if (fillDefault & !scope.ngModel) scope.ngModel = scope.property.defaultValue;

                    function prepareScope() {
                        if (scope.property.type == "BUILDING") {
                            scope.buildings = [];

                            var typeFilter = scope.property.settings.buildingTypeIds && scope.property.settings.buildingTypeIds.length
                                ? { f: 'type', v: scope.property.settings.buildingTypeIds }
                                : null;

                            if (scope.property.settings.parentFieldPath) {
                                //console.log(`rootData${subPath + scope.property.settings.parentFieldPath}.id`);
                                var subBuildingInited = false;
                                scope.$watch(`rootData${subPath + scope.property.settings.parentFieldPath}.id`, (nv, ov) => {
                                    if (nv == ov && subBuildingInited) return;
                                    if (nv) {
                                        var parentFilter = [{ f: 'parentId', v: [nv] }];
                                        typeFilter && parentFilter.push(typeFilter);
                                        BuildingService.query(parentFilter).then(res => {
                                            res.sort((a, b) => b.order - a.order);
                                            scope.buildings = res;
                                        });
                                    } else {
                                        scope.buildings = [];
                                    }
                                    subBuildingInited = true;
                                });
                            } else {
                                if (scope.document && scope.document.projectId) {
                                    var projectFilterParams = { projectId: scope.document.projectId };
                                    typeFilter && (projectFilterParams.filter = angular.toJson([typeFilter]));
                                    ProjectsService.getProjectBuildingsByProjectId(projectFilterParams).$promise.then(res => {
                                        res.sort((a,b) => b.order - a.order);
                                        scope.buildings = res.filter(t => t.parentId == null);
                                    });
                                } else {
                                    var nullParentFilter = [{ f: 'parentId', v: [null] }];
                                    typeFilter && nullParentFilter.push(typeFilter);
                                    BuildingService.query(nullParentFilter).then(res => {
                                        res.sort((a,b) => b.order - a.order);
                                        scope.buildings = res;
                                    });
                                }
                            }
                        } else if (scope.property.type == "ATTACHMENT") {
                            scope.files = [];
                            scope.ngModel && FilesService.getFilesByIds(scope.ngModel).then(fRes => {
                                scope.files = fRes;
                            });
                            scope.$watch("files.length", function() {
                                scope.ngModel = scope.files.map(f => f.id);
                                // var fileIds = scope.files.map(f => f.id);
                                // scope.ngModel && scope.ngModel.forEach(fileId => {
                                //     if (fileIds.indexOf(fileId) < 0) {
                                //         scope.ngModel.splice(scope.ngModel.indexOf(fileId), 1);
                                //     }
                                // });
                            });
                        }
                    }
                    prepareScope();

                    function recompileDisplay() {
                        var template;

                        if (scope.property.type == "IMAGE") {
                            template = `<div class="form-group">
                                            <div class="col-xs-12">
                                                <p class="form-control-static" style="text-align: center;">
                                                    <img ng-src="{{property.defaultValue}}" style="max-height: 400px; max-width: 100%" alt="{{property.name}}" />
                                                </p>
                                            </div>
                                        </div>`;
                        } else if (scope.property.type == "RELATED_PLANS") {
                            if (inline) {
                                template = `<div class="form-group">
                                                <iris-form-property-related-plans property="property" document="document" ng-model="ngModel" readonly="true"></iris-form-property-related-plans>
                                            </div>`;
                            } else {
                                template = `<div class="form-group">
                                                <label class="col-xs-${scope.property.settings.labelOffset || 3} control-label">{{property.name}}</label>
                                                <div class="col-xs-${12 - (scope.property.settings.labelOffset || 3)}">
                                                    <iris-form-property-related-plans property="property" document="document" ng-model="ngModel" readonly="true"></iris-form-property-related-plans>
                                                </div>
                                            </div>`;
                            }
                        } else if (scope.property.type == "SVG") {
                            template = `<div class="form-group">
                                            <div class="col-xs-12">
                                                <div class="iris-form-svg-container" id="${scope.property.alias}">
                                                    <img ng-src="{{propertyContainer.settings.image}}" style="width: 100%" alt="{{propertyContainer.name}}" />
                                                    <svg class="iris-form-svg" compile="ngModel"></svg>
                                                    <div ng-repeat='point in rootData${scope.damagesDataPath}' class="iris-form-svg-point"
                                                         uib-tooltip="{{getPointTooltip(point)}}"
                                                         ng-style="getPointStyle(property.alias, point)">{{$index + 1}}</div>
                                                </div>
                                            </div>
                                        </div>`;
                        } else if (scope.property.type == "ATTACHMENT") {
                            template = `<div class="form-group">
                                            <div class="col-xs-12">
                                                <h5>{{property.name}}</h5>
                                                    <hr>
                                                <files-list files="files"></files-list>
                                            </div>
                                        </div>`;
                        } else {
                            template = `<div class="form-group"> `;

                            if (inline) {
                                template += `<div class="col-xs-12"><p class="col-xs-12 form-control-static"> `;
                            } else {
                                template += `<label class="col-xs-${scope.property.settings.labelOffset || 3} control-label">{{property.name}}</label><div class="col-xs-${12 - (scope.property.settings.labelOffset || 3)}"><p class="form-control-static"> `
                            }

                            switch (scope.property.type) {
                                case "TEXT":
                                case "BARCODE":
                                    template += `{{ngModel}}`;
                                    break;
                                case "TEXTAREA":
                                    template += `{{ngModel}}`;
                                    break;
                                case "NUMBER":
                                    template += `{{ngModel}}`;
                                    break;
                                case "FLOAT":
                                    if (scope.property.settings.decimals === undefined || scope.property.settings.decimals === null) {
                                        template += `{{ngModel}}`;
                                    } else {
                                        template += `{{ngModel | number:${scope.property.settings.decimals}}}`;
                                    }
                                    break;
                                case "BOOLEAN":
                                    template += scope.ngModel ? `<i class="fa fa-check-square-o"></i>` : `<i class="fa fa-square-o"></i>`;
                                    break;
                                case "DATE":
                                    template += `{{ngModel | irisTime:this:'@{date}'}}`;
                                    break;
                                case "DATETIME":
                                    template += `{{ngModel | irisTime:this:'@{datetime}'}}`;
                                    break;
                                case "SELECTION":
                                    if (scope.property.settings.isMultiple) {
                                        scope.ngModel || (scope.ngModel = []);
                                        var val = "";
                                        for (let i = 0; i < scope.ngModel.length; i++) {
                                            if (i > 0) val += " | ";
                                            val += scope.ngModel[i];
                                        }
                                        template += val;
                                    } else {
                                        template += `{{ngModel}}`;
                                    }
                                    break;
                                case "RADIO":
                                    template += `{{ngModel}}`;
                                    break;
                                case "BUILDING":
                                    if (scope.property.settings.isMultiple) {
                                        scope.ngModel || (scope.ngModel = []);
                                        var val = "";
                                        for (let i = 0; i < scope.ngModel.length; i++) {
                                            if (i > 0) val += " | ";
                                            val += $filter("IrisFilterField")(scope.ngModel[i].id, [scope.buildings]);
                                        }
                                        template += val;
                                    } else {
                                        scope.getBuildingColor = function(model) {
                                            return model && model.id ? $filter("IrisFilterField")(model.id, [scope.buildings, "color"]) : null;
                                        };
                                        template += `<span ng-if="ngModel"><i class="fa fa-fw fa-circle" ng-style="{color: getBuildingColor(ngModel)}"></i>  [{{ngModel.id | IrisFilterField:[buildings, "code"]}}] {{ngModel.id | IrisFilterField:[buildings]}}</span>`;
                                    }
                                    break;
                            }

                            template += `</p></div></div>`;
                        }

                        element.html($compile(template)(scope));
                    }

                    function recompileEditor() {
                        var template;

                        if (scope.property.type == "IMAGE") {
                            template = `<div class="form-group">
                                            <div class="col-xs-12">
                                                <p class="form-control-static" style="text-align: center;">
                                                    <img ng-src="{{property.defaultValue}}" style="max-height: 400px; max-width: 100%" alt="{{property.name}}" />
                                                </p>
                                            </div>
                                        </div>`;
                        } else if (scope.property.type == "RELATED_PLANS") {
                            if (inline) {
                                template = `<div class="form-group">
                                                <iris-form-property-related-plans property="property" document="document" ng-model="ngModel"></iris-form-property-related-plans>
                                            </div>`;
                            } else {
                                template = `<div class="form-group">
                                                <label class="col-xs-${scope.property.settings.labelOffset || 3} control-label">{{property.name}}</label>
                                                <div class="col-xs-${12 - (scope.property.settings.labelOffset || 3)}">
                                                    <iris-form-property-related-plans property="property" document="document" ng-model="ngModel"></iris-form-property-related-plans>
                                                </div>
                                            </div>`;
                            }
                        } else if (scope.property.type == "RADIO") {
                            if (inline) {
                                template = ``;
                            } else {
                                template = `<div class="form-group">
                                                <label class="col-xs-${scope.property.settings.labelOffset || 3} control-label">{{property.name}}</label>
                                                <div class="col-xs-${12 - (scope.property.settings.labelOffset || 3)}">`;
                            }

                            template += `<div class="btn-group" ${inline ? '' : 'style="margin-bottom: 15px"'}>`;
                            scope.property.settings.options || (scope.property.settings.options = []);
                            scope.property.settings.options.forEach(o => {
                                template += `<label class="btn btn-default" ng-model="ngModel" uib-btn-radio="'${o}'">${o}</label>`;
                            });
                            template += `</div>`;

                            if (!inline) template += `</div></div>`;
                        } else if (scope.property.type == "SVG") {
                            console.log(scope.damagesDataPath, scope.rootData);
                            template = `<div class="form-group">
                                            <div class="col-xs-12">
                                                <div class="iris-form-svg-container" id="${scope.property.alias}">
                                                    <img ng-src="{{propertyContainer.settings.image}}" style="width: 100%" alt="{{propertyContainer.name}}" />
                                                    <svg class="iris-form-svg" compile="ngModel"></svg>
                                                    <div ng-repeat='point in rootData${scope.damagesDataPath}' class="iris-form-svg-point"
                                                         uib-tooltip="{{getPointTooltip(point)}}"
                                                         ng-style="getPointStyle(property.alias, point)">{{$index + 1}}</div>
                                                </div>
                                            </div>
                                        </div>`;
                        } else if (scope.property.type == "ATTACHMENT") {
                            template = `<div class="form-group">
                                            <div class="col-xs-12">
                                                <h5>{{property.name}}
                                                    <button class="btn btn-success btn-xs pull-right" ng-click="attachFiles(property)">
                                                        <i class="fa fa-fw fa-plus"></i>
                                                        {{::'label.Add' | translate}}
                                                    </button>
                                                </h5>
                                                <hr>
                                                <files-list files="files" allow-remove="true"></files-list>
                                            </div>
                                        </div>`;
                        } else if (scope.property.settings.isRange) {
                            function getNumberTemplate(alias) {
                                var res = `<div iris-field iris-field-offset="0" type="number" `;
                                if (scope.property.settings.min) res += `min=${scope.property.settings.min} `;
                                if (scope.property.settings.max) res += `max=${scope.property.settings.max} `;
                                if (scope.property.type == "NUMBER") {
                                    res += `step="1" `;
                                } else if (scope.property.type == "FLOAT") {
                                    res += `step="0.${$filter("irisLeadingZeros")(1, scope.property.settings.digits)}" `;
                                }
                                res += `placeholder="label.${alias}" ng-model="ngModel.${alias.toLowerCase()}"></div>`;
                                return res;
                            }

                            template = `<div class="form-group iris-form-split-control">
                                            <label class="control-label col-md-5">{{property.name}}</label>
                                            <div class="iris-form-split-control-left">
                                                ${getNumberTemplate("From")}
                                            </div>
                                            <div class="iris-form-split-control-right">
                                                ${getNumberTemplate("To")}
                                            </div>
                                        </div>`;

                            template += ``;
                        } else {
                            template = `<div iris-field `;

                            if (inline) {
                                template += `inline iris-field-offset="0" class="iris-form-property-inline"`;
                            } else {
                                template += `iris-field-label="{{property.name}}" iris-field-offset="${scope.property.settings.labelOffset || 3}" `
                            }

                            if ((scope.property.settings.isDisabled && !forDefault) || scope.property.settings.isCalculated || (scope.propertyContainer && scope.propertyContainer.type == 'FORM' && scope.propertyContainer.settings.isBarcode && scope.property.type != 'BARCODE')) {
                                template += `disabled="true" `;
                            }

                            if (scope.property.settings.isRequired && !forDefault) {
                                template += `required="true" `;
                            }

                            switch (scope.property.type) {
                                case "TEXT":
                                    template += `type="text" `;
                                    if (scope.property.settings.minLength) template += `min-length=${scope.property.settings.minLength} `;
                                    if (scope.property.settings.maxLength) template += `max-length=${scope.property.settings.maxLength} `;
                                    break;
                                case "BARCODE":
                                    template += `type="text" ng-change="processBarcode()" ng-model-options="{ updateOn: 'blur' }" `;
                                    break;
                                case "TEXTAREA":
                                    template += `type="textarea" height="${scope.property.settings.height || 70}" `;
                                    break;
                                case "NUMBER":
                                    template += `type="number" step="1" `;
                                    if (scope.property.settings.min) template += `min=${scope.property.settings.min} `;
                                    if (scope.property.settings.max) template += `max=${scope.property.settings.max} `;
                                    break;
                                case "FLOAT":
                                    template += `type="number" step="0.${$filter("irisLeadingZeros")(1, scope.property.settings.digits)}" `;
                                    if (scope.property.settings.min) template += `min=${scope.property.settings.min} `;
                                    if (scope.property.settings.max) template += `max=${scope.property.settings.max} `;
                                    break;
                                case "BOOLEAN":
                                    template += `type="checkbox" `;
                                    break;
                                case "DATE":
                                    template += `type="date" `;
                                    break;
                                case "DATETIME":
                                    template += `type="datetime" `;
                                    break;
                                case "SELECTION":
                                    scope.property.settings.options || (scope.property.settings.options = []);
                                    scope.optionsDirectory = scope.property.settings.options.map(o => {
                                        return {value: o};
                                    });
                                    template += `type="selectize" iris-select-directory="optionsDirectory" iris-select-text="value" iris-select-value="value" `;
                                    if (scope.property.settings.isMultiple) template += `multiple="true" `;
                                    break;
                                case "BUILDING":
                                    template += `type="selectize" iris-select-directory="buildings" iris-select-sort-field="order" `;
                                    if (scope.property.settings.isMultiple) template += `multiple="true" `;
                                    break;
                            }

                            var innerNgModel = element.find('input').length > 0
                                ? element.find('input').controller('ngModel')
                                : element.find('select').controller('ngModel');
                            if (innerNgModel) {
                                innerNgModel.$formatters = [];
                                innerNgModel.$parsers = [];
                            }

                            template += `ng-model="${scope.property.type == "BUILDING" ? 'ngModel.id' : 'ngModel'}"></div>`;
                        }

                        element.html($compile(template)(scope));
                    }

                    scope.processBarcode = function() {
                        $timeout(function() {
                            if (!scope.propertyContainer || scope.propertyContainer.type != 'FORM' || !scope.propertyContainer.settings || !scope.propertyContainer.settings.isBarcode || !scope.propertyContainer.properties) return;
                            var newValue = scope.ngModel,
                                barcodeProperties = scope.propertyContainer.properties.filter(t => t.type != 'BARCODE');

                            switch (scope.propertyContainer.settings.barcodeSeparationType) {
                                case "symbol":
                                    if (!scope.propertyContainer.settings.barcodeSeparator) return;
                                    var barcodeParts = newValue.split(scope.propertyContainer.settings.barcodeSeparator);
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

                    scope.attachFiles = function(property) {
                        FilesService.openSelectFileModal({hideSystemFolders: true, multiple: !!property.settings.isMultiple}).then(selectedFiles => {
                            if (selectedFiles && selectedFiles.length) {
                                if (property.settings.isMultiple) {
                                    selectedFiles.forEach(f => scope.files.push(f));
                                } else {
                                    scope.files = selectedFiles;
                                }
                            } else {
                                scope.files = [];
                            }
                            scope.ngModel = scope.files.map(f => f.id);
                        });
                    };

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