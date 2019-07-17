function createTitleLogo( logoInfo, titleDiv ) {
    titleDiv.classList.add( "logoContainer" );

    let logoDiv = document.createElement( "DIV" );
    logoDiv.id = "logo";
    logoDiv.classList.add( "clickable" );
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
    helpDiv.id = "help";
    helpDiv.classList.add( "clickable" );

    let image = document.createElement( "IMG" );
    image.setAttribute( "src", logoInfo.helpImage );
    image.alt = "help";
    image.classList.add( "helpIcon" );
    helpDiv.appendChild( image );

    //if ( exampleDiv ) {
    //    const showExampleInstructions = function() {
    //        showMessage( "Instructions",
    //        "Vote on entries to help find the winner for this bracket. Entries that are blinking are currently open for voting. Click &ldquo;Submit&rdquo; when finished." + "<br/><br/>" + logoInfo.help );
    //    };

    //    logoDiv.onclick = showExampleInstructions;
    //    helpDiv.onclick = showExampleInstructions;
    //}
    //else {
    //    let helpTextDiv = id('helpText');
    //    let helpText = helpTextDiv.innerHTML;
    //    helpTextDiv.innerHTML = helpText + "<br/><br/>" + logoInfo.help;
    //}

    titleDiv.appendChild( logoDiv );
    titleDiv.appendChild( helpDiv );
}

function getDisplayTime( date ) {
    let result = "";

    if ( date ) {
        const now = new Date();
        const withinWeek = date < new Date( now.getFullYear(), now.getMonth(), now.getDate() + 7 );
        const options = { weekday: withinWeek ? 'long' : undefined, month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' };
        result = date.toLocaleString( "en-US", options );
    }

    return result;
}

function calculateNextTime( frequency, frequencyPoint ) {
    let result = new Date();
    const now = new Date();

    let day = null;
    let hour = null;
    let min = null;
    const fpInt = parseInt( frequencyPoint );
    const fpFloat = parseFloat( frequencyPoint );
    const hourMS = 60 * 60 * 1000;

    switch ( frequency ) {
       case "hour":
            hour = now.getHours() + 1;
            min = fpInt;
            result.setHours( hour, min, 0, 0 );
            if ( result < new Date( now.getTime() + hourMS ) ) {
                result.setHours( result.getHours() + 1, min, 0, 0 );
            }
            break;
        case "day":
            day = day || 1;
        case "2days":
            day = day || 2;
        case "3days":
            day = day || 3;
        case "7days":
            day = day || 7;
            result.setDate( now.getDate() + day );
            hour = fpInt;
            min = fpFloat > fpInt ? 30 : 0;
            result.setHours( hour, min, 0, 0 );
            break;
        case "week":
            result.setDate( now.getDate() + ( fpInt + ( 7 - now.getDay() ) ) % 7 );
            result.setHours( 23, 59, 59, 0 );
            break;
        case "X":
        case "custom":
        default:
            result = null;
            break;
    }

    return result;
}
