(function(globals) {
    'use strict';

    globals.angular.module('irisApp').filter('irisRepeatGroups', function () {
        function memoize(func){
            var self = func, cache = {};
            return function(data, groupLength, fillNulls) {
                data || (data = {});
                cache[data] = cache[data] || {};

                if(data in cache && groupLength in cache[data]) {
                    //console.log("from cache");
                    return cache[data][groupLength];
                } else {
                    //console.log("new");
                    return cache[data][groupLength] = self(data, groupLength, fillNulls);
                }
            }
        };

        function filter(data, groupLength, fillNulls) {
            var res = [],
                groupCount = Math.ceil(data.length / groupLength);

            for (var i = 0; i < groupCount; i++) {
                var group = [];
                for (var k = 0; k < groupLength; k++) {
                    if (i * groupLength + k >= data.length) {
                        if (fillNulls) {
                            group.push(null);
                        } else {
                            if (i + 1 >= groupCount) break;
                            continue;
                        }
                    } else {
                        group.push(data[i * groupLength + k]);
                    }
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
    