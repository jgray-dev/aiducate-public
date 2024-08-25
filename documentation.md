**base URL:** `http://67.164.191.36:5000`

<br>

****
*Retrieve single video from database*
**DEPRICATED (removed lol)**

~~Full endpoint:      '/videos/get/single'~~ <br>
~~accepted methods:   POST~~<br>
~~content type:       'application/json'~~<br>
~~body:               'video_id' -> database ID you'd like to retrieve~~<br>
~~returns:            JSON object of the video you've requested from the table~~<br>


<br>

****
*Retrieve all videos from database*

```
Full endpoint:      `/videos/get/all`
accepted methods:   GET
content type:       'application/json'
body:               N/A (GET)
returns:            JSON array of all objects from the videos table
```

<br>

****
*Add new video to database*

```
Full endpoint:      '/videos/add'
accepted methods:   POST
content type:       'application/json'
body:               'url' -> full URL of the youtube video
purpose: Add a new youtube video entry to the database. Automatically transcribes speech for context consumption later on.
returns:            'id' -> the database primary ID of the new row




```

