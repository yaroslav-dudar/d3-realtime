#!/usr/bin/python

from flask import Flask, render_template
from flask.ext.socketio import SocketIO, emit, send

import gevent

import time
from random import randint

app = Flask(__name__)
app.config['SECRET_KEY'] = 'dev secret'
socketio = SocketIO(app)

@app.route('/')
def index():
    return render_template('index.html')

@socketio.on('connect', namespace='/data')
def connect():
    emit('connect_to_server', {'data': 'Connected'})

@socketio.on('message', namespace='/data')
def message():
    emit('graph_data', {'date': time.strftime("%Y-%m-%d %H:%M:%S"), 'value': randint(0,100)})

@socketio.on('disconnect', namespace='/data')
def disconnect():
    print 'Client disconnected!'

if __name__ == '__main__':
    socketio.run(app, debug=True, port=5000)
