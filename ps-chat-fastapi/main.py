from fastapi import Response, status
from fastapi.responses import RedirectResponse
from datetime import datetime

from app import Application, User, Message

app = Application()


@app.api.get("/", status_code=308)
async def root():
    return RedirectResponse(url="/docs")


@app.api.post("/login", status_code=200)
async def login(body: User, response: Response):
    if app.manager.add_user(body):
        return {"response": "Connected"}
    response.status_code = status.HTTP_400_BAD_REQUEST
    return {"response": "Choose another login"}


@app.api.get("/chat", status_code=200)
async def chat_history():
    return app.history.get_messages()


@app.api.post("/chat", status_code=201)
async def send(body: Message, response: Response):
    body.time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    if app.history.add_message(body):
        return {"response": "Delivered"}
    response.status_code = status.HTTP_400_BAD_REQUEST
    return {"response": "Not delivered"}


@app.api.delete("/chat", status_code=201)
async def delete(body: Message, response: Response):
    raise NotImplementedError
    pass


# start
if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app.api, host="0.0.0.0", port=8000)
