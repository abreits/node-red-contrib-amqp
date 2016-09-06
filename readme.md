Node-RED AMQP input and output nodes
====================================


`node-red-contrib-amqp` is a [Node-RED](http://nodered.org/docs/creating-nodes/packaging.html) package that connects directly to an AMQP server (e.g. [RabbitMQ](https://www.rabbitmq.com/)). It contains an input, an output and a configuration node to connect to AMQP exchanges or queues for Node-RED.

It uses the [amqp-ts](https://github.com/abreits/amqp-ts) library for the AMQP connectivity.


## Table of Contents
- [Installation](#installation)
- [Overview](#overview)
- [Known issues](#knownissues)
- [What's new](#whatsnew)
- [Roadmap](#roadmap)


## Installation     <a name="installation"></a>

If you have installed Node-RED as a global node.js package (you use the command `node-red` anywhere to start it), you need to install
node-red-contrib-amqp as a global package as well:

```
$[sudo] npm install -g node-red-contrib-amqp
```

If you have installed the .zip or cloned your own copy of Node-RED from github, you can install it as a normal npm package inside the Node-RED project directory:

```
<path/to/node-red>$ npm install node-red-contrib-amqp
```

## Overview     <a name="overview"></a>

The package contains the following Node-RED nodes:

### input: amqp

Subscribes to an AMQP exchange or queue and reads messages from it. It outputs an object called
`msg` containing the following fields:
- `msg.payload` is a string or an object containing the content of the AMQP message.
- `msg.topic` is a string containing the routing-key of the AMQP message.
- `msg.amqpMessage` is an [amqp-ts Message](https://github.com/abreits/amqp-ts/wiki/Message%20class)
   object containing the received message.sendto

If a topic is defined in the input node definition, that will be sent as `msg.topic` instead of the routing key.

In the settings you can only define the exchange type or queue and it's name. If you need to use an exchange or a queue with specific settings you can define the exchange or queue in the [topology](#topology) tab of the AMQP server configuration node. The input node will use the exchange or queue defined in the topology.

### output: amqp

Delivers incoming the message payload to the specified exchange or queue. It expects an object called
`msg` containing the following fields:
- `msg.payload`: string or an object containing the content of the AMQP message to be sent.
- `msg.topic`: string containing the routing-key of the AMQP message to be sent.
- `msg.options`: object containing specific AMQP properties for the message to be sent, see the
  [amqplib publish](http://www.squaremobius.net/amqp.node/channel_api.html#channel_publish) documentation for more information.

If a topic is defined in the output node definition, that will be sent as routing-key instead of the `msg.topic`. If the `msg.payload` field does not exist, the whole msg object will be sent.

In the settings you can only define the exchange type or queue and it's name. If you need to use an exchange or a queue with specific settings you can define the exchange or queue in the **topology** tab of the AMQP server configuration node. The output node will use the exchange or queue defined in the topology.

### configuration: amqp-server

Defines the connection to the AMQP server. You can also define in more detail the exchanges and queues that are used in the input and output nodes and even define bindings between exchanges and queues in the topology tab.

#### topology tab     <a name="topology"></a>

In the topology tab you can define the AMQP server exchange and queue topology (exchanges, queues and bindings). You define the topology in the JSON editor.

Topology configuration example:

```JSON
{
    "exchanges": [
        {"name": "exchange1", "type": "direct", "options": {"durable": false}},
        {"name": "exchange2"}
    ],
    "queues": [
        {"name": "queue1", "options": {"messageTtl": 60000}},
        {"name": "queue2"}
    ],
    "bindings": [
        {"source": "exchange1", "queue": "queue1", "pattern": "debug", "args": {}},
        {"source": "exchange1", "exchange": "exchange2", "pattern": "error"},
        {"source": "exchange2", "queue": "queue2"}
    ]
};
```


## Known issues     <a name="knownissues"></a>
- Entering invalid credentials (username/password) in the AMQP configuration node can cause node-red to malfunction


## What's new     <a name="whatsnew"></a>

### version 0.4.4
- bugfix, topology editor not visible in amqp-server config node

### version 0.4.3
- bugfix, fixed routingkey not working in configuration/definition (thanks to exogenesick)

### version 0.4.0
- major refactor, made preparations for better testable code:
  - javascript source code has been translated to typescript
  - gulp build system added

### version 0.3.0
- connection to AMQP server now only established when amqp input and/or AMQP output nodes exist
- major refactor and code cleanup
- fixed errors in readme

### version 0.2.0
- fixed user credentials not working
- improved readme

### version 0.1.0
- initial release


## Roadmap     <a name="roadmap"></a>

The roadmap section describes things that I want to add or change in the (hopefully near) future.

- Add extra features
- Make testable
- Add localization
