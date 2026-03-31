
import fs from "fs";

function createCard(req, res) {
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

        res.status(201).send("New card created successfully");
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal server Error");
    }
}

export default createCard;
