let bracket;
let round;
let mode;
let display;
let endTime;


/*** BRACKET ***/


class Bracket {
    constructor() {
        let entriesInput = ( arguments && arguments[0] ) ? arguments[0] : "";
        let winnersInput = ( arguments.length > 1 && arguments[1] ) ? arguments[1] : "";

        this.entryCount = entriesInput.length;
        this.magnitude = Math.pow( 2, Math.ceil( Math.log2( this.entryCount ) ) );
        this.roundCount = Math.log2( this.magnitude );
        this.entries = Bracket.parseEntries( entriesInput );
        this.bracket = Bracket.constructBracket( this.magnitude, this.roundCount, this.entries );

        let hasByes = this.magnitude > this.entryCount;
        Bracket.parseWinners( winnersInput, this.bracket, hasByes );

        this.updateCurrent();
    }

    static parseEntries( entries ) {
        if ( typeof entries[0] === "string" ) {
            entries = entries.map( function( e ) { return { name: e, image: "" }; } );
        }

        for ( let i = 0; i < entries.length; i++ ) {
            entries[i].image = entries[i].image || "images/profile.jpg";
            entries[i].seed = i + 1;
        }

        return entries;
    }

    static constructBracket( bracketSize, roundCount, entries ) {
        let bracket = [];

        let firstRound = Bracket.constructFirstRound( bracketSize, roundCount - 1, entries );
        bracket.push( firstRound );

        for ( let roundIndex = 1; roundIndex < roundCount; roundIndex++ ) {
            let round = [];
            let prevRound = bracket[roundIndex - 1];
            let matchCount = bracketSize / Math.pow( 2, roundIndex + 1 );

            for ( let i = 0; i < matchCount; i++ ) {
                let prevMatches = {
                    top:    prevRound[i * 2],
                    bottom: prevRound[i * 2 + 1]
                };
                let match = {
                    bye:    false,
                    top:    null,
                    bottom: null,
                    prev:   prevMatches,
                    match:  i,
                    round:  roundIndex
                };
                round.push( match );
            }
            bracket.push( round );
        }

        return bracket;
    }

    static constructFirstRound( bracketSize, roundCount, entries ) {
        let firstRound = [];

        let roundSeeds = [1, 2];
        for ( let i = 0; i < roundCount; i++ ) {
            let temp = [];
            let length = roundSeeds.length * 2 + 1;
            roundSeeds.forEach( function( seed ) {
                temp.push( seed );
                temp.push( length - seed );
            } );
            roundSeeds = temp;
        }

        let matchCount = bracketSize / 2;
        for ( let i = 0; i < matchCount; i++ ) {
            let tSeed = roundSeeds[i * 2];
            let bSeed = roundSeeds[i * 2 + 1];
            let isBye = ( bSeed - 1 >= entries.length );
            let top    = entries.find( function( e ) { return e.seed === tSeed } );
            let bottom = isBye ? null : entries.find( function( e ) { return e.seed === bSeed } );

            firstRound.push( {
                bye:    isBye,
                top:    top,
                bottom: bottom,
                prev:   null,
                match:  i,
                round:  0
            } );
        }

        return firstRound;
    }

    static parseWinners( winners, bracket, hasByes ) {
        winners = winners.split(',').reduce( function( result, w ) { result.push( Array.from( w ) ); return result; }, [] );

        for ( let roundIndex = 0; roundIndex < winners.length; roundIndex++ ) {
            let roundWinners = winners[roundIndex];
            for ( let matchIndex = 0; matchIndex < roundWinners.length; matchIndex++ ) {
                let matchWinner = roundWinners[matchIndex];
                let match = bracket[roundIndex][matchIndex];
                match.winner = matchWinner === '0' ? match.bottom : match.top;

                let nextMatch = bracket[roundIndex + 1][Math.floor(matchIndex / 2)];
                matchIndex % 2 === 0 ? nextMatch.top = match.winner : nextMatch.bottom = match.winner;
            }
        }

        if ( hasByes )
        {
            let firstRound = bracket[0];
            for ( let matchIndex = 0; matchIndex < firstRound.length; matchIndex++ ) {
                let match = firstRound[matchIndex];
                if ( match.bye ) {
                    match.winner = match.top;
                    let nextMatch = bracket[1][Math.floor(matchIndex / 2)];
                    matchIndex % 2 === 0 ? nextMatch.top = match.winner : nextMatch.bottom = match.winner;
                }
            }
        }
    }

    static seekCurrentMatch( bracket ) {
        let result = {round: -1, match: -1};
        for ( let roundIndex = 0; roundIndex < bracket.length; roundIndex++ ) {
            let round = bracket[roundIndex];
            for ( let matchIndex = 0; matchIndex < round.length; matchIndex++ ) {
                if ( !round[matchIndex].winner ) {
                    result.round = roundIndex;
                    result.match = matchIndex;
                    break;
                }
            }

            if ( result.match >= 0 ) {
                break;
            }
        }
        return result;
    }

    updateCurrent() {
        let current = Bracket.seekCurrentMatch( this.bracket );
        this.currentRound = current.round;
        this.currentMatch = current.match;
    }

    isLastRound( round ) {
        return round === this.roundCount;
    }

    getMaxRounds() {
        return this.roundCount; //only includes rounds with matches
    }

    getMaxSize() {
        return this.magnitude;
    }

    getSize() {
        return this.entryCount;
    }

    getCurrentRound() {
        return this.currentRound;
    }

    getCurrentMatch() {
        return this.currentMatch;
    }

    getCurrentMatchId() {
        return "r" + this.currentRound + "m" + this.currentMatch;
    }

    getMatchFromId( matchId ) {
        let round = parseInt( matchId.split('m')[0].substring( 1 ) );
        let match = parseInt( matchId.split('m')[1] );
        return this.bracket[round][match];
    }

    getMatchesFromRound( round, ignoreByes ) {
        return this.bracket[round].filter( m => !(m.bye && ignoreByes) );
    }

    getNextMatch ( matchId ) {
        let round = parseInt( matchId.split('m')[0].substring( 1 ) );
        let match = parseInt( matchId.split('m')[1] );
        let isTop = match % 2 === 0;
        round++;
        match = Math.floor(match / 2);
        let result = this.isLastRound( round ) ? null : this.bracket[round][match];
        return {
            match: result,
            isTop: isTop
        };
    }

    getMatches( ignoreByes ) {
        return this.bracket.reduce( (result, r) => { return result.concat( r ); }, [] ).filter( m => !(m.bye && ignoreByes) );
    }

    getWinner() {
        return this.bracket[this.getMaxRounds() - 1][0].winner;
    }

    toString() {
        return this.entries.map( e => e.name ).join( "," );
    }
}


/*** POLL ***/


class Poll {
    constructor() {
        // let entriesInput = ( arguments && arguments[0] ) ? arguments[0] : "";
        // let winnersInput = ( arguments.length > 1 && arguments[1] ) ? arguments[1] : "";
        //
        // this.entryCount = entriesInput.length;
        // this.magnitude = Math.pow( 2, Math.ceil( Math.log2( this.entryCount ) ) );
        // this.roundCount = Math.log2( this.magnitude );
        // this.entries = Bracket.parseEntries( entriesInput );
        // this.bracket = Bracket.constructBracket( this.magnitude, this.roundCount, this.entries );
        //
        // let hasByes = this.magnitude > this.entryCount;
        // Bracket.parseWinners( winnersInput, this.bracket, hasByes );
        //
        // this.updateCurrent();
    }

    static parseEntries( entries ) {
        // if ( typeof entries[0] === "string" ) {
        //     entries = entries.map( function( e ) { return { name: e, image: "" }; } );
        // }
        //
        // for ( let i = 0; i < entries.length; i++ ) {
        //     entries[i].image = entries[i].image || "images/profile.jpg";
        //     entries[i].seed = i + 1;
        // }
        //
        // return entries;
    }
}

//todo 9 - Clean Common repo and custom css files in projects
//todo 9 - set standards for this and future projects

/*** DISPLAY ***/


const BUTTON_WIDTH          = "12rem";
const BUTTON_TEXT_HEIGHT    = "3rem";
const BUTTON_PADDING        = ".5rem";
const BUTTON_B_MARGIN       = ".75rem";
const MATCH_B_MARGIN        = "1.5rem";
const TOTAL_MATCH_HEIGHT    = "7.5rem"; //(BUTTON_TEXT_HEIGHT + BUTTON_B_MARGIN) * 2

function getBracketData( bracketId ) {
    $.post(
        "php/database.php",
        {
            action: "getBracket",
            id:     bracketId
        },
        function ( response ) {
            let bracketInfo = JSON.parse( response );
            bracketInfo.helpImage = helpImage;
            loadPage( bracketId, bracketInfo );
        }
    );
}

function loadPage( bracketId, bracketInfo ) {
    if ( bracketId && bracketInfo && isBracketAvailable( bracketInfo.state ) ) {
        createTitleLogo( bracketInfo, cl('title')[0], bracketInfo.state === "active", true );
        loadBracket( bracketInfo );
    }
    else {
        window.location = "https://bracket.religionandstory.com/index.php?error=InvalidBracketId";
    }
}

function isBracketAvailable( state ) {
    return state && state !== "hidden" && state !== "ready";
}

function loadBracket( bracketInfo ) {
    mode = bracketInfo.mode;
    endTime = calculateNextTime( bracketInfo.timing );

    if ( mode !== "poll" ) {
        bracket = new Bracket( bracketInfo.entries, bracketInfo.winners );
        displayBracket();
        setDisplayType();
    }
    else {
        //bracket = new Poll( bracketInfo.entries, bracketInfo.winners );
        //displayPoll();
    }

    displayRoundTimer( endTime, bracketInfo.state );
}

function displayBracket() {
    let div = id( 'bracketDisplay' );
    div.style.display = "flex";
    div.style.justifyContent = "center";
    div.innerHTML = "";

    for ( let i = 0; i < bracket.getMaxRounds(); i++ ) {
        let roundDiv = document.createElement( "DIV" );
        roundDiv.id = "round" + i;
        roundDiv.style.display = "flex";
        roundDiv.style.flexDirection = "column";
        roundDiv.style.justifyContent = "center";
        roundDiv.style.marginLeft = "1em";

        let matches = bracket.getMatchesFromRound( i );
        for ( let j = 0; j < matches.length; j++ ) {
            let match = matches[j];
            let matchDiv = document.createElement( "DIV" );
            matchDiv.style.display = "flex";
            matchDiv.style.flexDirection = "column";
            matchDiv.style.marginBottom = MATCH_B_MARGIN;

            matchDiv = getMatch( matchDiv, match );

            if ( i > 0 && j > 0 ) {
                insertFiller( roundDiv, 1 + ( 2 * ( i - 1 ) ) );
            }

            roundDiv.appendChild( matchDiv );
        }
        div.appendChild( roundDiv );
        adjustFontSize( roundDiv );
    }

    setClickableMatches();
}

function getMatch( matchDiv, match ) {
    const matchId = getMatchId( match );
    const entries = [ match.top, match.bottom ];

    for ( let i = 0; i < entries.length; i++ ) {
        let isTop = i % 2 === 0;
        let entryDiv = document.createElement( "DIV" );
        entryDiv.style.display = "flex";
        let image = document.createElement( "IMG" );
        let source = entries[i] ? entries[i].image : "images/question.jpg";
        source = match.bye && !isTop ? "images/blank.jpg" : source;
        image.setAttribute( "src", source );
        image.id = getImageId( matchId, isTop );
        image.style.width = BUTTON_TEXT_HEIGHT;
        image.style.height = BUTTON_TEXT_HEIGHT;
        image.style.objectFit = "cover";
        let button = getButtonFromEntry( entries[i], isTop, matchId, (!isTop && match.bye) );
        entryDiv.appendChild( image );
        entryDiv.appendChild( button );
        matchDiv.appendChild( entryDiv );
    }

    return matchDiv;
}

function getButtonFromEntry( entry, isTop, matchId, isBye ) {
    entry = entry || {name: (isBye ? "Bye" : "TBD"), seed: 0};

    let result = document.createElement( "BUTTON" );
    result.innerHTML = getDisplayName( entry );
    result.id = getButtonId( matchId, isTop );
    result.name = matchId;
    result.onclick = function() {
        registerChoice( matchId, isTop );
    };
    result.style.width = BUTTON_WIDTH;
    result.style.height = BUTTON_TEXT_HEIGHT;
    result.style.lineHeight = "100%";
    result.style.padding = BUTTON_PADDING;
    result.style.marginBottom = BUTTON_B_MARGIN;
    result.style.textAlign = "left";
    result.style.whiteSpace = "nowrap";
    result.classList.add( "button" );
    return result;
}

function insertFiller( roundDiv, multiplier ) {
    let fillerDiv = document.createElement( "DIV" );
    fillerDiv.setAttribute( "name", "filler" );
    fillerDiv.style.display = "flex";
    fillerDiv.style.flexDirection = "column";
    fillerDiv.style.marginBottom = ( parseFloat(MATCH_B_MARGIN) * multiplier ) + "rem";
    fillerDiv.style.height = ( parseFloat(TOTAL_MATCH_HEIGHT) * multiplier ) + "rem";
    //fillerDiv.style.borderStyle = "solid";
    //fillerDiv.style.borderWidth = "1px";
    roundDiv.appendChild( fillerDiv );
}

function adjustFontSize( roundDiv ) {
    let buttons = roundDiv.getElementsByTagName( "BUTTON" );

    const defaultStyle = getComputedStyle( buttons[0] );
    const defaultWidth = parseFloat( defaultStyle.width );
    const defaultFontSize = parseFloat( defaultStyle.fontSize );
    let minFontSize = defaultFontSize;
    for ( let i = 0; i < buttons.length; i++ ) {
        let button = buttons[i];
        let width = getFullWidth( button );
        if ( width > defaultWidth ) {
            const minSize = 12;
            for ( let size = defaultFontSize; size > minSize; size-- ) {
                button.style.fontSize = size + "px";
                width = getFullWidth( button );
                if ( width <= defaultWidth ) {
                    minFontSize = size < minFontSize ? size : minFontSize;
                    break;
                }
                if ( size - 1 === minSize ) {
                    button.innerHTML = button.innerHTML.substring( 0, 15 ) + "...";
                    minFontSize = size < minFontSize ? size : minFontSize;
                }
            }
        }
    }

    if ( minFontSize < defaultFontSize ) {
        for ( let i = 0; i < buttons.length; i++ ) {
            buttons[i].style.fontSize = minFontSize + "px";
        }
    }
}

function getFullWidth( button ) {
    button.style.width = "";
    let result = getComputedStyle( button ).width;
    button.style.width = BUTTON_WIDTH;
    return parseFloat( result );
}

function setClickableMatches() {
    const matches = bracket.getMatches();
    for ( let i = 0; i < matches.length; i++ ) {
        const matchId = getMatchId( matches[i] );
        freezeRadioButtons( matchId );

        if ( matches[i].winner ) {
            const winnerId = getButtonId( matchId, matches[i].winner.seed === matches[i].top.seed );
            selectRadioButton( winnerId, true );
        }
    }

    const setClickable = function( matchId ) {
        unfreezeRadioButtons( matchId );
        getButtonIds( matchId ).forEach( function( buttonId ) { id(buttonId).classList.add( "blinkBorder" ); } );
    };

    switch ( mode ) {
    case "match":
        setClickable( bracket.getCurrentMatchId() );
        break;
    case "round":
        const roundMatches = bracket.getMatchesFromRound( bracket.getCurrentRound(), true );
        for ( let i = 0; i < roundMatches.length; i++ ) {
            setClickable( getMatchId( roundMatches[i] ) );
        }
        break;
    case "open":
    default:
        const nonByeMatches = bracket.getMatches();
        for ( let i = 0; i < nonByeMatches.length; i++ ) {
            const match = matches[i];
            if ( match.top && match.top.seed && match.bottom && match.bottom.seed ) {
                setClickable( getMatchId( match ) );
            }
        }
    }
}


/*** ROUND DISPLAY ***/


function setDisplayType() {
    window.onresize = updateMobile;
    round = bracket.getCurrentRound() >= 0 ? bracket.getCurrentRound() : 0;
    display = {};
    display.isLarge = bracket.getMaxSize() > 32;
    display.isMobile = isMobile();

    displayRounds();
}

function updateMobile() {
    display.isMobile = isMobile();
    displayRounds();
}

function isMobile() {
    let element = cl('mobileDisplay')[0];
    const currentValue = element.style.display;
    element.style.display = "";
    const result = getComputedStyle( element ).display !== "none";
    element.style.display = currentValue;
    return result;
}

function displayRounds() {
    if ( display.isMobile ) {
        displaySingleRound();
    }
    else if ( display.isLarge ) {
        displayThreeRounds();
    }
    else {
        displayAllRounds();
    }

    if ( display.isMobile || display.isLarge ) {
        updateRoundPicker();
    }
}

function displaySingleRound() {
    for ( let i = 0; i < bracket.getMaxRounds(); i++ ) {
        id('round' + i).style.display = ( i === round ) ? "flex" : "none";
    }

    let fillers = nm('filler');
    for ( let i = 0; i < fillers.length; i++ ) {
        fillers[i].style.display = "none";
    }

    adjustFontSize( id( "round" + round ) );
}

function displayThreeRounds() {
    id('roundPicker').style.display = "block";

    for ( let i = 0; i < bracket.getMaxRounds(); i++ ) {
        id('round' + i).style.display = ( i >= round - 1 && i <= round + 1 ) ? "flex" : "none";
    }

    let fillers = nm('filler');
    for ( let i = 0; i < fillers.length; i++ ) {
        fillers[i].style.display = "flex";
    }

    const farLeftRound = ( round === 0 ) ? 0 : round - 1;
    fillers = id('round' + farLeftRound).querySelectorAll('[name=filler]');
    for ( let i = 0; i < fillers.length; i++ ) {
        fillers[i].style.display = "none";
    }

    const middleRound = ( round === 0 ) ? 1 : round;
    fillers = id('round' + middleRound).querySelectorAll('[name=filler]');
    for ( let i = 0; i < fillers.length; i++ ) {
        fillers[i].style.marginBottom = ( parseFloat(MATCH_B_MARGIN) ) + "rem";
        fillers[i].style.height = ( parseFloat(TOTAL_MATCH_HEIGHT) ) + "rem";
    }

    const farRightRound = ( round === 0 ) ? 2 : round + 1;
    fillers = id('round' + farRightRound).querySelectorAll('[name=filler]');
    for ( let i = 0; i < fillers.length; i++ ) {
        fillers[i].style.marginBottom = ( parseFloat(MATCH_B_MARGIN) * 3 ) + "rem";
        fillers[i].style.height = ( parseFloat(TOTAL_MATCH_HEIGHT) * 3 ) + "rem";
    }
}

function displayAllRounds() {
    for ( let i = 0; i < bracket.getMaxRounds(); i++ ) {
        id('round' + i).style.display = "flex";
    }

    let fillers = nm('filler');
    for ( let i = 0; i < fillers.length; i++ ) {
        fillers[i].style.display = "flex";
    }
}

function updateRoundPicker() {
    id('roundSpan').innerHTML = "Round " + ( round + 1 );

    if ( round === 0 ) {
        id('arrowPrev').style.display = "none";
    }
    else if ( round === bracket.getMaxRounds() - 1 || ( display.isLarge && round === bracket.getMaxRounds() - 2 ) ) {
        id('arrowNext').style.display = "none";
    }
    else {
        id('arrowPrev').style.display = "";
        id('arrowNext').style.display = "";
    }
}

function changeRound( direction ) {
    if ( direction === "prev" ) {
        round--;
    }
    else if ( direction === "next" ) {
        round++;
    }

    let maxRound = bracket.getMaxRounds() - 1;
    round = round < 0 ? 0 : ( round > maxRound ? maxRound : round );

    displayRounds();
}


/*** TIMER DISPLAY ***/


function displayRoundTimer( endTime, state ) {
    let timerSpan = id('roundTimer');
    if ( state !== "active" ) {
        timerSpan.innerText = "(" + state.charAt(0).toUpperCase() + state.slice(1) + ")";
        id( 'bracketDisplay' ).style.display = "none";
        id( 'submit' ).style.display = "none";
    }
    else if ( endTime ) {
        const displayTime = getDisplayTime( endTime );
        timerSpan.style.display = "block";
        timerSpan.innerHTML = "<span style='font-weight: bold;'>Round Ends:</span> " + displayTime;
    }
}


/*** BRACKET INTERACTION ***/


function registerChoice( matchId, isTop ) {
    if ( mode === "open" ) {
        let match = bracket.getMatchFromId( matchId );
        let winner = isTop ? match.top : match.bottom;
        const winnerChange = winner !== match.winner;
        match.winner = winner;

        if ( winnerChange ) {
            bracket.updateCurrent();

            let matchButtons = nm( getMatchId( match ) );
            for ( let i = 0; i < matchButtons.length; i++ ) {
                matchButtons[i].classList.remove( "blinkBorder" );
            }

            let next = bracket.getNextMatch( matchId );
            if ( next.match ) {
                updateMatch( next.match, match.winner, next.isTop );
                next = bracket.getNextMatch( getMatchId( next.match ) );

                while ( next.match ) {
                    updateMatch( next.match, null, next.isTop );
                    next = bracket.getNextMatch( getMatchId( next.match ) );
                }
            }
        }

        if ( ( display.isMobile && round < bracket.getCurrentRound() ) ||
             ( display.isLarge  && round < bracket.getCurrentRound() && round < ( bracket.getMaxRounds() - 2 ) ) ) {
            changeRound( "next" );
        }
    }
    else {
        //todo 5
    }
}

function updateMatch( match, winner, isTopChange ) {
    isTopChange ? match.top = winner : match.bottom = winner;
    match.winner = null;

    let matchId = getMatchId( match );
    let matchButtons = nm( matchId );
    matchButtons[isTopChange ? 0 : 1].innerHTML = getDisplayName( winner );
    const imageId = getImageId( matchId, isTopChange );
    let imageSource = winner ? (isTopChange ? match.top.image : match.bottom.image) : "images/question.jpg";
    id( imageId ).setAttribute( "src", imageSource );
    adjustFontSize( id( "round" + match.round ) );

    const activateBlink = match.top && match.bottom;
    for ( let i = 0; i < matchButtons.length; i++ ) {
        let classList = matchButtons[i].classList;
        classList.remove( "selectedButton" );
        activateBlink ? classList.remove( "staticInverseButton" ) : classList.add( "staticInverseButton" );
        activateBlink ? classList.add( "blinkBorder" )                   : classList.remove( "blinkBorder" );
        activateBlink ? classList.add( "inverseButton" )                 : classList.remove( "inverseButton" );
    }
}

function submit() {
    if ( endTime >= new Date() ) {
        if ( mode === "open" ) {
            let winner = bracket.getWinner();
            if ( winner ) {
                showMessage( "Winner",
                    "The winner is:<br/>" +
                    "<strong>" + winner.name + "!</strong><br/><br/>" +
                    "<img src='" + winner.image + "' alt='winner' style='height: 12em'>" );
            }
            else {
                showToaster( "Must complete bracket..." );
            }
        }
        else if ( mode === "round" ) {

        }
        else if ( mode === "match" ) {

        }

        //viewResults();
    }
    else {
        showToaster( "This round has closed." );
    }
}


/*** RESULTS ***/


function viewResults() {
    //todo 6
}


/*** UTILITY ***/


function getMatchId( match )
{
    return "r" + match.round + "m" + match.match;
}

function getButtonIds( matchId )
{
    return [
        matchId + "T",
        matchId + "B"
    ];
}

function getButtonId( matchId, isTop )
{
    return matchId + (isTop?"T":"B");
}

function getImageId( matchId, isTop )
{
    return matchId + "Image" + (isTop?"T":"B");
}

function getDisplayName( entry ) {
    let name = entry ? entry.name : "TBD";
    if ( !( name === "Bye" || name === "TBD" ) ) {
        name = "" + entry.seed + ". " + name;
    }
    return name;
}