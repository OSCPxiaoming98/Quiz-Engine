import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

import * as Action from "../redux/question_reducer";
import { getServerData } from "../helper/helper";


export const useFetchQuestion = () => {
    const dispatch = useDispatch();
    const [getData, setGetData] = useState({ isLoading: false, apiData: [], serverError: null });

    useEffect(() => {
        setGetData(prev => ({ ...prev, isLoading: true }));

        (async () => {
            try {
                const [{ answers, quiz }] = await getServerData(`${process.env.REACT_APP_SERVER_HOSTNAME}/api/questions`, (data) => data);
                const quizgen = [];
                const linesStartingWithEquals = quiz[0].split('\n').filter(line => line.startsWith('== '));
                const quizTitle = linesStartingWithEquals[0].replace('== ', '').trim();

                const problemGroupBlocks = quiz[0]
                    .split(/\n(?=\[)/) // Split at every newline that precedes a line starting with '['
                    .slice(1)          // Remove the first element (the quiz title)
                    .map(block => block.trim()) // Trim whitespace from each block
                    .filter(Boolean); // Remove any empty blocks

                problemGroupBlocks.forEach(problemGroupblock => {
                    const problemGroup = problemGroupblock.match(/\[(.*?)\]/); // Use regex to find text between brackets

                    if (problemGroup) {
                        const title = problemGroup[1].length === 0 ? "NO PROBLEM GROUP" : problemGroup[1]; // Extract the title
                        const questionBlocks = problemGroupblock.split(/\n\s*\n/).slice(1); // Split the content after the title

                        // Extract the description by taking the part between the title and the first question
                        const descriptionMatch = problemGroupblock.split(/\n\s*\n/);
                        const descriptionLines = descriptionMatch.length > 0 ? descriptionMatch[0].split('\n').slice(1) : []; // Split into lines

                        // Create description objects
                        const description = [];
                        let codeBlock = [];
                        let currentLanguage = '';

                        descriptionLines.forEach(line => {
                            const descriptionObj = { line: line.trim() }; // Initialize with the trimmed line
                            const linkMatch = line.match(/\|\|LINK:\s*(.*?)\|\|/); // Match for LINK
                            const imgMatch = line.match(/\|\|IMG:\s*(.*?)\|\|/); // Match for IMG
                            const codeMatch = line.match(/\|\|CODE:(.*?):/); // Match for CODE

                            // If a LINK is found, add it to the object and remove it from the line
                            if (linkMatch) {
                                descriptionObj.LINK = linkMatch[1].trim(); // Store the extracted LINK value
                                descriptionObj.line = descriptionObj.line.substring(0, descriptionObj.line.indexOf(linkMatch[0])).trim();
                            }

                            // If an IMG is found, add it to the object and remove it from the line
                            if (imgMatch) {
                                descriptionObj.IMG = imgMatch[1].trim(); // Store the extracted IMG value
                                descriptionObj.line = descriptionObj.line.substring(0, descriptionObj.line.indexOf(imgMatch[0])).trim();
                            }

                            // If CODE is found, capture the language and prepare to collect code lines
                            if (codeMatch) {
                                currentLanguage = codeMatch[1].trim(); // Extract language
                                descriptionObj.line = descriptionObj.line.substring(0, descriptionObj.line.indexOf(codeMatch[0])).trim();
                                codeBlock.push({ line: descriptionObj.line }); // Initialize code block object
                                return; // Skip to the next iteration
                            }

                            // If the line is the end of the code block
                            if (line.trim() === '||') {
                                if (codeBlock.length > 0) {
                                    const codeObj = {
                                        line: codeBlock[0].line,
                                        language: currentLanguage
                                    }; // Start with the first code line
                                    for (let i = 1; i < codeBlock.length; i++) {
                                        codeObj[`codeLine${i}`] = codeBlock[i].line; // Add subsequent code lines
                                    }
                                    description.push(codeObj); // Add the code block object to the final description
                                    codeBlock = []; // Reset code block for future use
                                    currentLanguage = ''; // Reset language
                                }
                                return; // Skip to the next iteration
                            }

                            // If we are collecting code lines, store them in the codeBlock array
                            if (currentLanguage) {
                                codeBlock.push({ line: descriptionObj.line });
                            } else {
                                // Regular lines without special formatting
                                description.push(descriptionObj);
                            }
                        });

                        // Add the final statement about the problem group
     

                        questionBlocks.forEach(block => {
                            block = block.trim().replace(/^\[\]/, '').trim(); // Remove leading "[]"
                            const lines = block.trim().split('\n'); // Split block into lines
                            let questionLines = [];
                            let questionDescription = [];
                            let options = [];
                            let isQuestionComplete = false;
                            console.log(lines)

                            let isEquation = false;
                            let equationLines = [];
                            
                            for (let line of lines) {
                                if (line.startsWith('\\')) {
                                    // Toggle equation mode
                                    if (!isEquation) {
                                        isEquation = true;
                                    } else {
                                        isEquation = false;
                                        questionDescription.push({ equation: equationLines.join(' ') }); // Store the accumulated equation
                                        equationLines = []; // Reset for next potential equation
                                    }
                                } else if (isEquation) {
                                    // Continue accumulating lines for the equation
                                    equationLines.push(line.trim());
                                } else if (!isQuestionComplete) {
                                    if (line.startsWith('*')) {
                                        // First option found, mark the question as complete
                                        isQuestionComplete = true;
                                        options.push(line.replace(/^\*+/g, '').trim());
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
                            

                            // Process options to remove '=' and '::', and extract feedback
                            const processedOptions = options.map(option => {
                                const feedbackMatch = option.match(/::\s*(.*)$/); // Match feedback after "::"
                                const cleanedText = option.replace(/^[=]/, '').replace(/::.*$/, '').trim(); // Remove '=' and anything after '::'

                                return {
                                    text: cleanedText,
                                    feedback: feedbackMatch ? feedbackMatch[1].trim() : null, // Extract feedback if it exists
                                };
                            });

                            // Create the question object and push it to the quizgen array
                            if (questionLines.length > 0) {
                                quizgen.push({
                                    id: quizgen.length + 1,
                                    problemGroup: title,
                                    description: description,  // Store the array of description objects here
                                    question: questionLines.join(' '), // Join all question lines into one string
                                    questionDescription : questionDescription,
                                    options: processedOptions // Use the processed options
                                });
                            }
                        });
                    }
                });

                console.log(quizgen)

                if (quizgen.length > 0) {
                    setGetData(prev => ({ ...prev, isLoading: false }));
                    setGetData(prev => ({ ...prev, apiData: { quizTitle } }));

                    dispatch(Action.startExamAction({ question: quizgen, answers }));
                } else {
                    throw new Error("No Question Available");
                }
            } catch (error) {
                setGetData(prev => ({ ...prev, isLoading: false }));
                setGetData(prev => ({ ...prev, serverError: error }));
            }
        })();
    }, [dispatch]);

    return [getData, setGetData];
};

export const MoveNextQuestion = () => async (dispatch) => {
    try {
        dispatch(Action.moveNextAction());
    } catch (error) {
        console.log(error);
    }
};

export const MovePrevQuestion = () => async (dispatch) => {
    try {
        dispatch(Action.movePrevAction());
    } catch (error) {
        console.log(error);
    }
};
