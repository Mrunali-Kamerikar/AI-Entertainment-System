import faiss
import numpy as np
import json
import os
from sentence_transformers import SentenceTransformer

class RAGManager:
    def __init__(self, index_path="faiss_index.bin", data_path="metadata.json"):
        self.index_path = index_path
        self.data_path = data_path
        self.model = SentenceTransformer('all-MiniLM-L6-v2')
        self.dimension = 384 # Dimension for all-MiniLM-L6-v2
        
        if os.path.exists(index_path) and os.path.exists(data_path):
            self.index = faiss.read_index(index_path)
            with open(data_path, 'r') as f:
                self.metadata = json.load(f)
        else:
            self.index = faiss.IndexFlatL2(self.dimension)
            self.metadata = []

    def add_snippets(self, snippets):
        """
        snippets: List of dicts, e.g., [{"text": "...", "style": "Hollywood", "genre": "Crime"}]
        """
        texts = [s['text'] for s in snippets]
        embeddings = self.model.encode(texts)
        self.index.add(np.array(embeddings).astype('float32'))
        self.metadata.extend(snippets)
        self._save()

    def retrieve(self, query, top_k=3, style=None, genre=None):
        """
        Retrieves relevant snippets based on query and optional filters.
        """
        if self.index.ntotal == 0:
            return []
            
        query_embedding = self.model.encode([query])
        distances, indices = self.index.search(np.array(query_embedding).astype('float32'), top_k)
        
        results = []
        for idx in indices[0]:
            if idx != -1:
                results.append(self.metadata[idx]['text'])
        return results

    def _save(self):
        faiss.write_index(self.index, self.index_path)
        with open(self.data_path, 'w') as f:
            json.dump(self.metadata, f)

if __name__ == "__main__":
    # Example usage
    rag = RAGManager()
    sample_snippets = [
        {
            "id": "scene_001",
            "style": "Hollywood",
            "genre": "Crime",
            "text": "INT. OFFICE - NIGHT\n\nDET. MARLOWE sits alone. A single lamp illuminates the smoke swirling in the air."
        },
        {
            "id": "scene_002",
            "style": "Bollywood",
            "genre": "Drama",
            "text": "EXT. RAIN-SOAKED STREET - NIGHT\n\nRAHUL screams into the void. 'KYUN?!' The rain washes away his tears."
        }
    ]
    rag.add_snippets(sample_snippets)
    print("Added snippets. Total:", rag.index.ntotal)
    
    res = rag.retrieve("a detective in a dark office", top_k=1)
    print("Retrieved:", res)
