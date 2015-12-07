'use strict';
var got = require('got');
var cheerio = require('cheerio');
var Promise = require('pinkie-promise');

module.exports = function (category, pageNum) {
	  if (typeof category !== 'string') {
		    return Promise.reject(new Error('category required'));
	  }

	  var url = 'https://github.com/blog/category/' + category + '?page=' + pageNum;

	  return got(url).then(function (res) {
		    var $ = cheerio.load(res.body);
        var data = [], dates = [], authors = [], categories = [], avatarUrls = [];

        // get dates
        $('ul[class=blog-post-meta]').each(function(index) {
            var date = $(this).text();
            date = date.substring(19, 37);
            date = date.replace('\n', '');
            dates[index] = date.replace(/\s*$/,"");
        });

        // get author avatar url
        $('.author-avatar').each(function(index) {
            var link = $(this);
            avatarUrls[index] = link.attr('src');
        });

        // get author
        $('ul[class=blog-post-meta]').each(function(index) {
            var author = $(this).text();
            author = author.substring(45, 70);
            author = author.replace('\n', '');
            authors[index] = author.replace(/^\s\s*/, '').replace(/\s*$/,'');
        });

        // get category
        $('ul[class=blog-post-meta]').each(function(index) {
            var category = $(this).text();
            category = category.substring(70, 100);
            category = category.replace('\n', '');
            categories[index] = category.replace(/^\s\s*/, '').replace(/\s*$/,'');
        });

        $('.blog-post-title > a').each(function(index) {
            var link = $(this);
            data[index] = {
                author: authors[index],
                id: link.attr('href').substring(6, link.attr('href').indexOf('-')),
                created_date: dates[index],
                title: link.text(),
                category: categories[index],
                url: 'https://github.com' + link.attr('href'),
                avatar_url: avatarUrls[index]
            }
        });

		    return JSON.stringify({
            page_number: pageNum,
            category: category,
            results: data || null
		    }, 2, 2);

	  }).catch(function (err) {
		    if (err.statusCode === 404) {
			      err.message = 'Category doesn\'t exist';
		    }
		    throw err;
	  });
};
