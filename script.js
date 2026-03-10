document.addEventListener("DOMContentLoaded", () => {
    const themeToggle = document.querySelector(".theme-toggle");
    const promptForm = document.querySelector(".prompt-form");
    const promptInput = document.querySelector(".prompt-input");
    const promptBtn = document.querySelector(".prompt-btn");
    const modelSelect = document.getElementById("model-select");
    const countSelect = document.getElementById("count-select");
    const ratioSelect = document.getElementById("ratio-select");
    const gridGallery = document.querySelector(".gallery-grid");

    const API_KEY = "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";
    const examplePrompts = [
        "A magic forest with glowing plants and fairy homes among giant mushrooms",
        "Cyberpunk city skyline at night with neon lights",
        "Cute robot making pancakes in a futuristic kitchen",
        "Floating castle above glowing clouds",
        "Astronaut sipping chai on Mars",
        "Magical library inside a volcano",
        "Steampunk submarine with jellyfish lights",
        "Robot dragon soaring over neon city",
        "Crystal portal in a desert cave",
        "Alien garden glowing in moonlight",
    ];

    // Theme stuff
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDarkTheme = savedTheme === "dark" || (!savedTheme && prefersDark);
    document.body.classList.toggle("dark-theme", isDarkTheme);

    const icon = themeToggle.querySelector("i");
    if (icon) icon.className = isDarkTheme ? "fa-solid fa-sun" : "fa-solid fa-moon";

    themeToggle.addEventListener("click", () => {
        const isDark = document.body.classList.toggle("dark-theme");
        localStorage.setItem("theme", isDark ? "dark" : "light");
        if (icon) icon.className = isDark ? "fa-solid fa-sun" : "fa-solid fa-moon";
    });

    const getImageDimensions = (aspectRatio, baseSize = 512) => {
        const [w, h] = aspectRatio.split("/").map(Number);
        const scale = baseSize / Math.sqrt(w * h);
        let width = Math.floor((w * scale) / 16) * 16;
        let height = Math.floor((h * scale) / 16) * 16;
        return { width, height };
    };

    const updateImageCard = (index, imageUrl) => {
        const card = document.getElementById(`img-card-${index}`);
        if (!card) return;
        card.classList.remove("loading");
        card.innerHTML = `
            <img src="${imageUrl}" class="result-img" />
            <div class="img-overlay">
                <a href="${imageUrl}" class="img-download-btn" download="${Date.now()}.png">
                    <i class="fa-solid fa-download"></i>
                </a>
            </div>`;
    };

    const generateImages = async (model, count, ratio, prompt) => {
        const MODEL_URL = `https://router.huggingface.co/hf-inference/models/${model}`;
        const { width, height } = getImageDimensions(ratio);

        const promises = Array.from({ length: count }, async (_, i) => {
            try {
                const res = await fetch(MODEL_URL, {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${API_KEY}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        inputs: prompt,
                        parameters: { width, height },
                        options: { wait_for_model: true }
                    })
                });

                if (!res.ok) throw new Error((await res.json())?.error);

                const blob = await res.blob();
                updateImageCard(i, URL.createObjectURL(blob));
            } catch (err) {
                console.error("Error:", err.message);
            }
        });

        await Promise.allSettled(promises);
    };

    const createImageCards = (model, count, ratio, prompt) => {
        gridGallery.innerHTML = "";
        for (let i = 0; i < count; i++) {
            gridGallery.innerHTML += `
                <div class="img-card loading" id="img-card-${i}" style="aspect-ratio: ${ratio}">
                    <div class="status-container">
                        <div class="spinner"></div>
                        <i class="fa-solid fa-triangle-exclamation"></i>
                        <p class="status-text">Generating...</p>
                    </div>
                </div>`;
        }
        generateImages(model, count, ratio, prompt);
    };

    promptBtn.addEventListener("click", () => {
        const random = examplePrompts[Math.floor(Math.random() * examplePrompts.length)];
        promptInput.value = random;
    });

    promptForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const model = modelSelect.value;
        const count = parseInt(countSelect.value) || 1;
        const ratio = ratioSelect.value || "1/1";
        const prompt = promptInput.value.trim();

        createImageCards(model, count, ratio, prompt);
    });

    // New code for landing page button
    const landingPage = document.getElementById("landing-page");
    const mainContainer = document.getElementById("main-container");
    const getStartedBtn = document.getElementById("get-started-btn");

    getStartedBtn.addEventListener("click", () => {
        landingPage.style.display = "none";
        mainContainer.style.display = "block";
    });
});
