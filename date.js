exports.getDate = function () {
    const today = new Date();
    const currentDay = today.getDay();
    const option = { //to format the date --long means september
        weekday: "long",
        month: "long",
        day: "numeric"
    }
    return today.toLocaleDateString("en-US", option);

}

exports.getDay = function () {
    const today = new Date();
    const currentDay = today.getDay();
    const option = { 
        weekday: "long",
    }
    return today.toLocaleDateString("en-US", option);

}