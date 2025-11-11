# ==========================================================
# 🧠 DREAMINK — Final Backend (Auth + 4 ML Styles + OpenCV Sketch)
# ==========================================================
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_ngrok import run_with_ngrok
import sqlitecloud, bcrypt, torch, os, io, base64, cv2, numpy as np
from diffusers import StableDiffusionImg2ImgPipeline
from PIL import Image

# ==========================================================
# ⚙️ Flask Setup
# ==========================================================
app = Flask(__name__)
CORS(app)
run_with_ngrok(app)  # exposes backend automatically in Colab

SQLITE_CLOUD_URL = "YOUR_SQLITECLOUD_URL_HERE"  # 🔒 replace manually

# ==========================================================
# 🧩 Database Setup
# ==========================================================
def get_db_connection():
    return sqlitecloud.connect(SQLITE_CLOUD_URL)

def ensure_schema():
    conn = get_db_connection()
    conn.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            first_name TEXT NOT NULL,
            last_name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.close()

# ==========================================================
# 👤 AUTH ROUTES
# ==========================================================
@app.route('/api/signup', methods=['POST'])
def signup():
    data = request.get_json()
    first_name = data.get('firstName')
    last_name = data.get('lastName')
    email = data.get('email')
    password = data.get('password')

    if not all([first_name, last_name, email, password]):
        return jsonify({'error': 'Missing required fields'}), 400

    email = email.lower()
    conn = get_db_connection()
    cursor = conn.execute('SELECT id FROM users WHERE email = ?', (email,))
    existing = cursor.fetchone()

    if existing:
        conn.close()
        return jsonify({'error': 'Account already exists'}), 409

    password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    conn.execute(
        'INSERT INTO users (first_name, last_name, email, password_hash) VALUES (?, ?, ?, ?)',
        (first_name, last_name, email, password_hash)
    )
    conn.close()

    return jsonify({'firstName': first_name, 'lastName': last_name, 'email': email}), 201


@app.route('/api/signin', methods=['POST'])
def signin():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'error': 'Missing credentials'}), 400

    email = email.lower()
    conn = get_db_connection()
    cursor = conn.execute(
        'SELECT id, first_name, last_name, email, password_hash FROM users WHERE email = ?',
        (email,)
    )
    user = cursor.fetchone()
    conn.close()

    if not user or not bcrypt.checkpw(password.encode('utf-8'), user[4].encode('utf-8')):
        return jsonify({'error': 'Invalid email or password'}), 401

    return jsonify({'id': user[0], 'firstName': user[1], 'lastName': user[2], 'email': user[3]})


# ==========================================================
# 🎨 STYLE TRANSFORMATION SECTION
# ==========================================================
device = "cuda" if torch.cuda.is_available() else "cpu"

model_paths = {
    "pixar": "/content/drive/MyDrive/Colab Notebooks/sd_turbo_model",
    "comic": "/content/drive/MyDrive/Colab Notebooks/comic_model/dreamshaper_8",
    "ghibli": "/content/drive/MyDrive/Colab Notebooks/nitrosocke_classic_anim_diffusion",
    "oil": "/content/drive/MyDrive/Colab Notebooks/sd_turbo_model"
}

loaded_pipelines = {}

def get_pipeline(style):
    """Load the correct diffusion model only once"""
    if style not in loaded_pipelines:
        path = model_paths[style]
        print(f"🔄 Loading {style} model from {path} ...")
        pipe = StableDiffusionImg2ImgPipeline.from_pretrained(
            path,
            torch_dtype=torch.float16 if device == "cuda" else torch.float32,
            safety_checker=None
        ).to(device)
        loaded_pipelines[style] = pipe
    return loaded_pipelines[style]


# Prompts for diffusion-based styles
prompts = {
    "pixar": "Pixar-style 3D cartoon, bright colors, cinematic lighting, smooth textures, same face and proportions.",
    "comic": "Comic-book art, expressive line work, vibrant colors, clean outlines, same facial details.",
    "ghibli": "Studio Ghibli 2D anime look, soft lighting, calm tones, detailed but subtle, consistent face structure.",
    "oil": "Oil painting with realistic brush strokes, soft tone, artistic lighting, preserved facial features."
}

negative_prompt = "blurry, distorted, deformed, watermark, text, extra limbs, low quality"

# ==========================================================
# 🖼 STYLE ENDPOINT
# ==========================================================
@app.route("/api/style/<style>", methods=["POST"])
def stylize(style):
    style = style.lower()

    # --- Basic validation ---
    if "image" not in request.files:
        return jsonify({"error": "No image uploaded"}), 400

    file = request.files["image"]

    # --- If Pencil Sketch, use OpenCV directly ---
    if style == "sketch":
        np_img = np.frombuffer(file.read(), np.uint8)
        image = cv2.imdecode(np_img, cv2.IMREAD_COLOR)

        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        inverted = cv2.bitwise_not(gray)
        blurred = cv2.GaussianBlur(inverted, (21, 21), 0)
        inverted_blur = cv2.bitwise_not(blurred)
        sketch = cv2.divide(gray, inverted_blur, scale=256.0)

        # Convert to base64 PNG
        _, buffer = cv2.imencode('.png', sketch)
        img_base64 = base64.b64encode(buffer).decode('utf-8')

        return jsonify({
            "message": "Pencil Sketch stylization successful",
            "image": img_base64
        })

    # --- For other styles, use diffusion models ---
    if style not in model_paths:
        return jsonify({"error": f"Invalid style '{style}'"}), 400

    init_image = Image.open(file.stream).convert("RGB").resize((512, 512))
    pipe = get_pipeline(style)

    print(f"🎨 Generating {style} stylization...")

    with torch.autocast(device):
        result = pipe(
            prompt=prompts[style],
            negative_prompt=negative_prompt,
            image=init_image,
            strength=0.6,
            guidance_scale=7.5,
            num_inference_steps=30
        )

    stylized_image = result.images[0]
    buffered = io.BytesIO()
    stylized_image.save(buffered, format="PNG")
    img_base64 = base64.b64encode(buffered.getvalue()).decode("utf-8")

    print(f"✅ {style.capitalize()} style generation complete!")
    return jsonify({
        "message": f"{style.capitalize()} stylization successful",
        "image": img_base64
    })


@app.route("/")
def home():
    return jsonify({"message": "DreamInk Backend is Live!"})


# ==========================================================
# 🚀 MAIN ENTRY
# ==========================================================
if __name__ == "__main__":
    ensure_schema()
    print("🔥 Starting DreamInk Flask backend with ngrok...")
    app.run()
