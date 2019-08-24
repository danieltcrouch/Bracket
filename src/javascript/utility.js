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
                "Vote on entries to help find the winner for this survey. Choices that are blinking are currently open for voting. Click &ldquo;Submit&rdquo; when finished." + "<br/><br/>" + logoInfo.help );
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


/**********FUNCTIONALITY**********/


function getBracketOrPoll( type, choices, winners ) {
    return ( type === "bracket" ) ? Bracket.createBracket( choices, winners ) : Poll.createPoll( choices, winners );
}

function getWinners( survey, votes ) {
    let answers = votes.map( cs => { return {
        choiceSetId: cs.id,
        choiceId:    cs.entries.reduce( (a,b) => (a.y > b.y) ? a : b ).id
    }; } );
    survey.setAnswers( answers )
    return ( survey instanceof Bracket ) ? survey.getSerializedWinners() : survey.getWinner().getIndex();
}

function getActiveId( survey, mode )
{
    let result = "";
    switch ( mode )
    {
    case "match":
        result = survey.getCurrentMatch().getId();
        break;
    case "round":
        result = "r" + survey.getCurrentRoundIndex();
        break;
    }
    return result;
}


/**********TIMING**********/


function updateSurveyTiming( surveyId, surveyInfo, callback ) {
    let isSessionOver = false;
    if ( isInProgress( surveyInfo.state ) )
    {
        const closeTime = newDateFromUTC( surveyInfo.timing.scheduledClose );
        isSessionOver = closeTime && isDateBefore( closeTime, new Date(), true );
        if ( isSessionOver ) {
            let tempSurvey = getBracketOrPoll( surveyInfo.type, surveyInfo.entries, surveyInfo.winners );
            surveyInfo.timing.scheduledClose = calculateNextTime( surveyInfo.timing, closeTime );
            surveyInfo.activeId = getActiveId( tempSurvey, surveyInfo.mode );
            surveyInfo.winners = getWinners( tempSurvey, surveyInfo.currentVotes );

            const isLastSession = surveyInfo.winners && surveyInfo.winners.length === surveyInfo.entries.length - 2;
            if ( isLastSession ) {
                surveyInfo.timing.scheduledClose = null;
                surveyInfo.state = "complete";
            }

            $.post(
                "php/database.php",
                {
                    action:     "updateVotingSession",
                    id:         surveyId,
                    time:       surveyInfo.timing.scheduledClose,
                    state:      surveyInfo.state,
                    activeId:   surveyInfo.activeId,
                    winners:    surveyInfo.winners
                },
                function () {
                    callback( surveyId, surveyInfo );
                }
            );
        }
    }

    if ( !isSessionOver ) {
        callback( surveyId, surveyInfo );
    }
}

function calculateStartTime( timingInfo ) {
    return calculateNextTime( timingInfo );
}

function calculateNextTime( timingInfo, lastCloseTime ) {
    let result = null;
    const isStartTime = !lastCloseTime;

    if ( timingInfo.frequency ) {
        const fromTime = isStartTime ? new Date() : lastCloseTime;
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

        if ( isStartTime ) {
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
    else if ( isStartTime && timingInfo.scheduledClose ) {
        result = newDateFromUTC( timingInfo.scheduledClose );
        result = isDateAfter( result, adjustMinutes( new Date(), 1 ), true ) ? result : null;
    }

    return (result instanceof Date) ? result.toISOString() : null;
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


/*** RESULTS ***/


function viewResults( choices, currentVotes, additionalInfo ) {
    let voteDisplay = getVoteDisplay( choices, currentVotes );
    voteDisplay = additionalInfo ? voteDisplay + "<br/>" + additionalInfo : voteDisplay;
    showMessage( "Current Votes", voteDisplay );
    animateChoices()
}

function getVoteDisplay( choices, currentVotes ) {
    let result = "";
    for ( let i = 0; i < currentVotes.length; i++) {
        result += currentVotes[i].choices.map( choice => {
            return "<div class='progressBar' style='width: 0%'>" +
                "<span style='white-space: nowrap;'>" + choices[choice.seed].name + "</span>" +
                "<span style='display: none; float: right;'>" +  choice.count + "</span>" +
                "</div>"
        } ).join( "\n" );
        result += "<br/>";
    }
    return result;
}

function animateChoices() {
    let elements = Array.from( cl('progressBar') );
    let counts = elements.map( e => e.getElementsByTagName( "SPAN" )[1].innerText );
    let maxCount = Math.max( ...counts );
    for ( let i = 0; i < elements.length; i++) {
        const count = counts[i];
        const width = "+=" + (count / maxCount * 100) + "%";
        $( elements[i] ).animate({ width: width }, 1000);
    }
}


/**********STATE**********/


function isEditable( state ) {
    return state === "active";
}

function isInProgress( state ) {
    return state === "active" || state === "paused";
}

function isVisible( state ) {
    return state === "active" || state === "paused" || state === "complete";
}


/**********ERROR HANDLING**********/


function getErrorMessage( error ) {
    let result = "";

    if ( error ) {
        switch ( error ) {
        case "InvalidSurveyId":
            result = "Invalid Survey ID in URL.";
            break;
        case "DisabledSurvey":
            result = "This Survey is disabled.";
            break;
        default:
            result = "An error has occurred.";
        }
    }

    return result;
}
