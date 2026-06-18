import os, base64, gzip
base = os.path.dirname(os.path.abspath(__file__))
DATA = 'H4sIAJ5DM2oC/2VRPU/DMBTc8ysijxEkEwsTEmKgokJiRRVy4kdr6i/ZLyEoyn/HdmzahMm6u+fzvfNUlCXptDRcgH01yLVy5L6cPO0FpPYI6DEBd0duFlLw1jPvEXjItEzKAmqOYGkr4MKCUzAiifCQXKgQ+nsX3kLbQyLdmZsX3j6eoDtvFLS8C0k+qXCZVPpJclwPgttr1gt4Vj6GNmtRRmnZJ0Za8W/gtOhDBWGi7RXzneQRG8QBdk6rfXa5cuZepQhs0TZrfbkxOBrvAXbIxRCuOgsSFFKxnjeiP/L4D7nlKZ1haSrjBpdKy3JeVWsoni6f6ImHprry8kTdONt5MjGHIpvMwSIEEz2DvzvxrVtQQ81qdDl+VTXVfzhmXIdLDf4YcE0eLVJIAuP2Bc3gQ6bywlgx/wLmHt0amwIAAA=='
dest = os.path.join(base, "tsconfig.json")
with open(dest, "w", encoding="utf-8", newline="\n") as f:
    f.write(gzip.decompress(base64.b64decode(DATA)).decode("utf-8"))
print("tsconfig.json recriado!")
print(open(dest).read())
