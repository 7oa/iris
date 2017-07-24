/**
 * Created by herbrichm on 11.07.16.
 */


function JSTimeLogger (identifier)
{
    var _this = this;

    _this.data = {
        uuid: iris.tools.getUUID(),
        identifier: identifier,
        dateBegin: new Date().getTime(),
        dateFinished: null
    };



    var getOutputIdentifier = function() {
        _this.data.identifier = _this.data.identifier ? _this.data.identifier : "Unknown identifier";
        return "[" + _this.data.identifier + "-" + _this.data.uuid + "]";
    };
    
    var getDurationFormatted = function() {
        if (!_this.data.dateBegin || !_this.data.dateFinished) {
            return "? ms";
        }
        return (_this.data.dateFinished - _this.data.dateBegin) + " ms";
    };
    
    var logBegin = function() {
       console.log(getOutputIdentifier() + " BEGIN");
    };
    
    var logFinished = function() {
        _this.data.dateFinished = new Date().getTime();

        if (!arguments[0] || !arguments[0].length) {
            console.log(getOutputIdentifier() + " FINISHED IN " + getDurationFormatted());
        }
        else {
            console.log(getOutputIdentifier() + " FINISHED IN " + getDurationFormatted(), arguments[0]);
        }
    };

    _this.finished = function() {
        logFinished(arguments);
    };

    logBegin();
}