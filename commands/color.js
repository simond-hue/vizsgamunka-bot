const Discord = require("discord.js");

module.exports.run = async (bot, message, args) => {
    if(message.content.split(' ').length === 2){ //Hosszabb argument check
        let argsSplitSpace = message.content.split(' ')[1];
        if( argsSplitSpace[0] === '#' && //Hexa kód check
            argsSplitSpace.length === 7){
                let i = 1;
                while(i < argsSplitSpace.length){ //Hexakód karakter check
                    if (argsSplitSpace[i].toUpperCase() !== 'A' && 
                        argsSplitSpace[i].toUpperCase() !== 'B' && 
                        argsSplitSpace[i].toUpperCase() !== 'C' && 
                        argsSplitSpace[i].toUpperCase() !== 'D' &&
                        argsSplitSpace[i].toUpperCase() !== 'E' &&
                        argsSplitSpace[i].toUpperCase() !== 'F' &&
                        argsSplitSpace[i] > 9 && argsSplitSpace[i] < 0){
                            break;
                        }
                    i++;
                }
                if(i < 7){
                    return message.channel.send(new Discord.RichEmbed()
                        .setColor("#FFFFFF")
                        .addField("Hiba!", "Nem hexa kódban adtad meg a színt!"));
                }
                else{
                    let lastMessage;
                    message.channel.send(new Discord.RichEmbed()
                            .setColor(argsSplitSpace)
                            .setTitle("Névszín")
                            .setThumbnail(`http://singlecolorimage.com/get/${argsSplitSpace.replace('#','')}/150x150.png`)
                            .addField("Ezt a színt adtad meg!", "Kattints a megfelelő emojira!"))
                        .then(() => {
                            message.channel.fetchMessages({ limit: 1 }).then(async(messages) => {
                                lastMessage = messages.first();
                                await lastMessage.react('❌');
                                await lastMessage.react('👌');
                        })
                        .then(() => {
                            const collector = lastMessage.createReactionCollector((reaction, user) => 
                            user.id === message.author.id &&
                            (reaction.emoji.name === "👌" ||
                            reaction.emoji.name === "❌")
                            ,{ time: 30000 }).once("collect", async(reaction) => {
                                const chosen = reaction.emoji.name;
                                if(chosen === "👌"){
                                    if(message.guild.me.hasPermission("MANAGE_MESSAGES")){
                                        if(message.guild.me.hasPermission("MANAGE_ROLES")){
                                            let role = message.guild.roles.find(role => role.name === `USER-${message.member.id}`);
                                            if(!role){
                                                await message.guild.createRole({
                                                    name: `USER-${message.member.id}`,
                                                    color: argsSplitSpace,
                                                    permissions: []
                                                })
                                                .then(async(role) => {
                                                    message.member.addRole(role);
                                                    if(lastMessage) await lastMessage.delete();
                                                    message.channel.send(new Discord.RichEmbed()
                                                        .setColor(argsSplitSpace)
                                                        .setTitle("Névszín")
                                                        .setThumbnail(`http://singlecolorimage.com/get/${argsSplitSpace.replace('#','')}/150x150.png`)
                                                        .addField(`Sikeres névszín állítás!`, `Mostantól a jobb oldali szín a neved színe! <@${message.author.id}>\nHa meguntad, ugyanígy át tudod állítani!`));
                                                    return;
                                                });
                                            }
                                            else{
                                                await role.delete();
                                                await message.guild.createRole({
                                                    name: `USER-${message.member.id}`,
                                                    color: argsSplitSpace,
                                                    permissions: []
                                                })
                                                .then(async(role) => {
                                                    message.member.addRole(role);
                                                    if(lastMessage) await lastMessage.delete();
                                                    message.channel.send(new Discord.RichEmbed()
                                                        .setColor(argsSplitSpace)
                                                        .setTitle("Névszín")
                                                        .setThumbnail(`http://singlecolorimage.com/get/${argsSplitSpace.replace('#','')}/150x150.png`)
                                                        .addField(`Sikeres névszín állítás!`, `Mostantól a jobb oldali szín a neved színe! <@${message.author.id}>\nHa meguntad, ugyanígy át tudod állítani!`));
                                                    return;
                                                });
                                            }
                                        }
                                        else{
                                            message.channel.send(new Discord.RichEmbed()
                                                .addField("Hiba!","Szükségem van role kezelésre!")
                                                .setColor("#FFFFFF"));
                                        }
                                    }
                                    else{
                                        message.channel.send(new Discord.RichEmbed()
                                            .addField("Hiba!","Szükségem van üzenet kezelésre!")
                                            .setColor("#FFFFFF"));
                                    }
                                }else if(chosen === "❌"){
                                    if(message.guild.me.hasPermission("MANAGE_MESSAGES")){
                                        if(lastMessage) lastMessage.delete();
                                        let embed = new Discord.RichEmbed()
                                            .setColor('#FFFFFF')
                                            .addField("Mégse","A neved színét nem változtattad meg!");
                                        message.channel.send(embed)
                                        .then(async(embed) => {
                                            if(embed) await embed.delete(5000);
                                            if(mesasge) message.delete();
                                        });
                                    }
                                    else{
                                        messages.channel.send(new Discord.RichEmbed()
                                            .addField("Hiba!","Szükségem van üzenet kezelésre!")
                                            .setColor("#FFFFFF"));
                                    }
                                }
                                return;
                            })
                            .once("end", () => {
                                if(collector.users.size === 0){
                                        if(lastMessage) lastMessage.delete();
                                        let embed = new Discord.RichEmbed()
                                            .setColor('#FFFFFF')
                                            .addField("Timeout","Túllépted az időkorlátot!");
                                        message.channel.send(embed)
                                        .then(async(embed) => {
                                            if(embed) await embed.delete(5000);
                                            if(mesasge) message.delete();
                                        });
                                    }
                            });
                        })
                    });
                }
        }
        else{
            message.channel.send(new Discord.RichEmbed()
                        .setColor("#FFFFFF")
                        .addField("Hiba!", "Nem hexa kódban adtad meg a színt!"));
            
        }
    }
    else{
        message.channel.send(new Discord.RichEmbed()
            .setColor("#24A4B2")
            .addField('Hiba!', "Az argumentum több, mint egy elemből áll!"));
    }
}
module.exports.help = {
    name: "color",
    type: "user"
}