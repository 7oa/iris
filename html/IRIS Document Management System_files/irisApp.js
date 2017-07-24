angular.module('irisApp', irisAppDependencies);

/**
 * Filter returns index of object from directory field with filter value
 **/
angular.module('irisApp').filter('IrisFilterIndex', function () {
    return function (directory, arr) {
        //console.log(id, $scope[directory], directory);
        directory = directory || [];
        arr = arr || {};
        for (var i = 0, c = directory.length; i < c; i++) {
            var flag = true;
            for (var p in arr) {
                //TODO validate arr[p] as array
                if (!Array.isArray(arr[p])) {
                    console.log('IrisFilterIndex - type of one of filtered fields is not array');
                    arr[p] = [];
                }
                arr[p] = arr[p] || [];
                if (arr[p].indexOf(directory[i][p]) < 0) {
                    flag = false;
                    break;
                }
            }
            if (flag) {
                return i;
            }
        }
        return null;
    }
});

/**
 * Interceptors for angular $http requests
 * */
angular.module('irisApp').factory('irisHttpInterceptor', function ($q, $translate) {
    return {
        'request': function (config) {
            // do something on success
            return config;
        },

        'requestError': function (rejection) {
            // do something on error
            if (canRecover(rejection)) {
                return responseOrNewPromise
            }
            return $q.reject(rejection);
        },

        'response': function (response) {
            // do something on success
            return response;
        },

        // Stop loader and show message
        'responseError': function (errorResponse) {
            function translateError(data){
                if(!data || !data.messages && !data.details) return $translate.instant('text.RequestError');

                var args = {};

                //common format support
                if(data.messages) {
                    args = data.args || args;
                    return $translate.instant(data.messages[0], args);
                }

                //form validation format support
                if(data.details) {
                    args = data.details[0].args || args;
                    return $translate.instant(data.details[0].code, args);
                }
            }

            iris.loader.stop();
            switch (errorResponse.status) {
                case 0:
                    break;
                case 400:
                    alertify.error(translateError(errorResponse.data));
                    break;
                case 401:
                    window.location.href = iris.config.logoutUrl;
                    break;
                case 403:
                    alertify.error('Access denied');
                    break;
                case 404:
                    alertify.error('Not found');
                    break;
                case 409:
                case 412:
                case 423:
                case 424:
                    alertify.error(translateError(errorResponse.data));
                    break;
                case 500:
                    var message = errorResponse.data && errorResponse.data.messages && errorResponse.data.messages.length
                        ? errorResponse.data.messages[0] : 'Server internal error';
                    alertify.error(message);
                    break;
                case 501:
                case 502:
                case 503:
                    alertify.error('Server internal error');
                    break;
                default:
                    alertify.error('Request error ', errorResponse.data.message + ' (Error code: ' + errorResponse.status + ')');
            }

            return $q.reject(errorResponse);
        }
    };
});

angular.module('irisApp').directive('irisFileUploader', ['$compile', 'FileUploader', '$q',
    function ($compile, FileUploader, $q) {
        return {
            restrict: 'AE',
            require: 'ngModel',
            link: function (scope, element, attrs, ngModel) {
                var template = '<div class="input-group upload-file">' +
                    '<input type="text" disabled="disabled" class="form-control" ng-model="uploaded_files.name">' +
                    '<span class="input-group-btn" data-tooltip-on="1" data-placement="top" title="Choose file">' +
                    '<button class="btn btn-default" type="button"><span class="fa fa-folder-o"></span></button>' +
                    '<input nv-file-select uploader="uploader" type="file" name="file" class="input-file">' +
                    '</span>' +
                    '<span class="progress">{{item.progress ? item.progress+\'%\' : \'\'}}</span>' +
                    '</div>';

                // todo specify default url
                // if url is not specified - do nothing
                if (!scope.url) {
                    console.log('Error! irisFileUploader - Url field must be specified!');
                    return;
                }

                scope.uploaded_files = {};
                scope.uploaded_files.name = ngModel.$viewValue;
                scope.uploadingPromise = $q.defer();

                scope.$watch(function () {
                    return ngModel.$viewValue;
                }, function (nv, ov) {
                    if (attrs.field == 'url') scope.uploaded_files.name = nv;
                });

                var uploader = scope.uploader = new FileUploader({
                    scope: scope,
                    autoUpload: true,
                    url: scope.url
                });

                // todo check if uploader has been already uploaded - we should init it again
                /*scope.$watch(function(){
                 return scope.url;
                 }, function (nv, ov) {
                 if(nv != ov) {
                 uploader.url = nv;
                 }
                 });*/

                uploader.onAfterAddingFile = function (item) {
                    scope.item = item;
                };

                uploader.onCompleteItem = function (item, response, status, headers) {
                    item.info = response;
                    scope.uploaded_files = item;
                    scope.uploaded_files.name = attrs.field != 'url' ? scope.uploaded_files.info.file_name
                        : originalScope.url + '/' + originalScope.uploaded_files.info.file_name;
                    scope.uploadingPromise.resolve(scope.uploaded_files);
                    scope.uploadingPromise = $q.defer();
                    //ngModel.$modelValue = attrs.field != 'url' ? scope.uploaded_files.info.id : scope.uploaded_files.name;
                    //ngModel.$modelValue = scope.uploaded_files.info.id;
                    //ngModel.$setViewValue(scope.uploaded_files.name);
                    ngModel.$setViewValue(attrs.field != 'url' ? scope.uploaded_files.info.id : scope.uploaded_files.name);
                    //ngModel.$setViewValue(scope.uploaded_files.info.id);
                    scope.$apply();
                    if(scope.onUploadComplete) {
                      scope.onUploadComplete({item: item, response: response, status: status, headers: headers});
                    }
                };

                element.html($compile(template)(scope));
            }
        };
    }]);

angular.module('irisApp').directive('irisField', function ($compile, $timeout, $filter, $translate, ModuleFolderService, FilesService) {
    return {
        restrict: 'AE',
        require: '?ngModel',
        scope: {
            ngModel: '=',
            irisFieldSettings: '@',
            ngChange: '&',
            ngBlur: '&',
            onRollback: '&',
            ngClick: '&',
            onUploadComplete: '&',
            irisFieldButtonCallback: '&',
            irisValid: '=',
            irisSelectDirectory: '=',
            irisSelectOptgroupDirectory: '=',
            maxDate: '=',
            minDate: '=',
            fileInfo: '=',
            timezone: '=',
            timezoneIgnore: '=',
            focusMe: '=',
            subjects: '=',
            quickDateArray: '='
        },
        link: function (scope, element, attrs, ngModel) {
            (scope.resetSettings = function () {
                scope.options = scope.$eval(attrs.irisFieldSettings) || {};
                scope.options.required = scope.options.required || scope.$eval(attrs.ngRequired) || angular.isDefined(attrs.required) || false;
                scope.options.disabled = scope.options.disabled || angular.isDefined(attrs.disabled) || false;
                scope.options.offset = scope.options.hasOwnProperty('offset') && scope.options.offset != null ?
                    scope.options.offset :
                    attrs.hasOwnProperty('irisFieldOffset') && attrs.irisFieldOffset != null ?
                        attrs.irisFieldOffset : 3;
                scope.options.description = scope.options.description || attrs.irisFieldDescription || '';
                scope.options.label = scope.options.label || attrs.irisFieldLabel || '';
                scope.options.directory = scope.options.directory || [];
                scope.options.type = attrs.type || 'text';
                scope.options.height = attrs.height || '330';
                scope.options.fill = attrs.height || '330';
                scope.options.name = attrs.name || attrs.ngModel || '';
                scope.options.moduleName = attrs.moduleName ? attrs.moduleName : undefined;
                scope.options.subjects = scope.subjects || [];
                scope.options.toolbar = attrs.toolbar ? scope.$eval(attrs.toolbar) : undefined;
                scope.options.statusbar = angular.isDefined(attrs.statusbar) ? attrs.statusbar : true;
                scope.options.menubar = angular.isDefined(attrs.menubar) ? attrs.menubar : false;
                scope.options.selectOpts = (attrs.irisSelectSettings) ? scope.$eval(attrs.irisSelectSettings) : {};
                scope.options.selectOpts.nullable = scope.options.selectOpts.nullable || angular.isDefined(attrs.irisSelectNull) || false;
                scope.options.selectOpts.null_text = scope.options.selectOpts.null_text || $translate.instant(attrs.irisSelectNull) || $translate.instant('label.NotSpecified');
                scope.options.ngOptions = attrs.irisSelectNgOptions || '';
                scope.options.ngOptionsFilter = attrs.irisSelectFilter ? scope.$eval(attrs.irisSelectFilter) : {};
                scope.options.ngOptionsOrder = attrs.irisSelectOrder || '';
                scope.options.ngOptionsDirectory = scope.irisSelectDirectory || [];
                scope.options.id = attrs.id || attrs.ngModel || '';
                scope.options.multiple = scope.$eval(attrs.multiple) || false;
                scope.options.min = attrs.min || null;
                scope.options.max = attrs.max || null;
                scope.options.quickDate = attrs.quickDate || false;
                if (scope.options.quickDate) {
                    scope.options.quickDateArray = scope.quickDateArray &&
                        scope.quickDateArray.length ? scope.quickDateArray :
                            [
                                { value: 5, label: 'label.In5Days'},
                                { value: 14, label: 'label.In2Weeks'},
                                { value: 30, label: 'label.In1Month'},
                            ];
                }
                scope.url = attrs.url || null;
                scope.options.params = scope.$eval(attrs.params) || {};
                var selOptions = scope.options.multiple ?  { delimiter: ',', persist: true, maxItems:300, plugins: ['remove_button'], hideSelected:true, dropdownParent:'body'}  : {maxItems: 1, dropdownParent:'body'};
                scope.options.irisSelectize = attrs.irisSelectConfig ? angular.extend(selOptions,angular.fromJson(attrs.irisSelectConfig)):selOptions;
                scope.options.irisSelectize.create = !!attrs.irisSelectCreate || false;
                scope.options.irisSelectize.labelField = attrs.irisSelectText || 'name';
                scope.options.irisSelectize.optgroupLabelField = attrs.irisSelectOptgroupText || 'name';
                scope.options.irisSelectize.optgroupValueField = attrs.irisSelectOptgroupValue || 'id';
                scope.options.irisSelectize.optgroupField = attrs.irisSelectOptgroupField || 'name';
                scope.options.irisSelectize.optgroups = scope.irisSelectOptgroupDirectory || [];
                scope.options.irisSelectize.valueField = attrs.irisSelectValue || 'id';
                scope.options.irisSelectize.searchField = attrs.irisSelectSearchField || scope.options.irisSelectize.searchField || scope.options.irisSelectize.labelField;
                scope.options.irisSelectize.sortField = attrs.irisSelectSortField || scope.options.irisSelectize.sortField || scope.options.irisSelectize.labelField;
                if(attrs.irisSelectSortField) {
                    try {
                        scope.options.irisSelectize.sortField = scope.$eval(scope.options.irisSelectize.sortField);
                    } catch (e) {}
                }
                if (attrs.irisSelectShowIcons) {
                    var params = angular.fromJson(attrs.irisSelectShowIcons);
                    scope.options.irisSelectize.render = {
                        item: function (item, escape) {
                            return "<div><i class='" + escape(item[params.iconClass])
                                + " selectize-icon-item-icon'></i><div class='selectize-icon-item-label'> "
                                + escape(item[params.optionLabel]) + "</div></div>";
                        },
                        option: function (item, escape) {
                            return "<div><i class='" + escape(item[params.iconClass])
                                + " selectize-icon-option-icon'></i><div class='selectize-icon-option-label'> "
                                + escape(item[params.optionLabel]) + "</div></div>";
                        }
                    }
                }
                scope.options.step = attrs.step || null;
                scope.options.placeholder = $translate.instant(attrs.placeholder) || $translate.instant(attrs.irisSelectNull) || '';
                scope.options.maxLength = attrs.maxLength || 0;
                scope.options.minLength = attrs.minLength || 0;
                scope.options.template_selected = attrs.templateSelected || scope.options.multiple ? '{{$item.name}}' : '{{$select.selected.name}}';
                scope.options.template_item = attrs.templateItem || 'item.name';
                scope.options.item = attrs.irisSelectItem || 'item.id';
                scope.attrs = attrs;
                scope.valid = true;
                scope.dirty = false;
            })();
            var is_inline = angular.isDefined(attrs.inline);

            scope.$watch(function () {
                return scope.irisSelectDirectory
            }, function (nv,ov) {
                if (angular.isDefined(nv) && !angular.equals(nv,ov)) {
                    scope.options.ngOptionsDirectory = nv;
                    scope.applyFilter();
                }
            },true);

            scope.applyFilter = function () {
                if ((scope.options.type == 'select' || scope.options.type == 'selectize') && angular.isDefined(attrs.irisSelectFilter)) {
                    scope.options.ngOptionsFilter = scope.$eval(attrs.irisSelectFilter) || {};
                    scope.options.ngOptionsDirectory = $filter('filter')(scope.irisSelectDirectory, scope.options.ngOptionsFilter);
                } else {
                    scope.options.ngOptionsDirectory = scope.irisSelectDirectory;
                }
            };

            attrs.$observe('irisSelectFilter', scope.applyFilter);

            scope.$watch('irisSelectDirectory', scope.applyFilter);

            scope.$watch('irisSelectOptgroupDirectory', nv => {scope.options.irisSelectize.optgroups = nv});

            attrs.$observe('required', function () {
                scope.options.required = angular.isDefined(attrs.required) && (attrs.required != false) || false;
            });

            attrs.$observe('disabled', function () {
                scope.options.disabled = attrs.disabled || false;
            });

            attrs.$observe('placeholder', function () {
                scope.options.placeholder = $translate.instant(attrs.placeholder) || '';
            });

            attrs.$observe('url', function () {
                scope.url = attrs.url || null;
            });

            attrs.$observe('max', function () {
                scope.options.max = attrs.max || null;
            });
            attrs.$observe('min', function () {
                scope.options.min = attrs.min || null;
            });

            attrs.$observe('irisFieldLabel', function () {
                scope.options.label = attrs.irisFieldLabel || '';
            });

            attrs.$observe('focusMe', function () {
                if(scope.focusMe === true) {
                    $timeout(function() {
                        $(element[0]).find('input').focus();
                    },900);
                }
            });

            var ngMessagesHtml = `
                <ng-messages for="innerNgModel.$error" ng-show="innerNgModel.$touched">
                    <p class="help-block error-message"
                       ng-repeat="error in ngMessages" 
                       ng-message-exp="error.type">
                        {{ error.message }}
                    </p>
                </ng-messages>`;
            scope.ngMessages = [{type: 'required', message: $translate.instant('label.validation.required')}];

            var label_html = ((scope.options.offset && scope.options.offset != 0 || scope.options.label && is_inline)
                ? (`<label class="${!is_inline ? 'col-md-{{options.offset}} ' : ''} control-label" for="{{attrs.ngModel}}">{{options.label}}</label>`)
                : '');

            var template =
                label_html +
                (!is_inline ?
                    (attrs.irisFieldButtonCallback ? '<div class="col-md-{{12 - options.offset - 2}}">' : '<div class="col-md-{{12 - options.offset}}">')
                    : '') +
                `<input type="text"
                        id="{{options.id}}"
                        class="form-control"
                        placeholder="{{options.placeholder}}"
                        ng-model="ngModel"
                        name="${attrs.ngModel}"
                        ng-keyup="rollback($event, '${attrs.ngModel}')"
                        ng-required="options.required"
                        ng-disabled="options.disabled" ` +
                ((attrs.ngModelOptions) ? 'ng-model-options="' + attrs.ngModelOptions + '"' : '') +
                (scope.options.maxLength && scope.options.maxLength > 0 ? 'maxlength="{{options.maxLength}}"' : '') +
                (scope.options.minLength && scope.options.minLength > 0 ? 'minlength="{{options.minLength}}"' : '') +
                (attrs.readonly ? 'readonly="readonly"' : '') +
                (attrs.ngBlur ? 'ng-blur="exec(ngBlur)"' : '') +
                (attrs.ngChange ? 'ng-change="exec(ngChange)"' : '') +
                (attrs.pattern ? `ng-pattern="{{${attrs.pattern}}}"` : '') +
                (attrs.ngClick ? 'ng-click="exec(ngClick)"' : '') +
                '/>' +
                '<span class="fa form-control-feedback" ng-class="{\'fa-check\' : valid && dirty, \'fa-warning\' : !valid}" aria-hidden="true"></span>' +
                (scope.options.description ? '<p class="help-block">' + scope.options.description + '</p>' : '') +
                ngMessagesHtml +
                (!is_inline ? '</div>' : '');

            if(attrs.irisFieldButtonCallback) {
                template +=
                    (!is_inline ? '<div class="col-md-2">' : '') +
                    '<a class="btn btn-default pull-right" ng-click="exec(irisFieldButtonCallback)" title="' + $translate.instant(attrs.irisFieldButtonTooltip) + '" >' +
                    '<i class="fa ' + (attrs.irisFieldButtonIcon || "" ) + '"></i> ' + $translate.instant(attrs.irisFieldButtonLabel) + '</a>' +
                    (!is_inline ? '</div>' : '');
            }

            if (scope.options.type == 'password') {
                template = label_html +
                    '<div class="col-md-{{12 - options.offset}}">\
                        <input type="password" id="{{options.id}}" class="form-control" autocomplete="false" \
                               placeholder="{{options.placeholder}}"\
                               ng-model="ngModel" \
                               ng-keydown="ngKeyDown($event)" \
                               ng-keypress="ngKeyPress($event)" \
                               ng-required="options.required"' +
                    ((attrs.ngChange) ? 'ng-change="exec(ngChange)"' : '') +
                    ((attrs.pattern) ? `ng-pattern="'${attrs.pattern}'"` : '') +
                    ((attrs.ngClick) ? 'ng-click="exec(ngClick)"' : '') +
                    'ng-disabled="options.disabled"/>' +
                    '<span class="fa form-control-feedback" ng-class="{\'fa-check\' : valid && dirty && !capslock, \'fa-warning\' : !valid, \'fa-arrow-up\' : capslock}" aria-hidden="true"></span>' +
                    (scope.options.description ? '<p class="help-block">' + scope.options.description + '</p>' : '') +
                    ngMessagesHtml +
                    '</div>';
            }

            if (scope.options.type == 'checkbox') {
                template = (!is_inline ? '<div class="col-md-offset-{{options.offset}} col-md-{{12 - options.offset}}">' : '') +
                    '<div class="checkbox">' +
                    '<label>' +
                    '<input type="checkbox" ng-model="ngModel"' +
                    ((attrs.ngChange) ? 'ng-change="exec(ngChange)"' : '') +
                    ((attrs.ngClick) ? 'ng-click="exec(ngClick)"' : '') +
                    'ng-disabled="options.disabled">' +
                    scope.options.label +
                    '</label>' +
                    '</div>' +
                    (!is_inline ? '</div>' : '');
            }

            if (scope.options.type == 'date' || scope.options.type == 'datetime') {
                var datepickerInput = `<input type="text"
                       id="{{options.id}}"
                       class="form-control"
                       uib-tooltip="[{{timezone}}]"
                       ng-model="ngModel"
                       ng-model-options="{ updateOn: 'blur' }"
                       ng-required="options.required"
                       is-open="options.opened"
                       name="{{options.name}}"
                       placeholder="{{options.placeholder}}"
                       ng-disabled="options.disabled"
                       uib-datepicker-popup="dd.MM.yyyy"
                       ng-style="options.quickDate && { 'width': '90px' }"
                        ${attrs.maxDate ? 'max-date="maxDate"' : ''}
                        ${attrs.minDate ? 'min-date="minDate"' : ''}
                        ${attrs.ngChange ? 'ng-change="exec(ngChange)"' : ''}
                        ${attrs.ngClick ? 'ng-click="exec(ngClick)"' : ''}/>
                    <span class="input-group-btn" ${attrs.quickDate ? 'uib-dropdown' : ''}>
                        <button class="btn btn-default" ng-disabled="options.disabled"
                             ng-click="toggleOpen($event)"><i class="fa fa-calendar"></i></button>
                        <button class="btn btn-default" ng-if="options.quickDate" uib-dropdown-toggle><i class="fa fa-caret-down"></i></button>
                        <ul uib-dropdown-menu class="dropdown-menu">
                            <li ng-repeat="q in options.quickDateArray">
                                <a href="javascript:void(0)"
                                   style="padding-left: 10px"
                                   ng-click="setDate(q.value)"
                                   translate>{{q.label}}
                                </a>
                             </li>
                        </ul>
                    </span>`;

                /**
                 * To add support for disabling bootstrap timepicker, I wrapped it with a fieldset tag.
                 * Native support of bootstrap timepicker is in our current version not available.
                 *
                 * Attention! ng-change does not work with timepicker
                 */
                var timepickerInput = `<fieldset ng-disabled="options.disabled"><div uib-timepicker class="pull-right iris-timepicker"
                        ng-required="options.required"
                        readonly-input="options.disabled"
                        show-meridian="false"
                        ${attrs.ngChange ? 'ng-change="exec(ngChange)"' : ''}
                        ${attrs.ngClick ? 'ng-click="exec(ngClick)"' : ''}></div></fieldset>
                    <span class="input-group-btn" uib-tooltip="{{::'label.SetNow' | translate}}">
                        <button ng-click="setNow()" class="btn btn-default" ng-disabled="options.disabled"><i class="fa fa-clock-o"></i></button>
                    </span>`;

                var helpBlock = (scope.options.description ? '<p class="help-block">' + scope.options.description + '</p>' : '');

                template =
                        `<div class="iris-datetimepicker-container">
                            <div class="input-group iris-datepicker">`+datepickerInput+`</div>` +
                            (scope.options.type != 'date' ? `<div class="input-group iris-datetimepicker">`+timepickerInput+`</div>` : '') +
                            `<div class="clearfix"></div>` +
                            helpBlock +
                        `</div>`;

                if(!is_inline) {
                    template = `<div class="col-md-{{12 - options.offset}}">` + template + `</div>`;
                }

                template = label_html + template;
            }

            if (scope.options.type == 'time') {
                template =
                    label_html +
                    '<fieldset ng-disabled="options.disabled"><div uib-timepicker class="pull-right iris-timepicker" ' +
                    'ng-model="ngModel" ng-required="options.required" ' +
                    ((attrs.ngChange) ? 'ng-change="exec(ngChange)"' : '') +
                    ((attrs.ngClick) ? 'ng-click="exec(ngClick)"' : '') +
                    'readonly-input="options.disabled" show-meridian="false"></div></fieldset>' +
                    '<div class="input-group-addon"><button disabled="true" class="btn-link"><i class="fa fa-clock-o"></i></button></div>' +
                    '</div>'+
                    (scope.options.description ? '<p class="help-block">' + scope.options.description + '</p>' : '') +
                    ngMessagesHtml +
                    (!is_inline ? '</div>' : '');
            }

            if (scope.options.type == 'number') {
                template =
                    `${label_html}
                    ${!is_inline ? '<div class="col-md-{{12 - options.offset}}">' : ''}
                    <input type="number"
                            id="{{options.id}}"
                            class="form-control"
                            placeholder="{{options.placeholder}}"
                            ng-model="ngModel"
                            ng-required="options.required"
                            ng-disabled="options.disabled"
                            ${attrs.ngModelOptions ? `ng-model-options="${attrs.ngModelOptions}"` : ''}
                            ${angular.isDefined(attrs.min) ? ' min="{{options.min}}"' : ''}
                            ${angular.isDefined(attrs.max) ? ' max="{{options.max}}"' : ''}
                            ${scope.options.step ? ' step="' + scope.options.step + '"' : ''}
                            ${attrs.ngChange ? 'ng-change="exec(ngChange)"' : ''}
                            ${attrs.ngClick ? 'ng-click="exec(ngClick)"' : ''} />
                    <span class="fa form-control-feedback"
                          ng-class="{'fa-check' : valid && dirty, 'fa-warning' : !valid}"
                          aria-hidden="true"></span>
                    ${scope.options.description ? `<p class="help-block">${scope.options.description}</p>` : ''}
                    ${ngMessagesHtml}
                    ${!is_inline ? '</div>' : ''}`;
            }

            //todo return elastic attribute support
            if (scope.options.type == 'textarea') {
                template =
                    label_html +
                    (!is_inline ? '<div class="col-md-{{12 - options.offset}}">' : '') +
                    `<textarea class="form-control" 
                               placeholder="{{options.placeholder}}"
                               ng-required="options.required" 
                               ng-disabled="options.disabled" 
                               ng-model="ngModel" 
                               style="width: 100%; height:${scope.options.height}px;" ` +
                    (attrs.ngChange ? 'ng-change="exec(ngChange)"' : '') +
                    (attrs.ngModelOptions ? 'ng-model-options="' + attrs.ngModelOptions + '"' : '') +
                    ((attrs.tabindex) ? 'tabindex="' + attrs.tabindex + '"' : '') +
                    '></textarea>' +
                    (!is_inline ? '</div>' : '');
            }
            if (scope.options.type == 'select') {
                template =
                    label_html +
                    (!is_inline ? '<div class="col-md-{{12 - options.offset}}">' : '') +
                    (scope.options.selectOpts.nullable ? '<span class="nullable">' : '') +
                    '<select class="form-control" id="{{options.id}}"' +
                    'name="{{options.name}}"' +
                    'ng-model="ngModel" ng-required="options.required"' +
                    ((attrs.ngChange) ? 'ng-change="exec(ngChange)"' : '') +
                    ((attrs.ngClick) ? 'ng-click="exec(ngClick)"' : '') +
                    'ng-options="' + scope.options.ngOptions + ' for s in options.ngOptionsDirectory ' +
                    (attrs.irisSelectFilter ? ' | filter:options.ngOptionsFilter ' : '') +
                    scope.options.ngOptionsOrder + '"' +
                    'ng-disabled="options.disabled">' +
                    (scope.options.selectOpts.nullable ? ('<option value="">' + scope.options.selectOpts.null_text + '</option>') : '') +
                    '</select>' +
                    (scope.options.selectOpts.nullable ? '</span>' : '') +
                    (scope.options.description ? '<p class="help-block bottom">' + scope.options.description + '</p>' : '') +
                    ngMessagesHtml +
                    (!is_inline ? '</div>' : '');
            }
            if (scope.options.type == 'range') {
                template =
                    label_html +
                    '<div class="col-md-{{12 - options.offset}}">' +
                    '<input type="range" id="{{options.id}}" ' +
                    'min="{{options.min}}" ' +
                    'max="{{options.max}}" ' +
                    'step="{{options.step}}" ' +
                    (attrs.ngModelOptions ? `ng-model-options="${attrs.ngModelOptions}"` : '') +
                    'ng-model="ngModel" ng-required="options.required"/> ' +
                    (scope.options.description ? '<p class="help-block bottom">' + scope.options.description + '</p>' : '') +
                    '</div>';

            }
            if (scope.options.type == 'color') {
                template =
                    label_html +
                    (!is_inline ? '<div class="col-md-{{12 - options.offset}}">' : '') +
                    `
                        <input type="color" id="{{options.id}}" ng-class="{'color-transparent': $parent.${attrs.ngModel} == null}"
                               ng-model="$parent.${attrs.ngModel}" ng-required="options.required"/>
                        <button class="btn btn-link btn-xs"
                                ng-click="$parent.${attrs.ngModel} = null;"
                                uib-tooltip="{{::'label.Clear' | translate}}">
                            <i class="fa fa-times"></i>
                        </button>
                    ${(scope.options.description ? '<p class="help-block bottom">' + scope.options.description + '</p>' : '')}
                    ${ngMessagesHtml}` +
                    (!is_inline ? '</div>' : '');

            }

            if (scope.options.type == 'editor') {
                var toolbar = scope.options.toolbar || (angular.isDefined(attrs['toolbarShort'])
                        ? [
                            'forecolor backcolor',
                            'bold italic underline strikethrough'
                        ]
                        : [
                            'preview code undo redo',
                            'fontselect fontsizeselect styleselect',
                            'forecolor backcolor',
                            'link image table',
                            'bold italic underline strikethrough removeformat',
                            'alignleft aligncenter alignright alignjustify',
                            'bullist numlist outdent indent'
                        ]);

                if(angular.isDefined(scope.options.moduleName) && angular.isDefined(scope.options.subjects)) {
                    toolbar.push('insertFile');
                }

                scope.editorOptions = {
                    content_css: [ '/layouts/ui/css/scroll.css', '/layouts/ui/css/editor.css' ],
                    height: '20px',
                    autoresize_min_height: '20px',
                    autoresize_max_height: '600px',
                    toolbar: toolbar.join(' | '),
                    menubar: scope.options.menubar,
                    statusbar: scope.options.statusbar,
                    inline: false,
                    trusted: true,
                    paste_data_images: true,
                    imagetools_toolbar: "rotateleft rotateright | flipv fliph | editimage imageoptions",
                    images_upload_handler: function (blobInfo, success, failure) {
                        success("data:" + blobInfo.blob().type + ";base64," + blobInfo.base64());
                    },
                    plugins : [
                        'imagetools paste autoresize textcolor advlist autolink lists link image charmap print preview anchor',
                        'searchreplace visualblocks code fullscreen',
                        'insertdatetime media table contextmenu paste code wordcount'
                    ],
                    convert_urls: false,
                    extended_valid_elements: 'style,script[*],link[*]',
                    custom_elements: 'style,script,link',
                    setup: function(editor) {
                        if (angular.isDefined(attrs['static'])) {
                            $timeout(() => {
                                var $formGroup = $(editor.editorContainer).closest('.form-group');
                                $formGroup.addClass('has-focus');
                            });
                        } else {
                            editor.on('focus', function (e) {
                                var $formGroup = $(editor.editorContainer).closest('.form-group');

                                if (!$formGroup.hasClass('has-focus')) {
                                    $formGroup.addClass('has-focus');
                                }
                            });

                            editor.on('blur', function (e) {
                                var $formGroup = $(editor.editorContainer).closest('.form-group');

                                if ($formGroup.hasClass('has-focus')) {
                                    $formGroup.removeClass('has-focus');
                                }

                                if (attrs.ngBlur) scope.exec(scope.ngBlur);
                            });
                        }

                        editor.addButton('insertFile', {
                            icon: 'upload',
                            tooltip: $translate.instant('label.OpenFilesModal'),
                            onclick: () => {
                                ModuleFolderService.openModuleFilesModalExtended(scope.options.moduleName, scope.options.subjects)
                                    .then(function (file) {
                                        var url = FilesService.getFileContentUrl(file.id),
                                            html = "";

                                        switch(file.previewType) {
                                            case 'image':
                                                html = `<img src="${url}" alt="${file.name}" />`;
                                                break;

                                            default:
                                                html = `<a href="${url}" download>${file.name}</a>`;
                                                break;
                                        }

                                        editor.insertContent(html);
                                    });
                            }
                        });
                    }
                };

                template = label_html +
                    `${!is_inline ? '<div class="col-md-{{12 - options.offset}}">' : ''}
                        <textarea ui-tinymce="editorOptions" class="form-control" 
                            ng-required="options.required" 
                            ng-disabled="options.disabled"
                            ng-model="ngModel"></textarea>
                    ${!is_inline ? '</div>' : ''}`;
            }

            if (scope.options.type == 'code') {
                var params = {
                    lineNumbers: true,
                    lineWrapping: true,
                    lint: true,
                    theme: "mdn-like",
                    extraKeys: { 'Ctrl-Space': 'autocomplete' },
                    gutters: ["CodeMirror-lint-markers"],
                    mode: 'htmlmixed',
                    onLoad: (editor) => {
                        var needToRefresh = (editor) => {
                            var wrap = editor.getWrapperElement(),
                                approp = editor.getScrollInfo().height > 600 ? "600px" : "auto";

                            if (wrap.style.height != approp) {
                                wrap.style.height = approp;
                                return true;
                            }

                            return false;
                        };

                        $timeout(() => {
                            needToRefresh(editor);

                            editor.refresh();
                        });

                        editor.on("change", (editor) => {
                            if(needToRefresh(editor)) {
                                editor.refresh();
                            }
                        });

                        editor.on("blur", (editor) => {
                            if(needToRefresh(editor)) {
                                editor.refresh();
                            }
                        });
                    }
            };

                scope.options.params = angular.extend({}, params, scope.options.params);

                template = label_html + `
                    ${!is_inline ? '<div class="col-md-{{12 - options.offset}}">' : ''}
                        <textarea ui-codemirror="options.params" class="form-control" 
                            ng-required="options.required" 
                            ng-disabled="options.disabled"
                            style="height:${scope.options.height}px;"
                            ng-model="ngModel"></textarea>
                    ${!is_inline ? '</div>' : ''}`;
            }

            if (scope.options.type == 'fileUploader') {
                template =
                    label_html +
                    '<div class="col-md-{{12 - options.offset}}">' +
                    '<div iris-file-uploader ' +
                    'ng-required="options.required" ' +
                    'ng-disabled="options.disabled" ' +
                    'ng-model="ngModel"></div>' +
                    (scope.options.description ? '<span class="help-block bottom">' + scope.options.description + '</span>' : '') +
                    ngMessagesHtml +
                    '</div>';
            }

            if (scope.options.type == 'selectize') {
                template =
                    label_html +
                    (!is_inline ? '<div class="col-md-{{12 - options.offset}}">' : '<div class="form-group">') +
                    `<selectize config="options.irisSelectize" 
                                class="iris-selectize" 
                                ng-model="ngModel" 
                                options="options.ngOptionsDirectory"
                                ng-required="options.required"` +
                    ((attrs.tabindex) ? 'tabindex="' + attrs.tabindex + '"' : '') +
                    (scope.options.placeholder ? 'placeholder="' + scope.options.placeholder + '"' : '') +
                    ((attrs.ngChange) ? 'ng-change="exec(ngChange)"' : '') +
                    ((attrs.ngClick) ? 'ng-click="exec(ngClick)"' : '') +
                    ` ng-disabled="options.disabled"></selectize>
                    <a href="javascript:void(0)" ng-if="!options.required && !options.disabled && !options.multiple" class="selectize-clear-button" ng-click="clearModel()" uib-tooltip="{{::\'label.ClearSelection\' | translate}}"><i class="fa fa-times"></i></a>` +
                    (scope.options.description ? '<p class="help-block bottom">' + scope.options.description + '</p>' : '') +
                    ngMessagesHtml +
                    '</div>';
            }

            scope.editor_options = {
                plugins: 'dialogui,dialog,a11yhelp,dialogadvtab,basicstyles,bidi,blockquote,clipboard,button,panelbutton,panel,floatpanel,colorbutton,colordialog,templates,menu,contextmenu,div,resize,toolbar,elementspath,enterkey,entities,popup,filebrowser,find,fakeobjects,floatingspace,listblock,richcombo,font,format,horizontalrule,htmlwriter,wysiwygarea,indent,indentblock,indentlist,justify,menubutton,link,list,liststyle,magicline,maximize,newpage,pagebreak,pastetext,pastefromword,preview,print,removeformat,save,selectall,showborders,sourcearea,specialchar,scayt,stylescombo,tab,table,tabletools,undo,wsc,autogrow,base64image,lineutils,widget,fastimage,fontawesome,tableresize,sourcedialog'
            };

            scope.clearModel = function () {
                scope.ngModel = null;
            };

            scope.setDate = function (days) {
                scope.ngModel = moment(new Date()).add(days, 'days');

            };

            scope.setNow = function () {
                scope.ngModel = new Date();
            };

            scope.exec = function (action) {
                $timeout(function () {
                    scope.$eval(action);
                });
            };

            scope.ngKeyDown = function (e) {
                if(e.which==20) { // Caps-Lock keypress
                    scope.capslock = !scope.capslock;
                }
            };

            scope.ngKeyPress = function (e) {
                var s = String.fromCharCode( e.which );
                if((s.toUpperCase() === s && s.toLowerCase() !== s && !e.shiftKey)||
                    (s.toUpperCase() !== s && s.toLowerCase() === s && e.shiftKey)) {
                    scope.capslock = true;
                } else if((s.toLowerCase() === s && s.toUpperCase() !== s && !e.shiftKey)||
                    (s.toLowerCase() !== s && s.toUpperCase() === s && e.shiftKey)) {
                    scope.capslock = false;
                }
            };

            element.addClass("form-group has-feedback");
            if(is_inline) element.addClass("iris-field-inline");
            element.append($compile(template)(scope));

            scope.$watch(function () {
                return scope.options.required;
            }, function (newV, oldV) {
                if (newV) {
                    element.addClass("required");
                } else {
                    element.removeClass("required");
                }
            });

            scope.$watch(function () {
                return scope.valid;
            }, function (newV, oldV) {
                if (newV) {
                    element.removeClass("has-error");
                    if (scope.dirty && scope.options.type != 'color' && scope.options.type != 'range') {
                        element.addClass("has-success");
                    } else {
                        element.removeClass("has-success");
                    }
                } else {
                    element.removeClass("has-success");
                    element.addClass("has-error");
                }
            });

            scope.innerNgModel = element.find('input').length > 0
                ? element.find('input').controller('ngModel')
                : element.find('select').controller('ngModel');
            if(scope.options.type == 'datetime') {
                scope.innerNgModelPrimary = scope.innerNgModel;
                scope.innerNgModel = element.find('div[uib-timepicker]').controller('ngModel');
            }
            if(scope.options.type == 'textarea') {
                scope.innerNgModel = element.find('textarea').controller('ngModel');
            }

            scope.rollback = function (e, m) {
                if (e.keyCode === 27) {
                    console.log(e, m)
                    scope.innerNgModel.$rollbackViewValue();
                    if(attrs.onRollback) scope.exec(scope.onRollback);
                }
            };

            if (angular.isDefined(attrs.irisValid)) {
                scope.$watch('irisValid', function(value) {
                    ngModel.$setValidity("iris-valid", value);
                    scope.valid = value;
                    scope.dirty = scope.ngModel != null && scope.ngModel != '';
                });
            }

            var specialValidationTypes = ['date', 'datetime', 'selectize', 'select', 'editor', 'code'];

            if (scope.options.type != 'checkbox' && scope.options.type != 'range') {
                scope.$watch(function () {
                    return specialValidationTypes.indexOf(scope.options.type) < 0
                        ? scope.innerNgModel.$valid : ngModel.$valid;
                }, function (nv,ov) {
                    if (specialValidationTypes.indexOf(scope.options.type) < 0) {
                        if (!nv) {
                            Object.keys(scope.innerNgModel.$error).forEach(key => {
                                ngModel.$setValidity(key, false);
                            });
                        } else {
                            Object.keys(ngModel.$error).forEach(key => {
                                ngModel.$setValidity(key, true);
                            });
                        }
                    }
                    scope.valid = nv;
                    scope.dirty = scope.ngModel != null && scope.ngModel != '';
                });
                element.mouseup(function (event) {
                    event.preventDefault();
                });
                element.focus(function () {
                    element.select();
                });
            }

            if (scope.options.type == 'date' || scope.options.type == 'datetime') {

                function updateView() {

                    function doUpdateViewEx(ngModel) {
                        var aFormatters = ngModel.$formatters.slice().reverse();
                        var mModelValue = ngModel.$modelValue;
                        var mViewValue  = mModelValue;

                        for(var i = 0; i < aFormatters.length; i++)
                            mViewValue = aFormatters[i](mViewValue);

                        ngModel.$viewValue = mViewValue;
                        ngModel.$render();
                    }

                    doUpdateViewEx(scope.innerNgModel);

                    if(scope.innerNgModelPrimary)
                        doUpdateViewEx(scope.innerNgModelPrimary);
                }

                function formatterFunc(value) {
                    if (value && iris.Time) {
                        var date = new Date(value);

                        var overrides = {};

                        if(scope.options.type == 'date' && scope.timezoneIgnore) {
                            date.setUTCHours(12);
                            date.setUTCMinutes(0);
                            date.setUTCSeconds(0);
                            date.setUTCMilliseconds(0);
                        }

                        if(scope.timezoneIgnore)
                            overrides.timezone = iris.Time.GlobalObject.zeroTimeZone;

                        value = iris.Time.GetGlobalObject().interpretOutputTimeByContext(date, scope, overrides);

                        //value = date.toISOString();
                    }
                    return value;
                }

                function parserFunc(value) {
                    if (value && iris.Time) {
                        var date = new Date(value.valueOf());
                        var overrides = {};

                        if(scope.options.type == 'date' && scope.timezoneIgnore) {
                            date.setHours(12);
                            date.setMinutes(0);
                            date.setSeconds(0);
                            date.setMilliseconds(0);
                        }

                        if(scope.timezoneIgnore)
                            overrides.timezone = iris.Time.GlobalObject.zeroTimeZone;

                        value = iris.Time.GlobalObject.interpretInputTimeByContext(date, scope, overrides);
                    }
                    return value;
                }

                if(scope.innerNgModelPrimary) {
                    scope.innerNgModelPrimary.$formatters.push(formatterFunc);
                    scope.innerNgModelPrimary.$parsers.push(parserFunc);
                }

                scope.innerNgModel.$formatters.push(formatterFunc);
                scope.innerNgModel.$parsers.push(parserFunc);

                scope.$watch(function lookupTimeZone()  {return iris.Time.GetGlobalObject().lookupSettings(scope).timezone;},   updateView);
                scope.$watch(function lookupTimeFormat(){return iris.Time.GetGlobalObject().lookupSettings(scope).timeformat;}, updateView);

                $timeout(updateView);
            }

            if(scope.ngModel && attrs.ngChange && (scope.options.type === "select" || scope.options.type === "selectize")){
                scope.$eval(attrs.ngChange);
            }
        },
        
        controller: function ($scope, $timeout) {
            $timeout(function () {
                if ($scope.uploadingPromise) {
                    $scope.uploadingPromise.promise.then(function (value) {
                        //TODO fix - after update angular file uploader functionality lost
                        //scope.irisFileInfo = angular.copy(value.info);
                    });
                }
            }, 100);

            $scope.toggleOpen = function ($event) {
                $scope.options.opened = !$scope.options.opened;
                $event.preventDefault();
                $event.stopPropagation();
            };
        }
    }

});

angular.module('irisApp').directive('triggerResize', function($timeout){
    return {
        restrict: 'A',
        link: function(scope, elem, attr, ctrl) {
            elem.bind('click', function(e) {
                $timeout(()=>$(window).resize());
            });
        }
    };
});

angular.module('irisApp').config(function ($locationProvider, $compileProvider, $uibModalProvider, $httpProvider, $translateProvider,
                                           $uibTooltipProvider, uibDatepickerPopupConfig, uibTimepickerConfig, uibPaginationConfig, $provide) {
    $provide.decorator('$uibModalStack', function($delegate) {
        var dismiss = $delegate.dismiss;
        var close = $delegate.close;

        // stick modal again
        // then fallback to the old behaviour
        $delegate.dismiss = function(modalInstance, reason) {
            dismiss.apply(this, arguments);
            iris.modal.onClose();
        };

        // stick modal again
        // then fallback to the old behaviour
        $delegate.close = function(modalInstance, reason) {
            close.apply(this, arguments);
            iris.modal.onClose();
        };

        return $delegate;
    });

    $uibModalProvider.options = {
        backdrop: 'static',
        keyboard: false,
        animation: true
    };

    $.ajaxSetup({headers: {
        'UI': 'ui',
        'x-iris-access-token': iris.config.accessToken
    }});
    $httpProvider.defaults.headers.common['x-iris-access-token'] = iris.config.accessToken;
    $httpProvider.defaults.headers.common['x-requested-with'] = 'XMLHttpRequest';
    $httpProvider.defaults.withCredentials = false;

    $httpProvider.interceptors.push('irisHttpInterceptor');
    $httpProvider.useApplyAsync(true);

    $translateProvider.translations('en', translations).preferredLanguage('en');
    //$translateProvider.useSanitizeValueStrategy('sanitize');

    $uibTooltipProvider.options({appendToBody: true, popupDelay: 400});
    uibDatepickerPopupConfig.appendToBody = true;
    uibDatepickerPopupConfig.showButtonBar = false;
    uibTimepickerConfig.showSpinners = false;
    // uibTimepickerConfig.showSeconds = true;

    uibPaginationConfig.itemsPerPage = 50;
    uibPaginationConfig.firstText = translations['label.First'] || 'label.First';
    uibPaginationConfig.previousText = translations['label.Previous'] || 'label.Previous';
    uibPaginationConfig.nextText = translations['label.Next'] || 'label.Next';
    uibPaginationConfig.lastText = translations['label.Last'] || 'label.Last';

    $compileProvider.debugInfoEnabled(false);

    $locationProvider.html5Mode({
        enabled: true
    })
});

angular.module('irisApp').config(function ($qProvider) {
    $qProvider.errorOnUnhandledRejections(false);
});

angular.module('irisApp').run(
    function ($rootScope, $state, $stateParams, $translate, $locale, $interval, $controller) {
        $rootScope.$state = $state;
        $rootScope.$stateParams = $stateParams;
        $rootScope.config = iris.config;

        $controller('SecurityMixin', { $scope: $rootScope });

        if(iris.data && iris.data.mainMenu){
            $rootScope.mainMenu = iris.data.mainMenu.concat(iris.data.configMenu || []);
            $rootScope.mainMenu.forEach(mainItem => {
                mainItem.visible = true;
                mainItem.title = mainItem.title && $translate.instant(mainItem.title);
                if(mainItem.children){
                    mainItem.enabled = false;
                    mainItem.isActive = false;
                    mainItem.children.forEach(item => {
                        item.title = item.title && $translate.instant(item.title);
                        if(item.enabled){
                            mainItem.enabled = true;
                        }
                        item.isActive = item.url == iris.config.pageRelativeUrl;
                        if(item.isActive){
                            mainItem.isActive = true;
                        }
                    });
                } else {
                    mainItem.isActive = mainItem.url == iris.config.pageRelativeUrl;
                }
            });

            filterGlobalMenu();
        }

        function tick() {
            $rootScope.currentIRISTime = new Date();
        }
        tick();
        $interval(tick, 10000); //every 10 seconds

        $locale.NUMBER_FORMATS.DECIMAL_SEP = '.';
        $locale.NUMBER_FORMATS.GROUP_SEP = '';

        $rootScope.timezone = iris.config.timezone;

        $rootScope.globalMenuFilter = '';
        $rootScope.$watch('globalMenuFilter', (nv, ov) => {
            if (nv == ov) return;
            filterGlobalMenu($rootScope.globalMenuFilter);
        });

        function filterGlobalMenu(filterString) {
            $rootScope.mainMenu.forEach(m => {
                if (!m.children) {
                    m.visible = !filterString || m.title.toUpperCase().indexOf(filterString.toUpperCase()) >= 0;
                } else {
                    m.visible = !filterString || !!m.children.filter(t => t.title.toUpperCase().indexOf(filterString.toUpperCase()) >= 0).length;
                }
                m.open = filterString ? true : m.isActive;
            });
        }

        $rootScope.isGloblMenuOpen = false;
        $rootScope.toggleGlobalMenu = function(open) {
            var $body = angular.element('body');

            if(open && !$body.hasClass('global-menu-open')) {
                $body.addClass('global-menu-open');
            } else if(!open && $body.hasClass('global-menu-open')) {
                $body.removeClass('global-menu-open');
            }
        };

        $rootScope.hideGlobalMenu = function($event) {
            var $target = $($event.target);

            if(!$target.closest('.global-menu-header').length && !$target.closest('.global-menu-toggler').length) {
                $rootScope.isGlobalMenuOpen = false;
                $rootScope.toggleGlobalMenu(false);
            }
        };


        //Show loader while resolve states
        $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
            if (toState.resolve) {
                iris.loader.start('.app-body');
            }
        });
        $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
            iris.loader.stop('.app-body');
        });
        $rootScope.$on('$stateChangeError', function(event, toState, toParams, fromState, fromParams) {
            console.log('$stateChangeError',{event, toState, toParams, fromState, fromParams});
            iris.loader.stop();
        });

    });


