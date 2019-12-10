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
        this.cornerEdgeId = new Map();
        // 点亮
        this.isTurnOn = false;
        // world坐标
        this.posInWorld = this.node.parent.convertToWorldSpaceAR(this.node.position);
        // corner信息数组
        this.cornersLight = [];

        this.edges = [];

        // 有效发光点
        this.lightPoints = [];
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

    updateCorner: function (cornerId, pos, edgeId) {
        if (this.cornerPosMap.get(cornerId) === undefined) {
            // 没出现过的corner
            this.cornerPosMap.set(cornerId, pos);
        } else {
            this.cornerPosMap[cornerId] = pos;
        }
        var edgesId = [];
        edgesId = [...edgeId];
        if (this.cornerEdgeId.get(cornerId) === undefined) {
            // 没出现过的corner
            this.cornerEdgeId.set(cornerId, edgesId);
        } else {
            this.cornerEdgeId[cornerId] = edgesId;
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

    lightWall: function () {
        // 清空发光点
        this.lightPoints.length = 0;

        // 发光点全放进数组
        for (let i = 0; i < this.cornersLight.length; i++) {
            const corner = this.cornersLight[i];
            // 当前角不亮，就跳过
            if (corner.isLight == false) {
                continue;
            }

            // 如果之前的发光点和这个角在不同边，从上一发光点和角分别向外扩张1发光点。
            // 扩张的发光点有可能正好在另一点的所在边，也可能扩张的发光点都落在同一边
            // 只可能有三种情况： Aex----B， Aex----Bex， A----Bex
            var diffEdgeId = -1;
            if (this.lightPoints.length > 0) {
                // 上一个发光点
                var lastPoint = this.lightPoints[this.lightPoints.length - 1];
                // 上一个发光点和这个角是不是在不同边
                for (let index = 0; index < lastPoint.edgeId.length; index++) {
                    const lastEdge = lastPoint.edgeId[index];
                    for (let k = 0; k < corner.edgeId.length; k++) {
                        const cornerEdge = corner.edgeId[k];
                        if (lastEdge != cornerEdge) {
                            diffEdgeId = lastEdge;
                            break;
                        }
                    }
                    if (diffEdgeId != -1) {
                        break;
                    }
                }

                // 不在同边，有光窗
                if (diffEdgeId != -1) {

                    var extendPoint1 = cc.Vec2.ZERO;
                    // 从光源射向上一发光点的向量
                    var dirVec1 = lastPoint.posInWorld - this.posInWorld;
                    for (let i = 0; i < this.edges.length; i++) {
                        const checkEdge = this.edges[i];
                        // 排除上一发光点所在边
                        if (lastPoint.indexOf(checkEdge) != 0) {
                            continue;
                        }
                        // 光源到线段端点的向量
                        var edgeVec1 = checkEdge.firstPos - this.posInWorld;
                        var edgeVec2 = checkEdge.secondPos - this.posInWorld;
                        var x1 = edgeVec1.cross(dirVec1);
                        var x2 = edgeVec2.cross(dirVec1);
                        // 两夹角方向相同，说明光不在线段内，可忽略
                        if (x1 * x2 > 0) {
                            continue;
                        }

                        var edgeVec = checkEdge.secondPos - checkEdge.firstPos;

                        if (this.LineLineIntersection(extendPoint1, lastPoint.posInWorld, dirVec1, checkEdge.firstPos, edgeVec)) {
                            
                        }
                    }


                }
            }
            // 把角作为发光点放进去
            var point = new LightCorner();
            point.lightId = corner.lightId;
            point.idInWorld = corner.idInWorld;
            point.markNo = corner.markNo;
            point.isLight = true;
            point.posInWorld = corner.posInWorld;
            point.edgeId = [...corner.edgeId];
            this.lightPoints.push(point);

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
                if (corner.edgeId.indexOf(edge.idInWorld) != -1) {
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
                lightCorner.edgeId = [...this.cornerEdgeId.get(key)];

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

    LineLineIntersection: function (intersection, p1, dirVec1, p2, dirVec2) {
        intersection = cc.Vec2.ZERO;

        // 平行
        if (dirVec1.dot(dirVec2) == 1) {
            return false;
        }

        var startPointSeg = p2 - p1;
        var vecS1 = dirVec1.cross(dirVec2); // 有向面积1
        var vecS2 = startPointSeg.cross(dirVec2); // 有向面积2

        // 有向面积比值，利用点乘是因为结果可能是正数或者负数
        var num2 = vecS2.Dot(vecS1) / vecS1.magSqr();

        intersection = p1 + dirVec1 * num2;

        return true;
    },
});