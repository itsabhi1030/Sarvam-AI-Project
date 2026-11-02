import os
from pathlib import Path
from sarvamai import SarvamAI

# Load variables from .env into os.environ if present
env_path = Path(__file__).resolve().parent / ".env"
if env_path.exists():
    with open(env_path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                key, val = line.split("=", 1)
                val = val.strip().strip('"\'')
                if val:
                    os.environ.setdefault(key.strip(), val)

# Initialize the Sarvam client (reads SARVAM_API_KEY from environment)
client = SarvamAI(api_subscription_key=os.environ.get("SARVAM_API_KEY"))

# Make a chat completion call with the sarvam-105b-conversations model
response = client.chat.completions(
    model="sarvam-105b-conversations",
    messages=[
        {"role": "user", "content": "Hello! Please introduce yourself in one short sentence."}
    ],
)

# Print the reply
print(response.choices[0].message.content)
