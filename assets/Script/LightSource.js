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

var LightCorner = require("LightCorner.js");

cc.Class({
    extends: cc.Component,

    
    properties: {
        // Block_Info: {
        //     default: null,
        //     blockTag: 0,
        //     corners: [Global.Block_Corner],
        //     lightSeg: [Global.Segment],
        //     edges: [Global.Segment],
        // },
        

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
        this.blockMap = new Map();

        this.cornerPosMap = new Map();

        this.isTurnOn = false;

        this.lightId = 0;

        this.posInWorld = cc.Vec2.ZERO;

        this.cornersLight = [LightCorner];
 
    },

    // update (dt) {},
    onEnable: function(){
        window.globalEvent.on(Global.UPDATE_CORNER, this.updateCorner, this);
    },

    onDisable: function() {
        // window.globalEvent.off(Global.UPDATE_BLOCK, this.updateBlock, this);
    },

    updateCorner: function(cornerId, pos) {
        if (this.cornerPosMap.get(cornerId) === undefined) {
            // 没出现过的corner
            this.cornerPosMap.set(cornerId, pos);
        }else {
            this.cornerPosMap[cornerId] = pos;
        }
    },

    signCorners: function() {
    
        var index = 0;
        this.cornerPosMap.forEach(cornerPos => {
            var lightCorner = new LightCorner();
            lightCorner.lightId = this.lightId;
            lightCorner.isLight = false;
            lightCorner.distance = this.posInWorld.distance(cornerPos.value);
            // var cornerLightVec = cc.Vec2(this.posInWorld, cornerPos);
            lightCorner.angle = cc.misc.radiansToDegrees(this.posInWorld.signAngle(cornerPos.value));

            this.cornersLight[index] = lightCorner;
            index++;
        });


        this.cornersLight.sort(function(a,b){
            // 角度优先，相同看距离
            if (a.angle == b.angle) {
                return a.distance - b.distance;
            }
            return a.angle - b.angle;
        });

        for (let index = 0; index < this.cornersLight.length; index++) {
            const element = this.cornersLight[index];
            element.markNo = index;
        }
    },

    updateBlock: function(blockTag, corners) {
        cc.log("................................");
        if (this.blockMap.get(blockTag) === undefined) {
            // 没出现过的block
            // var info = new Block_Info();

            // info.blockTag = blockTag;
            // this.updateBlockInfo(info, corners);

            // // lightSeg等开灯的时候再设置
            // this.blockMap.set(blockTag, info);
        }else {
            // 之前就有这个block
            // var info = this.blockMap[blockTag];

            // this.updateBlockInfo(this.blockMap[blockTag], corners);

            // // 清空lightSeg重新计算
            // info.lightSeg = [Global.Segment];
        }


    },

    updateBlockInfo: function(info, corners) {
        for (let i = 0; i < corners.length; i++) {
            const corner = corners[i];

            if (i > 0) {
                // 两个一组形成边数据
                var edge = new Global.Segment();
                edge.segIndex = i - 1;
                edge.start = cc.Vec2(corners[edge.segIndex].x, corners[edge.segIndex].y);
                edge.end = cc.Vec2(corner.x, corner.y);
                edge.blockTag = blockTag;
                info.edges[edge.segIndex] = edge;
            }

            // 顶点数据
            info.corners[i] = new Global.Block_Corner();
            info.corners[i].blockTag = blockTag;
            info.corners[i].pos = new cc.Vec2(corner.x, corner.y);
            
        }

        if (corners.length > 1) {
            // 补最后一条边
            var edge = new Global.Segment();
            edge.segIndex = corners.length - 1;
            edge.start = cc.Vec2(corners[edge.segIndex].x, corners[edge.segIndex].y);
            edge.end = cc.Vec2(corners[0].x, corners[0].y);
            edge.blockTag = blockTag;
            info.edges[edge.segIndex] = edge;
        }
    },

    turnOnLight: function() {

    }
});
