/**
 * Created by herbrichm on 20.06.16.
 */

Array.unique = function (array) {
    var u = {}, a = [];
    for (var i = 0, l = array.length; i < l; ++i) {
        if (u.hasOwnProperty(JSON.stringify(array[i]))) {
            continue;
        }
        a.push(array[i]);
        // make it compatible for object comparison -> serialize object to property name in index object
        u[JSON.stringify(array[i])] = 1;
    }
    return a;
};