function log(msg) {
    const consoleLog = true; // set to false to not recieve logs
    if (!consoleLog) return;
    
    const currentDateTime = new Date();
    const options = {
        year: 'numeric', 
        month: 'numeric', 
        day: 'numeric',
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit',
        hour12: false
    };

    const formattedDateTime = '[' + currentDateTime.toLocaleString('en-US', options) + '] ';
    console.log(formattedDateTime + msg);
      
}

module.exports = log ;