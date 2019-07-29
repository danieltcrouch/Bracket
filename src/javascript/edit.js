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

            //Fill-out page
            id('titleText').value = bracketInfo.title;
            id('imageAddress').value = bracketInfo.image;
            id('additionalHelpText').value = bracketInfo.help;
            id(bracketInfo.mode).click();
            if ( bracketInfo.mode !== "poll" ) {
                id('bracket').click();
            }
            id('frequency').value = bracketInfo.timing.frequency;
            updateFrequencyPoints();
            id('frequencyPoint').value = bracketInfo.timing.frequencyPoint;
            id('scheduleInput').valueAsNumber = getZonedTime( getDateOrNull( bracketInfo.timing.scheduledClose ) );
            id('entryCount').value = bracketInfo.entries.length;
            createEntryInputs();
            for ( let i = 0; i < bracketInfo.entries.length; i++ ) {
                id( i + "NameInput" ).value = bracketInfo.entries[i].title;
                id( i + "ImageInput" ).value = bracketInfo.entries[i].image;
            }
            previewLogo();

            //Disable Create-only fields
            id('titleText').disabled = true;
            id('imageAddress').disabled = true;
            freezeRadioButtons( "bracketType" ); //disable switching BracketType
            if ( getSelectedRadioButtonId( "votingType" ) === "open" ) { //disable switching votingType to or from "Open"
                freezeRadioButtons( "votingType" );
            }
            else {
                freezeRadioButtons( null, ["open"] );
            }
            id('entryCount').disabled = true;

            id('save').style.display = "";
            id('create').style.display = "none";
        }
    );
}

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
                for ( let dayIndex = 0; dayIndex < DAYS_OF_WEEK.length; dayIndex++ ) {
                    options.push( {text: DAYS_OF_WEEK[dayIndex] + " Night (12:00)", value: dayIndex} );
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
        //entry titles filled
        //entry title length
        //entry image length
        //timing validation
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
        id('bracketData').value = JSON.stringify( bracket );
        id('previewForm').submit();
    }
    else {
        showToaster( error );
    }
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

function save() {
    // const error = validate();
    // if ( !error ) {
    //     $.post(
    //         "php/database.php",
    //         {
    //             action:  "saveBracket",
    //             bracket: JSON.stringify( getBracketData() )
    //         },
    //         function ( response ) {
    //             window.location = "https://bracket.religionandstory.com/bracket.php?id=" + JSON.parse( response );
    //         }
    //     );
    // }
    // else {
    //     showToaster( error );
    // }
}

function load() {
    // if ( id('titleText').value ) {
    //     $.post(
    //         "php/database.php",
    //         {
    //             action: "getBracketId",
    //             title:  id( 'titleText' ).value
    //         },
    //         function ( response ) {
    //             if ( response ) {
    //                 window.location = "https://bracket.religionandstory.com/edit.php?id=" + JSON.parse( response );
    //             }
    //             else {
    //                 showToaster( "No bracket found with that name." );
    //             }
    //         }
    //     );
    // }
    // else {
        $.post(
            "php/database.php",
            {
                action: "getAllLogos"
            },
            function ( response ) {
                const html = constructEditLinks( JSON.parse( response) );
                showMessage( "Choose a Bracket", html );
            }
        );
    // }
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
    return result;
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
        help:      id( 'additionalHelpText' ).value,
        helpImage: id( 'helpIcon' ).src,
        active:    false
    };
}

function getBracketData() {
    const logoData = getLogoData();

    let scheduledClose = id('scheduleSettings').style.display !== "none" ? id( 'scheduleInput' ).value : null;
    scheduledClose = scheduledClose ? new Date( scheduledClose ).toISOString() : null;
    let frequency      = id('frequencySettings').style.display !== "none" ? getSelectedOptionValue( 'frequency' )      : null;
    let frequencyPoint = id('frequencySettings').style.display !== "none" ? getSelectedOptionValue( 'frequencyPoint' ) : null;
    frequency      = frequency      === "X" ? null : frequency;
    frequencyPoint = frequencyPoint === "X" ? null : frequencyPoint;

    let mode = getSelectedRadioButtonId('votingType') === "bracket" ? getSelectedRadioButtonId('votingType') : getSelectedRadioButtonId('bracketType');

    return {
        title:     logoData.title,
        image:     logoData.image,
        help:      logoData.help,
        helpImage: logoData.helpImage,
        mode:      mode,
        entries:   getEntries(),
        winners:   "",
        timing:   {
            startTime:      null,
            frequency:      frequency,
            frequencyPoint: frequencyPoint,
            scheduledClose: scheduledClose
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