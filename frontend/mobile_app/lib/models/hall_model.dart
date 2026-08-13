class HallModel {
  final String hallId;
  final String name;
  final int capacity;
  final bool availability;
  final String building;
  final String floor;
  final String type;
  final List<String> amenities;
  final String? description;
  final double? latitude;
  final double? longitude;
  final bool isOccupied;
  final String? currentLecture;
  final String? nextLecture;
  final String? nextLectureTime;

  HallModel({
    required this.hallId,
    required this.name,
    required this.capacity,
    required this.availability,
    required this.building,
    required this.floor,
    required this.type,
    required this.amenities,
    this.description,
    this.latitude,
    this.longitude,
    this.isOccupied = false,
    this.currentLecture,
    this.nextLecture,
    this.nextLectureTime,
  });

  factory HallModel.fromJson(Map<String, dynamic> json) {
    List<String> parsedAmenities = [];
    if (json['amenities'] != null) {
      parsedAmenities = List<String>.from(json['amenities']);
    } else {
      parsedAmenities = ['Projector', 'AC', 'Sound System', 'Wi-Fi'];
    }

    return HallModel(
      hallId: json['hallId'] ?? '',
      name: json['name'] ?? 'Lecture Hall',
      capacity: json['capacity'] is int ? json['capacity'] : int.tryParse('${json['capacity']}') ?? 50,
      availability: json['availability'] ?? true,
      building: json['building'] ?? 'Faculty of Computing',
      floor: json['floor'] ?? 'Ground Floor',
      type: json['type'] ?? 'Lecture Hall',
      amenities: parsedAmenities,
      description: json['description'],
      latitude: json['latitude'] != null ? (json['latitude'] as num).toDouble() : null,
      longitude: json['longitude'] != null ? (json['longitude'] as num).toDouble() : null,
      isOccupied: json['is_occupied'] ?? false,
      currentLecture: json['current_lecture'],
      nextLecture: json['next_lecture'],
      nextLectureTime: json['next_lecture_time'],
    );
  }
}
