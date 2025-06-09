//==============================================
//                  Game
//==============================================

class Game{

    //This will check the menu.
    static check_menu(){

    }

    //Create the game object
    constructor(){
        this.difficulty;
        this.player = new Player(this);
        this.world = new World(this);

        this.scene = "start";

        //start the Canvas and make sure it works propperly
        Canvas.initialize_canvas();
    }

    //This function takes the consequence of an action and translates it from a string to a function.
    async consequence_handler(consequence, input = null){
        Text.clear_ui();

        let temp = consequence.split("/");
        console.log(temp);

        switch (temp[0]){
            case "scene":
                if (!temp[1]){
                    throw new Error("Temp[1] is needed");
                }

                this.scene = temp[1];
            break;
        
            case "save":
                if (!input){
                    throw new Error("Input is needed");
                }

                if (!temp[1]){
                    throw new Error("Temp[1] is needed");
                }

                if (!temp[2]){
                    throw new Error("Temp[2] is needed");
                }

                switch (temp[1]){
                    case "name":
                        this.player.name = input;
                    break;

                    case "type":

                    break;
                }

                this.scene = temp[2];
            break;
        
            case "rep":
                if (!temp[1]){
                    throw new Error("Temp[1] is needed");
                }

                if (!temp[2]){
                    throw new Error("Temp[2] is needed");
                }

                let gain = parseInt(temp[1]);
                let modifier = this.world.npc.get_reputation(this.world.current_npc.temperament, (gain < 0)? "reputationLossModifier": "reputationGainModifier");
                this.world.current_npc.reputation += gain * modifier;

                this.scene = temp[2];
            break;

            default:
                console.log("you fucked something up check: " + temp[0] + "for misspellings.")
            break;
        }

        await this.game_loop();
    }

    //This function takes a name for a specific scene and writes both prompts aswell as the choices and binds the consequences to whatever they should be bound to.
    async write_everything(name){
        const write_prompt = async (name) => {
            const result = await Text.get_prompt(name);
            console.log(result);
            await Text.write(result[0], result[1]); // Wait for typeWriter
        }

        const write_choice = async (name) => {
            const result = await Text.get_choices(name);
            const result1 = await Text.get_consequences(name);

            for (let i = 0; i < result.length; i++){
                console.log(result[i], result1[i], i);
                Text.add_choice(result[i].text, result[i].type, result1[i], this);
            }
        }

        await write_prompt(name); // Order matters
        await write_choice(name);
    }

    //This is the first function called after the game object has been created.
    start(){
        this.write_everything(this.scene);

        
    }

    //This is the main "loop" that will be used to write each scene after the first.
    async game_loop(){
        console.log("gameloop ran");
        await this.write_everything(this.scene);
    }
}
//==============================================
//                  Player
//==============================================

//This is the player class which will have the players key attributes aswell as a few helper functions.
class Player{

    static check_inventory(){

    }

    static check_character(){

    }

    constructor(game){
        this.name = "";
        this.type = "";
        
        this.level = 1;
        this.strength;

        this.inventory = new Inventory(this);
    }

    get_strength(){

    }
}

//This is where the players items will be stored.
class Inventory{

    constructor(player){
        this.spaces = [];
        this.weight = 0;
    }

    add_item(){

    }

    remove_item(){

    }
}

//this class will be used to represent each specific item type, with all that entails.
class Item{

    static sizeList = [];

    constructor(inventory, type){
        this.type = type;
        this.size = get_size(type);
    }

    get_size(type){

    }
}

//==============================================
//                  Content
//==============================================

//this class mainly holds NPC's and monsters, and allows for their creation.
class World{

    constructor(game){
        this.npc_list = [];
        this.monster_list = [];

        this.current_npc;
    }

    //This function creates an encounter, and has three modes: random, monster, and npc.
    //This can then be used to either make an already decided NPC/monster or it could be used to create a random one.
    createEncounter(generation="random", name = null, type = null){
        switch (generation){
            case "random":
                //randomly select what type
            break;

            case "monster":
                return new Monster(this, type);
            break;

            case "npc":
                return new Npc(this, name, type);
            break;
        }
    }
}

//This class is to create NPC's. It holds their name, temperament, type, and a few other attriubtes.
class Npc{


    //this function returns an npc (it has to be pre-built), it just needs a name.
    static get_npcs(name){
        return fetch('JSON/npcs.json')
        .then(response => response.json())
        .then(npcs => {

            const npcData = npcs[name];

            if(!npcData) {
                throw new Error(`npc "${name}" not found`);
            }

            return [npcData.name, npcData.type, npcData.temperament, npcData.level];
        })

        .catch(error =>{
            console.error('Error loading JSON:', error);
            return null;
        })
    }

    constructor(world, name = null, type = null, temperament = null, level=1){
        this.name = this.create_random_name(); //Make random name generator.
        if (!name){
        }
        
        if (!type){
            this.type = ""; //Make some Npc types, e.g merchants, warriors, refugees, etc.
        }

        if (!temperament){
            this.temperament = ""; //How fast/slow the player loses/gains rep.
        }
        
        this.level = level;
        this.strength = 1;
        this.Reputation = this.get_reputation(this.temperament, "startingReputation")
    }


    //Helper function to access any specific value of any given temperament.
    //(startingReputation, reputationGainModifier, reputationLossModifier)
    get_reputation(temperament, value="all"){
        fetch('JSON/temperaments.json')
        .then(response => response.json())
        .then(temperaments =>{

            const temperamentData = temperaments[temperament]

            if(!temperamentData) {
                throw new Error(`temperament "${temperament}" not found`);
            }

            console.log(temperamentData.notes)

            switch(value){
                case "all":
                    return [temperamentData.startingReputation, temperamentData.reputationGainModifier, temperamentData.reputationLossModifier];
                break;

                case "startingReputation":
                    return temperamentData.startingReputation;
                break;

                case "reputationGainModifier":
                    return temperamentData.reputationGainModifier;
                break;

                case "reputationLossModifier":
                    return temperamentData.reputationLossModifier;
                break;
            }
        })

        .catch(error => {
        console.error('Error loading JSON:', error);
        return null;
        });
    }

    //This will later be used to create unique names for each NPC.
    //Not done yet.
    create_random_name(){

        let firstName = "";
        let firstHalfLastName = "";
        let lastHalfLastName = "";
        let nickname = "";

        let name = "";
        
        //30
        let firstNameList = [
            "Emil", "Nora", "Lukas", "Mikkel", "Astrid", "Elias", "Liv", "Oliver", "Thea", "Sander", "Ingrid", "Felix", "Sara", "Jakob", "Ronja", "Erik", "Freja", "Malte", "Elin", "Johan", "Klara", "Ludvig", "Maja", "Simon", "Ida", "Aron", "Sofie", "Henrik", "Lena", "Tobias"
        ];
        
        //10 (both)
        let firstHalfLastNameList = [
            "Berg", "Lind", "Holm", "Norr", "Vinter", "Eke", "Storm", "Sand", "Haug", "Elv"
        ];
        let lastHalfLastNameList = [
            "gren", "dal", "mark", "søn", "stad", "heim", "skog", "vik", "land", ""
        ];

        //40
        let nicknameList = [
            "The Quiet", "Rusty", "Black Kari", "Grin", "Knuckles", "Stitches", "Softfoot", "Hollow", "The Echo", "Frosty",
            "Blind Henning", "Grease", "One-Hand", "Gray Boy", "The Tall", "Sparky", "Mute", "Little Bear", "The Rat", "Cinder",
            "Loaf", "Drift", "Odd", "Cold Klara", "Nails", "Tinman", "Shy", "Scrape", "Bente the Red", "Long Walk",
            "Hatch", "Flicker", "Bruise", "Iron Son", "Grub", "Slips", "Moss", "Soot", "Latch", "Bone Boy"
        ];
        
        //randomly generate name from here.
        function randomize(){
            firstName = firstNameList[randInt(1, firstNameList.length)-1];
            firstHalfLastName = firstHalfLastName[randInt(1, firstHalfLastNameList.length)-1];
            lastHalfLastName = lastHalfLastName[randInt(1, lastHalfLastNameList.length)-1];
            nickname = nickname[randInt(1, nicknameList.length)-1];

            return firstName + " " + firstHalfLastName + lastHalfLastName + " " + nickname;
        }

        function check(world, name){
            for (let i = 0; i < world.npc_list.length-1; i++){
                if (world.npc_list[i] == name)
                    return true
            }
            
            return false;
        }
        
        do{
            name = randomize();


            
        }while(check(world, name))

        return name;
    }
}

//This class is for all hostile encounters the player'll face.
class Monster{

    constructor(world, type = null){
        if(!type){
            this.type = "";
        }
    }
}

//==============================================
//                  Graphics
//==============================================

//this class is responsible for the canvas, and makes sure it works as intended.
class Canvas{

    static lastFrameTime = 0;
    static frameDelay = 500;
    static bool = true;
    static animationFrameId = null;

    static canvas = document.getElementById('canvas');
    static ctx = Canvas.canvas.getContext("2d");

    static images = {};
    static imageSources = {
        "start_screen1": "source/start_screen1.png",
        "start_screen2": "source/start_screen2.png"
    };

    //This function makes sure that all images are loaded, and sets the size of the canvas.
    static initialize_canvas(){
        Canvas.canvas.width = 48;
        Canvas.canvas.height = 64;

        let imagePromise = new Promise((Resolve) =>{
            Canvas.preload_images(Canvas.imageSources, function () {
                console.log("All images loaded, ready to draw");   
                Resolve();   
            });
        })

        imagePromise.then(() => Canvas.canvas_draw("fire"));
    }

    //This function loads images so that the above function can check that they indeed are loaded.
    static preload_images(sources, callback) {
    let loadedImages = 0;
    let totalImages = Object.keys(sources).length;

        for (let key in sources) {
            this.images[key] = new Image();
            this.images[key].src = sources[key];

            this.images[key].onload = function () {
                loadedImages++;
                if (loadedImages === totalImages) {
                    callback();
                }
            };
        }
    }

    //This function directly draws in an image onto the canvas based on a state argument passed into it.
    static canvas_draw(state){
        switch (state){
            case "fire":

                Canvas.animationFrameId = requestAnimationFrame(Canvas.animation);
            break;
        }
    }

    //This function creates a small animation for the canvas.
    static animation(timestamp){
        if (timestamp - Canvas.lastFrameTime >= Canvas.frameDelay){
            Canvas.ctx.clearRect(0, 0, Canvas.canvas.width, Canvas.canvas.height);

            if (Canvas.bool){
                Canvas.bool = false;

                Canvas.ctx.drawImage(Canvas.images["start_screen1"], 0, 0, Canvas.canvas.width, Canvas.canvas.height);
            }
            else{
                Canvas.bool = true;

                Canvas.ctx.drawImage(Canvas.images["start_screen2"], 0, 0, Canvas.canvas.width, Canvas.canvas.height);
            }

            Canvas.lastFrameTime = timestamp;
        }

            Canvas.animationFrameId = requestAnimationFrame(Canvas.animation);
    }
}

//This class is responsible for keeping track of all text, textelements and event-listeners.
class Text {
    static prompt1 = document.getElementById("prompt1");
    static prompt2 = document.getElementById("prompt2");

    static choices = document.getElementById("choices");

    //This function adds a choice to the UI, and can either feature text, or a writing prompt.
    //The function also adds an eventlistener to each choice.
    static add_choice(text = "", type = "text", consequence, game) {
        const choice = document.createElement("li");

        console.log(game);

        switch (type){
            case "text":
                choice.innerHTML = text;
                choice.classList.add("hoverAble")

                choice.addEventListener("click", () => {
                    console.log("choice was clicked");
                        game.consequence_handler(consequence);
                });
            break;
            
            case "write":
                const input = document.createElement("input");
        
                input.type = "text";
                input.placeholder = text;

                choice.appendChild(input);
                choice.addEventListener("keydown", (event) => {

                    if (event.key === "Enter") {
                        game.consequence_handler(consequence, input.value);
                    }
                });
            break;
        }

        Text.choices.appendChild(choice);
    }

    //This function simply writes with a typewriter-like animation, and it does both prompts with the same function.
    static async write(text1, text2){
        await typeWriter(text1, prompt1);
        
        if (text2)
        await typeWriter(text2, prompt2);

        function typeWriter(text, textElement, delay = 40) {
            return new Promise((resolve) => {
                const skipListener = () => {
                    textElement.innerHTML = text;
                    index = text.length;
                    console.log("Text scene was skipped");
                    document.removeEventListener('mousedown', skipListener);
                    resolve(); 
                };
            
                document.addEventListener('mousedown', skipListener);
                let index = 0;
                console.log(text);

                function type() {
                    if (index < text.length) {
                        textElement.innerHTML += text.charAt(index);
                        index++;
                        setTimeout(type, (text.charAt(index - 1) == "," || text.charAt(index - 1) == "." || text.charAt(index - 1) == "?" || text.charAt(index - 1) == "!") ? 2.3 * delay : delay);
                    } else {
                        document.removeEventListener('mousedown', skipListener);
                        resolve();
                    }
                }
                type();
            }); 
        }
    }

    //This function clears the UI when necessary.
    static clear_ui(){
        Text.prompt1.innerHTML = "";
        Text.prompt2.innerHTML = "";

        Text.choices.innerHTML = "";
    }

    //These following functions get prompts, choices and consequences from a JSON file.
    static get_prompt(name) {
        return fetch('JSON/prompt.json')
        .then(response => response.json())
        .then(prompts => {

            const promptData = prompts[name];

            if (!promptData) {
                throw new Error(`Prompt "${name}" not found`);
            }

            return [promptData.prompt1, promptData.prompt2];
        })

        .catch(error => {
        console.error('Error loading JSON:', error);
        return null;
        });
    }

    static get_choices(name) {
        return fetch('JSON/choice.json')
        .then(response => response.json())
        .then(choices => {
            
            const choiceData = choices[name];

            if (!choiceData) {
                throw new Error(`Choice "${name}" not found`);
            }

            return [choiceData.choice1, choiceData.choice2];
        })

        .catch(error => {
        console.error('Error loading JSON:', error);
        return null;
        });
    }

    static get_consequences(name){
        return fetch('JSON/consequences.json')
        .then(response => response.json())
        .then(consequences => {

            const consequenceData = consequences[name];

            if(!consequenceData) {
                throw new Error(`Consequence "${name}" not found`);
            }

            return [consequenceData.consequence1, consequenceData.consequence2];
        })

        .catch(error =>{
            console.error('Error loading JSON:', error);
            return null;
        })
    }
}

//==============================================
//                  Utility
//==============================================

//This is simply a random integer function, as JS doesn't naturally have one.
function randInt(min, max){
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

//==============================================
//                  Starting code
//==============================================

//This starts the game off.
let game = new Game();
game.start();