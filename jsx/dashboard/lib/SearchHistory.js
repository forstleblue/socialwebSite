var searchHistory = {
    save: function(key, val) {
        window.history.pushState({
            [key]: val
        }, [key]);
    },
    getHistory: function(key) {
        if(window.history.state == null)
            return "";

        var value = window.history.state[key];

        if (value != undefined && value != " " && value.length > 0) {
            return window.history.state[key];
        } else {
            return "";
        }
    }
}

module.exports = searchHistory;
