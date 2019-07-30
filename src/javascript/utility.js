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

    if ( active && logoLink ) {
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

function getDisplayTime( date ) {
    let result = "";

    if ( date ) {
        const now = new Date();
        if ( date.toDateString() === now.toDateString() ) {
            result = "Today, " + date.toLocaleTimeString( "en-US", { hour: '2-digit', minute: '2-digit' } );
        }
        else {
            const withinWeek = date < new Date( now.getFullYear(), now.getMonth(), now.getDate() + 7 );
            const options = { weekday: withinWeek ? 'long' : undefined, month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' };
            result = date.toLocaleString( "en-US", options );
        }
    }

    return result;
}

function calculateNextTime( timingInfo ) {
    let result = newDateFromUTC( timingInfo.scheduledClose );

    if ( !result && timingInfo.frequency ) {
        const isFirstIteration = !(timingInfo.startTime);
        const fromTime = isFirstIteration ? new Date() : newDateFromUTC( timingInfo.startTime );
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
            default:
                result = new Date();
                break;
        }

        if ( isFirstIteration ) { //todo - could I adjust the fromTime instead of this?
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

    return result;
}


/**********ERROR HANDLING**********/


function getErrorMessage( error ) {
    let result = "";

    if ( error ) {
        switch ( error ) {
        case "InvalidBracketId":
            result = "Bracket ID must be present and must correspond to stored ID.";
            break;
        default:
            result = "An error has occurred.";
        }
    }

    return result;
}
