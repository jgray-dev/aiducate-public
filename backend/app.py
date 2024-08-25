from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import requests
import time
from pytube import YouTube
import os
import sqlite3
import whisper
from database import *
from chat import *
from accounts import *
from anthropic import Anthropic

app = Flask(__name__)
CORS(app)


@app.route('/videos/add', methods=['POST'])
def add_video():
    startTime = int(str(time.time()).split(".")[0])
    video = YouTube(request.json['url'])
    if not video.age_restricted:

        # Getting past this means URL was valid. Catch in our fetch gives feedback to user
        video_id = video.video_id
        user = account_get(request.json)
        user_id = user[0]

        if not os.path.exists(f"./video_files/{video_id}/transcript.txt"):
            audio_stream = video.streams.filter(only_audio=True).first()
            video.streams.filter(only_audio=True).first().download(output_path=f"./video_files/{video_id}", filename="audio.mp3")
    
            API_URL = "https://vplhm08slh0n9lnx.us-east-1.aws.endpoints.huggingface.cloud"
            headers = {
            	"Accept" : "application/json",
            	"Authorization": "REDACTED",
            	"Content-Type": "audio/flac" 
            }
            
            def whisper(filename):
                with open(filename, "rb") as f:
                    data = f.read()
                response = requests.post(API_URL, headers=headers, data=data)
                return response.json()
            
            result = whisper(f"./video_files/{video_id}/audio.mp3")
            print(result)
            # Save transcript to transcript.txt within the ID folder
            file_path = os.path.join(f"./video_files/{video_id}/transcript.txt")
            video_object = Video(video.title, video.embed_url, video.title, f"./video_files/{video_id}/audio.mp3",
                                 video.video_id, user_id)
    
            if not os.path.exists(file_path):
                with open(file_path, "w") as file:
                    file.write(result["text"])
            else:
                with open(file_path, "w") as file:
                    file.write(result["text"])
    
            connection = sqlite3.connect("database.db")
            topic = get_topic(video.title, video.description)
            save_video(video.title, video.embed_url, f"./video_files/{video_id}/transcript.txt", topic, video.video_id,
                       user_id,
                       connection)
            connection.close()
            timeToComplete = int(str(time.time()).split(".")[0]) - startTime
            os.remove(f"./video_files/{video_id}/audio.mp3")
            return jsonify({
                "message": "Succesfully added video",
                "Time": timeToComplete,
                "status": True,
            })
        else:
            topic = get_topic(video.title, video.description)
            return jsonify({'message': 'Audio file already exists', 'status': True})
    else:
        return jsonify({'message': 'Video is age restricted', 'status': False})


@app.route('/videos/get/all', methods=['GET'])
def get_all():
    response = Video.get_all()
    returnList = list()
    for video in response:
        user_id = account_usernamefromid(video.user_id)
        returnList.append({
            "id": video.id,
            "title": video.title,
            "url": video.url,
            "transcript": video.transcript,
            "topic": video.topic,
            "video_id": video.video_id,
            "addedby": user_id[2]
        })
    return jsonify(returnList)


@app.route('/videos/get/thumbnail', methods=['POST'])
def get_thumbnail():
    ytvideo = YouTube(f"https://www.youtube.com/watch?v={request.json['video_id']}")
    return jsonify({"thumbnail": ytvideo.thumbnail_url})


@app.route('/videos/get/thumbnails', methods=['POST'])
def get_thumbnails():
    video_ids = request.json['video_ids']
    thumbnail_urls = []
    
    for video_id in video_ids:
        ytvideo = YouTube(f"https://www.youtube.com/watch?v={video_id}")
        thumbnail_urls.append(ytvideo.thumbnail_url)
    
    return jsonify(thumbnail_urls)

@app.route('/videos/getet', methods=['POST'])
def video_get_et():
    video = YouTube(request.json['url'])
    if "could not find match" in str(video):
        return jsonify({"message": "Invalid URL", "status": False})
    else:
        if not video.age_restricted:
            videolength = video.length
            et = (videolength * 0.0213) + 3
            return jsonify({"et": et, "length": videolength, "status": True})
        else:
            return jsonify({"message": "Video is age restriced!", "status": False})


@app.route('/videos/get/byid', methods=['POST'])
def get_by_video_id():
    response = Video.get_by_video_id(request.json['search_id'])
    ytvideo = YouTube(f"https://www.youtube.com/watch?v={response.video_id}")
    user_id = account_usernamefromid(response.user_id)
    return jsonify({
        "id": response.id,
        "title": response.title,
        "url": response.url,
        "transcript": response.transcript,
        "topic": response.topic,
        "video_id": response.video_id,
        "thumbnail": ytvideo.thumbnail_url,
        "addedby": user_id[2]
    })


@app.route('/accounts/checkexists', methods=['POST'])
def check_exists():
    unique = account_checkunique(request.json)
    return jsonify({"unique": unique})


@app.route('/accounts/create', methods=['POST'])
def create_account():
    response = account_create(request.json)
    return jsonify({"status": f"{response}"})


@app.route('/accounts/checkpassword', methods=['POST'])
def check_password():
    response = account_check(request.json)
    return jsonify(response)


@app.route('/accounts/get', methods=['POST'])
def get_account():
    response = account_get(request.json)
    return jsonify(response)


@app.route('/accounts/getvideos', methods=['POST'])
def get_accountvideos():
    response = account_getvideos(request.json)
    return jsonify(response)


@app.route('/accounts/addvideo', methods=['POST'])
def add_accountvideo():
    response = account_addvideo(request.json)
    return jsonify(response)


@app.route('/accounts/removevideo', methods=['POST'])
def remove_accountvideo():
    response = account_removevideo(request.json)
    return jsonify(response)


@app.route('/accounts/deleteaccount', methods=['POST'])
def delete_account():
    response = account_deleteaccount(request.json)
    return jsonify(response)


@app.route('/accounts/usernamefromid', methods=['POST'])
def get_accountfromid():
    response = account_usernamefromid(request.json['username'])
    return jsonify(response[2])


@app.route('/accounts/changepassword', methods=['POST'])
def set_newpassword():
    response = account_changepassword(request.json)
    return jsonify(response)


def get_topic(title, desc):
    client = Anthropic(
        api_key="REDACTED"
    )
    message = client.messages.create(
        max_tokens=1024,
        system="Respond with a single word only. This word should be the programming language being discussed in a video with the provided title and description. IF a programming language cannot be determined, respond with the word 'Other'",
        messages=[
            {
                "role": "user",
                "content": f"{title} {desc}",
            }
        ],
        model="claude-3-sonnet-20240229",
    )
    return (message.content[0].text)

@app.route('/chat', methods=['POST'])
def chat():
    client = Anthropic(
        api_key="REDACTED"
    )
    video = request.json
    transcript = ""
    with open(video['transcript'], "r") as file:
        transcript = file.read()

    prompt = request.json.get('prompt', 'Hello Claude!')
    model = request.json.get('model', 'claude-3-haiku-20240307')

    if not conversation_history or conversation_history[-1]["role"] == "assistant":
        conversation_history.append({"role": "user", "content": prompt})
    else:
        conversation_history[-1]["content"] += "\n" + prompt

    # Limit the conversation history to the last 4 messages
    limited_history = conversation_history[-4:]

    # Make sure the first message has the "user" role
    if limited_history and limited_history[0]["role"] != "user":
        limited_history.insert(0, {"role": "user", "content": "Hello"})

    response = client.messages.create(
        max_tokens=4096,
        messages=limited_history,
        model=f"{model}",
        system=f"You are now a teacher of the topic of a programming language, specifically {video['topic']}. The user will ask questions to you, based on the context of a video they are following along with. Please answer strictly in the context of the video. If something asked is on topic, but not discussed in the video, it is okay to reach into your own knowledge to provide the answer.  Please neglect any summary statements, and strictly answer the question asked. Here is the video transcript: {transcript}",
    )
    response_text = response.content[0].text
    print(response_text)
    if not conversation_history or conversation_history[-1]["role"] == "user":
        conversation_history.append({"role": "assistant", "content": response_text})
    else:
        conversation_history[-1]["content"] += "\n" + response_text

    return str(response_text)


@app.route('/chat/clear_history', methods=['GET'])
def clear_history():
    global conversation_history
    conversation_history = []
    return jsonify({"message": "Conversation history cleared"})


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
