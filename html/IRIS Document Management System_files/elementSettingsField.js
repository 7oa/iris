(function () {
    angular.module('iris_sensorboards').directive('elementSettingsField',
        function ($q, $filter, $compile) {
            return {
                restrict: 'E',
                template: '',

                link: function (scope, element, attrs) {
                    var template = "",
                        modelName = attrs["ngModel"];

                    switch (scope.field.editor) {
                        case "field":
                            var params = "";
                            scope.field.params && scope.field.params.forEach(p => {
                                params += `${p.name}="${p.value}"`;
                            });
                            if (scope.field.if) {
                                params += ` ng-if="${modelName}.${scope.field.if}"`;
                            }
                            if (scope.field.type == "range") {
                                params += ` uib-tooltip="{{${modelName}.${scope.field.name}}} px"`;
                            }
                            template = `<div iris-field
                                             iris-field-label="{{::'${scope.field.label}' | translate}}"
                                             iris-field-offset="5"
                                             type="${scope.field.type}"
                                             ${params}
                                             ng-model="${modelName}.${scope.field.name}"></div>`;
                            break;
                        case "icon":
                            template = `<div class="form-group">
                                            <div class="col-md-12">
                                                <button class="btn-link btn-xs pull-right"
                                                        ng-click="openIconSelectionModal(${modelName})">
                                                    <i class="fa fa-fw fa-cog"></i>
                                                    {{::'label.sensorboards.SelectIcon' | translate}}
                                                </button>
                                            </div>
                                        </div>
                                        <div iris-field
                                             iris-field-label="{{::'${scope.field.label}' | translate}}"
                                             iris-field-offset="5"
                                             type="text"
                                             ng-model-options="{ updateOn: 'default blur', debounce: { 'default': 500, 'blur': 0 } }"
                                             ng-model="${modelName}.${scope.field.name}"></div>`;
                            break;
                        case "image":
                            template = `<div class="form-group">
                                            <div class="col-md-12">
                                                <a href="javascript:void(0)"
                                                   ng-click="openFilesModal(${modelName}, '${scope.field.name}')"
                                                   class="preview-picture">
                                                    <img ng-src="{{${modelName}.${scope.field.name} | dmsFilePreview}}"
                                                         uib-tooltip="{{::'label.sensorboards.ClickToChangeImage' | translate}}"
                                                         ng-show="${modelName}.${scope.field.name}"
                                                         class="resize"/>
                                                </a>
                                            </div>
                                        </div>`;
                            break;
                        case "fontStyle":
                            template = `<div class="form-group">
                                            <div class="col-md-12">
                                                <div class="btn-group">
                                                    <ul class="nav nav-pills nav-justified">
                                                        <li ng-class="{active: ${modelName}.bold}">
                                                            <a href="javascript:void(0)"
                                                               ng-click="${modelName}.bold = !${modelName}.bold">
                                                                <i class="fa fa-fw fa-bold"></i>
                                                                {{::'label.Bold' | translate}}
                                                            </a>
                                                        </li>
                                                        <li ng-class="{active: ${modelName}.italic}">
                                                            <a href="javascript:void(0)"
                                                               ng-click="${modelName}.italic = !${modelName}.italic">
                                                                <i class="fa fa-fw fa-italic"></i>
                                                                {{::'label.Italic' | translate}}
                                                            </a>
                                                        </li>
                                                        <li ng-class="{active: ${modelName}.underlined}">
                                                            <a href="javascript:void(0)"
                                                               ng-click="${modelName}.underlined = !${modelName}.underlined">
                                                                <i class="fa fa-fw fa-underline"></i>
                                                                {{::'label.Underline' | translate}}
                                                            </a>
                                                        </li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>`;
                    }

                    element.html($compile(template)(scope));
                }
            };
        });
})();