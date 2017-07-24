/* Deprecated dropdown below */

angular.module('ui.bootstrap.dropdown')

    .value('$dropdownSuppressWarning', false)

    .service('dropdownService', ['$log', '$dropdownSuppressWarning', 'uibDropdownService', function ($log, $dropdownSuppressWarning, uibDropdownService) {
        if (!$dropdownSuppressWarning) {
            $log.warn('dropdownService is now deprecated. Use uibDropdownService instead.');
        }

        angular.extend(this, uibDropdownService);
    }])

    .controller('DropdownController', ['$scope', '$element', '$attrs', '$parse', 'uibDropdownConfig', 'uibDropdownService', '$animate', '$uibPosition', '$document', '$compile', '$templateRequest', '$log', '$dropdownSuppressWarning', function ($scope, $element, $attrs, $parse, dropdownConfig, uibDropdownService, $animate, $position, $document, $compile, $templateRequest, $log, $dropdownSuppressWarning) {
        if (!$dropdownSuppressWarning) {
            $log.warn('DropdownController is now deprecated. Use UibDropdownController instead.');
        }

        var self = this,
            scope = $scope.$new(), // create a child scope so we are not polluting original one
            templateScope,
            openClass = dropdownConfig.openClass,
            getIsOpen,
            setIsOpen = angular.noop,
            toggleInvoker = $attrs.onToggle ? $parse($attrs.onToggle) : angular.noop,
            appendToBody = false,
            keynavEnabled = false,
            selectedOption = null;


        $element.addClass('dropdown');

        this.init = function () {
            if ($attrs.isOpen) {
                getIsOpen = $parse($attrs.isOpen);
                setIsOpen = getIsOpen.assign;

                $scope.$watch(getIsOpen, function (value) {
                    scope.isOpen = !!value;
                });
            }

            appendToBody = angular.isDefined($attrs.dropdownAppendToBody);
            keynavEnabled = angular.isDefined($attrs.uibKeyboardNav);

            if (appendToBody && self.dropdownMenu) {
                $document.find('body').append(self.dropdownMenu);
                $element.on('$destroy', function handleDestroyEvent() {
                    self.dropdownMenu.remove();
                });
            }
        };

        this.toggle = function (open) {
            return scope.isOpen = arguments.length ? !!open : !scope.isOpen;
        };

        // Allow other directives to watch status
        this.isOpen = function () {
            return scope.isOpen;
        };

        scope.getToggleElement = function () {
            return self.toggleElement;
        };

        scope.getAutoClose = function () {
            return $attrs.autoClose || 'always'; //or 'outsideClick' or 'disabled'
        };

        scope.getElement = function () {
            return $element;
        };

        scope.isKeynavEnabled = function () {
            return keynavEnabled;
        };

        scope.focusDropdownEntry = function (keyCode) {
            var elems = self.dropdownMenu ? //If append to body is used.
                (angular.element(self.dropdownMenu).find('a')) :
                (angular.element($element).find('ul').eq(0).find('a'));

            switch (keyCode) {
                case (40): {
                    if (!angular.isNumber(self.selectedOption)) {
                        self.selectedOption = 0;
                    } else {
                        self.selectedOption = (self.selectedOption === elems.length - 1 ?
                            self.selectedOption :
                            self.selectedOption + 1);
                    }
                    break;
                }
                case (38): {
                    if (!angular.isNumber(self.selectedOption)) {
                        self.selectedOption = elems.length - 1;
                    } else {
                        self.selectedOption = self.selectedOption === 0 ?
                            0 : self.selectedOption - 1;
                    }
                    break;
                }
            }
            elems[self.selectedOption].focus();
        };

        scope.getDropdownElement = function () {
            return self.dropdownMenu;
        };

        scope.focusToggleElement = function () {
            if (self.toggleElement) {
                self.toggleElement[0].focus();
            }
        };

        scope.$watch('isOpen', function (isOpen, wasOpen) {
            if (appendToBody && self.dropdownMenu) {
                var pos = $position.positionElements($element, self.dropdownMenu, 'bottom-left', true);
                var css = {
                    top: pos.top + 'px',
                    display: isOpen ? 'block' : 'none'
                };

                var rightalign = self.dropdownMenu.hasClass('dropdown-menu-right');
                if (!rightalign) {
                    css.left = pos.left + 'px';
                    css.right = 'auto';
                } else {
                    css.left = 'auto';
                    css.right = (window.innerWidth - (pos.left + $element.prop('offsetWidth'))) + 'px';
                }

                self.dropdownMenu.css(css);
            }

            $animate[isOpen ? 'addClass' : 'removeClass']($element, openClass).then(function () {
                if (angular.isDefined(isOpen) && isOpen !== wasOpen) {
                    toggleInvoker($scope, {open: !!isOpen});
                }
            });

            if (isOpen) {
                if (self.dropdownMenuTemplateUrl) {
                    $templateRequest(self.dropdownMenuTemplateUrl).then(function (tplContent) {
                        templateScope = scope.$new();
                        $compile(tplContent.trim())(templateScope, function (dropdownElement) {
                            var newEl = dropdownElement;
                            self.dropdownMenu.replaceWith(newEl);
                            self.dropdownMenu = newEl;
                        });
                    });
                }

                scope.focusToggleElement();
                uibDropdownService.open(scope);
            } else {
                if (self.dropdownMenuTemplateUrl) {
                    if (templateScope) {
                        templateScope.$destroy();
                    }
                    var newEl = angular.element('<ul class="dropdown-menu"></ul>');
                    self.dropdownMenu.replaceWith(newEl);
                    self.dropdownMenu = newEl;
                }

                uibDropdownService.close(scope);
                self.selectedOption = null;
            }

            if (angular.isFunction(setIsOpen)) {
                setIsOpen($scope, isOpen);
            }
        });

        $scope.$on('$locationChangeSuccess', function () {
            if (scope.getAutoClose() !== 'disabled') {
                scope.isOpen = false;
            }
        });

        var offDestroy = $scope.$on('$destroy', function () {
            scope.$destroy();
        });
        scope.$on('$destroy', offDestroy);
    }])

    .directive('dropdown', ['$log', '$dropdownSuppressWarning', function ($log, $dropdownSuppressWarning) {
        return {
            controller: 'DropdownController',
            link: function (scope, element, attrs, dropdownCtrl) {
                if (!$dropdownSuppressWarning) {
                    $log.warn('dropdown is now deprecated. Use uib-dropdown instead.');
                }

                dropdownCtrl.init();
            }
        };
    }])

    .directive('dropdownMenu', ['$log', '$dropdownSuppressWarning', function ($log, $dropdownSuppressWarning) {
        return {
            restrict: 'AC',
            require: '?^dropdown',
            link: function (scope, element, attrs, dropdownCtrl) {
                if (!dropdownCtrl || angular.isDefined(attrs.dropdownNested)) {
                    return;
                }

                if (!$dropdownSuppressWarning) {
                    $log.warn('dropdown-menu is now deprecated. Use uib-dropdown-menu instead.');
                }

                element.addClass('dropdown-menu');

                var tplUrl = attrs.templateUrl;
                if (tplUrl) {
                    dropdownCtrl.dropdownMenuTemplateUrl = tplUrl;
                }

                if (!dropdownCtrl.dropdownMenu) {
                    dropdownCtrl.dropdownMenu = element;
                }
            }
        };
    }])

    .directive('keyboardNav', ['$log', '$dropdownSuppressWarning', function ($log, $dropdownSuppressWarning) {
        return {
            restrict: 'A',
            require: '?^dropdown',
            link: function (scope, element, attrs, dropdownCtrl) {
                if (!$dropdownSuppressWarning) {
                    $log.warn('keyboard-nav is now deprecated. Use uib-keyboard-nav instead.');
                }

                element.bind('keydown', function (e) {
                    if ([38, 40].indexOf(e.which) !== -1) {
                        e.preventDefault();
                        e.stopPropagation();

                        var elems = dropdownCtrl.dropdownMenu.find('a');

                        switch (e.which) {
                            case (40): { // Down
                                if (!angular.isNumber(dropdownCtrl.selectedOption)) {
                                    dropdownCtrl.selectedOption = 0;
                                } else {
                                    dropdownCtrl.selectedOption = dropdownCtrl.selectedOption === elems.length - 1 ?
                                        dropdownCtrl.selectedOption : dropdownCtrl.selectedOption + 1;
                                }
                                break;
                            }
                            case (38): { // Up
                                if (!angular.isNumber(dropdownCtrl.selectedOption)) {
                                    dropdownCtrl.selectedOption = elems.length - 1;
                                } else {
                                    dropdownCtrl.selectedOption = dropdownCtrl.selectedOption === 0 ?
                                        0 : dropdownCtrl.selectedOption - 1;
                                }
                                break;
                            }
                        }
                        elems[dropdownCtrl.selectedOption].focus();
                    }
                });
            }
        };
    }])

    .directive('dropdownToggle', ['$log', '$dropdownSuppressWarning', function ($log, $dropdownSuppressWarning) {
        return {
            require: '?^dropdown',
            link: function (scope, element, attrs, dropdownCtrl) {
                if (!$dropdownSuppressWarning) {
                    $log.warn('dropdown-toggle is now deprecated. Use uib-dropdown-toggle instead.');
                }

                if (!dropdownCtrl) {
                    return;
                }

                element.addClass('dropdown-toggle');

                dropdownCtrl.toggleElement = element;

                var toggleDropdown = function (event) {
                    event.preventDefault();

                    if (!element.hasClass('disabled') && !attrs.disabled) {
                        scope.$apply(function () {
                            dropdownCtrl.toggle();
                        });
                    }
                };

                element.bind('click', toggleDropdown);

                // WAI-ARIA
                element.attr({'aria-haspopup': true, 'aria-expanded': false});
                scope.$watch(dropdownCtrl.isOpen, function (isOpen) {
                    element.attr('aria-expanded', !!isOpen);
                });

                scope.$on('$destroy', function () {
                    element.unbind('click', toggleDropdown);
                });
            }
        };
    }]);

/* Deprecated buttons below */

angular.module('ui.bootstrap.buttons')

    .value('$buttonsSuppressWarning', false)

    .controller('ButtonsController', ['$controller', '$log', '$buttonsSuppressWarning', function ($controller, $log, $buttonsSuppressWarning) {
        if (!$buttonsSuppressWarning) {
            $log.warn('ButtonsController is now deprecated. Use UibButtonsController instead.');
        }

        angular.extend(this, $controller('UibButtonsController'));
    }])

    .directive('btnRadio', ['$log', '$buttonsSuppressWarning', function ($log, $buttonsSuppressWarning) {
        return {
            require: ['btnRadio', 'ngModel'],
            controller: 'ButtonsController',
            controllerAs: 'buttons',
            link: function (scope, element, attrs, ctrls) {
                if (!$buttonsSuppressWarning) {
                    $log.warn('btn-radio is now deprecated. Use uib-btn-radio instead.');
                }

                var buttonsCtrl = ctrls[0], ngModelCtrl = ctrls[1];

                element.find('input').css({display: 'none'});

                //model -> UI
                ngModelCtrl.$render = function () {
                    element.toggleClass(buttonsCtrl.activeClass, angular.equals(ngModelCtrl.$modelValue, scope.$eval(attrs.btnRadio)));
                };

                //ui->model
                element.bind(buttonsCtrl.toggleEvent, function () {
                    if (attrs.disabled) {
                        return;
                    }

                    var isActive = element.hasClass(buttonsCtrl.activeClass);

                    if (!isActive || angular.isDefined(attrs.uncheckable)) {
                        scope.$apply(function () {
                            ngModelCtrl.$setViewValue(isActive ? null : scope.$eval(attrs.btnRadio));
                            ngModelCtrl.$render();
                        });
                    }
                });
            }
        };
    }])

    .directive('btnCheckbox', ['$document', '$log', '$buttonsSuppressWarning', function ($document, $log, $buttonsSuppressWarning) {
        return {
            require: ['btnCheckbox', 'ngModel'],
            controller: 'ButtonsController',
            controllerAs: 'button',
            link: function (scope, element, attrs, ctrls) {
                if (!$buttonsSuppressWarning) {
                    $log.warn('btn-checkbox is now deprecated. Use uib-btn-checkbox instead.');
                }

                var buttonsCtrl = ctrls[0], ngModelCtrl = ctrls[1];

                element.find('input').css({display: 'none'});

                function getTrueValue() {
                    return getCheckboxValue(attrs.btnCheckboxTrue, true);
                }

                function getFalseValue() {
                    return getCheckboxValue(attrs.btnCheckboxFalse, false);
                }

                function getCheckboxValue(attributeValue, defaultValue) {
                    var val = scope.$eval(attributeValue);
                    return angular.isDefined(val) ? val : defaultValue;
                }

                //model -> UI
                ngModelCtrl.$render = function () {
                    element.toggleClass(buttonsCtrl.activeClass, angular.equals(ngModelCtrl.$modelValue, getTrueValue()));
                };

                //ui->model
                element.bind(buttonsCtrl.toggleEvent, function () {
                    if (attrs.disabled) {
                        return;
                    }

                    scope.$apply(function () {
                        ngModelCtrl.$setViewValue(element.hasClass(buttonsCtrl.activeClass) ? getFalseValue() : getTrueValue());
                        ngModelCtrl.$render();
                    });
                });

                //accessibility
                element.on('keypress', function (e) {
                    if (attrs.disabled || e.which !== 32 || $document[0].activeElement !== element[0]) {
                        return;
                    }

                    scope.$apply(function () {
                        ngModelCtrl.$setViewValue(element.hasClass(buttonsCtrl.activeClass) ? getFalseValue() : getTrueValue());
                        ngModelCtrl.$render();
                    });
                });
            }
        };
    }]);

/* deprecated modal below */

angular.module('ui.bootstrap.modal')

    .value('$modalSuppressWarning', false)

    /**
     * A helper directive for the $modal service. It creates a backdrop element.
     */
    .directive('modalBackdrop', [
        '$animate', '$injector', '$modalStack', '$log', '$modalSuppressWarning',
        function ($animate, $injector, $modalStack, $log, $modalSuppressWarning) {
            var $animateCss = null;

            if ($injector.has('$animateCss')) {
                $animateCss = $injector.get('$animateCss');
            }

            return {
                replace: true,
                templateUrl: 'template/modal/backdrop.html',
                compile: function (tElement, tAttrs) {
                    tElement.addClass(tAttrs.backdropClass);
                    return linkFn;
                }
            };

            function linkFn(scope, element, attrs) {
                if (!$modalSuppressWarning) {
                    $log.warn('modal-backdrop is now deprecated. Use uib-modal-backdrop instead.');
                }
                element.addClass('modal-backdrop');

                if (attrs.modalInClass) {
                    if ($animateCss) {
                        $animateCss(element, {
                            addClass: attrs.modalInClass
                        }).start();
                    } else {
                        $animate.addClass(element, attrs.modalInClass);
                    }

                    scope.$on($modalStack.NOW_CLOSING_EVENT, function (e, setIsAsync) {
                        var done = setIsAsync();
                        if ($animateCss) {
                            $animateCss(element, {
                                removeClass: attrs.modalInClass
                            }).start().then(done);
                        } else {
                            $animate.removeClass(element, attrs.modalInClass).then(done);
                        }
                    });
                }
            }
        }])

    .directive('modalWindow', [
        '$modalStack', '$q', '$animate', '$injector', '$log', '$modalSuppressWarning',
        function ($modalStack, $q, $animate, $injector, $log, $modalSuppressWarning) {
            var $animateCss = null;

            if ($injector.has('$animateCss')) {
                $animateCss = $injector.get('$animateCss');
            }

            return {
                scope: {
                    index: '@'
                },
                replace: true,
                transclude: true,
                templateUrl: function (tElement, tAttrs) {
                    return tAttrs.templateUrl || 'template/modal/window.html';
                },
                link: function (scope, element, attrs) {
                    if (!$modalSuppressWarning) {
                        $log.warn('modal-window is now deprecated. Use uib-modal-window instead.');
                    }
                    element.addClass(attrs.windowClass || '');
                    element.addClass(attrs.windowTopClass || '');
                    scope.size = attrs.size;

                    scope.close = function (evt) {
                        var modal = $modalStack.getTop();
                        if (modal && modal.value.backdrop && modal.value.backdrop !== 'static' && (evt.target === evt.currentTarget)) {
                            evt.preventDefault();
                            evt.stopPropagation();
                            $modalStack.dismiss(modal.key, 'backdrop click');
                        }
                    };

                    // moved from template to fix issue #2280
                    element.on('click', scope.close);

                    // This property is only added to the scope for the purpose of detecting when this directive is rendered.
                    // We can detect that by using this property in the template associated with this directive and then use
                    // {@link Attribute#$observe} on it. For more details please see {@link TableColumnResize}.
                    scope.$isRendered = true;

                    // Deferred object that will be resolved when this modal is render.
                    var modalRenderDeferObj = $q.defer();
                    // Observe function will be called on next digest cycle after compilation, ensuring that the DOM is ready.
                    // In order to use this way of finding whether DOM is ready, we need to observe a scope property used in modal's template.
                    attrs.$observe('modalRender', function (value) {
                        if (value == 'true') {
                            modalRenderDeferObj.resolve();
                        }
                    });

                    modalRenderDeferObj.promise.then(function () {
                        var animationPromise = null;

                        if (attrs.modalInClass) {
                            if ($animateCss) {
                                animationPromise = $animateCss(element, {
                                    addClass: attrs.modalInClass
                                }).start();
                            } else {
                                animationPromise = $animate.addClass(element, attrs.modalInClass);
                            }

                            scope.$on($modalStack.NOW_CLOSING_EVENT, function (e, setIsAsync) {
                                var done = setIsAsync();
                                if ($animateCss) {
                                    $animateCss(element, {
                                        removeClass: attrs.modalInClass
                                    }).start().then(done);
                                } else {
                                    $animate.removeClass(element, attrs.modalInClass).then(done);
                                }
                            });
                        }


                        $q.when(animationPromise).then(function () {
                            var inputWithAutofocus = element[0].querySelector('[autofocus]');
                            /**
                             * Auto-focusing of a freshly-opened modal element causes any child elements
                             * with the autofocus attribute to lose focus. This is an issue on touch
                             * based devices which will show and then hide the onscreen keyboard.
                             * Attempts to refocus the autofocus element via JavaScript will not reopen
                             * the onscreen keyboard. Fixed by updated the focusing logic to only autofocus
                             * the modal element if the modal does not contain an autofocus element.
                             */
                            if (inputWithAutofocus) {
                                inputWithAutofocus.focus();
                            } else {
                                element[0].focus();
                            }
                        });

                        // Notify {@link $modalStack} that modal is rendered.
                        var modal = $modalStack.getTop();
                        if (modal) {
                            $modalStack.modalRendered(modal.key);
                        }
                    });
                }
            };
        }])

    .directive('modalAnimationClass', [
        '$log', '$modalSuppressWarning',
        function ($log, $modalSuppressWarning) {
            return {
                compile: function (tElement, tAttrs) {
                    if (!$modalSuppressWarning) {
                        $log.warn('modal-animation-class is now deprecated. Use uib-modal-animation-class instead.');
                    }
                    if (tAttrs.modalAnimation) {
                        tElement.addClass(tAttrs.modalAnimationClass);
                    }
                }
            };
        }])

    .directive('modalTransclude', [
        '$log', '$modalSuppressWarning',
        function ($log, $modalSuppressWarning) {
            return {
                link: function ($scope, $element, $attrs, controller, $transclude) {
                    if (!$modalSuppressWarning) {
                        $log.warn('modal-transclude is now deprecated. Use uib-modal-transclude instead.');
                    }
                    $transclude($scope.$parent, function (clone) {
                        $element.empty();
                        $element.append(clone);
                    });
                }
            };
        }])

    .service('$modalStack', [
        '$animate', '$timeout', '$document', '$compile', '$rootScope',
        '$q',
        '$injector',
        '$$multiMap',
        '$$stackedMap',
        '$uibModalStack',
        '$log',
        '$modalSuppressWarning',
        function ($animate, $timeout, $document, $compile, $rootScope,
                  $q,
                  $injector,
                  $$multiMap,
                  $$stackedMap,
                  $uibModalStack,
                  $log,
                  $modalSuppressWarning) {
            if (!$modalSuppressWarning) {
                $log.warn('$modalStack is now deprecated. Use $uibModalStack instead.');
            }

            angular.extend(this, $uibModalStack);
        }])

    .provider('$modal', ['$uibModalProvider', function ($uibModalProvider) {
        angular.extend(this, $uibModalProvider);

        this.$get = ['$injector', '$log', '$modalSuppressWarning',
            function ($injector, $log, $modalSuppressWarning) {
                if (!$modalSuppressWarning) {
                    $log.warn('$modal is now deprecated. Use $uibModal instead.');
                }

                return $injector.invoke($uibModalProvider.$get);
            }];
    }]);

/* Deprecated Pagination Below */

angular.module('ui.bootstrap.pagination')
    .value('$paginationSuppressWarning', false)
    .controller('PaginationController', ['$scope', '$attrs', '$parse', '$log', '$paginationSuppressWarning', function ($scope, $attrs, $parse, $log, $paginationSuppressWarning) {
        if (!$paginationSuppressWarning) {
            $log.warn('PaginationController is now deprecated. Use UibPaginationController instead.');
        }

        var self = this,
            ngModelCtrl = {$setViewValue: angular.noop}, // nullModelCtrl
            setNumPages = $attrs.numPages ? $parse($attrs.numPages).assign : angular.noop;

        this.init = function (ngModelCtrl_, config) {
            ngModelCtrl = ngModelCtrl_;
            this.config = config;

            ngModelCtrl.$render = function () {
                self.render();
            };

            if ($attrs.itemsPerPage) {
                $scope.$parent.$watch($parse($attrs.itemsPerPage), function (value) {
                    self.itemsPerPage = parseInt(value, 10);
                    $scope.totalPages = self.calculateTotalPages();
                });
            } else {
                this.itemsPerPage = config.itemsPerPage;
            }

            $scope.$watch('totalItems', function () {
                $scope.totalPages = self.calculateTotalPages();
            });

            $scope.$watch('totalPages', function (value) {
                setNumPages($scope.$parent, value); // Readonly variable

                if ($scope.page > value) {
                    $scope.selectPage(value);
                } else {
                    ngModelCtrl.$render();
                }
            });
        };

        this.calculateTotalPages = function () {
            var totalPages = this.itemsPerPage < 1 ? 1 : Math.ceil($scope.totalItems / this.itemsPerPage);
            return Math.max(totalPages || 0, 1);
        };

        this.render = function () {
            $scope.page = parseInt(ngModelCtrl.$viewValue, 10) || 1;
        };

        $scope.selectPage = function (page, evt) {
            if (evt) {
                evt.preventDefault();
            }

            var clickAllowed = !$scope.ngDisabled || !evt;
            if (clickAllowed && $scope.page !== page && page > 0 && page <= $scope.totalPages) {
                if (evt && evt.target) {
                    evt.target.blur();
                }
                ngModelCtrl.$setViewValue(page);
                ngModelCtrl.$render();
            }
        };

        $scope.getText = function (key) {
            return $scope[key + 'Text'] || self.config[key + 'Text'];
        };

        $scope.noPrevious = function () {
            return $scope.page === 1;
        };

        $scope.noNext = function () {
            return $scope.page === $scope.totalPages;
        };
    }])
    .directive('pagination', ['$parse', 'uibPaginationConfig', '$log', '$paginationSuppressWarning', function ($parse, paginationConfig, $log, $paginationSuppressWarning) {
        return {
            restrict: 'EA',
            scope: {
                totalItems: '=',
                firstText: '@',
                previousText: '@',
                nextText: '@',
                lastText: '@',
                ngDisabled: '='
            },
            require: ['pagination', '?ngModel'],
            controller: 'PaginationController',
            controllerAs: 'pagination',
            templateUrl: function (element, attrs) {
                return attrs.templateUrl || 'template/pagination/pagination.html';
            },
            replace: true,
            link: function (scope, element, attrs, ctrls) {
                if (!$paginationSuppressWarning) {
                    $log.warn('pagination is now deprecated. Use uib-pagination instead.');
                }
                var paginationCtrl = ctrls[0], ngModelCtrl = ctrls[1];

                if (!ngModelCtrl) {
                    return; // do nothing if no ng-model
                }

                // Setup configuration parameters
                var maxSize = angular.isDefined(attrs.maxSize) ? scope.$parent.$eval(attrs.maxSize) : paginationConfig.maxSize,
                    rotate = angular.isDefined(attrs.rotate) ? scope.$parent.$eval(attrs.rotate) : paginationConfig.rotate;
                scope.boundaryLinks = angular.isDefined(attrs.boundaryLinks) ? scope.$parent.$eval(attrs.boundaryLinks) : paginationConfig.boundaryLinks;
                scope.directionLinks = angular.isDefined(attrs.directionLinks) ? scope.$parent.$eval(attrs.directionLinks) : paginationConfig.directionLinks;

                paginationCtrl.init(ngModelCtrl, paginationConfig);

                if (attrs.maxSize) {
                    scope.$parent.$watch($parse(attrs.maxSize), function (value) {
                        maxSize = parseInt(value, 10);
                        paginationCtrl.render();
                    });
                }

                // Create page object used in template
                function makePage(number, text, isActive) {
                    return {
                        number: number,
                        text: text,
                        active: isActive
                    };
                }

                function getPages(currentPage, totalPages) {
                    var pages = [];

                    // Default page limits
                    var startPage = 1, endPage = totalPages;
                    var isMaxSized = angular.isDefined(maxSize) && maxSize < totalPages;

                    // recompute if maxSize
                    if (isMaxSized) {
                        if (rotate) {
                            // Current page is displayed in the middle of the visible ones
                            startPage = Math.max(currentPage - Math.floor(maxSize / 2), 1);
                            endPage = startPage + maxSize - 1;

                            // Adjust if limit is exceeded
                            if (endPage > totalPages) {
                                endPage = totalPages;
                                startPage = endPage - maxSize + 1;
                            }
                        } else {
                            // Visible pages are paginated with maxSize
                            startPage = ((Math.ceil(currentPage / maxSize) - 1) * maxSize) + 1;

                            // Adjust last page if limit is exceeded
                            endPage = Math.min(startPage + maxSize - 1, totalPages);
                        }
                    }

                    // Add page number links
                    for (var number = startPage; number <= endPage; number++) {
                        var page = makePage(number, number, number === currentPage);
                        pages.push(page);
                    }

                    // Add links to move between page sets
                    if (isMaxSized && !rotate) {
                        if (startPage > 1) {
                            var previousPageSet = makePage(startPage - 1, '...', false);
                            pages.unshift(previousPageSet);
                        }

                        if (endPage < totalPages) {
                            var nextPageSet = makePage(endPage + 1, '...', false);
                            pages.push(nextPageSet);
                        }
                    }

                    return pages;
                }

                var originalRender = paginationCtrl.render;
                paginationCtrl.render = function () {
                    originalRender();
                    if (scope.page > 0 && scope.page <= scope.totalPages) {
                        scope.pages = getPages(scope.page, scope.totalPages);
                    }
                };
            }
        };
    }])

    .directive('pager', ['uibPagerConfig', '$log', '$paginationSuppressWarning', function (pagerConfig, $log, $paginationSuppressWarning) {
        return {
            restrict: 'EA',
            scope: {
                totalItems: '=',
                previousText: '@',
                nextText: '@',
                ngDisabled: '='
            },
            require: ['pager', '?ngModel'],
            controller: 'PaginationController',
            controllerAs: 'pagination',
            templateUrl: function (element, attrs) {
                return attrs.templateUrl || 'template/pagination/pager.html';
            },
            replace: true,
            link: function (scope, element, attrs, ctrls) {
                if (!$paginationSuppressWarning) {
                    $log.warn('pager is now deprecated. Use uib-pager instead.');
                }
                var paginationCtrl = ctrls[0], ngModelCtrl = ctrls[1];

                if (!ngModelCtrl) {
                    return; // do nothing if no ng-model
                }

                scope.align = angular.isDefined(attrs.align) ? scope.$parent.$eval(attrs.align) : pagerConfig.align;
                paginationCtrl.init(ngModelCtrl, pagerConfig);
            }
        };
    }]);

/* Deprecated popover below */

angular.module('ui.bootstrap.popover')

    .value('$popoverSuppressWarning', false)

    .directive('popoverTemplatePopup', ['$log', '$popoverSuppressWarning', function ($log, $popoverSuppressWarning) {
        return {
            replace: true,
            scope: {
                title: '@', contentExp: '&', placement: '@', popupClass: '@', animation: '&', isOpen: '&',
                originScope: '&'
            },
            templateUrl: 'template/popover/popover-template.html',
            link: function (scope, element) {
                if (!$popoverSuppressWarning) {
                    $log.warn('popover-template-popup is now deprecated. Use uib-popover-template-popup instead.');
                }

                element.addClass('popover');
            }
        };
    }])

    .directive('popoverTemplate', ['$tooltip', function ($tooltip) {
        return $tooltip('popoverTemplate', 'popover', 'click', {
            useContentExp: true
        });
    }])

    .directive('popoverHtmlPopup', ['$log', '$popoverSuppressWarning', function ($log, $popoverSuppressWarning) {
        return {
            replace: true,
            scope: {contentExp: '&', title: '@', placement: '@', popupClass: '@', animation: '&', isOpen: '&'},
            templateUrl: 'template/popover/popover-html.html',
            link: function (scope, element) {
                if (!$popoverSuppressWarning) {
                    $log.warn('popover-html-popup is now deprecated. Use uib-popover-html-popup instead.');
                }

                element.addClass('popover');
            }
        };
    }])

    .directive('popoverHtml', ['$tooltip', function ($tooltip) {
        return $tooltip('popoverHtml', 'popover', 'click', {
            useContentExp: true
        });
    }])

    .directive('popoverPopup', ['$log', '$popoverSuppressWarning', function ($log, $popoverSuppressWarning) {
        return {
            replace: true,
            scope: {title: '@', content: '@', placement: '@', popupClass: '@', animation: '&', isOpen: '&'},
            templateUrl: 'template/popover/popover.html',
            link: function (scope, element) {
                if (!$popoverSuppressWarning) {
                    $log.warn('popover-popup is now deprecated. Use uib-popover-popup instead.');
                }

                element.addClass('popover');
            }
        };
    }])

    .directive('popover', ['$tooltip', function ($tooltip) {

        return $tooltip('popover', 'popover', 'click');
    }]);

/* deprecated tabs below */

angular.module('ui.bootstrap.tabs')

    .value('$tabsSuppressWarning', false)

    .controller('TabsetController', ['$scope', '$controller', '$log', '$tabsSuppressWarning', function ($scope, $controller, $log, $tabsSuppressWarning) {
        if (!$tabsSuppressWarning) {
            $log.warn('TabsetController is now deprecated. Use UibTabsetController instead.');
        }

        angular.extend(this, $controller('UibTabsetController', {
            $scope: $scope
        }));
    }])

    .directive('tabset', ['$log', '$tabsSuppressWarning', function ($log, $tabsSuppressWarning) {
        return {
            restrict: 'EA',
            transclude: true,
            replace: true,
            scope: {
                type: '@'
            },
            controller: 'TabsetController',
            templateUrl: 'template/tabs/tabset.html',
            link: function (scope, element, attrs) {

                if (!$tabsSuppressWarning) {
                    $log.warn('tabset is now deprecated. Use uib-tabset instead.');
                }
                scope.vertical = angular.isDefined(attrs.vertical) ? scope.$parent.$eval(attrs.vertical) : false;
                scope.justified = angular.isDefined(attrs.justified) ? scope.$parent.$eval(attrs.justified) : false;
            }
        };
    }])

    .directive('tab', ['$parse', '$log', '$tabsSuppressWarning', function ($parse, $log, $tabsSuppressWarning) {
        return {
            require: '^tabset',
            restrict: 'EA',
            replace: true,
            templateUrl: 'template/tabs/tab.html',
            transclude: true,
            scope: {
                active: '=?',
                heading: '@',
                onSelect: '&select', //This callback is called in contentHeadingTransclude
                //once it inserts the tab's content into the dom
                onDeselect: '&deselect'
            },
            controller: function () {
                //Empty controller so other directives can require being 'under' a tab
            },
            link: function (scope, elm, attrs, tabsetCtrl, transclude) {
                if (!$tabsSuppressWarning) {
                    $log.warn('tab is now deprecated. Use uib-tab instead.');
                }

                scope.$watch('active', function (active) {
                    if (active) {
                        tabsetCtrl.select(scope);
                    }
                });

                scope.disabled = false;
                if (attrs.disable) {
                    scope.$parent.$watch($parse(attrs.disable), function (value) {
                        scope.disabled = !!value;
                    });
                }

                scope.select = function () {
                    if (!scope.disabled) {
                        scope.active = true;
                    }
                };

                tabsetCtrl.addTab(scope);
                scope.$on('$destroy', function () {
                    tabsetCtrl.removeTab(scope);
                });

                //We need to transclude later, once the content container is ready.
                //when this link happens, we're inside a tab heading.
                scope.$transcludeFn = transclude;
            }
        };
    }])

    .directive('tabHeadingTransclude', ['$log', '$tabsSuppressWarning', function ($log, $tabsSuppressWarning) {
        return {
            restrict: 'A',
            require: '^tab',
            link: function (scope, elm) {
                if (!$tabsSuppressWarning) {
                    $log.warn('tab-heading-transclude is now deprecated. Use uib-tab-heading-transclude instead.');
                }

                scope.$watch('headingElement', function updateHeadingElement(heading) {
                    if (heading) {
                        elm.html('');
                        elm.append(heading);
                    }
                });
            }
        };
    }])

    .directive('tabContentTransclude', ['$log', '$tabsSuppressWarning', function ($log, $tabsSuppressWarning) {
        return {
            restrict: 'A',
            require: '^tabset',
            link: function (scope, elm, attrs) {
                if (!$tabsSuppressWarning) {
                    $log.warn('tab-content-transclude is now deprecated. Use uib-tab-content-transclude instead.');
                }

                var tab = scope.$eval(attrs.tabContentTransclude);

                //Now our tab is ready to be transcluded: both the tab heading area
                //and the tab content area are loaded.  Transclude 'em both.
                tab.$transcludeFn(tab.$parent, function (contents) {
                    angular.forEach(contents, function (node) {
                        if (isTabHeading(node)) {
                            //Let tabHeadingTransclude know.
                            tab.headingElement = node;
                        }
                        else {
                            elm.append(node);
                        }
                    });
                });
            }
        };

        function isTabHeading(node) {
            return node.tagName && (
                    node.hasAttribute('tab-heading') ||
                    node.hasAttribute('data-tab-heading') ||
                    node.hasAttribute('x-tab-heading') ||
                    node.tagName.toLowerCase() === 'tab-heading' ||
                    node.tagName.toLowerCase() === 'data-tab-heading' ||
                    node.tagName.toLowerCase() === 'x-tab-heading'
                );
        }
    }]);

/* Deprecated tooltip below */

angular.module('ui.bootstrap.tooltip')

    .value('$tooltipSuppressWarning', false)

    .provider('$tooltip', ['$uibTooltipProvider', function ($uibTooltipProvider) {
        angular.extend(this, $uibTooltipProvider);

        this.$get = ['$log', '$tooltipSuppressWarning', '$injector', function ($log, $tooltipSuppressWarning, $injector) {
            if (!$tooltipSuppressWarning) {
                $log.warn('$tooltip is now deprecated. Use $uibTooltip instead.');
            }

            return $injector.invoke($uibTooltipProvider.$get);
        }];
    }])

    // This is mostly ngInclude code but with a custom scope
    .directive('tooltipTemplateTransclude', [
        '$animate', '$sce', '$compile', '$templateRequest', '$log', '$tooltipSuppressWarning',
        function ($animate, $sce, $compile, $templateRequest, $log, $tooltipSuppressWarning) {
            return {
                link: function (scope, elem, attrs) {
                    if (!$tooltipSuppressWarning) {
                        $log.warn('tooltip-template-transclude is now deprecated. Use uib-tooltip-template-transclude instead.');
                    }

                    var origScope = scope.$eval(attrs.tooltipTemplateTranscludeScope);

                    var changeCounter = 0,
                        currentScope,
                        previousElement,
                        currentElement;

                    var cleanupLastIncludeContent = function () {
                        if (previousElement) {
                            previousElement.remove();
                            previousElement = null;
                        }
                        if (currentScope) {
                            currentScope.$destroy();
                            currentScope = null;
                        }
                        if (currentElement) {
                            $animate.leave(currentElement).then(function () {
                                previousElement = null;
                            });
                            previousElement = currentElement;
                            currentElement = null;
                        }
                    };

                    scope.$watch($sce.parseAsResourceUrl(attrs.tooltipTemplateTransclude), function (src) {
                        var thisChangeId = ++changeCounter;

                        if (src) {
                            //set the 2nd param to true to ignore the template request error so that the inner
                            //contents and scope can be cleaned up.
                            $templateRequest(src, true).then(function (response) {
                                if (thisChangeId !== changeCounter) {
                                    return;
                                }
                                var newScope = origScope.$new();
                                var template = response;

                                var clone = $compile(template)(newScope, function (clone) {
                                    cleanupLastIncludeContent();
                                    $animate.enter(clone, elem);
                                });

                                currentScope = newScope;
                                currentElement = clone;

                                currentScope.$emit('$includeContentLoaded', src);
                            }, function () {
                                if (thisChangeId === changeCounter) {
                                    cleanupLastIncludeContent();
                                    scope.$emit('$includeContentError', src);
                                }
                            });
                            scope.$emit('$includeContentRequested', src);
                        } else {
                            cleanupLastIncludeContent();
                        }
                    });

                    scope.$on('$destroy', cleanupLastIncludeContent);
                }
            };
        }])

    .directive('tooltipClasses', ['$log', '$tooltipSuppressWarning', function ($log, $tooltipSuppressWarning) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                if (!$tooltipSuppressWarning) {
                    $log.warn('tooltip-classes is now deprecated. Use uib-tooltip-classes instead.');
                }

                if (scope.placement) {
                    element.addClass(scope.placement);
                }
                if (scope.popupClass) {
                    element.addClass(scope.popupClass);
                }
                if (scope.animation()) {
                    element.addClass(attrs.tooltipAnimationClass);
                }
            }
        };
    }])

    .directive('tooltipPopup', ['$log', '$tooltipSuppressWarning', function ($log, $tooltipSuppressWarning) {
        return {
            replace: true,
            scope: {content: '@', placement: '@', popupClass: '@', animation: '&', isOpen: '&'},
            templateUrl: 'template/tooltip/tooltip-popup.html',
            link: function (scope, element) {
                if (!$tooltipSuppressWarning) {
                    $log.warn('tooltip-popup is now deprecated. Use uib-tooltip-popup instead.');
                }

                element.addClass('tooltip');
            }
        };
    }])

    .directive('tooltip', ['$uibTooltip', function ($uibTooltip) {
        return $uibTooltip('tooltip', 'tooltip', 'mouseenter');
    }])

    .directive('tooltipTemplatePopup', ['$log', '$tooltipSuppressWarning', function ($log, $tooltipSuppressWarning) {
        return {
            replace: true,
            scope: {
                contentExp: '&', placement: '@', popupClass: '@', animation: '&', isOpen: '&',
                originScope: '&'
            },
            templateUrl: 'template/tooltip/tooltip-template-popup.html',
            link: function (scope, element) {
                if (!$tooltipSuppressWarning) {
                    $log.warn('tooltip-template-popup is now deprecated. Use uib-tooltip-template-popup instead.');
                }

                element.addClass('tooltip');
            }
        };
    }])

    .directive('tooltipTemplate', ['$tooltip', function ($tooltip) {
        return $tooltip('tooltipTemplate', 'tooltip', 'mouseenter', {
            useContentExp: true
        });
    }])

    .directive('tooltipHtmlPopup', ['$log', '$tooltipSuppressWarning', function ($log, $tooltipSuppressWarning) {
        return {
            replace: true,
            scope: {contentExp: '&', placement: '@', popupClass: '@', animation: '&', isOpen: '&'},
            templateUrl: 'template/tooltip/tooltip-html-popup.html',
            link: function (scope, element) {
                if (!$tooltipSuppressWarning) {
                    $log.warn('tooltip-html-popup is now deprecated. Use uib-tooltip-html-popup instead.');
                }

                element.addClass('tooltip');
            }
        };
    }])

    .directive('tooltipHtml', ['$tooltip', function ($tooltip) {
        return $tooltip('tooltipHtml', 'tooltip', 'mouseenter', {
            useContentExp: true
        });
    }]);

angular.module('ui.bootstrap.tooltip').run(["$templateCache", function (a) {
    a.put("template/modal/backdrop.html", '<div uib-modal-animation-class="fade"     modal-in-class="in"     ng-style="{\'z-index\': 1040 + (index && 1 || 0) + index*10}"></div>')
}]);
angular.module('ui.bootstrap.tooltip').run(["$templateCache", function (a) {
    a.put("template/modal/window.html", '<div modal-render="{{$isRendered}}" tabindex="-1" role="dialog" class="modal"    uib-modal-animation-class="fade"    modal-in-class="in"    ng-style="{\'z-index\': 1050 + index*10, display: \'block\'}">    <div class="modal-dialog" ng-class="size ? \'modal-\' + size : \'\'"><div class="modal-content" uib-modal-transclude></div></div></div>')
}]);
angular.module('ui.bootstrap.tooltip').run(["$templateCache", function (a) {
    a.put("template/pagination/pager.html", '<ul class="pager">  <li ng-class="{disabled: noPrevious()||ngDisabled, previous: align}"><a href ng-click="selectPage(page - 1, $event)">{{::getText(\'previous\')}}</a></li>  <li ng-class="{disabled: noNext()||ngDisabled, next: align}"><a href ng-click="selectPage(page + 1, $event)">{{::getText(\'next\')}}</a></li></ul>')
}]);
angular.module('ui.bootstrap.tooltip').run(["$templateCache", function (a) {
    a.put("template/pagination/pagination.html", '<ul class="pagination">  <li ng-if="::boundaryLinks" ng-class="{disabled: noPrevious()||ngDisabled}" class="pagination-first"><a href ng-click="selectPage(1, $event)">{{::getText(\'first\')}}</a></li>  <li ng-if="::directionLinks" ng-class="{disabled: noPrevious()||ngDisabled}" class="pagination-prev"><a href ng-click="selectPage(page - 1, $event)">{{::getText(\'previous\')}}</a></li>  <li ng-repeat="page in pages track by $index" ng-class="{active: page.active,disabled: ngDisabled&&!page.active}" class="pagination-page"><a href ng-click="selectPage(page.number, $event)">{{page.text}}</a></li>  <li ng-if="::directionLinks" ng-class="{disabled: noNext()||ngDisabled}" class="pagination-next"><a href ng-click="selectPage(page + 1, $event)">{{::getText(\'next\')}}</a></li>  <li ng-if="::boundaryLinks" ng-class="{disabled: noNext()||ngDisabled}" class="pagination-last"><a href ng-click="selectPage(totalPages, $event)">{{::getText(\'last\')}}</a></li></ul>')
}]);
angular.module('ui.bootstrap.tooltip').run(["$templateCache", function (a) {
    a.put("template/tooltip/tooltip-html-popup.html", '<div  tooltip-animation-class="fade"  uib-tooltip-classes  class="{{isOpen()?\'in\':\'\'}}">  <div class="tooltip-arrow"></div>  <div class="tooltip-inner" ng-bind-html="contentExp()"></div></div>')
}]);
angular.module('ui.bootstrap.tooltip').run(["$templateCache", function (a) {
    a.put("template/tooltip/tooltip-popup.html", `<div tooltip-animation-class="fade"  uib-tooltip-classes class="{{isOpen()?'in':''}}">
        <div class="tooltip-arrow"></div>  
        <div class="tooltip-inner" ng-bind="content"></div>
        </div>`)
}]);
angular.module('ui.bootstrap.tooltip').run(["$templateCache", function (a) {
    a.put("template/tooltip/tooltip-template-popup.html", '<div  tooltip-animation-class="fade"  uib-tooltip-classes  class="{{isOpen()?\'in\':\'\'}}">  <div class="tooltip-arrow"></div>  <div class="tooltip-inner"    uib-tooltip-template-transclude="contentExp()"    tooltip-template-transclude-scope="originScope()"></div></div>')
}]);
angular.module('ui.bootstrap.tooltip').run(["$templateCache", function (a) {
    a.put("template/popover/popover-html.html", '<div tooltip-animation-class="fade"  uib-tooltip-classes  class="{{isOpen()?\'in\':\'\'}}">  <div class="arrow"></div>  <div class="popover-inner">      <h3 class="popover-title" ng-bind="title" ng-if="title"></h3>      <div class="popover-content" ng-bind-html="contentExp()"></div>  </div></div>')
}]);
angular.module('ui.bootstrap.tooltip').run(["$templateCache", function (a) {
    a.put("template/popover/popover-template.html", '<div tooltip-animation-class="fade"  uib-tooltip-classes  class="{{isOpen()?\'in\':\'\'}}">  <div class="arrow"></div>  <div class="popover-inner">      <h3 class="popover-title" ng-bind="title" ng-if="title"></h3>      <div class="popover-content"        uib-tooltip-template-transclude="contentExp()"        tooltip-template-transclude-scope="originScope()"></div>  </div></div>')
}]);
angular.module('ui.bootstrap.tooltip').run(["$templateCache", function (a) {
    a.put("template/popover/popover.html", '<div tooltip-animation-class="fade"  uib-tooltip-classes  class="{{isOpen()?\'in\':\'\'}}">  <div class="arrow"></div>  <div class="popover-inner">      <h3 class="popover-title" ng-bind="title" ng-if="title"></h3>      <div class="popover-content" ng-bind="content"></div>  </div></div>')
}]);
angular.module('ui.bootstrap.tooltip').run(["$templateCache", function (a) {
    a.put("template/tabs/tab.html", '<li ng-class="{active: active, disabled: disabled}">  <a href ng-click="select()" uib-tab-heading-transclude>{{heading}}</a></li>')
}]);
angular.module('ui.bootstrap.tooltip').run(["$templateCache", function (a) {
    a.put("template/tabs/tabset.html", '<div>  <ul class="nav nav-{{type || \'tabs\'}}" ng-class="{\'nav-stacked\': vertical, \'nav-justified\': justified}" ng-transclude></ul>  <div class="tab-content">    <div class="tab-pane"          ng-repeat="tab in tabs"          ng-class="{active: tab.active}"         uib-tab-content-transclude="tab">    </div>  </div></div>')
}]);
