const OPTION_SET_ID = "poll";

class Option extends Choice {
    constructor( index, name, image, link ) {
        super( index, name, image, link );
    }

    static isValidIndex( index ) {
        return Number.isFinite( index );
    }

    static getOption( options, index ) {
        return Choice.getChoice( options, index );
    }

    getName() {
        return this.getText();
    }

    getIndex() {
        return this.getId();
    }
}

class OptionSet extends ChoiceSet {
    constructor( options ) {
        super( OPTION_SET_ID, options );
    }

    static isValidId( id ) {
        return ChoiceSet.isValidId( id );
    }

    static getOptionSet( optionSets, id ) {
        return ChoiceSet.getChoiceSet( optionSets, id );
    }

    getOptionFromIndex( index ) {
        return this.getChoiceFromId( index );
    }

    setWinnerIndex( index ) {
        this.setAnswerId( index );
    }

    getWinnerIndex() {
        return this.getAnswerId();
    }

    getWinner() {
        return this.getAnswer();
    }

    getAllOptions() {
        return this.getAllChoices();
    }
}

class Poll extends Survey {
    constructor( optionSets ) {
        super( optionSets );
    }

    static createPoll( rawOptions, rawWinner ) {
        let result = Poll.parsePoll( rawOptions );
        result.setWinner( rawWinner );
        return result;
    }

    static parsePoll( rawOptions ) {
        let options = Poll.parseOptions( rawOptions );
        return new Poll( [ new OptionSet( options ) ] );
    }

    static parseOptions( rawOptions ) {
        let result = [];
        for ( let i = 0; i < rawOptions.length; i++ ) {
            let rawOption = rawOptions[i];
            rawOption = ( typeof rawOption === "string" ) ? { name: rawOption } : rawOption;
            rawOption.image = rawOption.image || DEFAULT_IMAGE;
            rawOption.link  = rawOption.link  || null;
            result.push( new Option( i, rawOption.name, rawOption.image, rawOption.link ) );
        }
        return result;
    }

    getSerializedWinners() {
        return this.getSerializedWinner();
    }

    getSerializedWinner() {
        return this.getWinner() ? this.getWinner().getIndex() : null;
    }

    addWinners( winners ) {
        let winnerIndex = winners[0].getIndex() || winners[0].id;
        this.setWinner( winnerIndex );
    }

    setWinner( winner ) {
        this.setAnswers( [ {choiceSetId: OPTION_SET_ID, choiceId: winner } ] );
    }

    getWinner() {
        return this.getOptionSet().getWinner();
    }

    isFinished() {
        return !!this.getWinner();
    }

    getOptionFromId( index ) {
        return this.getChoiceFromId( index );
    }

    getOptionsFromIds( indexes ) {
        return this.getChoicesFromIds( indexes );
    }

    getOptionSet() {
        return this.getAllChoiceSets()[0];
    }

    getAllOptions() {
        return this.getAllChoices();
    }
}

/******************************* DISPLAY *******************************/

 function displayPoll() {
     let div = id( 'surveyDisplay' );
     div.style.display = "flex";
     div.style.justifyContent = "center";
     div.innerHTML = "";

     let pollDiv = document.createElement( "DIV" );
     pollDiv.style.display = "flex";
     pollDiv.style.flexDirection = "column";
     pollDiv.style.justifyContent = "center";
     pollDiv.style.marginBottom = "1.5rem";

     const optionSetId = OPTION_SET_ID + "Buttons";
     let options = survey.getAllOptions();
     for ( let i = 0; i < options.length; i++ ) {
         let option = options[i];
         let optionDiv = document.createElement( "DIV" );
         optionDiv.style.display = "flex";

         let image = getImage();
         image.setAttribute( "src", option.getImage() );
         image.id = OPTION_SET_ID + "Image" + i;
         addLinkToImage( image, option.getLink() );

         let button = getButton();
         button.innerHTML = option.getName();
         button.id = OPTION_SET_ID + "Button" + i;
         button.name = optionSetId;
         button.onclick = function() {
             registerPollChoice( i );
         };

         optionDiv.appendChild( image );
         optionDiv.appendChild( button );
         pollDiv.appendChild( optionDiv );
     }
     div.appendChild( pollDiv );
    adjustButtonSetFontSize( pollDiv );

     setClickable( optionSetId );
     hideMobileDisplay();
 }


 /*** INTERACTION ***/


 function registerPollChoice( index ) {
     survey.setWinner( index );
 }


 /*** SUBMIT ***/


 function getPollVotes() {
     let votes = null;
     if ( survey.getWinner() ) {
         votes = [{ id: OPTION_SET_ID, vote: survey.getWinner().getIndex() }];
     }
     else {
         showToaster( "Must choose one entry..." );
     }
     return votes;
 }