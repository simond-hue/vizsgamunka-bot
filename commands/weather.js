const Discord = require("discord.js");
const request = require('request');
const botconfig = require("../botconfig.json");


function r(url){
    return new Promise((resolve, reject) =>{
        request(url,
            (e, r, b) =>{
                if(e) reject(e);
                if(r.statusCode == 200){
                    resolve(r);
                }
            });
        });
};

function stringify(input){
    inputStringified = "";
    if(input.getHours() <= 9){
        if(input.getHours() === 0) inputStringified += "23:";
        else inputStringified += "0" + (input.getHours()-1)+":";
    }
    else{
        inputStringified += (input.getHours()-1)+":";
    }

    if(input.getMinutes() <= 9){
        inputStringified += "0" + input.getMinutes()+":";
    }
    else{
        inputStringified += input.getMinutes()+":";
    }

    if(input.getSeconds() <= 9){
        inputStringified += "0" + input.getSeconds();
    }
    else{
        inputStringified += input.getSeconds();
    }
    return inputStringified;
}

function makeAsciiCompatible(input){
    output = "";
    for(i = 0; i < input.length; i++){
        switch(input.charAt(i)){
            case 'Á': output+="A"; break;
            case 'É': output+="E"; break;
            case 'Í': output+="I"; break;
            case 'Ó': output+="O"; break;
            case 'Ö': output+="O"; break;
            case 'Ő': output+="O"; break;
            case 'Ú': output+="U"; break;
            case 'Ü': output+="U"; break;
            case 'Ű': output+="U"; break;
            case 'á': output+="a"; break;
            case 'é': output+="e"; break;
            case 'í': output+="i"; break;
            case 'ó': output+="o"; break;
            case 'ö': output+="o"; break;
            case 'ő': output+="o"; break;
            case 'ú': output+="u"; break;
            case 'ü': output+="u"; break;
            case 'ű': output+="u"; break;
            default: output+=input.charAt(i); break;
        }
    }
    return output;
}

function makeUpperCase(input){
    split = input.split(' ');
    var output = "";
    for(var i = 0; i<split.length; i++){
        output+=split[i].substr(0,1).toUpperCase() + split[i].substr(1,split[i].length) + " ";
    }
    if(input.includes(',')){
        output = output.replace(output.substr(output.indexOf(','),output.length),"");
    }
    return output;
}

module.exports.run = async (bot, message, args) => {
    try{
        let telepules = "";
        let msg = "";
        if(message.content.split(' ').length===1){
            telepules = 'Budapest';
        }
        else{
            for(let i = 1; i < message.content.split(' ').length; i++){
                telepules += message.content.split(' ')[i]+" ";
            }
        }
        request(`https://api.openweathermap.org/data/2.5/weather?q=${makeAsciiCompatible(telepules)}&units=metric&appid=${botconfig.weatherAPIKEY}`, 
            async(error, response, body) => {  
                if(response.statusCode === 200){
                    data = JSON.parse(response.body);
                    let napkelte = new Date((data.sys.sunrise+data.timezone)*1000);
                    let napkelteString = stringify(napkelte);

                    let napnyugta = new Date((data.sys.sunset+data.timezone)*1000);
                    let napnyugtaString = stringify(napnyugta);
                    
                    time = await r(`http://api.timezonedb.com/v2.1/list-time-zone?key=${botconfig.timezoneAPIKEY}&format=json&country=${data.sys.country}`);
                    timedata = JSON.parse(time.body);

                    GMTOffset = data.timezone;
                    let i = 0;
                    while(i < timedata.zones.length){
                        if(timedata.zones[i].gmtOffset === GMTOffset) break;
                        i++;
                    }
                    currentTime = new Date(timedata.zones[i].timestamp*1000);
                    currentTimeString = stringify(currentTime);

                    localTime = await r(`http://api.timezonedb.com/v2.1/list-time-zone?key=${botconfig.timezoneAPIKEY}&format=json&country=HU`);
                    localTimeData = JSON.parse(localTime.body);

                    localTimeSet = new Date(localTimeData.zones[0].timestamp*1000);

                    telepules = makeUpperCase(telepules);

                    message.channel.send(new Discord.RichEmbed()
                        .setColor("#DABC12")
                        .setTitle("Időjárás")
                        .setThumbnail(`http://openweathermap.org/img/w/${data.weather[0].icon}.png`)
                        .addField("🏙️ Település",`${telepules.substr(0,1).toUpperCase()+telepules.substr(1,telepules.length)}, ${data.sys.country}`)
                        .addField("☀️ Hőm️érséklet °C/°F", `${data.main.temp} °C/${Math.round((data.main.temp * (9/5) + 32)*100)/100} °F`)
                        .addField("🌡️ Minimum hőmérséklet °C/°F", `${data.main.temp_min} °C/${Math.round((data.main.temp_min * (9/5) + 32)*100)/100} °F`,true)
                        .addField("🌡️ Maximum hőmérséklet °C/°F", `${data.main.temp_max} °C/${Math.round((data.main.temp_max * (9/5) + 32)*100)/100} °F`,true)
                        .addField(`🌅 Napkelte`,`${napkelteString}`,true)
                        .addField(`🌇 Napnyugta`,`${napnyugtaString}`,true)
                        .addField("🕒 Jelenlegi idő", `${currentTimeString}`)
                        .setDescription(`_Lekérdezve ekkor: ${stringify(localTimeSet)}_`));
                }
                else if(response.statusCode === 404){
                    message.channel.send(new Discord.RichEmbed()
                        .setColor("#DABC12")
                        .setTitle("Időjárás")
                        .addField("Hiba","Nem volt találat!"));
                }
                else{
                    message.channel.send(new Discord.RichEmbed()
                        .setColor("#DABC12")
                        .setTitle("Időjárás")
                        .addField("Hiba","Hiba történt a szerverrel való kommunikációval!"));
                }
            });
    }
    catch(e){
        console.log(e)
    }
}
module.exports.help = {
    name: "weather",
    type: "weather"
}
