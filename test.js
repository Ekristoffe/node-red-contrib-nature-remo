var remo = require('./remo.js');
var Fs = require('fs');

var tokenPath = "./token.txt";
var token = Fs.readFileSync(tokenPath, 'utf8').trim();
console.log(token);

var appliancesPath = "./appliances.json";
var appliances = Fs.readFileSync(appliancesPath, 'utf8');
var json = JSON.parse(appliances);

async function testAll() {
    var nickname = "テレビ";
    var name = "情報";
    var signal_id = remo.get_signal_id(json, nickname, name);
    console.log('test post_commands_promise done.');
    console.log(signal_id);

    var commands = [
        { nickname: nickname, name: name, before_wait: 1000, after_wait: 3000 }, 
        { nickname: nickname, name: name, before_wait: 1000, after_wait: 3000 },       
    ];
    commands = remo.append_signal_ids(appliancesPath, commands);
    console.log('test append_signal_ids done.');
    console.log(commands[0].signal_id);

    await remo.set_timeout_promise(1000)
    console.log('test set_timeout_promise done.');

    var options = {url: 'http://www.google.com', method: 'GET'}
    var body = await remo.post_promise(options);
    console.log('test post_promise done.');

    await remo.post_signal_promise(token, signal_id);
    console.log('test post_signal_promise done.');

    await remo.post_command_promise(token, commands[0]);
    console.log('test post_command_promise done.');

    await remo.post_commands_promise(token, commands);
    console.log('test post_commands_promise done.');
}

testAll();