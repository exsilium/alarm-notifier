/**
 * Created by exile on 11/01/14.
 */
const WAIT_ON = "/usr/local/bin/wait_on";
const TARGET_DIR = "/var/spool/jaga-cored";
const LOGFILE = "/var/log/jablotron.log";
const ALARM_NAME = "Alarm";
const PROWL_API_KEY = "";
const PROWL_ENABLED = false;
const DELETE_ENABLED = false;
const TWILIO_ENABLED = false;
const TWILIO_ACCOUNT_SID = "";
const TWILIO_AUTH_TOKEN = "";
const TWILIO_FROM = "";
const TWILIO_TO = "";

module.exports = {
    WAIT_ON: WAIT_ON,
    TARGET_DIR: TARGET_DIR,
    LOGFILE: LOGFILE,
    ALARM_NAME: ALARM_NAME,
    PROWL_API_KEY: PROWL_API_KEY,
    PROWL_ENABLED: PROWL_ENABLED,
    DELETE_ENABLED: DELETE_ENABLED,
    TWILIO_ENABLED: TWILIO_ENABLED,
    TWILIO_ACCOUNT_SID: TWILIO_ACCOUNT_SID,
    TWILIO_AUTH_TOKEN: TWILIO_AUTH_TOKEN,
    TWILIO_FROM: TWILIO_FROM,
    TWILIO_TO: TWILIO_TO
};
