declare const axios: any;
declare const cheerio: any;
declare function fetchUdemyCourseDetails(courseUrl: any): Promise<{
    title: any;
    subtitle: any;
    price: any;
    rating: any;
    students: any;
    instructor: any;
    url: any;
} | null>;
