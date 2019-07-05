function setBracketType( bracketType ) {
    if ( bracketType === "bracket" ) {
        id('bracketSettings').style.display = "block";
    }
    else {
        id('bracketSettings').style.display = "none";
        id('frequencySettings').style.display = "block";
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
    let frequencySelect = id('frequency');
    let frequency = frequencySelect.options[frequencySelect.selectedIndex].value;

    let frequencyPointSelect = id('frequencyPoint');
    for ( let i = 0; i < frequencyPointSelect.options.length; i++ ) { frequencyPointSelect.options[i] = null; }
    switch ( frequency ) {
        case "X":
        case "min":
        case "custom":
            let option = document.createElement("option");
            option.text = "--";
            option.value = "X";
            frequencyPointSelect.appendChild( option );
            break;
        case "hour":
            for ( let min = 0; min < 60; min++ ) {
                let option = document.createElement("option");
                option.text = min + "";
                option.value = min + "";
                frequencyPointSelect.appendChild( option );
            }
            break;
        case "day":
        case "2days":
        case "3days":
        case "7days":
            for ( let hour = 0; hour < 24; hour++ ) {
                let hourDisplay = ("0" + hour).slice( -2 );
                let option00 = document.createElement("option");
                let option30 = document.createElement("option");
                option00.text = hourDisplay + ":00";
                option00.value = hour + "";
                option30.text = hourDisplay + ":30";
                option30.value = hour + ".5";
                frequencyPointSelect.appendChild( option00 );
                frequencyPointSelect.appendChild( option30 );
            }
            break;
        case "week":
            // options = [
            //     new Option( "Sunday (Midnight)",     "0" ),
            //     new Option( "Monday (Midnight)",     "1" ),
            //     new Option( "Tuesday (Midnight)",    "2" ),
            //     new Option( "Wednesday (Midnight)",  "3" ),
            //     new Option( "Thursday (Midnight)",   "4" ),
            //     new Option( "Friday (Midnight)",     "5" ),
            //     new Option( "Saturday (Midnight)",   "6" )
            // ];
            break;
    }
}

function createEntryInputs( e ) {
    if ( e.which === 13 || e.keyCode === 13 ) {
        let div = id('entryDiv'); //todo - deal with changing number
        let entryCount = id('entryCount').value;
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