/**
 * Created by exile on 11/01/14.
 */
var CID = require('./cid');

// Constructor
function Event(rawMsg) {
    /*=======================================================================================================
      The object is instantiated from the raw message block as received by jaga-cored
      Two message examples follow:
      43	1	1	1	2014-01-09 15:56:00	2014-01-09 14:14:22		192.168.0.42	000118340101500
      44	1	0	1	2014-01-10 13:14:58	2014-01-10 13:14:58		JAGA	000118160299999
      Format:
      <id> <?> <?> <?> <time of the sender> <time of the receiver> \t <sender> <Ademco ContactID message>
      The data fields are tabulated and contain a carriage return character at the end of the block
    =======================================================================================================*/
    var msg = rawMsg.replace(/\r?\n|\r/g, "");
    var msgArr = msg.split('\t');
    this.msgId = msgArr[0];
    this.unknown1 = msgArr[1];
    this.unknown2 = msgArr[2];
    this.unknown3 = msgArr[3];
    this.senderTStamp = msgArr[4];
    this.receiverTStamp = msgArr[5];
    this.sender = msgArr[7];
    this.rawCID = msgArr[8];
    this.CID = new CID(this.rawCID);
}
// class methods
/*Event.prototype.unknownYet = function() {

};*/
// export the class
module.exports = Event;