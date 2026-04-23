import os
import sys
import json
from rich.console import Console
from rich.panel import Panel
from rich.prompt import Prompt, IntPrompt
from rich.table import Table
from rich.theme import Theme
from rich import print as rprint
from pipeline import ScriptPipeline
from rag_manager import RAGManager
from dotenv import load_dotenv

# Classy theme setup
custom_theme = Theme({
    "info": "cyan",
    "warning": "yellow",
    "error": "bold red",
    "success": "bold green",
    "highlight": "bold magenta",
    "muted": "grey50"
})

console = Console(theme=custom_theme)

def initialize_rag():
    rag = RAGManager()
    if rag.index.ntotal == 0:
        console.print("[info]Initializing RAG with sample data...[/info]")
        sample_data = [
            {
                "style": "Hollywood",
                "genre": "Crime Thriller",
                "text": "INT. ABANDONED WAREHOUSE - NIGHT\n\nRain drums against the rusted corrugated roof. ARJUN (40s, weary) stands in the shadows, his gun drawn but lowered.\n\nRANA (50s, impeccably dressed) sits on a crate, lighting a cigar with steady hands.\n\nRANA: You're late, Arjun. Even for a man who's lost everything.\n\nARJUN: I haven't lost the ability to pull a trigger, Rana."
            },
            {
                "style": "Bollywood",
                "genre": "Drama",
                "text": "EXT. RAIN-SOAKED TEMPLE STEPS - NIGHT\n\nLightning cracks across the sky. RAHUL (20s, heartbroken) falls to his knees.\n\nRAHUL: (Screaming at the sky) क्यूँ?! (Why did you take her from me? Is this your justice?!)\n\nPRIYA (20s, ethereal) appears. \n\nPRIYA: राहुल, शांत हो जाओ। (Rahul, calm down.)"
            },
            {
                "style": "K-Drama",
                "genre": "Romance",
                "text": "EXT. CHERRY BLOSSOM PARK - DAY\n\nMIN-HO (25, shy) stands across from JI-SOO (24, smiling).\n\nJI-SOO: 안녕하세요. (Hello.) You've been standing there for ten minutes.\n\nMIN-HO: 미안해요. (I'm sorry.) I was waiting for my courage to catch up."
            },
            {
                "style": "Anime",
                "genre": "Action",
                "text": "EXT. CRUMBLING CITYSCAPE - DAY\n\nKENJI (17, determined) stares down the massive MECHA-SENTINEL. His eyes glow with a faint blue light.\n\nKENJI: (Inner monologue) If I don't do this now, no one will. My ancestors... lend me your strength!\n\nKENJI draws his blade, sparks flying as it scrapes against the concrete."
            },
            {
                "style": "Japanese",
                "genre": "Samurai",
                "text": "EXT. CHERRY BLOSSOM GROVE - DUSK\n\nPetals fall like blood. MUSASHI (30s) faces the KAGE-RYU ASSASSIN.\n\nMUSASHI: 覚悟はいいか？ (Are you prepared?)\n\nASSASSIN: 死ぬのはお前だ。 (It is you who will die.)"
            }
        ]
        rag.add_snippets(sample_data)
        console.print("[success]RAG initialized successfully.[/success]")
    return rag

def get_manual_criteria():
    console.print(Panel.fit(" [bold highlight]SCRIPT CRITERIA SETTINGS[/bold highlight] ", border_style="highlight"))
    
    criteria = {}
    
    # 1. Language Selection
    languages = ["English", "Hindi", "Hinglish", "Korean", "Japanese"]
    console.print("\n[highlight]1. Language Selection[/highlight]")
    for i, lang in enumerate(languages, 1):
        console.print(f"  {i}. {lang}")
    lang_choice = IntPrompt.ask("Select Language", choices=[str(i) for i in range(1, 6)], default=1)
    criteria['language'] = languages[lang_choice - 1]

    # 2. Scene Length
    lengths = ["Short (1-2 pages)", "Medium (3-5 pages)", "Long (5-10 pages)"]
    console.print("\n[highlight]2. Scene Length[/highlight]")
    for i, l in enumerate(lengths, 1):
        console.print(f"  {i}. {l}")
    len_choice = IntPrompt.ask("Select Length", choices=[str(i) for i in range(1, 4)], default=2)
    criteria['length'] = lengths[len_choice - 1]

    # 3. Style Selection
    styles = ["Hollywood", "Bollywood", "K-Drama", "Anime/Japanese"]
    console.print("\n[highlight]3. Production Style[/highlight]")
    for i, s in enumerate(styles, 1):
        console.print(f"  {i}. {s}")
    style_choice = IntPrompt.ask("Select Style", choices=[str(i) for i in range(1, 5)], default=1)
    criteria['style'] = styles[style_choice - 1]

    # 4. Detailed Fields
    console.print("\n[highlight]4. Scene Details[/highlight] [muted](Press Enter to skip)[/muted]")
    criteria['genre'] = Prompt.ask("Genre", default="")
    
    characters = []
    console.print("\n[highlight]5. Characters[/highlight] [muted](Add characters or leave blank to finish)[/muted]")
    while True:
        char_name = Prompt.ask("  Character Name").strip()
        if not char_name:
            break
        char_role = Prompt.ask(f"  Role for {char_name}")
        char_traits = Prompt.ask(f"  Traits for {char_name}")
        characters.append({"name": char_name, "role": char_role, "traits": char_traits})
    if characters: criteria['characters'] = characters

    criteria['setting'] = Prompt.ask("Setting/Location", default="")
    criteria['time'] = Prompt.ask("Time of Day", default="")
    criteria['tone'] = Prompt.ask("Atmospheric Tone", default="")
    
    # Clean up empty values
    return {k: v for k, v in criteria.items() if v}

def main():
    load_dotenv()
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        console.print("[error]Error: GOOGLE_API_KEY not found in environment.[/error]")
        sys.exit(1)
        
    initialize_rag()
    pipeline = ScriptPipeline(api_key=api_key)
    
    while True:
        console.clear()
        console.print(Panel(
            "[bold highlight]ENTERTAINMENT SCRIPT GENERATOR[/bold highlight]\n"
            "[muted]Professional AI Screenwriting Tool[/muted]",
            expand=False,
            border_style="highlight"
        ))
        
        user_input = Prompt.ask("\n[bold]Enter your scene idea[/bold]\n[muted](e.g., 'A confrontation between brothers over a stolen legacy')[/muted]")
        
        use_manual = Prompt.ask("\nWould you like to refine scene criteria manually?", choices=["y", "n"], default="n") == 'y'
        manual_criteria = get_manual_criteria() if use_manual else {}
        
        with console.status("[bold info]Step 1: Enriching script structure...[/bold info]"):
            structured_input = pipeline.transform_user_input(user_input)
            if manual_criteria:
                structured_input.update(manual_criteria)
        
        # Display enriched structure
        table = Table(title="ENRICHED SCRIPT SPECIFICATIONS", border_style="highlight", show_header=True, header_style="bold magenta")
        table.add_column("Property", style="cyan")
        table.add_column("Value", style="white")
        
        table.add_row("Style", structured_input.get('style'))
        table.add_row("Genre", structured_input.get('genre'))
        table.add_row("Language", structured_input.get('language'))
        table.add_row("Length", structured_input.get('length'))
        table.add_row("Setting", structured_input.get('setting'))
        table.add_row("Time", structured_input.get('time'))
        table.add_row("Tone", structured_input.get('tone'))
        
        console.print(table)
        
        with console.status("[bold info]Step 2: Drafting professional screenplay...[/bold info]"):
            generated_scene = pipeline.generate_scene(structured_input)
    
        if generated_scene.startswith("ERROR:"):
            console.print(f"\n[error]{generated_scene}[/error]")
            console.print("\n[info]Returning to main menu...[/info]")
            import time
            time.sleep(2)
            continue

        console.print("\n", Panel(generated_scene, title="[bold success]GENERATED SCREENPLAY[/bold success]", border_style="success"))
        
        exit_iteration = False
        while True:
            console.print("\n[bold highlight]ITERATION TOOLS[/bold highlight]")
            console.print("  1. [info]Make it more intense[/info]")
            console.print("  2. [info]Change tone to humorous[/info]")
            console.print("  3. [info]Improve dialogue only[/info]")
            console.print("  4. [highlight]Create a NEW script[/highlight]")
            console.print("  5. [error]Exit[/error]")
            
            choice = Prompt.ask("\nSelect an action", choices=["1", "2", "3", "4", "5"])
            
            if choice == '1':
                with console.status("[bold info]Intensifying stakes...[/bold info]"):
                    new_scene = pipeline.iterate_scene(generated_scene, "intense")
                if new_scene.startswith("ERROR:"):
                    console.print(f"\n[error]{new_scene}[/error]")
                else:
                    generated_scene = new_scene
                    console.print("\n", Panel(generated_scene, title="[bold warning]UPDATED SCENE (INTENSE)[/bold warning]", border_style="warning"))
            elif choice == '2':
                with console.status("[bold info]Adding humor...[/bold info]"):
                    new_scene = pipeline.iterate_scene(generated_scene, "humorous")
                if new_scene.startswith("ERROR:"):
                    console.print(f"\n[error]{new_scene}[/error]")
                else:
                    generated_scene = new_scene
                    console.print("\n", Panel(generated_scene, title="[bold warning]UPDATED SCENE (HUMOROUS)[/bold warning]", border_style="warning"))
            elif choice == '3':
                with console.status("[bold info]Refining dialogue...[/bold info]"):
                    new_scene = pipeline.iterate_scene(generated_scene, "dialogue")
                if new_scene.startswith("ERROR:"):
                    console.print(f"\n[error]{new_scene}[/error]")
                else:
                    generated_scene = new_scene
                    console.print("\n", Panel(generated_scene, title="[bold warning]UPDATED SCENE (IMPROVED DIALOGUE)[/bold warning]", border_style="warning"))
            elif choice == '4':
                # Break the inner loop to go back to the outer loop (start fresh)
                break
            elif choice == '5':
                console.print("\n[highlight]Exiting professional session. Goodbye![/highlight]")
                exit_iteration = True
                break
        
        if exit_iteration:
            break

if __name__ == "__main__":
    main()

