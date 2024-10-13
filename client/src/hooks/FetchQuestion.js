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


                const [{answers, quiz}]= await getServerData(`${process.env.REACT_APP_SERVER_HOSTNAME}/api/questions`, (data) => data)
                const quizgen = [];
                const linesStartingWithEquals = quiz[0].split('\n').filter(line => line.startsWith('== '));
                const quizTitle = linesStartingWithEquals[0].replace('== ', '').trim();
                
                
                const problemGroupBlocks = quiz[0]
                        .split(/\n(?=\[)/) // Split at every newline that precedes a line starting with '['
                        .slice(1)          // Remove the first element (the quiz title)
                        .map(block => block.trim()) // Trim whitespace from each block
                        .filter(Boolean); // Remove any empty blocks

                console.log(problemGroupBlocks)
                problemGroupBlocks.forEach(problemGroupblock => {
                    const problemGroup = problemGroupblock.match(/\[(.*?)\]/); // Use regex to find text between brackets
                    

                    if (problemGroup) {
                        const title = problemGroup[1].length === 0 ? "NO PROBLEM GROUP" : problemGroup[1]; // Set title based on length
                        const questionBlocks = problemGroupblock.split(/\n\s*\n/).slice(1);
                        
                        
                        
                        for(let block of questionBlocks) {
                            block = block.trim().replace(/^\[\]/, '').trim(); // Remove leading "[]"
                            const lines = block.trim().split('\n'); // Split block into lines
                            let questionLines = [];
                            let options = [];
                            let isQuestionComplete = false;
        
                            for (let line of lines) {
                                //console.log(line)
                                if (!isQuestionComplete) {
                                    if (line.startsWith('*')) {
                                        // First option found, mark the question as complete
                                        isQuestionComplete = true;
                                        options.push(line.replace(/^\*+/g, '').trim()); // Add the first option
                                    } else {
                                        // Collect question lines
                                        questionLines.push(line.trim());
                                    }
                                } else {
                                    // Collect remaining options
                                    if (line.startsWith('*')) {
                                        options.push(line.replace(/^\*+/g, '').trim());
                                    }
                                }
                            }
        
                            // Create the question object and push it to the quizgen array
                            if (questionLines.length > 0) {
                                quizgen.push({
                                    id: quizgen.length + 1,
                                    problemGroup: title,
                                    question: questionLines.join(' '), // Join all question lines into one string
                                    options: options
                                });
                            }
                        }
                    }
                    

    
                    // Example output
                    console.log(quizgen);

                });
                
                        
                
              
                


                
                
        

           
                if(quizgen.length > 0){
                    setGetData(prev => ({...prev, isLoading: false}));
                    setGetData(prev => ({...prev, apiData: {quizTitle}}))
                  

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