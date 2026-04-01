import express from "express";
import fs from "fs";
import auth from "../middleware/auth.js";

const router = express.Router();

router.get("/dashboard", auth, (req, res) => {
    try {
        let board = [];

        if (fs.existsSync("board.json")) {
            let data = JSON.parse(fs.readFileSync("board.json", "utf-8"));
            board = data.filter(board => board.userId == req.session.userId);
        }

        res.render("dashboard", { board });
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal server Error");
    }
});

router.post("/create-board", auth, (req, res) => {
    try {
        const {
            title
        } = req.body;

        if (!title) {
            return res.status(400).send("Board title is required");
        }

        let board = [];

        if (fs.existsSync("board.json")) {
            let data = JSON.parse(fs.readFileSync("board.json", "utf-8"));
            board = data;
        }

        const newBoard = {
            boardId: Date.now(),
            title,
            userId: req.session.userId
        };

        board.push(newBoard);

        fs.writeFileSync("board.json", JSON.stringify(board, null, 2));

        res.redirect("/dashboard");
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal server Error");
    }
});

export default router;
