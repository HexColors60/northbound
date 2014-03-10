function Story() {
}

Story.stories = null;

Story.load = function() {
    $.get('src/stories.yaml', function(data) {
        Story.stories = jsyaml.load(data);
    });
};

Story.load();

Story.toNumber = function(litOrDice) {
    if (typeof litOrDice == "string") {
        if(litOrDice.substring(0, 1) == '-') {
            // handle negative dice throws
            return -RNG.roller(litOrDice.substring(1), RNG.$)();
        } else {
            return RNG.roller(litOrDice.substring(1), RNG.$)();
        }
    } else {
        return litOrDice;
    }
};

Story.toArray = function(litOrArray) {
    if (typeof litOrArray == "array") {
        return litOrArray;
    } else {
        return [litOrArray];
    }
}

Story.scripts = {
    newmember: function(name) {
        game.player.party.push(name);
        game.message(name + ' joins your party.');
        Sfx.play('get');
    },
    remove: function(name) {
        game.player.party = game.player.party.filter(function(member) {
            return name !== member;
        });
        game.message(name + ' leaves your party.');
        Sfx.play('thwart');
    },
    gold: function(n) {
        game.player.gold += Story.toNumber(n);
    },
    karma: function(n) {
        game.player.karma += Story.toNumber(n);
    },
    supplies: function(n) {
        game.player.supplies += Story.toNumber(n);
    },
    advance: function(n) {
        for (var i = 0; i < n; i++) {
            game.map.advance();
        }
    },
    play: function(name, volume) {
        Sfx.play(name, volume);
    }
};

Story.filters = {
    hasPeople: function(people) {
        return Story.toArray(people).every(function(person) {
            return game.player.party.indexOf(person) >= 0;
        });
    },

    minParty: function(number) {
        return game.player.party.length >= number;
    }
};

// register filters as Handlebars helpers
(function() {
    Object.keys(Story.filters).forEach(function(filterName) {
        Handlebars.registerHelper(filterName, function() {
            var args = Array.prototype.slice.call(arguments);
            var butLast = args.slice(0, args.length - 1);
            if(Story.filters[filterName].apply(null, butLast)) {
                return args[args.length-1].fn(this);
            }
        });
    });
})();

Story.filter = function(activeFilters) {
    return activeFilters.every(function(filterSpec) {
        return Story.filters[filterSpec[0]].apply(null, filterSpec.slice(1));
    });
};

Story.expand = function(text) {
    return Handlebars.compile(text)({
        game: game,
        filters: Story.filters
    });
};

Story.show = function(story, callback) {
    Sfx.play('story');
    var title = Story.expand(story.title),
        description = Story.expand(story.description.replace(/\n/g, '</p><p>'));
    $('#story .title').html(title);
    $('#story .description').html('<p>' + description + '</p>');
    var $options = $('#options');
    $options.empty();
    story.options.filter(function(option) {
        return !option.filter || Story.filter(option.filter);
    }).forEach(function(option) {
        var $option = $('<li/>').addClass('option');
        $option.html(Story.expand(option.answer));
        $options.append($option);
        $option.on('click', function() {
            Story.act(option, callback);
        });
    });
    $('#story .close').hide();
    $('#story').show();
};

Story.act = function(option, callback) {
    $('#story .description').html(Story.expand(option.result));
    if (option.scripts) {
        option.scripts.forEach(function(script) {
            if (typeof script === "string") {
                Story.scripts[script]();
            } else {
                Story.scripts[script[0]].apply(null, script.slice(1));
            }
        });
    }
    $('#options').empty();
    $('#story .close').show().on('click', function() {
        $('#story .close').hide().off('click');
        $('#story').hide();
        if (callback != null) {
            callback();
        }
    });
};

Story.select = function(game) {
    if (Story.stories == null) {
        return [];
    }
    return Story.stories.filter(function(story) {
        return !story.used && (!story.filter || Story.filter(story.filter));
    });
};
