(function () {
    angular.module('irisTableWidget').directive('irisTableWidgetCellText',
        function ($http, $compile, $filter, $interpolate) {
            return {
                restrict: 'EA',
                scope: {
                    widget: '=',
                    cell: '=',
                    interval: '='
                },
                template: '',

                link: function (scope, element, attrs) {
                    var mode = attrs["mode"];

                    function getTextParams() {
                        var res = {
                            project: scope.widget.projects.filter(p => p.id == scope.widget.projectId)[0],
                            device: scope.widget.devices.filter(d => d.id == scope.widget.deviceId)[0],
                            widget: scope.widget,
                            period: {date_start: new Date(scope.interval.from), date_end: new Date(scope.interval.to)}
                        };
                        return res;
                    }

                    switch (mode) {
                        case "edit":
                            var template = "<span>{{cell.params.managedText}}</span>";
                            element.html($compile(template)(scope));
                            break;
                        case "view":
                        case "demo":
                            var translatedText = $filter('irisTranslate')(scope.cell.params.managedText, scope.cell.params.managedTextTranslations),
                                template = $interpolate("<span>" + translatedText + "</span>")(getTextParams());
                            element.html(template);
                            break;
                        default:
                            var template = "<span class='alert alert-warning'>[mode] not defined</span>";
                            element.html(template);
                            break;
                    }
                }
            };
        });
})();

