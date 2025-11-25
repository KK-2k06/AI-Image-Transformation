# ==========================================================
# 🎨 AI Image Transformation — Modular Backend (6 Styles + Auth + SQLiteCloud)
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
@app.after_request
def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, ngrok-skip-browser-warning"  # ✅ Added ngrok header
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, DELETE, OPTIONS"
    # ✅ Ensure Content-Type is preserved for JSON responses
    if 'Content-Type' not in response.headers:
        response.headers['Content-Type'] = 'application/json'
    return response

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
            generations_left INTEGER DEFAULT 5,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.execute('''
        CREATE TABLE IF NOT EXISTS image_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            style TEXT NOT NULL,
            original_image TEXT NOT NULL,
            transformed_image TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    ''')
    conn.execute('''
        CREATE TABLE IF NOT EXISTS payments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            payment_method TEXT NOT NULL,
            upi_id TEXT,
            card_full_name TEXT,
            card_email TEXT,
            card_address TEXT,
            card_city TEXT,
            card_state TEXT,
            card_zip_code TEXT,
            card_name_on_card TEXT,
            card_number TEXT,
            card_exp_month TEXT,
            card_exp_year TEXT,
            card_cvv TEXT,
            amount REAL NOT NULL,
            generations_added INTEGER NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
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
    cursor = conn.execute('SELECT id, first_name, last_name, email, password_hash, generations_left FROM users WHERE email = ?', (email.lower(),))
    user = cursor.fetchone()
    conn.close()

    if not user or not bcrypt.checkpw(password.encode('utf-8'), user[4].encode('utf-8')):
        return jsonify({'error': 'Invalid email or password'}), 401

    return jsonify({
        'id': user[0], 
        'firstName': user[1], 
        'lastName': user[2], 
        'email': user[3],
        'generationsLeft': user[5] if user[5] is not None else 5
    })

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

        # ----------------------------
        # ✅ GPU FIRST (CUDAExecutionProvider)
        # ----------------------------
        try:
            loaded_pipelines[style] = ort.InferenceSession(
                path,
                providers=["CUDAExecutionProvider", "CPUExecutionProvider"]
            )
            print("⚡ Ghibli ONNX is running on GPU!")
        except Exception as e:
            print("⚠️ GPU unavailable for ONNX, falling back to CPU:", e)
            loaded_pipelines[style] = ort.InferenceSession(
                path,
                providers=["CPUExecutionProvider"]
            )
            print("🐌 Ghibli ONNX is using CPU.")

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
    generator = torch.Generator(device).manual_seed(42)
    with torch.autocast("cuda", enabled=(device == "cuda")):
        result = pipe(prompt=prompt, negative_prompt=neg, image=init_image,
                      strength=0.5, guidance_scale=7.5, num_inference_steps=15, generator=generator)
    return result.images[0]

def generate_cartoon(init_image):
    pipe = get_pipeline("cartoon")
    prompt = "classic disney style, best quality, original features"
    neg = "worst quality, extra objects, bad features"
    generator = torch.Generator(device).manual_seed(42)
    with torch.autocast("cuda", enabled=(device == "cuda")):
        result = pipe(prompt=prompt, negative_prompt=neg, image=init_image,
                      strength=0.5, guidance_scale=8.0, num_inference_steps=35, generator=generator)
    return result.images[0]

def generate_comic(init_image):
    pipe = get_pipeline("comic")
    prompt = (
        "Comic-style, highly detailed, vibrant colors, dynamic lighting"
        "expressive characters or environments, clean lineart, smooth shading"
        "dramatic perspective, whimsical and lively, polished digital art."
    )
    neg = "realistic, photo, human skin texture, blurry, dull colors, modern lighting"
    generator = torch.Generator(device).manual_seed(42)
    with torch.autocast("cuda", enabled=(device == "cuda")):
        result = pipe(prompt=prompt, negative_prompt=neg, image=init_image,
                      strength=0.45, guidance_scale=8.5, num_inference_steps=35, generator=generator)
    return result.images[0]

def generate_ghibli(init_image):
    session = get_pipeline("ghibli")

    # Resize + convert to numpy RGB
    img = init_image.resize((512, 512)).convert("RGB")

    # AnimeGAN expects float32 in range [-1, 1] with shape (1, 512, 512, 3)
    img_np = np.asarray(img).astype(np.float32)
    img_np = img_np / 127.5 - 1.0      # scale to [-1,1]
    img_np = np.expand_dims(img_np, axis=0)   # → (1,512,512,3)

    # ✔ Correct input name
    input_name = session.get_inputs()[0].name

    out = session.run(None, {input_name: img_np})[0][0]

    # Output is in [-1,1], convert back
    out = ((out + 1) * 127.5).clip(0, 255).astype(np.uint8)

    return Image.fromarray(out)


def generate_oil_pastel(file):
    np_img = np.frombuffer(file.read(), np.uint8)
    img = cv2.imdecode(np_img, cv2.IMREAD_COLOR)
    img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    grainy_oil = cv2.xphoto.oilPainting(img_rgb, size=2, dynRatio=1)
    grainy_bgr = cv2.cvtColor(grainy_oil, cv2.COLOR_RGB2BGR)
    _, buffer = cv2.imencode('.png', grainy_bgr)
    return base64.b64encode(buffer).decode('utf-8')

def generate_sketch(file):
    np_img = np.frombuffer(file.read(), np.uint8)
    img = cv2.imdecode(np_img, cv2.IMREAD_COLOR)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
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
    user_id = request.form.get("user_id")  # Get user_id from form data

    # Check generations left for the user
    if user_id:
        try:
            conn = get_db_connection()
            cursor = conn.execute('SELECT generations_left FROM users WHERE id = ?', (int(user_id),))
            user = cursor.fetchone()
            conn.close()
            
            if user:
                generations_left = user[0] if user[0] is not None else 5
                if generations_left <= 0:
                    return jsonify({"error": "No generations left", "generationsLeft": 0}), 403
            else:
                return jsonify({"error": "User not found"}), 404
        except Exception as e:
            print(f"⚠️ Error checking generations: {e}")
            return jsonify({"error": "Failed to check generations"}), 500

    try:
        # Read original image for history
        file.seek(0)
        original_img_bytes = file.read()
        original_img_base64 = base64.b64encode(original_img_bytes).decode("utf-8")
        
        # Reset file pointer for processing
        file.seek(0)
        
        if style == "sketch":
            transformed_img_base64 = generate_sketch(file)
        elif style == "oil":
            transformed_img_base64 = generate_oil_pastel(file)
        else:
            init_image = Image.open(file.stream).convert("RGB").resize((768, 768))

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
            transformed_img_base64 = base64.b64encode(buffered.getvalue()).decode("utf-8")

        # Save to history and decrement counter if user_id is provided
        if user_id:
            try:
                conn = get_db_connection()
                # Save history
                conn.execute(
                    'INSERT INTO image_history (user_id, style, original_image, transformed_image) VALUES (?, ?, ?, ?)',
                    (int(user_id), style, original_img_base64, transformed_img_base64)
                )
                # Decrement generations_left
                conn.execute(
                    'UPDATE users SET generations_left = generations_left - 1 WHERE id = ?',
                    (int(user_id),)
                )
                conn.commit()  # Commit the transaction
                
                # Get updated generations_left
                cursor = conn.execute('SELECT generations_left FROM users WHERE id = ?', (int(user_id),))
                updated_user = cursor.fetchone()
                new_generations_left = updated_user[0] if updated_user else 0
                
                conn.close()
                print(f"✅ History saved for user {user_id}, style: {style}, generations left: {new_generations_left}")
                
                return jsonify({"image": transformed_img_base64, "generationsLeft": new_generations_left})
            except Exception as e:
                print(f"⚠️ Failed to save history: {e}")
                import traceback
                traceback.print_exc()

        return jsonify({"image": transformed_img_base64})

    except Exception as e:
        print("❌ Error:", e)
        return jsonify({"error": str(e)}), 500

# ==========================================================
# 👤 USER ENDPOINTS
# ==========================================================
@app.route("/api/user/<int:user_id>/generations", methods=["GET"])
def get_generations(user_id):
    """Get remaining generations for a user"""
    try:
        conn = get_db_connection()
        cursor = conn.execute('SELECT generations_left FROM users WHERE id = ?', (user_id,))
        user = cursor.fetchone()
        conn.close()
        
        if user:
            return jsonify({'generationsLeft': user[0] if user[0] is not None else 5})
        else:
            return jsonify({'error': 'User not found'}), 404
    except Exception as e:
        print("❌ Error fetching generations:", e)
        return jsonify({"error": str(e)}), 500


@app.route("/api/payment", methods=["POST"])
def process_payment():
    """Process payment and add generations"""
    data = request.get_json()
    user_id = data.get('user_id')
    payment_method = data.get('payment_method')
    upi_id = data.get('upi_id')
    card_details = data.get('card_details', {})
    amount = data.get('amount', 50)
    generations_to_add = data.get('generations', 5)
    
    if not user_id or not payment_method:
        return jsonify({'error': 'Missing required fields'}), 400
    
    try:
        conn = get_db_connection()
        
        # Record payment with all details
        if payment_method == "Card":
            # Store all card details
            conn.execute(
                '''INSERT INTO payments (
                    user_id, payment_method, amount, generations_added,
                    card_full_name, card_email, card_address, card_city, card_state, card_zip_code,
                    card_name_on_card, card_number, card_exp_month, card_exp_year, card_cvv
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)''',
                (
                    int(user_id), payment_method, float(amount), int(generations_to_add),
                    card_details.get('fullName'), card_details.get('email'), 
                    card_details.get('address'), card_details.get('city'),
                    card_details.get('state'), card_details.get('zipCode'),
                    card_details.get('nameOnCard'), card_details.get('cardNumber'),
                    card_details.get('expMonth'), card_details.get('expYear'),
                    card_details.get('cvv')
                )
            )
        else:
            # Store UPI payment
            conn.execute(
                'INSERT INTO payments (user_id, payment_method, upi_id, amount, generations_added) VALUES (?, ?, ?, ?, ?)',
                (int(user_id), payment_method, upi_id, float(amount), int(generations_to_add))
            )
        
        # Add generations to user
        conn.execute(
            'UPDATE users SET generations_left = generations_left + ? WHERE id = ?',
            (int(generations_to_add), int(user_id))
        )
        
        conn.commit()
        
        # Get updated generations
        cursor = conn.execute('SELECT generations_left FROM users WHERE id = ?', (int(user_id),))
        user = cursor.fetchone()
        new_generations = user[0] if user else 0
        
        conn.close()
        
        print(f"✅ Payment processed for user {user_id}: +{generations_to_add} generations")
        
        return jsonify({
            'success': True,
            'generationsLeft': new_generations,
            'message': f'{generations_to_add} generations added successfully!'
        })
        
    except Exception as e:
        print(f"❌ Payment error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


# ==========================================================
# 📜 HISTORY ENDPOINTS
# ==========================================================
@app.route("/api/history/<int:user_id>", methods=["GET"])
def get_history(user_id):
    """Get all image history for a user"""
    try:
        conn = get_db_connection()
        cursor = conn.execute(
            'SELECT id, style, original_image, transformed_image, created_at FROM image_history WHERE user_id = ? ORDER BY created_at DESC',
            (user_id,)
        )
        history = cursor.fetchall()
        conn.close()

        result = []
        for row in history:
            result.append({
                'id': row[0],
                'style': row[1],
                'original_image': row[2],
                'transformed_image': row[3],
                'created_at': row[4]
            })

        return jsonify({'history': result})
    except Exception as e:
        print("❌ Error fetching history:", e)
        return jsonify({"error": str(e)}), 500


@app.route("/api/history/<int:history_id>", methods=["DELETE"])
def delete_history(history_id):
    """Delete a specific history item"""
    try:
        conn = get_db_connection()
        conn.execute('DELETE FROM image_history WHERE id = ?', (history_id,))
        conn.close()
        return jsonify({'message': 'History item deleted successfully'})
    except Exception as e:
        print("❌ Error deleting history:", e)
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
