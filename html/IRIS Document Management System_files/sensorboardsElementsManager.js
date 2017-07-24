(function () {
    angular.module('iris_sensorboards').factory('SensorboardsElementsManager',
        function ($q, $translate, SensorboardsElementsSettings) {
            var elements_types = [
                {
                    name: $translate.instant('label.sensorboards.SensorValue'),
                    type: 'managedText',
                    group: 'SensorComponents',
                    icon: 'fa-dot-circle-o'
                }, {
                    name: $translate.instant('label.sensorboards.SensorStatus'),
                    type: 'freeForm',
                    options: {viewObjectType: 'circle'},
                    group: 'SensorComponents',
                    icon: 'fa-compass'
                },
                {
                    name: $translate.instant('label.sensorboards.Speedometer'),
                    type: 'speedometer',
                    group: 'SensorComponents',
                    icon: 'fa-dashboard'
                },
                {
                    name: $translate.instant('label.sensorboards.Progressbar'),
                    type: 'progressBar',
                    group: 'SensorComponents',
                    icon: 'fa-battery-three-quarters'
                },
                {
                    name: $translate.instant('label.sensorboards.Triangle'),
                    typeName: $translate.instant('label.sensorboards.FreeForm'),
                    type: 'freeForm',
                    options: {viewObjectType: 'triangle'},
                    group: 'FreeForms',
                    icon: 'fa-exclamation-triangle'
                },
                {
                    name: $translate.instant('label.sensorboards.Rectangle'),
                    typeName: $translate.instant('label.sensorboards.FreeForm'),
                    type: 'freeForm',
                    options: {viewObjectType: 'rect'},
                    group: 'FreeForms',
                    icon: 'fa-square-o'
                },
                {
                    name: $translate.instant('label.sensorboards.Circle'),
                    typeName: $translate.instant('label.sensorboards.FreeForm'),
                    type: 'freeForm',
                    options: {viewObjectType: 'circle'},
                    group: 'FreeForms',
                    icon: 'fa-circle-thin'
                },
                {
                    name: $translate.instant('label.sensorboards.Line'),
                    type: 'line',
                    group: 'FreeForms',
                    icon: 'fa-minus'
                },
                {
                    name: $translate.instant('label.sensorboards.Picture'),
                    type: 'image',
                    group: 'FreeForms',
                    icon: 'fa-image'
                },
                {
                    name: $translate.instant('label.sensorboards.Text'),
                    type: 'managedText',
                    group: 'FreeForms',
                    icon: 'fa-font'
                },
                {
                    name: $translate.instant('label.sensorboards.Icon'),
                    type: 'icon',
                    group: 'FreeForms',
                    icon: 'fa-tree'
                }
            ];

            var arrowTypes = [
                { id: "none", name: $translate.instant("label.None") },
                { id: "line", name: $translate.instant("label.sensorboards.Line") },
                { id: "circle", name: $translate.instant("label.sensorboards.Circle") },
                { id: "square", name: $translate.instant("label.sensorboards.Square") },
                { id: "triangle", name: $translate.instant("label.sensorboards.Triangle") }
            ];

            return {
                getElementsTypes: function () {
                    return elements_types;
                },

                getElementType: function (type, viewObjectType) {
                    var result = elements_types.filter(element_type => element_type.type == type && (!element_type.options || element_type.options.viewObjectType == viewObjectType));
                    if (type === "group") result = [{name: $translate.instant('label.sensorboards.Group'), type: "group", group: "FreeForms", icon: "fa-object-group"}];
                    if (!result.length) return;
                    return result[0];
                },

                getArrowTypes: () => arrowTypes,

                getElementSettings: (elementType) => SensorboardsElementsSettings[elementType]
            };
        });
})();