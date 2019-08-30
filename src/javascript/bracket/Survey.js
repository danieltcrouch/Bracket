const DEFAULT_IMAGE = "images/profile.jpg";

class Choice {
    constructor( id, text, image ) {
        this.id = id;
        this.text = text;
        this.image = image || DEFAULT_IMAGE;
    }

    static getChoice( choices, id ) {
        return choices.find( c => c.getId() === id );
    }

    static mapToIds( choices ) {
        return choices.map( c => c.getId() );
    }

    getImage() {
        return this.image;
    }

    getText() {
        return this.text;
    }

    getId() {
        return this.id;
    }

    toString() {
        return JSON.stringify( this );
    }
}

class ChoiceSet {
    constructor( id, choices ) {
        this.id = id;
        this.choices = choices ? choices.filter( Boolean ) : [];
    }

    static getChoiceSet( choiceSets, id ) {
        return choiceSets.find( cs => cs.getId() === id );
    }

    static mapToIds( choiceSets ) {
        return choiceSets.map( cs => cs.getId() );
    }

    hasContents() {
        return this.choices.length > 0;
    }

    hasLength( length ) {
        return this.choices.length >= length;
    }

    getChoiceFromId( id ) {
        return this.choices.find( c => c.getId() === id );
    }

    getChoicesFromIds( ids ) {
        return this.choices.filter( c => ids ? ids.includes( c.getId() ) : false );
    }

    setAnswerId( id ) {
        this.answerId = id;
    }

    getAnswerId() {
        return this.answerId;
    }

    getAnswer() {
        return this.getChoiceFromId( this.answerId );
    }

    addChoice( choice ) {
        if ( choice ) {
            this.choices.push( choice );
        }
    }

    removeChoiceFromId( choiceId ) {
        let choiceIndex = this.choices.findIndex( c => c.getId() === choiceId );
        if ( choiceIndex >= 0 ) {
            this.choices.splice( choiceIndex, 1 );
        }
    }

    getAllChoices() {
        return this.choices;
    }

    getId() {
        return this.id;
    }

    toString() {
        return JSON.stringify( this.choices );
    }
}

class Survey {
    constructor( choiceSets ) {
        this.choiceSets = choiceSets ? choiceSets.filter( Boolean ) : [];
    }

    setAnswers( answers ) {
        answers = answers || [];
        for ( let i = 0; i < answers.length; i++ ) {
            let answer = answers[i];
            let choiceSet = this.getChoiceSetFromId( answer.choiceSetId );
            if ( choiceSet ) {
                choiceSet.setAnswerId( answer.choiceId );
            }
        }
    }

    getAnswers() {
        return this.getAllChoiceSets().filter( cs => cs.getAnswer() ).map( cs => { return {
            choiceSetId: cs.getId(),
            choiceId: cs.getAnswer() ? cs.getAnswer().getId() : null
        }; } );
    }

    getChoiceFromId( id ) {
        return this.getAllChoices().find( c => c.getId() === id );
    }

    getChoicesFromIds( ids ) {
        return this.getAllChoices().filter( c => ids ? ids.includes( c.getId() ) : false );
    }

    getCurrentChoiceSet() {
        return this.choiceSets.find( cs => !cs.getAnswer() );
    }

    getChoiceSetFromId( id ) {
        return this.choiceSets.find( cs => cs.getId() === id );
    }

    getChoiceSetsFromIds( ids ) {
        return this.choiceSets.filter( cs => ids ? ids.includes( cs.getId() ) : false );
    }

    isFinished() {
        return !this.getCurrentChoiceSet();
    }

    getSize() {
        return this.choiceSets.length;
    }

    getAllChoiceSets() {
        return this.choiceSets;
    }

    getAllChoices() {
        return this.getAllChoiceSets().reduce( function( choices, choiceSet ) { return choices.concat( choiceSet.getAllChoices() ); }, [] );
    }

    toString() {
        return JSON.stringify( this.choiceSets );
    }
}