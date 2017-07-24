(function(globals) {
    globals.angular.module('irisApp').directive('irisDragDrop', function($rootScope) {
        return {
            restrict: 'A',

            scope: {
                irisDragData: '=?',
                irisDropData: '=?',
                irisDragDataGetter: '&',
                onDrop: "&"
            },

            link: function(scope, element, attrs) {
                var mode = attrs["irisDragDrop"] || "both";

                scope.irisDragData || (scope.irisDragData = {});
                scope.irisDropData || (scope.irisDropData = {});

                var getDataTransfer = (e) => e["dataTransfer"] || e.originalEvent["dataTransfer"],
                    isDrag = () => mode == "drag" || mode == "both",
                    isDrop = () => mode == "drop" || mode == "both";

                isDrag() && element.attr("draggable", "true");

                isDrag() && element.bind("dragstart", function(e) {
                    for (var prop in scope.irisDragData) {
                        if (scope.irisDragData.hasOwnProperty(prop)) {
                            getDataTransfer(e).setData(prop, scope.irisDragData[prop]);
                        }
                    }

                    if (scope.irisDragDataGetter) {
                        var getterData = scope.irisDragDataGetter();
                        getDataTransfer(e).setData("getterData", getterData);
                    }

                    // implement dragType variable if drag not lines (to point cursor correctly)
                    var dragPoint = element.height() / 2;
                    getDataTransfer(e).setDragImage(e.target, dragPoint, dragPoint);

                    $rootScope.$emit("iris-drag-start");

                    return true;
                });

                isDrag() && element.bind("dragend", function(e) {
                    $rootScope.$emit("iris-drag-end");
                });

                isDrop() && element.bind("dragover", function (e) {
                    if (!angular.element(element).hasClass('iris-drag-over')) {
                        angular.element(element).addClass('iris-drag-over');
                    }
                    e.preventDefault && e.preventDefault();
                    return false;
                });

                isDrop() && element.bind("dragenter", function (e) {
                    angular.element(element).addClass('iris-drag-over');
                });

                isDrop() && element.bind("dragleave", function (e) {
                    angular.element(element).removeClass('iris-drag-over');
                });

                isDrop() && element.bind("drop", function (e) {
                    e.preventDefault && e.preventDefault();
                    e.stopPropagation && e.stopPropagation();

                    scope.onDrop({dragData: getDataTransfer(e), dropData: scope.irisDropData});
                    angular.element(element).removeClass('iris-drag-over');
                });

                isDrop() && $rootScope.$on("iris-drag-end", function () {
                    angular.element(element).removeClass("iris-drag-over");
                });
            }
        }
    });
})({
    angular,
    config: iris.config
});
