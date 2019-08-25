const DEFAULT_IMAGE = "images/profile.jpg";

class Choice {
    constructor( id, text, image ) {
        this.id = id;
        this.text = text;
        this.image = image;
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
        this.choices = choices.filter( Boolean );
    }

    static mapToIds( choiceSets ) {
        return choiceSets.map( cs => cs.getId() );
    }

    hasContents() {
        return this.choices.length > 0;
    }

    hasIndex( index ) {
        return this.choices.length > index;
    }

    getChoiceFromId( id ) {
        return this.choices.find( c => c.getId() === id );
    }

    getChoicesFromIds( ids ) {
        return this.choices.filter( c => ids.includes( c.getId() ) );
    }

    setAnswerId( id ) {
        this.answerId = null;
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
        this.choices = this.choices.filter( c => c.getId() !== choiceId );
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
        this.choiceSets = choiceSets.filter( Boolean );
    }

    setAnswers( answers ) {
        for ( let i = 0; i < answers.length; i++ ) {
            let answer = answers[i];
            let choiceSet = this.getChoiceSetFromId( answer.choiceSetId );
            choiceSet.setAnswerId( answer.choiceId );
        }
    }

    getAnswers() {
        let answeredChoiceSets = this.getAllChoiceSets().slice( 0, this.getAllChoiceSets().indexOf( this.getCurrentChoiceSet() ) );
        return answeredChoiceSets.map( cs => { return { choiceSetId: cs.getId(), choiceId: cs.getAnswer().getId() }; } );
    }

    getChoiceFromId( id ) {
        return this.getAllChoices().find( c => c.getId() === id );
    }

    getChoicesFromIds( ids ) {
        return this.getAllChoices().filter( c => ids.includes( c.getId() ) );
    }

    getCurrentChoiceSet() {
        return this.choiceSets.find( cs => !cs.getAnswer() );
    }

    getChoiceSetFromId( id ) {
        return this.choiceSets.find( cs => cs.getId() === id );
    }

    getChoiceSetsFromIds( ids ) {
        return this.choiceSets.filter( cs => ids.includes( cs.getId() ) );
    }

    getSize() {
        return this.choiceSets.length;
    }

    getAllChoiceSets() {
        return this.choiceSets;
    }

    getAllChoices() {
        let result = [];
        for( let i = 0; i < this.getAllChoiceSets().length; i++ )
        {
            result = result.concat( this.getAllChoiceSets()[i].getAllChoices() );
        }
        return result;
    }

    toString() {
        return JSON.stringify( this.choiceSets );
    }
}