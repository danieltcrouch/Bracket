let state = null;
let activeId = null;
let winners = "";
let currentVotes = "";

function initializeCreate() {
    let logoInfo = {
        title:     "Your Bracket",
        image:     "https://bracket.religionandstory.com/images/chess.jpg",
        helpImage: helpImage,
        help:      "Additional instructions will appear here."
    };
    createTitleLogo( logoInfo, id('exampleLogo'), true, true );
}

function initializeEdit( bracketId ) {
    $.post(
        "php/database.php",
        {
            action: "getBracket",
            id:     bracketId
        },
        function ( response ) {
            let bracketInfo = JSON.parse( response );
            bracketInfo.helpImage = helpImage;
            updateBracketTiming( bracketId, bracketInfo, initializeEditCallback );
        }
    );
}

function initializeEditCallback( bracketId, bracketInfo ) {

    //Fill-out page
    state = bracketInfo.state;
    activeId = bracketInfo.timing.activeId;
    winners = bracketInfo.winners;
    currentVotes = bracketInfo.currentVotes;
    id('titleInput').value = bracketInfo.title;
    id('imageInput').value = bracketInfo.image;
    id('helpInput').value = bracketInfo.help;
    id(bracketInfo.mode).click();
    if ( bracketInfo.mode !== "poll" ) {
        id('bracket').click();
    }
    id('frequency').value = bracketInfo.timing.frequency;
    updateFrequencyPoints();
    id('frequencyPoint').value = bracketInfo.timing.frequencyPoint;
    if ( bracketInfo.timing.scheduledClose ) {
        id('scheduledClose').valueAsNumber = getZonedTime( newDateFromUTC( bracketInfo.timing.scheduledClose ) );
    }
    id('entryCount').value = bracketInfo.entries.length;
    createEntryInputs();
    for ( let i = 0; i < bracketInfo.entries.length; i++ ) {
        id( i + "NameInput" ).value = bracketInfo.entries[i].name;
        id( i + "ImageInput" ).value = bracketInfo.entries[i].image;
    }
    previewLogo();

    //Disable Create-only fields
    //todo 7 - what if bracket is complete?
    id('titleInput').disabled = true;
    id('imageInput').disabled = true;
    freezeRadioButtons( "bracketType" );
    freezeRadioButtons( "votingType" );
    id('entryCount').disabled = true;

    id('save').style.display = "";
    id('create').style.display = "none";
    if ( state === "ready" ) {
        id('start').style.display = "";
    }
    else if ( state === "complete" ) {
        id('hide').style.display = "";
    }
    else {
        id('pause').style.display = "";
        id('close').style.display = "";
    }
}

function setBracketType( bracketType ) {
    id('bracketSettings').style.display = ( bracketType === "bracket" ) ? "block" : "none";

    if ( bracketType === "bracket" ) {
        setVotingType( getSelectedRadioButtonId( "votingType" ) );
    }
    else {
        displayTimingSettings( false, true );
    }

    id('entryDiv').style.display = "block";
}

function setVotingType( bracketRoundType ) {
    if ( bracketRoundType === "match" ) {
        displayTimingSettings( true, false );
    }
    else if ( bracketRoundType === "round" ) {
        displayTimingSettings( true, false );
    }
    else if ( bracketRoundType === "open" ) {
        displayTimingSettings( false, true );
    }
    else {
        displayTimingSettings( false, false );
    }
}

function displayTimingSettings( displayFrequency, displayScheduledClose ) {
    id('frequencySettings').style.display = displayFrequency ? "block" : "none";
    id('scheduleSettings').style.display = displayScheduledClose ? "block" : "none";
}

function updateFrequencyPoints() {
    let options = [];
    let frequency = getSelectedOptionValue( 'frequency' );
    if ( frequency ) {
        switch ( frequency ) {
            case "X":
                options.push( {text: "--", value: "X"} );
                break;
            case "hour":
                for ( let min = 0; min < 60; min++ ) {
                    options.push( {text: min + "", value: min + ""} );
                }
                break;
            case "1day":
            case "2days":
            case "3days":
            case "7days":
                for ( let hour = 0; hour < 24; hour++ ) {
                    let hourDisplay = ("0" + hour).slice( -2 );
                    options.push( {text: hourDisplay + ":00", value: hour + ""} );
                    options.push( {text: hourDisplay + ":30", value: hour + ".5"} );
                }
                break;
            case "week":
                for ( let dayIndex = 0; dayIndex < DAYS_OF_WEEK.length; dayIndex++ ) {
                    options.push( {text: "Midnight " + DAYS_OF_WEEK[dayIndex], value: dayIndex + ""} );
                }
                break;
        }

        addAllToSelect( 'frequencyPoint', options );
    }
}

function submitEntryCount( e ) {
    if ( e.which === 13 || e.keyCode === 13 ) {
        createEntryInputs();
    }
}

function createEntryInputs() {
    let div = id('entryDiv');

    let entryCount = id('entryCount').value;
    if ( entryCount <= 128 ) {
        let currentCount = nm( 'entryNames' ).length;
        entryCount -= currentCount;

        if ( entryCount > 0 ) {
            for ( let i = 0; i < entryCount; i++ ) {
                let entryDiv = document.createElement( "DIV" );
                let nameInput = document.createElement( "INPUT" );
                let imageInput = document.createElement( "INPUT" );
                nameInput.id = i + "NameInput";
                imageInput.id = i + "ImageInput";
                nameInput.style.width = "45%";
                imageInput.style.width = "45%";
                nameInput.style.margin = ".5em";
                imageInput.style.margin = ".5em";
                nameInput.classList.add( "input" );
                imageInput.classList.add( "input" );
                nameInput.setAttribute( "name", "entryNames" );
                imageInput.setAttribute( "name", "entryImages" );
                nameInput.setAttribute( "placeholder", "Entry Name" );
                imageInput.setAttribute( "placeholder", "Image URL" );
                entryDiv.appendChild( nameInput );
                entryDiv.appendChild( imageInput );
                div.appendChild( entryDiv );
            }
        }
        else if ( entryCount < 0 ) {
            for ( let i = 0; i < -entryCount; i++ ) {
                div.removeChild( div.lastChild );
            }
        }
    }
    else {
        showToaster( "Entry count must be below 128" );
    }
}


/**********PREVIEW**********/


function validate() {
    let error = validateLogo();

    if ( !error ) {
        const isBracket = getSelectedRadioButtonId('bracketType') === "bracket";
        const entryNamesFilled = nm( 'entryNames' ).map( e => e.value ).filter( n => !n ).length > 0;
        const entryNamesLength = nm( 'entryNames' ).map( e => e.value ).filter( n => n.length > 20 ).length > 0;
        const entryImagesLength = nm( 'entryImages' ).map( e => e.value ).filter( i => i.length > 256 ).length > 0;

        if ( isBracket && !getSelectedRadioButtonId('votingType') ) {
            error = "Voting type required: match, round, or open.";
        }
        else if ( !entryNamesFilled ) {
            error = "Entry names required.";
        }
        else if ( !entryNamesLength ) {
            error = "Entry name length too long. (Max of 20 characters)";
        }
        else if ( !entryImagesLength ) {
            error = "Entry image length too long. (Max of 256 characters)";
        }
    }

    return error;
}

function validateLogo() {
    let error = null;

    if ( !id('imageInput').value ) {
        error = "Image required.";
    }
    else if ( id('titleInput').value.length > 20 ) {
        error = "Title length too long. (Max of 20 characters)";
    }
    else if ( id('imageInput').value.length > 256 ) {
        error = "Image length too long. (Max of 256 characters)";
    }
    else if ( id('helpInput').value.length > 512 ) {
        error = "Help length too long. (Max of 512 characters)";
    }

    return error;
}

function previewLogo() {
    const error = validateLogo();
    if ( !error ) {
        let exampleDiv = id('exampleLogo');
        while ( exampleDiv.firstChild ) {
            exampleDiv.removeChild( exampleDiv.firstChild );
        }
        createTitleLogo( getLogoData(), exampleDiv, true, true );
    }
    else {
        showToaster( error );
    }
}

function previewBracket() {
    const error = validate();
    if ( !error ) {
        let bracket = getBracketData();
        bracket.active = true;
        bracket.timing.scheduledClose = adjustToUTC( bracket.timing.scheduledClose );
        id('bracketData').value = JSON.stringify( bracket );
        id('previewForm').submit();
    }
    else {
        showToaster( error );
    }
}


/**********GENERAL**********/


function create() {
    const error = validate();
    if ( !error ) {
        $.post(
            "php/database.php",
            {
                action:  "createBracket",
                bracket: JSON.stringify( getBracketData() )
            },
            function ( response ) {
                window.location = "https://bracket.religionandstory.com/edit.php?id=" + JSON.parse( response );
            }
        );
    }
    else {
        showToaster( error );
    }
}

function save() {
    const error = validate();
    if ( !error ) {
        let bracketInfo = getBracketData();
        bracketInfo.id = bracketId;
        $.post(
            "php/database.php",
            {
                action:  "updateBracket",
                bracket: JSON.stringify( bracketInfo )
            },
            function ( response ) {
                showToaster( "Saved." );
            }
        );
    }
    else {
        showToaster( error );
    }
}

function load() {
    $.post(
        "php/database.php",
        {
            action: "getAllBracketMetas"
        },
        function ( response ) {
            const html = constructEditLinks( JSON.parse( response) );
            showMessage( "Choose a Bracket", html );
        }
    );
}

function constructEditLinks( brackets ) {
    let result = "";
    for ( let i = 0; i < brackets.length; i++ )
    {
        const bracket = brackets[i];
        const isDuplicate = brackets.filter( b => b.title === bracket.title && b.date !== bracket.date ).length > 0;
        const title = bracket.title + (isDuplicate ? "(" + new Date( bracket.date ) + ")" : "");
        result += "<a href='https://bracket.religionandstory.com/edit.php?id=" + bracket.id + "' class='link'>" + title + "</a><br/>";
    }
    result += "<a href='https://bracket.religionandstory.com/edit.php' class='link'>Create New Bracket</a><br/>";
    return result;
}

function review() {
    let closeTime = getDisplayTime( new Date( id( 'scheduledClose' ).value ) );
    let additionalInfo = "<br/> <emphasis>State:</emphasis> " + state +
        "<br/> <emphasis>Active ID:</emphasis> " + activeId +
        "<br/> <emphasis>Round Ends:</emphasis> " + closeTime;
    viewResults( getMode(), getEntries(), currentVotes, additionalInfo );
}

function pause() {
    showBinaryChoice(
        "Pause",
        "Pause voting or pause automatic close?", "Voting", "Closing",
        function( answer ) {
            if ( answer )
            {
                pauseVoting();
            }
            else
            {
                pauseClosing();
            }
        }
    );
}

function pauseVoting() {
    const stateToBe = state === "active" ? "paused" : "active";
    $.post(
        "php/database.php",
        {
            action:     "setBracketState",
            id:         bracketId,
            state:      stateToBe
        },
        function ( response ) {
            showToaster( "Bracket is now " + stateToBe );
            state = stateToBe;
        }
    );
}

function pauseClosing() {
    $.post(
        "php/database.php",
        {
            action:     "setCloseTime",
            id:         bracketId,
            time:       null
        },
        function ( response ) {
            showToaster( "Bracket will close when you tell it to..." );
        }
    );
}

function start() {
    $.post(
        "php/database.php",
        {
            action:     "startBracket",
            id:         bracketId,
            time:       calculateNextTime( getTiming() )
        },
        function ( response ) {
            showToaster( "Bracket started... " );
        }
    );
}

function close() {
    //todo 7
    // $.post(
    //     "php/database.php",
    //     {
    //         action:     "setBracketState",
    //         id:         bracketId,
    //         state:      "complete"
    //     },
    //     function ( response ) {
    //         showToaster( "Bracket is now " + stateToBe );
    //     }
    // );
}

function hide() {
    $.post(
        "php/database.php",
        {
            action:     "setBracketState",
            id:         bracketId,
            state:      "hidden"
        },
        function ( response ) {
            window.location = "https://bracket.religionandstory.com/";
        }
    );
}


/**********PARSE**********/


function getLogoData() {
    return {
        title:     id( 'titleInput' ).value,
        image:     id( 'imageInput' ).value,
        help:      id( 'helpInput' ).value,
        helpImage: id( 'helpIcon' ).src
    };
}

function getBracketData() {
    const logoData = getLogoData();
    let mode = getMode();

    return {
        title:     logoData.title,
        image:     logoData.image,
        state:     state,
        help:      logoData.help,
        helpImage: logoData.helpImage,
        mode:      mode,
        entries:   getEntries(),
        winners:   "",
        timing:   getTiming()
    };
}

function getMode() {
    return getSelectedRadioButtonId('bracketType') === "bracket" ? getSelectedRadioButtonId('votingType') : getSelectedRadioButtonId('bracketType');
}

function getTiming() {
    let scheduledClose = id('scheduleSettings').style.display !== "none" ? id( 'scheduledClose' ).value : null;
    scheduledClose = scheduledClose ? new Date( scheduledClose ).toISOString() : null;
    let frequency      = id('frequencySettings').style.display !== "none" ? getSelectedOptionValue( 'frequency' )      : null;
    let frequencyPoint = id('frequencySettings').style.display !== "none" ? getSelectedOptionValue( 'frequencyPoint' ) : null;
    frequency      = frequency      === "X" ? null : frequency;
    frequencyPoint = frequencyPoint === "X" ? null : frequencyPoint;

    return {
        frequency:      frequency,
        frequencyPoint: frequencyPoint,
        scheduledClose: scheduledClose
    };
}

function getEntries() {
    let entries = [];
    let entryInputs = nm('entryNames');
    let imageInputs = nm('entryImages');
    for ( let i = 0; i < entryInputs.length; i++ ) {
        if ( entryInputs[i].value ) {
            entries.push( {name: entryInputs[i].value, image: imageInputs[i].value, seed: i} );
        }
    }

    return entries;
}