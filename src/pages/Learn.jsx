import {useEffect, useState, useRef} from "react";
import {readCookie, updateCookie} from "../components/Cookies.jsx";
import ReactMarkdown from 'react-markdown';


export default function Learn({username, setAlertText, setAlertType}) {
    const [cards, setCards] = useState(undefined);
    const [response, setResponse] = useState()
    const [updateCards, setUpdateCards] = useState(0)
    const currentVideoRef = useRef(null);

    const [video, setVideo] = useState("");
    const [claudeResponse, setClaudeResponse] = useState("")
    const [prompt, setPrompt] = useState("");
    const [responding, setResponding] = useState(false)
    const [lastPrompt, setLastPrompt] = useState("Ask a question about the video");

    
    async function getById(video_id) {
        if (video !== "waiting" && video !== undefined) {
            const response = await fetch('https://mynameisnt.kim/aiducate/videos/get/byid', {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({'search_id': video_id})
            })
                .catch((e) => {
                    setAlertText(`ERROR: ${e}`)
                    setAlertType("error")
                });
            return await response.json();
        } else {
            setAlertText("GetById skipped (video undefined)")
            setAlertType("warn")
        }
    }

    useEffect(() => {
        async function fetchVideo() {
            const cookies = readCookie();
            if (cookies.video_id !== undefined && cookies.video_id !== "waiting" && cookies.video_id !== "undefined") {
                try {
                    const video = await getById(cookies.video_id);
                    setVideo(video);
                } catch (error) {
                    setAlertText(`ERROR: ${error}`)
                    setAlertType("error")
                }
            } else {
                setVideo("waiting");
                setAlertText(`Please select a video from your library to get started`)
                setAlertType("warn")
            }
        }

        fetchVideo();
    }, []);

    useEffect(() => {
        currentVideoRef.current = video['id'];
    }, [video]);

    async function fetchClaude(model = "claude-3-haiku-20240307") {
            if (video && prompt !== "" && !responding) {
                try {
                    setResponding(true)
                    setClaudeResponse("Waiting for response...")
                    setLastPrompt("Sending prompt...")
                    const response = await fetch('https://mynameisnt.kim/aiducate/chat', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({...video, prompt: prompt, model: model}),
                    })
                        .catch((e) => {
                            setAlertText(`ERROR: ${e}`)
                            setAlertType("error")
                            console.error(e)
                        });
                    if (response.ok) {
                        setLastPrompt(prompt)
                        const reader = response.body.getReader();
                        const decoder = new TextDecoder('utf-8');
                        let result = '';
                        while (currentVideoRef.current === video['id']) {
                            const {value, done} = await reader.read();
                            if (done) {
                                break;
                            }
                            result += decoder.decode(value);
                            setClaudeResponse(result);
                        }
                        setResponding(false)
                        if (currentVideoRef.current !== video['id']) {
                            setClaudeResponse("")
                        }
                    } else {
                        setClaudeResponse(response)
                        console.error('Error:', response);
                        setAlertText(`CLAUDE ERROR: ${response}`)
                        setAlertType("error")
                    }
                } catch (error) {
                    setAlertText(`ERROR: ${error}`)
                    setAlertType("error")
                    setResponding(false)
                }
            } else {
                setAlertText(`ERROR: Please select a video first`)
                setAlertType("error")
            }
        }


    useEffect(() => {
        if (username !== undefined) {
            fetch('https://mynameisnt.kim/aiducate/accounts/getvideos', {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({'username': username})
            })
                .then(r => r.json())
                .then(response => {
                    setResponse(response);
                    getCards(response);
                    getThumbnails(response);
                })
                .catch((e) => {
                    setAlertText(`ERROR: ${e}`)
                    setAlertType("error")
                })
        }
    }, [username, updateCards]);

    function getThumbnails(response) {
        Promise.all(
            response.map((video) =>
                fetch('https://mynameisnt.kim/aiducate/videos/get/thumbnail', {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({'video_id': video[5]})
                })
                    .then(r => r.json())
                    .then(res => {
                        return ({
                            ...video,
                            thumbnail: res["thumbnail"]
                        })
                    })
                    .catch((e) => {
                        setAlertText(`ERROR: ${e}`)
                        setAlertType("error")
                    })
            )
        ).then((updatedResponse) => {
            setResponse(updatedResponse);
            getCards(updatedResponse);
        })
            .catch((e) => {
                setAlertText(`ERROR: ${e}`)
                setAlertType("error")
            })
    }

    function handleClick(id) {
        if (username !== undefined) {
            if (!responding) {
                setAlertText("Loading video details")
                setAlertType("loading")
                updateCookie({"video_id": id, "username": username})
                fetch('https://mynameisnt.kim/aiducate/videos/get/byid', {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({'search_id': id})
                })
                    .then(r => r.json())
                    .then(response => {
                        setVideo(response)
                        currentVideoRef.current = response['id']
                        setAlertText("Loaded video")
                        setAlertType("info")
                        setClaudeResponse("")
                        setLastPrompt("Ask a question about the video")
                        fetch('https://mynameisnt.kim/aiducate/chat/clear_history')
                            .catch(e => {
                                setAlertText(`ERROR: ${e}`)
                                setAlertType("error")
                            })
                    })
                    .catch((e) => {
                        setAlertText(`ERROR: ${e}`)
                        setAlertType("error")
                    })
            } else {
                setAlertText("Please wait for the response before changing videos")
                setAlertType("warn")
            }
        } else {
            setAlertText("Please sign in before selecting a video")
            setAlertType("error")
        }
    }

    function removeVideo(videoToRemove) {
        setVideo((prevVideo) => {
            if (videoToRemove[0] === prevVideo['id']) {
                return "waiting";
            }
            return prevVideo;
        });
        updateCookie({"video_id": undefined, "username": username})
        setAlertText("Removing video from library")
        setAlertType("loading")
        fetch('https://mynameisnt.kim/aiducate/accounts/removevideo', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({'username': username, 'video_id': videoToRemove[0]})
        })
            .then((r) => r.json())
            .then(response => {
                if (response.status) {
                    setUpdateCards(updateCards + 1)
                    setAlertText(`Video removed from library`)
                    setAlertType("info")
                } else {
                    setAlertText(`Unknown error removing video`)
                    setAlertType("error")
                }
            })
            .catch((e) => {
                setAlertText(`ERROR: ${e}`)
                setAlertType("error")
            })
    }

    function getCards(data) {
        const rawCards = data.map((video) => {
            return (
                <div
                    key={video[0]}
                    className="mb-2 group flex flex-col text-center relative h-fit w-full"
                >
                    <div className="m-4" onClick={() => handleClick(video[5])}>
                        {video["thumbnail"] ? (
                            <img
                                className="rounded-lg w-full aspect-video object-cover"
                                src={video["thumbnail"]}
                                alt={video[1]}
                            />
                        ) : (
                            <div
                                className="animate-pulse bg-opacity-30 bg-gray-200 rounded-lg w-full aspect-video"></div>
                        )}
                    </div>
                    <div className="text-center text-md text-zinc-400">
                        {video[1]}
                    </div>
                    <span
                        className="group-hover:opacity-100 h-fit transition-opacity bg-zinc-800 px-1 text-center text-md text-gray-100 rounded-md absolute left-1/2 bottom-0 -translate-x-1/2 min-w-2/3 opacity-0 mx-auto mb-4 py-1 w-fit z-40">
                                            <button
                                                className="p-1 border-2 rounded-lg m-1 py-1 hover:border-red-400 hover:bg-zinc-700"
                                                onClick={() => removeVideo(video)}>Remove</button>
                                        </span>
                </div>
            )
        })
        setCards(rawCards);
    }

    if (cards === undefined) {
        setCards([])
    }
    return (
        video ?
            <div className="flex h-full w-full flex-col items-center">
                <div className="h-2/3 w-full relative">
                    <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center p-4">
                        <div className="w-1/4 h-full relative bg-black bg-opacity-15 overflow-x-hidden mr-4 rounded-md">
                            <div className="sticky top-0 p-2 text-white w-full text-center z-40 bg-black bg-opacity-15">
                                Library videos
                            </div>
                            <div className="overflow-y-scroll h-[calc(100%-3rem)] no-scrollbar">
                                {cards.length > 0 ? (
                                    <div className="flex flex-wrap items-start">
                                        {cards}
                                    </div>
                                ) : (
                                    <div className="w-full text-stone-300 text-center pt-12 px-4 h-full">
                                        Add some videos from the browse page to get started
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="w-2/3 h-full relative">
                            {video !== "waiting" ? (
                                <div className="bg-black bg-opacity-20 w-full h-full rounded-md text-center text-white">
                                    <iframe src={video.url}
                                            className="rounded-md absolute top-0 left-0 w-full h-full p-2"></iframe>
                                </div>
                            ) : (
                                <div
                                    className="bg-black bg-opacity-30 w-full h-full animate-pulse rounded-md text-center text-white">
                                    Select a video from your library
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="h-2/5 text-left w-full text-md flex flex-col items-center">
                    <div
                        className="w-11/12 h-80 max-h-80 border-b border-cyan-500 overflow-y-scroll whitespace-pre-line break-normal titillium bg-black bg-opacity-25 rounded-l no-scrollbar">
                        <ReactMarkdown className="m-4 select-text">{claudeResponse}</ReactMarkdown>
                    </div>
                    <div className="w-11/12">
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                setPrompt("");
                                fetchClaude();
                            }}
                            className="text-black"
                        >
                                <textarea
                                    className={`w-full h-24 mt-4 p-2 rounded-md bg-black bg-opacity-30 focus:outline-none text-white placeholder-zinc-500
                                    
                                    ${video !== "waiting" ? "cursor-auto" : "cursor-not-allowed"}`}
                                    value={prompt}
                                    placeholder={lastPrompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (video !== "waiting") {
                                            if (e.key === "Enter") {
                                                e.preventDefault();
                                                if (!responding) {
                                                    if (e.shiftKey) {
                                                        setPrompt("");
                                                        fetchClaude("claude-3-sonnet-20240229");
                                                        setAlertType("info")
                                                        setAlertText(`claude-3-sonnet-20240229`)
                                                    } else {
                                                        setPrompt("");
                                                        fetchClaude("claude-3-haiku-20240307");
                                                    }
                                                }
                                            } else if (e.key === "ArrowUp" && !e.shiftKey) {
                                                setPrompt(lastPrompt);
                                            }
                                        } else {
                                            setAlertText("Please select a video from your library to get started");
                                            setAlertType("warn");
                                        }
                                    }}
                                ></textarea>
                        </form>
                    </div>
                </div>
            </div>

            : <div className="w-full text-white text-center text-2xl font-bold">Loading...</div>

    );
}