function createTitleLogo( logoInfo, titleDiv, active, useSpecialHelp, logoLink ) {
    titleDiv.classList.add( "logoContainer" );

    let logoDiv = document.createElement( "DIV" );
    logoDiv.id = "logo";
    logoDiv.classList.add( "center" );
    logoDiv.classList.add( "logo" );
    logoDiv.style.backgroundImage = "url('" + logoInfo.image + "')";
    logoDiv.style.backgroundSize = "cover";
    logoDiv.style.backgroundPosition = "center";

    let titleSpan = document.createElement( "SPAN" );
    titleSpan.innerText = logoInfo.title;
    titleSpan.classList.add( "logoTitle" );
    logoDiv.appendChild( titleSpan );

    let helpDiv = document.createElement( "DIV" );
    helpDiv.id = "helpIcon";
    helpDiv.classList.add( "clickable" );

    let image = document.createElement( "IMG" );
    image.setAttribute( "src", logoInfo.helpImage );
    image.alt = "help";
    image.classList.add( "helpIcon" );
    helpDiv.appendChild( image );

    if ( useSpecialHelp ) {
        const showExampleInstructions = function() {
            showMessage( "Instructions",
                "Vote on entries to help find the winner for this bracket. Entries that are blinking are currently open for voting. Click &ldquo;Submit&rdquo; when finished." + "<br/><br/>" + logoInfo.help );
        };

        helpDiv.id = "help";
        helpDiv.onclick = showExampleInstructions;
    }

    titleDiv.appendChild( logoDiv );
    titleDiv.appendChild( helpDiv );

    if ( logoLink ) {
        let anchor = document.createElement( "A" );
        anchor.href = logoLink;
        anchor.classList.add( "clickable" );
        logoDiv.parentNode.insertBefore( anchor, logoDiv );
        anchor.appendChild( logoDiv );
    }

    if ( !active ) {
        logoDiv.style.filter = "grayscale(1)";
    }
}


/**********TIMING**********/


function updateBracketTiming( bracketId, bracketInfo, callback ) {
    let bracketUpdated = false;
    if ( bracketInfo.state === "active" || bracketInfo.state === "paused" )
    {
        const closeTime = newDateFromUTC( bracketInfo.timing.scheduledClose );
        if ( closeTime && isDateBefore( closeTime, new Date(), true ) ) {
            bracketUpdated = true;
            const isLastRound = bracketInfo.winners.length === bracketInfo.entries.length - 2;
            if ( isLastRound ) {
                bracketInfo.timing.scheduledClose = null;
                bracketInfo.state = "complete";

                //todo 10 - consolidate multiple DB calls one after another (service.php ?)
                // search throughout project
                $.post(
                    "php/database.php",
                    {
                        action: "setBracketState",
                        id:     bracketId,
                        state:  "complete"
                    },
                    function ( response ) {}
                );
            }
            else {
                bracketInfo.timing.scheduledClose = calculateNextTime( bracketInfo.timing, closeTime.toISOString() );
            }

            $.post(
                "php/database.php",
                {
                    action:     "updateVotingPeriod",
                    id:         bracketId,
                    time:       bracketInfo.timing.scheduledClose,
                    activeId:   getActiveId( bracket, mode )
                },
                function ( response ) {
                    $.post(
                        "php/database.php",
                        {
                            action: "getWinners",
                            id:     bracketId
                        },
                        function ( response ) {
                            bracketInfo.winners = JSON.parse( response );
                            callback( bracketId, bracketInfo );
                        }
                    );
                }
            );
        }
    }

    if ( !bracketUpdated ) {
        callback( bracketId, bracketInfo );
    }
}

function calculateNextTime( timingInfo, lastCloseTime = null ) {
    let result = null;

    if ( timingInfo.scheduledClose ) {
        result = newDateFromUTC( timingInfo.scheduledClose );
    }
    else if ( timingInfo.frequency ) {
        const isFirstRound = !lastCloseTime;
        const fromTime = newDateFromUTC( lastCloseTime ) || new Date();
        const frequencyPointInt = timingInfo.frequencyPoint ? parseInt(   timingInfo.frequencyPoint ) : 0;
        const frequencyPointDec = timingInfo.frequencyPoint ? parseFloat( timingInfo.frequencyPoint ) : 0;
        const frequency = timingInfo.frequency;

        switch (frequency) {
            case "hour":
                result = adjustHours( fromTime, 1 );
                result.setMinutes( frequencyPointInt );
                result = zeroSecondsAndBelow( result );
                break;
            case "1day":
            case "2days":
            case "3days":
            case "7days":
                let dayAdjust = parseInt( frequency );
                result = adjustDays( fromTime, dayAdjust );
                let min = frequencyPointDec > frequencyPointInt ? 30 : 0;
                result.setHours( frequencyPointInt, min );
                result = zeroSecondsAndBelow( result );
                break;
            case "week":
                result = adjustDayOfWeek( fromTime, frequencyPointInt );
                result = setToAlmostMidnight( result );
                break;
        }

        if ( isFirstRound ) {
            switch (frequency) {
                case "hour":
                    if ( isDateInNextHours( result, 1 ) ) {
                        result = adjustHours( result, 1 );
                    }
                    break;
                case "1day":
                case "2days":
                case "3days":
                case "7days":
                case "week":
                    if ( isDateInNextHours( result, 24 ) ) {
                        const dayAdjust = ( frequency === "week" ) ? 7 : 1;
                        result = adjustDays( result, dayAdjust );
                    }
                    break;
            }
        }
    }

    return result ? result.toISOString() : null;
}


/**********ID GENERATION**********/


function getMatchId( match )
{
    return "r" + match.round + "m" + match.match;
}

function getActiveId( bracket, mode )
{
    let result;
    switch ( mode )
    {
    case "match":
        result = bracket.getCurrentMatchId();
        break;
    case "round":
        result = "r" + bracket.getCurrentRound();
        break;
    default:
        result = "o";
    }
    return result;
}


/**********ERROR HANDLING**********/


function getErrorMessage( error ) {
    let result = "";

    if ( error ) {
        switch ( error ) {
        case "InvalidBracketId":
            result = "Invalid Bracket ID in URL.";
            break;
        case "DisabledBracket":
            result = "This Bracket is disabled.";
            break;
        default:
            result = "An error has occurred.";
        }
    }

    return result;
}
