from database import *
import sqlite3


def account_checkunique(data):
    connection = sqlite3.connect("database.db")
    cursor = connection.cursor()
    users = cursor.execute(
        f'''
            SELECT * FROM users WHERE username = "{data['username']}";
        '''
    ).fetchall()
    if len(users) == 0:
        return True
    else:
        return False

    connection.close()


def account_get(data):
    connection = sqlite3.connect("database.db")
    cursor = connection.cursor()
    user = cursor.execute(
        f'''
            SELECT * FROM users WHERE username = "{data['username']}";
        '''
    ).fetchone()
    return user


def account_create(data):
    hashedpassword = generate_hash(data['password'])
    return save_user(data['email'], data['username'], hashedpassword)
    pass


def account_check(data):
    user = account_get(data)
    return ({"correct": check_password(user[3], data['password']), "user": user})


def generate_hash(text):
    password_bytes = text.encode('utf-8')
    hashed_password = bcrypt.hashpw(password_bytes, bcrypt.gensalt())
    return hashed_password.decode('utf-8')


def check_password(saved, entered):
    # Convert the stored password and provided password to bytes
    saved_bytes = saved.encode('utf-8')
    entered_bytes = entered.encode('utf-8')
    # Compare the provided password with the stored hashed password
    return bcrypt.checkpw(entered_bytes, saved_bytes)


def account_getvideos(data):
    connection = sqlite3.connect("database.db")
    cursor = connection.cursor()
    user = cursor.execute(
        f'''
            SELECT * FROM users WHERE username = "{data['username']}";
        '''
    ).fetchone()
    videos = cursor.execute(
        f'''
            SELECT * FROM userVideos WHERE user_id = "{user[0]}";
        '''
    ).fetchall()
    videoData = list()
    for video in videos:
        thisData = cursor.execute(
            f'''
            SELECT * FROM videos WHERE id = "{video[2]}";
            '''
        ).fetchone()
        videoData.append(thisData)
    return videoData


def account_addvideo(data):
    username = data['username']
    video_id = data['video_id']
    user = account_get(data)
    user_id = user[0]
    connection = sqlite3.connect("database.db")
    cursor = connection.cursor()
    newlink = cursor.execute(
        f'''
        INSERT INTO userVideos(user_id, video_id)
        VALUES("{user_id}", "{video_id}");
        '''
    )
    connection.commit()
    connection.close()
    return ({"message": "Added video", "status": True})


def account_usernamefromid(username):
    connection = sqlite3.connect("database.db")
    cursor = connection.cursor()
    user = cursor.execute(
        f'''
            SELECT * FROM users WHERE id = "{username}";
        '''
    ).fetchone()
    return user


def account_changepassword(data):
    user = account_get(data)
    old_hash = generate_hash(data["oldpassword"])
    if check_password(user[3], data['oldpassword']):
        new_hash = generate_hash(data["newpassword"])
        connection = sqlite3.connect("database.db")
        cursor = connection.cursor()
        cursor.execute(
            f'''
            UPDATE users SET password = "{new_hash}" WHERE id = "{user[0]}";
            '''
        )
        connection.commit()
        connection.close()
        return ({"message": "Password updated", "status": True})
    else:
        return ({"message": "Old password does not match", "status": False})


def account_deleteaccount(data):
    user = account_get(data)
    user_id = user[0]

    if check_password(user[3], data['password']):
        # Set user uploaded videos to have the ID of "DELETED_ACCOUNT" so we maintain their data, but the user is gone
        videos = Video.get_all()
        for video in videos:
            if video.user_id == user_id:
                connection = sqlite3.connect("database.db")
                cursor = connection.cursor()
                cursor.execute(
                    f'''
                    UPDATE videos SET createdby = 0 WHERE id = {video.id};
                    '''
                )
                connection.commit()
                connection.close()

        # Delete the user from the users table
        connection = sqlite3.connect("database.db")
        cursor = connection.cursor()
        cursor.execute(
            f'''
            DELETE FROM users WHERE id = {user_id};
            '''
        )
        connection.commit()
        # Delete associated rows from userVideos table
        cursor.execute(
            f'''
            DELETE FROM userVideos WHERE user_id = {user_id}
            '''
        )
        connection.commit()
        connection.close()
        return ({"message": "Account deleted", "status": True})
    else:
        return ({"message": "Incorrect password", "status": False})


def account_removevideo(data):
    user = account_get(data)
    connection = sqlite3.connect("database.db")
    cursor = connection.cursor()
    cursor.execute(
        f'''
        DELETE FROM userVideos WHERE user_id = {user[0]} AND video_id = {data['video_id']}
        '''
    )
    connection.commit()
    connection.close()
    return ({"message": "Video removed from user account", "status": True})
