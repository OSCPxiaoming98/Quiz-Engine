import mongoose from "mongoose";
const { Schema } = mongoose;

/** question model */
const questionModel = new Schema({
    answers : { type : Array, default: []},
    quiz : { type : Array, default: []},
    //createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Question', questionModel);