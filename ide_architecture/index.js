require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { getSoftwareBlueprint } = require('./src/services/architect');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const outputDir = path.join(__dirname, 'outputs');
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

app.post('/analyze-architecture', async (req, res) => {
    try {
        const { prompt } = req.body;

        if (!prompt) {
            return res.status(400).json({
                success: false,
                error: 'Prompt is required in the request body.'
            });
        }

        console.log("📥 Received prompt:", prompt);

        const blueprint = await getSoftwareBlueprint(prompt);

        console.log("✅ Generated blueprint");

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `architecture_${timestamp}.json`;
        const filepath = path.join(outputDir, filename);

        fs.writeFileSync(filepath, JSON.stringify(blueprint, null, 2));

        console.log("💾 Saved file:", filename);

        return res.json({
            success: true,
            file: filename,
            data: blueprint
        });

    } catch (error) {
        console.error('Error in /analyze-architecture:', error.message);
        return res.status(200).json({ 
            success: false, 
            error: "Google AI API Limit Reached: " + error.message,
            suggestion: "Please wait ~60 seconds for your Free Tier per-minute quota to reset."
        });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
