import { createSlice } from "@reduxjs/toolkit"
import { act } from "react"

export const questionReducer = createSlice({
    name: "quizgen",
    initialState : {
        queue: [],
        answers: [],
        trace : 0
        
    },
    reducers : {
        startExamAction : (state, action) => {
            let {question, answers} = action.payload
            return{
                ...state,
                queue : question,
                answers
            }
        
        },
        moveNextAction : (state, action) => {
            return{
                ...state,
                trace : state.trace + 1
            }

        },
        movePrevAction : (state, action) => {
            return{
                ...state,
                trace : state.trace - 1
            }

        },
        resetAllAction : () => {
            return {
                queue: [],
                answers: [],
                trace: 0

            }
        }
    }

})

export const {startExamAction, moveNextAction, movePrevAction, resetAllAction} = questionReducer.actions;

export default questionReducer.reducer;