import os
from datetime import datetime, timezone, timedelta
from typing import Optional

try:
    from zoneinfo import ZoneInfo
except ImportError:  # Python <3.9 fallback, though project runs on 3.10
    ZoneInfo = None  # type: ignore


def _resolve_timezone():
    tz_name = os.getenv("APP_TIMEZONE", "Africa/Nairobi")
    if ZoneInfo:
        try:
            return ZoneInfo(tz_name)
        except Exception:
            pass
    offset = float(os.getenv("APP_TIMEZONE_OFFSET", "3"))
    hours = int(offset)
    minutes = int((abs(offset) - abs(hours)) * 60)
    delta = timedelta(hours=hours, minutes=minutes if hours >= 0 else -minutes)
    return timezone(delta)


LOCAL_TIMEZONE = _resolve_timezone()
UTC = timezone.utc


def _attach_timezone(dt: datetime) -> datetime:
    if dt.tzinfo is None:
        return dt.replace(tzinfo=LOCAL_TIMEZONE)
    return dt


def to_local(dt: Optional[datetime]) -> Optional[datetime]:
    """
    Convert any datetime (naive or aware) to the configured local timezone.
    Naive timestamps are assumed to be UTC.
    """
    if dt is None:
        return None
    return _attach_timezone(dt).astimezone(LOCAL_TIMEZONE)


def to_utc(dt: Optional[datetime]) -> Optional[datetime]:
    if dt is None:
        return None
    return _attach_timezone(dt).astimezone(UTC)


def format_local(dt: Optional[datetime]) -> Optional[str]:
    utc_dt = to_utc(dt)
    if not utc_dt:
        return None
    iso = utc_dt.isoformat()
    return iso.replace("+00:00", "Z")


def now_local() -> datetime:
    return datetime.now(LOCAL_TIMEZONE)


def now_local_iso() -> str:
    return format_local(datetime.now())
