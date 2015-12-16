//to do: Node RED type definitions
declare var RED: any;

//
// -- amqp out -------------------------------------------------------------------------------------
//
RED.nodes.registerType("amqp out", {
    category: "output",
    defaults: {
        name: { value: "" },
        routingkey: { value: "" },
        iotype: { value: "0", required: true},
        ioname: { value: "", required: true },
        server: { type: "amqp-server", required: true }
    },
    inputs: 1,
    outputs: 0,
    color: "#ff9933",
    icon: "bridge.png",
    align: "right",
    label: function() {
        return this.name || this.ioname || "amqp";
    },
    labelStyle: function() {
        return this.name ? "node_label_italic" : "";
    }
});
