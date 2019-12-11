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

            if (this.lightPoints.length > 0) {
                var lastPoint = this.lightPoints[this.lightPoints.length - 1];
                this.pushExtendPoint(lastPoint, corner);
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

        // 最后一个发光点(角)需要检查到第一个发光点，形成一个封闭图形
        if (this.lightPoints.length > 0) {

            var lastPoint = this.lightPoints[this.lightPoints.length - 1];
            var originPoint = this.lightPoints[0];
            this.pushExtendPoint(lastPoint, originPoint);

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

    findExtendPoint: function (point1, dirVec1, pointEdges, extendPoint) {
        // 最后发光点能不能直接投到角的所在边
        var tempPoint = cc.Vec2.ZERO;
        var nearPoint = cc.Vec2.ZERO;
        var nearEdgeId = 0;

        var nearDistance = 0;

        for (let i = 0; i < pointEdges.length; i++) {
            const checkEdge = pointEdges[i];

            if (point1.edgeId.indexOf(checkEdge) != -1) {
                // 排除发光点所在边
                continue;
            }

            var pos1 = this.edges[checkEdge].firstPos;
            var pos2 = this.edges[checkEdge].secondPos;

            var edgeVec1 = pos1.sub(this.posInWorld);
            var edgeVec2 = pos2.sub(this.posInWorld);

            var x1 = edgeVec1.cross(dirVec1);
            var x2 = edgeVec2.cross(dirVec1);
            // 两夹角方向相同，说明光不会经过线段，可忽略
            if (x1 * x2 > 0) {
                continue;
            }

            var edgeVec = checkEdge.secondPos.sub(checkEdge.firstPos);

            // 找到最近的交点
            if (this.LineLineIntersection(tempPoint, point1.posInWorld, dirVec1, checkEdge.firstPos, edgeVec)) {
                let lenVec = cc.v2(tempPoint.sub(this.posInWorld));
                var distance = lenVec.mag();
                if (nearEdgeId == 0) {
                    nearPoint = cc.v2(tempPoint);
                    nearDistance = distance;
                    nearEdgeId = checkEdge;
                } else if (distance < nearDistance) {
                    nearPoint = cc.v2(tempPoint);
                    nearDistance = distance;
                    nearEdgeId = checkEdge;
                }
            }
        }

        if (nearEdgeId > 0) {
            extendPoint.lightId = this.lightId;
            extendPoint.distance = nearDistance;
            extendPoint.isLight = true;
            extendPoint.posInWorld = cc.v2(nearPoint);
            extendPoint.edgeId.push(nearEdgeId);
        }

        return nearEdgeId != 0;
    },

    pushExtendPoint: function (lastPoint, originPoint) {

        // 最后一个发光点和这个角是不是在不同边
        for (let index = 0; index < lastPoint.edgeId.length; index++) {
            const lastEdge = lastPoint.edgeId[index];
            if (originPoint.edgeId.indexOf(lastEdge) != -1){
                return;
            }
        }

        // 如果最后发光点和这个角在不同边，从最后发光点和角分别向外扩张1发光点。
        // 只可能有三种情况： Aex----B， Aex----Bex， A----Bex

        // 从光源射向最后发光点的向量
        var extend1 = false;
        var extendPoint1 = new LightCorner();
        var dirVec1 = lastPoint.posInWorld.sub(this.posInWorld);

        var extend2 = false;
        var extendPoint2 = new LightCorner();
        var dirVec2 = originPoint.posInWorld.sub(this.posInWorld);

        if (this.findExtendPoint(lastPoint, dirVec1, originPoint.edgeId, extendPoint1)) {
            // 最后发光点直接投到角的所在边
            this.lightPoints.push(extendPoint1);
        } else if (this.findExtendPoint(originPoint, dirVec2, lastPoint.edgeId, extendPoint2)) {
            // 角直接投到最后发光点的所在边
            this.lightPoints.push(extendPoint2);
        } else {
            // 投射到其他边
            extend1 = this.findExtendPoint(lastPoint, dirVec1, this.edges, extendPoint1);
            extend2 = this.findExtendPoint(originPoint, dirVec2, this.edges, extendPoint2);
            if (extend1 != extend2) {
                cc.warn("投射到其他边出问题");
            }
            this.lightPoints.push(extendPoint1);
            this.lightPoints.push(extendPoint2);
        }

    }
});