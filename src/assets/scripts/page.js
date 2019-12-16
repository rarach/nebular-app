/**
 * Open given URL in new browser tab (meant to be used from context menu of the small line charts)
 * @param {Object} data - the weird data container that is passed from ZingChart menu item when clicked 
 */
window.openChartInNewTab = function(data) {
    const url = data.arguments[0];
    window.open(url, "_blank");
};

/***********************************************************************************************************
 *  Code related to drag-and-drop reposition feature at the My Exchanges page
 **********************************************************************************************************/
window.isDraggingExchange = false;
$(function() {
    $(document).bind('mousemove', function (e) {
        if (!window.isDraggingExchange) {
            return;
        }
        const offsetY = $("body")[0].getBoundingClientRect().top;  //How much we're scolled down
        $("#draggedSnapshot", this).css({
            left: e.pageX,
            top: e.pageY + offsetY + 1
        });
    });
});

window.startDragging = function(exchangeElementId) {
    window.isDraggingExchange = true;
    const elmToClone = $("#" + exchangeElementId);
    const width = $(elmToClone).find(".assetsSelection").width();
    const clone = elmToClone.clone();
    clone[0].id = "draggedExchangeClone";      //To avoid duplicates
    $(clone).removeClass("dropTarget");
    $(clone).width(width);
    $("#draggedSnapshot").empty().append(clone);
};
