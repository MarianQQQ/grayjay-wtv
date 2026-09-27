var PLATFORM = "w.tv";
var PLATFORM_URL = "https://w.tv";
var SEARCH_API_BASE = "https://streams-search-service.w.tv/api/v1";
var PLUGIN_ID = "ed2a9434-f6c7-4558-8ecc-5da9723e9fe1";
var PAGE_SIZE = 20;

var config = {};
var _settings = {};
var _isAuthenticated = false;

// ============================================================
// HTTP helpers
// ============================================================

function getHeaders() {
    return {
        "User-Agent": "Mozilla/5.0 (Linux; Android 14; Pixel 8 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.6367.82 Mobile Safari/537.36",
        "Accept": "application/json, text/plain, */*",
        "Accept-Language": "en-US,en;q=0.9",
        "Referer": "https://w.tv/",
        "Origin": "https://w.tv"
    };
}

function safeParseJSON(str) {
    if (!str) return null;
    try { return JSON.parse(str); } catch (e) { return null; }
}

function doGET(url) {
    try {
        var resp = http.GET(url, getHeaders(), false);
        if (resp && resp.code === 200 && resp.body) {
            return safeParseJSON(resp.body);
        }
    } catch (e) {}
    return null;
}

function doAuthGET(url) {
    if (!_isAuthenticated) return doGET(url);
    try {
        var resp = http.GET(url, getHeaders(), true);
        if (resp && resp.code === 200 && resp.body) {
            return safeParseJSON(resp.body);
        }
    } catch (e) {}
    return doGET(url);
}

// ============================================================
// URL helpers
// ============================================================

function extractStreamId(url) {
    if (!url) return null;
    var m = url.match(/\/stream[s]?\/([0-9a-fA-F-]+)/i);
    if (m) return m[1];
    var m2 = url.match(/^[0-9a-fA-F-]{36}$/);
    if (m2) return url;
    return null;
}

function extractUsername(url) {
    if (!url) return null;
    if (extractStreamId(url)) return null;
    var clean = url.replace(/^https?:\/\//i, "").replace(/^(www\.)?w\.tv\/?/i, "");
    var parts = clean.split(/[/?#]/);
    var slug = "";
    for (var i = 0; i < parts.length; i++) {
        if (parts[i].length > 0) { slug = parts[i]; break; }
    }
    if (!slug) return null;
    if (slug.charAt(0) === "@") slug = slug.substring(1);
    var bl = ["login","signup","register","about","terms","privacy","rules","support","help","settings","explore","categories","category","static","assets","api","favicon.ico","stream","streams"];
    for (var j = 0; j < bl.length; j++) {
        if (slug.toLowerCase() === bl[j]) return null;
    }
    return slug;
}

function pid() {
    return config.id || PLUGIN_ID;
}

// ============================================================
// Video/Channel builders
// ============================================================

function buildStreamVideo(title, streamId, channelId, channelName, channelAvatar, thumbnailUrl, viewers, startedAt) {
    var chUrl = PLATFORM_URL + "/" + channelName;
    var thumbs = [];
    if (thumbnailUrl) thumbs.push(new Thumbnail(thumbnailUrl, 1080));
    if (channelAvatar) thumbs.push(new Thumbnail(channelAvatar, 720));
    if (thumbs.length === 0) thumbs.push(new Thumbnail(PLATFORM_URL + "/favicon.ico", 128));

    var ts = 0;
    if (startedAt) {
        try { ts = Math.floor(new Date(startedAt).getTime() / 1000); } catch (e) {}
    }
    if (!ts) ts = Math.floor(Date.now() / 1000);

    return new PlatformVideo({
        id: new PlatformID(PLATFORM, streamId || channelName, pid()),
        name: title || channelName + " Live",
        thumbnails: new Thumbnails(thumbs),
        author: new PlatformAuthorLink(
            new PlatformID(PLATFORM, channelId || channelName, pid()),
            channelName,
            chUrl,
            channelAvatar || PLATFORM_URL + "/favicon.ico"
        ),
        datetime: ts,
        duration: 0,
        viewCount: viewers || 0,
        url: chUrl,
        isLive: true
    });
}

function streamToPlatformVideo(st, channelName, channelAvatar, channelId) {
    var sId = st.streamId;
    var title = st.title || (channelName + " Stream");
    var duration = 0;
    if (st.startedAt && st.finishedAt) {
        try {
            duration = Math.max(0, Math.floor((new Date(st.finishedAt).getTime() - new Date(st.startedAt).getTime()) / 1000));
        } catch (e) {}
    }
    var ts = 0;
    if (st.startedAt) {
        try { ts = Math.floor(new Date(st.startedAt).getTime() / 1000); } catch (e) {}
    }
    if (!ts) ts = Math.floor(Date.now() / 1000);

    var thumbs = [];
    if (st.thumbnailUrl) thumbs.push(new Thumbnail(st.thumbnailUrl, 720));
    if (channelAvatar && channelAvatar !== PLATFORM_URL + "/favicon.ico") thumbs.push(new Thumbnail(channelAvatar, 480));
    if (thumbs.length === 0) thumbs.push(new Thumbnail(PLATFORM_URL + "/favicon.ico", 128));

    var isLive = st.state === "started";
    var chUrl = PLATFORM_URL + "/" + channelName;
    var streamUrl = PLATFORM_URL + "/stream/" + sId;

    return new PlatformVideo({
        id: new PlatformID(PLATFORM, sId, pid()),
        name: title,
        thumbnails: new Thumbnails(thumbs),
        author: new PlatformAuthorLink(
            new PlatformID(PLATFORM, channelId || channelName, pid()),
            channelName,
            chUrl,
            channelAvatar || PLATFORM_URL + "/favicon.ico"
        ),
        datetime: ts,
        duration: duration,
        viewCount: st.views || 0,
        url: streamUrl,
        isLive: isLive
    });
}

function buildChannel(channelId, name, imageUrl, followers, isLive) {
    return new PlatformChannel({
        id: new PlatformID(PLATFORM, channelId || name, pid()),
        name: name,
        thumbnail: imageUrl || PLATFORM_URL + "/favicon.ico",
        banner: "",
        subscribers: followers || 0,
        description: isLive ? "LIVE" : "",
        url: PLATFORM_URL + "/" + name,
        links: {}
    });
}

function streamFromData(st) {
    if (!st || !st.channel) return null;
    return buildStreamVideo(
        st.title,
        st.streamId,
        st.channel.channelId,
        st.channel.name || "Unknown",
        st.channel.imageUrl,
        st.thumbnailUrl,
        st.viewers,
        st.startedAt
    );
}

// ============================================================
// Channel data fetcher
// ============================================================

function fetchChannel(username) {
    var info = {
        channelId: null, name: username, title: username + " Live",
        desc: "", avatar: PLATFORM_URL + "/favicon.ico", thumb: "",
        hlsUrl: null, viewers: 0, followers: 0, isLive: false
    };

    var json = doGET(SEARCH_API_BASE + "/search?text=" + encodeURIComponent(username));
    if (!json || !json.channels) return info;

    var ch = null;
    for (var i = 0; i < json.channels.length; i++) {
        if (json.channels[i].name && json.channels[i].name.toLowerCase() === username.toLowerCase()) {
            ch = json.channels[i]; break;
        }
    }
    if (!ch && json.channels.length > 0) ch = json.channels[0];
    if (!ch) return info;

    info.channelId = ch.channelId || null;
    info.name = ch.name || username;
    info.avatar = ch.imageUrl || info.avatar;
    info.followers = ch.followers || 0;
    info.isLive = !!ch.live;

    if (ch.liveStream) {
        info.hlsUrl = ch.liveStream.playbackUrl || null;
        info.title = ch.liveStream.title || info.title;
        info.viewers = ch.liveStream.viewers || 0;
        info.thumb = ch.liveStream.thumbnailUrl || "";
        info.isLive = true;
    }

    if (info.channelId && !info.hlsUrl) {
        var dJson = doGET(SEARCH_API_BASE + "/channels/" + info.channelId + "?user_lang=en&platform=web");
        if (dJson && dJson.channel) {
            var dc = dJson.channel;
            if (dc.liveStream) {
                info.hlsUrl = dc.liveStream.playbackUrl || info.hlsUrl;
                info.title = dc.liveStream.title || info.title;
                info.viewers = dc.liveStream.viewers || info.viewers;
                info.thumb = dc.liveStream.thumbnailUrl || info.thumb;
                info.isLive = true;
            }
            if (dc.imageUrl) info.avatar = dc.imageUrl;
            if (dc.followers) info.followers = dc.followers;
        }
    }

    return info;
}

// ============================================================
// Pager helpers for pagination
// ============================================================

function HomeVideoPager(results, hasMore, context) {
    this.results = results;
    this._hasMore = hasMore;
    this._context = context;
}
HomeVideoPager.prototype = Object.create(VideoPager.prototype);
HomeVideoPager.prototype.hasMorePagers = function() { return this._hasMore; };
HomeVideoPager.prototype.nextPage = function() {
    if (!this._context || !this._context.cursor) return new VideoPager([], false, null);
    var url = SEARCH_API_BASE + "/streams?user_lang=en&platform=web&limit=" + PAGE_SIZE + "&cursor=" + encodeURIComponent(this._context.cursor);
    var json = doGET(url);
    if (!json) return new VideoPager([], false, null);

    var streams = json.data || [];
    var items = [];
    for (var i = 0; i < streams.length; i++) {
        var v = streamFromData(streams[i]);
        if (v) items.push(v);
    }
    var nextCursor = json.cursor || null;
    return new HomeVideoPager(items, !!nextCursor && items.length > 0, { cursor: nextCursor });
};

function ChannelVideoPager(channelId, channelName, channelAvatar, results, hasMore, cursor) {
    this.channelId = channelId;
    this.channelName = channelName;
    this.channelAvatar = channelAvatar;
    this.results = results;
    this._hasMore = hasMore;
    this._cursor = cursor;
}
ChannelVideoPager.prototype = Object.create(VideoPager.prototype);
ChannelVideoPager.prototype.hasMorePagers = function() { return this._hasMore; };
ChannelVideoPager.prototype.nextPage = function() {
    if (!this._cursor || !this.channelId) return new VideoPager([], false, null);
    var url = SEARCH_API_BASE + "/channels/" + this.channelId + "/streams?user_lang=en&platform=web&limit=20&cursor=" + encodeURIComponent(this._cursor);
    var json = doGET(url);
    if (!json) return new VideoPager([], false, null);

    var streams = json.data || [];
    var items = [];
    for (var i = 0; i < streams.length; i++) {
        var v = streamToPlatformVideo(streams[i], this.channelName, this.channelAvatar, this.channelId);
        if (v) items.push(v);
    }
    var nextCursor = json.cursor || null;
    return new ChannelVideoPager(this.channelId, this.channelName, this.channelAvatar, items, !!nextCursor && items.length > 0, nextCursor);
};

// ============================================================
// source.* implementations
// ============================================================

source.enable = function(conf, settings, savedState) {
    config = conf || {};
    _settings = settings || {};
    try {
        _isAuthenticated = !!bridge.isLoggedIn();
    } catch (e) {
        _isAuthenticated = false;
    }
};

source.disable = function() {};

source.saveState = function() { return "{}"; };

// ---------- Home ----------

source.getHome = function() {
    var json = doGET(SEARCH_API_BASE + "/streams?user_lang=en&platform=web&limit=" + PAGE_SIZE);
    if (!json) return new VideoPager([], false, null);

    var streams = json.data || [];
    var items = [];
    for (var i = 0; i < streams.length; i++) {
        var v = streamFromData(streams[i]);
        if (v) items.push(v);
    }
    var nextCursor = json.cursor || null;
    return new HomeVideoPager(items, !!nextCursor && items.length > 0, { cursor: nextCursor });
};

// ---------- Search ----------

source.getSearchCapabilities = function() {
    return { types: [Type.Feed.Mixed], sorts: [], filters: [] };
};

source.searchSuggestions = function(query) {
    if (!query || query.length < 2) return [];
    var json = doGET(SEARCH_API_BASE + "/search?text=" + encodeURIComponent(query));
    if (!json || !json.channels) return [];

    var suggestions = [];
    var channels = json.channels;
    for (var i = 0; i < channels.length && i < 8; i++) {
        if (channels[i].name) suggestions.push(channels[i].name);
    }
    return suggestions;
};

source.search = function(query, type, order, filters) {
    if (!query || query.length === 0) return new VideoPager([], false, null);

    var results = [];
    var json = doGET(SEARCH_API_BASE + "/search?text=" + encodeURIComponent(query));
    if (!json) return new VideoPager([], false, null);

    // Live channels first
    var channels = json.channels || [];
    for (var i = 0; i < channels.length; i++) {
        var ch = channels[i];
        var chName = ch.name || "Unknown";
        var chAvatar = ch.imageUrl || PLATFORM_URL + "/favicon.ico";

        if (ch.live && ch.liveStream) {
            results.push(buildStreamVideo(
                ch.liveStream.title,
                ch.liveStream.streamId || ch.channelId,
                ch.channelId, chName, chAvatar,
                ch.liveStream.thumbnailUrl,
                ch.liveStream.viewers,
                ch.liveStream.startedAt
            ));
        }
    }

    // Stream results
    var streams = json.streams || [];
    for (var j = 0; j < streams.length; j++) {
        var v = streamFromData(streams[j]);
        if (v) results.push(v);
    }

    return new VideoPager(results, false, null);
};

// ---------- Search Channels (Creators tab) ----------

source.searchChannels = function(query) {
    if (!query || query.length === 0) return new ChannelPager([], false, null);

    var json = doGET(SEARCH_API_BASE + "/search?text=" + encodeURIComponent(query));
    if (!json) return new ChannelPager([], false, null);

    var results = [];
    var channels = json.channels || [];
    for (var i = 0; i < channels.length; i++) {
        var ch = channels[i];
        results.push(buildChannel(ch.channelId, ch.name || "Unknown", ch.imageUrl, ch.followers, ch.live));
    }

    return new ChannelPager(results, false, null);
};

source.getSearchChannelContentsCapabilities = function() {
    return { types: [Type.Feed.Mixed], sorts: [], filters: [] };
};

// ---------- Channel ----------

source.isChannelUrl = function(url) {
    return extractUsername(url) !== null;
};

source.getChannel = function(url) {
    var username = extractUsername(url);
    if (!username) throw new ScriptException("InvalidUrl", "Bad channel URL");

    var data = fetchChannel(username);
    return buildChannel(data.channelId || username, data.name || username, data.avatar, data.followers, data.isLive);
};

source.getChannelContents = function(url) {
    var username = extractUsername(url);
    if (!username) return new VideoPager([], false, null);

    var data = fetchChannel(username);
    var results = [];

    // 1. If currently live, show active live stream at the top
    if (data.isLive && data.hlsUrl) {
        results.push(buildStreamVideo(
            data.title, data.channelId, data.channelId,
            data.name || username, data.avatar, data.thumb, data.viewers, null
        ));
    }

    // 2. Fetch past recordings (streams)
    if (data.channelId) {
        var streamsUrl = SEARCH_API_BASE + "/channels/" + data.channelId + "/streams?user_lang=en&platform=web&limit=20";
        var json = doGET(streamsUrl);
        if (json && json.data) {
            for (var i = 0; i < json.data.length; i++) {
                var st = json.data[i];
                if (data.isLive && st.state === "started") continue;
                var v = streamToPlatformVideo(st, data.name || username, data.avatar, data.channelId);
                if (v) results.push(v);
            }
            var cursor = json.cursor || null;
            return new ChannelVideoPager(data.channelId, data.name || username, data.avatar, results, !!cursor && results.length > 0, cursor);
        }
    }

    return new VideoPager(results, false, null);
};

source.getChannelCapabilities = function() {
    return { types: [Type.Feed.Mixed], sorts: [], filters: [] };
};

// ---------- Search within Channel ----------

source.searchChannelVideos = function(channelUrl, query, type, order, filters) {
    return source.getChannelContents(channelUrl);
};

source.getSearchChannelVideoCapabilities = function() {
    return { types: [Type.Feed.Mixed], sorts: [], filters: [] };
};

// ---------- Video / Content Details ----------

source.isContentDetailsUrl = function(url) {
    return extractStreamId(url) !== null || extractUsername(url) !== null;
};

source.isVideoDetailsUrl = function(url) {
    return source.isContentDetailsUrl(url);
};

source.getContentDetails = function(url) {
    var streamId = extractStreamId(url);
    if (streamId) {
        var json = doGET(SEARCH_API_BASE + "/streams/" + streamId + "?user_lang=en&platform=web");
        if (!json || !json.stream) {
            throw new ScriptException("NotFound", "Stream not found");
        }
        var s = json.stream;
        if (!s.playbackUrl) {
            throw new ScriptException("NoPlaybackUrl", "No playback URL for this stream");
        }
        var ch = s.channel || {};
        var chName = ch.name || "Unknown";
        var chAvatar = ch.imageUrl || PLATFORM_URL + "/favicon.ico";
        var chUrl = PLATFORM_URL + "/" + chName;
        var streamUrl = PLATFORM_URL + "/stream/" + s.streamId;

        var duration = 0;
        if (s.startedAt && s.finishedAt) {
            try {
                duration = Math.max(0, Math.floor((new Date(s.finishedAt).getTime() - new Date(s.startedAt).getTime()) / 1000));
            } catch (e) {}
        }
        var ts = 0;
        if (s.startedAt) {
            try { ts = Math.floor(new Date(s.startedAt).getTime() / 1000); } catch (e) {}
        }
        if (!ts) ts = Math.floor(Date.now() / 1000);

        var thumbs = [];
        if (s.thumbnailUrl) thumbs.push(new Thumbnail(s.thumbnailUrl, 1080));
        if (chAvatar && chAvatar !== PLATFORM_URL + "/favicon.ico") thumbs.push(new Thumbnail(chAvatar, 720));
        if (thumbs.length === 0) thumbs.push(new Thumbnail(PLATFORM_URL + "/favicon.ico", 128));

        var isLive = s.state === "started";
        var hlsSrc = new HLSSource({ name: "HLS", duration: duration, url: s.playbackUrl });

        var descriptor;
        var liveProp;
        if (isLive) {
            descriptor = new VideoSourceDescriptor([]);
            liveProp = hlsSrc;
        } else {
            descriptor = new VideoSourceDescriptor([hlsSrc]);
            liveProp = null;
        }

        return new PlatformVideoDetails({
            id: new PlatformID(PLATFORM, s.streamId, pid()),
            name: s.title || (chName + " Stream"),
            thumbnails: new Thumbnails(thumbs),
            author: new PlatformAuthorLink(
                new PlatformID(PLATFORM, ch.channelId || chName, pid()),
                chName, chUrl, chAvatar
            ),
            datetime: ts,
            duration: duration,
            viewCount: s.views || 0,
            url: streamUrl,
            isLive: isLive,
            description: s.description || "",
            video: descriptor,
            live: liveProp,
            subtitles: []
        });
    }

    var username = extractUsername(url);
    if (!username) throw new ScriptException("InvalidUrl", "Bad URL");

    var data = fetchChannel(username);
    var chUrl = PLATFORM_URL + "/" + username;

    if (!data.hlsUrl) {
        throw new ScriptException("StreamOffline", username + " is offline");
    }

    var hlsSrc = new HLSSource({ name: "HLS Live", duration: 0, url: data.hlsUrl });

    var thumbs = [];
    if (data.thumb) thumbs.push(new Thumbnail(data.thumb, 1080));
    if (data.avatar) thumbs.push(new Thumbnail(data.avatar, 720));
    if (thumbs.length === 0) thumbs.push(new Thumbnail(PLATFORM_URL + "/favicon.ico", 128));

    return new PlatformVideoDetails({
        id: new PlatformID(PLATFORM, data.channelId || username, pid()),
        name: data.title || username + " Live",
        thumbnails: new Thumbnails(thumbs),
        author: new PlatformAuthorLink(
            new PlatformID(PLATFORM, data.channelId || username, pid()),
            data.name || username, chUrl, data.avatar
        ),
        datetime: Math.floor(Date.now() / 1000),
        duration: 0,
        viewCount: data.viewers || 0,
        url: chUrl,
        isLive: true,
        description: data.desc || "",
        video: new VideoSourceDescriptor([]),
        live: hlsSrc,
        subtitles: []
    });
};

source.getVideoDetails = function(url) {
    return source.getContentDetails(url);
};

// ---------- Live Chat Window ----------

source.getLiveChatWindow = function(url) {
    var username = extractUsername(url);
    if (!username) return null;
    return {
        url: "https://w.tv/" + username + "/chat"
    };
};

// ---------- Comments ----------

source.getComments = function(url) {
    return new CommentPager([], false, null);
};

source.getSubComments = function(comment) {
    return new CommentPager([], false, null);
};

// ---------- Subscriptions / Playlists (no auth = empty) ----------

source.getUserSubscriptions = function() {
    return [];
};

source.getUserPlaylists = function() {
    return [];
};

// ---------- Playlist (not applicable for live-only platform) ----------

source.isPlaylistUrl = function(url) {
    return false;
};

source.getPlaylist = function(url) {
    return [];
};
