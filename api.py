from fastapi import FastAPI, File, UploadFile, Form, HTTPException, Request
from pydantic import BaseModel
import pandas as pd
import joblib
from fastapi.middleware.cors import CORSMiddleware
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

# Define the expected input schema.
class InputData(BaseModel):
    Gender: str
    Tumor_Type: str
    Tumor_Grade: str
    Tumor_Location: str
    Treatment: str
    Treatment_Outcome: str
    Recurrence_Site: str
    Age: float
    Time_to_Recurrence_months: float  # using underscore in API input

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

# Load the saved objects
encoders = joblib.load('encoders.pkl')       # Dictionary of LabelEncoders
scaler = joblib.load('scaler.pkl')             # StandardScaler fitted on training features
model = joblib.load('xgb_model.pkl')           # Trained XGBoost model

# Define the original categorical columns in the order used during training
ordered_categorical = ['Gender', 'Tumor Type', 'Tumor Grade', 'Tumor Location', 'Treatment', 'Treatment Outcome', 'Recurrence Site']

@app.post("/predict")
def predict(input_data: InputData):
    # Convert the input data to a dictionary and then to a DataFrame with a single row.
    data = input_data.dict()
    df_new = pd.DataFrame([data])
    
    # Create a mapping from API field names to original training column names.
    mapping = {
        "Gender": "Gender",
        "Tumor_Type": "Tumor Type",
        "Tumor_Grade": "Tumor Grade",
        "Tumor_Location": "Tumor Location",
        "Treatment": "Treatment",
        "Treatment_Outcome": "Treatment Outcome",
        "Recurrence_Site": "Recurrence Site"
    }
    
    # For each categorical feature, apply the corresponding encoder.
    for orig_col in ordered_categorical:
        # Find the corresponding API key.
        api_key = [k for k, v in mapping.items() if v == orig_col][0]
        df_new[orig_col + '_encoded'] = encoders[orig_col].transform([df_new.loc[0, api_key]])
    
    # Rename the numeric column to match the training data's column name.
    df_new.rename(columns={"Time_to_Recurrence_months": "Time to Recurrence (months)"}, inplace=True)
    
    # Build the feature DataFrame in the exact order as used during training.
    feature_columns = [col + '_encoded' for col in ordered_categorical] + ['Age', 'Time to Recurrence (months)']
    X_new = df_new[feature_columns]
    
    # Scale the features using the saved scaler.
    X_new_scaled = scaler.transform(X_new)
    
    # Generate the prediction using the loaded model.
    prediction = model.predict(X_new_scaled)
    
    # Convert the numpy float32 prediction to a native Python float.
    return {"predicted_survival_time_months": float(prediction[0])}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
