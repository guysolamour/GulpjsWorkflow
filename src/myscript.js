/*
 * Your jquery scripts
 */

$(document).ready(function () {
    var idtest = $('#myID');
    TweenMax.to(idtest, 2, {
        backgroundColor: "#FF0000",
        width: "50%",
        top: "100px",
        repeat: 1,
        repeatDelay: 1,
        yoyo: true,
        ease:Linear.easeNone,
        onReapeat: repeatFn,
        onComplete: function () {
            alert("Tweening complete!!");
        }
    });
});
