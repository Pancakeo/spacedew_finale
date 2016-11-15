var board = {
    tile_size: 48,
    size: 15,
    start_square: {row: 8, col: 8},
    letter_spread: {
        A: 9,
        B: 2,
        C: 2,
        D: 4,
        E: 12,
        F: 2,
        G: 3,
        H: 2,
        I: 9,
        J: 1,
        K: 1,
        L: 4,
        M: 2,
        N: 6,
        O: 8,
        P: 2,
        Q: 1,
        R: 6,
        S: 4,
        T: 6,
        U: 4,
        V: 2,
        W: 2,
        X: 1,
        Y: 2,
        Z: 1,
        _: 2
    },
    get_point_value: function(letter) {
        var points = {
            0: ['_'],
            1: ['A', 'E', 'I', 'L', 'N', 'O', 'R', 'S', 'T', 'U'],
            2: ['D', 'G'],
            3: ['B', 'C', 'M', 'P'],
            4: ['F', 'H', 'V', 'W', 'Y'],
            5: ['K'],
            8: ['J', 'X'],
            10: ['Q', 'Z'],
        };

        for (var value in points) {
            var letter_set = points[value];
            if (letter_set.indexOf(letter) >= 0) {
                return value;
            }
        }

    },
    double_letter_score: [
        {row: 1, col: 3},
        {row: 1, col: 12},

        {row: 3, col: 7},
        {row: 3, col: 9},

        {row: 4, col: 1},
        {row: 4, col: 8},
        {row: 4, col: 15},

        {row: 7, col: 3},
        {row: 7, col: 7},
        {row: 7, col: 9},
        {row: 7, col: 13},

        {row: 8, col: 4},
        {row: 8, col: 12},

        {row: 9, col: 3},
        {row: 9, col: 7},
        {row: 9, col: 9},
        {row: 9, col: 13},

        {row: 12, col: 1},
        {row: 12, col: 8},
        {row: 12, col: 15},

        {row: 13, col: 7},
        {row: 13, col: 9},

        {row: 15, col: 3},
        {row: 15, col: 12}
    ],
    triple_letter_score: [
        {row: 2, col: 6},
        {row: 2, col: 10},

        {row: 6, col: 2},
        {row: 6, col: 6},
        {row: 6, col: 10},
        {row: 6, col: 14},

        {row: 10, col: 2},
        {row: 10, col: 6},
        {row: 10, col: 10},
        {row: 10, col: 14},

        {row: 14, col: 6},
        {row: 14, col: 10},
    ],
    double_word_score: [
        {row: 2, col: 2},
        {row: 3, col: 3},
        {row: 4, col: 4},
        {row: 5, col: 5},

        {row: 2, col: 14},
        {row: 3, col: 13},
        {row: 4, col: 12},
        {row: 5, col: 11},

        {row: 11, col: 5},
        {row: 12, col: 4},
        {row: 13, col: 3},
        {row: 14, col: 2},

        {row: 11, col: 11},
        {row: 12, col: 12},
        {row: 13, col: 13},
        {row: 14, col: 14}
    ],
    triple_word_score: [
        {row: 1, col: 1},
        {row: 1, col: 8},
        {row: 1, col: 15},

        {row: 8, col: 1},
        {row: 8, col: 15},

        {row: 15, col: 1},
        {row: 15, col: 8},
        {row: 15, col: 15}
    ],
    draw_letters: function(board) {

    }
};

module.exports = {
    board: board
};