import path from "path";
import { Router, Request, Response } from "express";
import multer from "multer";

import {
  constructOutputExcel,
  constructXLSXFile,
  fileConv,
} from "../utils/santa";
import { Input, Result } from "../types/santa";

const router = Router();

const multerUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (_1, file, cb) => {
    if (file.mimetype.includes("sheet")) {
      cb(null, true);
    } else {
      (cb as any)("Please upload only CSV or xlsx file.", false);
    }
  },
});

router.post(
  "/santa",
  <any>multerUpload.array("list", 2),
  async (req: Request, response: Response) => {
    try {
      if (req.files?.length) {
        const files = req.files as Express.Multer.File[];

        // throw error if two input files are not given
        if (files.length <= 1) throw new Error("File inputs must be two files");

        // converting the given files to json structure
        const jsonFiles = files.map((file: Express.Multer.File) =>
          fileConv(file)
        );

        //Generate the secret child list for employees
        const santaGiftList = constructOutputExcel(jsonFiles as Input[]);

        // Generate the Result Excel file
        const fileName = "SantaList.xlsx";
        constructXLSXFile(santaGiftList as Result[], fileName);

        response.setHeader(
          "Content-Type",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        response.sendFile(path.join(__dirname, fileName));
      }
    } catch (err: any) {
      response.status(500).send({ error: err.message });
    }
  }
);

export { router as SantaController };
