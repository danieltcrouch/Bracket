function createTitleLogo( logoInfo, exampleDiv ) {
    let titleDiv = exampleDiv || cl('title')[0];
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

    if ( exampleDiv ) {
        const showExampleInstructions = function() {
            showMessage( "Instructions",
            "Vote on entries to help find the winner for this bracket. Entries that are blinking are currently open for voting. Click &ldquo;Submit&rdquo; when finished." + "<br/><br/>" + logoInfo.help );
        };

        logoDiv.onclick = showExampleInstructions;
        helpDiv.onclick = showExampleInstructions;
    }
    else {
        let helpTextDiv = id('instructions');
        let helpText = helpTextDiv.innerHTML;
        helpTextDiv.innerHTML = helpText + "<br/><br/>" + logoInfo.help;
    }

    titleDiv.appendChild( logoDiv );
    titleDiv.appendChild( helpDiv );
}