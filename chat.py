# api/main.py
from fastapi import FastAPI, File, UploadFile, Form, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai
from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings
from langchain_community.vectorstores import Chroma
from langchain.chains import RetrievalQA
import pdfplumber
from langchain.text_splitter import RecursiveCharacterTextSplitter
import os
from dotenv import load_dotenv
import io
import asyncio
from typing import Dict

# Load API key from environment
load_dotenv()
API_KEY = os.getenv("API_KEY")

# Configure Google Generative AI
genai.configure(api_key=API_KEY)

app = FastAPI()

# Add CORS middleware to allow requests from your React app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update this with your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage for user sessions
user_sessions: Dict[str, any] = {}

# Function to extract text from PDF
def extract_pdf_text(pdf_bytes):
    pages = []
    with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
        for page in pdf.pages:
            text = page.extract_text()
            if text:
                pages.append(text)
    return "\n\n".join(pages)

# Function to split the text into chunks for embeddings
def split_text(text, chunk_size=5000, chunk_overlap=500):
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size, 
        chunk_overlap=chunk_overlap
    )
    return text_splitter.split_text(text)

# Function to create the vector store
def create_vector_store(texts):
    embeddings = GoogleGenerativeAIEmbeddings(
        model="models/embedding-001", 
        google_api_key=API_KEY
    )
    vector_index = Chroma.from_texts(texts, embeddings).as_retriever(
        search_kwargs={"k": 3}
    )
    return vector_index

# Function to set up the QA chain
def setup_qa_chain(vector_index):
    model = ChatGoogleGenerativeAI(
        model="gemini-1.5-flash-latest", 
        google_api_key=API_KEY,
        temperature=0.2, 
        convert_system_message_to_human=True
    )
    qa_chain = RetrievalQA.from_chain_type(
        model,
        retriever=vector_index,
        return_source_documents=True
    )
    return qa_chain

class QuestionRequest(BaseModel):
    question: str
    session_id: str = "default"

@app.post("/api/process-pdf")
async def process_pdf(file: UploadFile = File(...), session_id: str = Form("default")):
    try:
        # Read file content
        file_bytes = await file.read()
        
        # Process the PDF
        context = extract_pdf_text(file_bytes)
        if not context:
            raise HTTPException(status_code=400, detail="Could not extract text from the PDF")
        
        texts = split_text(context)
        vector_index = create_vector_store(texts)
        qa_chain = setup_qa_chain(vector_index)
        
        # Store in user session
        user_sessions[session_id] = {
            "vector_index": vector_index,
            "qa_chain": qa_chain,
            "filename": file.filename
        }
        
        return {"success": True, "message": f"Processed file: {file.filename}"}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")

@app.post("/api/answer-question")
async def answer_question(request: QuestionRequest):
    session_id = request.session_id
    
    # If no document has been uploaded, use the default AI model
    if session_id not in user_sessions:
        try:
            model = genai.GenerativeModel("gemini-1.5-flash-latest")
            response = model.generate_content(
                f"Medical question: {request.question}\n\nPlease provide a helpful, accurate, and concise response."
            )
            return {"answer": response.text}
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error generating response: {str(e)}")
    
    # Use the QA chain for document-based questions
    try:
        qa_chain = user_sessions[session_id]["qa_chain"]
        result = qa_chain({"query": request.question})
        return {"answer": result["result"]}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error answering question: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)