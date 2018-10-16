/**
 * Open given URL in new browser tab (meant to be used from context menu of the small line charts)
 * @param {Object} data - the weird data container that is passed from ZingChart menu item when clicked 
 */
window.openChartInNewTab = function(data) {
    const url = data.arguments[0];
    window.open(url, "_blank");
};






/** TODO: delete this and related markup */
const dumpCookie = function(){
    const cookies = document.cookie.split(";");
    var text = "";
    for (var i=0; i<cookies.length; i++) {
        text += cookies[i] + "<br/>";
    }
    $("#debug").html(text);
};

function eraseCookies() {
    const cookies = document.cookie.split(";");
    var text = "";
    for (var i=0; i<cookies.length; i++) {
        const name = cookies[i].substr(0, cookies[i].indexOf("="));
        text += "Erasing " + name + "<br/>";
        document.cookie = name+'=; Max-Age=-99999999;';
    }
    $("#debug").html(text);
}