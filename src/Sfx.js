var Sfx = {};

Sfx.play = function(name, volume) {
    new Howl({
        urls: ['.ogg', '.mp3'].map(function(e) { return 'sfx/' + name + e; }),
        autoplay: true,
        volume: volume != null ? volume : 0.25
    });
};
