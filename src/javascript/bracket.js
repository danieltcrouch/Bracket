class Bracket {
    constructor() {
        this.entryCount = arguments[0].length;
        this.magnitude = Math.pow( 2, Math.ceil( Math.log2( this.entryCount ) ) );
        this.roundCount = Math.log2( this.magnitude );
        this.entries = Bracket.parseEntries( arguments[0] );
        this.bracket = Bracket.constructBracket( this.magnitude, this.roundCount, this.entries );

        let winners = ( arguments.length > 1 && arguments[1] ) ? arguments[1] : [];
        let hasByes = this.magnitude > this.entryCount;
        Bracket.parseWinners( winners, this.bracket, hasByes );

        let current = Bracket.seekCurrentMatch( this.bracket );
        this.currentRound = current.round;
        this.currentMatch = current.match;
    }

    static parseEntries( entries ) {
        if ( typeof entries[0] === "string" ) {
            entries = entries.map( function( e ) { return { title: e }; } );
        }

        for ( let i = 0; i < entries.length; i++ ) {
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

    isLastRound( round ) {
        return round === this.roundCount;
    }

    getMaxRounds() {
        return this.roundCount; //only includes rounds with matches
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

    getMatchesFromRound( round, includeByes ) {
        return this.bracket[round].filter( m => !m.bye || includeByes );
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

    getMatches( includeByes ) {
        return this.bracket.reduce( (result, r) => { return result.concat( r ); }, [] ).filter( m => !m.bye || includeByes );
    }

    toString() {
        return this.entries.map( e => e.title ).join( "," );
    }
}

const BUTTON_WIDTH          = "12rem";
const BUTTON_TEXT_HEIGHT    = "3rem";
const BUTTON_PADDING        = ".5rem";
const BUTTON_B_MARGIN       = ".75rem";
const MATCH_B_MARGIN        = "1.5rem";
const TOTAL_MATCH_HEIGHT    = "7.5rem"; //(BUTTON_TEXT_HEIGHT + BUTTON_B_MARGIN) * 2

let bracket;
let mode;
let isLive;

//todo - Also, use comments to split file into sections

function loadBracket() {
    //todo - cap at 20 chars
    let entries = [
        "Spider-Man",
        "Iron Man",
        "Captain America",
        "Thor",
        "Black Panther",
        "Doctor Strange",
        "Hulk Smash!"
    ];
    let winners = ("B1").split(',').reduce( function( result, w ) { result.push( Array.from( w ) ); return result; }, [] );
    bracket = new Bracket( entries, winners );
    mode = "all";
    isLive = true;
    displayBracket();

    if ( !isLive ) {
        id( 'submit' ).style.display = "inline";
    }
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

        let matches = bracket.getMatchesFromRound( i, true );
        for ( let j = 0; j < matches.length; j++ ) {
            let match = matches[j];
            let matchDiv = document.createElement( "DIV" );
            matchDiv.style.display = "flex";
            matchDiv.style.flexDirection = "column";
            matchDiv.style.marginBottom = MATCH_B_MARGIN;

            matchDiv = getMatch( matchDiv, match );

            if ( i > 0 && j > 0 )
            {
                insertFiller( roundDiv, 1 + ( 2 * ( i - 1 ) ) );
            }

            roundDiv.appendChild( matchDiv );
        }
        div.appendChild( roundDiv );
        adjustFontSize( roundDiv );
    }

    setClickableMatches( div, mode );
}

function getMatch( matchDiv, match ) {
    const matchId = getMatchId( match );
    let buttonTop = getButtonFromEntry( match.top, true, matchId );
    let buttonBottom = getButtonFromEntry( match.bottom, false, matchId, match.bye );
    matchDiv.appendChild( buttonTop );
    matchDiv.appendChild( buttonBottom );
    return matchDiv;
}

function getMatchId( match )
{
    return "r" + match.round + "m" + match.match;
}

function getButtonFromEntry( entry, isTop, matchId, isBye ) {
    entry = entry || {title: (isBye ? "Bye" : "TBD"), seed: 0};

    let result = document.createElement( "BUTTON" );
    result.innerHTML = getDisplayName( entry );
    result.id = matchId + (isTop ? "T" : "B");
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

function getDisplayName( entry ) {
    let title = entry.title;
    if ( !( title === "Bye" || title === "TBD" ) ) {
        title = "" + entry.seed + ". " + title;
    }

    return title;
}

function insertFiller( roundDiv, count ) {
    for ( let i = 0; i < count; i++ ) {
        let fillerDiv = document.createElement( "DIV" );
        fillerDiv.style.display = "flex";
        fillerDiv.style.flexDirection = "column";
        fillerDiv.style.marginBottom = MATCH_B_MARGIN;
        fillerDiv.style.height = TOTAL_MATCH_HEIGHT;
        //fillerDiv.style.borderStyle = "solid";
        //fillerDiv.style.borderWidth = "1px";
        roundDiv.appendChild( fillerDiv );
    }
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

function setClickableMatches( div, mode ) {
    let buttons = div.getElementsByTagName( "BUTTON" );
    for ( let i = 0; i < buttons.length; i++ ) {
        buttons[i].classList.add( "staticInverseButton" );
    }

    let matches = bracket.getMatches( true );
    for ( let i = 0; i < matches.length; i++ ) {
        if ( matches[i].winner ) {
            const matchId = getMatchId( matches[i] );
            const winnerId = matchId + ( matches[i].winner.seed === matches[i].top.seed ? "T" : "B" );
            let matchButtons = nm( matchId );
            for ( let j = 0; j < matchButtons.length; j++ ) {
                matchButtons[j].classList.remove( "staticInverseButton" );
                matchButtons[j].classList.add( matchButtons[j].id === winnerId ? "staticSelectedButton" : "staticInverseButton" );
            }
        }
    }

    switch ( mode ) {
    case "match":
        let matchButtons = nm( bracket.getCurrentMatchId() );
        for ( let i = 0; i < matchButtons.length; i++ ) {
            matchButtons[i].classList.add( "blinkBorder" );
            matchButtons[i].classList.remove( "staticInverseButton" );
            matchButtons[i].classList.add( "inverseButton" );
        }
        break;
    case "round":
        for ( let i = 0; i < buttons.length; i++ ) {
            let round = parseInt( buttons[i].parentElement.parentElement.id );
            if ( bracket.getCurrentRound() === round ) {
                buttons[i].classList.add( "blinkBorder" );
                buttons[i].classList.remove( "staticInverseButton" );
                buttons[i].classList.add( "inverseButton" );
            }
        }
        break;
    case "all":
    default:
        for ( let i = 0; i < matches.length; i++ ) {
            let match = matches[i];
            if ( !matches[i].winner &&
                match.top && match.top.seed &&
                match.bottom && match.bottom.seed ) {
                let matchButtons = nm( getMatchId( match ) );
                for ( let j = 0; j < matchButtons.length; j++ ) {
                    matchButtons[j].classList.add( "blinkBorder" );
                    matchButtons[j].classList.remove( "staticInverseButton" );
                    matchButtons[j].classList.add( "inverseButton" );
                }
            }
        }
    }
}

function registerChoice( matchId, isTop ) {
    if ( isLive ) {
        let match = bracket.getMatchFromId( matchId );
        let winner = isTop ? match.top : match.bottom;
        const winnerChange = winner !== match.winner;
        match.winner = winner;

        if ( winnerChange ) {
            let matchButtons = nm( getMatchId( match ) );
            for ( let i = 0; i < matchButtons.length; i++ ) {
                matchButtons[i].classList.remove( "blinkBorder" );
            }

            let next = bracket.getNextMatch( matchId );
            if ( next.match ) {
                next.isTop ? next.match.top = match.winner : next.match.bottom = match.winner;

                let nextMatchId = getMatchId( next.match );
                let nextMatchButtons = nm( nextMatchId );
                nextMatchButtons[next.isTop ? 0 : 1].innerHTML = getDisplayName( match.winner );
                adjustFontSize( id( "round" + next.match.round ) );

                if ( next.match.top && next.match.bottom ) {
                    for ( let i = 0; i < nextMatchButtons.length; i++ ) {
                        nextMatchButtons[i].classList.add( "blinkBorder" );
                        nextMatchButtons[i].classList.remove( "staticInverseButton" );
                        nextMatchButtons[i].classList.add( "inverseButton" );
                    }
                }

                next = bracket.getNextMatch( nextMatchId );
                while ( next.match ) {
                    next.isTop ? next.match.top = null : next.match.bottom = null;

                    nextMatchId = getMatchId( next.match );
                    nextMatchButtons = nm( nextMatchId );
                    nextMatchButtons[next.isTop ? 0 : 1].innerHTML = getDisplayName( { title: "TBD" } );
                    adjustFontSize( id( "round" + next.match.round ) );

                    for ( let i = 0; i < nextMatchButtons.length; i++ ) {
                        nextMatchButtons[i].classList.remove( "blinkBorder" );
                        nextMatchButtons[i].classList.remove( "inverseButton" );
                        nextMatchButtons[i].classList.add( "staticInverseButton" );
                    }

                    next = bracket.getNextMatch( nextMatchId );
                }
            }
            else {
                alert( "The winner is: " + match.winner.title + "!" );
            }
        }
    }
    else {
        alert( matchId + ": " + (isTop ? "top" : "bottom") );
    }
}