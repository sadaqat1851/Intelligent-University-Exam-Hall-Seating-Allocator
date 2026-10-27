"""
Intelligent University Exam Hall Seating Allocator - Local Web Server
Runs a lightweight HTTP server using Python's standard library and opens the browser.
No external pip packages required.
"""

import http.server
import socketserver
import webbrowser
import os
import sys

PORT = 8080
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def log_message(self, format, *args):
        # Clean terminal output
        sys.stderr.write(f"[{self.log_date_time_string()}] {args[0]}\n")

def run():
    os.chdir(DIRECTORY)
    # Allow port reuse
    socketserver.TCPServer.allow_reuse_address = True
    
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
        sys.stderr.reconfigure(encoding='utf-8', errors='replace')
    
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        url = f"http://localhost:{PORT}/index.html"
        print("=" * 70)
        print("[*] INTELLIGENT UNIVERSITY EXAM HALL SEATING ALLOCATOR")
        print("    CSC262: Artificial Intelligence - I | COMSATS University Islamabad")
        print("=" * 70)
        print(f"[>] Server running at: {url}")
        print("    Serving directory:", DIRECTORY)
        print("    Press Ctrl+C to stop the server.")
        print("=" * 70)
        
        try:
            webbrowser.open(url)
        except Exception:
            pass

        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down server gracefully...")
            httpd.server_close()

if __name__ == "__main__":
    run()
