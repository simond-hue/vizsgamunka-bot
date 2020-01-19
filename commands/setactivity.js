const Discord = require("discord.js");

module.exports.run = async (bot, message, args) => {
    if (message.author.id==197370398839406592 || //DEV ID-K
        message.author.id==266553585255317505 ||
        message.author.id==211956737027211264 ||
        message.author.id==336471304653897728){
            let messageStringSplit = message.content.split(" ");
            let activity = "";
            for(var i = 2; i < messageStringSplit.length; i++){
                activity += messageStringSplit[i] + " ";
            }
            let fs = require('fs');

            let botconfig = require("../botconfig.json");
            
            botconfig.activity = activity;
            botconfig.activity_type = messageStringSplit[1];
            
            fs.writeFileSync("botconfig.json", JSON.stringify(botconfig), function (err) {
                if (err) return console.log(err);
              });
            if(botconfig.activity_type.toUpperCase() == "STREAMING"){
                bot.user.setPresence({
                    game: {
                        name: botconfig.activity,
                        type: botconfig.activity_type,
                        url: botconfig.url
                    }
                });
            }
            else{
                bot.user.setActivity(botconfig.activity, { type: botconfig.activity_type });
            }
            return message.channel.send(new Discord.RichEmbed()
                .setColor("#DABC12")
                .addField("Sikeres átnevezés!", `A bot activityje mostantól ${messageStringSplit[1]} ${activity}`));
        }
    else{
        return message.channel.send(new Discord.RichEmbed()
            .setColor("#DABC12")
            .addField("Hiba!", "Csak a developerek tudják az activity-t változtatni!"));
    }
}
module.exports.help = {
    name: "setactivity",
    type: "botconfig"
}