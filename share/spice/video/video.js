function ddg_spice_video(api_result) {
    if(!api_result) {
        return;
    }

    $.ajaxSetup({
        cache: true
    });

    var script = $('[src*="/js/spice/video/"]').attr("src");
    var query = script.match(/video\/([^\/]+)/)[1]
    
    // Change the "More at ..." link.
    var change_more = function(obj) {
	var more_at_link = $(".zero_click_more_at_link").get(0);
	$(more_at_link).attr("href", obj.search_link);
        $("img", more_at_link).attr("src", obj.image);
        $("span", more_at_link).html(obj.text);
    };

    Spice.render({
        data: api_result,
        source_name : 'YouTube',
        source_url : 'https://www.youtube.com/results?search_query=' + query,
        header1 : "Video Search",
        template_frame: "carousel",
        template_normal: "video",
        carousel_css_id: "video",
        carousel_items: api_result,
        force_no_fold : 1,
        carousel_template_detail: "video_detail",
	template_options: {
	    li_width: 120
	},
	item_callback: function(i, item) {
	    var more_at_link = $(".zero_click_more_at_link").get(0);
	    if(item.provider in ddg_spice_video.providers) {
		var providers = ddg_spice_video.providers;
		change_more({
		    "search_link": providers[item.provider].search_link + query,
		    "image": providers[item.provider].image,
		    "text": providers[item.provider].text
		});
	    }
	    resizeDetail();
	}
    });
    
    function resizeDetail() {
	var $video = $("#spice_video");
	var width = $video.width() - 18;
	var height = Math.floor(width * 0.5625) + 30;
	$("#video #embed").width(width);
	$("#video #embed").height(height);
    }

    $(document).ready(function() {
	resizeDetail();
	$(window).resize(resizeDetail);
    });
}

ddg_spice_video.providers = {
    "YouTube": {
	"search_link": "https://www.youtube.com/results?search_query=",
	"image": "http://icons.duckduckgo.com/i/www.youtube.com.ico",
	"text": "More at YouTube",
	"embed": "https://www.youtube-nocookie.com/embed/",
	"play_url": "https://www.youtube.com/watch?v="
    },
    "Vimeo": {
	"search_link": "https://www.vimeo.com/search?q=",
	"image": "http://icons.duckduckgo.com/i/www.vimeo.com.ico",
	"text": "More at Vimeo",
	"embed": "https://player.vimeo.com/video/",
	"play_url": "https://vimeo.com/"
    }
};

// This is the callback function of /itt.
// TODO: Don't show the link when we didn't find the iTunes URL.
ddg_spice_video.itunes = function(api_result) {
    if(!api_result || !api_result.results || api_result.results.length === 0) {
        return;
    }

    var itunes = $("#itunes");
    var artist = itunes.data("artist").toLowerCase();
    var song = itunes.data("song").toLowerCase();

    // Find the song that matches.
    for(var i = 0; i < api_result.results.length; i++) {
	if(artist === api_result.results[i].artistName.toLowerCase() ||
	   artist === api_result.results[i].trackName.toLowerCase() ||
	   song === api_result.results[i].artistName.toLowerCase() ||
	   song === api_result.results[i].trackName.toLowerCase()) {
	    itunes.attr("href", api_result.results[i].trackViewUrl);
	    itunes.toggle();
	    break;
	}
    }

};

Handlebars.registerHelper("checkMusic", function(category, title, options) {
    // Remove things from the title that we don't really need.
    var stripTitle = function(s) {
	// Remove things like "(Explicit)".
	s = s.replace(/\(.*\)|\[.*\]/g, "");
	// Remove things like "feat. Alicia Keys".
	s = s.replace(/\s+f(?:ea|)t\..*$/g, "");
	// Trim the ends of the string.
	return s.replace(/^\s+|\s+$/g, "");
    };

    title = stripTitle(title);
    var songData = title.split(" - ");
    var artist = songData[0];
    var song = songData[1] || artist;

    // Call iTunes.
    $.getScript("/iit/" + encodeURIComponent(title));

    // Only add links to the music if, well, we have links to the music section.
    if(category === "Music") {
	// There's no need to escape the values--Handlebars.js does this for us.
	return options.fn({
	    title: title,
	    artist: artist,
	    song: song
	});
    }
});

// We'll use this for showing the view counts.
Handlebars.registerHelper("formatViews", function(views) {
    "use strict";
    if(views) {
	return String(views).replace(/(\d)(?=(\d{3})+(\.\d+|)\b)/g, "$1,");
    }
});

Handlebars.registerHelper("embedURL", function(provider, id) {
    if(provider in ddg_spice_video.providers) {
	return ddg_spice_video.providers[provider].embed + id;
    }
    return "";
});

Handlebars.registerHelper("playURL", function(provider, id) {
    if(provider in ddg_spice_video.providers) {
	return ddg_spice_video.providers[provider].play_url + id;
    }
    return "";
});

Handlebars.registerHelper("checkStatistics", function(viewCount, options) {
    if(Object.prototype.toString.call(viewCount) === "[object Null]") {
	return "";
    }
    return options.fn({viewCount: viewCount});
});