module.exports = function($parent) {
    get_page('game', function(page) {
        $parent.append(page.$container);
        
        
    });
};