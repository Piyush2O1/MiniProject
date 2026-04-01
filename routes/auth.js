import express from "express";
import createUser from "../models/user.js";
import fs from "fs";

const router = express.Router();

router.get("/signup", (req, res) => {
    res.render("signup");
});

router.post("/signup", createUser);

router.get("/login", (req, res) => {
    res.render("login");
});

router.post("/login", (req, res) => {
    try {
        const {
            email,
            password
        } = req.body;

        if (!email || !password) {
            return res.status(400).send("All fields are required");
        }

        if (!fs.existsSync("user.json")) {
            return res.status(404).send("No user found");
        }

        let data = JSON.parse(fs.readFileSync("user.json", "utf-8"));

        let isUser = data.find(user => user.email === email && user.password === password);

        if (!isUser) {
            return res.status(401).send("Invalid email or password");
        }

        req.session.userId = isUser.userId;
        req.session.name = isUser.name;

        res.redirect("/dashboard");
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal server Error");
    }
});

router.get("/logout", (req, res) => {
    try {
        req.session.destroy(() => {
            res.redirect("/login");
        });
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal server Error");
    }
});

export default router;
