#!/usr/bin/env python3
"""Feature 8: anonymous intersection-based report history, never personal risk."""
from __future__ import annotations

import csv
import io
import json
import math
import os
import zipfile
from collections import defaultdict
from datetime import datetime, timedelta, timezone
from pathlib import Path
from zoneinfo import ZoneInfo

import requests

ROOT = Path(__file__).resolve().parents[1]
SOURCE = "https://data.sf.gov/d/wg3w-h783"
API = "https://data.sf.gov/api/v3/views/wg3w-h783/query.json"


def query_rows(query, page=1, size=5000):
    token = os.environ.get("SF_TRANSIT_DATASF_APP_TOKEN", "").strip()
    r = requests.get(API, params={"query":query,"pageNumber":page,"pageSize":size},
                     headers={"X-App-Token":token} if token else {}, timeout=60)
    r.raise_for_status()
    rows = r.json()
    if not isinstance(rows,list) or any(not isinstance(row,dict) for row in rows):
        raise ValueError("Unrecognized DataSF response; preserve the last valid release.")
    return rows


def fetch_incidents():
    # 中文：先限制未来日期，再以最新可用事件日为截止，读取含截止日的 365 个日历日。
    # English: Exclude future dates; download 365 calendar days ending at the latest available date.
    today = datetime.now(ZoneInfo("America/Los_Angeles")).strftime("%Y-%m-%d")
    latest = str(query_rows(f"SELECT max(incident_datetime) AS latest WHERE incident_datetime <= '{today}T23:59:59'",size=1)[0]["latest"])[:10]
    start = (datetime.strptime(latest,"%Y-%m-%d")-timedelta(days=364)).strftime("%Y-%m-%d")
    where = f"incident_datetime >= '{start}T00:00:00' AND incident_datetime <= '{latest}T23:59:59'"
    expected = int(query_rows(f"SELECT count(*) AS n WHERE {where}",size=1)[0]["n"])
    rows = []
    fields = "incident_id,row_id,incident_datetime,report_datetime,incident_category,latitude,longitude"
    for page in range(1,math.ceil(expected/5000)+1):
        rows.extend(query_rows(f"SELECT {fields} WHERE {where} ORDER BY row_id",page))
    if not rows or len(rows)!=expected:
        raise ValueError(f"Incomplete incident download: expected {expected}, received {len(rows)}.")
    return rows,{"coverage_start":start,"coverage_end":latest,"source_row_count":expected}


def normalize_incidents(rows):
    # 中文：一份报告可有多种事件代码，不能把代码行数当事件数；保留全部类别。
    # English: Multiple offense rows may describe one report. Keep all categories, count the ID once.
    unique = {}
    excluded = 0
    for row in sorted(rows,key=lambda r:(str(r.get("report_datetime") or ""),str(r.get("row_id") or ""))):
        identity = str(row.get("incident_id") or "").strip()
        occurred = str(row.get("incident_datetime") or "")[:19]
        try:
            datetime.fromisoformat(occurred)
            lat,lon = float(row["latitude"]),float(row["longitude"])
            if not identity or not (37.68<=lat<=37.84 and -122.55<=lon<=-122.33):
                raise ValueError("Unusable report ID or position")
        except (ValueError,TypeError,KeyError):
            excluded+=1
            continue
        categories = unique.get(identity,{}).get("categories",set())
        categories.add(str(row.get("incident_category") or "Unknown / not stated"))
        unique[identity] = {"incident_id":identity,"datetime":occurred,"lat":round(lat,7),
                            "lon":round(lon,7),"categories":categories}
    incidents = sorted(unique.values(),key=lambda row:(row["datetime"],row["incident_id"]))
    for row in incidents:
        row["categories"] = sorted(row["categories"])
    return incidents,{"excluded_row_count":excluded,"merged_row_count":len(rows)-excluded-len(incidents)}


def project(lat,lon):
    return ((lon+122.45)*111195*math.cos(math.radians(37.76)),(lat-37.76)*111195)


def build_payload(rows,metadata,network):
    incidents,quality = normalize_incidents(rows)
    if not incidents:
        raise ValueError("No usable incident history; preserve last valid release.")
    stops = {}
    for pattern in (network.get("patterns") or network.get("route_directions") or {}).values():
        for row in pattern.get("stops",[]):
            try:
                lat,lon = float(row["lat"]),float(row["lon"])
                stop_id = str(row["stop_id"])
                if not stop_id or not (37.68<=lat<=37.84 and -122.55<=lon<=-122.33):
                    continue
            except (KeyError,TypeError,ValueError):
                continue
            stop = stops.setdefault(stop_id,{"stop_id":stop_id,"name":str(row.get("name") or row.get("stop_name") or stop_id),"lat":lat,"lon":lon,"routes":set()})
            stop["routes"].add(str(pattern["route_id"]))
    stops = sorted(stops.values(),key=lambda row:row["stop_id"])
    if not stops:
        raise ValueError("No usable GTFS stop catalog.")
    for stop in stops:
        stop["routes"] = sorted(stop["routes"])
    locations = sorted({(row["lat"],row["lon"]) for row in incidents})
    location_ids = {point:i for i,point in enumerate(locations)}
    categories = sorted({category for row in incidents for category in row["categories"]})
    category_ids = {name:i for i,name in enumerate(categories)}
    # 中文：路口坐标与站点算近似直线距离；同一路口的事件共用位置索引，避免重复存匹配。
    # English: Approximate straight-line intersection-to-stop distance; reuse matches per location.
    grid = defaultdict(list)
    for i,point in enumerate(locations):
        x,y=project(*point)
        grid[(math.floor(x/400),math.floor(y/400))].append((i,x,y))
    matches = []
    for i,stop in enumerate(stops):
        x,y=project(stop["lat"],stop["lon"])
        gx,gy=math.floor(x/400),math.floor(y/400)
        for a in range(gx-1,gx+2):
            for b in range(gy-1,gy+2):
                for location,px,py in grid.get((a,b),[]):
                    distance=math.hypot(x-px,y-py)
                    if distance<=400:
                        matches.append([i,location,round(distance,2)])
    packed = [[row["incident_id"],row["datetime"][:16],location_ids[(row["lat"],row["lon"])],
               [category_ids[name] for name in row["categories"]]] for row in incidents]
    return {"schema_version":1,"status":"available","generated_at":datetime.now(timezone.utc).isoformat(),
            "source_url":SOURCE,**metadata,"quality":quality,"timezone":"America/Los_Angeles",
            "geometry_as_of":network.get("meta",{}).get("feed_version"),
            "methodology":{"incident_columns":["incident_id","local_datetime","location_index","category_indices"],
                "match_columns":["stop_index","location_index","approximate_distance_m"],
                "day_hours":"06:00–17:59; night 18:00–05:59, SF local clock, not daylight",
                "location":"Anonymous nearby intersections, not exact incident positions",
                "update":"Daily check; retain valid history on failure; not a live alert feed"},
            "routes":network.get("routes",[]),"stops":stops,"locations":locations,
            "categories":categories,"incidents":packed,"matches":matches}


def write_outputs(payload,public_path,zip_path):
    def csv_text(rows,columns):
        stream=io.StringIO(newline="")
        writer=csv.DictWriter(stream,fieldnames=columns);writer.writeheader();writer.writerows(rows)
        return stream.getvalue()
    events=[]
    category_rows=[]
    for identity,occurred,location,categories in payload["incidents"]:
        lat,lon=payload["locations"][location]
        events.append({"incident_id":identity,"incident_datetime_sf":occurred,"latitude":lat,"longitude":lon,
                       "location_index":location,"period":"day" if 6<=int(occurred[11:13])<18 else "night","source_url":SOURCE})
        category_rows.extend({"incident_id":identity,"incident_category":payload["categories"][i]} for i in categories)
    matches=[{"stop_id":payload["stops"][stop]["stop_id"],"location_index":location,"approximate_distance_m":distance} for stop,location,distance in payload["matches"]]
    stops=[{**stop,"routes":"|".join(stop["routes"])} for stop in payload["stops"]]
    zip_path.parent.mkdir(parents=True,exist_ok=True)
    temp=zip_path.with_suffix(".tmp")
    with zipfile.ZipFile(temp,"w",zipfile.ZIP_DEFLATED) as archive:
        for name,rows in [("incidents",events),("incident_categories",category_rows),("stop_location_matches",matches),("stops",stops)]:
            archive.writestr(f"feature8_{name}.csv",csv_text(rows,list(rows[0]) if rows else []))
        archive.writestr("README.md",f"# Feature 8 / 历史事件背景\n\n{SOURCE}\n{payload['coverage_start']} – {payload['coverage_end']}\n\nCount distinct incident_id. One report can have multiple categories and overlap multiple stops. Category and stop totals cannot be added. Match incidents and stop_location_matches by location_index; relate categories by incident_id.\n事故编号用 COUNTD(incident_id)。一份报告可有多种类别、匹配多个站点，类别与站点数量不能直接相加。事件与站点匹配表用 location_index 关联，类别用 incident_id 关联。\n\nLocations are anonymous nearby intersections, not exact addresses. Day is 06:00–17:59 SF local clock; night is 18:00–05:59. Partial months cannot be compared directly with full months. Report history is not a personal risk prediction.\n位置为匿名化附近路口，并非精确地址；白天为旧金山当地06:00–17:59，夜间为18:00–05:59。不完整月份不能直接与完整月份比较。历史报告不预测个人风险。\n")
    temp.replace(zip_path)
    public_path.parent.mkdir(parents=True,exist_ok=True)
    temp=public_path.with_suffix(".tmp")
    temp.write_text(json.dumps(payload,ensure_ascii=False,separators=(",",":"))+"\n",encoding="utf-8")
    temp.replace(public_path)


def main():
    rows,metadata=fetch_incidents()
    public=ROOT/"site/data/incident-environment.json"
    if public.exists() and metadata["coverage_end"]<json.loads(public.read_text())["coverage_end"]:
        raise ValueError("Source coverage regressed; retain the latest valid history.")
    network=json.loads((ROOT/"site/data/network.json").read_text())
    payload=build_payload(rows,metadata,network)
    write_outputs(payload,public,ROOT/"site/data/tableau/feature8_incident_environment.zip")
    print(json.dumps({**metadata,"unique_incidents":len(payload["incidents"]),"locations":len(payload["locations"]),"stop_matches":len(payload["matches"])}))


if __name__=="__main__":
    main()
