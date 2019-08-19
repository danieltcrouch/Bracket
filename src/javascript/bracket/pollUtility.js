let pollObject;

function displayPoll( poll ) {
    pollObject = poll;

    let div = id( 'bracketDisplay' );
    div.style.display = "flex";
    div.style.justifyContent = "center";
    div.innerHTML = "";

    let pollDiv = document.createElement( "DIV" );
    pollDiv.style.display = "flex";
    pollDiv.style.flexDirection = "column";
    pollDiv.style.justifyContent = "center";
    pollDiv.style.marginBottom = "1.5rem";

    let matchId = "pollButtons";
    let entries = pollObject.getEntries();
    for ( let i = 0; i < entries.length; i++ ) {
        let entry = entries[i];
        let entryDiv = document.createElement( "DIV" );
        entryDiv.style.display = "flex";

        let image = getImage();
        image.setAttribute( "src", entry.image );
        image.id = "pollImage" + i;
        let button = getButton();
        button.innerHTML = entry.name;
        button.id = "pollButton" + i;
        button.name = matchId;
        button.onclick = function() {
            registerPollChoice( i );
        };

        entryDiv.appendChild( image );
        entryDiv.appendChild( button );
        pollDiv.appendChild( entryDiv );
    }
    div.appendChild( pollDiv );
    adjustFontSize( pollDiv );

    setClickable( matchId );
    hideMobileDisplay();
}


/*** INTERACTION ***/


function registerPollChoice( index ) {
    pollObject.setWinner( index );
}


/*** SUBMIT ***/


function getPollVotes() {
    let votes = null;
    if ( pollObject.getWinner() ) {
        votes = [{ id: "", vote: pollObject.getWinnerIndex() }];
    }
    else {
        showToaster( "Must choose one entry..." );
    }
    return votes;
}