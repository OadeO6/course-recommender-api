import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { CourseResult, SearchQuery } from './course-scraper.service';


const AGGRIGATOR_BASE_URL=process.env.AGGRIGATOR_BASE_URL;

@Injectable()
export class DataFromApiService {
  async getACoursesFromApi(queries: SearchQuery[]): Promise<CourseResult[]> {
    // let result = await Promise.all(
    //   queries.map(q => this.getApiData(q.query))
    // );
    const result: CourseResult[] = [];
    let res: CourseResult[];
    for (const query of queries) {
      res = await this.getApiData(query.query);
      result.push(...res);
    }
    return result;
  }


  async getApiData(query: string): Promise<CourseResult[]> {
    try {
      const { data } = await axios.get(`${AGGRIGATOR_BASE_URL}/courses/coursera?q=${encodeURIComponent(query)}`);
      // console.log('data', data);
      return data.map( (d: CourseResult) => ({
        ...d,
        dataYype: 'Course', // TODO: Use enum for the dataType
      }));
    } catch (er) {
      console.log(er);
      throw er;
    }
  }
}
// NOTE: point 1
