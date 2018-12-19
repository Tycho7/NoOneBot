const botconfig = require("./botconfig.json");
const Discord = require("discord.js");
const mysql  = require("mysql")
const bot = new Discord.Client();


//when bot is ready check code
bot.on("ready", async() => {
    console.log(`${bot.user.username} is ready`);

    //set game playing of bot
    bot.user.setActivity(`${prefix}help for help`);
});

var count = 0;
let prefix = botconfig.prefix;
let APIkey = botconfig.APIkey;
var RockPaperScissorCommand = "RPS";
var UserToMute = null;

var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "discordbot"
});

try{
    databaseConnect();
}catch{

}


//when a message is send check code
bot.on("message", async message =>{

    //fix de message check
    let messageArray = message.content.split(" ");
    let cmd = messageArray[0];
    let arg = messageArray[1];

    const member = message.author;
    let prefix = botconfig.prefix;

    bot.user.setActivity(`${prefix}help for help`);

        //#region help
    //geef hulp bericht
        if(cmd == `${prefix}help`){
            //reply to help
            return message.channel.send({embed: {
                color: 0xff0000,
                author: {
                  name: bot.user.username,
                  icon_url: bot.user.avatarURL
                },
                title: "Commands",
                description: "This help message will show you how to use me",
                fields: [
                    {
                    name: "Change My Prefix",
                    value: `Changing the prefix will allow you to set the prefix to whatever you want, ` +
                    `U use it by looking at the current Prefix (current one is ${prefix}), type the prefix with ChangePrefix directly behind, `+
                    `now add a space and type the new Prefix. Once done correctly the bot will tell you it changed and what it changed to.`
                    },
                  {
                    name: "Rock Paper Scissors",
                    value: `Playing rock paper scissor is easy.. so you want to try to beat me? Okay. type ${prefix}`+ RockPaperScissorCommand +`` +
                    ` then hit the spacebar and simply type out your choice (rock, paper or scissor).`
                  },
                  {
                    name: "Level Up",
                    value: `You can check your level by typing ${prefix}level, bots don't level and sending me dm's does not give you xp.`
                  },
                  {
                      name: "Clear (beta)",
                      value: `the bot admin can type ${prefix}clear to clear the last messages of the channel (max: 100), if they are younger as 14 days, maybe if you ask the admin nicely you will also get access to this command`
                  }
                ]
            }
        });
        }//eind hulp bericht
        //#endregion

        //#region No U
        if(cmd == "https://cdn.discordapp.com/attachments/517817643768741898/520168173123665921/yXEiYQ4.png"){
            return message.channel.send("No U");
        }
        //#endregion

        //#region Change Prefix
        if(cmd == `${prefix}ChangePrefix` && arg != undefined){
            botconfig.prefix = arg.substring(0,1)
            message.channel.send("prefix changed to "+arg.substring(0,1))
        }else if(cmd == `${prefix}ChangePrefix` && arg == undefined){
            message.channel.send(`Fill in a new prefix, if you don't know how this command works check ${prefix}help for more information`)
        }else if(cmd == `${prefix}ResetPrefix`){
            botconfig.prefix = "+"
            message.channel.send(`prefix has been reseted to +`)
        }
        //#endregion

        //#region "mute" persoon naar keus
        if(message.author.id == "221737975904600065"){
            if(cmd == `${prefix}mute`){
                if(UserToMute == null && arg != null){
                    UserToMute = arg;
                    message.author.send("muted user: "+UserToMute)
                }
            }else if(cmd == `${prefix}unmute`){
                message.author.send("unmuted user: "+ UserToMute)
                UserToMute = null
            }
        }
        if(message.author.id == UserToMute){
            message.delete(message);
        }
        //#endregion
        
        //#region SteenPapierSchaar
        if(cmd == `${prefix}`+ RockPaperScissorCommand +`` || cmd == `${prefix}`+ RockPaperScissorCommand.toLowerCase() +``){
            RockPaperScissor = Math.floor(Math.random() * 3) + 1
            console.log(RockPaperScissor);

            if(arg == "rock" || arg == "paper" || arg == "scissor"){
                switch(arg){
                    case "rock":
                        if(RockPaperScissor == 1){
                            message.channel.send("<@" + message.author.id + "> Its a draw, I picked rock aswell. Good Game!")
                        }else if(RockPaperScissor == 2){
                            message.channel.send("<@" + message.author.id + "> I picked paper, I Win. Try again")
                        }else if(RockPaperScissor == 3){
                            message.channel.send("<@" + message.author.id + "> I picked scissors, You Win. I guess you are just to good at this game")
                        }
                    break;
                    case "paper":
                    if(RockPaperScissor == 1){
                        message.channel.send("<@" + message.author.id + "> I picked rock, You Win. I guess you are just to good at this game")
                    }else if(RockPaperScissor == 2){
                        message.channel.send("<@" + message.author.id + "> Its a draw, I picked paper aswell.  Good Game!")
                    }else if(RockPaperScissor == 3){
                        message.channel.send("<@" + message.author.id + "> I picked scissors, I Win. Try again")
                    }
                    break;
                    case "scissor":
                    //rock
                    if(RockPaperScissor == 1){
                        message.channel.send("<@" + message.author.id + "> I picked rock, I Win. Try again")
                    }else if(RockPaperScissor == 2){
                        //paper
                        message.channel.send("<@" + message.author.id + "> I picked paper, You Win. I guess you are just to good at this game")
                    }else if(RockPaperScissor == 3){
                        //scissor
                        message.channel.send("<@" + message.author.id + "> Its a draw, I picked scissor aswell. Good Game! ")
                    }
                    break;
                }
            }

        }
        //#endregion
    
        //#region level up
        if(!message.author.bot && message.channel.type != "dm"){
            //#region generate xp
            con.query("SELECT * FROM discordxp WHERE id = "+ message.author.id +";", (err, rows) =>{
                let sqlXP;
                console.log(rows);
                if(rows.length < 1){
                    sqlXP = "INSERT INTO discordxp (id, xp) VALUES ("+ message.author.id +", "+ generateXP() +");";
                }else{
                    let newXP = rows[0].xp + generateXP();
                    sqlXP = "UPDATE discordxp SET xp = "+ newXP +" WHERE id = "+ message.author.id +";";
                }

                con.query(sqlXP, console.log);
            });
            //#endregion

            //#region level system
            con.query("SELECT * FROM discordxp WHERE id = "+ message.author.id +";", (err, accountCheck) =>{

            if(accountCheck.length == 1) {
                con.query("SELECT xpneeded, xp, level FROM discordxp WHERE id = "+ message.author.id +";", (err, rows) =>{
                    let sqlLevel;
                    let needed = parseInt(rows[0].xpneeded);
                    let currentXP = parseInt(rows[0].xp);
                    currentLevel = rows[0].level; 
                    let newLevel = parseInt(currentLevel) + 1;
                    let toNewLevel = newLevel + 1;
                    let newNeeded = needed + 200;

                if(needed <= currentXP){
                    sqlLevel = "UPDATE discordxp SET level = "+ newLevel +", xpneeded = "+ newNeeded +", xp = 0 WHERE id = "+ message.author.id +";";
                    var embedLevelUpMessage = new Discord.RichEmbed().setTitle("Well Done You leveled Up!")
                    .setDescription("Yours New Level Is: " + newLevel)
                    .addField("XP To Level "+toNewLevel+"", "0/"+newNeeded)
                    .setThumbnail(message.author.avatarURL)
                    .setColor(0xff0000);
                    message.reply(embedLevelUpMessage);
                }

                con.query(sqlLevel, console.log);
                });
            }   
            });
            //#endregion

            //#region check level
            if(cmd == `${prefix}level`){
            con.query("SELECT * FROM discordxp WHERE id = "+ message.author.id +";", (err, levelCheck) =>{
                if(levelCheck.length == 1){
                    currentLevel = parseInt(levelCheck[0].level);
                    XPNeeded = parseInt(levelCheck[0].xpneeded);
                    CurrentXP = parseInt(levelCheck[0].xp);
                    var embedLevelMessage = new Discord.RichEmbed().setTitle("Your level")
                    .setDescription("Your current level is: " + currentLevel)
                    .addField("XP", CurrentXP+"/"+XPNeeded)
                    .setThumbnail(message.author.avatarURL)
                    .setColor(0xff0000);
                    message.reply(embedLevelMessage);
            }
            });
        }
    }

        //#endregion
        //#endregion
        
        //#region clear chat
        if(message.author.id == "221737975904600065"){
            if(cmd == `${prefix}clear`){
                clearChannel(message);
            }
        }
        //#endregion
    });
    function generateXP (){
        randomXP = Math.floor(Math.random() * (30 - 10 + 1)) + 10;
        console.log(randomXP)
        return randomXP;
    }

    async function clearChannel (message){
            message.channel.fetchMessages({limit: 100}).then(messages => {
            const Messages = messages;
            message.channel.bulkDelete(Messages);
            messagesDeleted = Messages.array().length; // number of messages deleted

            // Logging the number of messages deleted on both the channel and console.
        message.channel.send({embed: {
            color: 0xff0000,
            title: "Beta",
            description: "This function is still in its beta",
            fields: [
                {
                name: "Cleared",
                value: "Cleared a maximum of 100 messages"
                }
            ],
            timestamp: new Date(),
            footer: {
              icon_url: bot.user.avatarURL,
              text: "Cleared chat while in beta"
            }
        }
        });
    }).catch(err => {
        message.channel.send({embed: {
            color: 0xff0000,
            title: "Beta",
            description: "This function is still in its beta",
            fields: [
                {
                name: "Failed",
                value: "Failed to clear messages"
                }
            ],
            timestamp: new Date(),
            footer: {
              icon_url: bot.user.avatarURL,
              text: "Failed to clear chat while in beta"
            }
        }
        });
    });
}

    function databaseConnect(){
        con.connect(err => {
            if(err) throw err;
            console.log("connected to database")
        });
    }

    
bot.login(botconfig.token);
