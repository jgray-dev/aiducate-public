import {useEffect, useState} from "react";

export default function Add({username, setAlertText, setAlertType}) {
    const [currentUrl, setUrl] = useState("")
    const [formColor, setFormColor] = useState("bg-red-500 cursor-not-allowed")
    const [status, setStatus] = useState("Enter URL here")

    useEffect(() => {
        if (username === undefined) {
            setAlertText(`Please sign in before adding a video`)
            setAlertType("error")
        }
    }, [])

    function handleSubmit() {
        if (status.includes("transcribe") || status.includes("Whisper")) {
            if (currentUrl.includes("https://") && (currentUrl.includes("youtu.be") || currentUrl.includes("youtube.com/watch?v="))) {
                setStatus("Adding video. Please be patient")
                setAlertText("Adding video. Please be patient")
                setAlertType("loading")
                fetch('https://mynameisnt.kim/aiducate/videos/add', {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({'url': currentUrl, 'username': username})
                })
                    .then(r => r.json())
                    .then(response => {
                        console.log(response)
                        if (response.status) {
                            setStatus("Video added successfully")
                            setAlertText(`${response.message}`)
                            setAlertType("info")
                        } else {
                            if (response.message.includes("Whisper")) {
                                setStatus("Whisper is starting. Please try again soon")
                            }
                            setAlertText(`${response.message}`)
                            setAlertType("error")
                        }
                    })
                    .catch((e) => console.warn(e))
            } else {
                setAlertText(`Invalid URL`)
                setAlertType("error")
            }
        }
    }

    function handleChange(url) {
        if (url.includes("https://") && (url.includes("youtu.be") || url.includes("youtube.com/watch?v="))) {
            setFormColor("bg-orange-600 cursor-wait")
            setStatus("Loading video details")
            fetch('https://mynameisnt.kim/aiducate/videos/getet', {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({'url': url})
            })
                .then(r => r.json())
                .then(response => {
                    if (!response.status) {
                        console.log(response)
                        setFormColor("bg-red-500 cursor-not-allowed")
                        setStatus(response.message)
                        setAlertText(response.message)
                        setAlertType("error")
                    } else {
                        setStatus(`Video will take ~${Math.round(response.et)} seconds to transcribe`)
                        setFormColor("bg-green-600 cursor-pointer")
                    }
                })
                .catch((e) => {
                    setStatus(`Invalid URL`)
                    setFormColor("bg-red-500 cursor-not-allowed")
                })
        } else {
            setFormColor("bg-red-500 cursor-not-allowed")
        }
    }

    return (
        username ?
            <div className="w-full">
                <div className="w-full text-3xl font-bold text-center pt-4">
                    Add new video
                </div>

                <div className="pt-8">
                    {status}
                    <form onSubmit={(e) => {
                        e.preventDefault()
                        handleSubmit()
                    }}>
                        <input
                            placeholder="Enter URL here"
                            type="url"
                            className={`mt-4 cursor-text block text-white ring-2 ring-inset ring-gray-300  rounded-md p-2 w-96 placeholder:text-white bg-zinc-400 sm:text-sm sm:leading-6`}
                            onChange={(e) => {
                                handleChange(e.target.value)
                                setUrl(e.target.value)
                            }}
                        />
                        <button type="submit"
                                className={`${formColor} py-2 px-4 mt-8 hover:bg-opacity-80 hover:text-white`}>Submit
                        </button>
                    </form>
                </div>
            </div>
            :
            <div className="w-full text-center text-3xl font-bold">
                Please sign in first
            </div>)
}
