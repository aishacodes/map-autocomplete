import React, { useState, useRef, useEffect } from "react";
import {
  GoogleMap,
  Autocomplete,
  Marker,
  LoadScript,
} from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "400px",
  borderRadius: "1rem",
};

const Map = () => {
  const [form, setForm] = useState({});
  console.log(form); /// you get the data here
  const [selectedLocation, setSelectedLocation] =
    useState<google.maps.places.PlaceResult | null>(null);
  const [center, setCenter] = useState<google.maps.LatLngLiteral | undefined>();
  const mapRef = useRef<google.maps.Map | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const initialCenter = { lat, lng };
        setCenter(initialCenter);
      });
    }
  }, []);

  const handlePlaceSelect = () => {
    if (autocompleteRef.current && mapRef.current) {
      const place = autocompleteRef.current.getPlace();

      if (place && place.geometry && place.geometry.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        const newCenter = { lat, lng };
        setForm({ ...form, lat, long: lng });
        setCenter(newCenter);
        setShowMap(true);
        setSelectedLocation(place);
        mapRef.current.panTo(newCenter);
      }
    }
  };

  useEffect(() => {
    if (mapRef.current && selectedLocation?.geometry?.location) {
      const lat = selectedLocation.geometry.location.lat();
      const lng = selectedLocation.geometry.location.lng();
      mapRef.current.setCenter({ lat, lng });
    }
  }, [selectedLocation]);

  const handleMarkerDragEnd = (event: any) => {
    const { latLng } = event;
    const lat = latLng.lat();
    const lng = latLng.lng();
    setForm({ ...form, lat, long: lng });
  };
  return (
    <LoadScript googleMapsApiKey={"YourAPIKey"} libraries={["places"]}>
      <div style={{ margin: "10rem" }}>
        <label htmlFor="">Location</label>
        <Autocomplete
          onLoad={(autocomplete) => {
            autocompleteRef.current = autocomplete;
            autocomplete.setFields(["geometry"]);
          }}
          onPlaceChanged={handlePlaceSelect}
        >
          <input
            className="input"
            placeholder="Location"
            onBlur={(e) =>
              form && setForm && setForm({ ...form, location: e.target.value })
            }
          />
        </Autocomplete>
        <div style={{ display: showMap ? "block" : "none" }}>
          <GoogleMap
            onLoad={(map) => {
              mapRef.current = map;
            }}
            mapContainerStyle={containerStyle}
            zoom={15}
          >
            {center && (
              <Marker
                position={{ lat: center.lat, lng: center.lng }}
                draggable={true}
                onDragEnd={handleMarkerDragEnd}
              />
            )}
          </GoogleMap>
        </div>
      </div>
    </LoadScript>
  );
};

export default React.memo(Map);
