function createTitleLogo( logoInfo, titleDiv, active, useSpecialHelp, logoClickHandler ) {
    titleDiv.classList.add( "logoContainer" );

    let logoDiv = document.createElement( "DIV" );
    logoDiv.id = "logo";
    logoDiv.classList.add( "center" );
    logoDiv.classList.add( "logo" );
    logoDiv.style.backgroundImage = "url('" + logoInfo.image + "')";
    logoDiv.style.backgroundSize = "cover";
    logoDiv.style.backgroundPosition = "center";

    if ( active && logoClickHandler ) {
        logoDiv.classList.add( "clickable" );
        logoDiv.onclick = logoClickHandler;
    }

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

//todo - test this heavily
//todo - timezone differences
function calculateNextTime( frequency, frequencyPoint, fromTime ) {
    let result = new Date();

    let day = null;
    let hour = null;
    let min = null;
    const fpInt = frequencyPoint ? parseInt( frequencyPoint ) : 0;
    const fpFloat = frequencyPoint ? parseFloat( frequencyPoint ) : 0;

    const hourMS = 60 * 60 * 1000;
    const dayMS  = 24 * hourMS;
    const oneHourFromNow = new Date( fromTime.getTime() + hourMS );
    const oneDayFromNow  = new Date( fromTime.getTime() + dayMS );

    const isFirstIteration = !(fromTime);
    frequency = frequency || "X";
    fromTime = fromTime || new Date();

    switch (frequency) {
        case "hour":
            hour = fromTime.getHours() + 1;
            result.setHours( hour, fpInt, 0, 0 );
            break;
        case "day":
        case "2days":
        case "3days":
        case "7days":
            day = parseInt( frequency );
            result.setDate( fromTime.getDate() + day );
            hour = fpInt;
            min = fpFloat > fpInt ? 30 : 0;
            result.setHours( hour, min, 0, 0 );
            break;
        case "week":
            day = (fpInt + (7 - fromTime.getDay())) % 7;
            result.setDate( fromTime.getDate() + day );
            result.setHours( 23, 59, 59, 0 );
            break;
        case "X":
        case "custom":
        default:
            result = null;
            break;
    }

    let dayAdjust = null;
    if ( isFirstIteration ) {
        switch (frequency) {
            case "hour":
                if ( result < oneHourFromNow ) {
                    result.setHours( result.getHours() + 1, result.getMinutes(), 0, 0 );
                }
                break;
            case "day":
            case "2days":
            case "3days":
            case "7days":
                dayAdjust = 1;
            case "week":
                dayAdjust = dayAdjust || 7;
                if ( result < oneDayFromNow ) {
                    result.setDate( result.getDate() + dayAdjust );
                    result.setHours( result.getHours(), result.getMinutes(), 0, 0 );
                }
                break;
            default:
                break;
        }
    }

    return result;
}


/**********ERROR HANDLING**********/


function getErrorMessage( error ) {
    let result = "";

    if ( error ) {
        switch ( error ) {
        case "NoBracketId":
            result = "Must have a Bracket ID to view the bracket page.";
            break;
        default:
            result = "An error has occurred.";
        }
    }

    return result;
}
