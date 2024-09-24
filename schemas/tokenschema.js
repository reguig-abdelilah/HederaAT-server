const mongooose = require('mongoose')

const TokenSchema = new mongooose.Schema({
    symbol: {
        type: String,
        required: true,
        unique:true
    },
    supplyKey: {
        type: String,
        required: true
    },
    tokenid: {
        type: String,
        required: true
    },
    raisedfunds: {
        type: Number,
        required: false,
        default: 0
    }
})
TokenSchema.statics.VerifyTokenExist = async function(tokenSymbol){
    const token = await this.findOne({symbol:tokenSymbol})
    return token
}
module.exports = mongooose.model('Token', TokenSchema);