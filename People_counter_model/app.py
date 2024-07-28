from flask import Flask, render_template
from flask_socketio import SocketIO
import sys
import os
from flask_cors import CORS

app = Flask(__name__)
socketio = SocketIO(app)
CORS(app, supports_credentials=True, origins=["http://127.0.0.1:5000", "http://10.24.66.160:5000"])

@app.route('/')
def index():
    # people_counter()
    return render_template('index.html')

@socketio.on('frame')
def handle_frame(frame):
    # print("hello")
    # print(f"Received message: {frame}")
    socketio.emit('frame', frame)

@socketio.on('playButton')
def handle_play():
    socketio.emit('playButton')

@socketio.on('pauseButton')
def handle_pause():
    socketio.emit('pauseButton')

@socketio.on('fast')
def handle_fast():
    socketio.emit('fast')

@socketio.on('slow')
def handle_slow():
    socketio.emit('slow')

@socketio.on('forward')
def handle_forward():
    socketio.emit('forward')

@socketio.on('backward')
def handle_backward():
    socketio.emit('backward')

@socketio.on('message')
def handle_message(message):
    print(f"Received message: {message}")
    socketio.emit('message', message)  # Broadcast the message to all connected clients

if __name__ == '__main__':
    socketio.run(app, debug=True)
