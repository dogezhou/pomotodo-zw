#!/usr/bin/env python3
# -*- coding: utf-8 -*-

# create_db.py


from app import db
# import models


# create the database and the db table
db.create_all()

# commit the changes
db.session.commit()