const {Schema, model} = require('mongoose');


const fixtureSchema = new Schema({
    name : {
        type : String,
        required: true
    },
    fixtureId : Number,
    league : {
        id : Number,
        name : String,
        image : String
    },
    startingAt : String,
    matchType : {
        type : String,
        enum : ['hot', 'normal'],
        default : 'normal'
    },
    participants : [
        { 
                id : Number,
                name : String,
                image : String,
                score : {
                    type : Number,
                    default : 0
                }
            
        }
    ]
}, {timestamps : true});

const Fixture = new model('Fixture', fixtureSchema);

module.exports = Fixture;