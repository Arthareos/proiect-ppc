require("@babel/polyfill");

const mobilenetModule = require("@tensorflow-models/mobilenet");
const tf = require("@tensorflow/tfjs-node");
const knnClassifier = require("@tensorflow-models/knn-classifier");

const functions = require("firebase-functions");

const admin = require("firebase-admin");
var serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
});

const express = require("express");
const cors = require("cors");

// Main app
const app = express();
app.use(cors({ origin: true }));

// Routes
app.get("/", (req, res) => {
	return res.status(200).send("Hello world!");
});

// K value for KNN
const TOPK = 10;

let knn;
let mobilenet;

// Create -> post()
app.post("/admin/train", (req, res) => {
	(async () => {
		try {
			await onStart();

			let request = req.body;

			let name = request.name;

			let imageB64 = request.image;
			let imageBuffer = Buffer.from(imageB64, "base64");

			var image = tf.node.decodeImage(imageBuffer);

			let logits;
			// 'conv_preds' is the logits activation of MobileNet.
			const infer = () => mobilenet.infer(image, "conv_preds");

			logits = infer();

			// Add current image to classifier
			knn.addExample(logits, name);

			return res
				.status(200)
				.send(
					JSON.stringify({
						status: "Success",
						message: "Network trained successfully",
					})
				);
		} catch (error) {
			return res
				.status(500)
				.send(JSON.stringify({ status: "Error", message: error }));
		}
	})();
});

app.post("/whoami", (req, res) => {
	(async () => {
		try {
			await onStart();

			let request = req.body;
			let imageB64 = request.image;
			let imageBuffer = Buffer.from(imageB64, "base64");
			var image = tf.node.decodeImage(imageBuffer);

			let logits;
			// 'conv_preds' is the logits activation of MobileNet.
			const infer = () => mobilenet.infer(image, "conv_preds");

			logits = infer();

			const numClasses = knn.getNumClasses();
			if (numClasses > 0) {
				// If classes have been added run predict
				logits = infer();
				const resPredict = await knn.predictClass(logits, TOPK);

				// var classIndex = resPredict.classIndex;
				var label = resPredict.label;
				// var confidence = resPredict.confidences[0];

				console.log(resPredict);
			} else {
				return res
					.status(500)
					.send(
						JSON.stringify({ status: "Error", message: "No models are here!" })
					);
			}

			return res
				.status(200)
				.send(JSON.stringify({ status: "Success", name: label }));
		} catch (error) {
			return res
				.status(500)
				.send(JSON.stringify({ status: "Error", message: error }));
		}
	})();
});

async function onStart() {
	if (knn === undefined) knn = knnClassifier.create();

	if (mobilenet === undefined) mobilenet = await mobilenetModule.load();
}

// exports the api to firebase cloud functions
exports.api = functions.region("europe-west1").https.onRequest(app);
