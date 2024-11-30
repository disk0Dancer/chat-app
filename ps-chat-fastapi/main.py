from fastapi import WebSocket, WebSocketDisconnect

from datetime import datetime
import json

from app import Application

app = Application()

@app.api.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: int):
    await app.manager.connect(websocket)
    now = datetime.now()
    current_time = now.strftime("%H:%M")
    try:
        while True:
            data = await websocket.receive_json() 
            
            if "login" in data and data["login"] not in app.manager.users.values():
                app.manager.users[client_id] = data["login"]
                message = {
                    "time": current_time,
                    "clientId": client_id,
                    "message": "Online",
                    "login": app.manager.users[client_id],
                }
                await app.manager.broadcast(json.dumps(message))
                continue
            
            if "message" in data:
            
                # await app.manager.send_personal_message(f"You wrote: {data}", websocket)
                message = {
                    "time": current_time,
                    "clientId": client_id,
                    "message": data["message"], 
                    "login": app.manager.users[client_id],
                }
                await app.manager.broadcast(json.dumps(message))

    except WebSocketDisconnect:
        app.manager.disconnect(websocket)
        message = {
            "time": current_time,
            "clientId": client_id,
            "message": "Offline",
            "login": app.manager.users[client_id],
        }
        app.manager.users.pop(client_id)
        await app.manager.broadcast(json.dumps(message))

# start
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app.api, host="0.0.0.0", port=8000)
