(function() {
    angular.module('iris_sensorboards')
        .constant('SensorboardsElementsSettings', {
            freeForm: {
                groups: [
                    { alias: "common", label: "label.Common", showHeader: false },
                    { alias: "view", label: "label.View", showHeader: false }
                ],
                fields: [
                    {
                        groupAlias: "common",
                        editor: "field",
                        type: "checkbox",
                        name: "viewObject.visible",
                        label: "label.Visible"
                    }, {
                        groupAlias: "view",
                        editor: "field",
                        type: "color",
                        name: "viewObject.fill",
                        label: "label.BackgroundColor"
                    }, {
                        groupAlias: "view",
                        editor: "field",
                        type: "color",
                        name: "viewObject.stroke",
                        label: "label.BorderColor"
                    }, {
                        groupAlias: "view",
                        editor: "field",
                        type: "range",
                        name: "viewObject.strokeWidth",
                        label: "label.BorderWidth",
                        params: [
                            { name: "min", value: "0" },
                            { name: "max", value: "10" }
                        ]
                    }, {
                        groupAlias: "view",
                        editor: "field",
                        type: "range",
                        name: "viewObject.opacity",
                        label: "label.Opacity",
                        params: [
                            { name: "min", value: "0" },
                            { name: "max", value: "1" },
                            { name: "step", value: "0.1" }
                        ]
                    }
                ]
            },

            icon: {
                groups: [
                    { alias: "common", label: "label.Common", showHeader: false },
                    { alias: "view", label: "label.View", showHeader: false }
                ],
                fields: [
                    {
                        groupAlias: "common",
                        editor: "field",
                        type: "checkbox",
                        name: "viewObject.visible",
                        label: "label.Visible"
                    }, {
                        groupAlias: "view",
                        editor: "icon",
                        name: "viewObject.charCode",
                        label: "label.sensorboards.Icon",
                        params: [
                            { name: "ng-model-options", value: "{ updateOn: 'default blur', debounce: { 'default': 500, 'blur': 0 } }" }
                        ]
                    }, {
                        groupAlias: "view",
                        editor: "field",
                        type: "color",
                        name: "viewObject.fill",
                        label: "label.Color"
                    }
                ]
            },

            image: {
                groups: [
                    { alias: "common", label: "label.Common", showHeader: false },
                    { alias: "view", label: "label.View", showHeader: false }
                ],
                fields: [
                    {
                        groupAlias: "common",
                        editor: "field",
                        type: "checkbox",
                        name: "viewObject.visible",
                        label: "label.Visible"
                    }, {
                        groupAlias: "view",
                        editor: "image",
                        name: "imageId",
                        label: "label.sensorboards.Picture"
                    }, {
                        groupAlias: "view",
                        editor: "field",
                        type: "range",
                        name: "viewObject.opacity",
                        label: "label.Opacity",
                        params: [
                            { name: "min", value: "0" },
                            { name: "max", value: "1" },
                            { name: "step", value: "0.1" }
                        ]
                    }
                ]
            },

            line: {
                groups: [
                    { alias: "common", label: "label.Common", showHeader: false },
                    { alias: "view", label: "label.View", showHeader: false }
                ],
                fields: [
                    {
                        groupAlias: "common",
                        editor: "field",
                        type: "checkbox",
                        name: "viewObject.visible",
                        label: "label.Visible"
                    }, {
                        groupAlias: "view",
                        editor: "field",
                        type: "range",
                        name: "viewObject.strokeWidth",
                        label: "label.Width",
                        params: [
                            { name: "min", value: "2" },
                            { name: "max", value: "100" }
                        ]
                    }, {
                        groupAlias: "view",
                        editor: "field",
                        type: "color",
                        name: "viewObject.stroke",
                        label: "label.Color"
                    }
                ]
            },

            managedText: {
                groups: [
                    { alias: "common", label: "label.Common", showHeader: false },
                    { alias: "font", label: "label.Font", showHeader: true },
                    { alias: "back", label: "label.Figure", showHeader: true },
                    { alias: "other", label: "label.Other", showHeader: false }
                ],
                fields: [
                    {
                        groupAlias: "common",
                        editor: "field",
                        type: "checkbox",
                        name: "viewObject.visible",
                        label: "label.Visible"
                    }, {
                        groupAlias: "font",
                        editor: "fontStyle",
                        name: ["bold", "italic", "underlined"],
                        label: "label.FontStyle"
                    }, {
                        groupAlias: "font",
                        editor: "field",
                        type: "selectize",
                        name: "viewObject.fontFamily",
                        label: "label.FontFamily",
                        params: [
                            { name: "iris-select-directory", value: "fonts" },
                            { name: "iris-select-value", value: "name" }
                        ]
                    }, {
                        groupAlias: "font",
                        editor: "field",
                        type: "range",
                        name: "viewObject.fontSize",
                        label: "label.FontSize",
                        params: [
                            { name: "min", value: "5" },
                            { name: "max", value: "40" }
                        ]
                    }, {
                        groupAlias: "font",
                        editor: "field",
                        type: "color",
                        name: "viewObject.fill",
                        label: "label.TextColor"
                    }, {
                        groupAlias: "back",
                        editor: "field",
                        type: "color",
                        name: "viewObject.backgroundColor",
                        label: "label.BackgroundColor"
                    }, {
                        groupAlias: "back",
                        editor: "field",
                        type: "checkbox",
                        name: "viewObject.borderVisible",
                        label: "label.ShowBorder"
                    }, {
                        if: "viewObject.borderVisible",
                        groupAlias: "back",
                        editor: "field",
                        type: "range",
                        name: "viewObject.borderWidth",
                        label: "label.BorderWidth",
                        params: [
                            { name: "min", value: "1" },
                            { name: "max", value: "10" }
                        ]
                    }, {
                        if: "viewObject.borderVisible",
                        groupAlias: "back",
                        editor: "field",
                        type: "color",
                        name: "viewObject.borderFill",
                        label: "label.BorderColor"
                    }, {
                        groupAlias: "other",
                        editor: "field",
                        type: "range",
                        name: "viewObject.opacity",
                        label: "label.Opacity",
                        params: [
                            { name: "min", value: "0" },
                            { name: "max", value: "1" },
                            { name: "step", value: "0.1" }
                        ]
                    }
                ]
            },

            progressBar: {
                groups: [
                    { alias: "common", label: "label.Common", showHeader: false },
                    { alias: "view", label: "label.View", showHeader: false },
                    { alias: "label", label: "label.Label", showHeader: true }
                ],
                fields: [
                    {
                        groupAlias: "common",
                        editor: "field",
                        type: "checkbox",
                        name: "viewObject.visible",
                        label: "label.Visible"
                    }, {
                        groupAlias: "view",
                        editor: "field",
                        type: "color",
                        name: "viewObject.fillProgress",
                        label: "label.FillColor"
                    }, {
                        groupAlias: "view",
                        editor: "field",
                        type: "color",
                        name: "viewObject.fill",
                        label: "label.BackgroundColor"
                    }, {
                        groupAlias: "view",
                        editor: "field",
                        type: "range",
                        name: "viewObject.opacity",
                        label: "label.Opacity",
                        params: [
                            { name: "min", value: "0" },
                            { name: "max", value: "1" },
                            { name: "step", value: "0.1" }
                        ]
                    }, {
                        groupAlias: "label",
                        editor: "field",
                        type: "checkbox",
                        name: "viewObject.showLabel",
                        label: "label.ShowLabel"
                    }, {
                        if: "viewObject.showLabel",
                        groupAlias: "label",
                        editor: "field",
                        type: "color",
                        name: "viewObject.fillLabel",
                        label: "label.TextColor"
                    }, {
                        if: "viewObject.showLabel",
                        groupAlias: "label",
                        editor: "field",
                        type: "text",
                        name: "viewObject.labelPlaceholder",
                        label: "label.DefaultText",
                        params: [
                            { name: "iris-field-description", value: "{{::'label.WhenValueNotAvailable' | translate}}" }
                        ]
                    }, {
                        if: "viewObject.showLabel",
                        groupAlias: "label",
                        editor: "field",
                        type: "range",
                        name: "viewObject.fontSize",
                        label: "label.FontSize",
                        params: [
                            { name: "min", value: "5" },
                            { name: "max", value: "40" }
                        ]
                    }
                ]
            },

            speedometer: {
                groups: [
                    { alias: "common", label: "label.Common", showHeader: false },
                    { alias: "view", label: "label.View", showHeader: false },
                    { alias: "gauge", label: "label.Gauge", showHeader: true },
                    { alias: "label", label: "label.Label", showHeader: true }
                ],
                fields: [
                    {
                        groupAlias: "common",
                        editor: "field",
                        type: "checkbox",
                        name: "viewObject.visible",
                        label: "label.Visible"
                    }, {
                        groupAlias: "view",
                        editor: "field",
                        type: "color",
                        name: "viewObject.progressFill",
                        label: "label.sensorboards.ArrowColor"
                    }, {
                        groupAlias: "view",
                        editor: "field",
                        type: "color",
                        name: "viewObject.centerPointFill",
                        label: "label.sensorboards.CenterPointColor"
                    }, {
                        groupAlias: "view",
                        editor: "field",
                        type: "color",
                        name: "viewObject.centerPointStrokeStyle",
                        label: "label.sensorboards.CenterPointBorder"
                    }, {
                        groupAlias: "view",
                        editor: "field",
                        type: "color",
                        name: "viewObject.backgroundFill",
                        label: "label.BackgroundColor"
                    }, {
                        groupAlias: "gauge",
                        editor: "field",
                        type: "color",
                        name: "viewObject.gaugeFill",
                        label: "label.sensorboards.GaugeColor"
                    }, {
                        groupAlias: "gauge",
                        editor: "field",
                        type: "range",
                        name: "viewObject.gaugeStepCount",
                        label: "label.sensorboards.GaugeStep",
                        params: [
                            { name: "min", value: "1" },
                            { name: "max", value: "20" }
                        ]
                    }, {
                        groupAlias: "gauge",
                        editor: "field",
                        type: "checkbox",
                        name: "viewObject.gaugeStepMiddle",
                        label: "label.sensorboards.ShowGaugeMiddleSteps"
                    }, {
                        groupAlias: "label",
                        editor: "field",
                        type: "color",
                        name: "viewObject.fillLabel",
                        label: "label.TextColor"
                    }, {
                        groupAlias: "label",
                        editor: "field",
                        type: "range",
                        name: "viewObject.fontSize",
                        label: "label.FontSize",
                        params: [
                            { name: "min", value: "5" },
                            { name: "max", value: "40" }
                        ]
                    }, {
                        groupAlias: "label",
                        editor: "field",
                        type: "checkbox",
                        name: "viewObject.showBoundsLabel",
                        label: "label.sensorboards.ShowBoundariesLabel"
                    }, {
                        groupAlias: "label",
                        editor: "field",
                        type: "checkbox",
                        name: "viewObject.showProgressLabel",
                        label: "label.sensorboards.ShowProgressLabel"
                    }, {
                        if: "viewObject.showProgressLabel",
                        groupAlias: "label",
                        editor: "field",
                        type: "text",
                        name: "viewObject.labelPlaceholder",
                        label: "label.DefaultText",
                        params: [
                            { name: "iris-field-description", value: "{{::'label.WhenValueNotAvailable' | translate}}" }
                        ]
                    }
                ]
            }
        });
})();