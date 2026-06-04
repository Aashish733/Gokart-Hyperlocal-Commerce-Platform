import axios from "axios";
import getBuffer from "../config/datauri.js";
import { AuthenticatedRequest } from "../middlewares/isAuth.js";
import TryCatch from "../middlewares/trycatch.js";
import Store from "../models/Store.js";
import MenuItems from "../models/MenuItems.js";

export const addMenuItem = TryCatch(async (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    return res.status(401).json({
      message: "Please login",
    });
  }

  const store = await Store.findOne({ ownerId: req.user._id });

  if (!store) {
    return res.status(404).json({
      message: "NO Store found",
    });
  }

  const { name, description, price } = req.body;

  if (!name || !price) {
    return res.status(400).json({
      message: "Name and price are required",
    });
  }

  const file = req.file;

  if (!file) {
    return res.status(400).json({
      message: "Please give image",
    });
  }

  const fileBuffer = getBuffer(file);

  if (!fileBuffer?.content) {
    return res.status(500).json({
      message: "Failed to create file buffer",
    });
  }

  const { data: uploadResult } = await axios.post(
    `${process.env.UTILS_SERVICE}/api/upload`,
    {
      buffer: fileBuffer.content,
    },
  );

  const item = await MenuItems.create({
    name,
    description,
    price,
    storeId: store._id,
    image: uploadResult.url,
  });

  res.json({
    message: "Item Added Successfully",
    item,
  });
});

export const getAllItems = TryCatch(async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({
      message: "Id is required",
    });
  }
  const items = await MenuItems.find({ storeId: id });
  res.json(items);
});

export const deleteMenuItem = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    if (!req.user) {
      return res.status(401).json({
        message: "Please login",
      });
    }

    const { itemId } = req.params;
    if (!itemId) {
      return res.status(400).json({
        message: "Id is required",
      });
    }

    const item = await MenuItems.findById(itemId);

    if (!item) {
      return res.status(404).json({
        message: "No item found",
      });
    }

    const store = await Store.findOne({
      _id: item.storeId,
      ownerId: req.user._id,
    });

    if (!store) {
      return res.status(404).json({
        message: "NO Store found",
      });
    }

    await item.deleteOne();

    res.json({
      message: "Menu item deleted successfully",
    });
  },
);

export const toggleMenuItemAvailability = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    if (!req.user) {
      return res.status(401).json({
        message: "Please login",
      });
    }

    const { itemId } = req.params;
    if (!itemId) {
      return res.status(400).json({
        message: "Id is required",
      });
    }

    const item = await MenuItems.findById(itemId);

    if (!item) {
      return res.status(404).json({
        message: "No item found",
      });
    }

    const store = await Store.findOne({
      _id: item.storeId,
      ownerId: req.user._id,
    });

    if (!store) {
      return res.status(404).json({
        message: "NO Store found",
      });
    }

    item.isAvailable = !item.isAvailable;
    await item.save();

    res.json({
      message: `Item Marked as ${
        item.isAvailable ? "available" : "unavailable"
      }`,
      item,
    });
  },
);
