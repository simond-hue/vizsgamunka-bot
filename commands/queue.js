const Discord = require("discord.js");
const index = require("../index.js");
const ytdl = require("ytdl-core");

function timeNormalization(time){
    if(time >= 3600){
        hour = Math.floor(time/3600);
        time = time-hour*3600;
        if(hour < 10) hour = "0" + hour;
        minutes = Math.floor(time/60);
        time = time-minutes*60;
        if(minutes < 10) minutes = "0" + minutes;
        if(time < 10) time = "0" + time;
        return `${hour}:${minutes}:${time}`;
    }
    else{
        var currentLength = time;
        minutes = Math.floor(time/60);
        currentLength -= minutes*60;
        if(minutes < 10) minutes = "0"+minutes;
        seconds = currentLength;
        if(seconds < 10) seconds = "0"+seconds;
        return `${minutes}:${seconds}`;
    }
}

async function listingCommand(server, message){
    await listing(server, message)
    .then(async()=>{
        var timeT = (server.information[0].length_seconds*1000 - server.dispatcher.time);
        await message.channel.fetchMessages({ limit: 1 }).then(async(messages) => {
            server.lastMessage = messages.first();
            if(server.queue.length<=10) return;
            const collector = await server.lastMessage.createReactionCollector((reaction, user) =>
                user.id !== message.guild.me.id &&
                (reaction.emoji.name === "⬅️" ||
                 reaction.emoji.name === "➡️" ||
                 reaction.emoji.name === "⏩" ||
                 reaction.emoji.name === "⏪")
            ,{ time: timeT });
            server.reactionCollectorOnLastMessage = collector;
            collector.once("collect", async(reaction) => {
                switch(reaction.emoji.name){
                    case "➡️": server.page++;    break;
                    case "⬅️": server.page--;    break;
                    case "⏪": server.page = 0;  break;
                    case "⏩": 
                        if(Math.floor(server.queue.length/10) === server.queue.length/10)
                            server.page = Math.floor(server.queue.length/10)-1;
                        else
                            server.page = Math.floor(server.queue.length/10);    
                        break;
                }
                await server.lastMessage.clearReactions();
                await server.lastMessage.delete();
                return listingCommand(server,message);
            });
            if((server.page*10)+(server.queue.length%10) === server.queue.length || (Math.floor(server.queue.length/10) === server.queue.length/10 && server.page!=0)){
                try{
                    if(server.lastMessage) await server.lastMessage.react('⏪');
                    if(server.lastMessage) await server.lastMessage.react('⬅️');
                }
                catch(err){ 
                    if(err.code !== 10008) console.log(err) 
                }
            }
            else if(server.page === 0 && (server.page*10)+(server.queue.length%10) !== server.queue.length){
                try{
                    if(server.lastMessage) await server.lastMessage.react('➡️');
                    if(server.lastMessage) await server.lastMessage.react('⏩');
                }
                catch(err){ 
                    if(err.code !== 10008) console.log(err)  
                }
            }
            else{
                try{
                    if(server.lastMessage) await server.lastMessage.react('⏪');
                    if(server.lastMessage) await server.lastMessage.react('⬅️');
                    if(server.lastMessage) await server.lastMessage.react('➡️');
                    if(server.lastMessage) await server.lastMessage.react('⏩');
                }
                catch(err){ 
                    if(err.code !== 10008) console.log(err)  
                }
            }
        })
    });
}

async function listing(server, message){
    var queueEmbed = new Discord.RichEmbed()
    .setColor("#DABC12")
    .setTitle("Lejátszási lista")
    .setFooter(server.page+1+"/"+Math.ceil(server.queue.length/10))
    .setAuthor(
        "Vizsgamunka Bot",
        "https://cdn.discordapp.com/avatars/666067588039704599/8487d8b9ed665f8398151fe3c187f976.png"
    )
    .setThumbnail(message.guild.iconURL);
    var fromto;
    if(server.queue.length-server.page*10 < 10){
        fromto = server.queue.length;
    }
    else{
        fromto = server.page*10+10;
    }
    var promiseArray = [];
    for(var i = server.page*10; i < fromto; i++){
        if(!server.information[i] || server.information[i] === null)   
            promiseArray.push(new Promise((resolve, reject)=>{
                ytdl.getInfo(server.queue[i],async(err,info) =>{
                    resolve(info);
                })
            }));
        else promiseArray.push(null);
    }
    promiseArray.map(p => p);
    await Promise.all(promiseArray)
    .then((value)=>{
        for(var i = server.page*10; i < fromto; i++){
            if(value[i%10] !== null){
                server.information[i] = value[i%10];
            }
        }
        for(var i = server.page*10; i < fromto; i++){
            if(server.information[i] || server.information[i] !== null){
                var length = timeNormalization(server.information[i].length_seconds);
                queueEmbed.addField(`${(i+1)}.`, `[${server.information[i].title}](${server.queue[i]}) Hossz: ${length}`);
            }
            else{
                server.information[i] = null;
                queueEmbed.addField(`${i+1}`,'*A videó nem elérhető*');
            }
        }
    });
    await message.channel.send(queueEmbed);
    await message.channel.fetchMessages({ limit: 1 }).then(async(messages) => {
        server.lastMessage = messages.first();
    });
}

module.exports.run = async (bot, message, args) =>{
    try{
        server = index.servers[message.guild.id];
        if(!message.guild.voiceConnection)                      return message.channel.send(new Discord.RichEmbed()
                                                                    .setColor("#DABC12")
                                                                    .setTitle('Nem vagyok voice channelen!'));
        if(!server.queue[0] && message.guild.voiceConnection)   return message.channel.send(new Discord.RichEmbed()
                                                                    .setColor("#DABC12")
                                                                    .setTitle('Üres a lejátszási lista!'));
        if(!message.guild.me.hasPermission("MANAGE_MESSAGES"))  return message.channel.send(new Discord.RichEmbed()
                                                                    .setColor("#DABC12")
                                                                    .setTitle('Szükségem van üzenet kezelési jogra!'));
        if(!server.queueCanBeCalled) return message.channel.send(new Discord.RichEmbed()
                                        .setColor("#DABC12")
                                        .setTitle('A lejátszási lista még töltődik!'));
        if(server.shuffled) server.page = Math.floor(server.shuffleind/10);
        else server.page = 0;
        if(server.lastMessage && server.reactionCollectorOnLastMessage) server.lastMessage.clearReactions();
        listingCommand(server,message);
    }
    catch(e){
        console.log(e)
    }
}
module.exports.help = {
    name: "queue",
    type: "music",
    alias: ["q"]
}
