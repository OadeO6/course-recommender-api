const axios = require('axios');
const cheerio = require('cheerio');
async function fetchUdemyCourseDetails(courseUrl) {
    try {
        const { data } = await axios.get(courseUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0',
            },
        });
        const $ = cheerio.load(data);
        const title = $('h1.clp-lead__title').text().trim();
        const subtitle = $('div.clp-lead__headline').text().trim();
        const price = $('[data-purpose="discount-price-text"]').text().trim();
        const rating = $('[data-purpose="rating-number"]').first().text().trim();
        const students = $('span[data-purpose="enrollment"]').text().trim();
        const instructor = $('a[data-purpose="instructor-name-top"]').text().trim();
        return {
            title,
            subtitle,
            price,
            rating,
            students,
            instructor,
            url: courseUrl,
        };
    }
    catch (error) {
        console.error(`Error scraping ${courseUrl}:`, error.message);
        return null;
    }
}
(async () => {
    const url = 'https://www.udemy.com/course/understanding-typescript/';
    const course = await fetchUdemyCourseDetails(url);
    console.log(course);
})();
//# sourceMappingURL=test.js.map