// Learn cc.Class:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] https://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html
var Global = require("Global.js");

cc.Class({
    extends: cc.Component,

    properties: {
        // foo: {
        //     // ATTRIBUTES:
        //     default: null,        // The default value will be used only when the component attaching
        //                           // to a node for the first time
        //     type: cc.SpriteFrame, // optional, default is typeof default
        //     serializable: true,   // optional, default is true
        // },
        // bar: {
        //     get () {
        //         return this._bar;
        //     },
        //     set (value) {
        //         this._bar = value;
        //     }
        // },
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {

    },

    // update (dt) {},

    clickStart: function() {
        cc.log("-------------------");
        window.globalEvent.emit(Global.TURN_LIGHT, 0, true);
        // this.node.getChildByName("start").visible = false;
        // this.node.getChildByName("sign").visible = true;
        // window.globalEvent.emit(Global.UPDATE_BLOCK, this.blockTag, this.corners);
    },
    
    clickSign: function() {
        window.globalEvent.emit(Global.DETECT_CORNER);
        // this.node.getChildByName("sign").visible = false;
    },
    clickCheck: function() {
        window.globalEvent.emit(Global.CHECK_CORNER);
        // this.node.getChildByName("sign").visible = false;
    },
});
