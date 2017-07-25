var butts = {
		butt_freq: 75,
    jumble_freq: 5,
    butt_time: function(){
    		if(Math.floor(Math.random() * this.butt_freq) == 0){
        		return true;
        }
    },
		buttify: function(word){ 
    		var result = word;
    		if(this.butt_time()){
        		if(Math.floor(Math.random() * 2) == 0){
            		result = "butt";
            } else {
            		result = "butts";
            }
        }
        if(school){
        		result = cap(result);
        }
        return result;
    },
    big: function(word){
        if(Math.floor(Math.random() * 25) == 0){
          return word.toUpperCase();
        } else {
          return word;
        }
    },
		// Return a random entry from an array.
    pick: function(a){
        var i = Math.floor(a.length * Math.random());
        return a[i];
    },
    shuffle: function(array) {
        for (var i = array.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
        return array;
		},
    post_process: function (the_play, exclude_first){
        var end = [];
        the_play.forEach(function(segment){
            var words = segment.split(' ');
            var new_words = [];
            var new_segment;

            words.forEach(function(processed_word){
            		if(processed_word.trim() == 'i'){
                		processed_word = 'I'; // fix capitalization
                }
                if(processed_word !== words[0] && processed_word !== words[1] || exclude_first == false){
                    processed_word = butts.buttify(processed_word);
                    processed_word = butts.big(processed_word);
                }
                new_words.push(processed_word);
            });

            new_segment = new_words.join(' ');
            end.push(new_segment);
        });

        return end;
		},
    punct: function (array_of_strang){ // punctuate paragraph randomly
    		for(i = 0; i < array_of_strang.length - 2; i++) {
        		if(Math.floor(Math.random() * 5) == 0){
          			array_of_strang[i] = array_of_strang[i].trim() + butts.pick(['!','?','.','...']);
                array_of_strang[i + 1] = cap(array_of_strang[i + 1]);
          	} else if(Math.floor(Math.random() * 9 == 0)){
            		array_of_strang[i] = array_of_strang[i].trim() + ',';
            }
        }
        
        return array_of_strang;
    },
    destroy: function (a, n){ // jumble sentences
    		for(i = 0; i < a.length - 2; i++) {
        		if(Math.floor(Math.random() * n) == 0){
          			a[i] = (butts.shuffle(a[i].split(' '))).join(' ');
                a[i].trim();
          	}
        }
        
        return a;
    },
    end: function(a){ // Capitalize first word.  Punctuate last word.
        a[0] = cap(a[0].trim());
        a[a.length-1] = a[a.length-1] + butts.pick(['!','?','.','...']);
        a[a.length-1].trim();
    
    		return a;
    },
    rgx: function(s, reg, school){
    		if(school){
    				return butts.cap_all(s).split(reg);
        } else {
    				return s.toLowerCase().split(reg);
        }
    },
    empty_killer: function(a){
    		var new_array = [];
        a.forEach(function(s){
        		if(s.trim().length > 0){
            		new_array.push(s);
            }
        });
        
        return new_array;
    },
    cap_all: function(s){
    		var teach = s.split(" ");
        var taught = [];
        teach.forEach(function(s){
            taught.push(cap(s));
        });
        return taught.join(" ");
    }
};
