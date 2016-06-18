/**
 * Created by exile on 11/01/14.
 */

var settings = require('./settings');
var fs = require('fs');
var squirrel = require('squirrel');
var chokidar = require('chokidar');
var path = require('path');

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
console.log("Target directory: " + settings.TARGET_DIR);

function deleteFile(filePath) {
    // Deletes a file within the configured target directory
    if(settings.DELETE_ENABLED) {
        fs.unlink(filePath, function(err) {
            if(err) throw err;
            console.log('Permanently deleted: ' + filePath);
        });
    }
}

function main() {
  var watcher = chokidar.watch(settings.TARGET_DIR, {
    ignored: function(targetPath) {
      return /(^[.#]|(?:__|~)$)/.test(path.basename(targetPath));
    }, persistent: true});

  watcher.on('add', function(filePath) {
    console.log("File add event was received: " + filePath);

    var msgSize = 0;

    // We'll wait a bit for the file to have content
    while(msgSize == 0) {
      msgSize = fs.statSync(filePath).size;
    }

    // Do the main magic for the file
    var msg = fs.readFileSync(filePath);
    console.log("Message received: " + msg.slice(0, msg.length));

    var event = new Event(String(msg));
    event.CID.nicePrint();

    // Writing the log entry
    fs.appendFile(settings.LOGFILE, msg, function (err) {
      if (err) throw err;
      console.log('Log entry added');
    });

    deleteFile(filePath);

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
          console.log( 'Message sent: ' + filePath);
          console.log( 'Remaining PROWL API calls for the current hour: ' + remaining);
          console.log("===========================================");
        });
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
        });
      }
    }
  });
}

main();
