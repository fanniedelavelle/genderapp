var turn_on = false; // Default
var name_dict = window.name_dict;
var word_dict = window.word_dict;
var all_words = Object.assign({}, name_dict, word_dict);
var regex_word = new RegExp("\\b" + Object.keys(word_dict).join("\\b|\\b"), "gi");
var regex_name = new RegExp(Object.keys(name_dict).join("|"), "g");
var m_count = 0, f_count = 0;
var m_percent = 0, f_percent = 0;
var processed = false;
var values_name = Object.values( name_dict );

var all_male_words = Object.keys(word_dict).concat(Object.keys(name_dict));
var all_female_words = Object.values(word_dict).concat(Object.values(name_dict));

for (var i = 0; i < all_male_words.length; i++) {
    all_male_words[i] = all_male_words[i].toLowerCase();
}

for (var i = 0; i < all_female_words.length; i++) {
    all_female_words[i] = all_female_words[i].toLowerCase();
}

//

function applyContent () {

    if ( processed ) return;

    //var result = string.match(/(\blink\S+\b)/ig);

    $('body :not(script) :not(iframe)').contents().filter(function() {

        return this.nodeType === 3 && this.id !== 'adContent' && this.id !== 'dockedBanner' && this.id !== 'google_image_div';

    }).replaceWith( function () {

        var str = this.nodeValue;
        var temp_words = str.split(/('|:|;|\/|\s+)/);
        var words = [];

        for (var i = 0; i < temp_words.length; i++) {

            var current_word = temp_words[i].trim().replace(/[.,\/#!$%\^&\*;:{}=\-_`'"?~()]/g, "");

            if (current_word != '') {

                words[words.length] = current_word;

            }

        }

        if (words.length == 0) {

            return str;

        }

        // Delete surname after Mr, Ms, M, Mme, Lady, Lord

        for ( var i = 0; i < words.length; i ++ ) {

            if ( words[ i ] === 'Mr' || words[ i ] === 'Ms' || words[ i ] === 'M' || words[ i ] === 'Mme' || words[ i ] === 'Lady' || words[ i ] === 'Lord' ) {

                words.splice( i + 1, 1 );

            }

        }

        // Delete surname after female name

        for ( var i = 0; i < words.length; i ++ ) {

            if ( values_name.indexOf( words[ i ] ) !== -1 && name_dict[ words[ i + 1 ] ] ) {

                words.splice( i + 1, 1 );

            }

        }

        // Count Male/Female Words

        for(var i = 0; i < words.length; i++) {

            if(all_male_words.indexOf(words[i].toLowerCase()) >= 0) {

                m_count++;

            }
            
            if(all_female_words.indexOf(words[i].toLowerCase()) >= 0) {

                f_count++;

            }

        }

        // Replace
        str = str.replace(regex_word, function(matched) {

            if (words.indexOf(matched) >= 0) {
                var replacement = '';
                if (typeof(all_words[matched]) === 'undefined') {
                    replacement = all_words[matched.toLowerCase()];

                    if (matched[0] == matched[0].toUpperCase()) {
                        if( replacement ) {
                            replacement = replacement.charAt(0).toUpperCase() + replacement.slice(1);
                        }
                    }
                } else {
                    replacement = all_words[matched];
                }

                return '<span class="makeitshe ignore-css replacement">' + replacement + '<span class="ignore-css tooltiptext">' + matched + '</span>' + '</span>';
            } else {
                return matched;
            }
        });

        str = str.replace(regex_name, function(matched) {

            if (words.indexOf(matched) >= 0) {
                replacement = all_words[matched];
                return '<span class="makeitshe ignore-css replacement">' + replacement + '<span class="ignore-css tooltiptext">' + matched + '</span>' + '</span>';
            } else {
                return matched;
            }
        });

        return str;

    });

    m_percent = Math.round( m_count / (m_count + f_count) * 100 );
    f_percent = Math.round( f_count / (m_count + f_count) * 100 );

    processed = true;

};

//

chrome.runtime.onMessage.addListener( function ( msg, sender, sendResponse ) {

    if ( ( msg.from === 'popup' ) && ( msg.action === 'getStats' ) ) {

        var stats = {
            male: m_percent.toFixed(2),
            female: f_percent.toFixed(2)
        };

        sendResponse( stats );
        return;

    }

    if ( msg.activate ) {

        applyContent();

    } else {

        $('.makeitshe').each( function ( index, el ) {

            var original_html = $( '.tooltiptext', $( this ) ).html();
            el.outerHTML = original_html;

        });

        processed = false;

    }

});
