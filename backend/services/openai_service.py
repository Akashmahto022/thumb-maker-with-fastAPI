import base64
from openai import AsyncOpenAI

from config import OPENAI_API_KEY

client = AsyncOpenAI(api_key=OPENAI_API_KEY)

async def generate_thumbnail(prompt: str, style_prompt: str, headshot_urll: str) -> bytes:
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




