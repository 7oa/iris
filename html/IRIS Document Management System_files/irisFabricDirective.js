(function (undefined) {

    angular.module('irisFabric')
        .directive('irisFabric', function ($q, $timeout, $filter, $window, FabricActivator, IrisFabricElementsActivator) {
            return {
                restrict: 'AE',
                transclude: true,
                replace: true,

                scope: {
                    properties: '=',
                    elements: '=',
                    boundaries: '=',
                    params: '=',
                    project: '=',
                    device: '=',
                    api: '=?'
                },

                template: `<div class="iris-fabric">
                            <div class="iris-fabric-objects" ng-transclude></div>
                            <canvas></canvas>
                       </div>`,

                link: function ($scope, $element, $attrs) {
                    if (!$scope.properties) return;

                    var fixAspectRatio = $scope.properties.fixAspectRatio === undefined ? true : !!$scope.properties.fixAspectRatio,
                        aspectRatio = ($scope.properties.width / $scope.properties.height) || $scope.properties.aspectRatio || 1,
                        canvasElement = $($element).find('canvas').first(),
                        enableSelection = $scope.properties.enableSelection === undefined ? true : !!$scope.properties.enableSelection,
                        readonly = $attrs.readonly == "true",
                        autoSize = angular.extend({
                            enabled: true,
                            onlyInit: false,
                            toWidth: true,
                            toHeight: false,
                            initialWidth: $($element).parent().width(),
                            initialHeight: $($element).parent().height()
                        }, $scope.properties.autoSize || {});

                    $scope.fabricEditor = FabricActivator.createEditor(canvasElement, {
                        fixAspectRatio: fixAspectRatio,
                        aspectRatio: aspectRatio,
                        selection: enableSelection
                    }, readonly);

                    $scope.setFabricEditor($scope.fabricEditor);

                    function autoResize() {
                        var newWidth = autoSize.initialWidth || (autoSize.getContainerWidthHandler && autoSize.getContainerWidthHandler()),
                            newHeight = autoSize.initialHeight || (autoSize.getContainerHeightHandler && autoSize.getContainerHeightHandler());

                        if (autoSize.toWidth && !autoSize.toHeight) {
                            $scope.fabricEditor.resizeToWidth(newWidth);
                        } else if (!autoSize.toWidth && autoSize.toHeight) {
                            $scope.fabricEditor.resizeToHeight(newHeight);
                        } else if (autoSize.toWidth && autoSize.toHeight) {
                            $scope.fabricEditor.resizeToBounds(newWidth, newHeight);
                        }

                        delete autoSize.initialWidth;
                        delete autoSize.initialHeight;
                    }

                    $timeout(function () {
                        if (autoSize.enabled) {
                            autoResize();
                        }
                        $scope.$emit('irisFabric:editor:ready');
                    }, 0, false);

                    if (!readonly) {
                        $scope.fabricEditor.wrapperEl.addEventListener("keydown", function (keydownEvent) {
                            $scope.$emit('irisFabric:editor:keydown', keydownEvent);
                        });
                        $scope.fabricEditor.on("mouse:dblClick", function (event) {
                            $scope.$emit('irisFabric:editor:dblClick', event);
                        });
                        $scope.fabricEditor.on("object:modified", function (event) {
                            $scope.$emit('irisFabric:editor:viewObjectModified', event);
                        });
                    }

                    /* TOOLTIP SUPPORT */
                    $scope.fabricEditor.tooltipObject = angular.element("<div>").addClass("iris-fabric-tooltip").appendTo(angular.element($scope.fabricEditor.wrapperEl)).hide();
                    $scope.fabricEditor.on('mouse:over', function(e) {
                        var viewObject = e.target;
                        if (viewObject && viewObject.element && viewObject.element.showTooltip) {
                            var tooltip = viewObject.element.getTooltip(angular.extend(getManagedVariables(), {
                                element: viewObject.element,
                                dataSeriesDate: viewObject.element.dataSeriesDate ? $filter("irisTime")(viewObject.element.dataSeriesDate, this, "@{datetime}") : "n/a"
                            }));
                            if (tooltip !== undefined && tooltip !== null) {
                                $scope.fabricEditor.tooltipObject.html(tooltip).show();
                            }
                        }
                    });
                    $scope.fabricEditor.on('mouse:move', function(e) {
                        var pointer = $scope.fabricEditor.getPointer(event.e);
                        $scope.fabricEditor.tooltipObject.css("top", pointer.y + 5);
                        $scope.fabricEditor.tooltipObject.css("left", pointer.x + 5);
                    });
                    $scope.fabricEditor.on('mouse:out', function(e) {
                        $scope.fabricEditor.tooltipObject.hide();
                    });

                    var getSelectedElement = function () {
                        var selectedObject = $scope.fabricEditor.getActiveObject();
                        return (selectedObject && selectedObject.element) ? selectedObject.element : null;
                    };

                    var getSelectedGroup = function () {
                        var selectedGroup = $scope.fabricEditor.getActiveGroup();
                        if (!selectedGroup || !selectedGroup._objects) return null;

                        var res = selectedGroup._objects.map((t) => {
                            return t.element;
                        });
                        return res.length > 0 ? res : null;
                    };

                    function onSelectionChanged() {
                        $scope.$emit('irisFabric:element:selected', getSelectedElement());
                        $scope.$emit('irisFabric:group:selected', getSelectedGroup());
                        $timeout(() => {
                            $scope.$digest();
                        });
                    };

                    $scope.fabricEditor.on('object:selected', function (o) {
                        onSelectionChanged();
                    });

                    $scope.fabricEditor.on('selection:created', function () {
                        $timeout(function () {
                            onSelectionChanged();
                        });
                    });

                    $scope.fabricEditor.on('selection:cleared', function () {
                        $timeout(function () {
                            onSelectionChanged();
                        });
                    });

                    var downloadImage = function (fileName, extension) {
                        var link = $window.document.createElement("a");
                        link.setAttribute("href", $scope.fabricEditor.toDataURL(extension));
                        link.setAttribute("download", `${fileName}.${extension}`);
                        link.click();
                    };

                    var clearSelection = function (withDispatch) {
                        if (getSelection().length <= 0) return;

                        if (withDispatch) {
                            $scope.fabricEditor.deactivateAllWithDispatch();
                        } else {
                            $scope.fabricEditor.deactivateAll();
                        }
                    };

                    var getSelection = function () {
                        var res = [],
                            selectedElement = getSelectedElement(),
                            selectedGroup = getSelectedGroup();

                        if (selectedElement) res.push(selectedElement);
                        else if (selectedGroup) selectedGroup.forEach((e) => res.push(e));
                        return res;
                    };

                    var setSelection = function (elements, onlyElement) {
                        elements || (elements = []);
                        if (elements.length <= 0) return;
                        (elements instanceof Array) || (elements = [elements]);

                        clearSelection();
                        if (elements.length === 1) {
                            if (onlyElement) {
                                $scope.$emit('irisFabric:element:selected', elements[0]);
                            } else {
                                $scope.fabricEditor.setActiveObject(elements[0].viewObject);
                            }
                        } else {
                            $scope.fabricEditor.setActiveGroup(new fabric.Group(elements.map((e) => {
                                return e.viewObject;
                            }))).renderAll();
                        }
                    };

                    var elementsFromHashes = function (elementHashes, append) {
                        if (!append) $scope.elements = [];
                        $timeout(() => {
                            elementHashes = elementHashes || [];
                            elementHashes.sort((a, b) => {
                                return (a.renderOrder - b.renderOrder);
                            }).reduce(function (q, elementHash) {
                                return q.then(function (res) {
                                    return addElementFromObject(elementHash.elementType, elementHash);
                                });
                            }, $q.when());
                        });
                    };

                    var elementsToHashes = function (elements) {
                        elements = elements || $scope.elements;
                        return elements.filter(element => {
                            return element.attached;
                        }).map(element => {
                            return element.toObject(true);
                        });
                    };

                    var addElement = function (type, options, additionalData) {
                        return IrisFabricElementsActivator.createElement($scope.fabricEditor, type, options, additionalData).then((element) => {
                            $scope.elements = $scope.elements || [];
                            $scope.elements.push(element);
                            return element;
                        });
                    };

                    var addElementFromObject = function (type, options) {
                        return IrisFabricElementsActivator.createElementFromObject($scope.fabricEditor, type, options).then((element) => {
                            $scope.elements = $scope.elements || [];
                            $scope.elements.push(element);
                            return element;
                        });
                    };

                    var createElementFromObject = function (type, options) {
                        return IrisFabricElementsActivator.createElementFromObject($scope.fabricEditor, type, options);
                    };

                    var addElementInstance = function (element) {
                        $scope.elements = $scope.elements || [];
                        $scope.elements.push(element);
                    };

                    var setElementAlign = function (align, element) {
                        element || (element = getSelectedElement());
                        if (!element || !element.viewObject) return;

                        switch (align) {
                            case 'left':
                                element.viewObject.moveLeft();
                                break;
                            case 'center':
                                element.viewObject.moveCenterH();
                                break;
                            case 'right':
                                element.viewObject.moveRight();
                                break;
                            case 'top':
                                element.viewObject.moveTop();
                                break;
                            case 'middle':
                                element.viewObject.moveCenterV();
                                break;
                            case 'bottom':
                                element.viewObject.moveBottom();
                                break;
                        }
                    };

                    var setInGroupAlign = function (align, elements) {
                        var activeGroup = $scope.fabricEditor.getActiveGroup(),
                            groupState = {},
                            elementsMaxWidth = 0,
                            elementsMaxHeight = 0;
                        if (!activeGroup || !elements || !(elements instanceof Array)) return;

                        elements.forEach((e) => {
                            elementsMaxWidth = Math.max(elementsMaxWidth, e.viewObject.getBoundingRectWidth());
                        });

                        elements.forEach((e) => {
                            elementsMaxHeight = Math.max(elementsMaxHeight, e.viewObject.getBoundingRectHeight());
                        });

                        switch (align) {
                            case 'left':
                                elements.forEach((e) => {
                                    e.viewObject.left = -elementsMaxWidth / 2;
                                    groupState.top = activeGroup.top;
                                    groupState.left = activeGroup.left;
                                });
                                break;
                            case 'center':
                                elements.forEach((e) => {
                                    e.viewObject.left = -e.viewObject.getBoundingRectWidth() / 2;
                                    groupState.top = activeGroup.top;
                                    groupState.left = activeGroup.left + (activeGroup.width - elementsMaxWidth) / 2;
                                });
                                break;
                            case 'right':
                                elements.forEach((e) => {
                                    e.viewObject.left = elementsMaxWidth / 2 - e.viewObject.getBoundingRectWidth();
                                    groupState.top = activeGroup.top;
                                    groupState.left = activeGroup.left + activeGroup.width - elementsMaxWidth;
                                });
                                break;
                            case 'top':
                                elements.forEach((e) => {
                                    e.viewObject.top = -elementsMaxHeight / 2;
                                    groupState.top = activeGroup.top;
                                    groupState.left = activeGroup.left;
                                });
                                break;
                            case 'middle':
                                elements.forEach((e) => {
                                    e.viewObject.top = -e.viewObject.getBoundingRectHeight() / 2;
                                    groupState.top = activeGroup.top + (activeGroup.height - elementsMaxHeight) / 2;
                                    groupState.left = activeGroup.left;
                                });
                                break;
                            case 'bottom':
                                elements.forEach((e) => {
                                    e.viewObject.top = elementsMaxHeight / 2 - e.viewObject.getBoundingRectHeight();
                                    groupState.top = activeGroup.top + activeGroup.height - elementsMaxHeight;
                                    groupState.left = activeGroup.left;
                                });
                                break;
                        }

                        activeGroup._calcBounds();
                        angular.extend(activeGroup, groupState);
                        activeGroup.setCoords();
                        $scope.fabricEditor.renderAll();
                    };

                    var getManagedVariables = function () {
                        return {
                            device: $scope.device,
                            boundaries: $scope.boundaries,
                            params: $scope.params,
                            project: $scope.project
                        }
                    };

                    var refreshEditor = function (event) {
                        var managedVariables = getManagedVariables();
                        if ($scope.elements) $scope.elements.forEach((e) => {
                            if (e.attached) e.refreshState(managedVariables);
                        });
                        if (autoSize.enabled) {
                            autoResize();
                        }
                        $scope.fabricEditor.renderAll();
                    };

                    var createGroup = function (elements, options) {
                        elements || (elements = getSelection());
                        if (elements.length <= 1) return;

                        clearSelection();
                        var groupElements = elements.filter((e) => {
                            return e.elementType === "group";
                        });
                        groupElements.forEach((g) => {
                            var index = elements.indexOf(g);
                            elements.splice(index, 1);
                            unGroup(g, true);
                            g.elements.forEach((ge) => {
                                elements.push(ge);
                            });
                        });

                        addElement("group", options, elements);
                    };

                    var unGroup = function (groupElement, onlyUnGroup) {
                        if (!groupElement || !(groupElement.elementType === "group")) return;

                        var elements = groupElement.elements;
                        groupElement.viewObject._restoreObjectsState();
                        removeElement(groupElement, true);
                        if (onlyUnGroup) return;

                        $timeout(function () {
                            elements.forEach((e) => {
                                e.viewObject.element = e;
                                e.groupElement = null;
                                e.attach();
                            });
                            setSelection(elements);
                            refreshEditor();
                        });
                    };

                    var rotateElement = function (element, angleShift, addAngle) {
                        if (!element.viewObject) return;
                        var object = element.viewObject,
                            resetOrigin = false;

                        var newAngle = (addAngle ? object.getAngle() : 0) + angleShift;

                        if ((object.originX !== 'center' || object.originY !== 'center') && object.centeredRotation) {
                            object.setOriginToCenter && object.setOriginToCenter();
                            resetOrigin = true;
                        }

                        object.setAngle(newAngle).setCoords();

                        if (resetOrigin) {
                            object.setCenterToOrigin && object.setCenterToOrigin();
                        }

                        $scope.fabricEditor.renderAll();
                        setSelection(getSelection());
                    };

                    var flipElement = function(element, direction) {
                        if (!element.viewObject) return;
                        element.viewObject["flip" + direction] = !element.viewObject["flip" + direction];
                        $scope.fabricEditor.renderAll();
                    };

                    var cloneElement = function (element, cloneShift, batchClone, cloneOptions) {
                        var elementOptions = element.toObject(),
                            cloneShift = cloneShift || 0;

                        cloneOptions || (cloneOptions = {});
                        elementOptions.viewObjectOptions.left += cloneShift;
                        elementOptions.viewObjectOptions.top += cloneShift;
                        elementOptions.isClone = true;
                        elementOptions.activateOnCreate = !batchClone;

                        return addElementFromObject(elementOptions.elementType, angular.merge(angular.copy(elementOptions), cloneOptions));
                    };

                    var removeElement = function (element, onlyElement) {
                        var index = $scope.elements.indexOf(element);
                        $scope.elements.splice(index, 1);

                        if (!onlyElement && element.elements) {
                            element.elements.forEach((e) => {
                                removeElement(e);
                            });
                        }
                    };

                    $scope.api = {
                        getFabricEditor: function () {
                            return $scope.fabricEditor;
                        },

                        downloadImage,

                        elementsFromHashes,
                        elementsToHashes,

                        createElementFromObject,
                        addElementInstance,

                        addElement,
                        addElementFromObject,
                        onElementAdd: function (handler) {
                            $scope.onElementAddHandler = handler;
                        },

                        getElements: function () {
                            return $scope.elements;
                        },

                        refreshEditor,
                        getManagedVariables,

                        clearSelection,
                        getSelection,
                        setSelection,

                        setElementAlign,
                        setInGroupAlign,

                        createGroup,
                        unGroup,

                        cloneElement,
                        cloneSelectedElements: function (cloneOptions) {
                            var elements = getSelection(),
                                cloneElements = new Array();
                            clearSelection();

                            elements.reduce(function (q, element) {
                                return q.then(function (res) {
                                    if (res) cloneElements.push(res);
                                    return cloneElement(element, 20, elements.length > 1, cloneOptions);
                                });
                            }, $q.when()).then((res) => {
                                if (res) cloneElements.push(res);
                                if (cloneElements.length > 1) $timeout(() => {
                                    setSelection(cloneElements);
                                });
                            });
                        },

                        removeElement,
                        removeSelectedElements: function () {
                            getSelection().forEach((e) => {
                                removeElement(e);
                            });
                            clearSelection(true);
                        },

                        rotateSelectedElements: function (angle, addAngle) {
                            getSelection().forEach((e) => {
                                rotateElement(e, angle, addAngle);
                            });
                        },

                        flipSelectedElements: function (direction) {
                            direction || (direction = "X");
                            getSelection().forEach((e) => {
                                flipElement(e, direction);
                            });
                        },

                        textSettingsToSelectedElements: function (textSettings) {
                            var elementOptions = ["bold", "italic", "underlined"],
                                viewObjectOptions = ["textAlign", "fontFamily"],
                                groupElements = getSelection().filter((e) => {
                                    return e.elementType === "group";
                                }),
                                elements = getSelection().filter((e) => {
                                    return e.elementType === "managedText" || e.elementType === "progressBar" || e.elementType === "speedometer";
                                });

                            groupElements.forEach((g) => {
                                g.elements.forEach((e) => {
                                    elements.push(e);
                                })
                            });

                            elements.forEach((e) => {
                                elementOptions.forEach((eo) => {
                                    if (textSettings.hasOwnProperty(eo)) e.stateDefault[eo] = textSettings[eo];
                                });
                                viewObjectOptions.forEach((vo) => {
                                    if (textSettings.hasOwnProperty(vo)) e.stateDefault.viewObject[vo] = textSettings[vo];
                                });
                                refreshEditor();
                            });
                        }
                    };

                    if (autoSize.enabled && !autoSize.onlyInit) {
                        angular.element($window).bind("resize", function () {
                            $scope.$digest();
                        });

                        $scope.$watch(function () {
                            return {width: $element.parent().width(), height: $element.parent().height()};
                        }, function () {
                            autoResize();
                        }, true);
                    }

                    $scope.$watch('properties.aspectRatio', function (aspectRatio, oldAspectRatio) {
                        if (angular.equals(aspectRatio, oldAspectRatio)) return;
                        $scope.fabricEditor.resizeToAspectRatio(aspectRatio);
                        if (autoSize.enabled && !autoSize.onlyInit) autoResize();
                    });

                    $scope.$watchGroup(['properties.width', 'properties.height'], function (sizes, oldSizes) {
                        if (angular.equals(sizes, oldSizes)) return;
                        $scope.properties && ($scope.properties.aspectRatio = sizes[0] / sizes[1]);
                    });

                    $scope.$watch('properties.settings.backgroundImgId', function (newValue, oldValue) {
                        if (newValue) {
                            $timeout(function () {
                                $scope.fabricEditor.setBackgroundImage($filter('dmsFilePreview')(newValue),
                                    $scope.fabricEditor.renderAll.bind($scope.fabricEditor),
                                    {
                                        left: 0,
                                        top: 0,
                                        width: $scope.fabricEditor.width,
                                        height: $scope.fabricEditor.height
                                    });
                            });
                        } else {
                            $timeout(function () {
                                $scope.fabricEditor.setBackgroundImage(null);
                                $scope.fabricEditor.renderAll();
                            });
                        }
                    });

                    $scope.$watch('properties.settings.fill', function (newValue, oldValue) {
                        $scope.fabricEditor.setBackgroundColor(newValue, $scope.fabricEditor.renderAll.bind($scope.fabricEditor));
                    });
                },

                controller: function ($scope) {
                    var fabricEditorDefer = $q.defer();

                    $scope.getFabricEditor = function () {
                        return fabricEditorDefer.promise;
                    };

                    $scope.setFabricEditor = function (fabricEditor) {
                        fabricEditorDefer.resolve(fabricEditor);
                    };

                    this.getIrisFabricScope = function () {
                        return $scope;
                    };
                }
            };
        });
})();