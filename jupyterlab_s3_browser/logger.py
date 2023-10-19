import datetime
import json
import logging
import os
import sys

class CustomFormatter(logging.Formatter):

    grey = "\x1b[38;20m"
    darkGrey = '\033[1;30m'
    yellow = "\x1b[33;20m"
    red = "\x1b[31;20m"
    boldRed = "\x1b[31;1m"
    green = '\033[0;32m'
    blue = '\033[0;34m'
    purple = '\033[0;35m'
    reset = "\x1b[0m"
    if os.getenv("NOTEBOOK", None) or os.getenv("API_ENV", None):
        format = '[%(asctime)s] [%(levelname)s] %(message)s'
    else:
        format = '[%(asctime)s] [%(levelname)s] [%(funcName)s] [%(lineno)d] %(message)s'

    FORMATS = {
        logging.DEBUG: green + format + reset,
        logging.INFO: blue + format + reset,
        logging.WARNING: yellow + format + reset,
        logging.ERROR: boldRed + format + reset,
        logging.CRITICAL: boldRed + format + reset
    }

    def format(self, record):

        log_fmt = self.FORMATS.get(record.levelno)
        formatter = logging.Formatter(log_fmt)
        return formatter.format(record)

class Logger:

    def __init__(self):
        logs = logging.getLogger(__name__)
        logs.propagate = False
        logs.setLevel(10 if os.getenv("VERBOSE") == "True" else 20)
        handler_stream = logging.StreamHandler(sys.stdout)
        handler_stream.setFormatter(CustomFormatter())
        logs.addHandler(handler_stream)
        self.DataLog = logs

    def getLogger(self):
        return self.DataLog




log = Logger().DataLog
