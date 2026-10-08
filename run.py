import os
import sys
import subprocess
import webbrowser
import time

def check_dependencies():
    """Checks for required Python packages."""
    print("Checking dependencies...")
    required = ["flask", "flask-cors", "pandas", "numpy"]
    missing = []
    for pkg in required:
        try:
            __import__(pkg.replace("-", "_"))
        except ImportError:
            missing.append(pkg)
            
    if missing:
        print(f"Missing dependencies: {missing}")
        print("Attempting to install missing packages...")
        try:
            subprocess.check_call([sys.executable, "-m", "pip", "install"] + missing)
            print("Dependencies installed successfully.")
        except Exception as e:
            print(f"Error installing dependencies: {e}")
            print("Please run: pip install flask flask-cors pandas numpy")
            sys.exit(1)
    else:
        print("All dependencies are satisfied.")

def main():
    check_dependencies()
    
    # Ensure current working directory is the workspace root
    root_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(root_dir)
    print(f"Current working directory set to: {root_dir}")
    
    # Create required folders
    os.makedirs(os.path.join(root_dir, "data"), exist_ok=True)
    os.makedirs(os.path.join(root_dir, "backend"), exist_ok=True)
    os.makedirs(os.path.join(root_dir, "frontend"), exist_ok=True)
    
    # Check if backend code files are present
    if not os.path.exists(os.path.join(root_dir, "backend", "app.py")):
        print("Error: backend/app.py not found in working directory.")
        sys.exit(1)
        
    print("\n" + "="*50)
    print("🎓  PERSONALIZED AI TUTOR SYSTEM CONFIGURATOR  🎓")
    print("="*50)
    print("Starting Flask application...")
    print("Open your browser and navigate to: http://127.0.0.1:5000/")
    print("="*50 + "\n")
    
    # Optional: open browser after 2 seconds
    try:
        # We start the flask app by importing it and running it,
        # or spawning it as a subprocess to keep the window clean.
        # Spawning as subprocess allows standard Flask reloading.
        cmd = [sys.executable, "-m", "backend.app"]
        
        # Open browser in a separate thread/delay
        time.sleep(1.5)
        webbrowser.open("http://127.0.0.1:5000/")
        
        # Start backend
        subprocess.run(cmd, check=True)
    except KeyboardInterrupt:
        print("\nServer stopped by user.")
    except Exception as e:
        print(f"Error running Flask server: {e}")

if __name__ == "__main__":
    main()
