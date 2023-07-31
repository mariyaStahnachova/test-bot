import {BotsFactory} from "./src/bots/bot.factory";

export const startApp = async () => {
  try {const y = new BotsFactory().entity('Bot1').getBot1();} catch (error) {console.error('There an error running getBot1', error);}
  console.log("Loaded bot1");
};
startApp().then(r => console.log('finished'));
