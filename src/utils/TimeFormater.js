

export const formatTimeToString = (dateObj) => {
    let date = ("0" + dateObj.getDate()).slice(-2);
    // current month
    let month = ("0" + (dateObj.getMonth() + 1)).slice(-2);

    // current year
    let year = dateObj.getFullYear();

    // current hours
    let hours = dateObj.getHours();

    // current minutes
    let minutes = dateObj.getMinutes();

    // current seconds
    let seconds = dateObj.getSeconds();

    const formattedSting = year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds;

    return formattedSting;
}

export const formatUTCMillisecondsToDateString = (timeObj) => {
    let dateObj = new Date(timeObj);
    
    let date = ("0" + dateObj.getDate()).slice(-2);
    // current month
    let month = ("0" + (dateObj.getMonth() + 1)).slice(-2);

    // current year
    let year = dateObj.getFullYear();

    // current hours
    let hours = dateObj.getHours();

    // current minutes
    let minutes = dateObj.getMinutes();

    // current seconds
    let seconds = dateObj.getSeconds();

    const formattedSting = year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds;

    return formattedSting;
}