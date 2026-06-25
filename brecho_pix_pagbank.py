import os, base64, gzip, re
base = os.path.dirname(os.path.abspath(__file__))
FILES = [
  ('src\\\\app\\\\api\\\\pix\\\\route.ts', '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'),
  ('src\\\\app\\\\api\\\\webhook\\\\pagbank-pix\\\\route.ts', 'H4sIAACAPWoC/61W3W7bNhS+91OcYQMkFY7sm90I6Aa0y4AA3RIswVagKBRaoh0uEqmQlGvDFbCbvcEud98H2Zv0SXYoUhIVK0kXDDAgi/zOD7/znUOxshJSwwF+pjv9C72rqdJz96IqwRWFBtZSlBBwXFwoKrdUBjPW2WWSEk0v2+XXBaNc9wZxvOh/BVstVF2RFVH0pHMyo7vWS4ZxNOR7TkqWwUsI1kJm9MQtDDii9jyDdc0zzQSHi/PLq1DSu8RPPoLDDEDLffsE57sLjc6PEw4jD7kS+R5R5ANhGtB5/LsSHBEepGK7NwyfL1twjK/tJltD+JXb+z4uKN/omwhd6FryEaPW5QHEbYKJ1siwc4/HhrCPAWLdhYrcYboM9I7lGB53Y/PX7bUJmPfIwDTjNZ25rcUCXtUqI1DRnOUCH4UAz9S6PUBONEk6UNPz0NHn0ACxqXAYWKBKBS8Yp0E07Cta0EyHwYs5ME25Si3UIcMXkQ+md2FQVmlF9iWWI2V5MG+T8/0xviloV4eObJvnx48u45hxTTeSYJxS5KgWpWk5ScZrwddMlsgH2RATVLi95563rpA6Gh76FQClia5VAkEfIyWVFFtML5h7uKmkrTAGVHOPrZai7tB55JeZsB0BbASB7eCWPV1hMcpWWM72uDaGznfvB8UdiUOKvNaPqmPgy2KVx5SnDZbPu0RTpIoUY1h/TpNz7FylviomdNEpw6KPa9+dhoutOLWx8Rw/EX0Tl2QXLufd+eJRZnBis7irCfrLSU6HLJ5HQieYMQPJKLHmC/l4IBUXvxRbZuRHMkFV6sIFETYLzmE9kuzgNLkfxVesZpVAXSuCTIykPNCT3OfLh5VCs63x8CvlOYFzq7uLs7cjZ2Jl7gmSEUReX9hW//qbg1Mur0sqRQOf//jLWMIF2bwi/BYQgFMR/V6JU56f5c2177MnG3tOMiGT6XJPmVRCdTZejSZatPG68Q3h/3wiaABrxgnPKJPTk8bVakBNFcjxLikitM98hlLaCMlIx6maJjWnKpPMMmq5N9RNk9ovZu0lSVMuSuqzuSVFS6BFaaHbNgnd+xovvnaWLCMvPk6QtMAT2nmITNIP8IPpgwgdnF2eX2qJDR3eN8lEWaE7npkTPmQTq6pgOFaugujd8v3gAadfSdJ+CJuBzHYeKf2cztylMJrPIxWeOlklj8isGd1RIza+QzK8ufoMBTyigbEKfjQBR7t+7dvd6dqP2mVc4vYQI5f/vZz/R0GfLulTRT3uVXMriILGhdiE15///rMlZ7AFgjOiJJrZo1I7dh6YSdfWu/P9hR+AiDcFzG4gpFJG3terSQuXhAyD3+jqRojbNjmzlOBtYNBPBWrNkYxTfAbQzPEy7wj6drl04WfN7F+0jKeMDgwAAA=='),
]
ok = 0
for rel, data in FILES:
    try:
        dest = os.path.join(base, rel)
        os.makedirs(os.path.dirname(dest), exist_ok=True)
        with open(dest, "w", encoding="utf-8", newline="\n") as f:
            f.write(gzip.decompress(base64.b64decode(data)).decode("utf-8"))
        # Fix paths
        with open(dest, "r", encoding="utf-8") as f:
            c = f.read()
        depth = rel.count("/") - 1
        path = "../" * depth + "lib/supabase-server"
        c = re.sub(r"from '[./]+lib/supabase-server'", f"from '{path}'", c)
        with open(dest, "w", encoding="utf-8", newline="\n") as f:
            f.write(c)
        print("OK:", rel)
        ok += 1
    except Exception as e:
        print("ERRO:", rel, e)

# Adiciona variaveis no .env.local
env_fp = os.path.join(base, ".env.local")
with open(env_fp, "r", encoding="utf-8") as f:
    env = f.read()
TOKEN = '7cb817da-2166-4c9f-82ef-76da7b64a9cbf2a11b594071a17beb2293bb2814fa3a6b1b-56ed-4b51-be7e-bba3dde194c7'
if "PAGBANK_TOKEN" not in env:
    env += f"\nPAGBANK_TOKEN={TOKEN}\nPAGBANK_ENV=sandbox\n"
    with open(env_fp, "w", encoding="utf-8") as f:
        f.write(env)
    print("OK: PAGBANK_TOKEN adicionado no .env.local (sandbox)")
else:
    print("OK: PAGBANK_TOKEN ja existe")

print(f"\nTotal: {ok}/2 arquivos instalados")
print("PIX PagBank configurado em modo SANDBOX!")
print("Webhook URL: https://brechodluxo.com.br/api/webhook/pagbank-pix")
print("Rode: npm run build")