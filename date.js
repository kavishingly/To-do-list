module.exports = getDate;
function getDate(){
        const today = new Date();
        const currentDay = today.getDay();
        const option = { //to format the date --long means september
            weekday: "long",
            month: "long",
            day: "numeric"
        }
        const day = today.toLocaleDateString("en-US", option);
        return day;
}