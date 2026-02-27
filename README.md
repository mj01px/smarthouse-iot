# SmartHome Presence Simulator --- Real-Time IoT Simulation

![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![WebSocket](https://img.shields.io/badge/WebSocket-4A4A4A?style=for-the-badge&logo=websocket&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)

A real-time IoT simulation designed to replicate **presence detection
and intelligent lighting control** inside a residential environment
using a 2D interactive map.

This project focuses on **WebSocket communication, real-time state
management, collision systems, and realistic lighting transitions** ---
without requiring physical hardware.
 
------------------------------------------------------------------------

## 📜 Overview

This project demonstrates a **complete real-time simulation workflow**:

-   WebSocket-based bidirectional communication\
-   Presence detection per room\
-   Intelligent light activation logic\
-   Crossfade lighting transitions with blur and delay\
-   Collision detection system\
-   Real-time rendering with HTML5 Canvas

Designed to be modular, scalable, and extensible.

------------------------------------------------------------------------

## Objectives

-   Simulate PIR-like motion detection\
-   Trigger light activation per detected room\
-   Avoid event flooding via state comparison\
-   Implement smooth lighting transitions (fade + crossfade)\
-   Separate frontend simulation logic from backend automation control

------------------------------------------------------------------------

## Simulation Model

The system operates in three main layers:

### 1. Frontend (Environment Simulation)

-   2D floor plan (fixed resolution)
-   Player movement (WASD)
-   Wall collision detection
-   Room detection via coordinate zones
-   Lighting rendering using Canvas overlay

### 2. Communication Layer

-   Persistent WebSocket connection

-   Event sent only when room changes:

    { "type": "MOTION_DETECTED", "roomId": "living_room" }

-   Backend returns commands:

    -   TURN_ON
    -   TURN_OFF

### 3. Backend (Automation Logic)

-   Maintains active room state
-   Logs entry and exit timestamps
-   Prevents redundant commands
-   Simulates smart lighting behavior

------------------------------------------------------------------------

## ⚙️ Technical Architecture

### Lighting Engine

-   Dark overlay layer
-   `globalCompositeOperation = "destination-out"`
-   Radial gradient per room
-   Blur filters
-   Delta-time interpolation
-   Crossfade transitions

### Collision System

-   Axis-based movement blocking
-   Rectangle overlap detection
-   Safe spawn validation
-   Pixel-based hitbox logic



------------------------------------------------------------------------

## Run & Test

### 1. Create virtual environment

python -m venv .venv

### 2. Activate

Windows: .venv`\Scripts`{=tex}`\activate`{=tex}

Mac/Linux: source .venv/bin/activate

### 3. Install dependencies

pip install -r requirements.txt

### 4. Start server

uvicorn backend.main:app --reload

Access:

http://127.0.0.1:8000

------------------------------------------------------------------------

## Controls

  Key       Action
  --------- -------------------------
  W A S D   Move character
  H         Toggle debug mode
  C         Enable calibration mode

Calibration mode allows drawing rectangles to obtain pixel coordinates
for room and wall configuration.

------------------------------------------------------------------------

## 📊 System Behavior

-   Entry into a room triggers a motion event\
-   Backend registers entry timestamp\
-   Leaving a room registers exit timestamp\
-   Lights fade in/out with configurable delay\
-   Crossfade prevents abrupt transitions

------------------------------------------------------------------------

## Insights

-   Event-based architecture prevents flooding\
-   Crossfade improves realism over sequential transitions\
-   Real-time state synchronization via WebSockets is highly efficient\
-   Separation of simulation and automation logic improves scalability

------------------------------------------------------------------------

## Tech Stack

-   Python 3.10+\
-   FastAPI\
-   Uvicorn\
-   HTML5 Canvas\
-   JavaScript (Vanilla)\
-   CSS Modern UI

------------------------------------------------------------------------

## 👤 Author

**Mauro Junior** / **Julio Franz**

Software Engineering Student

------------------------------------------------------------------------


