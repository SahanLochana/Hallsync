import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';

class CampusMapScreen extends StatefulWidget {
  const CampusMapScreen({super.key});

  @override
  State<CampusMapScreen> createState() => _CampusMapScreenState();
}

class _CampusMapScreenState extends State<CampusMapScreen> {
  GoogleMapController? mapController;
  
  
  final LatLng facultyOfComputing = const LatLng(6.7116, 80.7903);

  Set<Marker> _getMarkers() {
    return {
      Marker(
        markerId: const MarkerId('susl_computing'),
        position: facultyOfComputing,
        infoWindow: const InfoWindow(
          title: 'Faculty of Computing',
          snippet: 'Sabaragamuwa University of Sri Lanka',
        ),
        onTap: () {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Faculty of Computing Selected')),
          );
        },
      ),
    };
  }

  void _onMapCreated(GoogleMapController controller) {
    mapController = controller;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('FOC - SUSL Map'),
        elevation: 0,
      ),
      body: GoogleMap(
        onMapCreated: _onMapCreated,
        initialCameraPosition: CameraPosition(
          target: facultyOfComputing, 
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