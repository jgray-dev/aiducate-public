from flask import Flask, request, jsonify, Response
from flask_cors import CORS
from anthropic import Anthropic

app = Flask(__name__)
CORS(app)

conversation_history = []


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
    app.run(host='0.0.0.0', port=5001, debug=True)
