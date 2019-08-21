let bracketObject;

function displayBracket( bracket ) {
    bracketObject = bracket;

    let div = id( 'bracketDisplay' );
    div.style.display = "flex";
    div.style.justifyContent = "center";
    div.innerHTML = "";

    for ( let i = 0; i < bracketObject.getMaxRounds(); i++ ) {
        let roundDiv = document.createElement( "DIV" );
        roundDiv.id = "round" + i;
        roundDiv.style.display = "flex";
        roundDiv.style.flexDirection = "column";
        roundDiv.style.justifyContent = "center";
        roundDiv.style.marginLeft = "1em";

        let matches = bracketObject.getMatchesFromRound( i );
        for ( let j = 0; j < matches.length; j++ ) {
            let match = matches[j];
            let matchDiv = document.createElement( "DIV" );
            matchDiv.style.display = "flex";
            matchDiv.style.flexDirection = "column";
            matchDiv.style.marginBottom = MATCH_B_MARGIN;

            matchDiv = getMatch( matchDiv, match );

            if ( i > 0 && j > 0 ) {
                insertFiller( roundDiv, 1 + ( 2 * ( i - 1 ) ) );
            }

            roundDiv.appendChild( matchDiv );
        }
        div.appendChild( roundDiv );
        adjustFontSize( roundDiv );
    }

    setClickableMatches();
    setDisplayType();
}

function getMatch( matchDiv, match ) {
    const matchId = getMatchId( match );
    const entries = [ match.top, match.bottom ];

    for ( let i = 0; i < entries.length; i++ ) {
        let isTop = i % 2 === 0;
        let entryDiv = document.createElement( "DIV" );
        entryDiv.style.display = "flex";
        let image = getImageFromEntry( entries[i], isTop, matchId, (!isTop && match.bye) );
        let button = getButtonFromEntry( entries[i], isTop, matchId, (!isTop && match.bye) );
        entryDiv.appendChild( image );
        entryDiv.appendChild( button );
        matchDiv.appendChild( entryDiv );
    }

    return matchDiv;
}

function getImageFromEntry( entry, isTop, matchId, isBye ) {
    let image = getImage();

    image.id = getImageId( matchId, isTop );
    let source = entry ? entry.image : "images/question.jpg";
    source = isBye && !isTop ? "images/blank.jpg" : source;
    image.setAttribute( "src", source );

    return image;
}

function getButtonFromEntry( entry, isTop, matchId, isBye ) {
    let button = getButton();

    entry = entry || {name: (isBye ? "Bye" : "TBD"), seed: 0};
    button.innerHTML = getDisplayName( entry );
    button.id = getButtonId( matchId, isTop );
    button.name = matchId;
    button.onclick = function() {
        registerBracketChoice( matchId, isTop );
    };

    return button;
}

function insertFiller( roundDiv, multiplier ) {
    let fillerDiv = document.createElement( "DIV" );
    fillerDiv.setAttribute( "name", "filler" );
    fillerDiv.style.display = "flex";
    fillerDiv.style.flexDirection = "column";
    fillerDiv.style.marginBottom = ( parseFloat(MATCH_B_MARGIN) * multiplier ) + "rem";
    fillerDiv.style.height = ( parseFloat(TOTAL_MATCH_HEIGHT) * multiplier ) + "rem";
    //fillerDiv.style.borderStyle = "solid";
    //fillerDiv.style.borderWidth = "1px";
    roundDiv.appendChild( fillerDiv );
}

function setClickableMatches() {
    const matches = bracketObject.getMatches();
    for ( let i = 0; i < matches.length; i++ ) {
        const matchId = getMatchId( matches[i] );
        freezeRadioButtons( matchId );

        if ( matches[i].winner ) {
            const winnerId = getButtonId( matchId, matches[i].winner.seed === matches[i].top.seed );
            selectRadioButton( winnerId, true );
        }
    }

    switch ( mode ) {
    case "match":
        setClickable( bracketObject.getCurrentMatchId() );
        break;
    case "round":
        const roundMatches = bracketObject.getMatchesFromRound( bracketObject.getCurrentRound(), true );
        for ( let i = 0; i < roundMatches.length; i++ ) {
            setClickable( getMatchId( roundMatches[i] ) );
        }
        break;
    case "open":
    default:
        const nonByeMatches = bracketObject.getMatches();
        for ( let i = 0; i < nonByeMatches.length; i++ ) {
            const match = matches[i];
            if ( match.top && match.top.seed && match.bottom && match.bottom.seed ) {
                setClickable( getMatchId( match ) );
            }
        }
    }
}


/*** ROUND DISPLAY ***/


function setDisplayType() {
    if ( state === "active" ) {
        window.onresize = updateMobile;
        round = bracketObject.getCurrentRound() >= 0 ? bracketObject.getCurrentRound() : 0;
        display = {};
        display.isLarge = bracketObject.getMaxSize() > 32;
        display.isMobile = isMobile();

        displayRounds();
    }
    else {
        hideMobileDisplay();
    }
}

function updateMobile() {
    display.isMobile = isMobile();
    displayRounds();
}

function isMobile() {
    let element = cl('mobileDisplay')[0];
    const currentValue = element.style.display;
    element.style.display = "";
    const result = getComputedStyle( element ).display !== "none";
    element.style.display = currentValue;
    return result;
}

function displayRounds() {
    if ( display.isMobile ) {
        displaySingleRound();
    }
    else if ( display.isLarge ) {
        displayThreeRounds();
    }
    else {
        displayAllRounds();
    }

    if ( display.isMobile || display.isLarge ) {
        updateRoundPicker();
    }
}

function displaySingleRound() {
    for ( let i = 0; i < bracketObject.getMaxRounds(); i++ ) {
        id('round' + i).style.display = ( i === round ) ? "flex" : "none";
    }

    let fillers = nm('filler');
    for ( let i = 0; i < fillers.length; i++ ) {
        fillers[i].style.display = "none";
    }

    adjustFontSize( id( "round" + round ) );
}

function displayThreeRounds() {
    id('roundPicker').style.display = "block";

    for ( let i = 0; i < bracketObject.getMaxRounds(); i++ ) {
        id('round' + i).style.display = ( i >= round - 1 && i <= round + 1 ) ? "flex" : "none";
    }

    let fillers = nm('filler');
    for ( let i = 0; i < fillers.length; i++ ) {
        fillers[i].style.display = "flex";
    }

    const farLeftRound = ( round === 0 ) ? 0 : round - 1;
    fillers = id('round' + farLeftRound).querySelectorAll('[name=filler]');
    for ( let i = 0; i < fillers.length; i++ ) {
        fillers[i].style.display = "none";
    }

    const middleRound = ( round === 0 ) ? 1 : round;
    fillers = id('round' + middleRound).querySelectorAll('[name=filler]');
    for ( let i = 0; i < fillers.length; i++ ) {
        fillers[i].style.marginBottom = ( parseFloat(MATCH_B_MARGIN) ) + "rem";
        fillers[i].style.height = ( parseFloat(TOTAL_MATCH_HEIGHT) ) + "rem";
    }

    const farRightRound = ( round === 0 ) ? 2 : round + 1;
    fillers = id('round' + farRightRound).querySelectorAll('[name=filler]');
    for ( let i = 0; i < fillers.length; i++ ) {
        fillers[i].style.marginBottom = ( parseFloat(MATCH_B_MARGIN) * 3 ) + "rem";
        fillers[i].style.height = ( parseFloat(TOTAL_MATCH_HEIGHT) * 3 ) + "rem";
    }
}

function displayAllRounds() {
    for ( let i = 0; i < bracketObject.getMaxRounds(); i++ ) {
        id('round' + i).style.display = "flex";
    }

    let fillers = nm('filler');
    for ( let i = 0; i < fillers.length; i++ ) {
        fillers[i].style.display = "flex";
    }
}

function updateRoundPicker() {
    id('roundSpan').innerHTML = "Round " + ( round + 1 );

    if ( round === 0 ) {
        id('arrowPrev').style.display = "none";
    }
    else if ( round === bracketObject.getMaxRounds() - 1 || ( display.isLarge && round === bracket.getMaxRounds() - 2 ) ) {
        id('arrowNext').style.display = "none";
    }
    else {
        id('arrowPrev').style.display = "";
        id('arrowNext').style.display = "";
    }
}

function changeRound( direction ) {
    if ( direction === "prev" ) {
        round--;
    }
    else if ( direction === "next" ) {
        round++;
    }

    let maxRound = bracketObject.getMaxRounds() - 1;
    round = round < 0 ? 0 : ( round > maxRound ? maxRound : round );

    displayRounds();
}


/*** INTERACTION ***/


function registerBracketChoice( matchId, isTop ) {
    let match = bracketObject.getMatchFromId( matchId );
    let winner = isTop ? match.top : match.bottom;
    const winnerChange = winner !== match.winner;
    match.winner = winner;

    if ( mode === "open" && winnerChange ) {
        bracketObject.updateCurrent();

        let matchButtons = nm( matchId );
        for ( let i = 0; i < matchButtons.length; i++ ) {
            matchButtons[i].classList.remove( "blinkBorder" );
        }

        let next = bracketObject.getNextMatch( matchId );
        if ( next.match ) {
            updateMatch( next.match, match.winner, next.isTop );
            next = bracketObject.getNextMatch( getMatchId( next.match ) );

            while ( next.match ) {
                updateMatch( next.match, null, next.isTop );
                next = bracketObject.getNextMatch( getMatchId( next.match ) );
            }
        }

        if ( ( display.isMobile && round < bracketObject.getCurrentRound() ) ||
             ( display.isLarge  && round < bracketObject.getCurrentRound() && round < ( bracketObject.getMaxRounds() - 2 ) ) ) {
            changeRound( "next" );
        }
    }
}

function updateMatch( match, winner, isTopChange ) {
    isTopChange ? match.top = winner : match.bottom = winner;
    match.winner = null;

    let matchId = getMatchId( match );
    let matchButtons = nm( matchId );
    matchButtons[isTopChange ? 0 : 1].innerHTML = getDisplayName( winner );
    const imageId = getImageId( matchId, isTopChange );
    let imageSource = winner ? (isTopChange ? match.top.image : match.bottom.image) : "images/question.jpg";
    id( imageId ).setAttribute( "src", imageSource );
    adjustFontSize( id( "round" + match.round ) );

    const activateBlink = match.top && match.bottom;
    for ( let i = 0; i < matchButtons.length; i++ ) {
        let classList = matchButtons[i].classList;
        classList.remove( "selectedButton" );
        activateBlink ? classList.remove( "staticInverseButton" ) : classList.add( "staticInverseButton" );
        activateBlink ? classList.add( "blinkBorder" )                   : classList.remove( "blinkBorder" );
        activateBlink ? classList.add( "inverseButton" )                 : classList.remove( "inverseButton" );
    }
}


/*** SUBMIT ***/


function getBracketVotes() {
    let votes = null;
    let relevantMatches = null;
    if ( mode === "open" ) {
        relevantMatches = [ bracketObject.getFinalMatch() ];
        if ( areMatchesComplete( relevantMatches ) ) {
            votes = parseVotes( relevantMatches );
        }
        else {
            showToaster( "Must complete bracket..." );
        }
    }
    else if ( mode === "round" ) {
        relevantMatches = bracketObject.getMatchesFromRound( round, true );
        if ( areMatchesComplete( relevantMatches ) ) {
            votes = parseVotes( relevantMatches );
        }
        else {
            showToaster( "Must complete round..." );
        }
    }
    else if ( mode === "match" ) {
        relevantMatches = [ bracketObject.getMatchFromId( bracketObject.getCurrentMatchId() ) ];
        if ( areMatchesComplete( relevantMatches ) ) {
            votes = parseVotes( relevantMatches );
        }
        else {
            showToaster( "Must complete match..." );
        }
    }

    return votes;
}

function areMatchesComplete( matches ) {
    let result = true;
    for ( let i = 0; i < matches.length; i++) {
        const match = ( typeof matches[i] === "string" ) ? bracketObject.getMatchFromId( matches[i] ) : matches[i];
        if ( !match.winner ) {
            result = false;
            break;
        }
    }
    return result;
}

function parseVotes( relevantMatches ) {
    relevantMatches = Array.isArray( relevantMatches ) ? relevantMatches : [ relevantMatches ];
    return relevantMatches.map( m => function() { return { id: getMatchId( m ), vote: m.winner.seed }; } );
}


/*** UTILITY ***/


function getButtonId( matchId, isTop )
{
    return matchId + (isTop?"T":"B");
}

function getImageId( matchId, isTop )
{
    return matchId + "Image" + (isTop?"T":"B");
}

function getDisplayName( entry ) {
    let name = entry ? entry.name : "TBD";
    if ( !( name === "Bye" || name === "TBD" ) ) {
        name = "" + entry.seed + ". " + name;
    }
    return name;
}