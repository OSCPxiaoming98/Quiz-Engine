import React, { useRef } from "react";
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom'
import { setUserId } from "../redux/result_reducer";
import '../styles/Main.css'
export default function Main() {

    const inputRef = useRef(null)
    const dispatch = useDispatch()

    function startQuiz(){
        if(inputRef.current?.value){
            dispatch(setUserId(inputRef.current?.value))
        }
    }


    return (
        <div className="container">
            <h1 className="title text-light">Learning Application</h1>

            <ol>
                <li>Welcome to Learning Portal</li>
                <li>Correct Answer: 10 Points</li>
            </ol>

            <form id="form">
                <input ref={inputRef} className="userID" type="text" placeholder="Username*"/>
            </form>

            <div className="start">
                <Link className="btn" to={'quiz'} onClick={startQuiz}>Start Quiz</Link>
            </div>


        </div>
    )
}