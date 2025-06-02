//==============================================
//                  Game
//==============================================

class Game{

    constructor(){
        this.difficulty;
        this.player = new Player(this);
        this.world = new World(this);


        Canvas.initialize_canvas();

        Text.get_prompt("a1").then(result =>{
            console.log(result); // ["Prompt 1 text...", "Prompt 2 text..."]

            Text.write(result[0], result[1]);
        });

        Text.get_choices('a1').then(result => {
            console.log(result[1]);

            for (let i = 0; i < result.length; i++){
                Text.add_choice(result[i].text, result[i].type)
            }
        })

    }

    start(){

    }
}
//==============================================
//                  Player
//==============================================

class Player{

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

class Item{

    static sizeList = [];

    constructor(inventory, type){
        this.type = type;
        this.size = get_size(type);
    }

    get_size(type){

    }
}

class Reputation{

    constructor(player){

    }
}

//==============================================
//                  Content
//==============================================

class World{

    constructor(game){

    }
}

class Zone{

    constructor(world){
        this.type = "";
    }
}

class Encounter{

    constructor(zone){
        this.type = "";
    }
}

class Npc{

    constructor(encounter){
        this.name = ""; //Make random name generator.
        this.type = ""; //Make some Npc types, e.g merchants, warriors, refugees, etc.
        
        this.level = 1;
        this.strength = 1;
        
        this.temperament = ""; //How fast/slow the player loses/gains rep.
        this.inventory = new Inventory(this);
    }
}

//==============================================
//                  Graphics
//==============================================

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

    static canvas_draw(state){
        switch (state){
            case "fire":

                Canvas.animationFrameId = requestAnimationFrame(Canvas.animation);
            break;
        }
    }

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

class Text {
    static prompt1 = document.getElementById("prompt1");
    static prompt2 = document.getElementById("prompt2");

    static choices = document.getElementById("choices");

    static add_choice(text = "", type = "text", consequence = null,) {
        const choice = document.createElement("li");

        switch (type){
            case "text":
                choice.innerHTML = text;
                choice.classList.add("hoverAble")

                choice.addEventListener("click", () => {

                });
            break;
            
            case "write":
                const input = document.createElement("input");
        
                input.type = "text";
                input.placeholder = text;

                choice.appendChild(input);
                choice.addEventListener("keydown", (event) => {

                    if (event.key === "Enter") {
                        alert(`You entered: ${input.value}`);
                    }
                });
            break;
        }

        Text.choices.appendChild(choice);
    }

    static removeLastItem(){
        if (Text.choices.lastElementChild) {
            Text.choices.removeChild(Text.choices.lastElementChild);
        }
    }

    static async write(text1, text2){
        await typeWriter(text1, prompt1);
        typeWriter(text2, prompt2, 50);

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
                    throw new Error(`Prompt "${name}" not found`);
                }
                return [choiceData.choice1, choiceData.choice2];
            })
            .catch(error => {
            console.error('Error loading JSON:', error);
            return null;
        });
    }
}

//==============================================
//                  Utility
//==============================================

function randInt(min, max){
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

//==============================================
//                  Starting code
//==============================================



let game = new Game();
game.start();