# CodeSensei — Static Code Analysis Backend
# This backend performs ONLY static AST analysis. No code execution ever occurs.
# Run locally: uvicorn main:app --reload --port 8000
# Deploy to Railway: set start command to: uvicorn main:app --host 0.0.0.0 --port $PORT

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List

from ast_analyser import analyse_code

app = FastAPI(title="CodeSensei AST Backend", version="2.0.0")

# Tighten CORS origins in production — * is fine for hackathon demo
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


class AnalyseRequest(BaseModel):
    code: str
    description: str = ""  # optional context from student, default empty


@app.post("/analyse")
def analyse(req: AnalyseRequest):
    ast_data, issues = analyse_code(req.code)
    return {
        "ast_data": ast_data,
        "static_issues": issues,
        "code_length": len(req.code.split("\n")),
    }


@app.get("/health")
def health():
    return {"status": "ok", "mode": "static-analysis-only"}
