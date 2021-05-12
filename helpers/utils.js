const crypto = require('crypto');
const utilsHelper={}

utilsHelper.generateRandomHexString = (len)=>{
    return crypto
    .randomBytes(Math.ceil(len/2))
    .toString("hex")
    .slice(0,len)
    .toUpperCase();
}

module.exports=utilsHelper