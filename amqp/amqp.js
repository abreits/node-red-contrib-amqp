module.exports = function(RED) {
  "use strict";
  var amqp = require("amqp-ts");
  var exchangeTypes = ['direct', 'fanout', 'headers', 'topic'];

  function getSrc(node) {
    // node.ioType is a string with the following meaning:
    // '0': direct exchange
    // '1': fanout exchange
    // '2': headers exchange
    // '3': topic exchange
    // '4': queue
    if (node.ioType == '4') {
      return node.server.connection.declareQueue(node.ioName);
    } else {
      return node.server.connection.declareExchange(node.ioName, exchangeTypes[node.ioType]);
    }
  }


//
//-- AMQP IN ------------------------------------------------------------------
//
  function AmqpIn(n) {
    var node = this;
    RED.nodes.createNode(node, n);

    node.source = n.source;
    node.topic = n.topic;
    node.ioType = n.iotype;
    node.ioName = n.ioname;
    node.server = RED.nodes.getNode(n.server);

    function Consume(msg) {
      node.send({
        topic: node.topic || msg.fields.routingKey,
        payload: msg.getContent(),
        amqpMessage: msg
      });
    }

    if (node.server) {
      node.status({fill:"red",shape:"ring",text:"common.status.disconnected"});
      var src = getSrc(node);
      src.activateConsumer(Consume, {noAck: true}).then(function () {
        node.status({fill:"green",shape:"dot",text:"common.status.connected"});
      }).catch(function (e) {
        node.error('AMQP input error: ' + e.message);
      });

      node.on("close", function() {
        src.close();
      });
    } else {
      node.error('AMQP output error: missing AMQP server configuration');
    }
  }

//
//-- AMQP OUT -----------------------------------------------------------------
//
  function AmqpOut(n) {
    var node = this;
    RED.nodes.createNode(node, n);

    node.source = n.source;
    node.topic = n.topic;
    node.ioType = n.iotype;
    node.ioName = n.ioname;
    node.server = RED.nodes.getNode(n.server);

    if (node.server) {
      node.status({fill:"red",shape:"ring",text:"common.status.disconnected"});
      var src = getSrc(node);
      src.initialized.then(function () {
        node.status({fill:"green",shape:"dot",text:"common.status.connected"});
      }).catch(function (e) {
        node.error('AMQP output error: ' + e.message);
      });

      node.on("input", function (msg) {
        var message;
        if (msg.payload) {
          message = new amqp.Message(msg.payload, msg.options);
        } else {
          message = new amqp.Message(msg);
        }
        message.sendTo(src, msg.topic);
      });

      node.on("close", function() {
        src.close();
      });
    } else {
      node.error('AMQP output error: missing AMQP server configuration');
    }
  }

  function AmqpServer(n) {
    var node = this;
    RED.nodes.createNode(node,n);

    // Store local copies of the node configuration (as defined in the .html)
    node.host = n.host || 'localhost';
    node.port = n.port || '5672';
    node.vhost = n.vhost;
    node.keepAlive = n.keepalive;
    node.useTls = n.usetls;
    node.useTopology = n.usetopology;
    node.topology = n.topology;

    // Create the connection url for the AMQP server
    var url = node.useTls ? 'amqps://' : 'amqp://';
    if (node.credentials) {
      url += node.credentials.user + ':' + node.credentials.password + '@';
    }
    url += node.host + ':' + node.port;
    if (node.vhost) {
      url += '/' + node.vhost;
    }
    if (node.keepAlive) {
      url += '?heartbeat=' + node.keepAlive;
    }

    node.connection = new amqp.Connection(url);
    node.connection.initialized.then(function () {
      node.log('Connected to AMQP server ' + node.host);
    }).catch(function () {
      node.error('AMQP-SERVER error: ' + e.message);
    });

    // Create topology
    if(node.useTopology) {
      try {
        var topology = JSON.parse(node.topology);
        node.connection.declareTopology(topology).catch(function (e) {
          node.error('AMQP-SERVER error creating topology: ' + e.message);
        });
      } catch (e) {
        node.error('AMQP-SERVER error creating topology: ' + e.message);
      }
    }

    node.on('close', function () {
      node.connection.close().then(function () {
        node.log('Connected to AMQP server ' + node.host + ' closed');
      }).catch(function (e) {
        node.error('AMQP-SERVER error closing connection: ' + e.message);
      });
    });
  }

  // Register the node by name. This must be called before overriding any of the
  // Node functions.
  RED.nodes.registerType("amqp in", AmqpIn);
  RED.nodes.registerType("amqp out", AmqpOut);
  RED.nodes.registerType("amqp-server", AmqpServer);
};
