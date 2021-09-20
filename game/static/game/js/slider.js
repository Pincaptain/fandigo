function getCookieVal(offset) {
    var endstr = document.cookie.indexOf(";", offset);
    if (endstr == -1) {
        endstr = document.cookie.length;
    }
    return unescape(document.cookie.substring(offset, endstr));
}

function getCookie(name) {
    var arg = name + "=";
    var alen = arg.length;
    var clen = document.cookie.length;
    var i = 0;
    while (i < clen) {
        var j = i + alen;
        if (document.cookie.substring(i, j) == arg) {
            return getCookieVal(j);
        }
        i = document.cookie.indexOf(" ", i) + 1;
        if (i == 0) break;
    }
    return "";
}

var sliderTime = 0;
var sliderInterval = setInterval(() => {
    sliderTime++;
}, 1000);

/**
 * Puzzle Class
 *
 * @constructor
 */
var Puzzle = function Puzzle(el) {
    this.matrix = [];
    this.el = document.querySelector(el);
    this.movesEl = document.getElementById('moves');
    this._moves = 0;
    this._lock = false;
};

Puzzle.getNeighbors = function (index) {
    var result = {
        top: null,
        bottom: null,
        left: null,
        right: null
    };

    if ([3, 7, 11, 15].indexOf(index) === -1) {
        result.right = index + 1;
    }

    if ([0, 4, 8, 12].indexOf(index) === -1) {
        result.left = index - 1;
    }

    if (index > 3) {
        result.top = index - 4;
    }

    if (index < 12) {
        result.bottom = index + 4;
    }

    return result;
};

Puzzle.getPositionByIndex = function (index) {
    return [Math.floor(index % 4) * 100, Math.floor(index / 4) * 100];
};

Puzzle.prototype.getNeighbors = function (index) {
    var neighbors = Puzzle.getNeighbors(index);

    for (var position in neighbors) {
        var value = neighbors[position];
        if (value !== null) {
            neighbors[position] = this.matrix[value];
        }
    }

    return neighbors;
};

Puzzle.prototype.shuffle = function () {
    var matrix = this.matrix;
    var tempArray = [];
    var n = matrix.length;
    for (var i = 0; i < n; i++) {
        tempArray.push(matrix.splice(Math.floor(Math.random() * matrix.length), 1)[0]);
    }

    this.matrix = tempArray;

    return this;
};

Puzzle.prototype.createNumbers = function () {
    for (var i = 0; i < 16; i++) {
        this.matrix[i] = new Piece(this);
        this.matrix[i].el = document.createElement('div');
        this.matrix[i].el.innerHTML = i + 1;
        this.matrix[i].realIndex = i;

        this.el.appendChild(this.matrix[i].el);
    }

    this.matrix[15].el.innerHTML = '';
    this.matrix[15].el.className = 'null';
    this.matrix[15].isNull = true;

    return this;
};

Puzzle.prototype.updatePositions = function () {
    for (var i = 0; i < this.matrix.length; i++) {
        var obj = this.matrix[i];
        var position = Puzzle.getPositionByIndex(i);
        obj.el.style.left = position[0] + 'px';
        obj.el.style.top = position[1] + 'px';
    }

    return this;
};

Puzzle.prototype.__defineGetter__('nullPiece', function () {
    for (var i = 0; i < this.matrix.length; i++) {
        var obj = this.matrix[i];
        if (obj.isNull) {
            return obj;
        }
    }
});

Puzzle.prototype.move = function (direction) {
    if (this._lock) {
        return;
    }

    var nullPiece = this.nullPiece,
        neighbors = nullPiece.getNeighbors(),
        toReplace;

    switch (direction) {
        case 'up':
            toReplace = neighbors.bottom;
            break;
        case 'down':
            toReplace = neighbors.top;
            break;
        case 'left':
            toReplace = neighbors.right;
            break;
        case 'right':
            toReplace = neighbors.left;
            break;
    }

    if (toReplace !== null) {
        nullPiece.replace(toReplace);
        this.moves++;
        this.updatePositions();
        this.checkWin();
    }
};

Puzzle.prototype.checkWin = function () {
    for (var i = 0; i < this.matrix.length; i++) {
        var obj = this.matrix[i];
        if (obj.realIndex !== obj.index) {
            return false;
        }
    }

    document.querySelector('.win').style.display = 'block';
    this.lock();

    // In case of a victory
    // Clear the interval
    clearInterval(sliderInterval);

    // Save the game score to the database
    // TODO - Code that shit
    let points = 500 / Math.log(sliderTime);
    $.ajax({
        url: `/games/2/save_score/${points}/`,
        headers: {
            "X-CSRFToken": getCookie("csrftoken"),
            "sessionid": getCookie("sessionid")
        },
        success: function (data) {
            alert("Your score was successfully updated!")
        }
    });

    // Reset the time
    sliderTime = 0;


    return true;
};

Puzzle.prototype.__defineGetter__('moves', function () {
    return this._moves;
});

Puzzle.prototype.__defineSetter__('moves', function (moves) {
    this._moves = moves;
    this.movesEl.innerHTML = this._moves;
});

Puzzle.prototype.unlock = function () {
    this._lock = false;
};

Puzzle.prototype.lock = function () {
    this._lock = true;
};

/**
 * Pieces Class
 *
 * @param puzzle
 * @constructor
 */
var Piece = function Piece(puzzle) {
    this.el = null;
    this.parent = puzzle;
    this.isNull = false;
    this.realIndex = 0;
};

Piece.prototype.__defineGetter__('index', function () {
    return this.parent.matrix.indexOf(this);
});

Piece.prototype.getNeighbors = function () {
    return this.parent.getNeighbors(this.index);
};

Piece.prototype.replace = function (piece) {
    if (piece) {
        var myIndex = this.index,
            thatIndex = piece.index;

        this.parent.matrix[myIndex] = piece;
        this.parent.matrix[thatIndex] = this;

        return this;
    }
};

var puzzle = new Puzzle('.canvas').createNumbers().shuffle().updatePositions();

window.addEventListener('keydown', function (e) {
    var key = e.keyCode;

    switch (key) {
        case 37:
            puzzle.move('left');
            e.preventDefault();
            break;
        case 38:
            puzzle.move('up');
            e.preventDefault();
            break;
        case 39:
            puzzle.move('right');
            e.preventDefault();
            break;
        case 40:
            puzzle.move('down');
            e.preventDefault();
            break;
    }
});

function newGame() {
    puzzle.moves = 0;
    puzzle.shuffle().updatePositions().unlock();
}

var buttons = document.querySelectorAll('.btn');

for (var i = 0; i < buttons.length; i++) {
    buttons[i]
        .addEventListener('click', function (e) {
            e.preventDefault();

            newGame();
        });
}

document.querySelector('.win').addEventListener('click', function (e) {
    e.preventDefault();

    document.querySelector('.win').style.display = 'none';
});