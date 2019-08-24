//todo 9 - look for const variables (this and other new files)
const ENTRIES_PER_MATCH = 2;

class Entry extends Choice {
    constructor( seed, name, image ) {
        super( seed, name, image );
    }

    static getEntry( entries, seed ) {
        return this.getChoice( entries, seed );
    }

    static mapToSeeds( entries ) {
        return this.mapToIds( entries );
    }

    getDisplayName() {
        return "" + this.getDisplaySeed() + ". " + this.getName();
    }

    getDisplaySeed() {
        return this.getSeed() + 1;
    }

    getName() {
        return this.getText();
    }

    getSeed() {
        return this.getId();
    }
}

class Match extends ChoiceSet {
    constructor( entries, isBye ) {
        super( entries );
        this.isBye = isBye;
        if ( isBye ) {
            const winnerSeed = this.getTopEntry() ? this.getTopEntry().getSeed() : null;
            this.setWinnerSeed( winnerSeed )
        }
    }

    static parseMatchId( matchId ) {
        let roundIndex = parseInt( matchId.split('m')[0].substring( 1 ) );
        let matchIndex = parseInt( matchId.split('m')[1] );
        return {roundIndex: roundIndex, matchIndex: matchIndex };
    }

    static getMatchId( roundIndex, matchIndex ) {
        return "r" + roundIndex + "m" + matchIndex;
    }

    static filterByes( matches ) {
        return matches.filter( m => !m.isByeMatch() );
    }

    isReady() {
        return this.getAllEntries().filter( Boolean ).length === ENTRIES_PER_MATCH;
    }

    isEntryTop( seed ) {
        let top = this.getTopEntry();
        return top ? top.getSeed() === seed : false;
    }

    getEntryFromSeed( seed ) {
        return this.getChoiceFromId( seed );
    }

    getEntry( isTop ) {
        return isTop ? this.getTopEntry() : this.getBottomEntry();
    }

    setEntry( entry, isTop ) {
        isTop ? this.setTopEntry( entry ) : this.setBottomEntry( entry );
    }

    getTopEntry() {
        return this.hasContents() ? this.getAllEntries()[0] : null;
    }

    setTopEntry( entry ) {
        return this.getAllEntries()[0] = entry;
    }

    getBottomEntry() {
        return this.hasIndex( 1 ) ? this.getAllEntries()[1] : null;
    }

    setBottomEntry( entry ) {
        return this.getAllEntries()[1] = entry;
    }

    setWinnerSeed( seed ) {
        this.setAnswerId( seed );
    }

    getWinner() {
        return this.getAnswer();
    }

    getAllEntries() {
        return this.getAllChoices();
    }

    getRoundIndex() {
        return Match.parseMatchId( this.getId() ).roundIndex;
    }

    isByeMatch() {
        return this.isBye;
    }
}

class Bracket extends Survey {
    constructor( matches ) {
        super( matches );

        this.magnitude = Math.pow( 2, Math.ceil( Math.log2( this.getSize() ) ) );
        this.roundCount = Math.log2( this.magnitude );
    }

    static createBracket( rawEntries, rawWinners ) {
        let result = Bracket.parseBracket( rawEntries );
        result.setWinners( Bracket.parseWinners( rawWinners, result.getMaxSize() ) );
        result.pushWinners();
        return result;
    }

    static parseBracket( rawEntries ) {
        let entries = Bracket.parseEntries( rawEntries );
        let matches = [];

        let bracketSize = Math.pow( 2, Math.ceil( Math.log2( entries.length ) ) );
        let roundCount  = Math.log2( bracketSize );
        let matchCount  = bracketSize / 2;

        let roundSeeds = Bracket.getRoundSeeds( roundCount );
        for ( let roundIndex = 0; roundIndex < roundCount; roundIndex++ ) {
            for ( let matchIndex = 0; matchIndex < matchCount; matchIndex++ ) {
                let topEntry    = Entry.getEntry( roundSeeds[matchIndex * 2] );
                let bottomEntry = Entry.getEntry( roundSeeds[matchIndex * 2 + 1] );
                let isBye = ( roundIndex === 0 ) ? ( roundSeeds[matchIndex * 2 + 1] - 1 >= entries.length ) : false;
                let matchEntries = [ topEntry, bottomEntry ];
                matches.push( new Match( matchEntries, isBye ) );
            }
            matchCount /= 2;
        }

        return new Bracket( matches );
    }

    static parseEntries( rawEntries ) {
        let result = [];
        for ( let i = 0; i < rawEntries.length; i++ ) {
            let rawEntry = rawEntries[i];
            rawEntry = ( typeof rawEntry === "string" ) ? { name: rawEntry, image: null } : rawEntry;
            rawEntry.image = rawEntry.image || "images/profile.jpg";
            result.push( new Entry( i, rawEntry.name, rawEntry.image ) );
        }
        return result;
    }

    static getRoundSeeds( roundCount ) {
        let result = [1, 2];
        for ( let i = 0; i < roundCount; i++ ) {
            let temp = [];
            let length = result.length * 2 + 1;
            result.forEach( function( seed ) {
                temp.push( seed );
                temp.push( length - seed );
            } );
            result = temp;
        }
        return result.map( seed => seed - 1 ); //base zero
    }

    static parseWinners( rawWinners, bracketSize ) {
        let result = [];

        let roundCount  = Math.log2( bracketSize );
        let matchCount  = bracketSize / 2;

        let topWinners = rawWinners.split('');
        let winnerIndex = 0;
        for ( let roundIndex = 0; roundIndex < roundCount; roundIndex++ ) {
            for ( let matchIndex = 0; matchIndex < matchCount; matchIndex++ ) {
                result.push( { matchId: Match.getMatchId( roundIndex, matchIndex ), seed: topWinners[winnerIndex] } );
                winnerIndex++;
            }
            matchCount /= 2;
        }

        return result;
    }

    getSerializedWinners() {
        return this.getWinners().map( w => { return this.getMatchFromId( w.matchId ).isEntryTop( w.seed ) ? "1" : "0"; } ).join();
    }

    setWinners( winners ) {
        this.setAnswers( winners.map( w => { return {choiceSetId: w.matchId, choiceId: w.seed}; } ) );
    }

    getWinners() {
        this.getAnswers().map( a => { return {matchId: a.choiceSetId, seed: a.choiceId}; } );
    }

    pushWinners() {
        const matchIds = ChoiceSet.mapToIds( this.getAllMatches() );
        matchIds.forEach( id => this.pushWinner( id ) );
    }

    pushWinner( matchId ) {
        let match = this.getMatchFromId( matchId );
        let winner = match.getWinner();
        let next = this.getNextMatchAndPosition( matchId );
        let nextMatch = next.match;
        if ( nextMatch ) {
            nextMatch.setEntry( winner, next.isTop );
            if ( nextMatch.getWinner() &&
                !nextMatch.getEntryFromSeed( nextMatch.getWinner().getSeed() ) ) {
                nextMatch.setWinnerSeed( null );
            }
        }
    }

    getPreviousMatches( matchId ) {
        let result = null;
        let indexes = Match.parseMatchId( matchId );
        if ( indexes.roundIndex === 0 ) {
            let prevRound   = indexes.roundIndex - 1;
            let topIndex    = indexes.matchIndex * 2;
            let bottomIndex = indexes.matchIndex * 2 + 1;
            result = {
                top:    this.getMatchFromId( Match.getMatchId( prevRound, topIndex ) ),
                bottom: this.getMatchFromId( Match.getMatchId( prevRound, bottomIndex ) )
            };
        }
        return result;
    }

    getNextMatchAndPosition( matchId ) {
        let result = {
            match: this.getNextMatch( matchId ),
            isTop: this.isTopForNextMatch( matchId )
        };
        const isValid = result.match === null;
        return isValid ? result : null;
    }

    getNextMatch( matchId ) {
        let result = null;
        let indexes = Match.parseMatchId( matchId );
        let nextRound = indexes.roundIndex + 1;
        if ( nextRound !== this.getMaxRounds() ) {
            result = this.getMatchFromId( Match.getMatchId( nextRound, Math.floor(indexes.matchIndex / 2) ) );
        }
        return result;
    }

    isTopForNextMatch( matchId ) {
        const nextMatch = this.getNextMatch( matchId );
        return nextMatch ? ( Match.parseMatchId( nextMatch.getId() ).matchIndex % 2 === 0 ) : null;
    }

    getEntryFromSeed( seed ) {
        return this.getChoiceFromId( seed );
    }

    getEntriesFromSeeds( seeds ) {
        return this.getChoicesFromIds( seeds );
    }

    getCurrentRoundIndex() {
        return this.getCurrentMatch().getRoundIndex();
    }

    getCurrentMatch() {
        return this.getCurrentChoiceSet();
    }

    getMatchFromIndexes( roundIndex, matchIndex ) {
        return this.getMatchFromId( Match.getMatchId( roundIndex, matchIndex ) );
    }

    getMatchFromId( id ) {
        return this.getChoiceSetFromId( id );
    }

    getMatchesFromIds( ids ) {
        return this.getChoiceSetsFromIds( ids );
    }

    getFinalMatch() {
        return this.getAllMatches()[ this.getSize() - 1 ];
    }

    getFinalWinner() {
        return this.getFinalMatch().getWinner();
    }

    getMatchesFromRound( roundIndex ) {
        return this.getAllMatches().filter( m => m.getRound() === roundIndex );
    }

    getAllMatches() {
        return this.getAllChoiceSets();
    }

    getAllEntries() {
        return this.getAllChoices();
    }

    getMaxRounds() {
        return this.roundCount; //only includes rounds with matches
    }

    getMaxSize() {
        return this.magnitude;
    }
}


/******************************* DISPLAY *******************************/


function displayBracket() {
    let div = id( 'bracketDisplay' );
    div.style.display = "flex";
    div.style.justifyContent = "center";
    div.innerHTML = "";

    for ( let i = 0; i < survey.getMaxRounds(); i++ ) {
        let roundDiv = document.createElement( "DIV" );
        roundDiv.id = "round" + i;
        roundDiv.style.display = "flex";
        roundDiv.style.flexDirection = "column";
        roundDiv.style.justifyContent = "center";
        roundDiv.style.marginLeft = "1em";

        let matches = survey.getMatchesFromRound( i );
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
    setDisplayType();
}

function getMatch( matchDiv, match ) {
    const entries = match.getAllEntries();
    for ( let i = 0; i < entries.length; i++ ) {
        const entry = entries[i];
        let entryDiv = document.createElement( "DIV" );
        entryDiv.style.display = "flex";
        let isTop = match.isEntryTop( entry.getSeed() );
        let isByeEntry = match.isByeMatch() && !isTop;
        let image = getImageFromEntry(   entry, match.getId(), isByeEntry, isTop );
        let button = getButtonFromEntry( entry, match.getId(), isByeEntry, isTop );
        entryDiv.appendChild( image );
        entryDiv.appendChild( button );
        matchDiv.appendChild( entryDiv );
    }
    return matchDiv;
}

function getImageFromEntry( entry, matchId, isByeEntry, isTop ) {
    let image = getImage();
    image.id = getImageId( matchId, isTop );

    let source = entry ? entry.getImage() : ( isByeEntry ? "images/blank.jpg" : "images/question.jpg" );
    image.setAttribute( "src", source );

    return image;
}

function getButtonFromEntry( entry, matchId, isByeEntry, isTop ) {
    let button = getButton();
    button.id = getButtonId( matchId, isTop );

    button.innerHTML = getEntryDisplayName( entry, isByeEntry );
    button.name = matchId;
    button.onclick = function() {
        registerBracketChoice( matchId, entry.getSeed() );
    };

    return button;
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

function setClickableMatches() {
    const matches = survey.getAllMatches();
    for ( let i = 0; i < matches.length; i++ ) {
        const match = matches[i];
        const matchId = match.getId();
        freezeRadioButtons( matchId );

        let winner = match.getWinner();
        if ( winner ) {
            const winnerId = getButtonId( matchId, match.isEntryTop( winner.getSeed() ) );
            selectRadioButton( winnerId, true );
        }
    }

    let relevantMatches = getRelevantMatches();
    for ( let i = 0; i < relevantMatches.length; i++ ) {
        if ( relevantMatches[i].isReady() ) {
            setClickable( relevantMatches[i].getId() );
        }
    }
}


/*** ROUND DISPLAY ***/


function setDisplayType() {
    if ( isEditable( state ) ) {
        window.onresize = updateMobile;
        round = Math.abs( survey.getCurrentRoundIndex() );
        display = {
           isLarge:  survey.getMaxSize() > 32,
           isMobile: isMobile()
        };

        displayRounds();
    }
    else {
        hideMobileDisplay();
    }
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
    for ( let i = 0; i < survey.getMaxRounds(); i++ ) {
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

    for ( let i = 0; i < survey.getMaxRounds(); i++ ) {
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
    for ( let i = 0; i < survey.getMaxRounds(); i++ ) {
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
    else if ( round === survey.getMaxRounds() - 1 || ( display.isLarge && round === survey.getMaxRounds() - 2 ) ) {
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

    let maxRound = survey.getMaxRounds() - 1;
    round = round < 0 ? 0 : ( round > maxRound ? maxRound : round );

    displayRounds();
}


/*** INTERACTION ***/


function registerBracketChoice( matchId, seed ) {
    let match = survey.getMatchFromId( matchId );
    let winner = match.getEntryFromSeed( seed );
    const winnerChange = winner !== match.getWinner();
    match.setWinner( winner.getSeed() );

    if ( mode === "open" && winnerChange ) {
        let matchButtons = nm( matchId );
        for ( let i = 0; i < matchButtons.length; i++ ) {
            matchButtons[i].classList.remove( "blinkBorder" );
        }

        let next = survey.getNextMatchAndPosition( matchId );
        updateSubsequentMatches( next, match.getWinner() );

        if ( ( display.isMobile && round < survey.getCurrentRoundIndex() ) ||
             ( display.isLarge  && round < survey.getCurrentRoundIndex() && round < ( survey.getMaxRounds() - 2 ) ) ) {
            changeRound( "next" );
        }
    }
}

function updateSubsequentMatches( nextMatchAndPosition, newEntry ) {
    if ( nextMatchAndPosition.match ) {
        let match = nextMatchAndPosition.match;
        let isTop = nextMatchAndPosition.isTop;
        match.setWinnerSeed( null );
        match.setEntry( newEntry, isTop );

        id( getButtonId( match.getId(), isTop ) ).innerHTML = getEntryDisplayName( newEntry );
        let imageSource = newEntry ? newEntry.getImage() : "images/question.jpg";
        id( getImageId( match.getId(), isTop ) ).setAttribute( "src", imageSource );
        adjustFontSize( id( "round" + match.round ) );

        let matchButtons = nm( match.getId() );
        const bothEntriesPresent = match.isReady();
        for ( let i = 0; i < matchButtons.length; i++ ) {
            let classList = matchButtons[i].classList;
            classList.remove( "selectedButton" );
            bothEntriesPresent ? classList.remove( "staticInverseButton" ) : classList.add( "staticInverseButton" );
            bothEntriesPresent ? classList.add( "blinkBorder" )                   : classList.remove( "blinkBorder" );
            bothEntriesPresent ? classList.add( "inverseButton" )                 : classList.remove( "inverseButton" );
        }

        updateSubsequentMatches( survey.getNextMatchAndPosition( match.getId() ), null );
    }
}


/*** SUBMIT ***/


function getBracketVotes() {
    let votes = null;
    let relevantMatches = getRelevantMatches( true )
    if ( areMatchesComplete( relevantMatches ) ) {
        votes = parseVotes( relevantMatches );
    }
    else {
        showToaster( "Must complete unfinished matches..." );
    }
    return votes;
}

function areMatchesComplete( matches ) {
    return matches.every( m => m.getWinner() );
}

function parseVotes( relevantMatches ) {
    relevantMatches = Array.isArray( relevantMatches ) ? relevantMatches : [ relevantMatches ];
    return relevantMatches.map( m => { return { id: m.getId(), vote: m.getWinner().getSeed() } } );
}


/*** UTILITY ***/


function getButtonId( matchId, isTop )
{
    return matchId + (isTop?"T":"B");
}

function getImageId( matchId, isTop )
{
    return matchId + "Image" + (isTop?"T":"B");
}

function getEntryDisplayName( entry, isByeEntry ) {
    return entry ? entry.getDisplayName() : (isByeEntry ? "Bye" : "TBD");
}

function getRelevantMatches( forSubmission = false ) {
    let result = [];
    switch ( mode ) {
    case "match":
        result = [survey.getCurrentMatch()];
        break;
    case "round":
        result = survey.getMatchesFromRound( survey.getCurrentRoundIndex() );
        result = Match.filterByes( result );
        break;
    case "open":
        if ( forSubmission ) {
            result = [survey.getFinalMatch()];
        }
        else {
            result = survey.getAllMatches();
            result = Match.filterByes( result );
        }
    }
    return result;
}