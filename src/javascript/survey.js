//todo 9 - Clean Common repo and custom css files in projects
//todo 9 - set standards for this and future projects

let survey;
let round;
let state;
let mode;
let activeId;
let endTime;
let display;
let currentVotes;


/*** DISPLAY ***/


const BUTTON_WIDTH       = "12rem";
const BUTTON_TEXT_HEIGHT = "3rem";
const BUTTON_PADDING     = ".5rem";
const BUTTON_B_MARGIN    = ".75rem";
const MATCH_B_MARGIN     = "1.5rem";
const TOTAL_MATCH_HEIGHT = "7.5rem"; //(BUTTON_TEXT_HEIGHT + BUTTON_B_MARGIN) * 2

function getSurveyInfo( surveyId ) {
    $.post(
        "php/database.php",
        {
            action: "getSurvey",
            id:     surveyId
        },
        function ( response ) {
            let surveyInfo = JSON.parse( response );
            updateSurveyTiming( surveyId, surveyInfo, loadPage );
        }
    );
}

function loadPage( surveyId, surveyInfo ) {
    if ( surveyId && surveyInfo && isVisible( surveyInfo.state ) ) {
        surveyInfo.helpImage = helpImage;
        createTitleLogo( surveyInfo, cl('title')[0], surveyInfo.state === "active", true );

        survey = getBracketOrPoll( surveyInfo.type, surveyInfo.choices, surveyInfo.winners );
        state = surveyInfo.state;
        mode = surveyInfo.mode;
        activeId = surveyInfo.timing.activeId;
        endTime = getDateOrNull( surveyInfo.timing.scheduledClose );
        currentVotes = surveyInfo.currentVotes;

        isSurveyBracket() ? displayBracket() : displayPoll();
        displayRoundTimer();
    }
    else {
        window.location = "https://bracket.religionandstory.com/index.php?error=InvalidSurveyId";
    }
}


/*** TIMER DISPLAY ***/


function displayRoundTimer() {
    let timerSpan = id('roundTimer');
    if ( !isEditable( state ) ) {
        timerSpan.innerText = "(" + capitalize( state ) + ")";
        id( 'surveyDisplay' ).style.display = "none";
        id( 'submit' ).style.display = "none";
    }
    else if ( endTime ) {
        const displayTime = getDisplayTime( endTime );
        timerSpan.style.display = "block";
        timerSpan.innerHTML = "<span style='font-weight: bold;'>Round Ends:</span> " + displayTime;
    }
}


/*** SUBMIT ***/


function submit() {
    if ( surveyId !== "PREVIEW" ) {
        if ( !endTime || isDateBeforeOrEqual( new Date(), endTime, true ) ) {
            let votes = isSurveyBracket() ? getBracketVotes() : getPollVotes();
            if ( votes ) {
                saveVote( votes );
            }
        }
        else {
            showToaster( "This round has closed." );
        }
    }
    else {
        showToaster( "Cannot submit votes from preview." );
    }
}

function saveVote( votes ) {
    $.post(
        "php/database.php",
        {
            action: "vote",
            id:     surveyId,
            votes:  votes
        },
        function ( response ) {
            response = JSON.parse( response );
            if ( response.isSuccess ) {
                showToaster( "Votes submitted." );
                updateVotes();
            }
            else {
                showToaster( response.message );
            }
        }
    );
}


/*** RESULTS ***/


function updateVotes() {
    $.post(
        "php/database.php",
        {
            action: "getCurrentVotes",
            id:     surveyId
        },
        function ( response ) {
            currentVotes = JSON.parse( response );
            review();
        }
    );
}

function review() {
    let additionalInfo = ""; //todo 11 - allow users to subscribe
    viewResults( survey.getAllChoices().map( c => c.getName() ), currentVotes, additionalInfo );
}


/*** UTILITY ***/


function isSurveyBracket() {
    return ( survey instanceof Bracket );
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

function setClickable( buttonGroupId ) {
    unfreezeRadioButtons( buttonGroupId );
    nm( buttonGroupId ).forEach( function( button ) { button.classList.add( "blinkBorder" ); } );
}

function adjustFontSize( verticalDiv ) {
    let buttons = verticalDiv.getElementsByTagName( "BUTTON" );

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