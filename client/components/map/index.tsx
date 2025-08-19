"use client";

import * as React from "react";
import Map, { Layer, Marker, Source } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";

export default function MapView() {
  // Example route (GeoJSON LineString)
  const routeGeoJSON = {
    type: "Feature",
    properties: {},
    geometry: {
      type: "LineString",
      coordinates: [
        [77.5946, 12.9716], // Bengaluru center
        [77.6, 12.975],
        [77.61, 12.98],
        [77.62, 12.985],
        [77.63, 12.99],
      ],
    },
  };

  // Marker state (start at first coordinate)
  const [markerIndex, setMarkerIndex] = React.useState(0);
  const [markerPos, setMarkerPos] = React.useState(routeGeoJSON.geometry.coordinates[0]);

  // Simulate live movement
  //   React.useEffect(() => {
  //     const interval = setInterval(() => {
  //       setMarkerIndex((prev) => {
  //         const next = (prev + 1) % routeGeoJSON.geometry.coordinates.length;
  //         setMarkerPos(routeGeoJSON.geometry.coordinates[next]);
  //         return next;
  //       });
  //     }, 1500); // move every 1.5s
  //     return () => clearInterval(interval);
  //   }, []);

  return (
    <div className="h-[300px] w-full">
      <Map
        initialViewState={{
          longitude: markerPos[0],
          latitude: markerPos[1],
          zoom: 13,
        }}
        style={{ width: "100%", height: "100%" }}
        mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
      >
        {/* Live marker */}
        <Marker longitude={markerPos[0]} latitude={markerPos[1]} color="red" />

        {/* Route line */}
        <Source id="route" type="geojson" data={""}>
          <Layer id="route-line" type="line" paint={{ "line-color": "#007cbf", "line-width": 4 }} />
        </Source>
      </Map>
    </div>
  );
}
