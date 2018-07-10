var siteStateList;
var activeDomain;

function updateSiteStateList ( site, state ) {

    siteStateList[ site ] = state;
    localStorage.setItem( 'siteStateList', JSON.stringify( siteStateList ) );

};

//

var m, f;

function setStats ( stats ) {

    if ( ! stats ) return;

    console.log( stats.male, stats.female )

    m = stats.male;
    f = stats.female;
    $('#malep').html( Math.round( stats.male ));
    $('#femalep').html( Math.round( stats.female ));

};

document.addEventListener('DOMContentLoaded', () => {

    siteStateList = JSON.parse( localStorage.getItem('siteStateList') ) || {};
    activeDomain = localStorage.getItem( 'activeDomain' );

    chrome.tabs.query({ active: true, currentWindow: true }, function ( tabs ) {

        chrome.tabs.sendMessage( tabs[0].id, { from: 'popup', action: 'getStats' }, setStats );

    });

    // On / Off Button

    if ( siteStateList[ activeDomain ] !== true ) {

        $('#onoffB').html('Turn On');
        $('h1').hide();

    } else {

        $('#onoffB').html('Turn Off');
        $('h1').show();

    }

    $('#onoffB').click( function ( event ) {

        var current_text = $( this ).html();

        if ( current_text == 'Turn On' ) {

            $('h1').show();
            updateSiteStateList( activeDomain, true );
            chrome.browserAction.setIcon({ path: "icon_on.png" });
            $('#onoffB').html('Turn Off');

            chrome.tabs.query( { active: true, currentWindow: true }, function ( tabs ) {

                chrome.tabs.sendMessage( tabs[0].id, { from: 'popup', activate: true } );
                setTimeout( function () {

                    chrome.tabs.sendMessage( tabs[0].id, { from: 'popup', action: 'getStats' }, setStats );

                }, 100 );

            });

        } else {

            $('h1').hide();
            updateSiteStateList( activeDomain, false );
            chrome.browserAction.setIcon({ path: "icon_off.png" });
            $('#onoffB').html('Turn On');

            chrome.tabs.query( { active: true, currentWindow: true }, function ( tabs ) {

                chrome.tabs.sendMessage( tabs[0].id, { from: 'popup', activate: false } );

            });

        }

    });

    // Tweet

    var link = '';
    var queryInfo = {
        active: true,
        currentWindow: true
    };

    chrome.tabs.query( { active: true, currentWindow: true }, function ( tabs ) {

        $('#tweetB').click( function ( event ) {

            tweetText = m + "% mentions of men vs " + f + "% women on this page. Let's bridge the gender gap!";
            tweetUrl = "https://twitter.com/intent/tweet?text=" + encodeURIComponent(tweetText) + "&url=" + tabs[0].url + "&via=makeitshe";

            chrome.tabs.create({
                active: true,
                url: tweetUrl
            });

        });

    });
    
});
