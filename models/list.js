import fs from "fs";

function createList(req, res) {
    try {
        const {title, boardId } = req.body;

        if (!title || !boardId) {
            return res.status(400).send("Title and boardId are required");
        }

        let list = [];

        if (fs.existsSync("list.json")) {
            let data = JSON.parse(fs.readFileSync("list.json", "utf-8"));
            list = data;
        }

        const newList = {
            listId: Date.now(),
            title,
            boardId
        };

        list.push(newList);

        fs.writeFileSync("list.json", JSON.stringify(list, null, 2));

        res.status(201).send("New list created successfully");
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal server Error");
    }
}

export default createList;