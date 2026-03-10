
# Core Inference Logic - Refactored
# Handles prompt assembly and result parsing.

def assemble_rag_request(query_text, retrieved_context_list):
    """
    Manually creates a structured text block for the LLM.
    """
    # Step 1: Initialize context string
    full_context_str = ""
    
    # Step 2: Loop through retrieved documents to build context
    for doc in retrieved_context_list:
        full_context_str += "=== SOURCE START ===\n"
        full_context_str += f"FILENAME: {doc['fileName']}\n"
        full_context_str += f"PAGE_NO: {doc['pageNumber']}\n"
        full_context_str += f"TEXT_CONTENT: {doc['text']}\n"
        full_context_str += "=== SOURCE END ===\n\n"
        
    if not full_context_str:
        full_context_str = "SYSTEM NOTICE: No relevant documents found."

    # Step 3: Define strict system boundaries
    system_rules = (
        "Role: Strict Grounding Engine.\n"
        "Duty: Answer ONLY from context. Cite as [File: Name, Page: X].\n"
        "Failure Mode: If not found, say 'I cannot verify'.\n"
        "Output: Start with 'ANSWER: ' then 'FACTS: ' for bullet points."
    )

    # Step 4: Construct user prompt
    user_prompt = f"PROVIDED_DOCUMENTS:\n{full_context_str}\n\nQUESTION: {query_text}"
    
    return system_rules, user_prompt

def parse_model_output(raw_output):
    """
    Manually dissects the model response into usable parts.
    """
    evidence_dict = {}
    clean_answer = ""
    
    try:
        if "FACTS:" in raw_output:
            answer_part, facts_part = raw_output.split("FACTS:")
            clean_answer = answer_part.replace("ANSWER:", "").strip()
            
            fact_lines = facts_part.strip().split("\n")
            for idx, line in enumerate(fact_lines):
                if line.strip():
                    key = f"verified_point_{idx+1}"
                    evidence_dict[key] = line.strip("- ").strip()
        else:
            clean_answer = raw_output.replace("ANSWER:", "").strip()
            
    except Exception as error:
        print(f"Parsing error: {error}")
        clean_answer = raw_output
        
    return {
        "final_answer": clean_answer,
        "evidence_summary": evidence_dict
    }
