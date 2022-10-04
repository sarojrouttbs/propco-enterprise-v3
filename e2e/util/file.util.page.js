var path = require('path');
var https = require("https");
var fs = require("fs");

var FileUtil = function() {
    
    this.downloadFileFrom = function(fileSource, fileDestination){
        return new Promise (function(resolve,reject) {
            fs.stat(fileDestination, (err, stats) => {
                if(err){
                    if (String(err).includes("no such file or directory")){
                        console.log("File does not exist at destination");
                        downloadFile(); 
                    } else {
                        console.log("Error in file access: " + String(err));
                        reject("Error in file access");                       
                    }
                }
                if(stats){
                    if (stats.isFile()){
                        console.log("File exists at destination");
                        resolve(path.resolve(process.cwd(), fileDestination));
                    } else {
                        console.log("File does not exist at destination");
                        downloadFile();
                    }
                }
                function downloadFile(){
                    https.get(fileSource, (res) => {
                        let writeStream = fs.createWriteStream(fileDestination);                  
                        res.pipe(writeStream);                  
                        writeStream.on("finish", () => {
                            writeStream.close();
                            console.log("File Download Completed");
                            resolve(path.resolve(process.cwd(), fileDestination));
                        });                  
                        writeStream.on("error", function (err) {
                            console.log(err);
                            reject("Error in file download"); 
                        });
                    });
                }
            })
        });
    }    
}
module.exports = FileUtil;