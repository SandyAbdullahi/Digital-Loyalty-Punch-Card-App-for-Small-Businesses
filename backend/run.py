import os
import time

# Set timezone to East Africa Time (UTC+3)
os.environ['TZ'] = 'Africa/Nairobi'
time.tzset()

import uvicorn

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)