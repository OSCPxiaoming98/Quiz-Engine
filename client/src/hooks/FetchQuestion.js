import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";


import * as Action from "../redux/question_reducer"
import { getServerData } from "../helper/helper";


export const useFetchQuestion = () => {
    const dispatch = useDispatch();
    const [getData, setGetData] = useState({ isLoading : false, apiData : [], serverError : null})
    
    useEffect(() => {
        setGetData(prev => ({...prev, isLoading: true}));

        (async () => {
            try{


                const [{elimniate, answers, test}]= await getServerData(`${process.env.REACT_APP_SERVER_HOSTNAME}/api/questions`, (data) => data)
                //console.log(test[0])

                


                const quizTitleMatch = test[0].match(/^== (.+)$/m);
                const quizTitle = quizTitleMatch ? quizTitleMatch[1] : 'Title not found';

                const quizgen = [];
                const questionBlocks = test[0].split(/\n\s*\n/).slice(1); // Split and skip the first part

                for (let block of questionBlocks) {
                    const lines = block.trim().split('\n'); // Split block into lines
                    const questionLine = lines[0]; // The first line is the question
                    const options = lines.slice(1) // The remaining lines are options
                        .filter(line => line.startsWith('*')) // Only keep lines starting with '*'
                        .map(option => option.replace(/^\*+/g, '').trim()); // Clean up the option lines

                    // Create the question object and push it to the quizgen array
                    if (questionLine) {
                        quizgen.push({
                            id: quizgen.length + 1,
                            question: questionLine,
                            options: options
                        });
                    }
                }

                const questions = quizgen.question

                console.log(questions)
                console.log(quizgen)
                
        

           
                if(quizgen.length > 0){
                    setGetData(prev => ({...prev, isLoading: false}));
                    setGetData(prev => ({...prev, apiData: {questions, test, quizTitle}}))
                  

                    dispatch(Action.startExamAction({question : quizgen, answers}))
                    
                } else{
                    throw new Error("No Question Avalibale")
                }
            } catch(error) {
                setGetData(prev => ({...prev, isLoading: false}));
                setGetData(prev => ({...prev, serverError: error}));
            }
        })();
    }, [dispatch])
    return [getData, setGetData];
}


export const MoveNextQuestion = () => async(dispatch) => {
    try{
        dispatch(Action.moveNextAction());
    }catch (error) {
        console.log(error)
    }
}

export const MovePrevQuestion = () => async(dispatch) => {
    try{
        dispatch(Action.movePrevAction());
    }catch (error) {
        console.log(error)
    }
}