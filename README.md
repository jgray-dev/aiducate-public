# Aiducate

A learning app where users can input youtube videos, and automatically get an AI tutor to help explain complicated topics in the video.

****

### App Setup
For this to work, we need 3 terminals.

from the base directory, run `npm start`
This will start the React frontend

from the `backend/` directory, run `pipenv install` , `pipenv shell` , and finally `python app.py`
This will start the main backend, on port `5000`

from the `backend/` directory, run `pipenv shell` , then `python chat.py`
This will start the backend that talks to the Anthropic API (for streaming AI responses) on port `5001`

****

To use the website, you must first create an account from the users page (This should be the only page available when not logged in)

Now you can visit the "browse" page (Search icon in the navbar) to view videos that other users (or you!) have uploaded to the website. Click on a video to add it to your library for viewing later.

If theres a video you'd like to learn from, that hasn't been uploaded yet, visit the "add" page (plus icon in the navbar), and enter a youtube video URL.
You'll automatically get an estimated time to transcribe the video (AI isnt instant!). Click submit to begin the transcription process.

After the video has finished trancribing, it'll be available from the "browse" page. Click it to add to your library.

From the library page, you can view all the video's you've added to your library. Click on a video from this page to set it as your "active" video.

When you have an active video set, you can visit the "learn" page (home icon in the navbar) to begin learning!
You get a view of the youtube video at the top, and a chatbox at the bottom. The chatbox communicated with the Claude chatbot by Anthropic. It's given a full transcript of the video for context, and is told to reach into its own knowledge only when there are gaps within the video's transcript. You can ask *anything* to this bot, and it will answer it on topic. If you're not getting the responses you're looking for, or they aren't helpful, use keywords such as "From your own knowledge" to reach into Claude's default knowledge for more answers.

****

This project was inspired by the teaching style at Flatiron School. It's some of the only lectures I can actually tolerate to sit through, and the instructor is a lot to do with it. Being able to interactively ask questions and get an immediate answer is **miles** ahead of just watching a tutorial or taking an online class when it comes to consuming knowledge.



