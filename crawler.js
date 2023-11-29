const axios = require('axios')
const cheerio = require('cheerio');

var input_url = process.argv[2]
var max_depth = process.argv[3]
var results = []

var crawler = async (url, depth) => {
    if (depth <= max_depth) {
        try {
            var response = await axios.get(url)
        } catch (e) {
            console.log(url)
            return
        }

        const $ = cheerio.load(response.data)

        let images = []
        let links = []

        $('img').each( (index, value) => {
            var image = $(value).attr('src');
            if (image && image.includes('https')) {
                images.push(image)
            } else if (image.slice(0,2) == '//') {
                images.push('https'+image)
            } else {
                images.push(url+image)
            }
            });

        $('a').each( (index, value) => {
            var link = $(value).attr('href');
            if (link) {
                if (link.includes('https')) {
                    links.push(link)
                } else if (link.slice(0,2) == '//') {
                    links.push('https'+link)
                } else {
                    links.push(url+link)
                }
            }
        });

        images.forEach(image => {
            results.push({
                imageUrl: image,
                sourceUrl: url,
                depth: depth
            })
        })

        let promises = []
        links.forEach(link => {
            promises.push(crawler(link, depth+1))
        })
        await Promise.all(promises)
    }
}

if (input_url && depth) {
    crawler(input_url,0).then(()=>{console.log(results)})
}
