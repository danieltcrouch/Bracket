class Poll {
    constructor( entriesInput ) {
        this.entryCount = entriesInput.length;
        this.entries = Poll.parseEntries( entriesInput );
        this.poll = Poll.constructPoll( this.entries );
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

    static constructPoll( entries ) {
        return entries;
    }

    getEntries() {
        return this.entries;
    }
}