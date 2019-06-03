class Bracket {
    constructor() {
        this.count = arguments[0].length;
        this.countMax = Math.pow( 2, Math.ceil( Math.log2( this.count ) ) );
        this.entries = Bracket.parseEntries( arguments[0] );
        this.bracket = Bracket.constructBracket( this.countMax, this.entries );
        this.currentRound = 0;
        this.currentMatch = 0;

        if ( arguments.length > 1 ) {
            //round winners were passed in; string of 1/0, 1 being the top match won
        }
        else {
            this.round = 1;
            this.match = 1;
        }
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

    static constructBracket( countMax, entries ) {
        let bracket = [];

        let roundCount = 0;
        let matchCount = countMax;
        while ( matchCount > 1 ) {
            let round = [];
            let hasPrev = roundCount > 0;
            let prevRound = hasPrev ? bracket[roundCount - 1] : null;

            matchCount = countMax / Math.pow( 2, roundCount + 1 );
            let roundEntries = matchCount * 2;

            for ( let i = 0; i < matchCount; i++ ) {
                let isBye = (roundEntries - i - 1 >= entries.length);
                let prevMatches = {
                    top:    hasPrev ? prevRound[i * 2] : null,
                    bottom: hasPrev ? prevRound[roundEntries - (i * 2) - 1] : null
                };
                //let nextMatch = Math.ceil( i / 2 );
                let top    = hasPrev ? ( prevMatches.top.winner    || ("w:" + (prevMatches.top.match + 1)) )    : entries[i];
                let bottom = hasPrev ? ( prevMatches.bottom.winner || ("w:" + (prevMatches.bottom.match + 1)) ) : (!isBye ? entries[roundEntries - i - 1] : null);
                let match = {
                    bye: isBye,
                    winner: isBye ? top : null,
                    top:    top,
                    bottom: bottom,
                    prev: hasPrev ? prevMatches : null,
                    //next: hasPrev ? nextMatch : null,
                    match: i,
                    round: roundCount
                };
                round.push( match );
            }
            bracket.push( round );
            roundCount++;
        }

        return bracket;
    }

    getMaxRounds() {
        return Math.log2( this.countMax ); //only includes rounds with matches
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

    getEntriesFromRound( round ) {
        return this.bracket[round].filter( m => !m.bye ).reduce( (result, m) => { return result.concat( [m.top, m.bottom] ); }, [] );
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
    let round1 = ["A", "B", "C", "D"];
    //let round1 = ["A", "B", "C", "D", "E"];
    //let round1 = ["A", "B", "C", "D", "E", "F", "G", "H"];
    //let round1 = ["A", "B", "C", "D", "E", "F", "G", "H", "I"];
    let round2 = ["1"];
    bracket = new Bracket( round1, round2 );
    displayBracket();
}

function displayBracket() {
    let div = id( 'textDisplay' );
    div.innerHTML = "";

    for ( let i = 0; i < bracket.getMaxRounds(); i++ ) {
        let roundDiv = document.createElement( "DIV" );
        roundDiv.id = "round" + (i + 1);
        roundDiv.classList.add( "col-1" ); //todo

        let entries = bracket.getEntriesFromRound( i );
        for ( let j = 0; j < entries.length; j++ ) {
            let entry = entries[j];
            let tempDiv = document.createElement( "DIV" );

            let button = document.createElement( "BUTTON" );
            button.innerHTML = entry.title || entry;
            button.id = entry.seed;
            button.onclick = function() {
                alert( entry.title + ": " + entry.seed );
            };
            button.style.width = "6em";
            button.style.marginBottom = (j % 2 === 0) ? ".5em" : "1.5em";
            button.classList.add( "button" );

            tempDiv.appendChild( button );
            roundDiv.appendChild( tempDiv );
        }
        div.appendChild( roundDiv );
    }
}