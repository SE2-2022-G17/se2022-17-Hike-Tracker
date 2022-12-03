import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from '!mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax

mapboxgl.accessToken = 'pk.eyJ1IjoieG9zZS1ha2EiLCJhIjoiY2xhYTk1Y2FtMDV3bzNvcGVhdmVrcjBjMSJ9.RJzgFhkHn2GnC-uNPiQ4fQ';

function MapPicker(props) {
    const { lng, setLng, lat, setLat } = props;
    const mapContainer = useRef(null);
    const map = useRef(null);

    useEffect(() => {
        if (map.current) return; // initialize map only once
        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: 'mapbox://styles/mapbox/streets-v12',
            center: [lng, lat],
            zoom: 14
        });

        map.current.on('load', () => {
            const marker = new mapboxgl.Marker({
                color: "red",
                draggable: true
            })
                .setLngLat([lng, lat])

            if (map.current) marker.addTo(map.current);

            marker.on('dragend', function (e) {
                var lngLat = e.target.getLngLat();
                setLng(lngLat['lng'].toFixed(5));
                setLat(lngLat['lat'].toFixed(5));
            })
        });

    });

    return (
        <div>
            <div className="sidebar">
                Longitude: {lng} | Latitude: {lat}
            </div>
            <div ref={mapContainer} className="map-container-picker" />
        </div>
    );
}

export default MapPicker;