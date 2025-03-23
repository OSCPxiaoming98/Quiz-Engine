import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useFetchQuestion } from "../hooks/FetchQuestion";
import { updateResult } from "../hooks/setResult";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { solarizedlight } from 'react-syntax-highlighter/dist/esm/styles/prism';

export default function Questions({ onChecked }) {
    const [checked, setChecked] = useState(undefined);
    const [feedbackList, setFeedbackList] = useState([]);
    const { trace } = useSelector(state => state.questions);
    const result = useSelector(state => state.result.result);
    const [{ isLoading, apiData, serverError }] = useFetchQuestion();
    const question = useSelector(state => state.questions.queue[state.questions.trace]);
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(updateResult({ trace, checked }));
    }, [checked]);

    useEffect(() => {
        setFeedbackList([]);
    }, [trace]);

    function onSelect(i) {
        const selectedOption = question.options[i];
        onChecked(i);
        setChecked(i);
        dispatch(updateResult({ trace, checked }));
    }

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
                            style={{ maxWidth: '100%', height: 'auto' }}
                        />
                    )}
                    {desc.LINK && (
                        <a href={desc.LINK} target="_blank" rel="noopener noreferrer" className="link-class">
                            {desc.LINK}
                        </a>
                    )}
                    {desc.language && (
                        <SyntaxHighlighter language={desc.language} style={solarizedlight}>
                            {Object.keys(desc)
                                .filter(key => key.startsWith('codeLine'))
                                .map((key) => desc[key])
                                .join('\n')}
                        </SyntaxHighlighter>
                    )}
                </div>
            ))}

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
            
            <h3 className="text-light">{question?.question}</h3>

            {/* Check if questionDescription has any entries and if there is an equation, display it */}

            {question?.questionDescription.length > 0 &&
                question.questionDescription.map((desc, index) => (
                    desc.equation ? (
                        <SyntaxHighlighter 
                            language={desc.language} 
                            style={solarizedlight} 
                            wrapLines={true} 
                            lineProps={{ style: { textAlign: "center" } }}
                        >
                            {desc.equation}
                        </SyntaxHighlighter>
                    ) : null
                ))
            }

           

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
                            {q.text}
                        </label>
                        <div className={`check ${result[trace] === i ? 'checked' : ''}`}></div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
