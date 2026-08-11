class Facility {
  final String name;
  final String icon;

  Facility({
    required this.name,
    required this.icon,
  });
}

class Location {
  final String address;
  final double latitude;
  final double longitude;
  final String? imageUrl;

  Location({
    required this.address,
    required this.latitude,
    required this.longitude,
    this.imageUrl,
  });
}

class Hall {
  final String id;
  final String hallCode;
  final String hallName;
  final String building;
  final int capacity;
  final bool isAvailable;
  final bool isFavorite;
  final List<Facility> facilities;
  final Location location;
  final int floor;
  final int seatingArrangements;

  Hall({
    required this.id,
    required this.hallCode,
    required this.hallName,
    required this.building,
    required this.capacity,
    required this.isAvailable,
    required this.isFavorite,
    required this.facilities,
    required this.location,
    required this.floor,
    required this.seatingArrangements,
  });

  Hall copyWith({
    bool? isFavorite,
  }) {
    return Hall(
      id: id,
      hallCode: hallCode,
      hallName: hallName,
      building: building,
      capacity: capacity,
      isAvailable: isAvailable,
      isFavorite: isFavorite ?? this.isFavorite,
      facilities: facilities,
      location: location,
      floor: floor,
      seatingArrangements: seatingArrangements,
    );
  }

  /// Builds a Hall from the JSON returned by GET /halls/
  /// Backend fields: id, hall_code, hall_name, building, capacity, floor,
  /// seating_arrangements, is_available, facilities ("wifi,projector,ac"),
  /// address, latitude, longitude.
  factory Hall.fromJson(Map<String, dynamic> json) {
    final facilitiesRaw = (json['facilities'] as String? ?? '')
        .split(',')
        .map((f) => f.trim())
        .where((f) => f.isNotEmpty)
        .toList();

    return Hall(
      id: json['id'].toString(),
      hallCode: json['hall_code'] ?? '',
      hallName: json['hall_name'] ?? '',
      building: json['building'] ?? '',
      capacity: json['capacity'] ?? 0,
      isAvailable: (json['is_available']?.toString() ?? 'true') == 'true',
      isFavorite: false, // favorites are local-only for now, not stored on backend
      facilities: facilitiesRaw
          .map((name) => Facility(name: _titleCase(name), icon: name))
          .toList(),
      location: Location(
        address: json['address'] ?? '',
        latitude: double.tryParse(json['latitude']?.toString() ?? '') ?? 0.0,
        longitude: double.tryParse(json['longitude']?.toString() ?? '') ?? 0.0,
        imageUrl: null,
      ),
      floor: json['floor'] ?? 1,
      seatingArrangements: json['seating_arrangements'] ?? json['capacity'] ?? 0,
    );
  }

  static String _titleCase(String s) =>
      s.isEmpty ? s : '${s[0].toUpperCase()}${s.substring(1)}';
}

// Kept only as a fallback/reference for UI development when the backend
// isn't running. Once ApiService.fetchHalls() is wired up, this is unused.
List<Hall> mockHalls = [
  Hall(
    id: '1',
    hallCode: 'LH-101',
    hallName: 'Lecture Hall A',
    building: 'Computing Building A',
    capacity: 150,
    isAvailable: true,
    isFavorite: false,
    facilities: [
      Facility(name: 'WiFi', icon: 'wifi'),
      Facility(name: 'Projector', icon: 'projector'),
      Facility(name: 'Full AC', icon: 'ac'),
    ],
    location: Location(
      address: 'Main Campus, Wing B',
      latitude: 40.7128,
      longitude: -74.0060,
      imageUrl: null,
    ),
    floor: 1,
    seatingArrangements: 150,
  ),
];
