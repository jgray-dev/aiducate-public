import {useEffect, useState} from "react";
import {updateCookie} from "../components/Cookies.jsx";

export default function Browse({username, setAlertText, setAlertType}) {
    const [cards, setCards] = useState()
    const [response, setResponse] = useState()
    const [topics, setTopics] = useState(["Loading. . ."])
    const [filter, setFilter] = useState("None")
    const [updateCards, setUpdateCards] = useState(0)
    const [lastClick, setLastClick] = useState(Date.now())

    useEffect(() => {
        fetch('https://mynameisnt.kim/aiducate/videos/get/all', {
            method: "GET"
        })
            .then(r => r.json())
            .then(ogresponse => {
                const tempList = ogresponse.map(resp => resp['topic']);
                setTopics([...new Set(tempList.sort())]);
                fetch('https://mynameisnt.kim/aiducate/accounts/getvideos', {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({'username': username})
                })
                    .then(r => r.json())
                    .then(response => {
                        const ids = response.map((uservideo) => {
                            return uservideo[0]
                        })
                        const filtered = ogresponse.filter((ogvideo) => {
                            return (!ids.includes(ogvideo['id']))
                        })
                        setResponse(filtered)
                        getCards(filtered)
                        getThumbnails(filtered)
                    })
                    .catch((e)=>{
                        setAlertText(`ERROR: ${e}`)
                        setAlertType("error")
                    })
            });
    }, [updateCards]);

//    http://67.164.191.36:5000/
    
    function getThumbnails(response) {
  const videoIds = response.map(video => video['video_id']);
  
  fetch('https://mynameisnt.kim/aiducate/videos/get/thumbnails', {
    method: "POST",
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ 'video_ids': videoIds })
  })
  .then(r => r.json())
  .then(thumbnailUrls => {
    const updatedResponse = response.map((video, index) => ({
      ...video,
      thumbnail: thumbnailUrls[index]
    }));
    
    setResponse(updatedResponse);
    getCards(updatedResponse);
  })
  .catch((e) => {
    setAlertText(`ERROR: ${e}`);
    setAlertType("error");
  });
}

    function handleClick(video) {
        if (Date.now() - lastClick > 500) {
            if (username !== undefined) {
                updateCookie({"video_id": video["video_id"], "username": username})
                setLastClick(Date.now())
                fetch('https://mynameisnt.kim/aiducate/accounts/addvideo', {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({'video_id': video['id'], "username": username})
                })
                    .then(r => r.json())
                    .then(response => {
                        if (response.status) {
                            setAlertText(`Video added to library`)
                            setAlertType("info")
                            setUpdateCards(updateCards + 1)
                            fetch('https://mynameisnt.kim/aiducate/chat/clear_history')
                            .catch(e => {
                                setAlertText(`ERROR: ${e}`)
                                setAlertType("error")
                            })
                        } else {
                            setAlertText(`Error adding video to library`)
                            setAlertType("error")
                        }
                    })
                    .catch((e)=>{
                        setAlertText(`ERROR: ${e}`)
                        setAlertType("error")
                    })
            } else {
                setAlertText(`Please sign in before adding video's to your library`)
                setAlertType("error")
            }
        }
    }

    function getCards(data) {
        setCards(
            <div className="flex flex-wrap items-start">
                {data.map((video) => (
                    <div
                        key={video["video_id"]}
                        className="mb-8 group flex flex-col text-center relative h-fit md:w-1/4 w-1/2"
                        onClick={() => handleClick(video)}
                    >
                        <div className="m-4">
                            {video["thumbnail"] ? (
                                <img
                                    className="rounded-lg w-full aspect-video object-cover"
                                    src={video["thumbnail"]}
                                    alt={video.title}
                                />
                            ) : (
                                <div
                                    className="animate-pulse bg-opacity-30 bg-gray-200 rounded-lg w-full aspect-video"></div>
                            )}
                        </div>
                        <div className="text-center text-md text-zinc-400 px-4">
                            {video.title}
                        </div>
                        <span className="group-hover:opacity-100 transition-opacity bg-zinc-800 px-1 text-center text-md text-gray-100 rounded-md absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-full min-w-2/3 opacity-0 mx-auto mb-4 w-fit z-40 ">
                            Click to add to library
                      </span>
                    </div>
                ))}
            </div>
        );
    }

    function changeFilter(e) {
        e.preventDefault()
        setFilter(e.target.value)
        const filteredResponse = response.filter((resp) => {
            return (resp['topic'].toLowerCase() === e.target.value.toLowerCase() || e.target.value.toLowerCase() === "all")
        })
        getCards(filteredResponse)
    }

    return (
        cards ?
            <div>
                <div className="w-full text-3xl font-bold text-center pt-4">
                    Browse existing videos
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
                <div className="flex flex-grow overflow-y-hidden">
                    {cards}
                </div>
            </div>
            :
            <div className="w-full text-center text-3xl font-bold">
                Loading results
            </div>
    )
}