import Questions from "../models/questionSchema.js";
import Results from "../models/resultSchema.js";
import { answers, quiz } from '../database/data.js'

export async function getQuestions(req, res){
    try {
        const q = await Questions.find();
        res.json(q)
    } catch (error) {
        res.json[{ error }]
    }

}




export async function insertQuestions(req, res) {
    try {
        // Assuming Questions is your MongoDB model
        const data = await Questions.insertMany({ answers, quiz });
        res.json({ msg: "Data Saved Successfully!", data });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}



export async function dropQuestions(req, res){
    try {
         await Questions.deleteMany();
         res.json({ msg: "Questions Deleted Successfully...!"});
    } catch (error) {
         res.json({ error })
    }
 }

 export async function getResult(req, res){
    try {
        const r = await Results.find();
        res.json(r)
    } catch (error) {
        res.json({ error })
    }
}

export async function storeResult(req, res) {
    try {
        const { username, result, attempts, points, achived } = req.body;
        
        // Throw an error if either username or result is missing
        if (!username || !result) {
            throw new Error("Data Not Provided.");
        }

        // Use async/await to avoid callback hell and cleaner code
        const data = await Results.create({ username, result, attempts, points, achived });
        
        res.json({ msg: "Results Saved Successfully!", data });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}


export async function dropResult(req, res){
    try {
        await Results.deleteMany();
        res.json({ msg : "Result Deleted Successfully...!"})
    } catch (error) {
        res.json({ error })
    }
}