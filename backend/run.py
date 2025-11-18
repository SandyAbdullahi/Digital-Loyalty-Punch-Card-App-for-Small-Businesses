import os
import time

# Set timezone to East Africa Time (UTC+3). tzset is not available on Windows,
# so guard the call to avoid AttributeError when running locally there.
os.environ['TZ'] = 'Africa/Nairobi'
if hasattr(time, "tzset"):  # Unix/macOS
    time.tzset()

import uvicorn

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
