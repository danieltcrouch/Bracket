let state;
let activeId;
let currentVotes;

function initializeCreate() {
    let logoInfo = {
        title:     "Your Bracket",
        image:     "https://bracket.religionandstory.com/images/chess.jpg",
        helpImage: helpImage,
        help:      "Additional instructions will appear here."
    };
    createTitleLogo( logoInfo, id('exampleLogo'), true, true );
    updateDisplayedButtons();
}

function initializeEdit( surveyId ) {
    $.post(
        "php/controller.php",
        {
            action: "getSurvey",
            id:     surveyId
        },
        function ( response ) {
            let surveyInfo = JSON.parse( response );
            surveyInfo.helpImage = helpImage;
            updateSurveyTiming( surveyId, surveyInfo, initializeEditCallback );
            updateDisplayedButtons();
        }
    );
}

function initializeEditCallback( surveyId, surveyInfo ) {
    state = surveyInfo.state;
    activeId = surveyInfo.timing.activeId;
    currentVotes = surveyInfo.currentVotes;

    id('titleInput').value = surveyInfo.title;
    id('imageInput').value = surveyInfo.image;
    id('helpInput').value = surveyInfo.help;
    surveyInfo.type ? id(surveyInfo.type).click() : null;
    surveyInfo.mode ? id(surveyInfo.mode).click() : null;
    chooseSelectOptionValue( 'frequency', surveyInfo.timing.frequency );
    updateFrequencyPoints();
    chooseSelectOptionValue( 'frequencyPoint', surveyInfo.timing.frequencyPoint );
    id('scheduledClose').setDateObject( newDate( surveyInfo.timing.scheduledClose ) );
    id('choiceCount').value = surveyInfo.choices.length;
    createChoiceInputs();
    fillChoiceInputs( surveyInfo.choices );
    previewLogo();

    id('titleInput').disabled = true;
    id('imageInput').disabled = true;
    freezeRadioButtons( "surveyType" );
    freezeRadioButtons( "votingType" );
    id('choiceCount').disabled = true;
}

function updateDisplayedButtons() {
    if ( surveyId ) {
        id('save').style.display = "";
        id('create').style.display = "none";
        id('change').style.display = "";
        id('review').style.display = "";
    }
    else {
        id('save').style.display = "none";
        id('create').style.display = "";
        id('change').style.display = "none";
        id('review').style.display = "none";
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
                let linkInput = document.createElement( "INPUT" );
                nameInput.id = i + "NameInput";
                imageInput.id = i + "ImageInput";
                linkInput.id = i + "LinkInput";
                nameInput.style.width = "45%";
                imageInput.style.width = "20%";
                linkInput.style.width = "20%";
                nameInput.style.margin = ".5em";
                imageInput.style.margin = ".5em";
                linkInput.style.margin = ".5em";
                nameInput.classList.add( "input" );
                imageInput.classList.add( "input" );
                linkInput.classList.add( "input" );
                nameInput.setAttribute( "name", "choiceNames" );
                imageInput.setAttribute( "name", "choiceImages" );
                linkInput.setAttribute( "name", "choiceLinks" );
                nameInput.setAttribute( "placeholder", "Choice Name" );
                imageInput.setAttribute( "placeholder", "Image URL" );
                linkInput.setAttribute( "placeholder", "Link URL" );
                choiceDiv.appendChild( nameInput );
                choiceDiv.appendChild( imageInput );
                choiceDiv.appendChild( linkInput );
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

function fillChoiceInputs( choices ) {
    for ( let i = 0; i < choices.length; i++ ) {
        id( i + "NameInput" ).value  = choices[i].name;
        id( i + "ImageInput" ).value = choices[i].image;
        id( i + "LinkInput" ).value  = choices[i].link;
    }
}


/**********VALIDATE**********/


function validate() {
    let error = validateLogo();

    if ( !error ) {
        const choiceCount = id('choiceCount').value;
        const choiceNamesFilled  = nm( 'choiceNames'  ).every( e => e.value );
        const choiceNamesLength  = nm( 'choiceNames'  ).every( e => e.value.length <= 30 );
        const choiceImagesLength = nm( 'choiceImages' ).every( e => e.value.length <= 256 );
        const choiceLinksLength  = nm( 'choiceLinks'  ).every( e => e.value.length <= 256 );
        const closeTime          = id('scheduleSettings').style.display !== "none" ? id( 'scheduledClose' ).value : null;
        const closeTimeInFuture  = isDateAfter( closeTime, adjustMinutes( new Date(), 5 ) );

        if ( isSurveyBracket() && !getSelectedRadioButtonId('votingType') ) {
            error = "Voting type required: match, round, or open.";
        }
        else if ( !choiceCount || choiceCount <= 0 ) {
            error = "Choice count must be greater than zero.";
        }
        else if ( !choiceNamesFilled ) {
            error = "Choice names required.";
        }
        else if ( !choiceNamesLength ) {
            error = "Choice name length too long. (Max of 30 characters)";
        }
        else if ( !choiceImagesLength ) {
            error = "Choice image length too long. (Max of 256 characters)";
        }
        else if ( !choiceLinksLength ) {
            error = "Choice link length too long. (Max of 256 characters)";
        }
        else if ( closeTime && !closeTimeInFuture ) {
            error = "Scheduled Close Time must be in the future.";
        }
    }

    return error;
}

function validateLogo() {
    let error = null;

    if ( !id('imageInput').value ) {
        error = "Image required.";
    }
    else if ( id('titleInput').value.length > 35 ) {
        error = "Title length too long. (Max of 35 characters)";
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


function preview() {
    if ( surveyId && isVisible( state ) ) {
        window.open( "https://bracket.religionandstory.com/survey.php?id=" + surveyId );
    }
    else {
        if ( id('choiceCount').value ) {
            previewSurvey();
        }
        else {
            previewLogo();
        }
    }
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

function previewSurvey() {
    const error = validate();
    if ( !error ) {
        let surveyInfo = getSurveyInfo();
        surveyInfo.state = "active";
        surveyInfo.timing.activeId = calculateStartActiveId( surveyInfo.type, surveyInfo.mode, surveyInfo.choices.length );
        surveyInfo.timing.scheduledClose = getISOString( calculateStartTime( surveyInfo.timing ) );
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
            "php/controller.php",
            {
                action: "createSurvey",
                survey: JSON.stringify( getSurveyInfo() )
            },
            function ( response ) {
                window.location = "https://bracket.religionandstory.com/edit.php?id=" + JsonParse( response );
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
            "php/controller.php",
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

function change() {
    openStateModal( {
        surveyId:    surveyId,
        state:       state,
        activeId:    activeId,
        timing:      getTiming(),
        surveyType:  getSelectedRadioButtonId('surveyType'),
        votingType:  getSelectedRadioButtonId('votingType'),
        choiceCount: getChoices().length
    },
    function( response ) {
        state = response.state;
        activeId = response.activeId;
        id('scheduledClose').setDateObject( newDate( response.timing.scheduledClose ) );
    } );
}

function review() {
    let closeTime = getDisplayTime( id( 'scheduledClose' ).getDateObject() );
    let additionalInfo = "<br/> " +
        "<strong>State:</strong> " + state +
        "<br/> <strong>Active ID:</strong> " + (activeId || "none") +
        "<br/> <strong>Round Ends:</strong> " + (closeTime || "TBD");
    let matchTitles = getMatchTitles( getChoices(), isSurveyBracket() );
    reviewSurvey( state, matchTitles, getChoices(), currentVotes, additionalInfo );
}

function getMatchTitles( rawChoices, isBracket )
{
    let result = null;
    if ( isBracket ) {
        let tempSurvey = Bracket.parseBracket( rawChoices );
        return tempSurvey.getAllMatchTitles();
    }
    return result;
}

function load() {
    $.post(
        "php/controller.php",
        {
            action: "getAllSurveyMetas"
        },
        function ( response ) {
            const html = constructEditLinks( JsonParse( response ) );
            showMessage( "Choose a Survey", html );
        }
    );
}

function constructEditLinks( surveyMetas ) {
    let result = "";
    if ( surveyMetas ) {
        surveyMetas.forEach( m => m.date = adjustToUTC( newDate( m.date ) ) );
        for ( let i = 0; i < surveyMetas.length; i++ )
        {
            const surveyMeta = surveyMetas[i];
            const isDuplicate = surveyMetas.filter( m => m.title === surveyMeta.title && m.date !== surveyMeta.date ).length > 0;
            const title = surveyMeta.title + (isDuplicate ? "(" + surveyMeta.date + ")" : "");
            result += "<a href='https://bracket.religionandstory.com/edit.php?id=" + surveyMeta.id + "' class='link'>" + title + "</a><br/>";
        }
    }
    result += "<a href='https://bracket.religionandstory.com/edit.php' class='link'>Create New Survey</a><br/>";
    return result;
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
    let linkInputs   = nm('choiceLinks');
    for ( let i = 0; i < choiceInputs.length; i++ ) {
        if ( choiceInputs[i].value ) {
            choices.push( {name: choiceInputs[i].value, image: imageInputs[i].value, link: linkInputs[i].value, id: i} );
        }
    }
    return choices;
}


/*** UTILITY ***/


function isSurveyBracket() {
    return getSelectedRadioButtonId('surveyType') === "bracket";
}