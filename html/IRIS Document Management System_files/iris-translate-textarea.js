(function (globals) {
    'use strict';

    globals.angular.module('irisApp').directive('irisTranslateTextarea',
        function ($q, $translate, LangList, LocaleService)  {

            return {
                restrict: 'EA',

                scope: {
                    value: '=',
                    translations: '=',
                    required: '=ngRequired'
                },

                templateUrl: iris.config.baseUrl + '/common/directives/templates/translate-textarea.html',

                controller: function ($scope, $element, $attrs) {
                    $scope.offset = $attrs.hasOwnProperty('irisFieldOffset') && $attrs.irisFieldOffset != null ? $attrs.irisFieldOffset : 3;
                },

                link: function (scope, element, attrs) {
                    scope.label = $translate.instant(attrs.label || 'label.Name');

                    scope._updateTranslations = () => {
                        scope.locale = LocaleService.getCurrentLocale();
                        scope.translations = scope.translations || {};
                        scope.languages = scope.languages || [];
                        scope.languages.forEach((lang) => {
                            const langCode = lang.name;
                            if (scope.translations) {
                                if (scope.value && langCode === scope.locale) {
                                    scope.translations[langCode] = scope.value;
                                } else {
                                    scope.translations[langCode] = scope.translations[langCode] || ''
                                }
                            }
                        });
                    };

                    LangList.query().$promise.then((languages) => {
                        scope.languages = languages;
                        scope._updateTranslations();
                    });

                    scope.$watch('value', scope._updateTranslations);
                }
            }
    });
})({
    angular: angular,
    config: iris.config
});
