//todo 9 - look for const variables (this and other new files)
const ENTRIES_PER_MATCH = 2;

const BLANK_IMAGE = "images/blank.jpg";
const QUESTION_IMAGE = "images/question.jpg";

class Entry extends Choice {
    constructor( seed, name, image ) {
        super( seed, name, image );
    }

    static getEntry( entries, seed ) {
        return Choice.getChoice( entries, seed );
    }

    static mapToSeeds( entries ) {
        return this.mapToIds( entries );
    }

    static isEmpty( entry ) {
        return entry.getId() === null;
    }

    static getByeEntry() {
        return new Entry( null, "Bye", BLANK_IMAGE );
    }

    static getUnknownEntry() {
        return new Entry( null, "TBD", QUESTION_IMAGE );
    }

    getDisplayName() {
        let result = this.getName();
        if ( !Entry.isEmpty( this ) ) {
            result = this.getDisplaySeed() + ". " + this.getName();
        }
        return result;
    }

    getDisplaySeed() {
        return Entry.isEmpty( this ) ? "" : "" + (this.getSeed() + 1);
    }

    getName() {
        return this.getText();
    }

    getSeed() {
        return this.getId();
    }
}

class Match extends ChoiceSet {
    constructor( id, entries, isBye ) {
        super( id, entries );
        this.isBye = isBye;

        while ( !this.hasLength( ENTRIES_PER_MATCH ) ) {
            this.addChoice( Entry.getUnknownEntry() );
        }

        if ( isBye ) {
            this.setWinnerSeed( this.getTopEntry().getSeed() )
        }
    }

    static getMatch( matches, matchId ) {
        return ChoiceSet.getChoiceSet( matches, matchId );
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
        return this.hasLength( ENTRIES_PER_MATCH ) && ( this.isByeMatch() || this.getAllEntries().every( e => !Entry.isEmpty( e ) ) );
    }

    isEntryTop( seed ) {
        return this.getTopEntry().getSeed() === seed;
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
        return this.getAllEntries()[0];
    }

    setTopEntry( entry ) {
        if ( entry ) {
            this.getAllEntries()[0] = entry;
        }
    }

    getBottomEntry() {
        return this.getAllEntries()[1];
    }

    setBottomEntry( entry ) {
        if ( entry ) {
            this.getAllEntries()[1] = entry;
        }
    }

    setWinnerSeed( seed ) {
        this.setAnswerId( seed );
    }

    getWinner() {
        return this.getAnswer();
    }

    getWinnerSeed() {
        return this.getAnswerId();
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

        this.magnitude = Bracket.getMagnitude( this.getSize() );
        this.roundCount = Math.log2( this.magnitude );
    }

    static createBracket( rawEntries, rawWinners ) {
        let result = Bracket.parseBracket( rawEntries );
        result.setWinners( Bracket.parseWinners( rawWinners, result.getMaxSize(), result.getAllMatches() ) );
        return result;
    }

    static parseBracket( rawEntries ) {
        let entries = Bracket.parseEntries( rawEntries );
        let matches = [];

        let bracketSize = Math.pow( 2, Math.ceil( Math.log2( entries.length ) ) );
        let roundCount  = Math.log2( bracketSize );
        let matchCount  = bracketSize / 2;

        let roundSeeds = Bracket.getRoundSeeds( roundCount - 1 );
        for ( let roundIndex = 0; roundIndex < roundCount; roundIndex++ ) {
            const isFirstRound = roundIndex === 0;
            for ( let matchIndex = 0; matchIndex < matchCount; matchIndex++ ) {
                let matchEntries = [];
                let isByeMatch = false;
                for ( let i = 0; i < ENTRIES_PER_MATCH; i++ ) {
                    let seed = roundSeeds[matchIndex * 2 + i];
                    isByeMatch = (roundIndex === 0) && seed >= entries.length;
                    let isBottomOfBye = isByeMatch && (i % 2 === 1);
                    let entry = isBottomOfBye ? Entry.getByeEntry() : entries[ seed ];
                    entry = isFirstRound ? entry : Entry.getUnknownEntry();
                    matchEntries.push( entry );
                }
                matches.push( new Match( Match.getMatchId( roundIndex, matchIndex ), matchEntries, isByeMatch ) );
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
            rawEntry.image = rawEntry.image || DEFAULT_IMAGE;
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

    static parseWinners( rawWinners, bracketSize, matches ) {
        let result = [];

        if ( rawWinners ) {
            let roundCount  = Math.log2( bracketSize );
            let matchCount  = bracketSize / 2;

            let topWinners = rawWinners.split('');
            let winnerIndex = 0;
            for ( let roundIndex = 0; roundIndex < roundCount; roundIndex++ ) {
                for ( let matchIndex = 0; matchIndex < matchCount && winnerIndex < topWinners.length; matchIndex++ ) {
                    let matchId = Match.getMatchId( roundIndex, matchIndex );
                    let isTop = topWinners[winnerIndex] === "1";
                    let seed = Match.getMatch( matches, matchId ).getEntry( isTop ).getSeed();
                    result.push( { matchId: matchId, seed: seed } );
                    winnerIndex++;
                }
                matchCount /= 2;
            }
        }

        return result;
    }

    static getMagnitude( size ) {
        return Math.pow( 2, Math.ceil( Math.log2( size ) ) );
    }

    static getActiveId( bracket, mode ) {
        let result = "";
        switch ( mode )
        {
        case "match":
            result = bracket.getCurrentMatch().getId();
            break;
        case "round":
            result = "r" + bracket.getCurrentRoundIndex();
            break;
        }
        return result;
    }

    getSerializedWinners() {
        let winners = this.getWinners().map( w => { return this.getMatchFromId( w.matchId ).isEntryTop( w.seed ) ? "1" : "0"; } ).join("");
        return winners || null;
    }

    getWinners() {
        return this.getAnswers().map( a => { return {matchId: a.choiceSetId, seed: a.choiceId}; } );
    }

    setWinners( winners ) {
        winners = winners ? winners.map( w => { return {choiceSetId: w.matchId || w.choiceSetId, choiceId: w.seed || w.choiceId}; } ) : null;
        this.setAnswers( winners );
        this.retroWinners();
        this.pushWinners();
    }

    pushWinners() {
        const matchIds = ChoiceSet.mapToIds( this.getAllMatches() );
        matchIds.forEach( id => this.pushWinner( id ) );
    }

    pushWinner( matchId ) {
        //start from the first round and push entries based on winners
        let match = this.getMatchFromId( matchId );
        let winner = match.getWinner();
        let next = this.getNextMatchAndPosition( matchId );
        if ( next && winner ) {
            let nextMatch = next.match;
            nextMatch.setEntry( winner, next.isTop );
        }
    }

    getNextMatchAndPosition( matchId ) {
        let result = {
            match: this.getNextMatch( matchId ),
            isTop: this.isTopForNextMatch( matchId )
        };
        const isValid = !!result.match;
        return isValid ? result : null;
    }

    getNextMatch( matchId ) {
        let result = null;
        if ( matchId ) {
            let indexes = Match.parseMatchId( matchId );
            let nextRound = indexes.roundIndex + 1;
            if ( nextRound !== this.getMaxRounds() ) {
                result = this.getMatchFromId( Match.getMatchId( nextRound, Math.floor(indexes.matchIndex / 2) ) );
            }
        }
        return result;
    }

    isTopForNextMatch( matchId ) {
        return Match.parseMatchId( matchId ).matchIndex % 2 === 0;
    }

    retroWinners() {
        //start from the final match and recursively back-fill missing entries and winners
        const matchIds = ChoiceSet.mapToIds( this.getAllMatches() ).reverse();
        matchIds.forEach( id => this.retroWinner( id, this.getMatchFromId( id ).getWinnerSeed() ) );
    }

    retroWinner( matchId, winnerSeed ) {
        let result = null;
        if ( winnerSeed !== null ) {
            let match = this.getMatchFromId( matchId );
            if ( !match.isReady() ) {
                let prev = this.getPreviousMatches( matchId );
                if ( prev ) {
                    if ( Entry.isEmpty( match.getTopEntry() ) ) {
                        match.setTopEntry( this.retroWinner( prev.top.getId(), match.getWinnerSeed() || winnerSeed ) );
                    }
                    if ( Entry.isEmpty( match.getBottomEntry() ) ) {
                        match.setBottomEntry( this.retroWinner( prev.bottom.getId(), match.getWinnerSeed() || winnerSeed ) );
                    }
                }
            }

            if ( !match.getWinnerSeed() ) {
                let isWinnerPresent = !!match.getEntryFromSeed( winnerSeed );
                let matchWinnerSeed = isWinnerPresent ? winnerSeed : Math.min( match.getTopEntry().getSeed(), match.getBottomEntry().getSeed() );
                match.setWinnerSeed( matchWinnerSeed );
            }
            result = match.getWinner();
        }
        return result;
    }

    getPreviousMatches( matchId ) {
        let result = null;
        if ( matchId ) {
            let indexes = Match.parseMatchId( matchId );
            if ( indexes.roundIndex > 0 ) {
                let prevRound   = indexes.roundIndex - 1;
                let topIndex    = indexes.matchIndex * 2;
                let bottomIndex = indexes.matchIndex * 2 + 1;
                result = {
                    top:    this.getMatchFromId( Match.getMatchId( prevRound, topIndex ) ),
                    bottom: this.getMatchFromId( Match.getMatchId( prevRound, bottomIndex ) )
                };
            }
        }
        return result;
    }

    getEntryFromSeed( seed ) {
        return this.getChoiceFromId( seed );
    }

    getEntriesFromSeeds( seeds ) {
        return this.getChoicesFromIds( seeds );
    }

    getCurrentRoundIndex() {
        return this.getCurrentMatch() ? this.getCurrentMatch().getRoundIndex() : -1;
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

    isFinished() {
        return !!this.getFinalWinner();
    }

    getMatchesFromRound( roundIndex ) {
        return this.getAllMatches().filter( m => m.getRoundIndex() === roundIndex );
    }

    getAllMatches() {
        return this.getAllChoiceSets();
    }

    getAllEntries() {
        return this.getAllChoices();
    }

    getAllChoices() {
        let entries = this.getMatchesFromRound( 0 ).reduce( function( entries, match ) { return entries.concat( match.getAllEntries() ); }, [] );
        return entries.filter( e => !Entry.isEmpty( e ) );
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
    let div = id( 'surveyDisplay' );
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
        let isTop = i === 0;
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
    image.setAttribute( "src", entry.getImage() );
    return image;
}

function getButtonFromEntry( entry, matchId, isByeEntry, isTop ) {
    let button = getButton();
    button.id = getButtonId( matchId, isTop );
    button.innerHTML = entry.getDisplayName();
    button.name = matchId;
    button.onclick = function() {
        registerBracketChoice( matchId, isTop );
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


function registerBracketChoice( matchId, isTop ) {
    let match = survey.getMatchFromId( matchId );
    let winner = match.getEntry( isTop );
    const winnerChange = winner !== match.getWinner();
    match.setWinnerSeed( winner.getSeed() );

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
    if ( nextMatchAndPosition ) {
        newEntry = newEntry || Entry.getUnknownEntry();
        let match = nextMatchAndPosition.match;
        let isTop = nextMatchAndPosition.isTop;
        match.setWinnerSeed( null );
        match.setEntry( newEntry, isTop );

        id( getButtonId( match.getId(), isTop ) ).innerHTML = newEntry.getDisplayName();
        let imageSource = newEntry ? newEntry.getImage() : "images/question.jpg";
        id( getImageId( match.getId(), isTop ) ).setAttribute( "src", imageSource );
        adjustFontSize( id( "round" + match.getRoundIndex()) );

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

function getRelevantMatches( forSubmission = false ) {
    let result = [];
    if ( isInProgress( state ) ) {
        switch ( mode ) {
        case "match":
            result = [survey.getMatchFromId( activeId )];
            break;
        case "round":
            result = survey.getMatchesFromRound( parseInt( activeId.substring( 1 ) ) );
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
    }
    return result;
}