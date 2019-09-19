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
                "Vote on choices to help find the winner for this survey. Choices that are blinking are currently open for voting. Click &ldquo;Submit&rdquo; when finished." + "<br/><br/>" + logoInfo.help );
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

function getWinners( votes ) {
    return votes.map( cs => { return {
        choiceSetId: cs.id,
        choiceId:    cs.choices.reduce( (maxChoice,choice) => (maxChoice.count > choice.count) ? maxChoice : choice ).id
    }; } );
}

function getActiveId( survey, type, mode )
{
    return ( type === "bracket" ) ? Bracket.getActiveId( survey, mode ) : "";
}


/**********TIMING**********/


function updateSurveyTiming( surveyId, surveyInfo, callback ) {
    let isSessionOver = false;
    if ( isInProgress( surveyInfo.state ) )
    {
        const closeTime = newDate( surveyInfo.timing.scheduledClose );
        isSessionOver = closeTime && isDateBefore( closeTime, new Date(), true );
        if ( isSessionOver ) {
            let tempSurvey = getBracketOrPoll( surveyInfo.type, surveyInfo.choices, surveyInfo.winners );
            tempSurvey.addWinners( getWinners( surveyInfo.currentVotes ) );

            const isLastSession = tempSurvey.isFinished();
            if ( isLastSession ) {
                surveyInfo.timing.scheduledClose = null;
                surveyInfo.state = "complete";
            }

            surveyInfo.winners = tempSurvey.getSerializedWinners();
            surveyInfo.timing.activeId = isLastSession ? null : getActiveId( tempSurvey, surveyInfo.type, surveyInfo.mode );
            surveyInfo.timing.scheduledClose = calculateNextTime( surveyInfo.timing, closeTime );

            $.post(
                "php/controller.php",
                {
                    action:     "updateVotingSession",
                    id:         surveyId,
                    state:      surveyInfo.state,
                    time:       surveyInfo.timing.scheduledClose,
                    activeId:   surveyInfo.timing.activeId,
                    winners:    surveyInfo.winners
                },
                function ( response ) {
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

        result = isDateAfter( result, adjustMinutes( new Date(), 5 ), true ) ? result : calculateNextTime( timingInfo, new Date() );
    }
    else if ( isStartTime && timingInfo.scheduledClose ) {
        result = newDate( timingInfo.scheduledClose );
        result = isDateAfter( result, adjustMinutes( new Date(), 5 ), true ) ? result : null;
    }

    return (result instanceof Date) ? result.toISOString() : null;
}

function calculateStartActiveId( type, mode, size )
{
    let result = "";
    if ( type === "bracket" ) {
        switch( mode ) {
            case "match":
                let maxSize = Bracket.getMagnitude( size );
                result = size < maxSize ? "r0m1" : "r0m0";
                break;
            case "round":
                result = "r0";
                break;
        }
    }
    return result;
}


/*** RESULTS ***/


function reviewSurvey( state, matchTitles, choices, votes, additionalInfo ) {
    if ( isFinished( state ) ) {
        reviewComplete( choices, votes, additionalInfo );
    }
    else {
        reviewCurrent( matchTitles, choices, votes, additionalInfo );
    }
}

function reviewComplete( choices, finalVotes, additionalInfo ) {
    let voteDisplay = getCompleteVoteDisplay( choices, finalVotes );
    let display = additionalInfo ? voteDisplay + "<br/>" + additionalInfo : voteDisplay;
    view( "Results", display );
}

function getCompleteVoteDisplay( choices, finalVotes ) {
    let result = "";
    if ( choices && finalVotes ) {
        result = getChoiceSetVoteDisplay( "Finals", choices, finalVotes[0] );
    }
    return result;
}

function reviewCurrent( matchTitles, choices, currentVotes, additionalInfo ) {
    let voteDisplay = getCurrentVoteDisplay( matchTitles, choices, currentVotes );
    let display = additionalInfo ? voteDisplay + "<br/>" + additionalInfo : voteDisplay;
    view( "Current Votes", display );
}

function getCurrentVoteDisplay( matchTitles, choices, currentVotes ) {
    let result = "No current votes...";
    if ( choices && currentVotes ) {
        result = "";
        const isSingle = currentVotes.length === 1;
        for ( let i = 0; i < currentVotes.length; i++) {
            let currentVoteSet = currentVotes[i];
            let title = isSingle ? "Current" : matchTitles.find( m => m.id === currentVoteSet.id ).title;
            result += getChoiceSetVoteDisplay( title, choices, currentVoteSet );
            result += "<br/>";
        }
    }
    return result;
}

function view( title, display ) {
    showMessage( title, display );
    animateChoices();
}

function getChoiceSetVoteDisplay( title, choices, currentVoteSet ) {
    return "<strong>" + title + ": </strong><br/>\n" +
        currentVoteSet.choices.map( set => {
            let choiceName = choices.find( c => c.id === set.id ).name;
            return "<div class='progressBar' style='width: 0%'>" +
                "<span style='white-space: nowrap;'>" + choiceName + "</span>" +
                "<span style='display: none; float: right;'>" +  set.count + "</span>" +
                "</div>"
        } ).join( "\n" );
}

function animateChoices() {
    let elements = cl('progressBar');
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

function isFinished( state ) {
    return state === "complete";
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
