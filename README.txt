GHOST GOLF V1.2 — AI SCORECARD SCANNER

IMPORTANT: The scanner requires a deployed Netlify Function and an OpenAI API key.
Uploading only index.html or dragging a folder into Netlify Drop may publish the UI but NOT deploy the serverless function.

Recommended deployment (Git-based):
1. Put all files in this folder into a GitHub repository, including netlify/functions/scan-scorecard.js and netlify.toml.
2. In Netlify, choose Add new project > Import an existing project, and connect the repository.
3. Build command: leave empty. Publish directory: . (root).
4. Site configuration > Environment variables: add OPENAI_API_KEY (secret value; do not put in HTML or Git).
5. Trigger a fresh deployment. Test the Scan Scorecard button on the deployed URL.
6. Optional OPENAI_VISION_MODEL environment variable defaults to gpt-4.1-mini.

Your Netlify account and OpenAI API billing are separate. Image analysis may incur API usage fees.
Photos are sent from the browser to the Netlify Function and onward to OpenAI for processing.
Review and correct extracted values before importing. Browser storage is device-specific.

NOTE: If you already have a Netlify site, connect a repository to that same site instead of creating a new URL.
