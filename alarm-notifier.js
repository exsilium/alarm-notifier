/**
 * Created by exile on 11/01/14.
 */

var settings = require('./settings');
var fs = require('fs');
var util = require('util');
var spawn = require('child_process').spawn;

var Event = require('./event');

var Prowl = require('node-prowl');
var prowl = new Prowl(settings.PROWL_API_KEY);
    prowl.timeout = 60000;

if(settings.TWILIO_ENABLED) {
    var twilio = require('twilio')(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN);
}

console.log("Starting!");
console.log("Wait_on: " + settings.WAIT_ON);
console.log("Target directory: " + settings.TARGET_DIR);

function deleteFile(file) {
    // Deletes a file within the configured target directory
    if(settings.DELETE_ENABLED) {
        fs.unlink(settings.TARGET_DIR + '/' + file, function(err) {
            if(err) throw err;
            console.log('Permanently deleted: ' + file);
        });
    }
}

function main() {
    var wait_on = spawn(settings.WAIT_ON, ['-w', settings.TARGET_DIR]);

    wait_on.stdout.on('data', function(data) {
        console.log("I received: " + data);
    });

    wait_on.on('close', function(code) {
        console.log("wait_on exited with status: " + code);
        if(code == 2) {
            // The file was written to or, if file is a directory, a file was added to or removed from file.
            // readdir does not return . or .. files. But we shouldn't touch the .id file in the directory which
            // jaga-cored uses to keep index of the spooling files.
            fs.readdir(settings.TARGET_DIR, function(err, files) {
                console.log("Seeing files: " + files);
                for(var i = 0; i < files.length; i++) {
                   if(files[i].substring(0, 3) == 'MSG') {
                       console.log("Processing: " + files[i]);

                       var msgSize = 0;

                       while(msgSize == 0) {
                         msgSize = fs.statSync(settings.TARGET_DIR + '/' + files[i]).size;
                       }

                       // Do the main magic for the file
                       var msg = fs.readFileSync(settings.TARGET_DIR + '/' + files[i]);
                       console.log("Message received: " + msg.slice(0, msg.length - 1));

                       var event = new Event(String(msg));
                       event.CID.nicePrint();

                       // Writing the log entry
                       fs.appendFile(settings.LOGFILE, msg, function (err) {
                           if (err) throw err;
                           console.log('Log entry added');
                       });

                       deleteFile(files[i]);

                       if(settings.PROWL_ENABLED || settings.TWILIO_ENABLED) {
                           var messageToSend = '';
                           var eventDescription = event.CID.getEventDescription();

                           // Construct a message for sending out
                           if(event.CID.eventQualifier === '1') {
                               messageToSend += 'NEW/OPEN: ';
                           }
                           else if(event.CID.eventQualifier === '3') {
                               messageToSend += 'END/CLOSE: ';
                           }
                           else if(event.CID.eventQualifier === '6') {
                               messageToSend += 'RESEND: ';
                           }
                           else {
                               messageToSend += 'UNKNOWN: ';
                           }

                           messageToSend += event.receiverTStamp + ' ' + eventDescription.summaryTxt + ' (' + eventDescription.alarmType + ') - ' + eventDescription.descTxt;

                           console.log("====== Sending the following message ======");
                           console.log(messageToSend);
                           console.log("===========================================");

                           if(settings.PROWL_ENABLED) {
                               prowl.push(messageToSend, settings.ALARM_NAME, function( err, remaining ){
                                   if( err ) console.log('ERROR: ' + err.message);
                                   console.log( 'Message sent: ' + files[this.i]);
                                   console.log( 'Remaining PROWL API calls for the current hour: ' + remaining);
                               }.bind( {i: i}));
                           }
                           if(settings.TWILIO_ENABLED) {
                               twilio.sendMessage({
                                   to:settings.TWILIO_TO,
                                   from:settings.TWILIO_FROM,
                                   body:messageToSend
                               }, function(err, responseData) {
                                   if (!err) {
                                       console.log("========= Twilio sent a message ===========");
                                       console.log(responseData.from);
                                       console.log(responseData.body);
                                       console.log("===========================================");
                                   }
                               });
                           }
                       }
                   }
                   else if(files[i] != '.id') {
                       deleteFile(files[i]);
                   }
                }
                main();
            });
        }
        else if(code == 66) {
            console.log("Invalid wait_on configuration detected, exiting...");
            process.exit(1);
        }
    });

    process.on('exit', function() {
        wait_on.kill();
    });
}

main();