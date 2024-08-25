//Return our cookies as an object
export function readCookie() {
    let cookies = document.cookie.split("; ");
    let cookieObject = {};
    for (let i = 0; i < cookies.length; i++) {
        let cookie = cookies[i].split("=");
        cookieObject[cookie[0]] = cookie[1];
    }
    return cookieObject;
}


//Debug to print all our cookies
export function printAllCookies() {
    let cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
        let cookie = cookies[i];
        let eqPos = cookie.indexOf("=");
        let name = eqPos > -1 ? cookie.substring(0, eqPos) : cookie;
        if (name !== "undefined") {
            console.log(cookie)
        }
    }
}

//Deletes all saved cookies
export function deleteAllCookies() {
    let cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
        let cookie = cookies[i];
        let eqPos = cookie.indexOf("=");
        let name = eqPos > -1 ? cookie.substring(0, eqPos) : cookie;
        if (name !== "undefined") {
            document.cookie =
                name + "=; SameSite=Strict; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        }
    }
}

//Sets our cookie
export function updateCookie(data) {
    const date = new Date();
    date.setFullYear(date.getFullYear() + 1); // Cookie will expire in 1 year
    document.cookie = `video_id=${data.video_id}; SameSite=Strict; Expires=${date.toUTCString()}`;
    document.cookie = `username=${data.username}; SameSite=Strict; Expires=${date.toUTCString()}`;
}

export function setCookieUsername(username) {
    const oldCookies = readCookie()
    const video_id = oldCookies['video_id']
    updateCookie({
        "video_id": video_id,
        "username": username
    })
}