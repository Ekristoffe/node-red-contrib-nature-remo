var Fs = require('fs');
var Request = require('request');

function post_signal(signal_id, token) {
  var options = {
    url: "https://api.nature.global/1/signals/" + signal_id + "/send",
    headers: { "Authorization": "Bearer " + token }
  }
  Request.post(options, function(error, response, body) {
    if (error) {
      console.error('POST failed:', error);
    }
  });
}

function get_signal_id(appliances, nickname, name) {
  var signal_id = ''
  var file = Fs.readFileSync(appliances, 'utf8')
  var json = JSON.parse(file)
  for (var i=0; i<json.length; i++) {
    if (json[i]['nickname'] != nickname) {
      continue
    }
    for(var j=0; j<json[i]['signals'].length; j++) {
      if (json[i]['signals'][j]['name'] == name) {
        signal_id = json[i]['signals'][j]['id']
      }
    }
  }
  return signal_id
}

module.exports = function(RED) {
    function NatureTokenNode(config) {
	RED.nodes.createNode(this, config);
    }
	
    RED.nodes.registerType('nature-token', NatureTokenNode, { credentials: { token: { type: "text" }}});

    function NatureRemoNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        node.on('input', function(msg) {
	    var nickname = msg.payload.nickname
	    var name = msg.payload.name
	    var signal_id = get_signal_id(config.appliances, nickname, name)
            var token = RED.nodes.getNode(config.token).credentials.token
	    post_signal(signal_id, token)
        });
    }

    RED.nodes.registerType("nature-remo", NatureRemoNode);
}
