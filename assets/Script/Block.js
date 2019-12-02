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

var Corner = require("Corner.js");

cc.Class({
    extends: cc.Component,

    properties: {
        blockTag: {
            visible: false,
            set(value){
                this._blockTag = value;
            },
            get(){
                return this._blockTag;
            },
        },


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
        this.lightSeg = [Global.Segment];
        this.blockTag = 0;

        this.initCorners();

        this.lineGraphics = this.getComponent(cc.Graphics);
        this.drawWall();


        // // 注册点亮墙壁事件
        // this.node.on(Global.LIGHT_WALL, this.lightWall, this);
        // this.node.on(Global.SIGN_CORNER, this.signCorner, this);
        // this.node.on(Global.CHECK_CORNER, this.checkCorner, this);
        // this.node.on(Global.LIGHT_CORNER, this.lightCorner, this);

    },
    
    onDisable: function() {
        // window.globalEvent.off('SCAN_CORNER', this.scanCorner, this);

    },

    // update (dt) {},

    lightWall: function(event) {
        var seg = event.getUserData();

        this.lightSeg = [Global.Segment];

        // 更新点亮的墙壁，重画
        for (let index = 0; index < seg.length; index++) {
            const element = seg[index];
            if (element.blockTag === self.blockTag) {
                var startVec2 = this.node.convertToNodeSpace(element.start);
                var endVec2 = this.node.convertToNodeSpace(element.end);

                var lightSegment = new Global.Segment();
                lightSegment.blockTag = seg.blockTag;
                lightSegment.segIndex = seg.segIndex;
                lightSegment.start = startVec2;
                lightSegment.end = endVec2;
        
                this.lightSeg.push(lightSegment);
            }
        }

        this.drawWall();

        // cc.Intersection.lineRect(this.corners[0], this.corners[2], this.node.getVisibleRect());
    },

    drawWall: function() {
        var size = this.node.getContentSize();

        this.lineGraphics.clear();
        // 画原本灰色边缘
        this.lineGraphics.strokeColor = new cc.Color(0xbb, 0xbb, 0xbb);
        this.lineGraphics.rect(-size.width/2, -size.height/2, size.width, size.height);
        this.lineGraphics.stroke();
        
        // 画所有亮光边缘
        this.lightSeg.forEach(seg => {
            this.lineGraphics.strokeColor = new cc.Color(0xC5, 0xE7, 0x10);
            this.lineGraphics.lienWidth = 3;

            this.lineGraphics.moveTo(seg.start.x, seg.start.y);
            this.lineGraphics.lineTo(seg.end.x, seg.end.y);
            
            this.lineGraphics.stroke();
        });
    },

    initCorners: function() {

        var self = this;
        var cornOff = [[-1,-1], [1, -1], [1, 1], [-1, 1]];
        this.corners = [Corner];
        var size = this.node.getContentSize();

        cc.loader.loadRes("Prefab/corner", cc.Prefab, function (err, prefab) {
            if (err) {
                cc.error(err.message || err);
                return;
            }

            cc.log('Result should be a prefab: ' + (prefab instanceof cc.Prefab));
            // 装4个Corner,给光源检查用
            for (let i = 0; i < 4; i++) {

                self.corners[i] = cc.instantiate(prefab);                
                self.corners[i].position = new cc.Vec2(cornOff[i][0] * size.width/2,
                                                        cornOff[i][1] * size.height/2);
                self.corners[i].name = "corner" + (self.blockTag * 100 + i + 1); // 组合一个唯一Id
        
                self.node.addChild(self.corners[i]);
                
                self.corners[i].getComponent("Corner").setUp(self.blockTag, i, self.node.convertToWorldSpace(self.corners[i].position));
            }

        });

    },

    // initEdge: function() {
    //     this.edges = [Edge];

    // },

    signCorner: function(event) {
        var data = event.getUserData();
        if (data.blockTag != this.blockTag) {
            return;
        }

        this.node.getChildByName("corner"+data.cornerIndex).signCorner(data.checkNo);
    },

    checkCorner: function(event) {
        var data = event.getUserData();
        if (data.blockTag != this.blockTag) {
            return;
        }
        this.node.getChildByName("corner"+data.cornerIndex).checkCorner();
    },

    lightCorner: function(event) {
        var data = event.getUserData();
        if (data.blockTag != this.blockTag) {
            return;
        }

        this.node.getChildByName("corner"+data.cornerIndex).signCorner(data.isLight);
    },

    // clickStart() {
    //     cc.log("-------------------");
    //     this.node.emit('SCAN_CORNER');
    // },
});
