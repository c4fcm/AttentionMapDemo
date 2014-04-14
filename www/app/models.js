
App.Country = Backbone.Model.extend({
    initialize: function(args){
        var peopleHash = new Object();
        var people = new Array();
        var peopleResult;
        if (args['people']){
            
            _.each(args['people'], function(person){
                var names = _.keys(peopleHash); 
                var newKey = person.name;
                var contained = false;
                //check if peopleHash already contains a reference to this name
                for(var i=0;i<names.length; i++){
                    var name = names[i];
                    if (newKey.indexOf(name) >= 0){
                        peopleHash[name].count = peopleHash[name].count + person.count;
                        peopleHash[newKey]=peopleHash[name];
                        peopleHash[newKey].name = person.name;
                        delete peopleHash[name];
                        contained = true;
                        break;
                    }
                }
                if (!contained)
                    peopleHash[person.name] = person;
            });
            _.each(_.keys(peopleHash), function(item){ 
                people.push(peopleHash[item]); 
            });
            peopleResult = _.sortBy(people, 
                        function(item){
                            return item.count;
                        });
            peopleResult.reverse();
        }
        this.set({
            'id':ISO3166.getIdFromAlpha3(args['alpha3']),
            'alpha3':args['alpha3'],
            'name':ISO3166.getNameFromAlpha3(args['alpha3']),
            'centroid':Centroid.fromAlpha3(args['alpha3']),
            'pct': args['count'] / args['totalMediaArticles'],
            'people': peopleResult
        });
    }
});

App.CountryCollection = Backbone.Collection.extend({
    model: App.Country,
    initialize: function(){
    },
    getMaxPct: function(){
        return _.max(this.models, function(country){
            return country.get('pct');
        }).get('pct');
    }
});

App.MediaSource = Backbone.Model.extend({
    initialize: function(args){
        this.set({
            'startDate': Date.parse(args['startDate']),
            'endDate': Date.parse(args['endDate']),
            'id': args['mediaType'],
            'name': this.toTitleCase("Top 20 " + args['mediaType']),

        });
        for(index in args['countries']){
            args['countries'][index]['totalMediaArticles'] = args['articleCount'];
        }
        this.set( {'countries': new App.CountryCollection(args['countries']) });
    },
    toTitleCase: function (str){
        return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
    }
});

App.MediaSourceCollection = Backbone.Collection.extend({
    model: App.MediaSource,    
    initialize: function(){
    }
});
