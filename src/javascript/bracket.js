//todo 9 - Clean Common repo and custom css files in projects
//todo 9 - set standards for this and future projects

let bracket;
let round;
let state;
let mode;
let display;
let endTime;


/*** DISPLAY ***/


const BUTTON_WIDTH       = "12rem";
const BUTTON_TEXT_HEIGHT = "3rem";
const BUTTON_PADDING     = ".5rem";
const BUTTON_B_MARGIN    = ".75rem";
const MATCH_B_MARGIN     = "1.5rem";
const TOTAL_MATCH_HEIGHT = "7.5rem"; //(BUTTON_TEXT_HEIGHT + BUTTON_B_MARGIN) * 2

function getBracketData( bracketId ) {
    $.post(
        "php/database.php",
        {
            action: "getBracket",
            id:     bracketId
        },
        function ( response ) {
            let bracketInfo = JSON.parse( response );
            bracketInfo.helpImage = helpImage;
            updateBracketTiming( bracketId, bracketInfo, loadPage );
        }
    );
}

function loadPage( bracketId, bracketInfo ) {
    if ( bracketId && bracketInfo && isBracketAvailable( bracketInfo.state ) ) {
        createTitleLogo( bracketInfo, cl('title')[0], bracketInfo.state === "active", true );
        loadBracket( bracketInfo );
    }
    else {
        window.location = "https://bracket.religionandstory.com/index.php?error=InvalidBracketId";
    }
}

function loadBracket( bracketInfo ) {
    state = bracketInfo.state;
    mode = bracketInfo.mode;
    if ( mode !== "poll" ) {
        bracket = new Bracket( bracketInfo.entries, bracketInfo.winners );
        displayBracket();
    }
    else {
        bracket = new Poll( bracketInfo.entries, bracketInfo.winners );
        displayPoll();
    }

    endTime = newDateFromUTC( bracketInfo.timing.scheduledClose );
    displayRoundTimer();
    setDisplayType();
}


/*** DISPLAY - BRACKET ***/


function displayBracket() {
    let div = id( 'bracketDisplay' );
    div.style.display = "flex";
    div.style.justifyContent = "center";
    div.innerHTML = "";

    for ( let i = 0; i < bracket.getMaxRounds(); i++ ) {
        let roundDiv = document.createElement( "DIV" );
        roundDiv.id = "round" + i;
        roundDiv.style.display = "flex";
        roundDiv.style.flexDirection = "column";
        roundDiv.style.justifyContent = "center";
        roundDiv.style.marginLeft = "1em";

        let matches = bracket.getMatchesFromRound( i );
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
        registerChoice( matchId, isTop );
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
    const matches = bracket.getMatches();
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
        setClickable( bracket.getCurrentMatchId() );
        break;
    case "round":
        const roundMatches = bracket.getMatchesFromRound( bracket.getCurrentRound(), true );
        for ( let i = 0; i < roundMatches.length; i++ ) {
            setClickable( getMatchId( roundMatches[i] ) );
        }
        break;
    case "open":
    default:
        const nonByeMatches = bracket.getMatches();
        for ( let i = 0; i < nonByeMatches.length; i++ ) {
            const match = matches[i];
            if ( match.top && match.top.seed && match.bottom && match.bottom.seed ) {
                setClickable( getMatchId( match ) );
            }
        }
    }
}


/*** DISPLAY - POLL ***/


function displayPoll() {
    let div = id( 'bracketDisplay' );
    div.style.justifyContent = "center";
    div.innerHTML = "";

    let pollDiv = document.createElement( "DIV" );
    pollDiv.style.display = "flex";
    pollDiv.style.flexDirection = "column";
    pollDiv.style.justifyContent = "center";

    let matchId = "pollButtons";
    let entries = bracket.getEntries();
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

        entryDiv.appendChild( image );
        entryDiv.appendChild( button );
        pollDiv.appendChild( entryDiv );
    }
    div.appendChild( pollDiv );
    adjustFontSize( pollDiv );

    setClickable( matchId );
}


/*** ROUND DISPLAY ***/


function setDisplayType() {
    if ( mode === "poll" || state !== "active" ) {
        cl('mobileDisplay')[0].style.display = "none";
    }
    else {
        window.onresize = updateMobile;
        round = bracket.getCurrentRound() >= 0 ? bracket.getCurrentRound() : 0;
        display = {};
        display.isLarge = bracket.getMaxSize() > 32;
        display.isMobile = isMobile();

        displayRounds();
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
    for ( let i = 0; i < bracket.getMaxRounds(); i++ ) {
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

    for ( let i = 0; i < bracket.getMaxRounds(); i++ ) {
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
    for ( let i = 0; i < bracket.getMaxRounds(); i++ ) {
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
    else if ( round === bracket.getMaxRounds() - 1 || ( display.isLarge && round === bracket.getMaxRounds() - 2 ) ) {
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

    let maxRound = bracket.getMaxRounds() - 1;
    round = round < 0 ? 0 : ( round > maxRound ? maxRound : round );

    displayRounds();
}


/*** TIMER DISPLAY ***/


function displayRoundTimer() {
    let timerSpan = id('roundTimer');
    if ( state !== "active" ) {
        timerSpan.innerText = "(" + state.charAt(0).toUpperCase() + state.slice(1) + ")";
        id( 'bracketDisplay' ).style.display = "none"; //todo - do we want to do this for Inactive?
        id( 'submit' ).style.display = "none";
    }
    else if ( endTime ) {
        const displayTime = getDisplayTime( endTime );
        timerSpan.style.display = "block";
        timerSpan.innerHTML = "<span style='font-weight: bold;'>Round Ends:</span> " + displayTime;
    }
}

function getDisplayTime( date ) {
    let result = "";

    if ( date ) {
        const now = new Date();
        if ( isDateEqual( date, now ) ) {
            result = "Today, " + date.toLocaleTimeString( "en-US", { hour: '2-digit', minute: '2-digit' } );
        }
        else {
            const withinWeek = isDateInNext( date, null, null, 7, null, null, true, false );
            const options = { weekday: withinWeek ? 'long' : undefined, month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' };
            result = date.toLocaleString( "en-US", options );
        }
    }

    return result;
}


/*** BRACKET INTERACTION ***/


function registerChoice( matchId, isTop ) {
    if ( mode === "open" ) {
        let match = bracket.getMatchFromId( matchId );
        let winner = isTop ? match.top : match.bottom;
        const winnerChange = winner !== match.winner;
        match.winner = winner;

        if ( winnerChange ) {
            bracket.updateCurrent();

            let matchButtons = nm( getMatchId( match ) );
            for ( let i = 0; i < matchButtons.length; i++ ) {
                matchButtons[i].classList.remove( "blinkBorder" );
            }

            let next = bracket.getNextMatch( matchId );
            if ( next.match ) {
                updateMatch( next.match, match.winner, next.isTop );
                next = bracket.getNextMatch( getMatchId( next.match ) );

                while ( next.match ) {
                    updateMatch( next.match, null, next.isTop );
                    next = bracket.getNextMatch( getMatchId( next.match ) );
                }
            }
        }

        if ( ( display.isMobile && round < bracket.getCurrentRound() ) ||
             ( display.isLarge  && round < bracket.getCurrentRound() && round < ( bracket.getMaxRounds() - 2 ) ) ) {
            changeRound( "next" );
        }
    }
    else {
        //todo 5
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

function submit() {
    if ( isDateBeforeOrEqual( new Date(), endTime, true ) ) {
        if ( mode === "open" ) {
            let winner = bracket.getWinner();
            if ( winner ) {
                showMessage( "Winner",
                    "The winner is:<br/>" +
                    "<strong>" + winner.name + "!</strong><br/><br/>" +
                    "<img src='" + winner.image + "' alt='winner' style='height: 12em'>" );
            }
            else {
                showToaster( "Must complete bracket..." );
            }
        }
        else if ( mode === "round" ) {

        }
        else if ( mode === "match" ) {

        }
        else if ( mode === "poll" ) {

        }

        //viewResults();
    }
    else {
        showToaster( "This round has closed." );
    }
}


/*** RESULTS ***/


function viewResults() {
    //todo 6
}


/*** UTILITY ***/


function getMatchId( match )
{
    return "r" + match.round + "m" + match.match;
}

function getButtonIds( matchId )
{
    return [
        matchId + "T",
        matchId + "B"
    ];
}

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

function getImage() {
    let image = document.createElement( "IMG" );
    image.style.width = BUTTON_TEXT_HEIGHT;
    image.style.height = BUTTON_TEXT_HEIGHT;
    image.style.objectFit = "cover";
    return image;
}

function getButton() {
    let button = document.createElement( "BUTTON" );
    button.style.width = BUTTON_WIDTH;
    button.style.height = BUTTON_TEXT_HEIGHT;
    button.style.lineHeight = "100%";
    button.style.padding = BUTTON_PADDING;
    button.style.marginBottom = BUTTON_B_MARGIN;
    button.style.textAlign = "left";
    button.style.whiteSpace = "nowrap";
    button.classList.add( "button" );
    return button;
}

function isBracketAvailable( state ) {
    return state && state !== "hidden" && state !== "ready";
}

function setClickable( matchId ) {
    unfreezeRadioButtons( matchId );
    nm( matchId ).forEach( function( button ) { button.classList.add( "blinkBorder" ); } );
}

function adjustFontSize( roundDiv ) {
    let buttons = roundDiv.getElementsByTagName( "BUTTON" );

    const defaultStyle = getComputedStyle( buttons[0] );
    const defaultWidth = parseFloat( defaultStyle.width );
    const defaultFontSize = parseFloat( defaultStyle.fontSize );
    let minFontSize = defaultFontSize;
    for ( let i = 0; i < buttons.length; i++ ) {
        let button = buttons[i];
        let width = getFullWidth( button );
        if ( width > defaultWidth ) {
            const minSize = 12;
            for ( let size = defaultFontSize; size > minSize; size-- ) {
                button.style.fontSize = size + "px";
                width = getFullWidth( button );
                if ( width <= defaultWidth ) {
                    minFontSize = size < minFontSize ? size : minFontSize;
                    break;
                }
                if ( size - 1 === minSize ) {
                    button.innerHTML = button.innerHTML.substring( 0, 15 ) + "...";
                    minFontSize = size < minFontSize ? size : minFontSize;
                }
            }
        }
    }

    if ( minFontSize < defaultFontSize ) {
        for ( let i = 0; i < buttons.length; i++ ) {
            buttons[i].style.fontSize = minFontSize + "px";
        }
    }
}

function getFullWidth( button ) {
    button.style.width = "";
    let result = getComputedStyle( button ).width;
    button.style.width = BUTTON_WIDTH;
    return parseFloat( result );
}