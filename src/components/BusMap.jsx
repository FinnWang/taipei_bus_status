import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon in Leaflet + Vite/Webpack
// https://github.com/Leaflet/Leaflet/issues/4968
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Function to update map view when data changes
function MapUpdater({ center }) {
    const map = useMap();
    // Optional: map.setView(center); // Keep disabled to allow user panning without reset
    return null;
}

const BusMap = ({ busLocations }) => {
    // Default center: Taipei Main Station
    const defaultCenter = [25.0478, 121.5170];

    return (
        <div className="map-container" style={{ height: '500px', width: '100%', borderRadius: '12px', overflow: 'hidden', marginBottom: '2rem', border: '1px solid var(--border-color)' }}>
            <MapContainer
                center={defaultCenter}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={true}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {busLocations.map((bus) => {
                    // Check for valid coordinates
                    if (!bus.BusPosition?.PositionLat || !bus.BusPosition?.PositionLon) return null;

                    const position = [bus.BusPosition.PositionLat, bus.BusPosition.PositionLon];
                    const direction = bus.Direction === 0 ? '去程' : '返程';
                    const speed = bus.Speed ? `${bus.Speed} km/h` : '靜止';

                    return (
                        <Marker key={bus.PlateNumb} position={position}>
                            <Popup>
                                <div style={{ minWidth: '150px' }}>
                                    <h3 style={{ margin: '0 0 5px 0', color: 'var(--primary-color)' }}>{bus.RouteName?.Zh_tw}</h3>
                                    <div style={{ fontSize: '0.9rem' }}>
                                        <p style={{ margin: '2px 0' }}><strong>車號:</strong> {bus.PlateNumb}</p>
                                        <p style={{ margin: '2px 0' }}><strong>往:</strong> {direction}</p>
                                        <p style={{ margin: '2px 0' }}><strong>速度:</strong> {speed}</p>
                                        <p style={{ margin: '2px 0', fontSize: '0.8rem', color: '#666' }}>
                                            更新: {new Date(bus.SrcUpdateTime).toLocaleTimeString()}
                                        </p>
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}
            </MapContainer>
        </div>
    );
};

export default BusMap;
