import base64
from openai import AsyncOpenAI

from config import OPENAI_API_KEY

client = AsyncOpenAI(api_key=OPENAI_API_KEY)

async def generate_thumbnail(prompt: str, style_prompt: str, headshot_url: str) -> bytes:
    """ 
    Use the responce API with gpt-image-2 as a built-in image_generation tool.
    pass the headshot URL directly as an input_image.
    return raw PNG bytes.
    """

    full_prompt = (
        f"{style_prompt}\n\n"
        f"User request: {prompt}\n\n"
        "IMPORTTANT: The generated thumbnail must prominently feature the  person "
        "shown in the provided reference headshot photo. Keep their likeness accurate."
    )

    # after this i will start from the create openai 

    response = await client.responses.create(
        model="gpt-4o",
        input=[
            {
                "role": "user",
                "content": [
                    {"type": "input_image", "url": headshot_url},
                    {"type": "text", "text": full_prompt}
                ]
            }
        ],
        tools=[
            {
                "type": "image_generation",
                "model": "gpt-image-2",
                "size": "1536*1024",
                "quality": "high",
                "output_format": "png"
            }
        ]
    )

    for item in response.output:
        if item.type == "image_generation_call" and item.result:
            return base64.b64decode(item.result)
        
    raise RuntimeError("Failed to generate thumbnail: No valid image generation result found.")




