cc.Class({
    extends: cc.Component,

    properties: {
        label: cc.Label,
        // defaults, set visually when attaching this script to the Canvas
        text: 'Hello, World!'

    },

    // use this for initialization
    onLoad: function () {
        this.label.string = this.text;
    },

    // called every frame
    update: function (dt) {

    },
});
