function setBracketType( bracketType ) {
    id('bracketSettings').style.display = ( bracketType === "bracket" ) ? "block" : "none";

    if ( bracketType === "poll" ) {
        displayTimingSettings( false, true );
    }

    id('entryDiv').style.display = "block";
}

function setBracketRoundType( bracketRoundType ) {
    if ( bracketRoundType === "match" ) {
        id('frequencySettings').style.display = "block";
        displayTimingSettings( true, false );
    }
    else if ( bracketRoundType === "round" ) {
        id('frequencySettings').style.display = "block";
        displayTimingSettings( true, false );
    }
    else if ( bracketRoundType === "open" ) {
        id('frequencySettings').style.display = "none";
        displayTimingSettings( false, true );
    }
}

function displayTimingSettings( displayFrequency, displayCloseTime ) {
    id('frequencySettings').style.display = displayFrequency ? "block" : "none";
    id('closeSettings').style.display = displayCloseTime ? "block" : "none";
}

function updateFrequencyPoints() {
    let options = [];
    let frequency = getSelectedOption( 'frequency' ).value;
    switch ( frequency ) {
        case "X":
        case "custom":
            options.push( {text: "--", value: "X"} );
            break;
        case "hour":
            for ( let min = 0; min < 60; min++ ) {
                options.push( {text: min + "", value: min + ""} );
            }
            break;
        case "day":
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
            options.push( {text: "Sunday Night (12:00)",    value:"0"} );
            options.push( {text: "Monday Night (12:00)",    value:"1"} );
            options.push( {text: "Tuesday Night (12:00)",   value:"2"} );
            options.push( {text: "Wednesday Night (12:00)", value:"3"} );
            options.push( {text: "Thursday Night (12:00)",  value:"4"} );
            options.push( {text: "Friday Night (12:00)",    value:"5"} );
            options.push( {text: "Saturday Night (12:00)",  value:"6"} );
            break;
    }

    addAllToSelect( 'frequencyPoint', options );
}

function createEntryInputs( e ) {
    if ( e.which === 13 || e.keyCode === 13 ) {
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
                    nameInput.addEventListener( "keyup", displayPreview );
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
}


/**********PREVIEW**********/


function validateLogo() {
    let error = null;

    if ( !id('imageAddress').value ) {
        error = "Image required.";
    }
    //title length
    //image length
    //help length

    return error;
}

function validate() {
    let error = validateLogo();

    if ( !error ) {
        const isBracket = getSelectedRadioButtonId('bracketType') === "bracket";

        if ( isBracket && !getSelectedRadioButtonId('votingType') ) {
            error = "Voting type required: match, round, or open.";
        }
        //entry title length
        //entry image length
        //timing validation
    }

    return error;
}

function displayPreview() {
    let hasAtLeastOneName = false;
    let entryNames = nm('entryNames');
    for ( let i = 0; i < entryNames.length; i++ ) {
        if ( entryNames[i].value.length > 0 ) {
            hasAtLeastOneName = true;
            break;
        }
    }

    id('previewDiv').style.display = hasAtLeastOneName ? "block" : "none";
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
                action:  "saveBracket",
                bracket: JSON.stringify( getBracketData() )
            },
            function ( response ) {
                window.location = "https://bracket.religionandstory.com/bracket.php?id=" + JSON.parse( response );
            }
        );
    }
    else {
        showToaster( error );
    }
}

function load() {
    if ( id('titleText').value ) {
        //
    }
    else {
        //
    }
}

function pause() {
    //
}

function close() {
    //
}


/**********PARSE**********/


function getLogoData() {
    return {
        title:     id( 'titleText' ).value,
        image:     id( 'imageAddress' ).value,
        help:      id( 'helpInput' ).value,
        helpImage: id('help').firstChild.src,
        active:  false
    };
}

function getBracketData() {
    const logoData = getLogoData();

    let frequency      = id('frequencySettings').style.display      !== "none" ? getSelectedOptionValue( 'frequency' )      : null;
    let frequencyPoint = id('frequencySettings').style.display !== "none" ? getSelectedOptionValue( 'frequencyPoint' ) : null;
    frequency       = frequency      !== "X" ? frequency      : null;
    frequencyPoint  = frequencyPoint !== "X" ? frequencyPoint : null;
    let closeTime = id('closeSettings').style.display !== "none" ? id( 'closeInput' ).value : null;

    return {
        title:     logoData.title,
        image:     logoData.image,
        help:      logoData.help,
        helpImage: logoData.helpImage,
        mode:      getSelectedRadioButtonId('votingType') === "bracket" ? getSelectedRadioButtonId('votingType') : getSelectedRadioButtonId('bracketType'),
        entries:   getEntries(),
        winners:   "",
        endTime:   {
            lastEnd: null,
            frequency:      frequency,
            frequencyPoint: frequencyPoint,
            closeTime:      closeTime
        },
        active:  false
    };
}

function getEntries() {
    let entries = [];
    let entryInputs = nm('entryNames');
    let imageInputs = nm('entryImages');
    for ( let i = 0; i < entryInputs.length; i++ ) {
        if ( entryInputs[i].value ) {
            entries.push( {title: entryInputs[i].value, image: imageInputs[i].value} );
        }
    }

    return entries;
}