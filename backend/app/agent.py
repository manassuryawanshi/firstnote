import time
import os
import torch
import torch.nn as nn
from typing import TypedDict, List, Dict, Any
from langgraph.graph import StateGraph, END

try:
    import pretty_midi
except ImportError:
    pretty_midi = None

# --- State Definition ---
class AgentState(TypedDict):
    input_file: str
    output_file: str
    features: Dict[str, Any]
    tags: List[str]
    progress: int
    status: str
    celery_task: Any # Reference to the celery task to update state

# --- Node 1: Feature Extractor ---
def feature_extractor(state: AgentState):
    if state.get("celery_task"):
        state["celery_task"].update_state(state='PROCESSING', meta={'status': 'Theorizing', 'progress': 20})
    
    # Simulate loading/parsing delay
    time.sleep(2)
    
    features = {"bpm": 120, "key": "Unknown", "num_instruments": 0}
    
    if pretty_midi:
        try:
            if os.path.exists(state["input_file"]) and os.path.getsize(state["input_file"]) > 0:
                midi_data = pretty_midi.PrettyMIDI(state["input_file"])
                tempo = midi_data.estimate_tempo()
                key = "C Major"
                if len(midi_data.instruments) > 0 and len(midi_data.instruments[0].notes) > 0:
                    first_pitch = midi_data.instruments[0].notes[0].pitch
                    notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
                    key = f"{notes[first_pitch % 12]} Major"
                
                features = {"bpm": round(tempo), "key": key, "num_instruments": len(midi_data.instruments)}
            else:
                features = {"bpm": 128, "key": "E Minor", "num_instruments": 1} # Dummy fallback
        except Exception as e:
            print(f"Error parsing MIDI: {e}")
            features = {"bpm": 110, "key": "A Minor", "num_instruments": 0}

    return {"features": features}

# --- Node 2: Orchestrator (PyTorch) ---
class DummyMIDIOrchestrator(nn.Module):
    def __init__(self):
        super().__init__()
        self.lstm = nn.LSTM(input_size=12, hidden_size=64, num_layers=2, batch_first=True)
        self.fc = nn.Linear(64, 12)
        
    def forward(self, x):
        out, _ = self.lstm(x)
        out = self.fc(out)
        return out

def orchestrator_model(state: AgentState):
    if state.get("celery_task"):
        state["celery_task"].update_state(state='PROCESSING', meta={'status': 'Orchestrating', 'progress': 50})
    
    time.sleep(3) # Simulate heavy ML processing
    
    # 1. Mock PyTorch Processing
    model = DummyMIDIOrchestrator()
    model.eval()
    
    # Create dummy tensor representing chord progression (Batch, Sequence, Features)
    dummy_input = torch.randn(1, 10, 12) 
    with torch.no_grad():
        output = model(dummy_input) # Run inference
    
    out_file = state["input_file"]
    
    # 2. Generate Output MIDI (Rule-based for MVP)
    if pretty_midi:
        try:
            new_midi = pretty_midi.PrettyMIDI()
            piano = pretty_midi.Instrument(program=0) # Acoustic Grand Piano
            
            base_pitch = 60 # C4
            bpm = state["features"].get("bpm", 120)
            beat_duration = 60.0 / bpm
            
            for i in range(16): # 4 bars of 16th notes
                note = pretty_midi.Note(
                    velocity=100, 
                    pitch=base_pitch + (i % 4) * 4, 
                    start=i * beat_duration * 0.25, 
                    end=(i + 1) * beat_duration * 0.25
                )
                piano.notes.append(note)
                
            new_midi.instruments.append(piano)
            
            # Save generated file
            output_filename = os.path.basename(state["input_file"]).replace(".mid", "_orchestrated.mid")
            tmp_output = f"/tmp/{output_filename}"
            new_midi.write(tmp_output)
            out_file = tmp_output
        except Exception as e:
            print(f"MIDI generation error: {e}")
        
    return {"output_file": out_file}

# --- Node 3: Metadata Tagger ---
def metadata_tagger(state: AgentState):
    if state.get("celery_task"):
        state["celery_task"].update_state(state='PROCESSING', meta={'status': 'Finalizing', 'progress': 85})
    
    time.sleep(1)
    
    features = state["features"]
    bpm = features.get("bpm", 120)
    
    tags = []
    if bpm > 140:
        tags.append("Upbeat")
    elif bpm < 90:
        tags.append("Chill")
    else:
        tags.append("Mid-tempo")
        
    tags.append(features.get("key", "Unknown Key"))
    tags.append("Electronic")
    tags.append("AI Generated")
    
    return {"tags": tags}

# --- Build LangGraph ---
def build_graph():
    workflow = StateGraph(AgentState)
    
    workflow.add_node("feature_extractor", feature_extractor)
    workflow.add_node("orchestrator_model", orchestrator_model)
    workflow.add_node("metadata_tagger", metadata_tagger)
    
    workflow.set_entry_point("feature_extractor")
    workflow.add_edge("feature_extractor", "orchestrator_model")
    workflow.add_edge("orchestrator_model", "metadata_tagger")
    workflow.add_edge("metadata_tagger", END)
    
    return workflow.compile()

arranger_swarm = build_graph()
