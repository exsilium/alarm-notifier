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

module.exports = {
    WAIT_ON: WAIT_ON,
    TARGET_DIR: TARGET_DIR,
    LOGFILE: LOGFILE,
    ALARM_NAME: ALARM_NAME,
    PROWL_API_KEY: PROWL_API_KEY,
    PROWL_ENABLED: PROWL_ENABLED,
    DELETE_ENABLED: DELETE_ENABLED
};