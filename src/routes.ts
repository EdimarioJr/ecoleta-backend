import express from "express";
import itemController from "./controllers/itemController";
import pointController from "./controllers/pointController";
import multer from 'multer'
import multerConfig from "./config/multer"

const routes = express.Router();
const upload = multer(multerConfig)

routes.get("/items", itemController.index);

routes.get("/points", pointController.index);
routes.get("/points/:id", pointController.show);

routes.post("/points",upload.single('image') ,pointController.create);

export default routes;
 