require("@babel/polyfill");

const mobilenetModule = require('@tensorflow-models/mobilenet');
const tf = require('@tensorflow/tfjs-node');
const knnClassifier = require('@tensorflow-models/mobilenet');

const fs = require("fs");

const functions = require("firebase-functions");

const admin = require('firebase-admin');
var serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const express = require("express");
const cors = require("cors");

// Main app
const app = express();
app.use(cors({origin: true}));

// Main database reference
const db = admin.firestore();
const storage = admin.storage();

// Routes
app.get("/", (req, res) => {
	return res.status(200).send("Hello world!");
});

// Create -> post()
app.post("/admin/train", (req, res) => {
	(async () => {

        let request = req.body
        
        let name = request.name;

        let imageB64 = request.image;        
        let imageBuffer = Buffer.from(imageB64, "base64");

        var image = tf.node.decodeImage(imageBuffer);
        console.log(image);

        return res.status(200).send(JSON.stringify({status: "Success", message: name}));

		try {
            
		} catch (error) {
			return res.status(500).send(JSON.stringify({status: "Error", message: error}));
		}
	})();
});

// exports the api to firebase cloud functions
exports.api = functions.region('europe-west1').https.onRequest(app);


async function onStart() {
    knn = knnClassifier.create();
    mobilenet = await mobilenetModule.load();
}

onStart();