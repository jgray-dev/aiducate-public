import {deleteAllCookies, printAllCookies, readCookie, updateCookie} from "../components/Cookies.jsx";
import {useState} from "react";

export default function Debug({setAlertText, setAlertType}) {
    const [videoObj, setVideoObj] = useState()

    function getAll() {
        fetch('https://mynameisnt.kim/aiducate/videos/get/all', {
            method: "GET",
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(r => r.json())
            .then(response => console.log(response))
    }

    function getById() {
        const cookies = readCookie()
        console.log(cookies)
        fetch('https://mynameisnt.kim/aiducate/videos/get/byid', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({'search_id': cookies.video_id})
        })
            .then(r => r.json())
            .then(response => {
                console.log(response)
                setVideoObj(response)
            })
    }

    function ClaudeChat() {
        console.log(videoObj)
        fetch('https://mynameisnt.kim/aiducate/chat', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(videoObj)
        })
            .then(r => r.json())
            .then(response => console.log(response))
    }
    
    function getAccount() {
        const cookies = readCookie()
        if (cookies['username']) {
            fetch('https://mynameisnt.kim/aiducate/accounts/get', {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({"username": cookies['username']})
            })
                .then(r => r.json())
                .then(response => {
                    console.log("Response from fetch 1")
                    console.log(response)
                    fetch('https://mynameisnt.kim/aiducate/accounts/usernamefromid', {
                            method: "POST",
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({"id": response[0]})
                        })
                    .then(r=>r.json())
                    .then(res=>{console.log("Response from 2: ", res)})
                    
                })
        } else {
            setAlertText(`Please sign in first`)
            setAlertType("error")
        }
    }

    return (<div>
        <button className="rounded-md bg-rose-600 hover:bg-rose-500 px-6 py-4 m-6" onClick={() => getAll()}>Get all
            videos
        </button>
        <button className="rounded-md bg-rose-600 hover:bg-rose-500 px-6 py-4 m-6" onClick={() => getById()}>Get by ID
        </button>
        <button className="rounded-md bg-rose-600 hover:bg-rose-500 px-6 py-4 m-6"
                onClick={e => printAllCookies()}>Print cookies
        </button>
        <button className="rounded-md bg-rose-600 hover:bg-rose-500 px-6 py-4 m-6"
                onClick={() => updateCookie("5C_HPTJg5ek")}>Save
            cookie
        </button>
        <button className="rounded-md bg-rose-600 hover:bg-rose-500 px-6 py-4 m-6"
                onClick={() => deleteAllCookies()}>Delete cookies
        </button>
        <button className="rounded-md bg-rose-600 hover:bg-rose-500 px-6 py-4 m-6"
                onClick={() => getById()}>Get by video ID
        </button>
        <button className="rounded-md bg-rose-600 hover:bg-rose-500 px-6 py-4 m-6"
                onClick={() => ClaudeChat()}>Send Claude prompt
        </button>
        <button className="rounded-md bg-rose-600 hover:bg-rose-500 px-6 py-4 m-6"
                onClick={() => getAccount()}>Get account from cookie
        </button>
    </div>)
}