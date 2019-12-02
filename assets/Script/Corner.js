// Learn cc.Class:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] https://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html
var LightCorner = require("LightCorner.js");
cc.Class({
    extends: cc.Component,

    properties: {
        blockTag: 0,                                // 所属矩形编号
        cornerIndex: 0,                             // 角编号
        idInWorld: 0,                                 // 组合一个唯一Id
        posInWorld: cc.Vec2,                          // 场景坐标
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {

        this.CornerState = {
            UNCHECKED: 1,
            SIGNED: 2,
            CHECKING: 3,
            LIGHT: 4,
            properties: {
                1:{name: "unchecked", value: 1, code: "UC"},
                2:{name: "signed", value: 1, code: "SI"},
                3:{name: "checking", value: 1, code: "CK"},
                4:{name: "light", value: 1, code: "LT"},
            }
        };

        this.blockTag = 0;                                // 所属矩形编号
        this.cornerIndex = 0;                             // 角编号
        this.idInWorld = 0;                                 // 组合一个唯一Id
        this.posInWorld = cc.Vec2.ZERO;                          // 场景坐标

        this.directLightId = 0;                             // 显示指引的光源Id

        this.lightCorners = new Map();

        this.changeState(this.CornerState.UNCHECKED);
    },
    
    onEnable: function() {
        window.globalEvent.on('SCAN_CORNER', this.scanCorner, this);
    },

    // update (dt) {},

    changeState: function(simpleState) {
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
                    imPoint.color = cc.Color.RED;
                    var labelNo = this.node.getChildByName("labelNo").getComponent(cc.Label)
                    labelNo.string = this.markNo.toString();
                break;

            case this.CornerState.LIGHT:
                    var imPoint = this.node.getChildByName("imPoint");
                    imPoint.color = this.isLight?cc.Color.YELLOW:cc.Color.MAGENTA;
                    var labelNo = this.node.getChildByName("labelNo").getComponent(cc.Label)
                    labelNo.string = this.markNo.toString();
                break;
                
            default:
                break;
        }

        this.state = simpleState;
    },

    setup:function(blockTag, cornerIndex, pos){
        this.blockTag = blockTag;
        this.cornerIndex = cornerIndex,
        this.idInWorld = blockTag * 100 + cornerIndex + 1;
        this.posInWorld = pos;
    },

    
    scanCorner: function() {
        // 把自己给光源注册
        window.globalEvent.emit(Global.UPDATE_CORNER, this.idInWorld, this.posInWorld);
    },
});
