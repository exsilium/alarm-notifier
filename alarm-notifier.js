/**
 * Created by exile on 11/01/14.
 */

var settings = require('./settings');
var fs = require('fs');
var squirrel = require('squirrel');
var spawn = require('child_process').spawn;

var prowl;
var twilio;
var pushover;


var Event = require('./event');

if(settings.PROWL_ENABLED) {
    squirrel('node-prowl', { allowInstall: true }, function(err) {
        if(err) throw err;

        var Prowl = require('node-prowl');
        prowl = new Prowl(settings.PROWL_API_KEY);
        prowl.timeout = 60000;
    });
}

if(settings.TWILIO_ENABLED) {
    squirrel('twilio', { allowInstall: true }, function(err) {
        if(err) throw err;

        twilio = require('twilio')(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN);
    });
}

if(settings.PUSHOVER_ENABLED) {
    squirrel('pushover-notifications', { allowInstall: true}, function(err) {
        if(err) throw err;

        var Pushover = require('pushover-notifications');
        pushover = new Pushover( {
            user: settings.PUSHOVER_TO,
            token: settings.PUSHOVER_API_KEY
        });
    })
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
                       console.log("Message received: " + msg.slice(0, msg.length));

                       var event = new Event(String(msg));
                       event.CID.nicePrint();

                       // Writing the log entry
                       fs.appendFile(settings.LOGFILE, msg, function (err) {
                           if (err) throw err;
                           console.log('Log entry added');
                       });

                       deleteFile(files[i]);

                       if(settings.PROWL_ENABLED || settings.TWILIO_ENABLED || settings.PUSHOVER_ENABLED) {
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

                           messageToSend += event.receiverTStamp + ' ' + eventDescription.summaryTxt + ' (' + eventDescription.alarmType + ') - ' + eventDescription.descTxt + ' (Partition: ' + event.CID.partition + '; Zone: ' + event.CID.zone + ')';

                           console.log("====== Sending the following message ======");
                           console.log(messageToSend);
                           console.log("===========================================");

                           if(settings.PROWL_ENABLED) {
                               prowl.push(messageToSend, settings.ALARM_NAME, function( err, remaining ){
                                   if( err ) console.log('ERROR: ' + err.message);
                                   console.log("========= Prowl sent a message ===========");
                                   console.log( 'Message sent: ' + files[this.i]);
                                   console.log( 'Remaining PROWL API calls for the current hour: ' + remaining);
                                   console.log("===========================================");
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
                                       console.log( responseData );
                                       console.log("===========================================");
                                   }
                               });
                           }
                           if(settings.PUSHOVER_ENABLED) {
                               var pushover_msg = {
                                   title: settings.ALARM_NAME,
                                   message: messageToSend
                               };

                               pushover.send(pushover_msg, function(err, result) {
                                   if(err) console.log('ERROR: ' + err.message)
                                   else {
                                       console.log("========= Pushover sent a message ===========");
                                       console.log( result );
                                       console.log("===========================================");
                                   }
                               })
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