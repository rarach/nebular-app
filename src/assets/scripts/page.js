/**
 * Open given URL in new browser tab (meant to be used from context menu of the small line charts)
 * @param {Object} data - the weird data container that is passed from ZingChart menu item when clicked 
 */
window.openChartInNewTab = function(data) {
    const url = data.arguments[0];
    window.open(url, "_blank");
};
