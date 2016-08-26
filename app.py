#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from datetime import datetime
import os
from flask import Flask, render_template, jsonify, request
from flask_sqlalchemy import SQLAlchemy

# 记录当前文件的路径
from sqlalchemy import desc

basedir = os.path.abspath(os.path.dirname(__file__))
# 配置
DATABASE = 'pomotodo.db'
DEBUG = True
SECRET_KEY = 'my_precious'

# 数据库的路径
DATABASE_PATH = os.path.join(basedir, DATABASE)

SQLALCHEMY_TRACK_MODIFICATIONS = True

# 数据库 uri
SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URI') or 'sqlite:///' + DATABASE_PATH

# 实例化 app
app = Flask(__name__)
app.config.from_object(__name__)
db = SQLAlchemy(app)


# ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
# 数据库模型
# 记录任务和它是否被starred
class Task(db.Model):
    __tablename__ = 'tasks'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(64))
    pinned = db.Column(db.Boolean, default=False)
    pinned_time = db.Column(db.DateTime, index=True, default=None)
    logs = db.relationship('Task_Log', backref='task', lazy='dynamic')

    def __repr__(self):
        return "<Task {}>".format(self.name)


class Task_Log(db.Model):
    __tablename__ = 'task_logs'

    id = db.Column(db.Integer, primary_key=True)
    task_id = db.Column(db.Integer, db.ForeignKey('tasks.id'))
    # 添加了一个 task 属性，通过实例的task属性访问任务对象
    task_name = db.Column(db.String(64))  # 记录任务的名字
    task_time_s = db.Column(db.DateTime, index=True, default=datetime.now)
    task_time_e = db.Column(db.DateTime, index=True, default=datetime.now)

    def __repr__(self):
        return "<Task_Log {} from {} to {}>".format(self.name,
                                                    self.task_time_s,
                                                    self.task_time_e)


# class Pomo_Time(db.Model):
#     """
#     存储完成一个番茄需要的时间
#     """
#     pass

# +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
# 路由

@app.route("/")
def index():
    """
    搜索数据库中的 tasks 和 task_logs并显示出来
    """
    logs = Task_Log.query.all()
    pined_task_all = Task.query.filter_by(pinned=True).order_by(Task.pinned_time).all()
    unpin_task_all = Task.query.filter_by(pinned=False).all()
    tasks = pined_task_all + unpin_task_all
    pined_task = Task.query.filter_by(pinned=True).order_by(Task.pinned_time).first()

    return render_template('index.html', tasks=tasks, logs=logs, pined_task=pined_task)


@app.route('/add/<task_name>', methods=['GET'])
def add(task_name):
    """
    添加任务task
    """
    result = {'status': 0, 'message': 'Error'}
    try:
        task = Task(name=task_name)
        db.session.add(task)
        db.session.commit()
        result = {'status': 1, 'message': "Task added", 'task_id': task.id, 'task_name': task.name}
    except Exception as e:
        result = {'status': 0, 'message': repr(e)}

    return jsonify(result)


@app.route('/delete/<task_id>', methods=['GET'])
def delete(task_id):
    """
    删除id=task_id的任务
    """
    result = {'status': 0, 'message': 'Error'}
    try:
        task = Task.query.filter_by(id=task_id).first()
        db.session.delete(task)
        db.session.commit()
        result = {'status': 1, 'message': "Task deleted",}
    except Exception as e:
        result = {'status': 0, 'message': repr(e)}
    return jsonify(result)


@app.route('/pin/<task_id>', methods=['GET'])
def pin_task(task_id):
    """
    设置task_id任务的pinned值为True, 并记录pinned的时间
    """
    result = {'status': 0, 'message': 'Error'}
    try:
        task = Task.query.filter_by(id=task_id).first()
        task.pinned = True
        task.pinned_time = datetime.utcnow()
        db.session.commit()
        result = {'status': 1, 'message': "Task pinned", 'task_name': task.name, 'task_id': task.id}
    except Exception as e:
        result = {'status': 0, 'message': repr(e)}

    return jsonify(result)


@app.route('/unpin/<task_id>', methods=['GET'])
def unpin_task(task_id):
    """
    设置task
    """
    result = {'status': 0, 'message': 'Error'}
    try:
        task = Task.query.filter_by(id=task_id).first()
        task.pinned = False
        task.pinned_time = None
        db.session.commit()
        result = {'status': 1, 'message': "Task pinned", 'task_name': task.name, 'task_id': task.id}
    except Exception as e:
        result = {'status': 0, 'message': repr(e)}

    return jsonify(result)


@app.route('/log/<task_name>', methods=['GET'])
def log_task(task_name):
    """
    创建一个任务的记录
    """
    result = {'status': 0, 'message': 'Error'}
    start_time_stamp = float(request.args.get('start_time', '')) / 1000
    start_time = datetime.fromtimestamp(start_time_stamp)
    try:
        task_log = Task_Log(task_name=task_name, task_time_s=start_time)
        db.session.add(task_log)
        db.session.commit()
        result = {
                    'status': 1,
                    'message': "Task loged",
                    'log_id': task_log.id,
                    'task_name': task_log.task_name,
                    'start_time': task_log.task_time_s.strftime('%H:%M:%S'),
                    'end_time': task_log.task_time_e.strftime('%H:%M:%S')
                 }
    except Exception as e:
        result = {'status': 0, 'message': repr(e)}

    return jsonify(result)


@app.route('/test', methods=['GET', 'POST'])
def test():
    """
    测试服务器端获取客户端数据
    """
    print(request.form.get('fff'))
    print(request.args)
    print(request.headers)
    return '<h1>hello</h1>'


if __name__ == "__main__":
    app.run(debug=True)
