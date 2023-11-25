const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { faker } = require('@faker-js/faker');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// OpenAI settings
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Middleware to parse JSON bodies
app.use(bodyParser.json());
app.use(cors());

// POST route to receive a question and return an answer
app.post('/question', async (req, res) => {
    const { question } = req.body;

    if (!question) {
        return res.status(400).send({ error: 'No question provided' });
    }

    try {
        const response = await fetch(OPENAI_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                temperature: 0.2,
                "messages": [
                    {
                      "role": "system",
                      "content": "You are a legal advice AI, fluent in Italian, designed to provide general guidance on legal matters in Italy. If the question is not about legal matter, dismiss it politely. You must not generate legal documents, letters or offer personalized legal advice, and including disclaimers about the general nature of the advice or the need for personalized legal counsel in your responses. Focus on answering user queries within the scope of general legal information, while keeping your responses specific to the questions asked. Do not mention that you are a bot and this legal advice is not a substitute for a lawyer, as this is explicitly written in the context of the conversation."
                    },
                    {
                      "role": "user",
                      "content": question
                    }
                  ],
                max_tokens: 1500
            })
        });

        const data = await response.json();

        // string manipulation to remove last paragraph that is the same for every answer (the disclaimer), only if the answer is longer than 1 paragraph
        if (data.choices[0].message.content.split("\n\n").length > 1)
            data.choices[0].message.content = data.choices[0].message.content.split("\n\n").slice(0, -1).join("\n\n");

        // create sources array (mocked for now)
        const sources = ["https://www.madonnas.it/PISA/CORSI/TP/codice_civile.pdf", "https://platform.openai.com/docs/models/gpt-3-5", "https://en.wikipedia.org/wiki/Sources_of_law?useskin=vector"]

        // create a list of professionsist (mocked for now) (actual implementation will require a database)
        const specialties = ["penale","civile", "famiglia", "lavoro", "immobiliare", "amministrativo", "commerciale", "tributario", "internazionale", "ambientale", "marittimo", "sportivo", "tecnologico", "militare", "sanitario", "culturale", "artistico", "religioso", "alimentare", "animalista", "fiscale", "informatico"]
        const professionsists = [ 
            {name : faker.person.fullName(), specialty : specialties[Math.floor(Math.random() * specialties.length)], rating: Math.floor(Math.random()*5 + 1) * 0.5 + 2.5}, 
            {name : faker.person.fullName(), specialty : specialties[Math.floor(Math.random() * specialties.length)], rating: Math.floor(Math.random()*5 + 1) * 0.5 + 2.5}, 
            {name : faker.person.fullName(), specialty : specialties[Math.floor(Math.random() * specialties.length)], rating: Math.floor(Math.random()*5 + 1) * 0.5 + 2.5}, 
            {name : faker.person.fullName(), specialty : specialties[Math.floor(Math.random() * specialties.length)], rating: Math.floor(Math.random()*5 + 1) * 0.5 + 2.5}, 
            {name : faker.person.fullName(), specialty : specialties[Math.floor(Math.random() * specialties.length)], rating: Math.floor(Math.random()*5 + 1) * 0.5 + 2.5}
        ]

        if (response.ok) {
            res.send({ answer: data.choices[0].message.content.trim(), sources: sources, professionsists});
        } else {
            res.status(response.status).send({ error: data.error });
        }
    } catch (error) {
        res.status(500).send({ error: 'Internal Server Error' });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});