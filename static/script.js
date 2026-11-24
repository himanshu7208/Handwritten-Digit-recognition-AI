const canvas = document.getElementById("drawingCanvas");
const ctx = canvas.getContext("2d");

const clearBtn = document.getElementById("clearBtn");
const predictBtn = document.getElementById("predictBtn");

const digitResult = document.getElementById("digitResult");
const confidence = document.getElementById("confidence");
const probabilities = document.getElementById("probabilities");
const message = document.getElementById("message");
const history = document.getElementById("history");

let drawing = false;
let hasDrawing = false;

// Initialize canvas
function clearCanvas() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    digitResult.textContent = "?";
    confidence.textContent = "Draw a digit to begin";
    probabilities.innerHTML = "";
    message.textContent = "";

    hasDrawing = false;
}

ctx.lineWidth = 18;
ctx.lineCap = "round";
ctx.lineJoin = "round";
ctx.strokeStyle = "white";

function getPosition(event) {
    const rect = canvas.getBoundingClientRect();

    return {
        x: (event.clientX - rect.left) *
            (canvas.width / rect.width),

        y: (event.clientY - rect.top) *
            (canvas.height / rect.height)
    };
}

canvas.addEventListener("pointerdown", (event) => {
    event.preventDefault();

    drawing = true;
    hasDrawing = true;

    canvas.setPointerCapture(event.pointerId);

    const pos = getPosition(event);

    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    ctx.lineTo(pos.x + 0.1, pos.y + 0.1);
    ctx.stroke();
});

canvas.addEventListener("pointermove", (event) => {
    if (!drawing) return;

    event.preventDefault();

    const pos = getPosition(event);

    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
});

function stopDrawing() {
    drawing = false;
    ctx.closePath();
}

canvas.addEventListener("pointerup", stopDrawing);
canvas.addEventListener("pointercancel", stopDrawing);
canvas.addEventListener("lostpointercapture", stopDrawing);

// Clear drawing
clearBtn.addEventListener("click", clearCanvas);

// Show prediction probabilities
function showProbabilities(data) {
    probabilities.innerHTML = "";

    data.forEach((value, index) => {
        const row = document.createElement("div");
        row.className = "probability-row";

        const label = document.createElement("span");
        label.textContent = index;

        const bar = document.createElement("div");
        bar.className = "bar";

        const fill = document.createElement("div");
        fill.className = "fill";
        fill.style.width = value + "%";

        bar.appendChild(fill);

        const percentage = document.createElement("strong");
        percentage.textContent = value.toFixed(2) + "%";

        row.append(label, bar, percentage);
        probabilities.appendChild(row);
    });
}

// Predict digit
predictBtn.addEventListener("click", async () => {

    if (!hasDrawing) {
        message.textContent = "Please draw a digit first!";
        return;
    }

    predictBtn.disabled = true;
    predictBtn.textContent = "Predicting...";

    message.textContent = "AI is analyzing your drawing...";

    try {
        const imageData = canvas.toDataURL("image/png");

        const response = await fetch("/predict", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                image: imageData
            })
        });

        const responseText = await response.text();

        console.log("Server Response:", responseText);

        let data;

        try {
            data = JSON.parse(responseText);
        } catch (error) {
            throw new Error(
                "Python backend se valid JSON response nahi mila. Check app.py."
            );
        }

        if (!response.ok) {
            throw new Error(data.error || "Prediction failed");
        }

        if (!response.ok) {
            throw new Error(data.error || "Prediction failed");
        }

        digitResult.textContent = data.digit;

        confidence.textContent =
            "Confidence: " + data.confidence + "%";

        showProbabilities(data.probabilities);

        message.textContent = "Prediction successful!";

    } catch (error) {

        console.error(error);
        message.textContent = "Error: " + error.message;

    } finally {

        predictBtn.disabled = false;
        predictBtn.textContent = "Predict Digit →";
    }
});

// Start with a clean canvas
clearCanvas();