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

    getMaxRounds() {
        return this.roundCount; //only includes rounds with matches
    }

    getCurrentRound() {
        return this.currentRound + 1;
    }

    getMatch() {
        return this.currentMatch + 1;
    }

    getCompletedMatchExtended() {
        return this.currentMatch;
    }

    getMatchExtended() {
        return this.currentMatch + 1;
    }

    getMatchTop( matchId ) { //todo
        return {
            image: "",
            title: "",
            seed: "",
        };
    }

    getMatchBottom( matchId ) { //todo
        return {
            image: "",
            title: "",
            seed: "",
        };
    }

    getEntries() {
        return this.entries;
    }

    getEntriesFromRound( round, includeByes ) {
        return this.bracket[round].filter( m => !m.bye || includeByes ).reduce( (result, m) => { return result.concat( [m.top, m.bottom] ); }, [] );
    }

    getMatchesFromRound( round, includeByes ) {
        return this.bracket[round].filter( m => !m.bye || includeByes );
    }

    getDisplay() {
        return this.entries.map( e => e.title );
    }

    toString() {
        return this.entries.map( e => e.title ).join( "," );
    }
}

let bracket;

function loadBracket() {
    //let entries = ["A", "B", "C", "D"];
    //let entries = ["A", "B", "C", "D", "E"];
    //let entries = ["A", "B", "C", "D", "E", "F", "G", "H"];
    let entries = ["A", "B", "C", "D", "E", "F", "G", "H", "I"];
    //let entries = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P"];
    //let winners = ("B1BBBBBB,110").split(',').reduce( function( result, w ) { result.push( Array.from( w ) ); return result; }, [] );
    //let winners = ("1101").split(',').reduce( function( result, w ) { return result.push( Array.from( w ) ); }, [] );
    //let winners = ["1"];
    let winners = null;
    bracket = new Bracket( entries, winners );
    displayBracket();
}

function displayBracket() {
    let div = id( 'bracketDisplay' );
    div.style.display = "flex";
    div.style.justifyContent = "center";
    div.innerHTML = "";

    for ( let i = 0; i < bracket.getMaxRounds(); i++ ) {
        let roundDiv = document.createElement( "DIV" );
        roundDiv.id = "round" + (i + 1);
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
            matchDiv.style.marginBottom = "1em";

            matchDiv = getMatch( matchDiv, match );

            if ( i > 0 && j > 0 )
            {
                insertFiller( roundDiv, 1 + ( 2 * ( i - 1 ) ) );
            }

            roundDiv.appendChild( matchDiv );
        }
        div.appendChild( roundDiv );
    }
}

function getMatch( matchDiv, match ) {
    //if ( !match.bye ) {
        let buttonTop = getButtonFromEntry( match.top );
        let buttonBottom = getButtonFromEntry( match.bottom, match.bye );
        matchDiv.appendChild( buttonTop );
        matchDiv.appendChild( buttonBottom );
    //}
    //else {
    //    matchDiv.style.height = "7em";
    //    matchDiv.style.borderStyle = "solid";
    //    matchDiv.style.borderWidth = "1px";
    //    matchDiv.style.marginBottom = "2em";
    //}
    return matchDiv;
}

function getButtonFromEntry( e, isBye ) {
    e = e || {title: (isBye ? "Bye" : "TBD"), seed: 0};
    let result = document.createElement( "BUTTON" );
    result.innerHTML = e.title;
    result.id = e.seed;
    result.onclick = function() {
        alert( e.title + ": " + e.seed );
    };
    result.style.width = "8em";
    result.style.marginBottom = ".5em";
    result.classList.add( "button" );
    return result;
}

function insertFiller( roundDiv, count ) {
    for ( let i = 0; i < count; i++ )
    {
        let fillerDiv = document.createElement( "DIV" );
        fillerDiv.style.display = "flex";
        fillerDiv.style.flexDirection = "column";
        fillerDiv.style.marginBottom = "2em";
        fillerDiv.style.height = "7em";
        //fillerDiv.style.borderStyle = "solid";
        //fillerDiv.style.borderWidth = "1px";
        roundDiv.appendChild( fillerDiv );
    }
}