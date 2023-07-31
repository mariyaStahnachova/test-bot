import { BaseConfig } from '../../configs/base.config.interface';
import * as puppeteer from 'puppeteer'
export type Context = {
  initialData: any;
  data: any;
  error: any;
  responseStatus: any;
  pipeError: boolean;
  iterations?: BaseConfig[];
  repeats?: number;
  config: BaseConfig;
  page?: puppeteer.Page;
  browser?: puppeteer.Browser;
};

