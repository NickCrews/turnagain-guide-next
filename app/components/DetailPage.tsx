import React from 'react';
import MapStatic from './Map';

function StatsSection() {
  return (
    <>
      <h2 className="text-xl font-semibold mb-4">Stats</h2>
      <div className="space-y-2">
        <p>total descent: 1234 ft</p>
        <p>min elevation: 5432 ft </p>
        <p>max elevation: 6543 ft </p>
      </div>
    </>
  );
}

function TitleSection() {
  return (
    <>
      <h1 className="text-2xl font-bold">Sick Gnar Gnar Line</h1>
      <p className="text-gray-600">expert</p>
      <p className="text-gray-600">Eddies</p>
    </>
  );
}

function DetailsSection() {
  return (
    <div className="prose">
      # Resources

## Facebook Groups

The [Alaska Backcountry Ski Addiction](https://www.facebook.com/groups/583971298332539/)
Facebook group is a great place to ask questions, share photos, and find partners.
It's probably the most active backcountry skiing group in Alaska.

If you're a woman, a less gatekeepy and bro-y alternative is the
[AK Chicks Who Backcountry Ski/Splitboard](https://www.facebook.com/groups/316805289670797)
Facebook group.

## Strava Heatmap

Use the [Strava Global Heatmap](https://www.strava.com/maps/global-heatmap?sport=WinterLike&style=winter&terrain=true&labels=true&poi=false&cPhotos=false&gColor=orange&gOpacity=100#9.83/60.7484/-149.1691) to find where people commonly go.
Even if people are secretive about their favorite spots, they still post their tracks to Strava.
If you use GaiaGPS, you can add the Strava Heatmap as a layer
by following [this tutorial](https://gist.github.com/NickCrews/bdd7dc9d5d82003611dce0932a202644).

## Stores

- [AMH](https://www.alaskamountaineering.com/) is a locally owned outdoor store in Anchorage.
  It has a comparable/better selection than REI, especially for sepcialty and technical gear.
- [REI](https://www.rei.com/stores/anchorage.html) is a national outdoor store with a location in Anchorage.
- [Hoarding Marmot](https://www.hoardingmarmot.com/) is a consignment store in Anchorage offering new and used technical gear.
- [Powder Hound Ski Shop](https://www.powderhoundak.com/) is a ski shop in Girdwood.
  They are a little more resort-oriented (since they are at the base of Alyeska),
  so they don't have as wide of a selection of backcountry gear (eg skins)
  as AMH, but otherwise are great.

## Guide Services and Courses

Do you see someone missing? Contact me to add them!

- [Alaska Guide Collective](https://www.alaskaguidecollective.com/) is a guild of AMGA guides in Alaska.
  They often offer avalanche courses.
- [Remarkable Adventures](https://remarkableadv.com/) is a guide service based in Girdwood
  ran by AMGA Certified Ski Guide Nick D'Alessio.
- [Joe Stock](https://www.stockalpine.com/) is an IFMGA Mountain Guide based in Anchorage.
- [Elliot Gaddy](https://elliotgaddy.com/) is an IFMGA Mountain Guide based in Anchorage.

    </div>
  );
}


const DetailPage = () => {
  return (
    <>
    <style>{`
      #listing-grid {
        display: grid;
        grid-template-columns: 1fr;
        grid-template-areas:
          "title"
          "stats"
          "map"
          "content";
      }

      #title { grid-area: title; }
      #map { grid-area: map; }
      #content { grid-area: content; }
      #stats { grid-area: stats; }
      #title-and-content { 
        display: contents;
        grid-area: title-and-content;
      }
      #map-and-stats {
        display: contents;
        grid-area: map-and-stats;
      }

      @media (min-width: 992px) {
        #listing-grid {
          grid-template-areas:
            "map-and-stats title-and-content"
        }

        #map {
          max-height: 50vh;
        }

        #title-and-content {
          display: grid;
          grid-template-columns: 1fr;
          grid-template-areas:
            "title"
            "content";
        }

        #map-and-stats {
          display: grid;
          grid-template-columns: 1fr;
          grid-template-areas:
            "map"
            "stats";
        }
      }
    `}</style>
    <div id="listing-grid" >
      <div id="map-and-stats" className='max-h-screen'>
        <div id="map" >
          <MapStatic items={[]}/>
        </div>
        <div id="stats" className='p-4'>
          <StatsSection />
        </div>
      </div>
      <div id="title-and-content" className='max-w-xl'>
        <div id="title" className='p-4'>
          <TitleSection />
        </div>
        <div id="content" className='p-4'>
          <DetailsSection />
        </div>
      </div>
    </div>
    </>
  );
};

export default DetailPage;