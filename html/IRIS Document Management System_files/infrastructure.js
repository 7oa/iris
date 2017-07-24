(function() {
    irisAppDependencies.add('iris_infrastructure');
    angular.module('iris_infrastructure', []);

    angular.module('iris_infrastructure').factory('InfrastructureService', function($translate) {
        const operatingSystems = [
            { id: "WINDOWS7", name: "Windows 7" },
            { id: "WINDOWS8", name: "Windows 8" },
            { id: "WINDOWS81", name: "Windows 8.1" },
            { id: "WINDOWS10", name: "Windows 10" },
            { id: "MACOS", name: "Mac OS" },
            { id: "MACOSX", name: "Mac OS X" },
            { id: "LINUX", name: "Linux" },
            { id: "IOS", name: "iOS" },
            { id: "ANDROID", name: "Android" },
            { id: "OTHER", name: $translate.instant('label.Other') }
        ];

        const browsers = [
            { id: "FIREFOX", name: "Firefox" },
            { id: "CHROME", name: "Chrome" },
            { id: "IE", name: "Internet Explorer" },
            { id: "EDGE", name: "Microsoft Edge" },
            { id: "OPERA", name: "Opera" },
            { id: "SAFARI", name: "Safari" },
            { id: "OTHER", name: $translate.instant('label.Other') }
        ];

        [operatingSystems, browsers].forEach(list => {
            list.forEach((val, index) => val.index = index);
        });

        function getBrowser() {
            // Opera 8.0+
            var isOpera = (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;

            // Firefox 1.0+
            var isFirefox = typeof InstallTrigger !== 'undefined';

            // Safari 3.0+ "[object HTMLElementConstructor]"
            var isSafari = /constructor/i.test(window.HTMLElement) || (function (p) { return p.toString() === "[object SafariRemoteNotification]"; })(!window['safari'] || safari.pushNotification);

            // Internet Explorer 6-11
            var isIE = /*@cc_on!@*/false || !!document.documentMode;

            // Edge 20+
            var isEdge = !isIE && !!window.StyleMedia;

            // Chrome 1+
            var isChrome = !!window.chrome && !!window.chrome.webstore;

            // Blink engine detection
            var isBlink = (isChrome || isOpera) && !!window.CSS;

            if (isChrome) return browsers.find(b => b.id == "CHROME");
            if (isEdge) return browsers.find(b => b.id == "EDGE");
            if (isIE) return browsers.find(b => b.id == "IE");
            if (isSafari) return browsers.find(b => b.id == "SAFARI");
            if (isFirefox) return browsers.find(b => b.id == "FIREFOX");
            if (isOpera) return browsers.find(b => b.id == "OPERA");
            return browsers.find(b => b.id == "OTHER");
        }

        function getOperatingSystem() {
            var clientStrings = [
                {s:'Windows 10', r:/(Windows 10.0|Windows NT 10.0)/, id:'WINDOWS10'},
                {s:'Windows 8.1', r:/(Windows 8.1|Windows NT 6.3)/, id:'WINDOWS81'},
                {s:'Windows 8', r:/(Windows 8|Windows NT 6.2)/, id:'WINDOWS8'},
                {s:'Windows 7', r:/(Windows 7|Windows NT 6.1)/, id:'WINDOWS7'},
                {s:'Windows Vista', r:/Windows NT 6.0/},
                {s:'Windows Server 2003', r:/Windows NT 5.2/},
                {s:'Windows XP', r:/(Windows NT 5.1|Windows XP)/},
                {s:'Windows 2000', r:/(Windows NT 5.0|Windows 2000)/},
                {s:'Windows ME', r:/(Win 9x 4.90|Windows ME)/},
                {s:'Windows 98', r:/(Windows 98|Win98)/},
                {s:'Windows 95', r:/(Windows 95|Win95|Windows_95)/},
                {s:'Windows NT 4.0', r:/(Windows NT 4.0|WinNT4.0|WinNT|Windows NT)/},
                {s:'Windows CE', r:/Windows CE/},
                {s:'Windows 3.11', r:/Win16/},
                {s:'Android', r:/Android/, id:'ANDROID'},
                {s:'Open BSD', r:/OpenBSD/},
                {s:'Sun OS', r:/SunOS/},
                {s:'Linux', r:/(Linux|X11)/, id:'LINUX'},
                {s:'iOS', r:/(iPhone|iPad|iPod)/, id:'IOS'},
                {s:'Mac OS X', r:/Mac OS X/, id:'MACOSX'},
                {s:'Mac OS', r:/(MacPPC|MacIntel|Mac_PowerPC|Macintosh)/, id:'MACOS'},
                {s:'QNX', r:/QNX/},
                {s:'UNIX', r:/UNIX/},
                {s:'BeOS', r:/BeOS/},
                {s:'OS/2', r:/OS\/2/},
                {s:'Search Bot', r:/(nuhk|Googlebot|Yammybot|Openbot|Slurp|MSNBot|Ask Jeeves\/Teoma|ia_archiver)/}
            ];

            var os;
            for (var id in clientStrings) {
                var cs = clientStrings[id];
                if (cs.r.test(navigator.userAgent)) {
                    os = cs.id;
                    break;
                }
            }
            os = os || "OTHER";
            return operatingSystems.find(s => s.id == os);
        }

        return {
            getOperatingSystems: () => operatingSystems,
            getBrowsers: () => browsers,

            getOperatingSystem,
            getBrowser
        }
    });
})();