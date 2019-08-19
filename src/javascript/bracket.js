//todo 9 - Clean Common repo and custom css files in projects
//todo 9 - set standards for this and future projects

let bracket;
let round;
let state;
let mode;
let endTime;
let currentVotes;


/*** DISPLAY ***/


const BUTTON_WIDTH       = "12rem";
const BUTTON_TEXT_HEIGHT = "3rem";
const BUTTON_PADDING     = ".5rem";
const BUTTON_B_MARGIN    = ".75rem";
const MATCH_B_MARGIN     = "1.5rem";
const TOTAL_MATCH_HEIGHT = "7.5rem"; //(BUTTON_TEXT_HEIGHT + BUTTON_B_MARGIN) * 2

function getBracketInfo( bracketId ) {
    $.post(
        "php/database.php",
        {
            action: "getBracket",
            id:     bracketId
        },
        function ( response ) {
            let bracketInfo = JSON.parse( response );
            updateBracketTiming( bracketId, bracketInfo, loadPage );
        }
    );
}

function loadPage( bracketId, bracketInfo ) {
    if ( bracketId && bracketInfo && isBracketAvailable( bracketInfo.state ) ) {
        bracketInfo.helpImage = helpImage;
        createTitleLogo( bracketInfo, cl('title')[0], bracketInfo.state === "active", true );

        state = bracketInfo.state;
        mode = bracketInfo.mode;
        if ( mode === "poll" ) {
            bracket = new Poll( bracketInfo.entries, bracketInfo.winners );
            bracket.isPoll = true;
            displayPoll( bracket );
        }
        else {
            bracket = new Bracket( bracketInfo.entries, bracketInfo.winners );
            bracket.isBracket = true;
            displayBracket( bracket );
        }

        endTime = newDateFromUTC( bracketInfo.timing.scheduledClose );
        displayRoundTimer();
        currentVotes = bracketInfo.currentVotes;
    }
    else {
        window.location = "https://bracket.religionandstory.com/index.php?error=InvalidBracketId";
    }
}


/*** TIMER DISPLAY ***/


function displayRoundTimer() {
    let timerSpan = id('roundTimer');
    if ( state !== "active" ) {
        timerSpan.innerText = "(" + state.charAt(0).toUpperCase() + state.slice(1) + ")";
        id( 'bracketDisplay' ).style.display = "none";
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


/*** SUBMIT ***/


function submit() {
    if ( !endTime || isDateBeforeOrEqual( new Date(), endTime, true ) ) {
        let votes = bracket.isBracket ? getBracketVotes() : getPollVotes();
        if ( votes ) {
            saveVote( votes );
        }
    }
    else {
        showToaster( "This round has closed." );
    }
}

function saveVote( votes ) {
    $.post(
        "php/database.php",
        {
            action: "vote",
            id:     bracketId,
            votes:  votes
        },
        function ( response ) {
            response = JSON.parse( response );
            if ( response.isSuccess ) {
                showToaster( "Votes submitted." );
                //todo 6 - viewResults();
            }
            else {
                showToaster( response.message );
            }
        }
    );
}


/*** RESULTS ***/


function viewResults() {
    let voteDisplay = bracket.isBracket ? getBracketVoteDisplay( currentVotes ) : getPollVoteDisplay( currentVotes );
    showMessage( "Current Votes", voteDisplay );
    //todo 6 - give dynamic graphic
    //todo 6 - there needs to be a way to see this even when inactive
}


/*** UTILITY ***/


function isBracketAvailable( state ) {
    return state && state !== "hidden" && state !== "ready";
}

function hideMobileDisplay() {
    cl( 'mobileDisplay' )[0].style.display = "none";
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