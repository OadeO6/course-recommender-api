import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';

@Injectable()
export class SourceGeneratorService {
  async getExampleTitle(): Promise<string> {
    const { data } = await axios.get('https://example.com');
    const $ = cheerio.load(data);
    return $('title').text();
  }
} 