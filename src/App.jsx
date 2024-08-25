import './index.css';
import {BrowserRouter, Route, Routes, Navigate} from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Learn from "./pages/Learn.jsx";
import Add from "./pages/Add.jsx";
import Browse from "./pages/Browse.jsx";
import User from "./pages/User.jsx";
import Debug from "./pages/Debug.jsx";
import Library from "./pages/Library.jsx";
import {useEffect, useState} from "react";
import {readCookie} from "./components/Cookies.jsx";
import Alert from "./components/Alert.jsx";

export default function App() {
    const [alertText, setAlertText] = useState("");
    const [alertType, setAlertType] = useState("Info");
    const [username, setUsername] = useState(undefined);
    const [timeoutId, setTimeoutId] = useState(null);

    const cookies = readCookie();
    if (cookies["username"] !== undefined) {
        checkUsername(cookies["username"]);
    }

    useEffect(() => {
        if (alertText !== "") {
            const newTimeoutId = setTimeout(() => {
                setAlertText("");
            }, 10000);
            setTimeoutId(newTimeoutId);
            return () => {
                clearTimeout(newTimeoutId);
            };
        }
    }, [alertText]);

    function setAppUsername(username) {
        checkUsername(username);
    }

    function checkUsername(username) {
        if (username !== undefined) {

                    fetch('https://mynameisnt.kim/aiducate/accounts/checkexists', {
                        method: "POST",
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({'username': username})
                    })
                        .then(r => r.json())
                        .then(response => {
                            if (response["unique"]) {
                                if (username !== undefined) {
                                    setAlertText(`Username not found`);
                                    setAlertType("error");
                                }
                            } else {
                                setUsername(username);
                            }
                        });
        } else {
            setUsername(undefined);
            console.warn("Checkusername failed");
        }
    }

    return (
        username ?
            <BrowserRouter>
                <div className="flex min-h-screen bg-stone-700 text-white select-none">
                    {alertText !== "" ? <Alert text={alertText} setAlertText={setAlertText} alertType={alertType}
                                               className="duration-200"/> : <div></div>}
                    <Navbar/>
                    <main className="flex flex-grow bg-stone-700 pl-28 pb-4 overflow-x-hidden">
                        <Routes>
                            <Route path="/" element={<Navigate to="/learn"/>}/>
                            <Route path="/learn" element={<Learn username={username} setAlertText={setAlertText}
                                                                 setAlertType={setAlertType}/>}/>
                            <Route path="/add" element={<Add username={username} setAlertText={setAlertText}
                                                             setAlertType={setAlertType}/>}/>
                            <Route path="/browse" element={<Browse username={username} setAlertText={setAlertText}
                                                                   setAlertType={setAlertType}/>}/>
                            {/*<Route path="/library" element={<Library username={username} setAlertText={setAlertText} setAlertType={setAlertType} />} />*/}
                            <Route path="/user" element={<User setAppUsername={setAppUsername} username={username}
                                                               setAlertText={setAlertText}
                                                               setAlertType={setAlertType}/>}/>
                            <Route path="/debug" element={<Debug username={username} setAlertText={setAlertText}
                                                                 setAlertType={setAlertType}/>}/>
                        </Routes>
                    </main>
                </div>
            </BrowserRouter>
            :
            <div className="flex min-h-screen bg-stone-700 text-white">
                <User setAppUsername={setAppUsername} username={username} setAlertText={setAlertText}
                      setAlertType={setAlertType}/>
                {alertText !== "" ? <Alert text={alertText} setAlertText={setAlertText} alertType={alertType}
                                           className="duration-200"/> : <div></div>}
            </div>
    );
}