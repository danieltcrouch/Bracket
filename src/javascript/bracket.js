class Bracket
{
    constructor() {
        const count = arguments.length;
        const rounds = arguments;
    }

    getDisplay() {
        return this.toString();
    }

    toString() {
        return "temp";
    }
}

let bracket;

function loadBracket()
{
    let round1 = ["A", "B", "C", "D"];
    let round2 = ["A"];
    bracket = new Bracket( round1, round2 );
    displayBracket();
}

function displayBracket()
{
    id('textDisplay').innerHtml = bracket.getDisplay();
}