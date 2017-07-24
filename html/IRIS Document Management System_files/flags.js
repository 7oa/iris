(function () {
    irisAppDependencies.add('iris_flags');

    angular.module('iris_flags', []);

    angular.module('iris_flags').factory('FlagsService', function () {
        return {
            getFlags: () => {
                return [
                    [{"id": "flag flag-gu", "name": "flag-gu"}, {
                        "id": "flag flag-mn",
                        "name": "flag-mn"
                    }, {"id": "flag flag-va", "name": "flag-va"},
                        {"id": "flag flag-tibet", "name": "flag-tibet"}, {
                        "id": "flag flag-fo",
                        "name": "flag-fo"
                    }, {"id": "flag flag-th", "name": "flag-th"}, {
                        "id": "flag flag-tr",
                        "name": "flag-tr"
                    }, {"id": "flag flag-tl", "name": "flag-tl"}, {
                        "id": "flag flag-kz",
                        "name": "flag-kz"
                    }, {"id": "flag flag-zm", "name": "flag-zm"}, {
                        "id": "flag flag-uz",
                        "name": "flag-uz"
                    }, {"id": "flag flag-dk", "name": "flag-dk"}, {
                        "id": "flag flag-scotland",
                        "name": "flag-scotland"
                    }, {"id": "flag flag-gi", "name": "flag-gi"}, {
                        "id": "flag flag-gy",
                        "name": "flag-gy"
                    }, {"id": "flag flag-bj", "name": "flag-bj"}, {
                        "id": "flag flag-fr",
                        "name": "flag-fr"
                    }, {"id": "flag flag-mo", "name": "flag-mo"}, {
                        "id": "flag flag-ir",
                        "name": "flag-ir"
                    }, {"id": "flag flag-io", "name": "flag-io"}, {
                        "id": "flag flag-tm",
                        "name": "flag-tm"
                    }, {"id": "flag flag-ch", "name": "flag-ch"}, {
                        "id": "flag flag-mt",
                        "name": "flag-mt"
                    }, {"id": "flag flag-nl", "name": "flag-nl"}, {
                        "id": "flag flag-gp",
                        "name": "flag-gp"
                    }, {"id": "flag flag-im", "name": "flag-im"}, {
                        "id": "flag flag-tv",
                        "name": "flag-tv"
                    }, {"id": "flag flag-mu", "name": "flag-mu"}, {
                        "id": "flag flag-pe",
                        "name": "flag-pe"
                    }, {"id": "flag flag-vi", "name": "flag-vi"}, {
                        "id": "flag flag-hn",
                        "name": "flag-hn"
                    }, {"id": "flag flag-ss", "name": "flag-ss"}, {
                        "id": "flag flag-ae",
                        "name": "flag-ae"
                    }, {"id": "flag flag-td", "name": "flag-td"}, {
                        "id": "flag flag-pw",
                        "name": "flag-pw"
                    }, {"id": "flag flag-nu", "name": "flag-nu"}, {
                        "id": "flag flag-bt",
                        "name": "flag-bt"
                    }, {"id": "flag flag-ms", "name": "flag-ms"}, {
                        "id": "flag flag-cv",
                        "name": "flag-cv"
                    }, {"id": "flag flag-es", "name": "flag-es"}, {
                        "id": "flag flag-mh",
                        "name": "flag-mh"
                    }, {"id": "flag flag-la", "name": "flag-la"}, {
                        "id": "flag flag-vn",
                        "name": "flag-vn"
                    }, {"id": "flag flag-py", "name": "flag-py"}, {
                        "id": "flag flag-br",
                        "name": "flag-br"
                    }, {"id": "flag flag-ye", "name": "flag-ye"}, {
                        "id": "flag flag-ie",
                        "name": "flag-ie"
                    }, {"id": "flag flag-gh", "name": "flag-gh"}, {
                        "id": "flag flag-cg",
                        "name": "flag-cg"
                    }, {"id": "flag flag-cu", "name": "flag-cu"}, {
                        "id": "flag flag-hu",
                        "name": "flag-hu"
                    }, {"id": "flag flag-sg", "name": "flag-sg"}, {
                        "id": "flag flag-at",
                        "name": "flag-at"
                    }, {"id": "flag flag-lk", "name": "flag-lk"}, {
                        "id": "flag flag-vu",
                        "name": "flag-vu"
                    }, {"id": "flag flag-bo", "name": "flag-bo"}, {
                        "id": "flag flag-jo",
                        "name": "flag-jo"
                    }, {"id": "flag flag-er", "name": "flag-er"}, {
                        "id": "flag flag-za",
                        "name": "flag-za"
                    }, {"id": "flag flag-rs", "name": "flag-rs"}, {
                        "id": "flag flag-nr",
                        "name": "flag-nr"
                    }, {"id": "flag flag-ls", "name": "flag-ls"}, {
                        "id": "flag flag-jm",
                        "name": "flag-jm"
                    }, {"id": "flag flag-tz", "name": "flag-tz"}, {
                        "id": "flag flag-ki",
                        "name": "flag-ki"
                    }, {"id": "flag flag-sj", "name": "flag-sj"}, {
                        "id": "flag flag-cz",
                        "name": "flag-cz"
                    }, {"id": "flag flag-pg", "name": "flag-pg"}, {
                        "id": "flag flag-lv",
                        "name": "flag-lv"
                    }, {"id": "flag flag-do", "name": "flag-do"}, {
                        "id": "flag flag-lu",
                        "name": "flag-lu"
                    }, {"id": "flag flag-no", "name": "flag-no"}, {
                        "id": "flag flag-kw",
                        "name": "flag-kw"
                    }, {"id": "flag flag-mx", "name": "flag-mx"}, {
                        "id": "flag flag-yt",
                        "name": "flag-yt"
                    }, {"id": "flag flag-ly", "name": "flag-ly"}, {
                        "id": "flag flag-cy",
                        "name": "flag-cy"
                    }, {"id": "flag flag-ph", "name": "flag-ph"}, {
                        "id": "flag flag-my",
                        "name": "flag-my"
                    }, {"id": "flag flag-sm", "name": "flag-sm"}, {
                        "id": "flag flag-et",
                        "name": "flag-et"
                    }, {"id": "flag flag-ru", "name": "flag-ru"}, {
                        "id": "flag flag-tj",
                        "name": "flag-tj"
                    }, {"id": "flag flag-ai", "name": "flag-ai"}, {
                        "id": "flag flag-pl",
                        "name": "flag-pl"
                    }, {"id": "flag flag-kp", "name": "flag-kp"}, {
                        "id": "flag flag-uy",
                        "name": "flag-uy"
                    }, {"id": "flag flag-gb", "name": "flag-gb"}, {
                        "id": "flag flag-gs",
                        "name": "flag-gs"
                    }, {"id": "flag flag-kurdistan", "name": "flag-kurdistan"}, {
                        "id": "flag flag-rw",
                        "name": "flag-rw"
                    }, {"id": "flag flag-ec", "name": "flag-ec"}, {
                        "id": "flag flag-mm",
                        "name": "flag-mm"
                    }, {"id": "flag flag-pa", "name": "flag-pa"}, {
                        "id": "flag flag-wales",
                        "name": "flag-wales"
                    }, {"id": "flag flag-kg", "name": "flag-kg"}, {
                        "id": "flag flag-ve",
                        "name": "flag-ve"
                    }, {"id": "flag flag-tk", "name": "flag-tk"}, {
                        "id": "flag flag-ca",
                        "name": "flag-ca"
                    }, {"id": "flag flag-is", "name": "flag-is"}, {
                        "id": "flag flag-ke",
                        "name": "flag-ke"
                    }, {"id": "flag flag-ro", "name": "flag-ro"}, {
                        "id": "flag flag-gq",
                        "name": "flag-gq"
                    }, {"id": "flag flag-pt", "name": "flag-pt"}, {
                        "id": "flag flag-tf",
                        "name": "flag-tf"
                    }, {"id": "flag flag-ad", "name": "flag-ad"}, {
                        "id": "flag flag-sk",
                        "name": "flag-sk"
                    }, {"id": "flag flag-pm", "name": "flag-pm"}, {
                        "id": "flag flag-om",
                        "name": "flag-om"
                    }, {"id": "flag flag-an", "name": "flag-an"}, {
                        "id": "flag flag-ws",
                        "name": "flag-ws"
                    }, {"id": "flag flag-sh", "name": "flag-sh"}, {
                        "id": "flag flag-mp",
                        "name": "flag-mp"
                    }, {"id": "flag flag-gt", "name": "flag-gt"}, {
                        "id": "flag flag-cf",
                        "name": "flag-cf"
                    }, {"id": "flag flag-zanzibar", "name": "flag-zanzibar"}, {
                        "id": "flag flag-mw",
                        "name": "flag-mw"
                    }, {"id": "flag flag-catalonia", "name": "flag-catalonia"}, {
                        "id": "flag flag-ug",
                        "name": "flag-ug"
                    }, {"id": "flag flag-je", "name": "flag-je"}, {
                        "id": "flag flag-km",
                        "name": "flag-km"
                    }, {"id": "flag flag-in", "name": "flag-in"}, {
                        "id": "flag flag-bf",
                        "name": "flag-bf"
                    }, {"id": "flag flag-mc", "name": "flag-mc"}, {
                        "id": "flag flag-sy",
                        "name": "flag-sy"
                    }, {"id": "flag flag-sn", "name": "flag-sn"}, {
                        "id": "flag flag-kr",
                        "name": "flag-kr"
                    }, {"id": "flag flag-eu", "name": "flag-eu"}, {
                        "id": "flag flag-bn",
                        "name": "flag-bn"
                    }, {"id": "flag flag-st", "name": "flag-st"}, {
                        "id": "flag flag-england",
                        "name": "flag-england"
                    }, {"id": "flag flag-lc", "name": "flag-lc"}, {
                        "id": "flag flag-dm",
                        "name": "flag-dm"
                    }, {"id": "flag flag-be", "name": "flag-be"}, {
                        "id": "flag flag-ni",
                        "name": "flag-ni"
                    }, {"id": "flag flag-ua", "name": "flag-ua"}, {
                        "id": "flag flag-mz",
                        "name": "flag-mz"
                    }, {"id": "flag flag-pf", "name": "flag-pf"}, {
                        "id": "flag flag-tn",
                        "name": "flag-tn"
                    }, {"id": "flag flag-ee", "name": "flag-ee"}, {
                        "id": "flag flag-xk",
                        "name": "flag-xk"
                    }, {"id": "flag flag-sx", "name": "flag-sx"}, {
                        "id": "flag flag-sd",
                        "name": "flag-sd"
                    }, {"id": "flag flag-gd", "name": "flag-gd"}, {
                        "id": "flag flag-ci",
                        "name": "flag-ci"
                    }, {"id": "flag flag-sz", "name": "flag-sz"}, {
                        "id": "flag flag-cl",
                        "name": "flag-cl"
                    }, {"id": "flag flag-fi", "name": "flag-fi"}, {
                        "id": "flag flag-ga",
                        "name": "flag-ga"
                    }, {"id": "flag flag-jp", "name": "flag-jp"}, {
                        "id": "flag flag-de",
                        "name": "flag-de"
                    }, {"id": "flag flag-np", "name": "flag-np"}, {
                        "id": "flag flag-re",
                        "name": "flag-re"
                    }, {"id": "flag flag-bg", "name": "flag-bg"}, {
                        "id": "flag flag-sc",
                        "name": "flag-sc"
                    }, {"id": "flag flag-ng", "name": "flag-ng"}, {
                        "id": "flag flag-qa",
                        "name": "flag-qa"
                    }, {"id": "flag flag-mk", "name": "flag-mk"}, {
                        "id": "flag flag-aw",
                        "name": "flag-aw"
                    }, {"id": "flag flag-kn", "name": "flag-kn"}, {
                        "id": "flag flag-al",
                        "name": "flag-al"
                    }, {"id": "flag flag-bw", "name": "flag-bw"}, {
                        "id": "flag flag-um",
                        "name": "flag-um"
                    }, {"id": "flag flag-ky", "name": "flag-ky"}, {
                        "id": "flag flag-tt",
                        "name": "flag-tt"
                    }, {"id": "flag flag-so", "name": "flag-so"}, {
                        "id": "flag flag-lt",
                        "name": "flag-lt"
                    }, {"id": "flag flag-by", "name": "flag-by"}, {
                        "id": "flag flag-bb",
                        "name": "flag-bb"
                    }, {"id": "flag flag-us", "name": "flag-us"}, {
                        "id": "flag flag-md",
                        "name": "flag-md"
                    }, {"id": "flag flag-ag", "name": "flag-ag"}, {
                        "id": "flag flag-hm",
                        "name": "flag-hm"
                    }, {"id": "flag flag-as", "name": "flag-as"}, {
                        "id": "flag flag-eg",
                        "name": "flag-eg"
                    }, {"id": "flag flag-sv", "name": "flag-sv"}, {
                        "id": "flag flag-sl",
                        "name": "flag-sl"
                    }, {"id": "flag flag-fk", "name": "flag-fk"}, {
                        "id": "flag flag-am",
                        "name": "flag-am"
                    }, {"id": "flag flag-ck", "name": "flag-ck"}, {
                        "id": "flag flag-tw",
                        "name": "flag-tw"
                    }, {"id": "flag flag-kh", "name": "flag-kh"}, {
                        "id": "flag flag-to",
                        "name": "flag-to"
                    }, {"id": "flag flag-se", "name": "flag-se"}, {
                        "id": "flag flag-cd",
                        "name": "flag-cd"
                    }, {"id": "flag flag-pn", "name": "flag-pn"}, {
                        "id": "flag flag-gr",
                        "name": "flag-gr"
                    }, {"id": "flag flag-id", "name": "flag-id"}, {
                        "id": "flag flag-vc",
                        "name": "flag-vc"
                    }, {"id": "flag flag-somaliland", "name": "flag-somaliland"}, {
                        "id": "flag flag-bi",
                        "name": "flag-bi"
                    }, {"id": "flag flag-pk", "name": "flag-pk"}, {
                        "id": "flag flag-pr",
                        "name": "flag-pr"
                    }, {"id": "flag flag-bd", "name": "flag-bd"}, {
                        "id": "flag flag-co",
                        "name": "flag-co"
                    }, {"id": "flag flag-fm", "name": "flag-fm"}, {
                        "id": "flag flag-bm",
                        "name": "flag-bm"
                    }, {"id": "flag flag-ar", "name": "flag-ar"}, {
                        "id": "flag flag-bv",
                        "name": "flag-bv"
                    }, {"id": "flag flag-sb", "name": "flag-sb"}, {
                        "id": "flag flag-mq",
                        "name": "flag-mq"
                    }, {"id": "flag flag-eh", "name": "flag-eh"}, {
                        "id": "flag flag-bh",
                        "name": "flag-bh"
                    }, {"id": "flag flag-it", "name": "flag-it"}, {
                        "id": "flag flag-hr",
                        "name": "flag-hr"
                    }, {"id": "flag flag-sa", "name": "flag-sa"}, {
                        "id": "flag flag-mv",
                        "name": "flag-mv"
                    }, {"id": "flag flag-mg", "name": "flag-mg"}, {
                        "id": "flag flag-dz",
                        "name": "flag-dz"
                    }, {"id": "flag flag-gg", "name": "flag-gg"}, {
                        "id": "flag flag-gm",
                        "name": "flag-gm"
                    }, {"id": "flag flag-af", "name": "flag-af"}, {
                        "id": "flag flag-li",
                        "name": "flag-li"
                    }, {"id": "flag flag-sr", "name": "flag-sr"}, {
                        "id": "flag flag-vg",
                        "name": "flag-vg"
                    }, {"id": "flag flag-cr", "name": "flag-cr"}, {
                        "id": "flag flag-tc",
                        "name": "flag-tc"
                    }, {"id": "flag flag-ao", "name": "flag-ao"}, {
                        "id": "flag flag-ma",
                        "name": "flag-ma"
                    }, {"id": "flag flag-mr", "name": "flag-mr"}, {
                        "id": "flag flag-gn",
                        "name": "flag-gn"
                    }, {"id": "flag flag-ne", "name": "flag-ne"}, {
                        "id": "flag flag-nf",
                        "name": "flag-nf"
                    }, {"id": "flag flag-wf", "name": "flag-wf"}, {
                        "id": "flag flag-hk",
                        "name": "flag-hk"
                    }, {"id": "flag flag-gf", "name": "flag-gf"}, {
                        "id": "flag flag-ps",
                        "name": "flag-ps"
                    }, {"id": "flag flag-ic", "name": "flag-ic"}, {
                        "id": "flag flag-cw",
                        "name": "flag-cw"
                    }, {"id": "flag flag-ml", "name": "flag-ml"}, {
                        "id": "flag flag-ax",
                        "name": "flag-ax"
                    }, {"id": "flag flag-gl", "name": "flag-gl"}, {
                        "id": "flag flag-dj",
                        "name": "flag-dj"
                    }, {"id": "flag flag-cn", "name": "flag-cn"}, {
                        "id": "flag flag-ht",
                        "name": "flag-ht"
                    }, {"id": "flag flag-lr", "name": "flag-lr"}, {
                        "id": "flag flag-tg",
                        "name": "flag-tg"
                    }, {"id": "flag flag-ba", "name": "flag-ba"}, {
                        "id": "flag flag-ge",
                        "name": "flag-ge"
                    }, {"id": "flag flag-bz", "name": "flag-bz"}, {
                        "id": "flag flag-au",
                        "name": "flag-au"
                    }, {"id": "flag flag-iq", "name": "flag-iq"}, {
                        "id": "flag flag-cm",
                        "name": "flag-cm"
                    }, {"id": "flag flag-gw", "name": "flag-gw"}, {
                        "id": "flag flag-az",
                        "name": "flag-az"
                    }, {"id": "flag flag-na", "name": "flag-na"}, {
                        "id": "flag flag-fj",
                        "name": "flag-fj"
                    }, {"id": "flag flag-zw", "name": "flag-zw"}, {
                        "id": "flag flag-bs",
                        "name": "flag-bs"
                    }, {"id": "flag flag-il", "name": "flag-il"}, {
                        "id": "flag flag-nz",
                        "name": "flag-nz"
                    }, {"id": "flag flag-me", "name": "flag-me"}, {
                        "id": "flag flag-si",
                        "name": "flag-si"
                    }, {"id": "flag flag-nc", "name": "flag-nc"}, {"id": "flag flag-lb", "name": "flag-lb"}]
                ]
            }
        }
    });
})();