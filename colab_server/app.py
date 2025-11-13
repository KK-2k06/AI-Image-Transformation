# ==========================================================
# 🎨 DREAMINK — Modular Backend (6 Styles + Auth + SQLiteCloud)
# ==========================================================
from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlitecloud, bcrypt, torch, os, io, base64, cv2, numpy as np
from diffusers import StableDiffusionImg2ImgPipeline
from PIL import Image
import onnxruntime as ort  # For Ghibli

# ==========================================================
# ⚙️ FLASK SETUP
# ==========================================================
app = Flask(__name__)
CORS(app)

SQLITE_CLOUD_URL = "sqlitecloud://cas86lwkvk.g3.sqlite.cloud:8860/my-database?apikey=API KEY"

# ==========================================================
# 🧩 DATABASE SETUP
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
    if cursor.fetchone():
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
    email, password = data.get('email'), data.get('password')
    if not email or not password:
        return jsonify({'error': 'Missing credentials'}), 400

    conn = get_db_connection()
    cursor = conn.execute('SELECT id, first_name, last_name, email, password_hash FROM users WHERE email = ?', (email.lower(),))
    user = cursor.fetchone()
    conn.close()

    if not user or not bcrypt.checkpw(password.encode('utf-8'), user[4].encode('utf-8')):
        return jsonify({'error': 'Invalid email or password'}), 401

    return jsonify({'id': user[0], 'firstName': user[1], 'lastName': user[2], 'email': user[3]})

# ==========================================================
# 🎨 MODEL CONFIGURATION
# ==========================================================
device = "cuda" if torch.cuda.is_available() else "cpu"

model_paths = {
    "pixar": "/content/drive/MyDrive/Colab Notebooks/nitrosocke_classic_anim_diffusion",
    "cartoon": "/content/drive/MyDrive/Colab Notebooks/nitrosocke_classic_anim_diffusion",
    "comic": "/content/drive/MyDrive/Colab Notebooks/comic_model/dreamshaper_8",
    "ghibli": "/content/drive/MyDrive/Colab Notebooks/AnimeGANv3_cache/AnimeGANv3_large_Ghibli_c1_e299.onnx"
}

loaded_pipelines = {}

def get_pipeline(style):
    """Load and cache diffusion or ONNX models"""
    if style in loaded_pipelines:
        return loaded_pipelines[style]

    path = model_paths[style]
    if style == "ghibli":
        print(f"🧩 Loading ONNX model for Ghibli from {path}")
        loaded_pipelines[style] = ort.InferenceSession(path)
    else:
        print(f"🔄 Loading diffusion model for {style}...")
        pipe = StableDiffusionImg2ImgPipeline.from_pretrained(
            path,
            torch_dtype=torch.float16 if device == "cuda" else torch.float32,
            safety_checker=None
        ).to(device)
        loaded_pipelines[style] = pipe
    return loaded_pipelines[style]

# ==========================================================
# 🎨 INDIVIDUAL STYLE FUNCTIONS
# ==========================================================
def generate_pixar(init_image):
    pipe = get_pipeline("pixar")
    prompt = (
        "Pixar Luca-style 3D look, soft rounded shapes, bright pastel colors, smooth textures" 
        "warm cinematic lighting, expressive and charming, gentle shading"
    )
    neg = "realistic, photo, 2d, anime, noisy, harsh shadows, blur, text, watermark"
    with torch.autocast(device):
        result = pipe(prompt=prompt, negative_prompt=neg, image=init_image,
                      strength=0.5, guidance_scale=7.5, num_inference_steps=30)
    return result.images[0]

def generate_cartoon(init_image):
    pipe = get_pipeline("cartoon")
    prompt = "2d cartoon, classic disney animation style, clean lines, smooth shading, same features"
    neg = "realistic, 3d render, photo, distortion, blur, text, watermark"
    with torch.autocast(device):
        result = pipe(prompt=prompt, negative_prompt=neg, image=init_image,
                      strength=0.5, guidance_scale=8.0, num_inference_steps=25)
    return result.images[0]

def generate_comic(init_image):
    pipe = get_pipeline("comic")
    prompt = "a character drawn in 2D comic style, smooth shading, colorful outlines, vibrant tones, inspired by Scooby Doo, cartoon aesthetic"
    neg = "realistic, photo, human skin texture, blurry, dull colors, modern lighting"
    with torch.autocast(device):
        result = pipe(prompt=prompt, negative_prompt=neg, image=init_image,
                      strength=0.45, guidance_scale=8.5, num_inference_steps=28)
    return result.images[0]

def generate_ghibli(init_image):
    session = get_pipeline("ghibli")
    img = init_image.resize((512, 512)).convert("RGB")
    img_np = np.array(img).astype(np.float32) / 255.0
    img_np = np.expand_dims(np.transpose(img_np, (2, 0, 1)), 0)
    output = session.run(None, {"AnimeGANv3_input:0": img_np})[0][0]
    output = np.clip(np.transpose(output, (1, 2, 0)) * 255, 0, 255).astype(np.uint8)
    return Image.fromarray(output)

def generate_oil_pastel(file):
    np_img = np.frombuffer(file.read(), np.uint8)
    img = cv2.imdecode(np_img, cv2.IMREAD_COLOR)
    img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    grainy_oil = cv2.xphoto.oilPainting(img_rgb, size=2, dynRatio=1)
    _, buffer = cv2.imencode('.png', grainy_oil)
    return base64.b64encode(buffer).decode('utf-8')

def generate_sketch(file):
    np_img = np.frombuffer(file.read(), np.uint8)
    image = cv2.imdecode(np_img, cv2.IMREAD_COLOR)
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    inverted = cv2.bitwise_not(gray)
    blurred = cv2.GaussianBlur(inverted, (21, 21), 0)
    inverted_blur = cv2.bitwise_not(blurred)
    sketch = cv2.divide(gray, inverted_blur, scale=256.0)
    _, buffer = cv2.imencode('.png', sketch)
    return base64.b64encode(buffer).decode('utf-8')

# ==========================================================
# 🧠 ROUTE HANDLER
# ==========================================================
@app.route("/api/style/<style>", methods=["POST"])
def stylize(style):
    style = style.lower()
    if "image" not in request.files:
        return jsonify({"error": "No image uploaded"}), 400
    file = request.files["image"]

    try:
        if style == "sketch":
            img_base64 = generate_sketch(file)
            return jsonify({"message": "Pencil Sketch created", "image": img_base64})

        if style == "oil":
            img_base64 = generate_oil_pastel(file)
            return jsonify({"message": "Oil Pastel created", "image": img_base64})

        init_image = Image.open(file.stream).convert("RGB").resize((512, 512))

        if style == "pixar":
            img = generate_pixar(init_image)
        elif style == "cartoon":
            img = generate_cartoon(init_image)
        elif style == "comic":
            img = generate_comic(init_image)
        elif style == "ghibli":
            img = generate_ghibli(init_image)
        else:
            return jsonify({"error": f"Invalid style '{style}'"}), 400

        buffered = io.BytesIO()
        img.save(buffered, format="PNG")
        img_base64 = base64.b64encode(buffered.getvalue()).decode('utf-8')
        print(f"✅ {style.capitalize()} stylization complete!")
        return jsonify({"message": f"{style.capitalize()} stylization successful", "image": img_base64})

    except Exception as e:
        print("❌ Error:", e)
        return jsonify({"error": str(e)}), 500

# ==========================================================
# 🏠 ROOT ENDPOINT
# ==========================================================
@app.route("/")
def home():
    return jsonify({"message": "DreamInk Modular Backend is Live!"})

# ==========================================================
# 🚀 MAIN ENTRY
# ==========================================================
if __name__ == "__main__":
    ensure_schema()
    print("🔥 Starting DreamInk Modular Flask backend...")
    app.run(host="0.0.0.0", port=3001, debug=True)
