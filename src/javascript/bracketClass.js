class Bracket {
    constructor( entriesInput, winnersInput ) {
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