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
var LightEdge = require("LightEdge.js");

cc.Class({
    extends: cc.Component,


    properties: {
        // 光源Id
        lightId: 0,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        // 唯一cornerId和worldPos键值对表
        this.cornerPosMap = new Map();
        // 点亮
        this.isTurnOn = false;
        // world坐标
        this.posInWorld = this.node.parent.convertToWorldSpaceAR(this.node.position);
        // corner信息数组
        this.cornersLight = [];

        this.edges = [];
    },

    start() {

    },

    // update (dt) {},

    onEnable: function () {
        window.globalEvent.on(Global.TURN_LIGHT, this.turnLight, this);
        window.globalEvent.on(Global.UPDATE_CORNER, this.updateCorner, this);
        window.globalEvent.on(Global.UPDATE_EDGES, this.updateEdges, this);


        window.globalEvent.on(Global.DETECT_CORNER, this.signCorners, this);
        window.globalEvent.on(Global.CHECK_CORNER, this.checkCorners, this);
        window.globalEvent.on(Global.LIGHT_WALL, this.lightWall, this);
    },

    onDisable: function () {
        window.globalEvent.off(Global.TURN_LIGHT, this.turnLight, this);
        window.globalEvent.off(Global.UPDATE_CORNER, this.updateCorner, this);
        window.globalEvent.off(Global.UPDATE_EDGES, this.updateEdges, this);
        window.globalEvent.off(Global.DETECT_CORNER, this.signCorners, this);
        window.globalEvent.off(Global.CHECK_CORNER, this.checkCorners, this);
        window.globalEvent.off(Global.LIGHT_WALL, this.lightWall, this);
    },


    setLightId: function (lightId) {
        this.lightId = lightId;
    },

    updateCorner: function (cornerId, pos) {
        if (this.cornerPosMap.get(cornerId) === undefined) {
            // 没出现过的corner
            this.cornerPosMap.set(cornerId, pos);
        } else {
            this.cornerPosMap[cornerId] = pos;
        }
    },

    updateEdges: function (lightId, edges) {
        if (this.lightId !== lightId) {
            return;
        }
        var self = this;

        // var existEdges = undefined;
        edges.forEach(edge => {
            var existEdges = self.edges.filter(item => {
                if (item.blockTag == edge.blockTag) {
                    if (item.idInWorld == edges.idInWorld) {
                        item.firstPos = new cc.Vec2(edge.firstPos.x, edge.firstPos.y);
                        item.secondPos = new cc.Vec2(edge.secondPos.x, edge.secondPos.y);
                    }
                    return true;
                }
                return false;
            });
            if (existEdges === undefined || existEdges.length == 0) {
                var litEdge = new LightEdge();
                litEdge.lightId = 0;
                litEdge.isLight = false;
                litEdge.idInWorld = edge.idInWorld;
                litEdge.firstPos = cc.v2(edge.firstPos.x, edge.firstPos.y);
                litEdge.secondPos = cc.v2(edge.secondPos.x, edge.secondPos.y);
                self.edges.push(litEdge);
            };

        });
    },

    lightWall: function() {
        // 从第二个角开始
        for (let i = 1; i < this.cornersLight.length; i++) {
            const corner = this.cornersLight[i];
            // 当前角不亮，就跳过
            if (corner.isLight == false) {
                continue;
            }

            const lastCorner = this.cornersLight[i-1];
            if (lastCorner.isLight == true) {
                
            } else {

            }

        }

    },

    checkCorners: function () {
        // cc.log("遍历确定点是否被光源点亮");
        // 遍历确定点是否被光源点亮
        var self = this;

        self.cornersLight.forEach(corner => {

            corner.isLight = true;

            for (let index = 0; index < self.edges.length; index++) {
                const edge = self.edges[index];
                // 排除角所在边
                var isInclude = false;
                if (cc.v2(corner.posInWorld).equals(edge.firstPos) || cc.v2(corner.posInWorld).equals(edge.secondPos)) {
                    isInclude = true;
                }
    
                // 线段相交，说明被挡
                var isCollide = cc.Intersection.lineLine(corner.posInWorld, self.posInWorld, edge.firstPos, edge.secondPos);
                if (isCollide == true && isInclude == false) {
                    corner.isLight = false;
                    break;
                    // return true;
                }
                
            }
            // self.edges.some((edge) => {

            //     return false;
            // });

        });

        window.globalEvent.emit('LIGHT_CORNER', self.lightId, self.cornersLight);
    },

    // 
    signCorners: function () {
        var index = 0;

        this.cornerPosMap.forEach(
            function (cornerPos, key) {
                var lightCorner = new LightCorner();
                lightCorner.idInWorld = key;
                lightCorner.lightId = this.lightId;
                lightCorner.isLight = false;
                lightCorner.posInWorld = cornerPos;

                let cornerVec = cc.v2(cornerPos.sub(this.posInWorld));
                lightCorner.distance = cornerVec.mag();
                let comVec = cc.v2(0, 1); // 水平向右的对比向量
                var cornerRadians = cornerVec.signAngle(comVec);
                lightCorner.angle = cc.misc.radiansToDegrees(cornerRadians);

                this.cornersLight[index] = lightCorner;
                index++;

            }, this);
        // this.cornerPosMap.forEach(cornerPos => {
        // });


        this.cornersLight.sort(function (a, b) {
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

        window.globalEvent.emit('SIGN_CORNER', this.lightId, this.cornersLight);
    },

    turnLight: function (lightId, isTurnOn) {
        if (lightId !== this.lightId) {
            return;
        }

        this.isTurnOn = isTurnOn;
        if (isTurnOn === false) {

        } else {

        }
    },
});