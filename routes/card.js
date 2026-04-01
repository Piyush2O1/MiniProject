import express from "express";
import fs from "fs";
import auth from "../middleware/auth.js";

const router = express.Router();

router.post("/create-card", auth, (req, res) => {
    try {
        const {
            title,
            description,
            dueDate,
            listId
        } = req.body;

        if (!title || !listId) {
            return res.status(400).send("Title and listId are required");
        }

        let card = [];

        if (fs.existsSync("card.json")) {
            let data = JSON.parse(fs.readFileSync("card.json", "utf-8"));
            card = data;
        }

        const newCard = {
            cardId: Date.now(),
            title,
            description,
            dueDate,
            listId
        };

        card.push(newCard);

        fs.writeFileSync("card.json", JSON.stringify(card, null, 2));

        res.send("New card created successfully");
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal server Error");
    }
});

router.post("/move-card", auth, (req, res) => {
    try {
        const {
            cardId,
            newListId
        } = req.body;

        if (!cardId || !newListId) {
            return res.status(400).send("cardId and newListId are required");
        }

        if (!fs.existsSync("card.json")) {
            return res.status(404).send("No card found");
        }

        let data = JSON.parse(fs.readFileSync("card.json", "utf-8"));

        let cardIndex = data.findIndex(card => card.cardId == cardId);

        if (cardIndex === -1) {
            return res.status(404).send("Card not found");
        }

        data[cardIndex].listId = newListId;

        fs.writeFileSync("card.json", JSON.stringify(data, null, 2));

        res.send("Card moved successfully");
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal server Error");
    }
});

router.get("/cards/:listId", auth, (req, res) => {
    try {
        const {
            listId
        } = req.params;

        let card = [];

        if (fs.existsSync("card.json")) {
            let data = JSON.parse(fs.readFileSync("card.json", "utf-8"));
            card = data.filter(card => card.listId == listId);
        }

        res.send(card);
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal server Error");
    }
});

export default router;
