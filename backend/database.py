from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import bcrypt
import sqlite3


class User:
    def __init__(self, email, username, password, id=None):
        self.email = email
        self.username = username
        self.password = password

    def save(self):
        connection = sqlite3.connect('database.db')
        cursor = connection.cursor()
        newuser = cursor.execute(
            f'''
            INSERT INTO users(email, username, password)
            VALUES("{self.email}", "{self.username}", "{self.password}");
            '''
        )
        connection.commit()
        connection.close()
        return newuser


class Video:
    def __init__(self, title, url, transcript, topic, video_id, user_id, id=None):
        self.title = title
        self.url = url
        self.transcript = transcript
        self.topic = topic
        self.video_id = video_id
        self.user_id = user_id
        self.id = id

    def save(self, connection):
        cursor = connection.cursor()
        newvideo = cursor.execute(
            f'''
            INSERT INTO videos(title, url, transcript, topic, video_id, createdby)
            VALUES("{self.title}", "{self.url}", "{self.transcript}", "{self.topic}", "{self.video_id}", "{self.user_id}");
            '''
        )
        connection.commit()
        return newvideo

    @classmethod
    def get_by_video_id(cls, search_id):
        connection = sqlite3.connect("database.db")
        cursor = connection.cursor()
        video_data = cursor.execute(
            '''
            SELECT * FROM videos
            WHERE video_id = ?
            ''',
            (search_id,)
        ).fetchone()
        connection.close()
        video = cls(video_data[1], video_data[2], video_data[3], video_data[4], video_data[5], video_data[6],
                    video_data[0])
        return video

    @classmethod
    def get_by_id(cls, search_id):
        connection = sqlite3.connect("database.db")
        cursor = connection.cursor()
        data = cursor.execute(
            f'''
            SELECT * FROM videos
            WHERE id = {search_id}
            '''
        ).fetchone()
        connection.close()
        if data:
            video = cls(data[1], data[2], data[3], data[4], data[5], data[0])
            return video
        else:
            return None

    @classmethod
    def get_all(cls):
        connection = sqlite3.connect("database.db")
        cursor = connection.cursor()
        data = cursor.execute(
            f'''
            SELECT * FROM videos
            '''
        ).fetchall()
        connection.close()
        videos = []
        for video_data in data:
            video = cls(video_data[1], video_data[2], video_data[3], video_data[4], video_data[5], video_data[6],
                        video_data[0])
            videos.append(video)
        return videos

    def get_owner(self):
        return self.user_id


def save_video(title, url, transcript, topic, video_id, user_id, connection):
    video_object = Video(title, url, transcript, topic, video_id, user_id)
    video_object.save(connection)


def save_user(email, username, hashedpassword):
    user_object = User(email, username, hashedpassword)
    resp = user_object.save()
    if type(resp) is sqlite3.Cursor:
        return True
    else:
        return False
