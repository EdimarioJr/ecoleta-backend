import knex from "../db/connection";
import { Request, Response } from "express";

const itemController = {
  index: async function (request: Request, response: Response) {
    const items = await knex("items").select("*");
    const serializedItems = items.map((current) => {
      return {
        id: current.id,
        title: current.title,
        url_image: `${process.env.API_URL}/uploads/${current.image}`,
      };
    });
    return response.json(serializedItems);
  },
};

export default itemController;
