# Multimodal RAG Search Engine

A full-stack AI system for semantic search and question answering over PDFs and images using Retrieval-Augmented Generation (RAG), vector databases, and multimodal large language models.

---

## Overview

This project implements a **Multimodal Retrieval-Augmented Generation (RAG) Search Engine** that allows users to upload PDF documents and images and ask natural-language questions grounded strictly in the uploaded content.

The system extracts and chunks text from PDFs, embeds the chunks into a vector database, retrieves the most relevant context using semantic similarity search, and leverages a **multimodal large language model** to reason jointly over retrieved text and images. The final response includes both the generated answer and the source document chunks used, improving transparency and reducing hallucination.

This project prioritizes **clean backend logic, explainable AI behavior, and production-style RAG pipelines**, rather than UI complexity.

---

## Key Features

- PDF text extraction using **PyMuPDF**
- Recursive text chunking for optimal semantic retrieval
- Vector similarity search using **FAISS (local)** or **Pinecone (cloud)**
- Multimodal reasoning over retrieved text chunks and images
- Source-aware responses to reduce hallucination
- FastAPI backend with a lightweight **Next.js / React** frontend

---

## System Architecture

The system follows a standard RAG pipeline:

1. Document ingestion and preprocessing  
2. Recursive text chunking and embedding  
3. Vector storage and similarity search  
4. Multimodal context assembly (text + image)  
5. LLM-based reasoning and answer generation  

---

## Tech Stack

- **Backend:** Python, FastAPI  
- **Document Processing:** PyMuPDF  
- **Vector Store:** FAISS / Pinecone  
- **LLM:** Gemini 1.5 (Multimodal)  
- **Frontend:** Next.js, React, Tailwind CSS  

---

## API Workflow

1. Users upload PDF and image files through the frontend.
2. The backend extracts text, chunks it recursively, and stores embeddings in a vector database.
3. User queries are embedded and matched against stored vectors using similarity search.
4. The top relevant text chunks along with the uploaded image are sent to the multimodal LLM.
5. The system returns a generated answer along with the source document references used for reasoning.

---

## Project Structure
multimodal-rag-search-engine/
├── backend/
│   ├── ingestion.py
│   ├── chunking.py
│   ├── vector_store.py
│   ├── rag_pipeline.py
│   └── main.py
├── frontend/
│   ├── pages/
│   └── components/
├── data/
├── requirements.txt
└── README.me

---

## Future Enhancements

- Support for additional document formats (DOCX, PPTX)
- Advanced evaluation metrics for RAG performance
- User authentication and session-based document storage
- Containerized deployment using Docker
- Cloud deployment with managed vector databases

---

## Intended Audience

This project is intended for **recruiters, interviewers, and engineers** evaluating applied AI, backend engineering, and retrieval-based LLM systems.

---

## License

This project is intended for educational and portfolio use.


