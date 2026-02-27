from pathlib import Path
from datetime import datetime
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

app = FastAPI()

ROOT = Path(__file__).resolve().parent.parent
STATIC_DIR = ROOT / "static"

app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

@app.get("/")
def root():
    return FileResponse(STATIC_DIR / "index.html")


def now_str() -> str:
    return datetime.now().strftime("%H:%M")


@app.websocket("/ws")
async def websocket_endpoint(ws: WebSocket):
    await ws.accept()
    print("WS client connected")

    active_room: str | None = None

    try:
        while True:
            data = await ws.receive_json()

            if data.get("type") != "MOTION_DETECTED":
                continue

            room_id = data.get("roomId")

            # saiu da casa (room_id is None)
            if room_id is None:
                if active_room is not None:
                    print(f"[presence] saída de {active_room} às {now_str()}")
                    # manda comando pra apagar
                    await ws.send_json({
                        "type": "COMMANDS",
                        "commands": [{"type": "TURN_OFF", "roomId": active_room}]
                    })
                    active_room = None
                else:
                    await ws.send_json({"type": "NOOP"})
                continue

            #  entrou em um comodo
            if room_id != active_room:
                commands = []

                # se estava em outro, registra saída
                if active_room is not None:
                    print(f"[presence] saída de {active_room} às {now_str()}")
                    commands.append({"type": "TURN_OFF", "roomId": active_room})

                # registra entrada no novo
                print(f"[presence] movimento em {room_id} às {now_str()}")
                commands.append({"type": "TURN_ON", "roomId": room_id})

                active_room = room_id

                await ws.send_json({"type": "COMMANDS", "commands": commands})
            else:
                # continua no mesmo comodo -> nada acontece
                await ws.send_json({"type": "NOOP"})

    except WebSocketDisconnect:
        print("WS client disconnected")
    except Exception as e:
        print("WS error:", repr(e))
        try:
            await ws.close()
        except:
            pass