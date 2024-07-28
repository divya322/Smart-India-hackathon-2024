from flask import Flask, render_template
from flask_socketio import SocketIO
import sys
import os

# Get the parent directory
parent_dir = os.path.dirname(os.path.realpath(__file__))


print(parent_dir[:-12])
# Add the parent directory to sys.path
sys.path.append(parent_dir[:-12])

from people_counter import people_counter


app = Flask(__name__)
socketio = SocketIO(app)
people_counter()

@app.route('/')
def index():
    return render_template('index.html')

@socketio.on('message')
def handle_message(message):
    print(f"Received message: {message}")
    socketio.emit('message', message)  # Broadcast the message to all connected clients

if __name__ == '__main__':
    socketio.run(app, debug=True)
