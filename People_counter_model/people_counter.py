from tracker.centroidtracker import CentroidTracker
from tracker.trackableobject import TrackableObject
from imutils.video import VideoStream
from itertools import zip_longest
from utils.mailer import Mailer
from imutils.video import FPS
from utils import thread
import numpy as np
import threading
import argparse
import datetime
import schedule
import logging
import imutils
import time
import dlib
import json
import csv
import cv2
import sys
import json
import base64
import socketio
from pymsgbox import alert
import win32com.client as comctl
wsh = comctl.Dispatch("WScript.Shell")


# execution start time
start_time = time.time()


# setup logger
logging.basicConfig(level=logging.INFO, format="[INFO] %(message)s")
logger = logging.getLogger(__name__)

# initiate features config.
with open("D:/College/3rd Year/Smart-India-hackathon/People_counter_model/utils/config.json", "r") as file:
    config = json.load(file)
 
sio = socketio.Client()
# Define a callback function for connecting to the Socket.IO server
@sio.on('connect')
def on_connect():
    print('Connected to the server')

# Define a callback function for disconnecting from the Socket.IO server
@sio.on('disconnect')
def on_disconnect():
    print('Disconnected from the server')


# Socket.IO event handlers
@sio.on('playButton')
def on_play():
    # Google Chrome window title
    wsh.AppActivate("Real-Time Monitoring/Analysis Window")
    wsh.SendKeys("p")
    wsh.AppActivate("Socket.IO Example - Google Chrome")
    wsh.SendKeys("a")
    print('Play')
# Socket.IO event handlers
@sio.on('forward')
def on_skipForward():
    # Google Chrome window title
    wsh.AppActivate("Real-Time Monitoring/Analysis Window")
    wsh.SendKeys("c")
    wsh.AppActivate("Socket.IO Example - Google Chrome")
    wsh.SendKeys("a")
    print('skipforw')# Socket.IO event handlers
@sio.on('fast')
def on_fast():
    # Google Chrome window title
    wsh.AppActivate("Real-Time Monitoring/Analysis Window")
    wsh.SendKeys("f")
    wsh.AppActivate("Socket.IO Example - Google Chrome")
    wsh.SendKeys("a")
    print('fast')# Socket.IO event handlers
@sio.on('slow')
def on_slow():
    # Google Chrome window title
    wsh.AppActivate("Real-Time Monitoring/Analysis Window")
    wsh.SendKeys("d")
    wsh.AppActivate("Socket.IO Example - Google Chrome")
    wsh.SendKeys("a")
    print('slow')# Socket.IO event handlers
@sio.on('backward')
def on_skipBackward():
    # Google Chrome window title
    wsh.AppActivate("Real-Time Monitoring/Analysis Window")
    wsh.SendKeys("a")
    wsh.AppActivate("Socket.IO Example - Google Chrome")
    wsh.SendKeys("a")
    print('skipback')
@sio.on('pauseButton')
def on_pause():
    wsh.AppActivate("Real-Time Monitoring/Analysis Window")
    wsh.SendKeys("p")
    wsh.AppActivate("Socket.IO Example - Google Chrome")
    wsh.SendKeys("a")
    print('pause')


# Connect to the Socket.IO server (adjust the server URL accordingly)
sio.connect('http://127.0.0.1:5000')

def sendFrame(frame):
    # Send the base64 encoded frame to the server
    sio.emit('frame', frame)

def parse_arguments():
    # function to parse the arguments
    args={}
    args['output']=None
    args['skip_frames']=30
    args['confidence']=0.4
    args["input"]="/utils/data/tests/test_1.mp4"
    return args

def send_mail():
    # function to send the email alerts
    Mailer().send(config["Email_Receive"])

def log_data(move_in, in_time, move_out, out_time):
    # function to log the counting data
    data = [move_in, in_time, move_out, out_time]
    # transpose the data to align the columns properly
    export_data = zip_longest(*data, fillvalue='')

    with open('utils/data/logs/counting_data.csv', 'w', newline='') as myfile:
        wr = csv.writer(myfile, quoting=csv.QUOTE_ALL)
        if myfile.tell() == 0:  # check if header rows are already existing
            wr.writerow(("Move In", "In Time", "Move Out", "Out Time"))
        wr.writerows(export_data)

def people_counter():
    # main function for people_counter.py
    args = parse_arguments()
    # initialize the list of class labels MobileNet SSD was trained to detect
    CLASSES = ["background", "aeroplane", "bicycle", "bird", "boat",
               "bottle", "bus", "car", "cat", "chair", "cow", "diningtable",
               "dog", "horse", "motorbike", "person", "pottedplant", "sheep",
               "sofa", "train", "tvmonitor"]
    # load our serialized model from disk
    net = cv2.dnn.readNetFromCaffe("D:/College/3rd Year/Smart-India-hackathon/People_counter_model/detector/MobileNetSSD_deploy.prototxt", "D:/College/3rd Year/Smart-India-hackathon/People_counter_model/detector/MobileNetSSD_deploy.caffemodel")
    # otherwise, grab a reference to the video file
    logger.info("Starting the video..")
    vs = cv2.VideoCapture("utils/data/tests/test_122.mp4")

    # initialize the video writer (we'll instantiate later if need be)
    writer = None

    # initialize the frame dimensions (we'll set them as soon as we read
    # the first frame from the video)
    W = None
    H = None

    # instantiate our centroid tracker, then initialize a list to store
    # each of our dlib correlation trackers, followed by a dictionary to
    # map each unique object ID to a TrackableObject
    ct = CentroidTracker(maxDisappeared=40, maxDistance=50)
    trackers = []
    trackableObjects = {}

    # initialize the total number of frames processed thus far, along
    # with the total number of objects that have moved either up or down
    totalFrames = 0
    totalDown = 0
    totalUp = 0
    # initialize empty lists to store the counting data
    total = []
    move_out = []
    move_in = []
    out_time = []
    in_time = []

    # start the frames per second throughput estimator
    fps = FPS().start()

    if config["Thread"]:
        vs = thread.ThreadingClass(config["url"])

    # Add this line at the beginning to initialize the pause state
    is_paused = False
    playback_speed = 1.0  # Initial playback speed
    frame_skip = 0  # Number of frames to skip

    base64_string   = ""

    # loop over frames from the video stream
    while True:
        if not is_paused:
            # Apply frame skipping
            while frame_skip > 0:
                vs.read()  # Skip frames by reading but not processing them
                frame_skip -= 1

            # grab the next frame and handle if we are reading from either
            # VideoCapture or VideoStream
            frame = vs.read()
            frame = frame[1] if args.get("input", False) else frame

            # if we are viewing a video and we did not grab a frame then we
            # have reached the end of the video
            if args["input"] is not None and frame is None:
                break

            # resize the frame to have a maximum width of 500 pixels (the
            # less data we have, the faster we can process it), then convert
            # the frame from BGR to RGB for dlib
            frame = imutils.resize(frame, width=500)
            rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

            # if the frame dimensions are empty, set them
            if W is None or H is None:
                (H, W) = frame.shape[:2]

            # if we are supposed to be writing a video to disk, initialize
            # the writer
            if args["output"] is not None and writer is None:
                fourcc = cv2.VideoWriter_fourcc(*"mp4v")
                writer = cv2.VideoWriter(args["output"], fourcc, 30,
                                        (W, H), True)

            # initialize the current status along with our list of bounding
            # box rectangles returned by either (1) our object detector or
            # (2) the correlation trackers
            status = "Waiting"
            rects = []

            # check to see if we should run a more computationally expensive
            # object detection method to aid our tracker
            if totalFrames % args["skip_frames"] == 0:
                # set the status and initialize our new set of object trackers
                status = "Detecting"
                trackers = []

                # convert the frame to a blob and pass the blob through the
                # network and obtain the detections
                blob = cv2.dnn.blobFromImage(frame, 0.007843, (W, H), 127.5)
                net.setInput(blob)
                detections = net.forward()

                # loop over the detections
                for i in np.arange(0, detections.shape[2]):
                    # extract the confidence (i.e., probability) associated
                    # with the prediction
                    confidence = detections[0, 0, i, 2]

                    # filter out weak detections by requiring a minimum
                    # confidence
                    if confidence > args["confidence"]:
                        # extract the index of the class label from the
                        # detections list
                        idx = int(detections[0, 0, i, 1])

                        # if the class label is not a person, ignore it
                        if CLASSES[idx] != "person":
                            continue

                        # compute the (x, y)-coordinates of the bounding box
                        # for the object
                        box = detections[0, 0, i, 3:7] * np.array([W, H, W, H])
                        (startX, startY, endX, endY) = box.astype("int")

                        # construct a dlib rectangle object from the bounding
                        # box coordinates and then start the dlib correlation
                        # tracker
                        tracker = dlib.correlation_tracker()
                        rect = dlib.rectangle(startX, startY, endX, endY)
                        tracker.start_track(rgb, rect)

                        # add the tracker to our list of trackers so we can
                        # utilize it during skip frames
                        trackers.append(tracker)

            # otherwise, we should utilize our object *trackers* rather than
            # object *detectors* to obtain a higher frame processing throughput
            else:
                # loop over the trackers
                for tracker in trackers:
                    # set the status of our system to be 'tracking' rather
                    # than 'waiting' or 'detecting'
                    status = "Tracking"

                    # update the tracker and grab the updated position
                    tracker.update(rgb)
                    pos = tracker.get_position()

                    # unpack the position object
                    startX = int(pos.left())
                    startY = int(pos.top())
                    endX = int(pos.right())
                    endY = int(pos.bottom())

                    # add the bounding box coordinates to the rectangles list
                    rects.append((startX, startY, endX, endY))

            # draw a horizontal line in the center of the frame -- once an
            # object crosses this line we will determine whether they were
            # moving 'up' or 'down'
            #cv2.line(frame, (0, H // 2), (W, H // 2), (0, 0, 0), 3)
            #cv2.putText(frame, "-Prediction border - Entrance-", (10, H - 20),
             #           cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 0), 1)

            # use the centroid tracker to associate the (1) old object
            # centroids with (2) the newly computed object centroids
            objects = ct.update(rects)

            # Count the number of people currently inside
            current_people_count = len(objects)

            # Display the current number of people inside
            cv2.putText(frame, "People Inside: {}".format(current_people_count), (10, H - 60),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 0), 2)
            if current_people_count > 2:
                #alert("Crowd Alert", "There is a crowd!")
                cv2.putText(frame, "There is a crowd", (10, H - 30), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 255), 2)

            # ...

            # show the output frame
            cv2.imshow("Real-Time Monitoring/Analysis Window",frame)
            _, buffer = cv2.imencode('.jpg', frame)
    
            # Convert the image buffer to a base64 string
            base64_string = base64.b64encode(buffer).decode()
            sendFrame(base64_string);

        # Handle keyboard input
        key = cv2.waitKey(1) & 0xFF

        # Check if the pause/play key "p" is pressed
        if key == ord("p"):
            is_paused = not is_paused  # Toggle the pause state
        # Handle other key presses
        if key == ord("q"):
            break

        # Handle playback control keys
        if key == ord("f"):  # Increase playback speed (fast-forward)
            playback_speed += 0.3
        elif key == ord("d"):  # Decrease playback speed (slow-down)
            playback_speed -= 0.3
        elif key == ord("a"):  # Skip 30 frames backward
            # Determine the current frame number
            current_frame = int(vs.get(cv2.CAP_PROP_POS_FRAMES))
            
            # Calculate the target frame number to skip backward 30 frames
            target_frame = max(current_frame - 30, 0)
            
            # Set the video capture to the target frame
            vs.set(cv2.CAP_PROP_POS_FRAMES, target_frame)
        elif key == ord("c"):  # Skip 30 frames forward
            frame_skip = 50

        # Apply frame skipping
        while frame_skip > 0:
            vs.read()  # Skip frames by reading but not processing them
            frame_skip -= 1

        # Apply playback speed
        time.sleep(1.0 / (30 * playback_speed))  # Adjust 30 based on your video's frame rate

        # increment the total number of frames processed thus far and
        # then update the FPS counter
        totalFrames += 1
        fps.update()

    # stop the timer and display FPS information
    fps.stop()
    # logger.info("Elapsed time: {:.2f}".format(fps.elapsed()))
    # logger.info("Approx. FPS: {:.2f}".format(fps.fps()))

    # release the camera device/resource (issue 15)
    if config["Thread"]:
        vs.release()

    # close any open windows
    cv2.destroyAllWindows()

people_counter()
