import {useState} from "react";
import {deleteAllCookies, setCookieUsername, updateCookie} from "../components/Cookies.jsx";

export default function User({setAppUsername, username, setAlertText, setAlertType}) {
    const [email, setEmail] = useState("")
    const [SuUsername, setSuUsername] = useState("")
    const [password, setPassword] = useState("")
    const [confirmpw, setConfirmpw] = useState("")

    const [oldPassword, setOldPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmNewPassword, setConfirmNewPassword] = useState("")

    const [deletePassword, setDeletePassword] = useState("")

    const [siUsername, setSiUsername] = useState("")
    const [siPassword, setSiPassword] = useState("")

    
    function handleSignin(e) {
        e.preventDefault()
        if (siUsername !== "" && siPassword !== "") {
            fetch('https://mynameisnt.kim/aiducate/accounts/checkexists', {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({'username': siUsername})
            })
                .then(r => r.json())
                .then(response => {
                    if (!response.unique) {
                        setAlertText(`Checking password`)
                        setAlertType("loading")
                        fetch('https://mynameisnt.kim/aiducate/accounts/checkpassword', {
                            method: "POST",
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({'username': siUsername, 'password': siPassword})
                        }).then(r => r.json())
                           .then(response => {
                               if (response.correct) {
                                    setAlertText(`Signed in successfully`)
                                    setAlertType("info")
                                   setCookieUsername(response['user'][2])
                                   setAppUsername(response['user'][2])
                               } else {
                                    setAlertText(`Incorrect password`)
                                    setAlertType("error")
                               }
                            })
                            .catch(e => {
                                setAlertText(`ERROR: ${e}`)
                                setAlertType("error")
                            })
                    } else {
                        setAlertText(`Account with that username not found`)
                        setAlertType("error")
                    }
                })
                .catch(e => {
                    setAlertText(`ERROR: ${e}`)
                    setAlertType("error")
                })
        } else {
            setAlertText(`Form cannot be left blank`)
            setAlertType("error")
        }
    }

    function handleSignup(e) {
        e.preventDefault()
        if (password !== "" && SuUsername !== "" && email !== "") {
            if (password === confirmpw) {
                setAlertText(`Checking username is unique`)
                setAlertType("loading")
                fetch('https://mynameisnt.kim/aiducate/accounts/checkexists', {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({'username': SuUsername})
                })
                .then(r => r.json())
                .then(response => {
                    if (response.unique) {
                        setAlertText(`Creating account`)
                        setAlertType("loading")
                        fetch('https://mynameisnt.kim/aiducate/accounts/create', {
                            method: "POST",
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({'email': email, 'username': SuUsername, 'password': password})
                        }).then(r => r.json())
                            .then(response => {
                                if (response.status) {
                                    setAlertText(`Account created successfully`)
                                    setAlertType("info")
                                    setAppUsername(SuUsername)
                                    updateCookie({"video_id": undefined, "username": SuUsername})
                                } else {
                                    setAlertText("Unknown error attempting to create account")
                                    setAlertType("error")
                                }
                            })
                            .catch((e)=>{
                                setAlertText(`ERROR: ${e}`)
                                setAlertType("error")
                            })
                    } else {
                        setAlertText(`Username is already taken!`)
                        setAlertType("error")
                    }
                })
                .catch((e)=>{
                    setAlertText(`ERROR: ${e}`)
                    setAlertType("error")
                })

            } else {
                setAlertText(`Passwords do not match`)
                setAlertType("error")
            }
        } else {
            setAlertText(`Form cannot be left blank`)
            setAlertType("error")
        }
    }

    function handleChangePassword(e) {
        e.preventDefault()
        setAlertText(`Changing password`)
        setAlertType("loading")
        if (newPassword === confirmNewPassword) {
            if (oldPassword !== "") {
                fetch('https://mynameisnt.kim/aiducate/accounts/changepassword', {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({'username': username, 'oldpassword': oldPassword, 'newpassword': newPassword})
                })
                .then(r => r.json())
                .then(response => {
                    if (response.status) {
                        setAlertText(`Password changed successfully`)
                        setAlertType("info")
                    } else {
                        if (response.message.includes("Old password")) {
                            setAlertText(`Old password is incorrect`)
                            setAlertType("error")
                        } else {
                            setAlertText(`Error changing password. Check console for logs`)
                            setAlertType("error")
                        }
                    }
                })
                .catch((e)=>{
                    setAlertText(`ERROR: ${e}`)
                    setAlertType("error")
                })
            } else {
                setAlertText(`Old password cannot be left blank`)
                setAlertType("error")
            }
        } else {
            setAlertText(`Passwords do not match`)
            setAlertType("error")
        }
    }

    function handleDeleteAccount(e) {
        e.preventDefault()
        if (deletePassword !== "") {
            setAlertText(`Attempting to delete account`)
            setAlertType("loading")
            fetch('https://mynameisnt.kim/aiducate/accounts/deleteaccount', {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({'username': username, 'password': deletePassword})
            })
                .then(r => r.json())
                .then(response => {
                    if (response.status) {
                        deleteAllCookies()
                        setAppUsername(undefined)
                        setAlertText(`Account deleted successfully`)
                        setAlertType("info")
                    } else {
                        if (response.message.includes("Incorrect")) {
                            setAlertText(`Password is incorrect`)
                            setAlertType("error")
                        } else {
                            setAlertText(`Error attempting to delete account`)
                            setAlertType("error")
                        }
                    }
                })
                .catch((e)=>{
                    setAlertText(`ERROR: ${e}`)
                    setAlertType("error")
                })
        } else {
            setAlertText(`Password cannot be left blank`)
            setAlertType("error")
        }
    }

    return (
        <div className="min-h-screen w-full flex items-center justify-center">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {!username && (
                        <div className="md:col-span-2 lg:col-span-3 flex justify-center">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="bg-white bg-opacity-15 p-8 rounded-lg">
                                    <h2 className="text-white text-2xl font-bold mb-6">Sign in</h2>
                                    <form>
                                        <div className="mb-4">
                                            <label htmlFor="siUsername" className="block text-white mb-2">
                                                Username
                                            </label>
                                            <input
                                                id="siUsername"
                                                className="bg-white bg-opacity-15 px-4 py-2 rounded-md w-full"
                                                placeholder="Enter username"
                                                onChange={(e) => setSiUsername(e.target.value)}
                                            />
                                        </div>
                                        <div className="mb-6">
                                            <label htmlFor="siPassword" className="block text-white mb-2">
                                                Password
                                            </label>
                                            <input
                                                type="password"
                                                id="siPassword"
                                                className="bg-white bg-opacity-15 px-4 py-2 rounded-md w-full"
                                                placeholder="Enter password"
                                                onChange={(e) => setSiPassword(e.target.value)}
                                            />
                                        </div>
                                        <button
                                            onClick={(e) => handleSignin(e)}
                                            className="bg-blue-500 hover:bg-opacity-80 hover:text-white text-zinc-100 px-6 py-2 rounded-lg"
                                        >
                                            Sign in
                                        </button>
                                    </form>
                                </div>
                                <div className="bg-white bg-opacity-15 p-8 rounded-lg">
                                    <h2 className="text-white text-2xl font-bold mb-6">Sign up</h2>
                                    <form>
                                        <div className="mb-4">
                                            <label htmlFor="email" className="block text-white mb-2">
                                                Email
                                            </label>
                                            <input
                                                id="email"
                                                className="bg-white bg-opacity-15 px-4 py-2 rounded-md w-full"
                                                placeholder="Enter email"
                                                onChange={(e) => setEmail(e.target.value)}
                                            />
                                        </div>
                                        <div className="mb-4">
                                            <label htmlFor="suUsername" className="block text-white mb-2">
                                                Username
                                            </label>
                                            <input
                                                id="suUsername"
                                                className="bg-white bg-opacity-15 px-4 py-2 rounded-md w-full"
                                                placeholder="Enter username"
                                                onChange={(e) => setSuUsername(e.target.value)}
                                            />
                                        </div>
                                        <div className="mb-4">
                                            <label htmlFor="password" className="block text-white mb-2">
                                                Password
                                            </label>
                                            <input
                                                type="password"
                                                id="password"
                                                className="bg-white bg-opacity-15 px-4 py-2 rounded-md w-full"
                                                placeholder="Enter password"
                                                onChange={(e) => setPassword(e.target.value)}
                                            />
                                        </div>
                                        <div className="mb-6">
                                            <label htmlFor="confirmpw" className="block text-white mb-2">
                                                Confirm password
                                            </label>
                                            <input
                                                type="password"
                                                id="confirmpw"
                                                className="bg-white bg-opacity-15 px-4 py-2 rounded-md w-full"
                                                placeholder="Confirm password"
                                                onChange={(e) => setConfirmpw(e.target.value)}
                                            />
                                        </div>
                                        <button
                                            onClick={(e) => handleSignup(e)}
                                            className="bg-blue-500 hover:bg-opacity-80 hover:text-white text-zinc-100 px-6 py-2 rounded-lg"
                                        >
                                            Sign up
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    )}
                    {username && (
                        <>
                            <div className="bg-white bg-opacity-15 p-8 rounded-lg">
                                <h2 className="text-white text-2xl font-bold mb-6">Change Password</h2>
                                <form>
                                    <div className="mb-4">
                                        <label htmlFor="oldPassword" className="block text-white mb-2">
                                            Old Password
                                        </label>
                                        <input
                                            type="password"
                                            id="oldPassword"
                                            className="bg-white bg-opacity-15 px-4 py-2 rounded-md w-full"
                                            placeholder="Enter old password"
                                            onChange={(e) => setOldPassword(e.target.value)}
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <label htmlFor="newPassword" className="block text-white mb-2">
                                            New Password
                                        </label>
                                        <input
                                            type="password"
                                            id="newPassword"
                                            className="bg-white bg-opacity-15 px-4 py-2 rounded-md w-full"
                                            placeholder="Enter new password"
                                            onChange={(e) => setNewPassword(e.target.value)}
                                        />
                                    </div>
                                    <div className="mb-6">
                                        <label htmlFor="confirmNewPassword" className="block text-white mb-2">
                                            Confirm New Password
                                        </label>
                                        <input
                                            type="password"
                                            id="confirmNewPassword"
                                            className="bg-white bg-opacity-15 px-4 py-2 rounded-md w-full"
                                            placeholder="Confirm new password"
                                            onChange={(e) => setConfirmNewPassword(e.target.value)}
                                        />
                                    </div>
                                    <button
                                        onClick={(e) => handleChangePassword(e)}
                                        className="bg-blue-500 hover:bg-opacity-80 hover:text-white text-zinc-100 px-6 py-2 rounded-lg"
                                    >
                                        Change Password
                                    </button>
                                </form>
                            </div>
                            <div className="bg-white bg-opacity-15 h-full p-8 rounded-lg">
                                <h2 className="text-white text-2xl pb-4">Logged in as <p className="font-bold">{username}</p></h2>
                                <button
                                    onClick={() => {
                                        deleteAllCookies();
                                        setAppUsername(undefined);
                                        setAlertText("Logged out successfully");
                                        setAlertType("info");
                                    }}
                                    className="bg-blue-500 bottom-10 hover:bg-opacity-80 hover:text-white text-zinc-100 px-6 py-2 rounded-lg"
                                >
                                    Log Out
                                </button>
                            </div>
                            <div className="bg-white bg-opacity-15 p-8 rounded-lg md:col-span-2 lg:col-span-3">
                                <h2 className="text-white text-2xl font-bold mb-6">Delete Account</h2>
                                <div className="flex items-center">
                                    <input
                                        type="password"
                                        className="bg-white bg-opacity-15 px-4 py-2 rounded-md mr-4"
                                        placeholder="Confirm password"
                                        onChange={(e) => setDeletePassword(e.target.value)}
                                    />
                                    <button
                                        onClick={(e) => handleDeleteAccount(e)}
                                        className="bg-red-500 hover:bg-opacity-80 hover:text-white text-zinc-100 px-6 py-2 rounded-lg"
                                    >
                                        DELETE ACCOUNT
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}