import React, { Component } from "react";
import { compose, withProps, withHandlers } from "recompose";
import {
    withScriptjs,
    withGoogleMap,
    GoogleMap,
    Marker
} from "react-google-maps";
import Socket from "../../socket";

const {
    MarkerClusterer
} = require("react-google-maps/lib/components/addons/MarkerClusterer");

const MAP_API =
    "https://maps.googleapis.com/maps/api/" +
    "js?v=3.exp&" +
    "libraries=geometry,drawing,places";

let markers = [];

let MapComponent = compose(
    withProps({
        googleMapURL: MAP_API,
        loadingElement: <div style={{ height: "100%" }} />,
        containerElement: <div style={{ height: "780px" }} />,
        mapElement: <div style={{ height: "100%" }} />
    }),
    withHandlers({
        onMarkerClustererClick: () => markerClusterer => {
            const clickedMarkers = markerClusterer.getMarkers();

            console.log(
                "Current clicked markers length: ${clickedMarkers.length}"
            );

            console.log(clickedMarkers);
        }
    }),
    withScriptjs,
    withGoogleMap
)(props => (
    <GoogleMap
        scaleControl={false}
        defaultOptions={{
            scrollwheel: true
            // disableDefaultUI: true,
            // mapTypeControl: false,
            // scaleControl: false,
            // navigationControl: false,
            // draggable: false,
            // streetViewControl: false
        }}
        // mapTypeId={"ROADMAP"}
        zoom={13}
        defaultCenter={{ lat: 35.7412568, lng: 51.4368788 }}
    >
        <MarkerClusterer
            onClick={props.onMarkerClustererClick}
            averageCenter
            enableRetinaIcons
            gridSize={60}
        >
            {props.markers.map(marker => (
                <Marker
                    key={marker.id}
                    position={{
                        lat: marker.latitude,
                        lng: marker.longitude
                    }}
                />
            ))}
        </MarkerClusterer>

        {/* 
            {props.isMarkerShown && (
                <Marker position={{ lat: 30, lng: 50 }} onClick={props.onMarkerClick} />
            )} 
            */}
    </GoogleMap>
));

class Map extends Component {
    constructor(props) {
        super(props);

        const bounds = {
            sw: { lat: -60, lng: -90 },
            ne: { lat: 60, lng: -90 }
        };

        // const mapPaneName = OverlayView.OVERLAY_MOUSE_TARGET;

        // set initial filter state
        const initialFilter = {
            logic: "and",
            filters: []
        };

        // set some constants
        this.defaultPageSize = 5000;
        this.defaultButtonCount = 5;

        // bind state to callback events which will be
        // triggered when the server response fetched
        this.callbackRead = this.callbackRead.bind(this);

        Socket.emit(
            "provider:read",
            JSON.stringify({
                skip: 0,
                limit: this.defaultPageSize,
                search: {
                    ownership: 0
                },
                filter: initialFilter,
                sort: []
            }),
            this.callbackRead
        );

        this.state = {
            dropdownOpen: false,
            radioSelected: 2,
            isMarkerShown: false,
            events: this.logs
        };

        this.MyMapComponent = MapComponent;
    }

    callbackRead(stringResponse) {
        // parse the response
        const response = JSON.parse(stringResponse);

        console.log("[Provider.funcResponseCallback] response:", response);

        if (response === null) {
            return;
            // TODO: handle this issue by a timeout and
            // calling the pull request again
        } else if (response.code !== 200) {
            alert(response);
            return;
        }

        // markers = response.providers;

        // console.log("[Provider.funcResponseCallback] markers:", markers);

        markers = [];
        for (var index = 0; index < response.providers.length; index++) {
            let provider = response.providers[index];

            markers[index] = {
                id: provider.id,
                name: provider.name,
                latitude: provider.latitude,
                longitude: provider.longitude
            };
        }

        this.setState({
            markers: markers
        });

        console.log(
            "[Provider.funcResponseCallback] state.markers:",
            response.providers
        );
    }

    toggle() {
        this.setState({
            dropdownOpen: !this.state.dropdownOpen
        });
    }

    onRadioBtnClick(radioSelected) {
        this.setState({
            radioSelected: radioSelected
        });
    }

    componentWillMount() {
        console.log("[INFO][Map.componentWillMount] markers:", markers);
        this.setState({ markers: markers });
    }

    // componentDidMount() {
    //     this.delayedShowMarker();
    //     const url = [
    //         // Length issue
    //         "https://gist.githubusercontent.com",
    //         "/farrrr/dfda7dd7fccfec5474d3",
    //         "/raw/758852bbc1979f6c4522ab4e92d1c92cba8fb0dc/data.json"
    //     ].join("");

    //     fetch(url)
    //         .then(res => res.json())
    //         .then(data => {
    //             console.log(
    //                 "[INFO][Map.componentDidMount] on fetch",
    //                 data
    //             );
    //             // this.setState({ markers: this.state.markers });
    //         });
    // }

    delayedShowMarker = () => {
        setTimeout(() => {
            this.setState({ isMarkerShown: true });
        }, 3000);
    };

    handleMarkerClick = () => {
        this.setState({ isMarkerShown: false });
        this.delayedShowMarker();
    };

    open() {
        console.log("Open was triggered!");
    }

    close() {
        console.log("Close was triggered!");
    }

    render() {
        return (
            <div className="animated fadeIn">
                <this.MyMapComponent
                    markers={this.state.markers}
                    // imgPath={this.state.OverlayImageSrc}
                    // isMarkerShown={this.state.isMarkerShown}
                    // onMarkerClick={this.handleMarkerClick}
                />
            </div>
        );
    }
}

export default Map;
