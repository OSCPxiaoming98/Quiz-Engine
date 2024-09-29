import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useFetchQuestion } from "../hooks/FetchQuestion";
import { updateResult } from "../hooks/setResult";




export default function Questions({ onChecked }) {
    const [checked, setChecked] = useState(undefined);
    const { trace } = useSelector(state => state.questions);
    const result = useSelector(state => state.result.result);
    const [{isLoading, apiData, serverError}]=useFetchQuestion()
    const question = useSelector(state => state.questions.queue[state.questions.trace])
    const dispatch = useDispatch() 

    console.log(apiData)


    //if (apiData.questions && apiData.questions.length > 0) { 
    //    console.log(apiData.questions)
    //    quizContent = apiData?.test ? apiData.test[0] : '';
    //} else {
    //    console.log("No questions available.");
    //}


    
    useEffect(() => {

        dispatch(updateResult({ trace, checked }))
    }, [checked])

    function onSelect(i) {
        onChecked(i)
        setChecked(i)
        dispatch(updateResult({ trace, checked }))
    }

    // Construct the image path, fallback to an empty string if content is not available
    const imageSrc = question?.content ? `/image/${question?.content}` : '';
    if(isLoading) return <h3 className="text-light">isLoading</h3>
    if(isLoading) return <h3 className="text-light">{serverError || "Unkown Error"}</h3>
   
    //let quizContent = '';  // Declare the variable outside
    //if (apiData.questions && apiData.questions.length > 0) { 
    //    quizContent = apiData?.test ? apiData.test[0] : '';
    //    console.log(quizContent);
    //} else {
    //    console.log("No questions available.");
    //}
    
    


    return (
        <div className="questions">
            <h1 className="title text-light">{apiData.quizTitle}</h1>
            <h2 className="text-light">{question?.question}</h2>
            
            {question?.content ? (
                <div className="question-content">
                    <img 
                        src={imageSrc} 
                        alt="Question content" 
                        style={{ maxWidth: '100%', height: 'auto' }} 
                    />
                </div>
            ) : (
                <div className="question-content">
                </div>
            )}
            <ul key={question?.id}>
                {
                    question?.options.map((q, i) => (
                        <li key={i}>
                            <input 
                                type="radio"
                                value={true}
                                name="options"
                                id={`q${i}-option`}
                                onChange={() => onSelect(i)}
                            />
                            <label className="text-primary" htmlFor={`q${i}-option`}>{q}</label>
                            <div className={`check ${result[trace] == i ? 'checked' : ''}`}></div>
                        </li>
                    ))
                }
            </ul>
        </div>
    );
}


