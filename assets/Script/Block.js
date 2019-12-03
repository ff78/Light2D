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

    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {
        this.blockTag = 0;

        this.lineGraphics = this.getComponent(cc.Graphics);
        this.drawWhiteWall();
        
        this.initCorners();

        // for (let i = 0; i < 4; i++) {
        //     var corName = "corner" + (this.blockTag * 100 + i + 1);
        //     var corner = this.node.getChildByName(corName);
        //     corner.getComponent("Corner").
        //         setup(this.blockTag, i, this.node.convertToWorldSpaceAR(corner.position));
        // }
    },
    
    onEnable: function() {

    },

    onDisable: function() {

    },

    // update (dt) {},

    drawWhiteWall: function() {
        var size = this.node.getContentSize();

        this.lineGraphics.clear();
        // 画原本灰色边缘
        this.lineGraphics.strokeColor = new cc.Color(0xbb, 0xbb, 0xbb);
        this.lineGraphics.rect(-size.width/2, -size.height/2, size.width, size.height);
        this.lineGraphics.stroke();

    },

    initCorners: function() {

        var self = this;
        var cornOff = [[-1,-1], [1, -1], [1, 1], [-1, 1]];
        // this.corners = [Corner];
        var size = this.node.getContentSize();

        cc.loader.loadRes("Prefab/corner", cc.Prefab, function (err, prefab) {
            if (err) {
                cc.error(err.message || err);
                return;
            }

            cc.log('Result should be a prefab: ' + (prefab instanceof cc.Prefab));
            // 装4个Corner,给光源检查用
            for (let i = 0; i < 4; i++) {

                var corner = cc.instantiate(prefab);                
                corner.position = new cc.Vec2(cornOff[i][0] * size.width/2,
                                                        cornOff[i][1] * size.height/2);
                                                        corner.name = "corner" + (self.blockTag * 100 + i + 1); // 组合一个唯一Id
        
                self.node.addChild(corner);
                
                var corScript = corner.getComponent("Corner");
                corScript.setup(self.blockTag, i, self.node.convertToWorldSpaceAR(corner.position));
                // self.corners[i].getComponent("Corner").setup(self.blockTag, i, self.node.convertToWorldSpaceAR(self.corners[i].position));
            }

        });

    },

});