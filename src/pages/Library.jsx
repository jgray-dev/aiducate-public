import {useEffect, useState} from "react";
import {readCookie, updateCookie} from "../components/Cookies.jsx";

export default function Library({username, setAlertText, setAlertType}) {
    const [cards, setCards] = useState()
    const [response, setResponse] = useState()
    const [topics, setTopics] = useState(["Loading. . ."])
    const [filter, setFilter] = useState("None")

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
                    const tempList = response.map(resp => resp[4]);
                    setTopics([...new Set(tempList.sort())]);
                    getCards(response);
                    getThumbnails(response);
                })
                .catch((e)=>{
                    setAlertText(`ERROR: ${e}`)
                    setAlertType("error")
                })
        }
    }, [username]);

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
                     .catch((e)=>{
                         setAlertText(`ERROR: ${e}`)
                         setAlertType("error")
                     })
            )
        ).then((updatedResponse) => {
            setResponse(updatedResponse);
            getCards(updatedResponse);
        })
        .catch((e)=>{
            setAlertText(`ERROR: ${e}`)
            setAlertType("error")
        })
    }

    function handleClick(id) {
        const oldCookies = readCookie()
        console.log(oldCookies['username'])
        if (oldCookies['username'] !== undefined && oldCookies['username'] !== "") {
            console.log(id)
            updateCookie({"video_id": id, "username": oldCookies['username']})
        } else {
            setAlertText("Please sign in before adding videos to your library")
            setAlertType("warn")
        }
    }


    function getCards(data) {
        setCards(
            <div className="flex flex-wrap items-start" key="outer">
                {data.map((video) => {
                    return (
                        <div
                            key={video["video_id"]}
                            className="mb-8 group flex flex-col text-center relative h-fit md:w-1/4 w-1/2"
                            onClick={() => handleClick(video[5])}
                        >
                            <div className="m-4">
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
                                className="group-hover:opacity-100 transition-opacity bg-gray-800 px-1 text-center text-md text-gray-100 rounded-md absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-full min-w-2/3 opacity-0 mx-auto pb-4 w-fit max-h-12 z-40">
                                ID: {video[0]}<br/>
                                Topic: {video[4]}
                            </span>
                        </div>
                    )
                })}
            </div>
        );
    }

    function changeFilter(e) {
        e.preventDefault()
        setFilter(e.target.value)
        const filteredResponse = response.filter((resp) => {
            return (resp[4].toLowerCase() === e.target.value.toLowerCase() || e.target.value.toLowerCase() === "all")
        })
        getCards(filteredResponse)
    }

    return (
        cards ?
            <div className="w-full">
                <div className="w-full text-3xl font-bold text-center pt-4">
                    Browse library videos
                </div>
                <div className="w-full m-4 mg-stone-700">
                    Current filter: {filter}
                    <br></br>
                    Filter results by topic:
                    <select className="bg-zinc-600 m-4 py-2 px-4" defaultValue="All" onChange={(e) => changeFilter(e)}>
                        <option>All</option>
                        {topics.map((topic) => {
                            return (
                                <option key={topic} id={topic}>{topic}</option>
                            )
                        })}
                    </select>
                </div>
                <div className="flex flex-grow">
                    {cards}
                </div>
            </div>
            :
            <div className="w-full text-center text-3xl font-bold">
                Loading results
            </div>
    )
}