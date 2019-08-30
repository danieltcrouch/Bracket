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

function initializeEdit( surveyId ) {
    $.post(
        "php/database.php",
        {
            action: "getSurvey",
            id:     surveyId
        },
        function ( response ) {
            let surveyInfo = JSON.parse( response );
            surveyInfo.helpImage = helpImage;
            updateSurveyTiming( surveyId, surveyInfo, initializeEditCallback );
        }
    );
}

function initializeEditCallback( surveyId, surveyInfo ) {
    //Fill-out page
    state = surveyInfo.state;
    activeId = surveyInfo.timing.activeId;
    winners = surveyInfo.winners;
    currentVotes = surveyInfo.currentVotes;
    id('titleInput').value = surveyInfo.title;
    id('imageInput').value = surveyInfo.image;
    id('helpInput').value = surveyInfo.help;
    surveyInfo.type ? id(surveyInfo.type).click() : null;
    surveyInfo.mode ? id(surveyInfo.mode).click() : null;
    id('frequency').value = surveyInfo.timing.frequency; //todo 7 - fails on NULL
    updateFrequencyPoints();
    id('frequencyPoint').value = surveyInfo.timing.frequencyPoint;
    if ( surveyInfo.timing.scheduledClose ) {
        id('scheduledClose').valueAsNumber = getZonedTime( newDateFromUTC( surveyInfo.timing.scheduledClose ) ); //todo 8 - check all uses of newDateFromUTC / getDateOrNull
    }
    id('choiceCount').value = surveyInfo.choices.length;
    createChoiceInputs();
    for ( let i = 0; i < surveyInfo.choices.length; i++ ) {
        id( i + "NameInput" ).value = surveyInfo.choices[i].name;
        id( i + "ImageInput" ).value = surveyInfo.choices[i].image;
    }
    previewLogo();

    //Disable Create-only fields
    //todo 7 - what if bracket is complete?
    id('titleInput').disabled = true;
    id('imageInput').disabled = true;
    freezeRadioButtons( "surveyType" );
    freezeRadioButtons( "votingType" );
    id('choiceCount').disabled = true;

    updateDisplayedButtons( "edit" );
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

function updateDisplayedButtons( editMode ) {
    if ( editMode === "edit" ) {
        id('previewSurvey').style.display = "";
        id('review').style.display = "";
        id('save').style.display = "";
        id('create').style.display = "none";
    }
    else {
        id('previewSurvey').style.display = "none";
        id('save').style.display = "none";
        id('create').style.display = "";
    }
}

function setSurveyType( surveyType ) {
    if ( surveyType === "bracket" ) {
        setVotingType( getSelectedRadioButtonId( "votingType" ) );
        id('bracketSettings').style.display = "block";
    }
    else {
        displayTimingSettings( false, true );
        id('bracketSettings').style.display = "none";
    }
    id('choiceDiv').style.display = "block";
}

function setVotingType( votingType ) {
    if ( votingType === "match" ) {
        displayTimingSettings( true, false );
    }
    else if ( votingType === "round" ) {
        displayTimingSettings( true, false );
    }
    else if ( votingType === "open" ) {
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

function submitChoiceCount( e ) {
    if ( e.which === 13 || e.keyCode === 13 ) {
        createChoiceInputs();
        id('previewSurvey').style.display = "";
    }
}

function createChoiceInputs() {
    let div = id('choiceDiv');

    let choiceCount = id('choiceCount').value;
    if ( choiceCount <= 128 ) {
        let currentCount = nm( 'choiceNames' ).length;
        choiceCount -= currentCount;

        if ( choiceCount > 0 ) {
            for ( let i = 0; i < choiceCount; i++ ) {
                let choiceDiv = document.createElement( "DIV" );
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
                nameInput.setAttribute( "name", "choiceNames" );
                imageInput.setAttribute( "name", "choiceImages" );
                nameInput.setAttribute( "placeholder", "Choice Name" );
                imageInput.setAttribute( "placeholder", "Image URL" );
                choiceDiv.appendChild( nameInput );
                choiceDiv.appendChild( imageInput );
                div.appendChild( choiceDiv );
            }
        }
        else if ( choiceCount < 0 ) {
            for ( let i = 0; i < -choiceCount; i++ ) {
                div.removeChild( div.lastChild );
            }
        }
    }
    else {
        showToaster( "Choice count must be below 128" );
    }
}


/**********VALIDATE**********/


function validate() {
    let error = validateLogo();

    if ( !error ) {
        const choiceCount = id('choiceCount').value;
        const choiceNamesFilled  = Array.from( nm( 'choiceNames'  ) ).every( e => e.value );
        const choiceNamesLength  = Array.from( nm( 'choiceNames'  ) ).every( e => e.value.length <= 20 );
        const choiceImagesLength = Array.from( nm( 'choiceImages' ) ).every( e => e.value.length <= 256 );

        const isBracket = getSelectedRadioButtonId('surveyType') === "bracket";
        if ( isBracket && !getSelectedRadioButtonId('votingType') ) {
            error = "Voting type required: match, round, or open.";
        }
        else if ( !choiceCount || choiceCount <= 0 ) {
            error = "Choice count must be greater than zero.";
        }
        else if ( !choiceNamesFilled ) {
            error = "Choice names required.";
        }
        else if ( !choiceNamesLength ) {
            error = "Choice name length too long. (Max of 20 characters)";
        }
        else if ( !choiceImagesLength ) {
            error = "Choice image length too long. (Max of 256 characters)";
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


/**********PREVIEW**********/

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

function previewSurvey() {
    const error = validate();
    if ( !error ) {
        let surveyInfo = getSurveyInfo();
        surveyInfo.state = "active";
        surveyInfo.timing.scheduledClose = getDateOrNull( surveyInfo.timing.scheduledClose );
        id('surveyInfo').value = JSON.stringify( surveyInfo );
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
                action:  "createSurvey",
                survey: JSON.stringify( getSurveyInfo() )
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
        let surveyInfo = getSurveyInfo();
        surveyInfo.id = surveyId;
        $.post(
            "php/database.php",
            {
                action:  "updateSurvey",
                survey: JSON.stringify( surveyInfo )
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
            action: "getAllSurveyMetas"
        },
        function ( response ) {
            const html = constructEditLinks( JSON.parse( response ) );
            showMessage( "Choose a Survey", html );
        }
    );
}

function constructEditLinks( surveyMetas ) {
    let result = "";
    for ( let i = 0; i < surveyMetas.length; i++ )
    {
        const surveyMeta = surveyMetas[i];
        const isDuplicate = surveyMetas.filter( b => b.title === surveyMeta.title && b.date !== surveyMeta.date ).length > 0;
        const title = surveyMeta.title + (isDuplicate ? "(" + new Date( surveyMeta.date ) + ")" : "");
        result += "<a href='https://bracket.religionandstory.com/edit.php?id=" + surveyMeta.id + "' class='link'>" + title + "</a><br/>";
    }
    result += "<a href='https://bracket.religionandstory.com/edit.php' class='link'>Create New Survey</a><br/>";
    return result;
}

function review() {
    let closeTime = getDisplayTime( getDateOrNull( id( 'scheduledClose' ).value ) );
    let additionalInfo = "<br/> " +
        "<strong>State:</strong> " + state +
        "<br/> <strong>Active ID:</strong> " + (activeId || "none") +
        "<br/> <strong>Round Ends:</strong> " + (closeTime || "TBD");
    viewResults( getChoices().map( c => c.name ), currentVotes, additionalInfo );
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
            action:     "setSurveyState",
            id:         surveyId,
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
            id:         surveyId,
            time:       null
        },
        function ( response ) {
            showToaster( "Survey will close when you tell it to..." );
        }
    );
}

function start() {
    let newActiveId = calculateStartActiveId( getSelectedRadioButtonId('surveyType'), getSelectedRadioButtonId('votingType'), getChoices().length );
    $.post(
        "php/database.php",
        {
            action:     "startSurvey",
            id:         surveyId,
            activeId:   newActiveId,
            time:       calculateStartTime( getTiming() )
        },
        function ( response ) {
            showToaster( "Survey started... " );
            state = "active";
            activeId = newActiveId;
        }
    );
}

function close() {
    //todo 7
}

function hide() {
    $.post(
        "php/database.php",
        {
            action:     "setSurveyState",
            id:         surveyId,
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

function getSurveyInfo() {
    const logoData = getLogoData();
    return {
        title:     logoData.title,
        image:     logoData.image,
        state:     state,
        help:      logoData.help,
        helpImage: logoData.helpImage,
        type:      getSelectedRadioButtonId('surveyType'),
        mode:      getSelectedRadioButtonId('votingType'),
        choices:   getChoices(),
        winners:   "",
        timing:   getTiming()
    };
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

function getChoices() {
    let choices = [];
    let choiceInputs = nm('choiceNames');
    let imageInputs  = nm('choiceImages');
    for ( let i = 0; i < choiceInputs.length; i++ ) {
        if ( choiceInputs[i].value ) {
            choices.push( {name: choiceInputs[i].value, image: imageInputs[i].value, id: i} );
        }
    }
    return choices;
}