(function() {

    irisAppDependencies.add("iris_time");

    angular.module("iris_time",[]);

    angular.module("iris_time").factory("irisTime", function() {
        return iris.Time.GetGlobalObject();
    });

    angular.module("iris_time").factory('IrisTimeService', function($filter) {
        var timeFormats = iris.data.irisTimeFormats;

        return {
            getDateTimeFormats: function () {
                return $filter('filter')(timeFormats, {type: 'DATETIME'}, true);
            },

            getDateTimeFormatById: function (id) {
                return $filter('filter')(timeFormats, {id: +id}, true)[0];
            },

            getDateTimePatternForHighChartsById: function (id) {
                var dateTimeFormat = timeFormats.find(tf => tf.id == id);
                var dateTimePattern = dateTimeFormat && dateTimeFormat.momentjsFormatString || 'YYYY-MM-DD HH:mm:ss';
                dateTimePattern = dateTimePattern.replace('YYYY', '%Y');
                dateTimePattern = dateTimePattern.replace('MMM', '%b');
                dateTimePattern = dateTimePattern.replace('MM', '%m');
                dateTimePattern = dateTimePattern.replace('DD', '%d');
                dateTimePattern = dateTimePattern.replace('HH', '%H');
                dateTimePattern = dateTimePattern.replace('hh', '%I');
                dateTimePattern = dateTimePattern.replace('mm', '%M');
                dateTimePattern = dateTimePattern.replace('ss', '%S');
                dateTimePattern = dateTimePattern.replace(' a', ' %p');
                return dateTimePattern;
            },

            getTimeFormats: function () {
                return $filter('filter')(timeFormats, {type: 'TIME'}, true);
            },

            getDateFormats: function () {
                return $filter('filter')(timeFormats, {type: 'DATE'}, true);
            },

            getAllDateTimeFormats: function () {
                return timeFormats;
            },

            getTimezones: function () {
                return iris.Time.GetAllTimeZoneNames().map(function(s){return {value:s,label:s.replace(/\_/g,' ')};});
            }
        };
    });

    angular.module("iris_time").filter("irisTimeZoneOutput",

        function() {

            var filter = function(sTimeZone) {

                if(sTimeZone == null || sTimeZone === undefined)
                    return "";

                return sTimeZone.replace(/\_/g,' ');
            };

            return filter;
        }
    );

    angular.module("iris_time").filter("irisTime",
        function(irisTime) {

            var filter = function(oInputDate) {

                if(!oInputDate) return oInputDate;

                if(!(oInputDate instanceof Date)) oInputDate = new Date(oInputDate);

                var oContext;

                var oOverride = {};

                if(typeof(arguments[1]) == 'object') {
                    oContext = arguments[1];

                    if(typeof(arguments[2]) == 'string')
                        oOverride.timeformat = arguments[2];

                    if(typeof(arguments[3]) == 'string')
                        oOverride.timezone = arguments[3];
                }
                else {
                    oContext = {};

                    if(typeof(arguments[1]) == 'string')
                        oContext.timeformat = arguments[1];

                    if(typeof(arguments[2]) == 'string')
                        oContext.timezone = arguments[2];
                }

                return irisTime.convertTimeToOutputStringByContext(oInputDate,oContext,oOverride);
            };

            filter.$stateful = true;

            return filter;
        });

    angular.module("iris_time").factory("irisTimeDirectiveLinker",[

        "irisTime",

        function(irisTime) {

            var self = {

                isZoneIgnoreSet: function(element) {

                    return ["1", "true", "yes", "on", "enabled"].indexOf(String(element.attr("zone-ignore") || element.attr("data-zone-ignore") || "").toLocaleLowerCase()) >= 0;
                },

                link: function(scope, element, attrs) {

                    var replacement = $("<span></span>");

                    var appAttrs = ["value", "format", "zone", "zone-ignore"];

                    if(attrs instanceof Object) {

                        var properties = Object.getOwnPropertyNames(attrs);

                        for(var i=0; i < properties.length; i++) {

                            var propOrgName = properties[i];
                            var propEffName = propOrgName;

                            if(propOrgName.indexOf('$') == 0)
                                continue;

                            if(appAttrs.indexOf(propOrgName) >= 0)
                                propEffName = "data-time" + propOrgName;

                            replacement.attr(propEffName, attrs[propOrgName]);
                        }
                    }

                    var bIgnoreZone = self.isZoneIgnoreSet(element);

                    if (bIgnoreZone)
                        replacement.attr({"data-zone-ignore": "true"});

                    element.replaceWith(replacement);

                    element = replacement;

                    function lookupTimeZone() {

                        var sTimeZone = bIgnoreZone
                            ? irisTime.zeroTimeZone
                            : String(scope.zone || "").trim();

                        if (sTimeZone)
                            return sTimeZone;

                        return irisTime.lookupSettings(scope.$parent).timezone;
                    }

                    function lookupTimeFormat() {

                        var sTimeFormat = String(scope.format || "").trim();

                        if (sTimeFormat)
                            return sTimeFormat;

                        return irisTime.lookupSettings(scope.$parent).timeformat;
                    }

                    function updateValue() {

                        var sTimeZone = lookupTimeZone();
                        var sTimeFormat = lookupTimeFormat();

                        var sOutput = "";

                        var oDate;

                        if (typeof(scope.value) == 'string') {

                            oDate = new Date(scope.value.trim());

                        } else if (typeof(scope.value) == 'number') {

                            oDate = new Date(scope.value);

                        } else if (scope.value instanceof Date) {

                            oDate = scope.value;
                        }

                        if (oDate) {

                            var oDateToOutput = oDate;

                            if (scope.prepareValueForOutput instanceof Function) {

                                var oPreparedDate = scope.prepareValueForOutput(oDate);

                                if (oPreparedDate instanceof Date)
                                    oDateToOutput = oPreparedDate;
                            }

                            sOutput = irisTime.convertTimeToOutputString(oDateToOutput, sTimeFormat, sTimeZone);
                        }

                        element.empty();
                        element.append(sOutput);
                    }

                    updateValue();

                    scope.$watch("value", function () {
                        updateValue();
                    });
                    scope.$watch(lookupTimeZone, function () {
                        updateValue();
                    });
                    scope.$watch(lookupTimeFormat, function () {
                        updateValue();
                    });
                }
            };

            return self;
        }
    ]);

    angular.module("iris_time").directive("irisTimeObjectOutput", [

        "irisTimeDirectiveLinker",

        function(irisTimeDirectiveLinker) {

            var directive = {

                restrict: 'E',

                scope: {
                    value: 	'=value',
                    zone:	'=zone',
                    format:	'=format'
                },

                link: function(scope, element, attrs) {

                    irisTimeDirectiveLinker.link.apply(this,[scope, element, attrs]);
                }
            };

            return directive;
        }
    ]);

    angular.module("iris_time").directive("irisDateOutput", [

        "irisTimeDirectiveLinker",

        function(irisTimeDirectiveLinker) {

            var directive = {

                restrict: 'E',

                scope: {
                    value: 	'=value',
                    zone:	'=zone'
                },

                link: function(scope, element, attrs) {

                    scope.format = "@{date}";

                    scope.prepareValueForOutput = function(oDate) {

                        if(!irisTimeDirectiveLinker.isZoneIgnoreSet(element))
                            return oDate;

                        var oPreparedDate = new Date(oDate.valueOf());

                        oPreparedDate.setUTCHours(12);
                        oPreparedDate.setUTCMinutes(0);
                        oPreparedDate.setUTCSeconds(0);
                        oPreparedDate.setUTCMilliseconds(0);

                        return oPreparedDate;
                    };

                    irisTimeDirectiveLinker.link.apply(this,[scope, element, attrs]);
                }
            };

            return directive;
        }
    ]);

    angular.module("iris_time").directive("irisTimeOutput", [

        "irisTimeDirectiveLinker",

        function(irisTimeDirectiveLinker) {

            var directive = {

                restrict: 'E',

                scope: {
                    value: 	'=value',
                    zone:	'=zone'
                },

                link: function(scope, element, attrs) {

                    scope.format = "@{time}";

                    irisTimeDirectiveLinker.link.apply(this,[scope, element, attrs]);
                }
            };

            return directive;
        }
    ]);

    angular.module("iris_time").directive("irisDateTimeOutput", [

        "irisTimeDirectiveLinker",

        function(irisTimeDirectiveLinker) {

            var directive = {

                restrict: 'E',

                scope: {
                    value: 	'=value',
                    zone:	'=zone'
                },

                link: function(scope, element, attrs) {

                    scope.format = "@{datetime}";

                    irisTimeDirectiveLinker.link.apply(this,[scope, element, attrs]);
                }
            };

            return directive;
        }
    ]);

    angular.module("iris_time").directive("irisTimeZoneOutput", [

        "irisTime",
        "$filter",

        function(irisTime, $filter) {

            var directive = {

                link: function(scope, element, attrs) {

                    var replEltName = "span";

                    var tagNameAttr = "tagname";

                    if(typeof(attrs.tagname) == 'string' && attrs.tagname.match(/^[a-zA-Z][a-zA-Z0-9-]*$/))
                        replEltName = attrs.tagname;

                    var replacement = angular.element("<" + replEltName + "></" + replEltName + ">");

                    var properties = Object.getOwnPropertyNames(attrs);

                    for(var i = 0; i < properties.length; i++) {

                        var propName = properties[i];

                        if(propName.indexOf('$') == 0)
                            continue;

                        replacement.attr(propName,attrs[propName]);
                    }

                    element.replaceWith(replacement);

                    element = replacement;

                    function lookupTimeZone() {

                        return irisTime.lookupSettings(scope).timezone;
                    }

                    function update(timezone) {

                        if(!timezone)
                            timezone = irisTime.lookupSettings(scope).timezone;

                        element.empty();
                        element.append($filter("irisTimeZoneOutput")(timezone));
                    }

                    scope.$watch(lookupTimeZone,function(timezone) {
                        update(timezone);
                    });
                }
            };

            return directive;
        }
    ]);

})();