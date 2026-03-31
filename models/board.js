import fs from "fs";

function createBoard(req, res) {
    try {
        const {
            title,
            userId
        } = req.body;

        if (!title || !userId) {
            return res.status(400).send("Title and userId are required");
        }

        let board = [];

        if (fs.existsSync("board.json")) {
            let data = JSON.parse(fs.readFileSync("board.json", "utf-8"));
            board = data;
        }

        const newBoard = {
            boardId: Date.now(),
            title,
            userId
        };

        board.push(newBoard);

        fs.writeFileSync("board.json", JSON.stringify(board, null, 2));

        res.status(201).send("New board created successfully");
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal server Error");
    }
}

export default createBoard;