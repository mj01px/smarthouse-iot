[![Typing SVG](https://readme-typing-svg.herokuapp.com?font=Fira+Code&weight=600&size=30&pause=1000&color=FFFFFF&center=true&vCenter=true&width=500&lines=SmartHome+IoT;Presence.+Detection.+Light.)](https://git.io/typing-svg)

&nbsp;

![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white)
![WebSocket](https://img.shields.io/badge/WebSocket-4A4A4A?style=flat-square&logo=websocket&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)
![license](https://img.shields.io/badge/license-MIT-green?style=flat-square)

&nbsp;

---

## `~/about`

```ts
const smarthouseIot = {
  type:     "Real-Time IoT Simulation",
  stack:    ["Python", "FastAPI", "WebSocket", "HTML5 Canvas", "JavaScript"],
  features: ["Presence detection", "Smart lighting", "Collision system", "Crossfade transitions"],
  authors:  ["Mauro Junior · github.com/mj01px", "Julio Franz · github.com/JulioFranz"],
} as const;
```

**SmartHome IoT** is a real-time simulation of presence detection and intelligent lighting control inside a residential environment — rendered as a 2D interactive floor plan. No physical hardware required.

The player moves through rooms using the keyboard. Each room transition fires a WebSocket event to the backend, which responds with commands to turn lights on or off — with smooth crossfade transitions rendered on an HTML5 Canvas overlay.

```
smarthouse-iot/
├── backend/
│   └── main.py        # FastAPI app — WebSocket logic and automation
├── static/
│   ├── index.html     # 2D floor plan and canvas rendering
│   ├── game.js        # Player movement, collision, room detection
│   └── lighting.js    # Lighting engine and crossfade transitions
├── requirements.txt
└── README.md
```

---

## `~/features`

|  |  |
|---|---|
| **🏠 Simulation** <br><br> • 2D floor plan (fixed resolution) <br> • WASD player movement <br> • Wall collision detection <br> • Room detection via coordinate zones | **💡 Lighting Engine** <br><br> • Dark overlay with `globalCompositeOperation` <br> • Radial gradient per room <br> • Delta-time interpolation <br> • Crossfade transitions with blur + delay |
| **🔌 Communication** <br><br> • Persistent WebSocket connection <br> • Events fired only on room change <br> • Prevents redundant commands <br> • Logs entry and exit timestamps | **🛠️ Debug Tools** <br><br> • `H` — toggle debug mode <br> • `C` — calibration mode (draw hitboxes) <br> • Pixel-based coordinate output <br> • Safe spawn validation |

---

## `~/protocol`

**Frontend → Backend** (on room change):
```json
{ "type": "MOTION_DETECTED", "roomId": "living_room" }
```

**Backend → Frontend** (automation response):
```json
{ "command": "TURN_ON", "roomId": "living_room" }
{ "command": "TURN_OFF", "roomId": "kitchen" }
```

---

## `~/getting-started`

```bash
python -m venv .venv
.venv\Scripts\activate          # Windows
source .venv/bin/activate       # Linux / macOS

pip install -r requirements.txt
uvicorn backend.main:app --reload
```

Access → [http://127.0.0.1:8000](http://127.0.0.1:8000)

---

## `~/controls`

| Key | Action |
|---|---|
| `W` `A` `S` `D` | Move character |
| `H` | Toggle debug mode |
| `C` | Enable calibration mode |

> Calibration mode lets you draw rectangles to capture pixel coordinates for room and wall configuration.

---

## `~/stack`

| Layer | Technologies |
|---|---|
| **API** | ![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white) ![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white) ![Uvicorn](https://img.shields.io/badge/Uvicorn-4A4A4A?style=flat-square&logoColor=white) |
| **Frontend** | ![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white) ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black) ![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white) |
| **Protocol** | ![WebSocket](https://img.shields.io/badge/WebSocket-4A4A4A?style=flat-square&logoColor=white) |

---

Built by [**Mauro Junior**](https://github.com/mj01px) · [LinkedIn](https://www.linkedin.com/in/mauroapjunior/)
&nbsp;&nbsp;·&nbsp;&nbsp;
[**Julio Franz**](https://github.com/JulioFranz)
