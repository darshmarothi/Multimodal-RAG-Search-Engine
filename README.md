# Multimodal RAG Search Engine

A **Multimodal Retrieval Augmented Generation (RAG) system** that enables semantic search and question answering over **PDF documents and images**.
The system retrieves relevant document chunks using vector similarity and generates grounded answers using a Large Language Model (LLM).

This project demonstrates an **end-to-end AI document intelligence pipeline**, including document ingestion, OCR, embedding generation, vector search, and LLM-based answer generation.

---

# Overview

Organizations store large amounts of **unstructured data** such as PDFs, scanned documents, reports, and images. Traditional keyword search cannot understand context or answer questions.

This project solves that problem by building a **RAG-based search engine** that:

* Extracts text from PDFs and images
* Converts document content into embeddings
* Stores embeddings in a vector database
* Retrieves relevant information based on semantic similarity
* Uses an LLM to generate answers grounded in retrieved evidence

---

# System Architecture

User Query
↓
Query Embedding
↓
Vector Database Search (FAISS / Pinecone)
↓
Retrieve Relevant Document Chunks
↓
LLM Answer Generation
↓
Final Response with Context

---

# Features

* Multimodal document ingestion (PDF + Images)
* OCR-based text extraction
* Recursive document chunking
* Semantic search using vector embeddings
* Retrieval Augmented Generation (RAG)
* Context-grounded answers
* Interactive frontend for document querying

---

# Tech Stack

Backend

* Python
* LangChain
* Sentence Transformers

Frontend

* Next.js

Vector Database

* FAISS / Pinecone

AI Components

* LLM (OpenAI / Local models)
* Embedding Models

Document Processing

* PyPDF
* Tesseract OCR

---

# Project Structure

```
multimodal-rag-search/
│
├── backend
│   ├── ingestion.py
│   ├── embeddings.py
│   ├── vector_store.py
│   ├── rag_pipeline.py
│   └── ocr_processing.py
│
├── frontend
│   └── nextjs_app
│
├── data
│   └── sample_documents
│
├── requirements.txt
└── README.md
```

---

# Installation

Clone the repository

```
git clone https://github.com/yourusername/multimodal-rag-search.git
cd multimodal-rag-search
```

Install dependencies

```
pip install -r requirements.txt
```

---

# Running the Backend

Start the document processing and RAG pipeline:

```
python rag_pipeline.py
```

---

# Running the Frontend

Navigate to the frontend directory:

```
cd frontend
npm install
npm run dev
```

The application will run at:

```
http://localhost:3000
```

---

# Document Ingestion Pipeline

The system processes documents using the following steps:

1. Upload PDF or image
2. Extract text using PDF parsers or OCR
3. Split text into smaller chunks
4. Convert chunks into embeddings
5. Store embeddings in a vector database

Example code for document loading:

```
from langchain.document_loaders import PyPDFLoader

loader = PyPDFLoader("sample.pdf")
documents = loader.load()
```

---

# OCR Processing

Images containing text are converted into machine-readable format using OCR.

Example:

```
import pytesseract
from PIL import Image

text = pytesseract.image_to_string(Image.open("invoice.png"))
```

---

# Document Chunking

Documents are split into smaller segments to improve retrieval quality.

Example:

```
from langchain.text_splitter import RecursiveCharacterTextSplitter

splitter = RecursiveCharacterTextSplitter(
    chunk_size=500,
    chunk_overlap=50
)

chunks = splitter.split_documents(documents)
```

---

# Embedding Generation

Each chunk is converted into a vector representation.

```
from sentence_transformers import SentenceTransformer

model = SentenceTransformer("all-MiniLM-L6-v2")

embedding = model.encode("Example text")
```

---

# Vector Storage

Embeddings are stored in a vector database for efficient similarity search.

```
from langchain.vectorstores import FAISS

vector_store = FAISS.from_documents(chunks, embedding_model)
```

---

# Query Pipeline

When a user asks a question:

1. Convert the query into an embedding
2. Retrieve top-k similar document chunks
3. Send retrieved context to the LLM
4. Generate a grounded answer

Example retrieval:

```
docs = vector_store.similarity_search(query, k=5)
```

---

# Example Workflow

Upload a document:

```
financial_report.pdf
```

Ask a question:

```
What was the total revenue in Q3?
```

System retrieves relevant content and generates:

```
The total revenue reported for Q3 was $3.2 million.
```

---

# Challenges Addressed

Handling large documents
Solved using recursive chunking.

Reducing LLM hallucinations
Solved using Retrieval Augmented Generation.

Supporting multimodal inputs
Handled using OCR for images.

Efficient document search
Implemented using vector embeddings and FAISS/Pinecone.

---

# Future Improvements

* Hybrid search (keyword + vector)
* Document reranking models
* Metadata filtering
* Faster embedding generation
* Distributed document processing

---

# Use Cases

* Financial document analysis
* Legal document search
* Enterprise knowledge base
* Research paper search
* Contract question answering

---

# Author

Darsh Marothi


---
