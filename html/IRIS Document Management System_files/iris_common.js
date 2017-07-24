/****************** TOOLS *************************/
iris.tools = {};
iris.tools.getRandomColor = function () {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
};

iris.tools.getUUID = function() {
    var s4 = function () {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }

    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
};

iris.tools.getUnique = function(array) {
    var n = {},r=[];
    for(var i = 0; i < array.length; i++)
    {
        if (!n[array[i]])
        {
            n[array[i]] = array;
            r.push(array[i]);
        }
    }
    return r;
};

iris.tools.getUrlParameterByName = function(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
};

iris.tools.cool_bg = function () {
    var canvas,
        ctx,
        width,
        height,
        size,
        lines,
        tick;

    function line() {
        this.path = [];
        this.speed = rand( 10, 20 );
        this.count = randInt( 10, 30 );
        this.x = width / 2, + 1;
        this.y = height / 2 + 1;
        this.target = { x: width / 2, y: height / 2 };
        this.dist = 0;
        this.angle = 0;
        this.hue = tick / 5;
        this.life = 1;
        this.updateAngle();
        this.updateDist();
    }

    line.prototype.step = function( i ) {
        this.x += Math.cos( this.angle ) * this.speed;
        this.y += Math.sin( this.angle ) * this.speed;

        this.updateDist();

        if( this.dist < this.speed ) {
            this.x = this.target.x;
            this.y = this.target.y;
            this.changeTarget();
        }

        this.path.push( { x: this.x, y: this.y } );
        if( this.path.length > this.count ) {
            this.path.shift();
        }

        this.life -= 0.001;

        if( this.life <= 0 ) {
            this.path = null;
            lines.splice( i, 1 );
        }
    };

    line.prototype.updateDist = function() {
        var dx = this.target.x - this.x,
            dy = this.target.y - this.y;
        this.dist = Math.sqrt( dx * dx + dy * dy );
    }

    line.prototype.updateAngle = function() {
        var dx = this.target.x - this.x,
            dy = this.target.y - this.y;
        this.angle = Math.atan2( dy, dx );
    }

    line.prototype.changeTarget = function() {
        var randStart = randInt( 0, 3 );
        switch( randStart ) {
            case 0: // up
                this.target.y = this.y - size;
                break;
            case 1: // right
                this.target.x = this.x + size;
                break;
            case 2: // down
                this.target.y = this.y + size;
                break;
            case 3: // left
                this.target.x = this.x - size;
        }
        this.updateAngle();
    };

    line.prototype.draw = function( i ) {
        ctx.beginPath();
        var rando = rand( 0, 10 );
        for( var j = 0, length = this.path.length; j < length; j++ ) {
            ctx[ ( j === 0 ) ? 'moveTo' : 'lineTo' ]( this.path[ j ].x + rand( -rando, rando ), this.path[ j ].y + rand( -rando, rando ) );
        }
        ctx.strokeStyle = 'hsla(' + rand( this.hue, this.hue + 30 ) + ', 80%, 55%, ' + ( this.life / 3 ) + ')';
        ctx.lineWidth = rand( 0.1, 2 );
        ctx.stroke();
    };

    function rand( min, max ) {
        return Math.random() * ( max - min ) + min;
    }

    function randInt( min, max ) {
        return Math.floor( min + Math.random() * ( max - min + 1 ) );
    }

    function init () {
        $('body').addClass('bg-super-img');
        canvas = document.getElementById( 'bg_super_img' );
        ctx = canvas.getContext( '2d' );
        size = 30;
        lines = [];
        reset();
        loop();
        window.addEventListener( 'resize', onresize );
    }

    function reset() {
        width = Math.ceil( window.innerWidth / 2 ) * 2;
        height = Math.ceil( window.innerHeight / 2 ) * 2;
        tick = 0;

        lines.length = 0;
        canvas.width = width;
        canvas.height = height;
    }

    function create() {
        if( tick % 10 === 0 ) {
            lines.push( new line());
        }
    }

    function step() {
        var i = lines.length;
        while( i-- ) {
            lines[ i ].step( i );
        }
    }

    function clear() {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.fillStyle = 'hsla(0, 0%, 0%, 0.1';
        ctx.fillRect( 0, 0, width, height );
        ctx.globalCompositeOperation = 'lighter';
    }

    function draw() {
        ctx.save();
        ctx.translate( width / 2, height / 2 );
        ctx.rotate( tick * 0.001 );
        var scale = 0.8 + Math.cos( tick * 0.02 ) * 0.2;
        ctx.scale( scale, scale );
        ctx.translate( -width / 2, -height / 2 );
        var i = lines.length;
        while( i-- ) {
            lines[ i ].draw( i );
        }
        ctx.restore();
    }

    function loop() {
        requestAnimationFrame( loop );
        create();
        step();
        clear();
        draw();
        tick++;
    }

    function onresize() {
        reset();
    }

    return {
        init:init
    }
};
iris.cool_bg = new iris.tools.cool_bg();

alertify.banner = function(message, callback) {
    alertify.alert(message, function(data) {
        if(typeof callback == 'function') {
            callback(data);
        }

        $('body').removeClass('alertify-alert-open');
        $('.alertify').remove();
    });

    $('body').addClass('alertify-alert-open');
    $('.alertify-cover').remove();
};


iris.modal = iris.modal || {};
iris.modal.toogleStickModal = function() {
    var $uibModal = $('.modal-content'),
        $body = $('body');
    $body.toggleClass('modal-unsticked');

    if($body.hasClass('modal-unsticked')) {
        $uibModal.draggable({ handle: '.modal-header', containment: 'window' });
    } else {
        $uibModal.draggable('destroy');
    }
};

iris.modal.onClose = function() {
    var $body = $('body');

    if(!$body.hasClass('modal-unsticked')) return;

    $body.removeClass('modal-unsticked');

    var $uibModal = $('.modal');
    if($uibModal.length) {
        $uibModal.draggable('destroy');
    }
};

iris.grid = {};
iris.grid.fixWidth = function(gridApi) {
    gridApi.grid.gridWidth = angular.element(gridApi.grid.element).width();
    gridApi.grid.refreshCanvas(true);
};
