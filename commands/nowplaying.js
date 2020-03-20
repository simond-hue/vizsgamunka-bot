const Discord = require("discord.js");
const index = require("../index.js");

async function error (message, msg){
    await message.channel.send(new Discord.RichEmbed().setColor("#DABC12").setTitle(msg));
}
// *1 óránál hosszabbnál rossz értékeket ad vissza (ugyanez szerepel más module-ban is)
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

function createEmbed(server){
    embed = new Discord.RichEmbed() // richembed létrehozása
        .setTitle("Jelenlegi zeneszám")
        .setDescription(server.information[server.shuffleind].title)
        .setURL(server.queue[server.shuffleind])
        .setColor("#DABC12")
        .setFooter(
            `Kérte: ${server.requestedBy[server.requestedBy.length-1]}`,
            server.requestedByProfPic[server.requestedByProfPic.length-1]
        )
        .setThumbnail(server.information[server.shuffleind].player_response.videoDetails.thumbnail.thumbnails[0].url)
        .setAuthor(
            "Vizsgamunka Bot",
            "https://cdn.discordapp.com/avatars/666067588039704599/8487d8b9ed665f8398151fe3c187f976.png"
        );
    if(!server.information[server.shuffleind].player_response.videoDetails.isLiveContent){
        currentLengthInSec = Math.floor(server.dispatcher.time/1000);
        var display = "";
            // százalékos kiírást 
        percantage = Math.round((currentLengthInSec / server.information[server.shuffleind].length_seconds)*100/5);
        for(var i = 0; i < percantage;i++){ 
            display += "⎯";
        }
        display += "⬤";
        for(var i = percantage; i < 20; i++){
            if(i!==0) display += "⎯";
        }
        embed.addField(timeNormalization(currentLengthInSec) + "/" + timeNormalization(server.information[server.shuffleind].length_seconds),display);
    }
    return embed;
}

module.exports.run = async (bot, message, args) => {
    try{
        if(!message.guild.voiceConnection) return error(message,'Nem vagyok voice channelen!'); // Ha a bot nincs a voice-on
        server = index.servers[message.guild.id]; // current szerver
        if(!server.dispatcher) return error(message,'Nincs zene a lejátszóban!') // üres a lejátszási lista 
        embed = createEmbed(server);
        return await message.channel.send(embed);
    }
    catch(e){
        console.log(e)
    }
}
module.exports.help = {
    name: "nowplaying",
    type: "music",
    alias: ["np","currentsong","cs"]
}