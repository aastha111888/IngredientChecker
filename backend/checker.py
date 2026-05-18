import json
import os
import re
from pathlib import Path

from anthropic import Anthropic
from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parent / ".env")

PROMPT = """You are a dog nutrition expert. Look at this ingredient label. Extract \
every ingredient you can see. For each ingredient, classify it as safe, \
toxic, or uncertain for dogs. Pay special attention to known toxins like \
xylitol, grapes, raisins, onion, garlic, chocolate, macadamia nuts, and \
caffeine. Return your response as JSON only, with this structure:
{
  overall: safe | unsafe | uncertain,
  reason: string,
  ingredients: [{ name: string, status: safe | toxic | uncertain, note: string }]
}"""

MODEL = "claude-sonnet-4-6"


def _strip_data_url(base64_image: str) -> str:
    stripped = base64_image.strip()
    match = re.match(r"^data:image/(?:jpeg|png|gif|webp);base64,(.+)$", stripped, re.DOTALL)
    return match.group(1) if match else stripped


def _extract_json(text: str) -> dict:
    text = text.strip()
    fence = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", text)
    if fence:
        text = fence.group(1).strip()
    return json.loads(text)


def check_ingredients(base64_image: str, media_type: str) -> dict:
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        raise ValueError("ANTHROPIC_API_KEY is not set")

    data = _strip_data_url(base64_image)
    client = Anthropic(api_key=api_key)
    message = client.messages.create(
        model=MODEL,
        max_tokens=4096,
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "image",
                        "source": {
                            "type": "base64",
                            "media_type": media_type,
                            "data": data,
                        },
                    },
                    {"type": "text", "text": PROMPT},
                ],
            }
        ],
    )

    return _extract_json(message.content[0].text)
