iris.Time = {

    configuredGlobalTimeZone: '',
    effectiveGlobalTimeZone: '',
    selectedProjectTimeZone: '',
    configuredUserTimeZone: '',
    userOverridesProjectTimeZone: false,
    configuredDefaultTimeFormat: '',
    timeZoneSelectionEnabled: false,
    zeroTimeZone: 'Etc/GMT+0',

    GlobalObject: null,

    lookupConfiguredUserTimeZone: function () {
        var sConfiguredUserTimeZone = '';

        try {
            sConfiguredUserTimeZone = iris.config.me.profile.timeZone;

            if (sConfiguredUserTimeZone == null)
                sConfiguredUserTimeZone = '';

        } catch (e) { }

        return sConfiguredUserTimeZone;
    },

    lookupEffectiveGlobalTimeZone: function () {
        var sFallbackTimeZone = this.zeroTimeZone; //'Etc/GMT+0';

        if (this.configuredGlobalTimeZone)
            return this.configuredGlobalTimeZone;

        var sProjectTimeZone = this.selectedProjectTimeZone;
        var sUserTimeZone = this.lookupConfiguredUserTimeZone();

        var bUserOverridesProjectTz = this.userOverridesProjectTimeZone;

        var sEffectiveTimeZone = sProjectTimeZone;

        if (!sEffectiveTimeZone)
            sEffectiveTimeZone = sFallbackTimeZone;

        if (bUserOverridesProjectTz && sUserTimeZone)
            sEffectiveTimeZone = sUserTimeZone;

        return sEffectiveTimeZone;
    },

    lookupCurrentGlobalTimeFormat: function () {
        var sTimeFormat = String(this.configuredDefaultTimeFormat || '').trim();

        return sTimeFormat.length ? sTimeFormat : 'DD.MM.YYYY HH:mm:ss';
    },

    parseTimeFormatIdentifier: function (sTimeFormat) {
        var oIdentRegEx = /([@#])\{([a-zA-Z0-9][a-zA-Z0-9\_\-\.]*)\}/;
        var aIdentMatch = oIdentRegEx.exec(sTimeFormat);

        if (!aIdentMatch)
            return null;

        return {
            all: aIdentMatch[0],
            type: aIdentMatch[1],
            value: aIdentMatch[2]
        }
    },

    findTimeFormatIdentifier: function (sTimeFormat) {
        var oParseResult = this.parseTimeFormatIdentifier(sTimeFormat);

        if (!oParseResult)
            return null;

        return oParseResult.all;
    },

    lookupTimeFormatObject: function (sTimeFormat) {
        sTimeFormat = String(sTimeFormat || '').trim();

        var oTimeFormatIdParseResult = this.parseTimeFormatIdentifier(sTimeFormat);

        if (!oTimeFormatIdParseResult)
            return null;

        var eTimeFormatIdType = oTimeFormatIdParseResult.type;
        var sTimeFormatIdValue = oTimeFormatIdParseResult.value;

        var oTimeFormat = null;

        switch (eTimeFormatIdType) {
            case '#':

                var sKeyCode = sTimeFormatIdValue;

                oTimeFormat = iris.Time.Format.GetForKeyCode(sKeyCode);

                if (!oTimeFormat)
                    throw new iris.Error('Couldnt find time-format object for key-code #' + sKeyCode);

                break;

            case '@':

                var eType = sTimeFormatIdValue.toUpperCase();

                var oUserProfile = iris.config.me.profile;

                if (oUserProfile) {
                    switch (eType) {
                        case iris.Time.Format.Types.DATE:
                            oTimeFormat = iris.Time.Format.GetForId(oUserProfile.dateFormatId);
                            break;

                        case iris.Time.Format.Types.TIME:
                            oTimeFormat = iris.Time.Format.GetForId(oUserProfile.timeFormatId);
                            break;

                        case iris.Time.Format.Types.DATETIME:
                            oTimeFormat = iris.Time.Format.GetForId(oUserProfile.dateTimeFormatId);
                            break;

                        default:
                            oTimeFormat = iris.Time.Format.GetSingleForType(eType);
                            break;
                    }
                }

                if (!oTimeFormat)
                    oTimeFormat = iris.Time.Format.GetSingleForType(eType);

                if (!oTimeFormat)
                    throw new iris.Error('Couldnt find time-format object for type @' + eType);

                break;

            default:

                break;
        }

        return oTimeFormat;
    },

    lookupSettings: function (oContext, oOverride) {
        var sTimeZone;
        var sTimeFormat;

        var oCurrentContext = oContext;

        while (oCurrentContext) {
            var bFoundTimeZone = sTimeZone !== undefined;
            var bFoundTimeFormat = sTimeFormat !== undefined;

            if (bFoundTimeZone && bFoundTimeFormat)
                break;

            if (!bFoundTimeZone) {
                var sTemp = String(oCurrentContext.timezone || '').trim();

                if (this.CheckForValidTimeZone(sTemp))
                    sTimeZone = sTemp;
            }

            if (!bFoundTimeFormat) {
                var sTemp = String(oCurrentContext.timeformat || '').trim();

                if (sTemp.length)
                    sTimeFormat = sTemp;
            }

            // Is angular scope ?
            if (oContext.constructor && oContext.constructor.name == 'Scope') {
                if (typeof(oCurrentContext.$parent) != 'object' || oCurrentContext.$parent == null)
                    break;

                oCurrentContext = oCurrentContext.$parent;
            }
            // Currently only angular contexts are supported.
            else {
                break;
            }
        }

        if (sTimeZone === undefined)
            sTimeZone = this.lookupEffectiveGlobalTimeZone();

        if (sTimeFormat === undefined)
            sTimeFormat = this.lookupCurrentGlobalTimeFormat();

        var oSettings =
        {
            timezone: sTimeZone,
            timeformat: sTimeFormat
        };

        if (oOverride instanceof Object) {
            var sOverrideTimeZone = String(oOverride.timezone || '').trim();
            var sOverrideTimeFormat = String(oOverride.timeformat || '').trim();

            if (sOverrideTimeZone.length)
                oSettings.timezone = sOverrideTimeZone;

            if (sOverrideTimeFormat.length)
                oSettings.timeformat = sOverrideTimeFormat;
        }

        return oSettings;
    },

    createDateInTimeZone: function (sTimeZone, uYear, uMonth, uDay, uHour, uMinute, uSecond, uMilliSec) {
        var oLocalDate = new Date
        (
            Math.max(+uYear, 0),
            Math.max(+uMonth, 0),
            Math.max(+uDay, 0),
            Math.max(+uHour, 0),
            Math.max(+uMinute, 0),
            Math.max(+uSecond, 0),
            Math.max(+uMilliSec, 0)
        );

        var sFormat = 'YYYY-MM-DD HH:mm:ss.SSS';

        var sLocalDate = moment(oLocalDate).format(sFormat);

        var oMoment = moment.tz(sLocalDate, sFormat, sTimeZone);

        var oConverted = oMoment.toDate();

        return oConverted;
    },

    /**
     * Converts the time object, assuming that the property
     * values (year, month, date, hour, minute, second and
     * millisecond) are actually meant to be in the specified
     * timezone.
     * Note that in JavaScript these properties always reflect
     * the browsers native timezone.
     *
     * @param {Date} oTime - The time object coming for example
     * from an an input control like a a datepicker or other
     * external source.
     *
     * @param {string} sTimeZone The target timezone
     *
     *
     * @returns {Date}
     */
    interpretInputTime: function (oTime, sTimeZone) {
        return this.createDateInTimeZone
        (
            sTimeZone,
            oTime.getFullYear(),
            oTime.getMonth(),
            oTime.getDate(),
            oTime.getHours(),
            oTime.getMinutes(),
            oTime.getSeconds(),
            oTime.getMilliseconds()
        );
    },

    interpretInputTimeByContext: function (oTime, oContext, oOverride) {
        return this.interpretInputTime
        (
            oTime,
            this.lookupSettings(oContext, oOverride).timezone
        );
    },

    buildMomentJsObject: function (oTime, sTimeFormat, sTimeZone) {
        sTimeFormat = String(sTimeFormat || '').trim();
        sTimeZone = String(sTimeZone || '').trim();

        if (!sTimeFormat)
            sTimeFormat = this.lookupCurrentGlobalTimeFormat();

        if (!sTimeZone)
            sTimeZone = this.lookupEffectiveGlobalTimeZone();

        var sLocale;

        var oTimeFormat = this.lookupTimeFormatObject(sTimeFormat);

        if (oTimeFormat)
            sLocale = oTimeFormat.locale;

        var oMoment = moment.tz(oTime, sTimeZone);

        if (sLocale)
            oMoment.locale(sLocale);

        return oMoment;
    },

    /* ******************* Output functions *********************** */

    interpretOutputTime: function (oTime, sTimeFormat, sTimeZone) {
        var oMoment = this.buildMomentJsObject(oTime, sTimeFormat, sTimeZone);

        var format = 'YYYY-MM-DD HH:mm:ss.SSS';

        return moment(oMoment.format(format), format).toDate();
    },

    interpretOutputTimeByContext: function (oTime, oContext, oOverride) {
        var oSettings = this.lookupSettings(oContext, oOverride);

        return this.interpretOutputTime(oTime, oSettings.timeformat, oSettings.timezone);
    },

    convertTimeToOutputString: function (oDate, sTimeFormat, sTimeZone) {
        sTimeFormat = String(sTimeFormat || '').trim();
        sTimeZone = String(sTimeZone || '').trim();

        if (!sTimeFormat)
            sTimeFormat = this.lookupCurrentGlobalTimeFormat();

        if (!sTimeZone)
            sTimeZone = this.lookupEffectiveGlobalTimeZone();

        var sLocale;

        var sTimeFormatId = this.findTimeFormatIdentifier(sTimeFormat);
        var oTimeFormat = this.lookupTimeFormatObject(sTimeFormatId);

        if (oTimeFormat) {
            sTimeFormat = sTimeFormat.replace(sTimeFormatId, oTimeFormat.momentjsFormatString);

            sLocale = oTimeFormat.locale;
        }
        var oMoment = moment.tz(oDate, sTimeZone);

        if (sLocale)
            oMoment.locale(sLocale);

        function resolveVarRef(varName) {
            switch (varName) {
                case 'TZ':
                    return sTimeZone.replace('_', ' ');
            }
            return '';
        }

        var uMarkerCount = 0;
        var oReplMarkers = {};

        if (sTimeFormat) {
            sTimeFormat = sTimeFormat.replace(/\$\{([a-zA-Z][a-zA-Z0-9\_]*)\}/g, function (sVarRef) {
                var sVarName = sVarRef.substring(2, sVarRef.length - 1);
                var sReplMarker = '#{' + ('' + (1000 + uMarkerCount++)).substr(1) + '}';

                oReplMarkers[sReplMarker] = resolveVarRef(sVarName);

                return sReplMarker;
            });
        }

        //in case of 'x' format we want to show 'fake' tiemstamp - used for charts. In other places use new Date(date).getTime()
        if(sTimeFormat == 'x') {
            return +oMoment.format('x') + oMoment._offset * 60 * 1000;
        }

        var sOutput = oMoment.format.apply(oMoment, sTimeFormat !== undefined ? [sTimeFormat] : []);

        if (uMarkerCount) {
            for (var sReplMarker in oReplMarkers) {
                sOutput = sOutput.replace(sReplMarker, oReplMarkers[sReplMarker]);
            }
        }

        return sOutput;
    },

    convertTimeToOutputStringByContext: function (oDate, oContext, oOverride) {
        var oSettings = this.lookupSettings(oContext, oOverride);

        return this.convertTimeToOutputString(oDate, oSettings.timeformat, oSettings.timezone)
    },

    Init: function(params) {
        if(!(iris instanceof Object))
            iris = {};
        if(!(iris.config instanceof Object))
            iris.config = {};
        if(!(iris.config.time instanceof Object))
            iris.config.time = {};

        for(var prop in params) {
            iris.Time[prop] = params[prop];
        }

        this.GlobalObject = iris.Time;

        iris.config.time = {
            configuredGlobalTimeZone: this.GlobalObject.configuredGlobalTimeZone,
            selectedProjectTimeZone: this.GlobalObject.selectedProjectTimeZone,
            effectiveGlobalTimeZone: this.GlobalObject.effectiveGlobalTimeZone,
            userOverridesProjectTimeZone: this.GlobalObject.userOverridesProjectTimeZone,
            defaultDateTimeFormat: this.GlobalObject.defaultDateTimeFormat,
            timeZoneSelectionEnabled: this.GlobalObject.timeZoneSelectionEnabled
        };
    },

    GetGlobalObject: function () {
        if (!this.GlobalObject) {
            this.Init();
        }

        return this.GlobalObject;
    },

    DateToLocaleTimeString: function (oDate, oContext, oOverride) {
        var oSettings = this.LookupSettings(oContext, oOverride);
        return this.GetGlobalObject().convertTimeToOutputString(oDate, oSettings.timeformat, oSettings.timezone);
    },

    CreateDateInTimeZone: function (sTimeZone, uYear, uMonth, uDay, uHour, uMinute, uSecond) {
        return this.GetGlobalObject().createDateInTimeZone(sTimeZone, uYear, uMonth, uDay, uHour, uMinute, uSecond);
    },

    ConvertTimeToOutputString: function (oDate, sTimeFormat, sTimeZone) {
        return this.GetGlobalObject().convertTimeToOutputString(oDate, sTimeFormat, sTimeZone);
    },

    LookupCurrentGlobalTimeZone: function () {
        return this.GetGlobalObject().lookupEffectiveGlobalTimeZone();
    },

    LookupSettings: function (oContext, oOverride) {
        return this.GetGlobalObject().lookupSettings(oContext, oOverride);
    },

    GetAllTimeZoneNames: function () {
        return moment.tz.names()
    },

    CheckForValidTimeZone: function (s) {
        if (typeof(s) != 'string')
            return false;

        s = s.trim();

        if (!s.length)
            return false;

        var oRegEx = /^[A-Z][a-zA-Z_-]*\/[A-Z][a-zA-Z_-]*$/;

        var aResult = oRegEx.exec(s);

        return aResult != null;
    }
};

iris.Time.Format = {

    id: undefined,
    keyCode: '',
    type: '',
    locale: '',
    title: '',
    momentjsFormatString: '',

    Types: {
        DATE: 'DATE',
        TIME: 'TIME',
        DATETIME: 'DATETIME'
    },

    GlobalObjects: [],

    Init: function (aRawObjects) {
        var aGlobalObjects = this.GlobalObjects;

        if (!aGlobalObjects.length) {
            for (var i = 0, length = aRawObjects.length; i < length; i++)
                aGlobalObjects.push(aRawObjects[i]);
        }
    },

    GetForId: function (uId) {
        var aResult = this.GlobalObjects.filter(function (o) {
            return o.id == uId;
        });

        return aResult.length ? aResult[0] : null;
    },

    GetForKeyCode: function (sKeyCode) {
        var aResult = this.GlobalObjects.filter(function (o) {
            return o.keyCode == sKeyCode;
        });

        return aResult.length ? aResult[0] : null;
    },

    GetForType: function (eType, eLocale, pSortFunc) {
        var pDefaultSortFunc = function (o1, o2) {
            var eLocale1 = String(o1.locale);
            var eLocale2 = String(o2.locale);

            return eLocale1.length && !eLocale2.length ? -1 : (eLocale2.length && !eLocale1.length ? 1 : (eLocale1 < eLocale2 ? -1 : 1));
        };

        return this.GlobalObjects.filter(function (o) {
            if (o.type != eType)
                return false;

            return !(eLocale && o.locale && eLocale != o.locale);


        }).sort(pSortFunc instanceof Function ? pSortFunc : pDefaultSortFunc);
    },

    GetSingleForType: function (eType, eLocale, pSortFunc) {
        var aFormats = this.GetForType(eType, eLocale, pSortFunc);

        return aFormats.length ? aFormats[0] : null;
    },

    GetForTypeDate: function (eLocale) {
        return this.GetForType(this.Types.DATE, eLocale);
    },

    GetForTypeTime: function (eLocale) {
        return this.GetForType(this.Types.TIME, eLocale);
    },

    GetForTypeDateTime: function (eLocale) {
        return this.GetForType(this.Types.DATETIME, eLocale);
    }
};

function toLocaleTimeString() {
    var args = [this].concat(Array.prototype.slice.apply(arguments));

    return iris.Time.DateToLocaleTimeString.apply(iris.Time,args);
}

toLocaleTimeString.original = Date.prototype.toLocaleTimeString;

Date.prototype.toLocaleTimeString = toLocaleTimeString;
