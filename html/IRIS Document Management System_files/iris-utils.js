Object.byString = function(o, s) {
    s = s.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
    s = s.replace(/^\./, '');           // strip a leading dot
    var a = s.split('.');
    for (var i = 0, n = a.length; i < n; ++i) {
        var k = a[i];
        if (k in o) {
            o = o[k];
        } else {
            return;
        }
    }
    return o;
};


(function () {
    angular.module('iris_utils', []);

    angular.module('iris_utils').filter('trusted', ['$sce', function ($sce) {
        return function(url) {
            return $sce.trustAsResourceUrl(url);
        };
    }]);

    angular.module('iris_utils').factory('UnitsList', function ($resource) {
        return $resource(iris.config.apiUrl + "/system/iris-units");
    });

    angular.module('iris_utils').factory('LangList', function ($resource) {
        return $resource(iris.config.apiUrl + "/system/i18n/languages");
    });

    /**
     * @description
     * get an object and return array of values
     * @param object
     * @returns {Array}
     */
    function toArray(object) {
        return angular.isArray(object) ? object :
            Object.keys(object).map(function(key) {
                return object[key];
            });
    }

    /* moved to iris-field is irisApp.js */
    /*
    angular.module('iris_utils').directive('irisValid', function() {
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function(scope, element, attrs, ngModel) {
                scope.$watch(attrs.irisValid, function(value) {
                    ngModel.$setValidity(attrs.ngModel, value);
                });
            }
        }
    });
    */

    angular.module('iris_utils').filter('irisNull', function($translate){
        return function (value, replacement) {
            replacement = replacement || $translate.instant('label.NotSet');
            return value == null || angular.isUndefined(value) ? replacement : value
        }
    });

    angular.module('iris_utils').filter('toArray', [function(){
        return function (collection, addKey) {

            if(!angular.isObject(collection)) {
                return collection;
            }

            return !addKey
                ? toArray(collection)
                : Object.keys(collection).map(function (key) {
                return extend(collection[key], { $key: key });
            });
        }
    }]);

    angular.module('iris_utils').filter('filesize', function() {
        return function(bytes, precision) {
            if (isNaN(parseFloat(bytes)) || !isFinite(bytes)) return '-';
            if (bytes == 0) return '0 bytes';
            if (typeof precision === 'undefined') precision = 1;
            var units = ['bytes', 'kB', 'MB', 'GB', 'TB', 'PB'],
                number = Math.floor(Math.log(bytes) / Math.log(1024));
            return (bytes / Math.pow(1024, Math.floor(number))).toFixed(precision) +  ' ' + units[number];
        }
    });

    angular.module('iris_utils').filter('irisUnits', function (IrisUnitsService) {
        function irisUnits(unit, direction, is_wrapped) {
            is_wrapped = is_wrapped || false;
            // todo check available direction
            direction = direction || 'short';
            direction = direction == 'short' ? 'i18nUnitShort' : 'i18nUnitLong';
            var units_list = IrisUnitsService.getUnits();
            if (!units_list.hasOwnProperty(unit) || !units_list[unit].hasOwnProperty(direction)) {
                return unit;
            }
            return is_wrapped ? '[' + units_list[unit][direction] + ']': units_list[unit][direction];
        }
        //irisUnits.$stateful = true; //to apply filter after loading units from server

        return irisUnits;
    });

    angular.module('iris_utils').filter('irisUser', function () {
        var usersList = iris.data.usersInfo.reduce((res, user) => {
            res[user.id] = user;
            return res;
        }, {});

        function irisUser(userId) {
            if(!userId) return;
            if (typeof userId === 'string' && userId.indexOf(' ') > 0) {
                //in case there is a grouping by user in a grid, userId will come in format '$id ($count)'
                userId = parseInt(userId.split(' ')[0]);
            }
            var user = usersList[userId];
            return `${user.firstname ? user.firstname : ''} ${user.lastname ? user.lastname : ''} ${!user.lastname && !user.firstname ? user.username : ''}`;
        }

        return irisUser;
    });

    angular.module('iris_utils').factory('IrisLanguageService', function (LangList) {
        return {
            getLanguages: () => LangList.query()
        }
    });

    angular.module('iris_utils').factory('IrisUtilsService',
        function ($filter, UnitsList) {
            var units_list = UnitsList.get({}, function (value) {
                return value;
            });

            return {
                getUnitsList: function () {
                    //todo JSON.parse(angular.toJson(units_list)) and return promise + refactor
                    return units_list;
                },

                getConvertibleUnits: function (unit) {
                    return units_list[unit].possibleConvert;
                },

                filterUnits: function (filter) {
                    var result = [];
                    if(filter && filter.length){
                        for(var i in filter){
                            var unit = units_list[filter[i]];
                            if(unit) result.push(unit);
                        }
                    } else {
                        result = $filter('toArray')(units_list);
                    }
                    return result;
                }
            };
        });

    angular.module('iris_utils').factory('IrisUnitsService',
        function ($filter) {
            var units = iris.data.units || {};
            units = Object.keys(units).reduce((res, u) => {
                res[u] = angular.copy(units[u]);
                for (var i in res[u].possibleConvert) {
                    var conv_unit = res[u].possibleConvert[i];
                    res[u].possibleConvert[i] = units[conv_unit];
                }
                return res;
            }, {});

            var listOfColorsByUnit = []; // list of objects = {unit: "METER", baseColor: "ffffff", numberOfApperience: 0}
            var listOfUnits = []; // list of measure UNITS with color property

            return {
                getUnits: function () {
                    return units;
                },

                getPossibleConvertsForUnit: function (unit) {
                    if(!unit) return [];
                    return units[unit].possibleConvert;
                },

                getUnitsAsArray: function () {
                    return $filter('toArray')(units);
                },

                clearListOfColorsByUnit: function (){
                    listOfColorsByUnit = [];
                },

                initServiceByColorAppearance: function (ds, arrUnits){
                    this.getColorByUnit (ds, arrUnits);
                },

                getColorByUnit: function (ds, arrUnits){
                    if(arrUnits != undefined) {
                        listOfUnits = arrUnits;
                    }
                    if(listOfUnits.length < 1) {
                        return;
                    }

                    var colorsByUnits = listOfColorsByUnit;
                    var color = '#';
                    var tmpIndex = -1;
                    var unitDefaultColor = findIrisUnitColorHex(ds.targetUnit != undefined || ds.targetUnit != null ? ds.targetUnit : ds.irisUnit);
                    var unitIsUsed = isUnitAlreadyUsed(ds, colorsByUnits);

                    if(unitIsUsed){
                        //the idea is to change baseColor (of unit) to become lighter (for +14,2%) or darker (for -14.2%)
                        //the numberOfApperience is number how much dataseries with same UNIT is used
                        //eg. if we have seven dataseries with METER it will be [1,2,3,4,5,6,7]

                        //for [1,2,3,4,5,6,7] the [1,2] is first pair, the [3,4] is second pair etc. The pair is represented with "pairNumber" variable

                        //the odd number from a pair will become LIGHTER
                        //the even number from a pair will become DARKER

                        //the 14,2% is calculated in steps by (pairNumber / 7)  IT CAN BE CHANGED BY WISH

                        colorsByUnits[tmpIndex].numberOfApperience++;
                        var apperience = colorsByUnits[tmpIndex].numberOfApperience;

                        var pairNumber = Math.ceil(apperience / 2); // round up

                        if(oddOrEven(colorsByUnits[tmpIndex].numberOfApperience) == "odd"){
                            //number is odd, so the color will be lighter
                            color = shadeBlendConvert(pairNumber / 7, colorsByUnits[tmpIndex].baseColor);
                        }else{
                            //number is even, so the color will be darker
                            color = shadeBlendConvert(pairNumber / -7, colorsByUnits[tmpIndex].baseColor);
                        }
                    }else{
                        var object = {
                            unit: ds.targetUnit != undefined ? ds.targetUnit : ds.irisUnit,
                            numberOfApperience: 1
                        };
                        // if color is defined in settings then take it, if not, take it from unitDefaultColor, but if default color does not exist then create random color.
                        object.baseColor = ds.chartSettings != undefined ? ds.chartSettings.color : unitDefaultColor != null ? unitDefaultColor : iris.tools.getRandomColor();

                        colorsByUnits.push(object);
                        color = object.baseColor;
                    }

                    function findIrisUnitColorHex (unitName){
                        if(unitName == null || unitName == undefined) {
                            return null;
                        }

                        var colorObj = listOfUnits[unitName];

                        if(colorObj != null && colorObj.unitColorName != undefined){
                            return colorObj.unitColorHEX; // return HEX
                        }else{
                            return null;
                        }
                    };

                    function isUnitAlreadyUsed(obj, list) {
                        var i;
                        for (i = 0; i < list.length; i++) {
                            var unit = obj.targetUnit != undefined ? obj.targetUnit : obj.irisUnit;
                            if (list[i].unit === unit) {
                                tmpIndex = i;
                                return true;
                            }
                        }
                        return false;
                    }

                    /*
                    @param p = percentage
                    @param from = color
                    @param to = color (optional) OR "c" for conversion from RGB to HEX and viceversa.
                    @documentation: http://stackoverflow.com/questions/5560248/programmatically-lighten-or-darken-a-hex-color-or-rgb-and-blend-colors
                    */
                    function shadeBlendConvert(p, from, to) {
                        if(typeof(p)!="number"||p<-1||p>1||typeof(from)!="string"||(from[0]!='r'&&from[0]!='#')||(typeof(to)!="string"&&typeof(to)!="undefined"))return null; //ErrorCheck
                        if(!this.sbcRip)this.sbcRip=function(d){
                            var l=d.length,RGB=new Object();
                            if(l>9){
                                d=d.split(",");
                                if(d.length<3||d.length>4)return null;//ErrorCheck
                                RGB[0]=i(d[0].slice(4)),RGB[1]=i(d[1]),RGB[2]=i(d[2]),RGB[3]=d[3]?parseFloat(d[3]):-1;
                            }else{
                                if(l==8||l==6||l<4)return null; //ErrorCheck
                                if(l<6)d="#"+d[1]+d[1]+d[2]+d[2]+d[3]+d[3]+(l>4?d[4]+""+d[4]:""); //3 digit
                                d=i(d.slice(1),16),RGB[0]=d>>16&255,RGB[1]=d>>8&255,RGB[2]=d&255,RGB[3]=l==9||l==5?r(((d>>24&255)/255)*10000)/10000:-1;
                            }
                            return RGB;}
                        var i=parseInt,r=Math.round,h=from.length>9,h=typeof(to)=="string"?to.length>9?true:to=="c"?!h:false:h,b=p<0,p=b?p*-1:p,to=to&&to!="c"?to:b?"#000000":"#FFFFFF",f=sbcRip(from),t=sbcRip(to);
                        if(!f||!t)return null; //ErrorCheck
                        if(h)return "rgb("+r((t[0]-f[0])*p+f[0])+","+r((t[1]-f[1])*p+f[1])+","+r((t[2]-f[2])*p+f[2])+(f[3]<0&&t[3]<0?")":","+(f[3]>-1&&t[3]>-1?r(((t[3]-f[3])*p+f[3])*10000)/10000:t[3]<0?f[3]:t[3])+")");
                        else return "#"+(0x100000000+(f[3]>-1&&t[3]>-1?r(((t[3]-f[3])*p+f[3])*255):t[3]>-1?r(t[3]*255):f[3]>-1?r(f[3]*255):255)*0x1000000+r((t[0]-f[0])*p+f[0])*0x10000+r((t[1]-f[1])*p+f[1])*0x100+r((t[2]-f[2])*p+f[2])).toString(16).slice(f[3]>-1||t[3]>-1?1:3);
                    }

                    //if number is odd or even
                    function oddOrEven(x) {
                        return ( x & 1 ) ? "odd" : "even";
                    }

                    return color;

                }// getColorByUnit

            };
        });

    angular.module('iris_utils').factory('FontService',
        function ($filter, $translate) {
            var defaultMinSize = 10, defaultMinimumRange = 10;

            var fonts = [{name:"Arial"},{name:"Tahoma"},{name:"Helvetica"},{name:"Verdana"}];

            var genFontSizes = function (min, max) {
                var sizes = [];
                for (var i = min; i <= max; i++) {
                    sizes.push({
                        name: i + " " + $translate.instant('label.Pixel'),
                        value: i + "px"
                    });
                }
                return sizes;
            };

            return {
                getFonts: function () {
                    return fonts;
                },

                getFontSizes: function (min, max) {
                    if (min && max) {
                        return genFontSizes(min, max);
                    }
                    else if (min && !max) {
                        return genFontSizes(min, min + defaultMinimumRange);
                    }
                    return genFontSizes(defaultMinSize, defaultMinSize + defaultMinimumRange);
                }
            };
        });

    angular.module('iris_utils').filter('PascalCase', [function () {
        return function (src) {
            var res = src.toLowerCase().replace(/[_ -](.)/g, function (match, group) {
                return group.toUpperCase();
            });
            res = res.replace(/^(.)/, function (match, group) {
                return group.toUpperCase();
            });
            return res;
        };
    }]);

    angular.module('iris_utils').filter('trustedHtml', ['$sce', function ($sce) {
        return function (html) {
            return $sce.trustAsHtml(html);
        };
    }]);

    angular.module('iris_utils').filter('range', function () {
        return function (input) {
            var lowBound, highBound;
            switch (input.length) {
                case 1:
                    lowBound = 0;
                    highBound = parseInt(input[0]) - 1;
                    break;
                case 2:
                    lowBound = parseInt(input[0]);
                    highBound = parseInt(input[1]);
                    break;
                default:
                    return input;
            }
            var result = [];
            for (var i = lowBound; i <= highBound; i++)
                result.push(i);
            return result;
        };
    });

    angular.module('iris_utils').directive("slider", function ($document, $timeout) {
        return {
            restrict: "AE",
            scope: {
                model: "=",
                property: "@",
                step: "@"
            },
            replace: true,
            template: "<div class=\"slider-control\">\n<div class=\"slider\">\n</div>\n</div>",
            link: function (scope, element, attrs) {
                var getP, handles, i, mv, pTotal, setP, step, updatePositions, _fn, _i, _len, _ref;
                element1 = element.children();
                element1.css('position', 'relative');
                handles = [];
                pTotal = 0;
                step = function () {
                    if ((scope.step != null)) {
                        return parseFloat(scope.step);
                    } else {
                        return 0;
                    }
                };
                getP = function (i) {
                    if (scope.property != null) {
                        return scope.model[i][scope.property];
                    } else {
                        return scope.model[i];
                    }
                };
                setP = function (i, p) {
                    var s;
                    s = step();
                    if (s > 0) {
                        p = Math.round(p / s) * s;
                    }
                    if (scope.property != null) {
                        return scope.model[i][scope.property] = p;
                    } else {
                        return scope.model[i] = p;
                    }
                };
                updatePositions = function () {
                    var handle, i, p, pRunningTotal, x, _i, _len, _results;
                    pTotal = scope.model.reduce(function (sum, item, i) {
                        return sum + getP(i);
                    }, 0);
                    pRunningTotal = 0;
                    _results = [];
                    for (i = _i = 0, _len = handles.length; _i < _len; i = ++_i) {
                        handle = handles[i];
                        p = getP(i);
                        pRunningTotal += p;
                        x = pRunningTotal / pTotal * 100;
                        _results.push(handle.css({
                            left: 'calc(' + x + '% - 6px)',
                            top: "-" + handle.prop("clientHeight") / 2 + "px"
                        }));
                    }
                    return _results;
                };
                _fn = function (mv, i) {
                    var handle, startPleft, startPright, startX;
                    if (i === scope.model.length - 1) {
                        return;
                    }
                    handle = angular.element('<div class="slider-handle"></div>');
                    handle.css("position", "absolute");
                    handles.push(handle);
                    element1.append(handle);
                    startX = 0;
                    startPleft = startPright = 0;
                    return handle.on("mousedown", function (event) {
                        var mousemove, mouseup;
                        mousemove = (function (_this) {
                            return function (event) {
                                return scope.$apply(function () {
                                    var dp;
                                    dp = (event.screenX - startX) / element1.prop("clientWidth") * pTotal;
                                    if (dp < -startPleft || dp > startPright) {
                                        return;
                                    }
                                    setP(i, startPleft + dp);
                                    setP(i + 1, startPright - dp);
                                    return updatePositions();
                                });
                            };
                        })(this);
                        mouseup = function () {
                            $document.unbind("mousemove", mousemove);
                            return $document.unbind("mouseup", mouseup);
                        };
                        event.preventDefault();
                        startX = event.screenX;
                        startPleft = getP(i);
                        startPright = getP(i + 1);
                        $document.on("mousemove", mousemove);
                        return $document.on("mouseup", mouseup);
                    });
                };
                function init() {
                    for (i = _i = 0, _len = scope.model.length; _i < _len; i = ++_i) {
                        mv = scope.model[i];
                        _fn(mv, i);
                    }
                }

                init();
                var updateModel = function (nv, ov) {
                    if (nv.length != ov.length) {
                        element.children().html('');
                        handles = [];
                        init();
                    }
                    updatePositions(nv, ov);
                };
                scope.$watch("model", updateModel, true);
            }
        };
    });

    /**
     * Filter returns field from directories' item by id
     **/
    angular.module('iris_utils').filter('IrisFilterField', function () {
        return function (id, opts, nullable) {
            nullable = nullable || false;
            if (!Array.isArray(opts) || opts.length < 1) {
                console.log('IrisFilterField - opts must be an array with 2 items', id, opts, nullable);
                return nullable ? null : id;
            }
            var directory = opts[0],
                field = opts[1] || 'name',
                idField = opts[2] || 'id';
            if (!Array.isArray(directory) || !directory.length > 0) {
                return nullable ? null : id;
            }
            for (var i = 0, c = directory.length; i < c; i++) {
                if (directory[i][idField] == id) {
                    //TODO check if object has this property
                    return Object.byString(directory[i],field);
                }
            }
            return nullable ? null : id;
        }
    });

    /**
     * Filter returns the number with "0"'s before it to be fixed length
     * */
    angular.module('iris_utils').filter('numberFixedLen', function () {
        return function (a, b) {
            return (1e8 + a + "").slice(-b);
        }
    });

    angular.module('iris_utils').filter('emailValid', function() {
        return function(email) {
            if (email) {
                var emails = email.split(',');
                return emails.every((m) =>
                    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(m.trim())
                )
            }
            return true;
        }
    });

    angular.module('iris_utils').factory('GUID', [function(){
      return {
        create: guid
      }
      function guid() {
        function s4() {
          return Math.floor((1 + Math.random()) * 0x10000) .toString(16) .substring(1);
        }
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
      }
    }]);
    angular.module('iris_utils').filter('colorIsDark', function() {
        function hexToRgb(hex) {
            var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? [
                parseInt(result[1], 16),
                parseInt(result[2], 16),
                parseInt(result[3], 16)
            ] : null;
        }

        return function(colorHexCode) {
            if (!colorHexCode) {
                return false;
            }
            var rgb = hexToRgb(colorHexCode);
            var o = Math.round(((parseInt(rgb[0]) * 299) + (parseInt(rgb[1]) * 587) + (parseInt(rgb[2]) * 114)) / 1000);
            return o < 125;
        }
    });

    angular.module('iris_utils').directive('compile', function ($compile) {
        return function(scope, element, attrs) {
          var ensureCompileRunsOnce = scope.$watch(
                function(scope) {
                    // watch the 'compile' expression for changes
                    return scope.$eval(attrs.compile);
                },
                function(value) {
                    // when the 'compile' expression changes
                    // assign it into the current DOM
                    element.html(value);

                    // compile the new DOM and link it to the current
                    // scope.
                    // NOTE: we only compile .childNodes so that
                    // we don't get into infinite loop compiling ourselves
                    $compile(element.contents())(scope);

                    // Use un-watch feature to ensure compilation happens only once.
                    ensureCompileRunsOnce();
                }
            );
        };
    });
})();
