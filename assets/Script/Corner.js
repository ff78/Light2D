// Learn cc.Class:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] https://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

// var LightCorner = require("LightCorner.js");

cc.Class({
    extends: cc.Component,

    properties: {

    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {

        this.CornerState = {
            UNCHECKED: 1,
            SIGNED: 2,
            CHECKING: 3,
            LIGHT: 4,
            properties: {
                1: {
                    name: "unchecked",
                    value: 1,
                    code: "UC"
                },
                2: {
                    name: "signed",
                    value: 1,
                    code: "SI"
                },
                3: {
                    name: "checking",
                    value: 1,
                    code: "CK"
                },
                4: {
                    name: "light",
                    value: 1,
                    code: "LT"
                },
            }
        };

        this.blockTag = 0; // 所属矩形编号
        this.cornerIndex = 0; // 角编号
        this.idInWorld = 0; // 组合一个唯一Id
        this.posInWorld = cc.Vec2.ZERO; // 场景坐标

        this.directLightId = 0; // 显示指引的光源Id

        this.edgeId = []; // 所在边

        // this.lightCorners = new Map();

    },

    start() {

        this.changeState(this.CornerState.UNCHECKED);
    },

    onEnable: function () {
        window.globalEvent.on('TURN_LIGHT', this.turnLight, this);
        window.globalEvent.on('SIGN_CORNER', this.signCorner, this);
        window.globalEvent.on('LIGHT_CORNER', this.lightCorner, this);
    },

    onDisable: function () {
        window.globalEvent.off('TURN_LIGHT', this.turnLight, this);
        window.globalEvent.off('SIGN_CORNER', this.signCorner, this);
        window.globalEvent.off('LIGHT_CORNER', this.lightCorner, this);
    },

    // update (dt) {},

    changeState: function (simpleState) {
        switch (simpleState) {
            case this.CornerState.UNCHECKED:
                var imPoint = this.node.getChildByName("imPoint");
                imPoint.color = new cc.Color(0xbb, 0xbb, 0xbb);
                var labelNo = this.node.getChildByName("labelNo").getComponent(cc.Label)
                labelNo.string = " ";
                break;

            case this.CornerState.SIGNED:
                var imPoint = this.node.getChildByName("imPoint");
                // imPoint.color = new cc.Color(0xbb, 0xbb, 0xbb);
                imPoint.color = cc.Color.GRAY;
                var labelNo = this.node.getChildByName("labelNo").getComponent(cc.Label)
                labelNo.string = this.markNo.toString();
                break;

            case this.CornerState.CHECKING:
                var imPoint = this.node.getChildByName("imPoint");
                imPoint.color = this.isLight ? cc.Color.YELLOW : cc.Color.MAGENTA;
                var labelNo = this.node.getChildByName("labelNo").getComponent(cc.Label)
                labelNo.string = this.markNo.toString();
                break;

            case this.CornerState.LIGHT:
                var imPoint = this.node.getChildByName("imPoint");
                imPoint.color = this.isLight ? cc.Color.YELLOW : cc.Color.MAGENTA;
                var labelNo = this.node.getChildByName("labelNo").getComponent(cc.Label)
                labelNo.string = this.markNo.toString();
                break;

            default:
                break;
        }

        this.state = simpleState;
    },

    setup: function (blockTag, cornerIndex, pos, edgeId) {
        // var self = this;
        this.blockTag = blockTag;
        this.cornerIndex = cornerIndex;
        this.idInWorld = blockTag * 100 + cornerIndex + 1;
        this.posInWorld = pos;
        this.edgeId = [...edgeId];
    },

    lightCorner: function (lightId, cornersLight) {
        // 不用看的，跳过
        if (this.directLightId !== lightId) {
            return;
        }

        for (let index = 0; index < cornersLight.length; index++) {
            const element = cornersLight[index];
            if (element.idInWorld === this.idInWorld) {
                this.isLight = element.isLight;
                this.changeState(this.CornerState.CHECKING);
                break;
            }
        }
    },
    
    signCorner: function (lightId, cornersLight) {

        // 不用看的，跳过
        if (this.directLightId !== lightId) {
            return;
        }

        for (let index = 0; index < cornersLight.length; index++) {
            const element = cornersLight[index];

            if (element.idInWorld === this.idInWorld) {
                // 找到自己，标号
                this.markNo = element.markNo;
                this.changeState(this.CornerState.SIGNED);

                break;
            }
        }
    },

    turnLight: function (lightId, isTurnOn) {

        // 不用看的，跳过
        if (this.directLightId !== lightId) {
            return;
        }

        if (isTurnOn == false) {
            this.markNo = 0;
            this.changeState(this.CornerState.UNCHECKED);
            return;
        }

        window.globalEvent.emit("UPDATE_CORNER", this.idInWorld, this.posInWorld, this.edgeId);
    },
});