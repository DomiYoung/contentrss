import multiprocessing
import os

# Server socket
bind = "0.0.0.0:" + os.getenv("PORT", "8000")
backlog = 2048

# Worker processes
workers = multiprocessing.cpu_count() * 2 + 1
worker_class = 'sync'
worker_connections = 1000
timeout = 60
keepalive = 2

# Logging
accesslog = "-"
errorlog = "-"
loglevel = "info"

# Process naming
proc_name = "contentrss-backend"
