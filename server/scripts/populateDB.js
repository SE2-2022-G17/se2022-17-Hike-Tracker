const mongoose = require('mongoose')
const Hike = require("../models/Hike")
const Position = require("../models/Position")
const Difficulty = require("../models/Difficulty")
const User = require("../models/User")
const UserType = require("../models/UserType")
const fs = require('fs');
let gpxParser = require('gpxparser');
const Location = require("../models/Location")


mongoose
    .connect(
        'mongodb://mongo:27017/hike-tracker', // the mongo container listening to port 27017
        { useNewUrlParser: true }
    )
    .then(async () => {
        console.log('MongoDB Connected')
        await run();
    })
    .catch(err => console.log(err));


async function clear() {
    try {
        await Hike.deleteMany()
        await Position.deleteMany()
        await User.deleteMany()
        await Location.deleteMany()
    } catch (e) {
        console.log(e.message)
    }
}

function HikeDetail(title, time, difficulty, city, province, description, file) {
    this.title = title;
    this.time = time;
    this.difficulty = difficulty;
    this.city = city;
    this.province = province;
    this.description = description;
    this.file = file;
}


async function run() {
    clear()
    const difficulties = ['Tourist', 'Hiker', 'ProfessionalHiker']
    const testDataHikes = [
        new HikeDetail("Arctic Circle Trail", 36.1, 1, "Kangerlussuaq", "Qeqqata Kommunia", "The only towns are at the beginning and the end of the trail, so the Arctic Circle Trail truly allows you to get away from the chaos and get in touch with nature. This backcountry hike gives you the freedom to catch trout for dinner, take pictures of foxes and reindeer, or anything else your heart desires.", "Arctic Circle Trail.gpx"),
        new HikeDetail("Bay Of Fires Walk", 1.5, 0, "Binalong Bay", "Tasmania", "This hike is highlighted by white beaches, blue waters, and orange-toned granite. The air is absolutely pristine and you’ll get a chance to experience ecology, wildlife, and rocky headlands along the way.", "Bay Of Fires Walk.gpx"),
        new HikeDetail("Berliner Hohenweg", 5.7, 2, "Mayrhofen", "Tyrol", "If you’re comfortable with high-alpine terrain, then this is the hike for you. Glaciers and mountain landscape light up the trail, and you’re bound to meet some new friends on this popular hike.", "Berliner Hohenweg.gpx"),
        new HikeDetail("Bibbulmun Track", 258.2, 2, "Perth", "Western Australia", "If you want to tackle one of the best long hikes in the world but want to avoid the crowds, then Bibbulmun Track is the trail for you. Lookouts, boardwalks, and footbridges are scattered throughout the trail to highlight the amazing coastal, forest, and valley views you’ll encounter on the trail.", "Bibbulmun Track.gpx"),
        new HikeDetail("Camino De Santiago", 209.1, 2, "Saint-Jean-Pied-de-Port", "Pyrénées-Atlantiques", "Highlighted in one of the great travel movies of our time, The Way, the Camino De Santiago hardly needs an introduction. Leading to the place where the apostle James is believed to be buried, this hike will help you get in touch with yourself and nature as you pass through classic villages and the picturesque countryside.", "Camino De Santiago.gpx"),
        new HikeDetail("Camino Inca", 16, 2, "Cusco", "Peru", "Be prepared for a lot of ascending and descending when you sign up for one of the best hikes in the world. Along the way you’ll see ruins, mountains, and rivers before ending at the iconic Machu Picchu.", "Camino Inca.gpx"),
        new HikeDetail("Chilkoot Trail", 14.2, 2, "Skagway", "Alaska", "With a history dating back to the Klondike Gold Rush, the Chilkoot Trail extends from Alaska to British Columbia and takes you past numerous historical and natural sites. There are three different climate sections on the trail so you’ll get to experience coastal rainforest as well as boreal and high alpine forest.", "Chilkoot Trail.gpx"),
        new HikeDetail("Cinque Terre", 5.2, 1, "Porto Venere", "SP", "Walk the coast of the Italian Riviera while you experience absolutely breathtaking views. While Trail #2 is the most popular, there are a handful of other beautiful trails that you can pick from as well.", "Cinque Terre.gpx"),
        new HikeDetail("Croagh Patrick Mountain", 3.9, 1, "Croaghpatrick", "County Mayo", "Topping the list of the best day hikes in the world, Croagh Patrick is one of Ireland’s most-climbed mountains and a significant place of Christian pilgrimage. At the top you’ll be rewarded with views of Clews Bay and the surrounding scenery near the town of Westport.", "Croagh Patrick Mountain.gpx"),
        new HikeDetail("Dolomites", 4.7, 1, "Moena", "TN", "The Dolomites are a perfect playground for any hiker. There are countless trails that will guide you through a variety of landscapes from sky-high peaks and alpine meadows to evergreen woods and beautiful lakes.", "Dolomites.gpx"),
        new HikeDetail("Everest Base Camp Trek", 40.7, 2, "Khumjung", "Province 1", "Renowned as one of the best treks in the world, the Everest Base Camp Trek gives you a glimpse of the highest summit on Earth. Not only that, but you can also get to know the Sherpa people and visit ancient Tengboche and Thami monasteries.", "Everest Base Camp Trek.gpx"),
        new HikeDetail("Fitz Roy", 10.2, 2, "El Chaltén", "Santa Cruz", "One of Patagonia’s best-known landmarks, this rugged trek offers some of the most dramatic views in the world. Flora and fauna fill the park while striking rock formations create an amazing landscape.", "Fitz Roy.gpx"),
        new HikeDetail("GR20", 71.5, 2, "Calenzana", "Haute-Corse", "Renowned for some of the best hiking in Europe because of its beautiful mountain trail, it’s also arguably the most difficult GR route. The rugged trail is made more pleasant by the swimming holes and fantastic views along the route.", "GR20.gpx"),
        new HikeDetail("Grand Canyon Rim Trail", 4.5, 0, "Arizona", "US", "There’s no better way to experience one of the greatest wonders in the world. Located in one of the USA’s most beautiful parks, the views are absolutely mesmerizing, just make sure you’re prepared for the challenge.", "Grand Canyon Rim Trail.gpx"),
        new HikeDetail("Great Ocean Walk", 26.5, 1, "Apollo Bay", "Victoria", "One of Australia’s premier trails, hiking the Great Ocean Walk is an experience everyone should have. Experience nature like never before as you come face-to-face with wildlife while you’re admiring the deserted beaches, cliff-top panoramas, forests, and heathlands.", "Great Ocean Walk.gpx"),
        new HikeDetail("Hadrian's Wall Path", 32.5, 1, "Wallsend", "Tyne and Wear", "History is all around you when you walk Hadrian’s Wall Path. While you’re crossing northern England you’ll encounter former Roman forts and settlements, market towns, farms, countryside, and obviously lovely views.", "Hadrian's Wall Path.gpx"),
        new HikeDetail("Israel National Trail", 267.4, 2, "Dan", "HaZafon", "Stretching the length of the country from north to south, the Israel National Trail boasts a variety of fauna, flora, scenery, and culture. The beauty of Israel’s wilderness will have you in awe as you cross through the biblical landscapes. There’s no wonder why National Geographic ranked it as one of the world’s best hikes.", "Israel National Trail.gpx"),
        new HikeDetail("K2", 80, 2, "GILGIT-BALTISTAN", "HIMALAYA", "One of the longest glaciers outside of the polar regions, Baltoro Glacier combines with K2, the world’s second highest mountain, to be one of the best hiking trips in the world for the ultimate adventure seekers. Both challenging and dangerous, only about 300 people have successfully made it to the peak of K2.", "K2.gpx"),
        new HikeDetail("Kalalau Trail", 12.8, 2, "Hanalei", "Kaua'i", "Traverse lush valleys and lofty sea cliffs on this stunning hike. Both thrilling and exhausting, it’s not hard to see why it always makes the list of the world’s best hikes.", "Kalalau Trail.gpx"),
        new HikeDetail("Kungsleden", 124.6, 2, "Abisko", "Norrbotten", "One of the most famous hiking trails in the world, Kungsleden, or the “King’s Trail”, takes you through all types of gorgeous scenery, from alpine terrain to mountain heaths. If you don’t want to hike the entire trail, it’s divided up into four parts and has multiple entry points.", "Kungsleden.gpx"),
        new HikeDetail("La Ciudad Perdida", 17.5, 2, "Santa Marta", "Magdalena", "Adventure through the tropical jungles of northern Colombia to the ancient ruins of an indigenous city called Teyuna (The Lost City). Along the trek you’ll get to enjoy breathtaking jungle scenery, swim in the refreshing Buritaca river, and learn about indigenous communities.", "La Ciudad Perdida.gpx"),
        new HikeDetail("Laugavegurinn", 15.8, 2, "Landmannalaugar", "Southern", "The sights you’ll get on this trail are literally out of this world. No other trail in the world can compare to Laugavegurinn in terms of the landscapes. Ice caves, colorful hills, black volcanic deserts, river crossings, and waterfalls are only some of the greatness you’ll experience when you choose this hike.", "Laugavegurinn.gpx"),
        new HikeDetail("Long Range Traverse", 12.5, 1, "Newfoundland", "Canada", "This leading backpacking trail takes you through a beautiful, yet rugged and unmarked backcountry route. Campsites dot the trail to make sure you stay on track, but you do have to be experienced in compass and map navigation. Make sure to be on the lookout for wildlife like caribou and moose.", "Long Range Traverse.gpx"),
        new HikeDetail("Mount Kailash", 4.3, 2, "Ngari Prefecture", "Tibet", "Sacred to many different religions, thousands of visitors per year treat this hike as a pilgrimage. Although you can’t climb the mountain because it’s believed to be a mortal sin, the trek will reward you with views of lush valleys, gorgeous lakes, and snow-capped summits.", "Mount Kailash.gpx"),
        new HikeDetail("Mount Kilimanjaro", 28.2, 2, "Kibosho Magharibi", "Kilimanjaro", "This dormant volcano is not only one of the best mountain hikes in the world, but it’s also Africa’s highest mountain. Though you may not see much wildlife, you’ll enjoy many beautiful landscapes as well as flowers and plants unique to Kilimanjaro.", "Mount Kilimanjaro.gpx"),
        new HikeDetail("Mount Toubkal", 4.5, 2, "Asni", "Marrakesh", "It’s about time you discover the green valley and mountain scenery offered by one of the best mountain hikes in the world. A hike up Mount Toubkal lets you get to know the Berber communities as you make your way to the top of North Africa’s highest summit.", "Mount Toubkal.gpx"),
        new HikeDetail("Drakensberg", 0.8, 0, "Drakensberg", "Kwazulu-Natal", "Rightfully deserving a ranking among the most famous hiking trails, the North Drakensberg Traverse leads you along the edge of the Drakensberg escarpment. This remote and challenging trek includes rich vegetation and wildlife along with views of buttresses, spires, gorges, ridges, and more.", "Drakensberg.gpx"),
        new HikeDetail("Otter Trail", 11.9, 2, "Stormsrivier", "Eastern Cape", "The Otter Trail is one South Africa’s oldest trail and it nature lover’s paradise. Rivers, beaches, waterfalls, caves, wildlife, marine life, and indigenous trees are only some of the majestic sites you’ll get along the way.", "Otter Trail.gpx"),
        new HikeDetail("Overland Track", 22.0, 2, "Cradle Mountain", "Tasmania", "Join the more than 9,000 walkers who enjoy the waterfalls, lakes, and mountains on the Overland Track each year. While the Cradle Mountain-Lake St Clair National Park is famous for this iconic hike, it’s not a bad idea to get off the trail and take some alternate tracks to the peaks of Cradle Mountain and Mount Ossa, Tasmania’s tallest mountain.", "Overland Track.gpx"),
        new HikeDetail("Pacific Crest Trail", 1207.5, 2, "Campo", "California", "The Pacific Crest Trail stretches through the United States from the Mexican border to the Canadian border through Washington, Oregon, and California. Made even more popular by one of the best travel books ever, Wild, true beauty awaits you on this amazing hike.", "Pacific Crest Trail.gpx"),
        new HikeDetail("Petra", 5.0, 0, "Petra", "Jordan", "Take the road less traveled through the Kingdom of Jordan and experience one of the seven wonders of the world. Hike through canyons, gorges, and ridges, and see tombs and temples along the way all while avoiding crowds of tourists.", "Petra.gpx"),
        new HikeDetail("Queen Charlotte Track", 22.3, 1, "Picton", "Marlborough", "The true beauty of New Zealand is experienced on Queen Charlotte Track. One of the best places to go hiking in the world, the native bush and coastal views make this hike pretty close to perfect.", "Queen Charlotte Track.gpx"),
        new HikeDetail("Routeburn Track", 11.2, 2, "Glenorchy", "Otago", "Some people say that New Zealand is the undisputed best place to hike in the world, and the Routeburn Track only helps their argument. This adventure will take you along rivers and through alpine gardens and meadows while you get picturesque views of valleys and mountain ranges.", "Routeburn Track.gpx"),
        new HikeDetail("Santa Cruz Trek", 15.1, 2, "Yanama", "Ancash", "Lagoons, rivers, snow-capped mountains, and valleys encompass the trail of the Santa Cruz Trek. While most of the hike is flat, prepare yourself for Punta Union, at 4,750 meters it’s the highest point of the trek.", "Santa Cruz Trek.gpx"),
        new HikeDetail("Scottish National Trail", 4.9, 1, "Currie", "Edinburgh", "The first hike to stretch the length of Scotland, the Scottish National Trail will show you the best of the scenic countryside. It’s perfect for hiking or walking, but it does get more challenging the more north you go.", "Scottish National Trail.gpx"),
        new HikeDetail("Sierra High Trail", 46.3, 2, "Hartland", "California", "For most of this hike you’ll be above the treeline and you’ll also spend a good amount of time climbing on rocks. It’s a wonderful hike to challenge yourself as most of it will have you crossing off-trail granite slabs, meadowlands, and other difficult terrain.", "Sierra High Trail.gpx"),
        new HikeDetail("Snowman Trek", 108.4, 2, "Paro Dzong", "Paro", "As one of the most difficult high-altitude treks in the world, it will definitely be an adventure to remember if you finish it. Head into one of the most remote valleys in Bhutan as you traverse nine passes higher than 4,500 meters, six mountains above 7,000 meters, and the Paro Chhu river valley. During the trek you’ll pass small villages and Buddhist monasteries, and you can even learn more about Buddhist traditions and the cultural heritage of Bhutan.", "Snowman Trek.gpx"),
        new HikeDetail("Te Araroa Trail", 4.0, 0, "Riverton", "Southland", "If you’re not already convinced that New Zealand is one of the best places to hike in the world, the Te Araroa Trail will surely win you over. Extending the length of New Zealand’s two main islands and with scenery including forests, volcanoes, beaches, and cities, this is one adventure you absolutely don’t want to miss.", "Te Araroa Trail.gpx"),
        new HikeDetail("The Narrows", 6.2, 1, "Orderville", "Utah", "Definitely among the greatest slot canyon hikes, the trail is essentially the Virgin River. The Narrows is a nice hike for any skill level, just make sure you’re prepared to get wet.", "The Narrows.gpx"),
        new HikeDetail("Tongariro Alpine Crossing", 7.0, 2, "Owhango", "Manawatu-Wanganui", "Known for being among the best day hikes in the world, the Tongariro Alpine Crossing gives you a little bit of everything. Dramatic landscapes don’t even begin to describe what you’ll see as you trek past ancient lava flows, steaming vents, crater lakes, glacial valleys, and more.", "Tongariro Alpine Crossing.gpx"),
        new HikeDetail("Tonquin Valley", 13.0, 2, "Jasper", "Alberta", "Located in one of Canada’s best alpine regions, the Tonquin Valley is famous for its views of the stunning Amethyst Lake. It is a backcountry trail so be prepared to meet some caribou, bears, and other wildlife.", "Tonquin Valley.gpx"),
        new HikeDetail("Torres Del Paine Circuito W", 21.9, 2, "Magallanes", "Patagonia", "The W Circuit is one of the most recommended hikes you’ll find. Not only will you appreciate the diverse landscapes and striking granite pillars, but you’ll probably meet some new hiker friends along the way.", "Torres Del Paine Circuito W.gpx"),
        new HikeDetail("Tour Du Mont Blanc", 4.6, 2, "Courmayeur", "Aosta Valley", "Consistency ranked among the best long distance hiking trails in the world, the Tour du Mont Blanc takes you through three different countries and a variety of lovely terrain. Be prepared to make friends with everything from marmots to wild alpine goats as you admire woodlands, glaciers, meadows, and more along the way.", "Tour Du Mont Blanc.gpx"),
        new HikeDetail("West Coast Trail", 19.2, 2, "Capital Regional District", "British Columbia", "The West Coast Trail is a rite of passage for any true hiker. The trail includes bogs, forests, waterfalls, beach treks, moss-covered ladders, and more. Hike in the footsteps of the First Nation ancestors and support eco-friendly tourism when you take on one of the best hiking trails in the world.", "West Coast Trail.gpx"),
        new HikeDetail("West Highland Way", 5.0, 0, "Glasgow", "Glasgow", "Beloved by the Scottish and everyone else who’s hiked it, the West Highland Way was Scotland’s first long-distance trail and it still remains the most popular. The amazing variety is a major perk of this hike as you’ll pass the Scottish Highlands, Loch Lomond, Rannoch Moor, and much more.", "West Highland Way.gpx"),
        new HikeDetail("Yosemite Grand Traverse", 1.5, 1, "Yosemite Valley", "California", "Known for some of the best hiking in the world, Yosemite National Park is famous for its views and huge sequoia trees. Praised by National Geographic, the Yosemite Grand Traverse will take you through waterfalls, green mountaintops, and meadows on its surreal trail.", "Yosemite Grand Traverse.gpx"),
    ]

    for (const h of testDataHikes) {
        try {
            const content = fs.readFileSync("./public/tracks/" + h.file, 'utf8')
            var gpx = new gpxParser()
            gpx.parse(content)
            var length = ((gpx.tracks[0].distance.total) / 1000).toFixed(2) //length in kilometers
            var ascent = (gpx.tracks[0].elevation.pos).toFixed(2)
            var points = gpx.tracks[0].points
            var startPoint = points[0]
            var endPoint = points[points.length - 1]

            const startPosition = await Position.create({
                "location.coordinates": [startPoint.lon, startPoint.lat]
            })

            const endPosition = await Position.create({
                "location.coordinates": [endPoint.lon, endPoint.lat]
            })


            const hike = await Hike.create({
                title: h.title,
                expectedTime: h.time,
                difficulty: Difficulty[difficulties[h.difficulty]],
                city: h.city,
                province: h.province,
                description: h.description,
                track_file: h.file,
                length: length,
                ascent: ascent,
                startPoint: startPosition._id,
                endPoint: endPosition._id
            })
            await hike.save()
            console.log(hike)
        } catch (e) {
            console.log(e.message)
        }
    }

    const user = await User.create({
        firstName: "Pietro",
        lastName: "Bertorelle",
        email: "test@email.com",
        hash: "$2a$10$uKpxkByoCAWrnGpgnVJhhOtgOrQ6spPVTp88qyZbLEa2EVw0/XoQS", //password
        activationCode: "123456",
        role: UserType.localGuide,
        active: true
    })

    await user.save()
    console.log(user);

    await mongoose.disconnect()
    return
}






