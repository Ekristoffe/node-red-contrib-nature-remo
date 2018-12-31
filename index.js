var Fs = require('fs');
var Request = require('request');
var Remo = require('./remo.js');

module.exports = function(RED) {
    function NatureTokenNode(config) {
	    RED.nodes.createNode(this, config);
    }
	
    RED.nodes.registerType('nature-token', NatureTokenNode, { credentials: { token: { type: "text" }}});

    function NatureRemoNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        node.on('input', async function(msg) {
	        var commands = Remo.append_signal_ids(config.appliances, msg.payload.commands);
            var token = RED.nodes.getNode(config.token).credentials.token;
            try {
                await Remo.post_commands_promise(token, commands);
                msg.payload = "done";
                node.send(msg);
            } catch(error) {
                node.error("POST command error" + error);
            }
        });
    }

    RED.nodes.registerType("nature-remo", NatureRemoNode);
}
