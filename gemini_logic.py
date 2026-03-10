
# Gemini LLM Interaction Logic
# Written in a manual style to demonstrate prompt engineering and grounding.

def construct_rag_prompt(query, retrieved_docs):
    """
    Manually builds a context string using f-strings and clear separators.
    """
    # Step 1: Build the 'Source Context' block
    final_context = ""
    
    for doc in retrieved_docs:
        final_context += "--- SOURCE BLOCK ---\n"
        final_context += f"FILE: {doc['fileName']}\n"
        final_context += f"PAGE: {doc['pageNumber']}\n"
        final_context += f"CONTENT: {doc['text']}\n"
        final_context += "--------------------\n\n"
        
    if not final_context:
        final_context = "NO DOCUMENT CONTEXT FOUND."

    # Step 2: Define the 'Strict Grounding' system instruction
    system_prompt = (
        "You are a Strict Grounding Search Engine. You must ONLY use the information "
        "provided in the SOURCE BLOCKS or the IMAGE. \n\n"
        "MANDATORY CITATION RULE: \n"
        "Every time you make a claim, you MUST follow it with a citation like this: "
        "[File: Name, Page: X]. \n\n"
        "VERIFICATION RULE: \n"
        "If you cannot find the answer in the provided context, you MUST say: "
        "'I cannot verify this information based on the provided documents.' \n\n"
        "OUTPUT FORMAT: \n"
        "Your response must have two clear sections: \n"
        "1. ANSWER: (Your cited text here) \n"
        "2. VERIFIED FACTS: (A simple dictionary of 1-3 key facts found)"
    )

    # Step 3: Combine into the final user prompt
    user_prompt = f"CONTEXT:\n{final_context}\n\nUSER QUESTION: {query}"
    
    return system_prompt, user_prompt

def process_ai_response(ai_text):
    """
    Manually splits the response into an answer and an evidence dictionary.
    """
    evidence_dictionary = {}
    main_answer = ""
    
    try:
        # Simple manual string splitting
        if "VERIFIED FACTS:" in ai_text:
            parts = ai_text.split("VERIFIED FACTS:")
            main_answer = parts[0].replace("ANSWER:", "").strip()
            
            # Manual loop to parse facts into a dictionary
            raw_facts = parts[1].strip().split("\n")
            for i, fact in enumerate(raw_facts):
                if fact.strip():
                    evidence_dictionary[f"fact_{i+1}"] = fact.strip("- ").strip()
        else:
            main_answer = ai_text.replace("ANSWER:", "").strip()
            
    except Exception as e:
        # Standard Python error handling
        print(f"Error parsing AI response: {e}")
        main_answer = ai_text
        
    return {
        "answer": main_answer,
        "evidence": evidence_dictionary
    }
