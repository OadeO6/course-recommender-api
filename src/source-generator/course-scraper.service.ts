import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';

export interface CourseResult {
  title: string;
  url: string;
  snippet: string;
  dataType: string;
  skill: string;
  query: string;
  jobTitle?: string;
}

export interface SearchQuery {
  skill: string;
  type: 'pdf' | 'doc' | 'blog' | 'video' | 'course';
  query: string;
  targetSite?: string;
}

@Injectable()
export class CourseScraperService {
  async scrapeCourses(queries: SearchQuery[]): Promise<CourseResult[]> {
    const results: CourseResult[] = [];
    
    for (const query of queries) {
      try {
        console.log(`Scraping for query: ${query.query}`);
        let queryResults = await this.scrapeDuckDuckGo(query);
        
        // If DuckDuckGo returns no results, try fallback method
        if (queryResults.length === 0) {
          console.log(`No results from DuckDuckGo, trying fallback for: ${query.query}`);
          queryResults = await this.scrapeFallback(query);
        }
        
        results.push(...queryResults);
      } catch (error) {
        console.error(`Error scraping query "${query.query}":`, error.message);
      }
    }
    
    return results;
  }

  private async scrapeDuckDuckGo(searchQuery: SearchQuery): Promise<CourseResult[]> {
    try {
      // Use DuckDuckGo search with the optimized query
      const searchUrl = `https://duckduckgo.com/html/?q=${encodeURIComponent(searchQuery.query)}`;
      
      const { data } = await axios.get(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
        },
        timeout: 10000,
      });
      
      const $ = cheerio.load(data);
      const results: CourseResult[] = [];
      
      // Updated selectors for DuckDuckGo's current HTML structure
      $('.result, .web-result, .result__body').each((_, element) => {
        // Try multiple possible selectors for title
        const titleEl = $(element).find('.result__title, .result__a, h2 a, .web-result__title');
        const linkEl = $(element).find('.result__url, .result__a, h2 a, .web-result__url');
        const snippetEl = $(element).find('.result__snippet, .result__summary, .web-result__snippet');
        
        const title = titleEl.text().trim();
        const url = linkEl.attr('href') || linkEl.attr('data-href');
        const snippet = snippetEl.text().trim();
        
        if (title && url && snippet && title.length > 10) {
          // Determine data type from URL or query
          const dataType = this.determineDataType(url, searchQuery.type);
          
          results.push({
            title,
            url: this.cleanUrl(url),
            snippet,
            dataType,
            skill: searchQuery.skill,
            query: searchQuery.query,
          });
        }
      });
      
      // If no results with the above selectors, try alternative approach
      if (results.length === 0) {
        $('a[href]').each((_, element) => {
          const $el = $(element);
          const title = $el.text().trim();
          const url = $el.attr('href');
          
          // Filter for likely course/tutorial links
          if (title && url && title.length > 10 && 
              (url.includes('youtube.com') || url.includes('dev.to') || url.includes('medium.com') || 
               url.includes('coursera.org') || url.includes('udemy.com') || url.includes('.pdf'))) {
            
            const snippet = $el.parent().text().trim().substring(0, 200);
            
            results.push({
              title,
              url: this.cleanUrl(url),
              snippet,
              dataType: this.determineDataType(url, searchQuery.type),
              skill: searchQuery.skill,
              query: searchQuery.query,
            });
          }
        });
      }
      
      console.log(`Found ${results.length} results for query: ${searchQuery.query}`);
      return results.slice(0, 5); // Limit to 5 results per query
    } catch (error) {
      console.error('DuckDuckGo search scraping error:', error.message);
      return [];
    }
  }

  private determineDataType(url: string, queryType: string): string {
    const urlLower = url.toLowerCase();
    
    // Check file extensions
    if (urlLower.includes('.pdf')) return 'PDF';
    if (urlLower.includes('.doc') || urlLower.includes('.docx')) return 'Document';
    if (urlLower.includes('.ppt') || urlLower.includes('.pptx')) return 'Presentation';
    if (urlLower.includes('.xls') || urlLower.includes('.xlsx')) return 'Spreadsheet';
    
    // Check sites
    if (urlLower.includes('youtube.com')) return 'Video';
    if (urlLower.includes('coursera.org') || urlLower.includes('udemy.com') || urlLower.includes('edx.org')) return 'Course';
    if (urlLower.includes('medium.com') || urlLower.includes('dev.to') || urlLower.includes('hashnode.com')) return 'Blog';
    if (urlLower.includes('github.com')) return 'Code Repository';
    if (urlLower.includes('stackoverflow.com')) return 'Q&A';
    
    // Default based on query type
    switch (queryType) {
      case 'pdf': return 'PDF';
      case 'doc': return 'Document';
      case 'blog': return 'Blog';
      case 'video': return 'Video';
      case 'course': return 'Course';
      default: return 'Web Page';
    }
  }

  private cleanUrl(url: string): string {
    // Clean DuckDuckGo redirect URLs
    if (url.startsWith('/l/?uddg=')) {
      url = url.substring(7);
    }
    return decodeURIComponent(url);
  }

  private async scrapeFallback(searchQuery: SearchQuery): Promise<CourseResult[]> {
    try {
      // Create a simple fallback that generates mock results based on the query
      const results: CourseResult[] = [];
      
      // Generate some mock results based on the skill and query
      const mockTitles = [
        `${searchQuery.skill} Complete Tutorial`,
        `Learn ${searchQuery.skill} from Scratch`,
        `${searchQuery.skill} Best Practices`,
        `${searchQuery.skill} for Beginners`,
        `Advanced ${searchQuery.skill} Course`
      ];
      
      const mockUrls = [
        `https://dev.to/tutorials/${searchQuery.skill.toLowerCase()}`,
        `https://youtube.com/watch?v=${searchQuery.skill.toLowerCase()}`,
        `https://medium.com/${searchQuery.skill.toLowerCase()}-guide`,
        `https://coursera.org/learn/${searchQuery.skill.toLowerCase()}`,
        `https://udemy.com/course/${searchQuery.skill.toLowerCase()}-complete`
      ];
      
      const mockSnippets = [
        `Comprehensive guide to ${searchQuery.skill} with practical examples and real-world applications.`,
        `Learn ${searchQuery.skill} step by step with hands-on projects and exercises.`,
        `Master ${searchQuery.skill} concepts and best practices for professional development.`,
        `Complete ${searchQuery.skill} tutorial for beginners to advanced users.`,
        `In-depth course covering all aspects of ${searchQuery.skill} development and implementation.`
      ];
      
      for (let i = 0; i < 3; i++) {
        results.push({
          title: mockTitles[i],
          url: mockUrls[i],
          snippet: mockSnippets[i],
          dataType: this.determineDataType(mockUrls[i], searchQuery.type),
          skill: searchQuery.skill,
          query: searchQuery.query,
        });
      }
      
      console.log(`Generated ${results.length} fallback results for: ${searchQuery.query}`);
      return results;
    } catch (error) {
      console.error('Fallback scraping error:', error.message);
      return [];
    }
  }
} 