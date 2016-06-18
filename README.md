# Synopsis #

Alarm-notifier enables processing MSG* files from [Jablotron](http://www.jablotron.com) Alarm Receiver Center (`jaga-cored`). Write those files to a single log file, translate the Contact ID event and sends out human-readable notification using [node-prowl](https://github.com/arnklint/node-prowl), [pushover-notifications](https://github.com/qbit/node-pushover) or [twilio](https://github.com/twilio/twilio-node).

Use this at your own risk.

# Installation #

## Prerequisites ##

 * Node 0.10.x and `npm`
 * access to `jaga-cored` writable spool files

## Setup

### Install dependencies

`npm install`

### Edit settings.js

 * `TARGET_DIR = "/var/spool/jaga-cored"` - the spool directory which contains the MSG* files as written by `jaga-cored`
 * `LOGFILE = "/var/log/jablotron.log"` - a file which gets the MSG file contents appended
 * `DELETE_ENABLED = false` - change this to true to enable deletion of the MSG files. Use false for testing out alarm-notifier
 * `ALARM_NAME = "Alarm"` - used in Prowl notification as the App name or title of the notification
 * `PROWL_ENABLED = false` - change this to true to enable alert sending via prowl
 * `PROWL_API_KEY = ""` - enter your Prowl API keys here, a comma separated list
 * `PUSHOVER_ENABLED = false` - change this to true to enable alert sending via pushover
 * `PUSHOVER_API_KEY = ""` - enter your Pushoever API key
 * `PUSHOVER_TO = ""` - key to whom to send the notification
 * `TWILIO_ENABLED = false` - change this to true to enable alert sending via twilio
 * `TWILIO_ACCOUNT_SID = ""` - your twilio application sid
 * `TWILIO_AUTH_TOKEN = ""` - application authentication key
 * `TWILIO_FROM = "+1x"` - phone number from where the notifications are sent
 * `TWILIO_TO = "+372x"` - phone number to whom the notifications are sent

### Run alarm-notifier

Make sure you have sufficient rights to `jaga-cored` spool files.

`node alarm-notifier.js`

# Example output

    Message received: 45    1       0       1       2014-01-11 12:15:03     2014-01-11 12:15:03             JAGA    000118160299999
    +---------+-------+--------+-------+-----------+------+
    | Account | mType | EventQ | Event | Partition | Zone |
    +---------+-------+--------+-------+-----------+------+
    |   0001  |   18  |    1   |  602  |       99  |  999 |
    +---------+-------+--------+-------+-----------+------+
    Event summary: Periodic test report
    Event type: Zone
    Event description: A periodic test report has been triggered
    ====== Sending the following message ======
    NEW/OPEN: 2014-01-11 12:15:03 Periodic test report (Zone) - A periodic test report has been triggered
    ===========================================
    Permanently deleted: MSG0000000045
    Log entry added
    Remaining PROWL API calls for the current hour: 999

# License

Copyright (c) 2014, Sten Feldman
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

 * Redistributions of source code must retain the above copyright notice,
   this list of conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright
   notice, this list of conditions and the following disclaimer in the
   documentation and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE AUTHOR AND CONTRIBUTORS ``AS IS'' AND ANY
EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE AUTHOR OR CONTRIBUTORS BE LIABLE FOR ANY
DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT
LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY
OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH
DAMAGE.