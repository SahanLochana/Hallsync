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
}

// Mock data for testing
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
  Hall(
    id: '2',
    hallCode: 'LH-101',
    hallName: 'Auditorium A',
    building: 'Computing Building A',
    capacity: 250,
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
    seatingArrangements: 250,
  ),
  Hall(
    id: '3',
    hallCode: 'LH-101',
    hallName: 'Conference Hall',
    building: 'Computing Building A',
    capacity: 200,
    isAvailable: false,
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
    floor: 2,
    seatingArrangements: 200,
  ),
  Hall(
    id: '4',
    hallCode: 'LH-101',
    hallName: 'Meeting Room',
    building: 'Computing Building A',
    capacity: 50,
    isAvailable: true,
    isFavorite: false,
    facilities: [
      Facility(name: 'WiFi', icon: 'wifi'),
      Facility(name: 'Projector', icon: 'projector'),
      Facility(name: 'Full AC', icon: 'ac'),
    ],
    location: Location(
      address: 'Main Campus, Wing A',
      latitude: 40.7128,
      longitude: -74.0060,
      imageUrl: null,
    ),
    floor: 1,
    seatingArrangements: 50,
  ),
  Hall(
    id: '5',
    hallCode: 'LH-101',
    hallName: 'Board Room',
    building: 'Computing Building A',
    capacity: 30,
    isAvailable: true,
    isFavorite: false,
    facilities: [
      Facility(name: 'WiFi', icon: 'wifi'),
      Facility(name: 'Projector', icon: 'projector'),
      Facility(name: 'Full AC', icon: 'ac'),
    ],
    location: Location(
      address: 'Main Campus, Wing C',
      latitude: 40.7128,
      longitude: -74.0060,
      imageUrl: null,
    ),
    floor: 3,
    seatingArrangements: 30,
  ),
];
