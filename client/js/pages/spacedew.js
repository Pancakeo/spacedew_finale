module.exports = function(options) {
    options = $.extend({
        room_id: null
    }, options);

    const KEYCODE_W = 119;
    const KEYCODE_A = 97;
    const KEYCODE_S = 115;
    const KEYCODE_D = 100;

    let users = [];

    let game = {};
    const room_id = options.room_id;

    let lizard = new Image();
    lizard.src = 'images/game/player.png';

    let evil = new Image();
    evil.src = 'images/game/evil.png';

    // TODO tweak these values and stuff.
    let player = {
        keys_down: {},
        mouse: {
            down: false,
            x: -500,
            y: -500
        },
        x: 500,
        y: 400,
        speed: {
            x: 0,
            y: 0
        },
        max_speed: 8,
        acceleration: 0.5,
        size: 32,
        image: lizard,
        weapon: {
            damage: 5,
            range: 100,
            // ...?
            cooldown: 100,
            last_fire: 0,
            speed: 16,
            radius: 3
        }
    };

    let evil_wup = {
        x: 700,
        y: 600,
        speed: {
            x: 0,
            y: 0
        },
        max_speed: 3,
        acceleration: 0.1,
        health: 100,
        image: evil,
        weapon: {}
    };

    users.push(evil_wup);

    let bullets = [];

    setInterval(function() {
        if (!document.hasFocus()) {
            player.keys_down = {};
            player.mouse_down = false;
        }

        if (player.mouse_down) {
            if (Date.now() - player.weapon.last_fire >= player.weapon.cooldown) {
                player.weapon.last_fire = Date.now();

                let bullet = {origin: {x: player.x + 16, y: player.y + 16}, speed: player.weapon.speed, radius: player.weapon.radius, created_at: Date.now()};

                let diff_x = bullet.origin.x - player.mouse.x;
                let diff_y = bullet.origin.y - player.mouse.y;

                diff_x = -diff_x;
                diff_y = -diff_y;

                let wup = (diff_x * diff_x) + (diff_y * diff_y);
                wup = Math.sqrt(wup);

                let norm_x = diff_x / wup;
                let norm_y = diff_y / wup;

                bullet.norm = {x: norm_x, y: norm_y};
                bullet.x = bullet.origin.x;
                bullet.y = bullet.origin.y;
                bullets.push(bullet);
            }
        }

        // --------------

        bullets.forEach(function(b) {
            b.x += b.norm.x * b.speed;
            b.y += b.norm.y * b.speed;
        });

        let horizontal_movement = false;

        if (player.keys_down[KEYCODE_A] || player.keys_down[KEYCODE_D]) {
            horizontal_movement = true;
        }

        if (player.keys_down[KEYCODE_A]) {
            player.speed.x -= player.acceleration;
            player.speed.x = Math.max(player.speed.x, -player.max_speed);
        }
        if (player.keys_down[KEYCODE_D]) {
            player.speed.x += player.acceleration;
            player.speed.x = Math.min(player.speed.x, player.max_speed);
        }

        if (!horizontal_movement) {
            if (player.speed.x > 0) {
                player.speed.x -= player.acceleration;
                if (player.speed.x < 0) {
                    player.speed.x = 0;
                }
            }
            else {
                player.speed.x += player.acceleration;
                if (player.speed.x > 0) {
                    player.speed.x = 0;
                }
            }
        }

        player.x += player.speed.x;

        let vertical_movement = false;

        if (player.keys_down[KEYCODE_W] || player.keys_down[KEYCODE_S]) {
            vertical_movement = true;
        }

        if (player.keys_down[KEYCODE_W]) {
            player.speed.y -= player.acceleration;
            player.speed.y = Math.max(player.speed.y, -player.max_speed);
        }
        if (player.keys_down[KEYCODE_S]) {
            player.speed.y += player.acceleration;
            player.speed.y = Math.min(player.speed.y, player.max_speed);
        }

        if (!vertical_movement) {
            if (player.speed.y > 0) {
                player.speed.y -= player.acceleration;
                if (player.speed.y < 0) {
                    player.speed.y = 0;
                }
            }
            else {
                player.speed.y += player.acceleration;
                if (player.speed.y > 0) {
                    player.speed.y = 0;
                }
            }
        }

        player.y += player.speed.y;
    }, 16);

    let tracked_keys = [KEYCODE_W, KEYCODE_A, KEYCODE_D, KEYCODE_S];

    get_page('spacedew', {popup: true}, function(page) {
        $(document).on('keydown', function(e) {
            let keyCode = e.keyCode + 32;
            if (tracked_keys.includes(keyCode)) {
                player.keys_down[keyCode] = true;
            }
        });

        $(document).on('keyup', function(e) {
            let keyCode = e.keyCode + 32;
            if (tracked_keys.includes(keyCode)) {
                delete player.keys_down[keyCode];
            }
        });

        $(document).on('contextmenu', function() {
            return false;
        });

        $(document).on('mousedown', function(e) {
            player.mouse_down = true;
        });

        $(document).on('mouseup', function(e) {
            player.mouse_down = false;
        });

        $(document).on('mousemove', function(e) {
            var rect = page.$("#game")[0].getBoundingClientRect();
            player.mouse.x = e.clientX - rect.left;
            player.mouse.y = e.clientY - rect.top;
        });

        $(window).on('resize', function() {
            let $canvas = page.$("canvas");
            $canvas[0].width = $(window).width() - 30;
            $canvas[0].height = $(window).height() - 50;

        });

        let draw = function() {
            let ctx = page.$("#game")[0].getContext('2d');
            ctx.clearRect(0, 0, 2700, 1500);

            // ctx.beginPath();
            // ctx.strokeRect(player.x, player.y, player.size, player.size);
            // ctx.fill();
            ctx.drawImage(player.image, player.x, player.y);

            users.forEach(function(user) {
                ctx.drawImage(user.image, user.x, user.y);
            });

            let bullets_to_kill = [];
            for (let i = bullets.length - 1; i >= 0; i--) {
                let b = bullets[i];

                ctx.beginPath();
                ctx.fillStyle = 'red';
                ctx.arc(b.x, b.y, b.radius, 0, 2 * Math.PI, false);
                // ctx.stroke();
                ctx.fill();

                if (Date.now() - b.created_at >= 5000) {
                    bullets.splice(i, 1);
                }
            }

            requestAnimationFrame(draw);
        };
        requestAnimationFrame(draw);

        let $parent = $('body');
        $parent.append(page.$container);
        window.resizeTo(window.screen.availWidth, window.screen.availHeight);

        // app.toolio.confirm("Full Screen?", "Full Screen?", function() {
        //     var docElm = document.documentElement;
        //     if (docElm.requestFullscreen) {
        //         docElm.requestFullscreen();
        //     }
        //     else if (docElm.mozRequestFullScreen) {
        //         docElm.mozRequestFullScreen();
        //     }
        //     else if (docElm.webkitRequestFullScreen) {
        //         docElm.webkitRequestFullScreen();
        //     }
        //     else if (docElm.msRequestFullscreen) {
        //         docElm.msRequestFullscreen();
        //     }
        // });
    });

    return {};
};