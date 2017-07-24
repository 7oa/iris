(function () {
    angular.module('irisFabric').factory('IrisFabricElementsActivator',
        function ($q, $translate, IrisFabricGroupElement, IrisFabricImageElement, IrisFabricFreeFormElement, IrisFabricIconElement, IrisFabricFreeFormWithTextElement, IrisFabricManagedTextElement, IrisFabricProgressBarElement, IrisFabricSpeedometerElement, IrisFabricLineElement) {
            return {
                createElement: function (fabricEditor, type, options, additionalData) {
                    var deferred = $q.defer();

                    options || (options = {});
                    options.activateOnCreate = true;

                    $q.when((function() {
                        switch (type) {
                            case "group":
                                return new IrisFabricGroupElement(fabricEditor, options, additionalData);
                            case "image":
                                return new IrisFabricImageElement(fabricEditor, options);
                            case "freeForm":
                                return new IrisFabricFreeFormElement(fabricEditor, options);
                            case "freeFormWithText":
                                return new IrisFabricFreeFormWithTextElement(fabricEditor, options);
                            case "managedText":
                                return new IrisFabricManagedTextElement(fabricEditor, options);
                            case "progressBar":
                                return new IrisFabricProgressBarElement(fabricEditor, options);
                            case "speedometer":
                                return new IrisFabricSpeedometerElement(fabricEditor, options);
                            case "line":
                                return new IrisFabricLineElement(fabricEditor, options);
                            case "icon":
                                return new IrisFabricIconElement(fabricEditor, options);
                        }
                    })()).then(function(element) {
                        element.render().then(function (renderedElement) {
                            deferred.resolve(renderedElement);
                        });
                    });

                    return deferred.promise;
                },

                createElementFromObject: function (fabricEditor, type, options) {
                    var deferred = $q.defer(),
                        that = this;

                    $q.when((function() {
                        switch (type) {
                            case "group":
                                var elements = new Array(),
                                    groupDeferred = $q.defer();

                                options.elementsOptions.reduce(function (q, elementHash) {
                                    return q.then(function (res) {
                                        if (res) elements.push(res);
                                        return that.createElementFromObject(fabricEditor, elementHash.elementType, angular.extend(elementHash, {isClone: options.isClone}));
                                    });
                                }, $q.when()).then((res) => {
                                    elements.push(res);
                                    groupDeferred.resolve(IrisFabricGroupElement.fromObject(fabricEditor, options, elements));
                                });

                                return groupDeferred.promise;
                            case "image":
                                return IrisFabricImageElement.fromObject(fabricEditor, options);
                            case "freeForm":
                                return IrisFabricFreeFormElement.fromObject(fabricEditor, options);
                            case "freeFormWithText":
                                return IrisFabricFreeFormWithTextElement.fromObject(fabricEditor, options);
                            case "managedText":
                                return IrisFabricManagedTextElement.fromObject(fabricEditor, options);
                            case "progressBar":
                                return IrisFabricProgressBarElement.fromObject(fabricEditor, options);
                            case "speedometer":
                                return IrisFabricSpeedometerElement.fromObject(fabricEditor, options);
                            case "line":
                                return IrisFabricLineElement.fromObject(fabricEditor, options);
                            case "icon":
                                return IrisFabricIconElement.fromObject(fabricEditor, options);
                        }
                    })()).then(function(element) {
                        element.render().then(function (renderedElement) {
                            deferred.resolve(renderedElement);
                        });
                    });

                    return deferred.promise;
                }
            };
        });
})();