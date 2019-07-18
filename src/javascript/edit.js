function setBracketType( bracketType ) {
    if ( bracketType === "bracket" ) {
        id('bracketSettings').style.display = "block";
        id('closeSettings').style.display = "none";
    }
    else {
        id('bracketSettings').style.display = "none";
        id('closeSettings').style.display = "block";
    }

    id('entryDiv').style.display = "block";
}

function setBracketRoundType( bracketRoundType ) {
    if ( bracketRoundType === "match" ) {
        id('frequencySettings').style.display = "block";
    }
    else if ( bracketRoundType === "round" ) {
        id('frequencySettings').style.display = "block";
    }
    else if ( bracketRoundType === "open" ) {
        id('frequencySettings').style.display = "none";
    }
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
        let currentCount = nm('entryNames').length;
        entryCount -= currentCount;

        if ( entryCount > 0 ) {
            for ( let i = 0; i < entryCount; i++ ) {
                let entryDiv = document.createElement( "DIV" );
                let nameInput  = document.createElement( "INPUT" );
                let imageInput = document.createElement( "INPUT" );
                nameInput.id  = i + "NameInput";
                imageInput.id = i + "ImageInput";
                nameInput.style.width  = "45%";
                imageInput.style.width = "45%";
                nameInput.style.margin  = ".5em";
                imageInput.style.margin = ".5em";
                nameInput.classList.add(  "input" );
                imageInput.classList.add( "input" );
                nameInput.setAttribute(  "name", "entryNames" );
                imageInput.setAttribute( "name", "entryImages" );
                nameInput.setAttribute(  "placeholder", "Entry Name" );
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
    if ( id('imageAddress').value ) {
        const helpImage = id('help').firstChild.src;

        let exampleDiv = id('exampleLogo');
        while ( exampleDiv.firstChild ) {
            exampleDiv.removeChild( exampleDiv.firstChild );
        }

        let logoInfo = {
            title:     id('titleText').value,
            image:     id('imageAddress').value,
            help:      id('helpInput').value,
            helpImage: helpImage
        };
        createTitleLogo( logoInfo, exampleDiv, true, true );
    }
    else {
        showToaster( "Image required." );
    }
}

function previewBracket() {
    if ( id('imageAddress').value ) {
        const data = {
            logo: {
                title: id( 'titleText' ).value,
                image: id( 'imageAddress' ).value,
                help:  id( 'helpInput' ).value,
            },
            bracket: {
                active:  true,
                endTime: getEndTime(),
                mode:    "open",
                entries: getEntries(),
                winners: ""
            }
        };

        $.post( 'bracket.php', { data: data, timestamp: Date.now() }, function() {
            window.open( "https://bracket.religionandstory.com/bracket.php?id=PREVIEW" );
        } );
    }
    else {
        showToaster( "Logo Image required." );
    }
}

function getEndTime() {
    const frequency = getSelectedOption( 'frequency' ).value;
    const frequencyPoint = getSelectedOption( 'frequencyPoint' ).value;
    return getDisplayTime( calculateNextTime( frequency, frequencyPoint ) ); //todo
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


/**********GENERAL**********/


function create() {

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

}

function close() {

}