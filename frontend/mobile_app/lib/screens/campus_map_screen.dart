import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';

class CampusMapScreen extends StatefulWidget {
  
  final String? selectedHallName;
  
  const CampusMapScreen({super.key, this.selectedHallName});

  @override
  State<CampusMapScreen> createState() => _CampusMapScreenState();
}

class _CampusMapScreenState extends State<CampusMapScreen> {
  GoogleMapController? mapController;
  
  
  final LatLng defaultLocation = const LatLng(6.7826747681725905, 80.78712);

  final Map<String, LatLng> hallLocations = {
    'old auditorium': const LatLng(6.715873084057728, 80.7886887968665), 
    'nlh': const LatLng(6.713940192096162, 80.78851676849655),            
    'mini auditorium': const LatLng(6.715265991261843, 80.79048194671753),
    'se department': const LatLng(6.71603500898481, 80.78980630752359),       
  };

  Set<Marker> _getMarkers() {
    LatLng markerPosition = defaultLocation;
    String markerTitle = 'Faculty of Computing';


    if (widget.selectedHallName != null && hallLocations.containsKey(widget.selectedHallName!.toLowerCase())) {
      markerPosition = hallLocations[widget.selectedHallName!.toLowerCase()]!;
      markerTitle = widget.selectedHallName!;
    }

    return {
      Marker(
        markerId: const MarkerId('selected_hall'),
        position: markerPosition,
        infoWindow: InfoWindow(
          title: markerTitle,
          snippet: 'Sabaragamuwa University of Sri Lanka',
        ),
      ),
    };
  }

  void _onMapCreated(GoogleMapController controller) {
    mapController = controller;
    
  
    Future.delayed(const Duration(milliseconds: 500), () {
      LatLng targetPosition = defaultLocation;
      if (widget.selectedHallName != null && hallLocations.containsKey(widget.selectedHallName!.toLowerCase())) {
        targetPosition = hallLocations[widget.selectedHallName!.toLowerCase()]!;
      }

      mapController?.animateCamera(
        CameraUpdate.newCameraPosition(
          CameraPosition(
            target: targetPosition,
            zoom: 18.5, 
          ),
        ),
      );
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.selectedHallName ?? 'FOC - SUSL Map'),
        elevation: 0,
      ),
      body: GoogleMap(
        onMapCreated: _onMapCreated,
        initialCameraPosition: CameraPosition(
          target: defaultLocation, 
          zoom: 17.5, 
        ),
        markers: _getMarkers(), 
        mapType: MapType.normal,
        myLocationEnabled: true,
        myLocationButtonEnabled: true,
        zoomControlsEnabled: true,
      ),
    );
  }
}