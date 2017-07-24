(function() {
    var module = angular.module('iris_url_service', [
        'iris_urlutils_service'
    ]);

    /**
     * The irisHistory service.
     *
     * A reference to the browser's window.history object.
     */
    module.provider('irisHistory', function() {

        this.$get = function($window) {
            return $window.history;
        };

    });

    /**
     * The irisPermalink service.
     *
     * The service provides three functions:
     *
     * - getHref Get full permalink.
     * - getParams Get the search params.
     * - updateParams Update the search params.
     * - deleteParam Delete a search param.
     *
     * updateParams and deleteParam should be called during a digest cycle.
     * If the browser supports the history API the link in the address bar
     * is updated.
     */
    module.provider('irisPermalink', function() {
        this.$get = function($window, $rootScope, $sniffer, $location, $browser,irisHistory, irisUrlUtils) {

            var Permalink = function(b, p, h) {
                var base = b;
                var params = p;
                var hash = h;

                this.getHref = function(p) {
                    var newParams = angular.extend({}, params);
                    if (angular.isDefined(p)) {
                        angular.extend(newParams, p);
                    }
                    /*console.log('getHref, hash ===',$window.location.hash,'===',$location.path(),'===', hash,
                        '===', $location.url(), '===', $location.hash());*/
                    return '' + $location.path() + '?' + irisUrlUtils.toKeyValue(newParams);
                };

                this.getParams = function() {
                    return params;
                };

                this.updateParams = function(p) {
                    angular.extend(params, p);
                };

                this.deleteParam = function(key) {
                    delete params[key];
                };

                this.refresh = function() {
                    $location.url(newHref);
                };
            };

            var loc = $window.location;
            var port = loc.port;
            var protocol = loc.protocol;
            var hash = loc.hash;

            var base = protocol + '//' + loc.hostname +
                (port !== '' ? ':' + port : '') +
                loc.pathname;

            /*var permalink = new Permalink(
                base, irisUrlUtils.parseKeyValue(loc.search.substring(1)),hash);*/
            var permalink = new Permalink(
                base, $location.search(),hash);

            var lastHref = loc.href;
            $rootScope.$watch(function() {
                var newHref = permalink.getHref();
                if (lastHref != newHref) {
                    //console.log(1111111111111,lastHref,newHref);
                    $rootScope.$evalAsync(function() {
                        //console.log(1111111111111,lastHref,newHref,$location.url());
                        lastHref = newHref;
                        $location.absUrl();
                        if ($sniffer.history && !(document.fullscreenElement ||
                            document.msFullscreenElement ||
                            document.mozFullScreen ||
                            document.webkitIsFullScreen)) {
                            $location.url(newHref);
                        }
                        $rootScope.$broadcast('irisPermalinkChange');
                    });
                }
            });

            return permalink;
        };
    });

})();
