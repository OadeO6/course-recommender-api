"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CourseScraperService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("axios");
const cheerio = require("cheerio");
let CourseScraperService = class CourseScraperService {
    async scrapeCourses(queries) {
        const results = [];
        for (const query of queries) {
            try {
                console.log(`Scraping for query: ${query.query}`);
                const queryResults = await this.scrapeDuckDuckGo(query);
                results.push(...queryResults);
            }
            catch (error) {
                console.error(`Error scraping query "${query.query}":`, error.message);
            }
        }
        return results;
    }
    async scrapeDuckDuckGo(searchQuery) {
        try {
            const searchUrl = `https://duckduckgo.com/html/?q=${encodeURIComponent(searchQuery.query)}`;
            const { data } = await axios_1.default.get(searchUrl, {
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
            const results = [];
            $('.result').each((_, element) => {
                const titleEl = $(element).find('.result__title');
                const linkEl = $(element).find('.result__url');
                const snippetEl = $(element).find('.result__snippet');
                const title = titleEl.text().trim();
                const url = linkEl.attr('href');
                const snippet = snippetEl.text().trim();
                if (title && url && snippet) {
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
            return results.slice(0, 5);
        }
        catch (error) {
            console.error('DuckDuckGo search scraping error:', error.message);
            return [];
        }
    }
    determineDataType(url, queryType) {
        const urlLower = url.toLowerCase();
        if (urlLower.includes('.pdf'))
            return 'PDF';
        if (urlLower.includes('.doc') || urlLower.includes('.docx'))
            return 'Document';
        if (urlLower.includes('.ppt') || urlLower.includes('.pptx'))
            return 'Presentation';
        if (urlLower.includes('.xls') || urlLower.includes('.xlsx'))
            return 'Spreadsheet';
        if (urlLower.includes('youtube.com'))
            return 'Video';
        if (urlLower.includes('coursera.org') || urlLower.includes('udemy.com') || urlLower.includes('edx.org'))
            return 'Course';
        if (urlLower.includes('medium.com') || urlLower.includes('dev.to') || urlLower.includes('hashnode.com'))
            return 'Blog';
        if (urlLower.includes('github.com'))
            return 'Code Repository';
        if (urlLower.includes('stackoverflow.com'))
            return 'Q&A';
        switch (queryType) {
            case 'pdf': return 'PDF';
            case 'doc': return 'Document';
            case 'blog': return 'Blog';
            case 'video': return 'Video';
            case 'course': return 'Course';
            default: return 'Web Page';
        }
    }
    cleanUrl(url) {
        if (url.startsWith('/l/?uddg=')) {
            url = url.substring(7);
        }
        return decodeURIComponent(url);
    }
};
exports.CourseScraperService = CourseScraperService;
exports.CourseScraperService = CourseScraperService = __decorate([
    (0, common_1.Injectable)()
], CourseScraperService);
//# sourceMappingURL=course-scraper.service.js.map