(function () {
    angular.module('irisDamageRepairWidget').directive('irisDamageRepairWidget',
        function ($q, $filter, $compile, IrisDamageRepairWidgetService) {
            return {
                restrict: 'EA',
                scope: {
                    params: '=',
                    widget: '='
                },
                templateUrl: iris.config.widgetsUrl + '/iris-damage-repair-widget/templates/iris-damage-repair-widget.view.html',

                controller: function ($scope) {
                },

                link: function (scope, element, attrs) {
                    scope.widget = scope.widget || {};
                    scope.widget.settings = scope.widget.settings || {};
                    scope.params = scope.params || {};
                    scope.params = angular.extend({}, scope.params, IrisDamageRepairWidgetService.getDefaultSettings(), scope.widget.settings);
                    scope.params.demo = (attrs.mode == 'demo');

                    function getProtocolsMaxCount() {
                        if (!scope.widgetData || !scope.widgetData.length) return 0;
                        return Math.max.apply(null, scope.widgetData.map(t => t.protocols.length));
                    };

                    function refreshWidgetData() {
                        var q = new $q.defer();

                        scope.widgetData = [];
                        if (scope.params.demo) {
                            scope.widgetData = IrisDamageRepairWidgetService.getDemoData(scope.widget.settings);
                            console.log(scope.widgetData);
                            q.resolve();
                        } else {
                            IrisDamageRepairWidgetService.getData(scope.widget.projectId, scope.widget.settings.documentCollectionAlias, scope.widget.settings.insDocumentTemplateId).then((data) => {
                                data || (data = []);
                                scope.widgetData = data;
                                q.resolve();
                            });
                        }

                        return q.promise;
                    };

                    function fixWidgetData() {
                        scope.protocolsMaxCount = getProtocolsMaxCount();
                    };

                    scope.getRowSpan = function(t) {
                        return t.split("|").length;
                    };

                    var headerTemplate = `<tr>
                                            <th colspan="{{params.groupColumns.length}}">&nbsp;</th>
                                            <th colspan="{{params.infoColumns.length + 1}}" ng-repeat="col in [] | irisRepeatRange:%procotolsMaxCount%" class="text-center">{{$index + 1}}</th>
                                          </tr>
                                          <tr>
                                            <th ng-repeat="groupCol in params.groupColumns">{{groupCol.caption | irisTranslate:groupCol.captionTranslations}}</th>`;

                    var bodyTemplate = `<tr ng-repeat="row in widgetData">
                                            <td ng-if="row[groupCol.alias + '#rowspan']" rowspan="{{row[groupCol.alias + '#rowspan']}}" ng-repeat="groupCol in params.groupColumns">{{row[groupCol.alias]}}</td>`;

                    var infoHeaderTemplate = () => `<th>{{::'label.Date' | translate}}</th><th ng-repeat="infoCol in params.infoColumns">{{infoCol.caption | irisTranslate:infoCol.captionTranslations}}</th>`;
                    var infoBodyTemplate = (index) => `<td colspan="{{params.infoColumns.length + 1}}" class="damage-repair-damages">
                                                            <table class="table table-condensed">
                                                                <tr ng-repeat="damage in row.protocols[${index}].damages">
                                                                    <td ng-if="!$index">{{row.protocols[${index}].date | irisTime:this:'@{date}'}}</td>
                                                                    <td ng-if="$index">&nbsp;</td>
                                                                    <td ng-repeat="infoCol in params.infoColumns">{{damage[infoCol.alias]}}</td>
                                                                </tr>
                                                            </table>
                                                       </td>`;

                    function refreshWidget() {
                        refreshWidgetData().then(() => {
                            fixWidgetData();

                            var header = headerTemplate.replace(new RegExp("%procotolsMaxCount%", 'g'), scope.protocolsMaxCount);
                            $filter("irisRepeatRange")([], scope.protocolsMaxCount).forEach(index => header += infoHeaderTemplate());
                            header += `</tr>`;

                            var body = bodyTemplate;
                            $filter("irisRepeatRange")([], scope.protocolsMaxCount).forEach(index => body += infoBodyTemplate(index));
                            body += `</tr>`;

                            element.find(".damage-repair-column-header").html($compile(header)(scope));
                            element.find(".damage-repair-column-body").html($compile(body)(scope));
                        });
                    }
                    refreshWidget();

                    scope.$watch('params', function (nv, ov) {
                        if (!nv || angular.equals(nv, ov)) return;
                        refreshWidget();
                    }, true);
                }
            };
        });
})();

