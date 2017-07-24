(function(globals) {
    'use strict';

    globals.angular.module('irisApp').filter('irisRepeatSplit', function () {
        function memoize(func){
            var self = func, cache = {};
            return function(data, splitCount, sortColumn) {
                splitCount || (splitCount = 1);
                data || (data = {});
                cache[data] = cache[data] || {};
                cache[data][splitCount] = cache[data][splitCount] || {};
                if(data in cache && splitCount in cache[data] && sortColumn in cache[data][splitCount]) {
                    //console.log("from cache");
                    return cache[data][splitCount][sortColumn];
                } else {
                    //console.log("new");
                    return cache[data][splitCount][sortColumn] = self(data, splitCount);
                }
            }
        };

        function filter(data, splitCount) {
            var res = [],
                maxGroupLength = Math.ceil(data.length / splitCount),
                minGroupLength = Math.floor(data.length / splitCount),
                maxGroupCount = (data.length % splitCount) || 1;
            for (var i = 0; i < maxGroupLength; i++) {
                var group = [];
                for (var k = 0; k < splitCount; k++) {
                    if (i === maxGroupLength - 1 && maxGroupLength !== minGroupLength && k >= maxGroupCount) continue;
                    group.push(data[i + maxGroupLength * Math.min(k, maxGroupCount) + minGroupLength * Math.max(0, k - maxGroupCount)]);
                }
                res.push(group);
            }
            return res;
        };

        return memoize(filter);
    });

})({
    angular: angular,
    config: iris.config
});
    