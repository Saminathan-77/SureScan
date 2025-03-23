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
import torch
import torch.nn as nn
import torchvision.models as models
import torchvision.transforms as transforms
from PIL import Image
import numpy as np
import torch
from ultralytics import YOLO

# Load YOLOv11 model
yolo_model_path = "yolov11_finetuned.pt"

try:
    yolo_model = YOLO(yolo_model_path)  # Load YOLO model
    yolo_model.to('cuda' if torch.cuda.is_available() else 'cpu')  # Move to GPU if available
    print("YOLOv11 model loaded successfully!")
except Exception as e:
    yolo_model = None
    print(f"Error loading YOLOv11 model: {e}")



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

# --------------------- BRAIN TUMOR IMAGE CLASSIFICATION MODEL ---------------------

# Define the brain tumor classification model
class BrainTumorEfficientNet(nn.Module):
    def __init__(self, num_classes=44):
        super(BrainTumorEfficientNet, self).__init__()
        
        self.base_model = models.efficientnet_b3(weights=models.EfficientNet_B3_Weights.IMAGENET1K_V1)
        self.base_model.classifier = nn.Identity() 
        
        self.classifier = nn.Sequential(
            nn.BatchNorm1d(1536),
            nn.Linear(1536, 256, bias=True),
            nn.ReLU(),
            nn.Dropout(0.45),
            nn.Linear(256, num_classes),
            nn.LogSoftmax(dim=1) 
        )

    def forward(self, x):
        x = self.base_model(x)
        x = self.classifier(x)
        return x

# Load the classification model
def load_classification_model(model_path="brain_tumor_model.pth_epoch20.pth"):
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model = BrainTumorEfficientNet(num_classes=44)
    model.load_state_dict(torch.load(model_path, map_location=device))
    model.to(device)
    model.eval()
    return model

# Define class names for the classification model
# Replace these with your actual class names
class_names = [
    'Astrocitoma T1', 'Astrocitoma T1C+', 'Astrocitoma T2', 'Carcinoma T1', 'Carcinoma T1C+', 
    'Carcinoma T2', 'Ependimoma T1', 'Ependimoma T1C+', 'Ependimoma T2', 'Ganglioglioma T1', 
    'Ganglioglioma T1C+', 'Ganglioglioma T2', 'Germinoma T1', 'Germinoma T1C+', 'Germinoma T2', 
    'Glioblastoma T1', 'Glioblastoma T1C+', 'Glioblastoma T2', 'Granuloma T1', 'Granuloma T1C+', 
    'Granuloma T2', 'Meduloblastoma T1', 'Meduloblastoma T1C+', 'Meduloblastoma T2', 'Meningioma T1', 
    'Meningioma T1C+', 'Meningioma T2', 'Neurocitoma T1', 'Neurocitoma T1C+', 'Neurocitoma T2', 
    'Oligodendroglioma T1', 'Oligodendroglioma T1C+', 'Oligodendroglioma T2', 'Papiloma T1', 'Papiloma T1C+', 
    'Papiloma T2', 'Schwannoma T1', 'Schwannoma T1C+', 'Schwannoma T2', 'Tuberculoma T1', 'Tuberculoma T1C+', 
    'Tuberculoma T2', '_NORMAL T1', '_NORMAL T2'
]

# Initialize the classification model
try:
    classification_model = load_classification_model()
    print("Brain tumor classification model loaded successfully")
except Exception as e:
    print(f"Error loading classification model: {str(e)}")
    classification_model = None

# Define the transformation for input images
transform = transforms.Compose([
    transforms.Resize((128, 128)),
    transforms.ToTensor(),
])

# --------------------- API ENDPOINTS ---------------------

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

# Load the saved objects for survival prediction
encoders = joblib.load('encoders.pkl')       # Dictionary of LabelEncoders
scaler = joblib.load('scaler.pkl')           # StandardScaler fitted on training features
model = joblib.load('xgb_model.pkl')         # Trained XGBoost model

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

# New endpoint for brain tumor image classification
@app.post("/classification")
async def classify_image(file: UploadFile = File(...)):
    # Check if models are loaded
    if classification_model is None:
        raise HTTPException(status_code=503, detail="Classification model is not available")
    
    if yolo_model is None:
        raise HTTPException(status_code=503, detail="YOLOv11 model is not available")
    
    # Validate file
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File provided is not an image")
    
    # Process the image
    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert("RGB")
        
        # Get original image dimensions for scaling
        original_width, original_height = image.size
        image_dimensions = {"width": original_width, "height": original_height}

        # Classification processing
        image_tensor = transform(image)
        image_tensor = image_tensor.unsqueeze(0)  # Add batch dimension
        
        # Get the device
        device = next(classification_model.parameters()).device
        image_tensor = image_tensor.to(device)
        
        # Get classification prediction
        with torch.no_grad():
            outputs = classification_model(image_tensor)
            probabilities = torch.exp(outputs)
            
            # Get top prediction
            top_prob, top_class = torch.max(probabilities, 1)
            top_class_id = top_class.item()
            top_class_name = class_names[top_class_id]
            top_prob_value = top_prob.item()
            
            # Get top 5 predictions
            top_5_probs, top_5_indices = torch.topk(probabilities, 5, dim=1)
            top_5_probs = top_5_probs.squeeze().tolist()
            top_5_indices = top_5_indices.squeeze().tolist()
            
            # Convert to list if only one result
            if not isinstance(top_5_probs, list):
                top_5_probs = [top_5_probs]
                top_5_indices = [top_5_indices]
            
            top_5_results = [
                {"class_id": idx, "class_name": class_names[idx], "confidence": float(prob)}
                for idx, prob in zip(top_5_indices, top_5_probs)
            ]

        # YOLOv11 bounding box detection
        np_image = np.array(image)
        yolo_results = yolo_model(np_image, conf=0.3)
        
        # Format the bounding box results
        bounding_boxes = []
        if hasattr(yolo_results, 'xyxy') and len(yolo_results.xyxy) > 0:
            for detection in yolo_results.xyxy[0].cpu().numpy():
                x1, y1, x2, y2, confidence, class_id = detection
                bounding_boxes.append({
                    "normalized": {
                        "x1": float(x1) / original_width,
                        "y1": float(y1) / original_height,
                        "x2": float(x2) / original_width,
                        "y2": float(y2) / original_height,
                        "confidence": float(confidence),
                        "class_id": int(class_id)
                    },
                    "pixels": {
                        "x1": int(x1),
                        "y1": int(y1),
                        "x2": int(x2),
                        "y2": int(y2),
                        "confidence": float(confidence),
                        "class_id": int(class_id)
                    }
                })

        # Format the response to match the frontend expectations
        print(image_dimensions)
        return {
            "classification": {
                "class_id": top_class_id,
                "class_name": top_class_name,
                "confidence": top_prob_value,
                "top_predictions": top_5_results
            },
            "tumor_detection": {
                "bounding_boxes": bounding_boxes
            },
            "image_dimensions": image_dimensions
        }
    
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@app.get("/health")
def health_check():
    models_status = {
        "survival_prediction": "loaded" if model is not None else "not loaded",
        "classification": "loaded" if classification_model is not None else "not loaded",
        "gemini": "configured" if API_KEY is not None else "not configured"
    }
    
    return {
        "status": "ok", 
        "models": models_status
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)