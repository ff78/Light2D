window.globalEvent = new cc.EventTarget();

module.exports = {
    
    LIGHT_WALL: "LIGHT_WALL",
    UPDATE_CORNER: "UPDATE_CORNER",
    SIGN_CORNER: "SIGN_CORNER",
    CHECK_CORNER: "CHECK_CORNER",
    LIGHT_CORNER: "LIGHT_CORNER",
    DARK_CORNER: "DARK_CORNER",

    Segment: {
        blockTag: 0,
        segIndex: 0,
        start: cc.Vec2,
        end: cc.Vec2,
    },

    Block_Corner: {
        blockTag: 0,
        cornerIndex: 0,
        checkNo: 0,
        pos: cc.Vec2,
        distance: 0,
        angle: 0,
        isLight: false,
    },

}
