import knex from "../db/connection";
import { Request, Response } from "express";

interface Item {
  id: number;
  title: string;
  image: string;
  url_image?: string;
}

interface Point {
  id: number;
  image: string;
  name: string;
  email: string;
  whatsapp: string;
  latitude: number;
  longitude: number;
  city: string;
  uf: string;
  items: Item[];
  url_image?: string;
}

const pointController = {
  create: async function (request: Request, response: Response) {
    const {
      name,
      email,
      whatsapp,
      latitude,
      longitude,
      city,
      uf,
      items,
    } = request.body;

    const trx = await knex.transaction();

    const insertedIds = await trx("points").insert({
      image: request.file.filename,
      name,
      email,
      whatsapp,
      latitude,
      longitude,
      city,
      uf,
    });

    const point_id = insertedIds[0];

    const pointItems = items
      .split(",")
      .map((item: string) => Number(item.trim()))
      .map((item_id: number) => {
        return {
          item_id,
          point_id,
        };
      });

    await trx("point_items").insert(pointItems);

    await trx.commit();

    return response.json({ success: true });
  },

  show: async function (request: Request, response: Response) {
    const idPoint = request.params.id;
    const point = await knex("points")
      .where({
        id: idPoint,
      })
      .first();

    if (!point) {
      return response.status(404).json({ message: "Point não encontrado!" });
    } else {
      const items = await knex("items")
        .join("point_items", "items.id", "=", "point_items.item_id")
        .where("point_items.point_id", idPoint)
        .select("items.title");

      const serializedPoint = {
        ...point,
        url_image: `http://localhost:3000/uploads/${point.image}`,
      };

      return response.json({ point: serializedPoint, items });
    }
  },

  index: async function (request: Request, response: Response) {
    const { city, uf } = request.query;
    let points = await knex("points")
      .where("city", city ? String(city) : "Araci")
      .where("uf", uf ? String(uf) : "BA")
      .distinct()
      .select("points.*");

    function getItems(){
      return Promise.all(
        points.map(async function (point: Point) {
          point["items"] = await knex("items")
            .join("point_items", "items.id", "=", "point_items.item_id")
            .where("point_id", point.id)
            .distinct()
            .select("items.*");
          return point;
        })
      );
    }

    const newPoints: Point[] = await getItems();
    console.log(newPoints);
    const serializedPoints = newPoints.map((point: Point) => {
      point.items = point.items.map((item: Item) => {
        return {
          ...item,
          url_image: `http://localhost:3000/uploads/${item.image}`,
        };
      });
      return {
        ...point,
        url_image: `http://localhost:3000/uploads/${point.image}`,
      };
    });

    return response.json({ points: serializedPoints });
  },
};

export default pointController;
