import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class DataFromApiService {
  async getApiData(): Promise<any> {
    // Example API call
    const { data } = await axios.get('https://api.publicapis.org/entries');
    return data;
  }
} 