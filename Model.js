const mongoose=require("mongoose")
const ipSchema=mongoose.Schema({
    ipAdresss:{type:String,require:true},
    mac:{type:String,require:true}
})

const IpModel=mongoose.model("ipAddress",ipSchema)
 module.exports={
    IpModel
 }