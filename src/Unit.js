function Unit(x, y, c, style) {
    this.x = x;
    this.y = y;
    this.c = c || 'X';
    this.style = style || {normal: 'white', cold: '#222'};
}

Unit.prototype.step = function(callback) {
    return true;
};

Unit.prototype.karma = 0;

Unit.STEP_PLAYER = function(callback) {
    var unit = this;
    display.draw(); /* Update the display at the last moment. */
    var handler = $(document).on('keydown.player', function(event) {
        // console.log(event.keyCode);
        var dx = null, dy = null;
            switch (event.which) {
            case 'h'.charCodeAt(0):
            case 'H'.charCodeAt(0):
            case 37:
                dx = -1; dy = 0;
                break;
            case 'j'.charCodeAt(0):
            case 'J'.charCodeAt(0):
            case 40:
                dx = 0; dy = 1;
                break;
            case 'k'.charCodeAt(0):
            case 'K'.charCodeAt(0):
            case 38:
                dx = 0; dy = -1;
                break;
            case 'l'.charCodeAt(0):
            case 'L'.charCodeAt(0):
            case 39:
                dx = 1; dy = 0;
                break;
            case 'y'.charCodeAt(0):
            case 'Y'.charCodeAt(0):
            case 36:
                dx = -1; dy = -1;
                break;
            case 'u'.charCodeAt(0):
            case 'U'.charCodeAt(0):
            case 33:
                dx = 1; dy = -1;
                break;
            case 'b'.charCodeAt(0):
            case 'B'.charCodeAt(0):
            case 35:
                dx = -1; dy = 1;
                break;
            case 'n'.charCodeAt(0):
            case 'N'.charCodeAt(0):
            case 34:
                dx = 1; dy = 1;
                break;
            case 190: // .
            case 12:
                dx = 0; dy = 0;
                unit.fatigue =
                    Math.max(0, unit.fatigue - Game.FATIGUE_RECOVERY);
                break;
            }
        if (dx != null && dy != null) {
            var xx = unit.x + dx, yy = unit.y - dy;
            if (yy < display.max() && !game.map.isSolid(xx, yy)) {
                unit.fatigue++;
                unit.x = xx;
                unit.y = yy;
                $(document).off('keydown.player');
                callback();
            }
        }
    });
};
