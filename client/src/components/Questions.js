import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useFetchQuestion } from "../hooks/FetchQuestion";
import { updateResult } from "../hooks/setResult";

export default function Questions({ onChecked }) {
    const [checked, setChecked] = useState(undefined);
    const [feedbackList, setFeedbackList] = useState([]); // State to hold multiple feedback messages
    const { trace } = useSelector(state => state.questions);
    const result = useSelector(state => state.result.result);
    const [{ isLoading, apiData, serverError }] = useFetchQuestion();
    const question = useSelector(state => state.questions.queue[state.questions.trace]);
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(updateResult({ trace, checked }));
    }, [checked]);

    useEffect(() => {
        // Reset feedback list when the question changes
        setFeedbackList([]);
    }, [trace]); // Runs when trace changes

    function onSelect(i) {
        const selectedOption = question.options[i]; // Get the selected option
        onChecked(i);
        setChecked(i);
        
        // Append feedback for the current selection to the feedback list only if feedback exists
        if (selectedOption.feedback) {
            setFeedbackList(prevFeedback => [
                ...prevFeedback,
                { text: selectedOption.text, feedback: selectedOption.feedback }
            ]);
        }

        dispatch(updateResult({ trace, checked }));
    }

    // Construct the image path, fallback to an empty string if content is not available
    const imageSrc = question?.content ? `/image/${question?.content}` : '';

    if (isLoading) return <h3 className="text-light">Loading...</h3>;
    if (serverError) return <h3 className="text-light">{serverError || "Unknown Error"}</h3>;

    return (
        <div className="questions">
            <h1 className="title text-light">{apiData.quizTitle}</h1>
            <h2 className="subtitle text-light">[{question?.problemGroup}]</h2>

            {question?.description.map((desc, index) => (
                <div key={index} className="text-light">
                    <p>{desc.line}</p>
                    {desc.IMG && (
                        <img
                            src={desc.IMG.startsWith('http') ? desc.IMG : `${process.env.PUBLIC_URL}/image/${desc.IMG}`}
                            alt={`Description Image ${index}`}
                            style={{ maxWidth: '100%', height: 'auto' }} // Adjust styles as needed
                        />
                    )}
                    {desc.LINK && (
                        <a href={desc.LINK} target="_blank" rel="noopener noreferrer" className="link-class">
                            {desc.LINK} {/* Use the actual link as the displayed text */}
                        </a>
                    )}
                </div>
            ))}

            <h3 className="text-light">{question?.question}</h3>
            
            {question?.content ? (
                <div className="question-content">
                    <img 
                        src={imageSrc} 
                        alt="Question content" 
                        style={{ maxWidth: '100%', height: 'auto' }} 
                    />
                </div>
            ) : (
                <div className="question-content"></div>
            )}

            <ul key={question?.id}>
                {question?.options.map((q, i) => (
                    <li key={i}>
                        <input 
                            type="radio"
                            value={true}
                            name="options"
                            id={`q${i}-option`}
                            onChange={() => onSelect(i)}
                        />
                        <label className="text-primary" htmlFor={`q${i}-option`}>
                            {q.text} {/* Display the option text */}
                        </label>
                        <div className={`check ${result[trace] === i ? 'checked' : ''}`}></div>
                    </li>
                ))}
            </ul>

            {/* Conditionally render feedback for selected options with feedback */}
            {feedbackList.length > 0 && (
                <div className="feedback text-light">
                    {feedbackList.map((feedbackItem, index) => (
                        feedbackItem.feedback && (
                            <p key={index}>
                                <strong>{feedbackItem.text}:</strong> {feedbackItem.feedback}
                            </p>
                        )
                    ))}
                </div>
            )}
        </div>
    );
}
