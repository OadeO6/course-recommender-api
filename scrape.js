const maindiv = document.getElementById('searchResults')
const lists = maindiv.firstChild.firstChild.firstChild.childNodes
const partne_name = lists[0].getElementsByClassName('cds-ProductCard-partnerNames')[0].innerText
const title = lists[0].getElementsByClassName('cds-CommonCard-title css-6ecy9b')[0].innerText
const skills = lists[0].getElementsByClassName('cds-CommonCard-bodyContent')[0].firstChild.lastChild.data
const footer = lists[0].getElementsByClassName('cds-ProductCard-footer')
const rating =   lists[3].getElementsByClassName('cds-ProductCard-footer')[0].childNodes[1].firstChild.lastChild.innerText
const reviews = lists[3].getElementsByClassName('cds-ProductCard-footer')[0].childNodes[1].lastChild.innerText
const url =

https://www.coursera.org/search?query=kubernetis&sortBy=BEST_MATCH
https://www.coursera.org/search?query=kubernetis&productTypeDescription=Courses&sortBy=BEST_MATCH


const mainDiv = document.getElementById('searchResults');
const listItems = mainDiv?.querySelectorAll('li');

const courses = Array.from(listItems || []).map((li) => {
  const course = {};

  const img = li.querySelector('img');
  course.image = img?.getAttribute('src') || '';

  const titleEl = li.querySelector('h3');
  course.title = titleEl?.textContent?.trim() || '';

  const provider = li.querySelector('.cds-ProductCard-partnerNames');
  course.provider = provider?.textContent?.trim() || '';

  const skillsPara = li.querySelector('.cds-CommonCard-bodyContent p');
  course.skills = skillsPara?.textContent?.replace(/^Skills you'll gain:\s*/, '').trim() || '';

  const anchor = li.querySelector('a');
  course.link = anchor?.href?.startsWith('http') ? anchor.href : `https://www.coursera.org${anchor?.getAttribute('href')}`;

  const ratingHidden = li.querySelector('.cds-RatingStat-meter [data-testid="visually-hidden"]');
  course.rating = ratingHidden?.textContent?.trim() || '';

  const reviewSpan = li.querySelector('.cds-RatingStat-sizeLabel .css-vac8rf:nth-of-type(2)');
  course.reviews = reviewSpan?.textContent?.trim() || '';

  const meta = li.querySelector('.cds-CommonCard-metadata p');
  course.metadata = meta?.textContent?.trim() || '';

  return course;
});

console.log(courses);


[
  {
    "title": "Google Data Analytics",
    "provider": "Google",
    "image": "https://...",
    "rating": "Rating, 4.8 out of 5 stars",
    "reviews": "170K reviews",
    "skills": "Data Analysis, Visualization, etc.",
    "link": "https://www.coursera.org/professional-certificates/google-data-analytics",
    "metadata": "Beginner · Professional Certificate · 3 - 6 Months"
  }
]







curl 'https://www.coursera.org/graphql-gateway?opname=Search' \
  -H 'accept: application/json' \
  -H 'accept-language: en' \
  -H 'apollographql-client-name: search-v2' \
  -H 'apollographql-client-version: ff12e478c53bc76f4e841d126bc60ce9080bf956' \
  -H 'content-type: application/json' \
  -b '__204u=9770122580-1750409162433; usprivacy=1---; OneTrustWPCCPAGoogleOptOut=false; _gcl_au=1.1.2104308796.1750409229; _ga=GA1.1.521015436.1750409230; _fbp=fb.1.1750409232148.682684680289864351; _tt_enable_cookie=1; _ttp=01JY68AFXQXP2232M0V748XS0P_.tt.1; FPID=FPID2.2.%2BWa4f8pvf2iRSnugBCGU3CFctPrpFHlrjtlSscQRzNo%3D.1750409230; CSRF3-Token=1752133121.KUZeP1809N1zOL0J; IR_gbd=coursera.org; FPLC=n9PEKFiZ%2B1ANresiNvjm%2FscDpCodoso6Z%2BMRR5Gg89lzZiahHINYDn8vVtsCkxuyNchTo3nzdGhM1sXzP0GR8kBaFvo9JKKcRk6qfl8JAieIBDz02XX31fB7%2FtvbtA%3D%3D; IR_PI=4471df85-5585-11f0-a192-eb53ae354bc3%7C1751269130934; g_state={"i_p":1751355640007,"i_l":2}; ttcsid=1751291651778::2T82WpypjnhjH2qJYYo_.2.1751291651781; ttcsid_CTIORPRC77UDE4D3R2FG=1751291651777::nNtzOOe0w7m6yk2D0gap.2.1751291673198; mutiny.user.token=e29b2a1c-feac-49e1-a1b5-a5edfe904b33; mutiny.user.token=e29b2a1c-feac-49e1-a1b5-a5edfe904b33; mutiny.user.session=886f6cf4-55fc-4af1-a710-4dae3900f233; mutiny.user.session=886f6cf4-55fc-4af1-a710-4dae3900f233; CAUTH=LDtGAxjqRsfljHefVUbv3pUVGvLwIjxlqhFaXFDHbSVm_xzu9_sDf2qjEJyM3Q4wVNALJJh1r1AUSmYiERX99Q.6seCR0JRQAGjxnxeHf2WDQ.WrfuQ69jwIylGWxZFWYdl8nQYfErU7u8ItwoiWdmd-1YfesKwjaywoUID9qfhQT7_KcZWgZJFqKoRnQeKT5oDqyHgzNfyOlQEXdLv76gIuA0bwDMmjF8zCnQZrS48yIW1W2Ny8GlTGziSQQ3RIqQv7MhuGGSB1K7f_du_wD5LBpzhI6yGsF_HoqdUTUmaSb1kEcXV-vsMOM-_w9_rRfjXV6v83OgYABDrpdKuwAX5BU1aCDcwqHuo6DokEI0Itzdg57ONaAgLzkWXpa5OlAKp1AbHyK6IfJLHbipCwRk0sR2gduKNPkkcecY_4zlDXpWWgJe3t6OGBv1BNgCmcy1hkVIVxP0IixKby5evLj_4eQySZPN1MzgwP7LYpD29jtfDrr28-4Gi_H2-6F6AeqB3enG4wGC94IKz6tEtUSwXWxNQUT1xMYffYgzoGPJL2T-wNh6osA7USyouQG4X4WehcH5H9rKH7escoSs6Be4skPH95mzMSyhsq83aVNpJqxi; __400r=https%3A%2F%2Faccounts.google.com%2F; IR_14726=1751291812858%7C0%7C1751291812858%7C%7C; _rdt_uuid=1750409231701.1d25be58-1b46-4de2-85b5-a3a460bf5aaa; _uetsid=45908210558511f0aeeccf9d9c7fe98e|f0map0|2|fx7|0|2007; _uetvid=2864e7a04db311f08f955b78cd0a0c9a|h7sp6k|1751291778085|2|1|bat.bing-int.com/p/conversions/c/l; OptanonConsent=isGpcEnabled=0&datestamp=Mon+Jun+30+2025+14%3A56%3A56+GMT%2B0100+(West+Africa+Standard+Time)&version=202408.1.0&browserGpcFlag=0&isIABGlobal=false&hosts=&consentId=da81c3ca-4b3d-4c17-868c-1c1267df403f&interactionCount=1&isAnonUser=1&landingPath=NotLandingPage&groups=C0001%3A1%2CC0004%3A1%2CC0002%3A1%2CC0003%3A1&AwaitingReconsent=false&geolocation=NG%3BLA; OptanonAlertBoxClosed=2025-06-30T13:56:56.279Z; ab.storage.deviceId.6b512fd4-04b5-4fd4-8b44-3f482bc8dcf9=g%3A74be6546-9873-fbf9-cf3a-54472ef92af3%7Ce%3Aundefined%7Cc%3A1750409306425%7Cl%3A1751291818358; ab.storage.userId.6b512fd4-04b5-4fd4-8b44-3f482bc8dcf9=g%3A109345025%7Ce%3Aundefined%7Cc%3A1751291818354%7Cl%3A1751291818359; ab.storage.sessionId.6b512fd4-04b5-4fd4-8b44-3f482bc8dcf9=g%3Ae1e702f4-8a35-aeea-dd86-1f6c86524da3%7Ce%3A1751293618369%7Cc%3A1751291818357%7Cl%3A1751291818369; _ga_7GZ59JSFWQ=GS2.1.s1751290634$o5$g1$t1751292844$j60$l0$h1827374658; _ga_ZCE2Q9YZ3F=GS2.1.s1751290684$o5$g1$t1751292844$j60$l0$h0; __400v=f52c4530-0a1e-47f4-8efa-455295da6650; __400vt=1751292851815' \
  -H 'operation-name: Search' \
  -H 'origin: https://www.coursera.org' \
  -H 'priority: u=1, i' \
  -H 'referer: https://www.coursera.org/search?query=kubernetis&productTypeDescription=Courses&sortBy=BEST_MATCH' \
  -H 'sec-ch-ua: "Chromium";v="136", "Microsoft Edge";v="136", "Not.A/Brand";v="99"' \
  -H 'sec-ch-ua-mobile: ?0' \
  -H 'sec-ch-ua-platform: "Linux"' \
  -H 'sec-fetch-dest: empty' \
  -H 'sec-fetch-mode: cors' \
  -H 'sec-fetch-site: same-origin' \
  -H 'user-agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36 Edg/136.0.0.0' \
  -H 'x-csrf3-token: 1752133121.KUZeP1809N1zOL0J' \
  --data-raw $'[{"operationName":"Search","variables":{"requests":[{"entityType":"PRODUCTS","limit":8,"disableRecommender":true,"maxValuesPerFacet":1000,"facetFilters":[],"cursor":"0","query":"kubernetis"},{"entityType":"SUGGESTIONS","limit":7,"disableRecommender":true,"maxValuesPerFacet":1000,"facetFilters":[],"cursor":"0","query":"kubernetis"}]},"query":"query Search($requests: [Search_Request\u0021]\u0021) {\\n  SearchResult {\\n    search(requests: $requests) {\\n      ...SearchResult\\n      __typename\\n    }\\n    __typename\\n  }\\n}\\n\\nfragment SearchResult on Search_Result {\\n  elements {\\n    ...SearchHit\\n    __typename\\n  }\\n  facets {\\n    ...SearchFacets\\n    __typename\\n  }\\n  pagination {\\n    cursor\\n    totalElements\\n    __typename\\n  }\\n  totalPages\\n  source {\\n    indexName\\n    recommender {\\n      context\\n      hash\\n      __typename\\n    }\\n    __typename\\n  }\\n  __typename\\n}\\n\\nfragment SearchHit on Search_Hit {\\n  ...SearchArticleHit\\n  ...SearchProductHit\\n  ...SearchSuggestionHit\\n  __typename\\n}\\n\\nfragment SearchArticleHit on Search_ArticleHit {\\n  aeName\\n  careerField\\n  category\\n  createdByName\\n  firstPublishedAt\\n  id\\n  internalContentEpic\\n  internalProductLine\\n  internalTargetKw\\n  introduction\\n  islocalized\\n  lastPublishedAt\\n  localizedCountryCd\\n  localizedLanguageCd\\n  name\\n  subcategory\\n  topics\\n  url\\n  skill: skills\\n  __typename\\n}\\n\\nfragment SearchProductHit on Search_ProductHit {\\n  avgProductRating\\n  cobrandingEnabled\\n  completions\\n  duration\\n  id\\n  imageUrl\\n  isCourseFree\\n  isCreditEligible\\n  isNewContent\\n  isPartOfCourseraPlus\\n  name\\n  numProductRatings\\n  parentCourseName\\n  parentLessonName\\n  partnerLogos\\n  partners\\n  productCard {\\n    ...SearchProductCard\\n    __typename\\n  }\\n  productDifficultyLevel\\n  productDuration\\n  productType\\n  skills\\n  url\\n  videosInLesson\\n  translatedName\\n  translatedSkills\\n  translatedParentCourseName\\n  translatedParentLessonName\\n  tagline\\n  __typename\\n}\\n\\nfragment SearchSuggestionHit on Search_SuggestionHit {\\n  id\\n  name\\n  score\\n  __typename\\n}\\n\\nfragment SearchProductCard on ProductCard_ProductCard {\\n  id\\n  canonicalType\\n  marketingProductType\\n  badges\\n  productTypeAttributes {\\n    ... on ProductCard_Specialization {\\n      ...SearchProductCardSpecialization\\n      __typename\\n    }\\n    ... on ProductCard_Course {\\n      ...SearchProductCardCourse\\n      __typename\\n    }\\n    ... on ProductCard_Clip {\\n      ...SearchProductCardClip\\n      __typename\\n    }\\n    ... on ProductCard_Degree {\\n      ...SearchProductCardDegree\\n      __typename\\n    }\\n    __typename\\n  }\\n  __typename\\n}\\n\\nfragment SearchProductCardSpecialization on ProductCard_Specialization {\\n  isPathwayContent\\n  __typename\\n}\\n\\nfragment SearchProductCardCourse on ProductCard_Course {\\n  isPathwayContent\\n  rating\\n  reviewCount\\n  __typename\\n}\\n\\nfragment SearchProductCardClip on ProductCard_Clip {\\n  canonical {\\n    id\\n    __typename\\n  }\\n  __typename\\n}\\n\\nfragment SearchProductCardDegree on ProductCard_Degree {\\n  canonical {\\n    id\\n    __typename\\n  }\\n  __typename\\n}\\n\\nfragment SearchFacets on Search_Facet {\\n  name\\n  nameDisplay\\n  valuesAndCounts {\\n    ...ValuesAndCounts\\n    __typename\\n  }\\n  __typename\\n}\\n\\nfragment ValuesAndCounts on Search_FacetValueAndCount {\\n  count\\n  value\\n  valueDisplay\\n  __typename\\n}\\n"}]'
