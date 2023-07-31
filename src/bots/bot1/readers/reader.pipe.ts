import {Context} from "../../../../core/interfaces/etl/pipes/dispatcher/pipe.interface";
import {ReaderPipeInterface} from "../../../../core/interfaces/etl/pipes/readers/reader.pipe.interface";
import {Bot1Config} from "../configs/base.config";
import * as puppeteer from "puppeteer";

export const Bot1ReaderPipe: ReaderPipeInterface = async (ctx: Context) => {
  const browser = await puppeteer.launch({
    headless: false,
  });
  const page = await browser.newPage();
  await page.setViewport({
    width:1200, height:800,
    deviceScaleFactor:1,
  })
  await page.goto(Bot1Config.url, {waitUntil: 'networkidle2'});
  await page.waitForTimeout(2000)
    console.log('out of reader')
   return {
    ...ctx,
     page,
     browser
   }

};
