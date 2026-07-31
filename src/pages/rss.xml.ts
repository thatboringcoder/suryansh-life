import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
    const posts = await getCollection('blog'); // adjust to your collection name

    return rss({
        title: 'Suryansh',
        description: 'My personal website.',
        site: context.site, // requires `site` set in astro.config.mjs
        items: posts.map((post) => ({
            title: post.data.title,
            pubDate: post.data.pubDate,
            description: post.data.description,
            link: `/blog/${post.slug}/`,
        })),
        customData: `<language>en-us</language>`,
    });
}
