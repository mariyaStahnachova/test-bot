import {Context} from "../../../../core/interfaces/etl/pipes/dispatcher/pipe.interface";

export const Bot1ProcessorPipe = async (context: Context) => {
  const input = await context.page.$("input")
  await input.click()
  await input.type('sometext')
  const button = await context.page.waitForSelector('[class="css-18t94o4 css-1dbjc4n r-sdzlij r-1phboty r-rs99b7 r-ywje51 r-usiww2 r-2yi16 r-1qi8awa r-1ny4l3l r-ymttw5 r-o7ynqc r-6416eg r-lrvibr r-13qz1uu"]')
  // await button.click()
  await context.page.keyboard.press("Enter", {delay:1000})
  await context.browser.close();
  return context
};
