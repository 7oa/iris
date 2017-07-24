(function(globals) {
    'use strict';

    function IrisLoaderClass() {

        var defaultPlace = 'body';
        var currentPlace = '';

        function initialize(options) {
            this.currentPlace = options && options.currentPlace ? options.currentPlace : defaultPlace;
        }

        function start(place, text) {
            var tmpl = '<div class="loader"><div class="animate"></div></div>';
            place = place || defaultPlace;
            text = text || '';
            currentPlace = place;
            if (text != '')
                tmpl = '<div class="loader"><div class="animate"></div><div class="animate-text"><span>' + text + '</span></div></div>';

            var $place = $(place);

            if ($place.length) {
                var $loader = $place.children('.loader');
                if (!$loader.length) {
                    $place.append(tmpl);
                } else {
                    $loader = $place.children('.loader');
                }

                var $body = $('body');
                if (!$body.hasClass('loading')) {
                    $body.addClass('loading');
                }

                return true;
            }

            return false;
        }

        function running() {
            return $('body').hasClass('loading') && $(currentPlace) && $(currentPlace).children('.loader').length;
        }

        function stop(curPlace) {
            curPlace = curPlace || currentPlace;

            if (curPlace != currentPlace) {
                return false;
            }

            var $body = $('body');
            if ($body.hasClass('loading')) {
                $body.removeClass('loading');
            }

            var $currentPlace = $(curPlace);
            if ($currentPlace) {
                var $loader = $currentPlace.children('.loader');
                $loader.remove();
            }

            return true;
        }

        return {
            initialize,
            start,
            running,
            stop
        }
    };

    globals.iris.loader = new IrisLoaderClass();

})({
    iris: iris
});