console.log('Welcome to the Camel Up Optimal Move AI, or "CUOMA"');
console.log("The current game state is empty.\n")

const BOARD_SIZE = 16;
const ALL_COLORS = ["red", "yellow", "blue", "green", "purple"];

let state = null;
let menuOptionSelected = null;

while(menuOptionSelected != "quit" && menuOptionSelected != "q"){
    menuOptionSelected = mainMenuPrompt().toLowerCase();
    
    switch(menuOptionSelected){
        case "view":
        case "v":
            viewCurrentGameState(state);
            break;
        case "new":
        case "n":
            setCurrentGameState(state);
            break;
        case "move":
        case "m":
            modifyCurrentGameState(state);
            break;
        case "ai":
        case "a":
            getAIMove(state);
            break;
        case "quit":
        case "q":
            break;
        default:
            console.log("I don't recognize that command. Please try again.\n");
    }
}
console.log("Thank you for using CUOMA. Goodbye!");


function mainMenuPrompt(){
    console.log("MAIN MENU");
    console.log("VIEW - View the current state of the game");
    console.log("NEW - Restart and input a new state from scratch");
    console.log("MOVE - Modify the current state (make a move)")
    console.log("AI - Let the AI tell you what the best moves are");
    console.log("QUIT - Quit the program\n");

    const prompt = require('prompt-sync')({ sigint: true });
    result = prompt("What would you like to do? ");
    console.log("");

    return result;
}

function viewCurrentGameState(){
    if(state === null){
        console.log("Sorry, you haven't set a game state yet.\n");
        return;
    }

    console.log("CURRENT STATE\n");

    // CAMEL POSITIONS
    console.log("CAMEL POSITIONS (Position, Altitude)");
    for (const color in state.camels){
        console.log(`${capFirstLetter(color)} Camel: (${state.camels[color].position},${state.camels[color].altitude})`);
    }
    console.log("");

    // DICE ROLLED
    let diceRolledString = "DICE ROLLED: ";
    state.diceRolled.forEach((color) => {
        diceRolledString += capFirstLetter(color) + " ";
    });
    console.log(`${diceRolledString}\n`);

    // MODIFIERS PLACED
    console.log("MODIFIERS PLACED");
    state.modifierTokens.forEach((token) => {
        console.log(`Board space ${token.position}: ${token.modifierValue > 0 ? '+' : '-'}1 Modifier ${token.isSelf ? '(Yours)' : ""}`);
    });
    console.log("");

    // LEG BETS REMAINING
    console.log("LEG BETS REMAINING");
    for(const color in state.legBetsRemaining){
        console.log(`${capFirstLetter(color)}: ${state.legBetsRemaining[color]}`);
    }
    console.log("");

    // YOUR LEG BETS
    console.log("YOUR LEG BETS");
    for(const color in state.personalLegBets){
        console.log(`${capFirstLetter(color)}: ${state.personalLegBets[color]}`);
    }
    console.log("");
}

function setCurrentGameState(){
    console.log("CREATING A NEW GAME STATE\n");

    const prompt = require('prompt-sync')({ sigint: true });
    let newGame = prompt("Would you like to start a new Camel Up game or set a mid-game state? (new/mid) ");
    newGame = (newGame.toLowerCase() === "new" || newGame.toLowerCase() === "n" ? true : false);
    console.log("");
    
    if(state === null){
        state = {};
    }

    // DEFAULTS
    state.camels = {
        red: { position: null, altitude: null },
        yellow: { position: null, altitude: null },
        blue: { position: null, altitude: null },
        green: { position: null, altitude: null },
        purple: { position: null, altitude: null },
    }
    state.diceRolled = [];
    state.modifierTokens = [];
    state.legBetsRemaining = {
        red: [2,2,3,5],
        yellow: [2,2,3,5],
        blue: [2,2,3,5],
        green: [2,2,3,5],
        purple: [2,2,3,5],
    };
    state.personalLegBets = {
        red: [],
        yellow: [],
        blue: [],
        green: [],
        purple: [],
    }

    // CAMEL POSITIONS
    ALL_COLORS.forEach((color) => {
        state.camels[color].position = prompt(`In what board space is the ${color} camel? (0-based) `);
        state.camels[color].altitude = prompt (`How many camels are below the ${color} camel? `);
    })

    // NEW GAME
    if(newGame){ 
        console.log("The new game has successfully been set up!\n");
        return;
    }
    console.log("");

    // DICE ROLLED
    ALL_COLORS.forEach((color) => {
        let colorRolled = prompt(`Has the ${color} die been rolled? (yes/no) `);
        colorRolled = (colorRolled.toLowerCase() === "yes" || colorRolled.toLowerCase() === "y" ? true : false);
        if(colorRolled){
            state.diceRolled.push(color);
        }
    })
    console.log("");

    // MODIFIERS PLACED
    while(true){
        let addModifier = prompt(`Should I add a modifier token to the board? (${state.modifierTokens.length} so far) (yes/no) `);
        if((addModifier != "yes" && addModifier != "y" ? true : false)){ break; }

        let position = prompt("What space is the modifier on? (0-based) ");
        let modifierValue = prompt("Is it a positive or negative token? (pos/neg) ");
        let isSelf = prompt("Is it your own token? (yes/no) ");

        state.modifierTokens.push({
            position: parseInt(position),
            modifierValue: (modifierValue.toLowerCase() === "pos" || modifierValue.toLowerCase() === "p" ? 1 : -1),
            isSelf: (isSelf.toLowerCase() === "yes" || isSelf.toLowerCase() === "y" ? true : false),
        })
        console.log("");
    }
    console.log("");

    // LEG BETS REMAINING
    ALL_COLORS.forEach((color) => {
        let numTaken = prompt(`How many leg bet tiles have been taken from the ${color} stack? `);
        state.legBetsRemaining[color] = state.legBetsRemaining[color].slice(0, 4-numTaken);
    })
    console.log("");

    // YOUR LEG BETS
    while(true){
        let legBetsCount = 0;
        ALL_COLORS.forEach((color) => {
            legBetsCount += state.personalLegBets[color].length;
        })

        let addLegBet = prompt(`Should I add a leg bet to your own pool? ${legBetsCount} (yes/no) `);
        if((addLegBet != "yes" && addLegBet != "y" ? true : false)){
            console.log("");
            break;
        }

        let color = prompt("What is the color of the bet? ");
        let value = prompt("What is the value of the bet? ");

        state.personalLegBets[color.toLowerCase()].push(parseInt(value));
        console.log("");
    }
    console.log("");

    console.log("The game state has successfully been set up!\n");
}

function modifyCurrentGameState(){
    if(state === null){
        console.log("Sorry, you haven't set a game state yet.\n");
        return;
    }

    const prompt = require('prompt-sync')({ sigint: true });

    let validMove;
    let chosenMove;
    while(!validMove){
        validMove = true;
        chosenMove = prompt("So, you'd like to modify the state. Which type of move would you like to make? (roll/bet/modifier) ").toLowerCase();
        switch(chosenMove){
            case "roll":
            case "r":
                let color = prompt("What color die did you roll? ").toLowerCase();
                let num = parseInt(prompt("What number did you roll on the die? "));

                // TODO
                break;
            case "bet":
            case "b":
                let isSelfBet = prompt("Is this a bet for yourself? (yes/no) ").toLowerCase();
                isSelfBet = (isSelfBet === "yes" || isSelfBet === "y" ? true : false);
                let betColor = prompt("What color camel is the bet on? ").toLowerCase();
                if(isSelfBet){
                    state.personalLegBets[betColor].push(state.legBetsRemaining[betColor][state.legBetsRemaining[betColor].length - 1]);
                }
                state.legBetsRemaining[betColor] = state.legBetsRemaining[betColor].slice(0,-1);
                console.log(`The bet on the ${betColor} camel has been made.\n`);
                break;
            case "modifier":
            case "m":
                let isSelfToken = prompt("Is this a modifier token for yourself (yes/no) ").toLowerCase();
                isSelfToken = (isSelfToken === "yes" || isSelfToken === "y" ? true : false);
                let position = parseInt(prompt("What space is the modifier on? (0-based) "));
                let modifierValue = prompt("Is it a positive or negative token? (pos/neg) ").toLowerCase();

                state.modifierTokens.push({
                    position: position,
                    modifierValue: (modifierValue === "pos" || modifierValue === "p" ? 1 : -1),
                    isSelf: isSelfToken,
                })

                console.log(`The modifier token has been placed on board space ${position}.\n`);
                break;
            default:
                validMove = false;
                console.log("I don't recognize that move. Try again.\n");
        }
    }

}

function getAIMove(state){
    console.log("The AI doesn't exist yet, SUCKA!!\n");
}

function capFirstLetter(string){
    return string.charAt(0).toUpperCase() + string.slice(1);
}

