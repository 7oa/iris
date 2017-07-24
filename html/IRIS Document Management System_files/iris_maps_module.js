(function() {
    irisAppDependencies.add("iris_maps");

    angular.module('iris_maps', [
        'iris_url_service', 'iris_debounce_service', 'iris_maps_markers', 'iris_maps_layers', 'iris_maps_map'
    ]);
})();
