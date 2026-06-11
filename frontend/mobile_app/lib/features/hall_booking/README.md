# Hall Booking Feature

A comprehensive hall booking interface for the HallSync mobile application, displaying a list of available halls with search functionality and detailed hall information.

## Features

✅ **Responsive Layout**
- Tablet/Desktop layout with side-by-side panels (list + details)
- Mobile layout with modal/stacked navigation

✅ **Hall Listing**
- Search halls by name, code, or building
- View hall status (Available/Unavailable)
- Quick facility indicators
- Favorite/bookmark functionality

✅ **Hall Details Panel**
- Comprehensive hall information
- Capacity and facility details
- Location information with map integration
- Quick booking action

✅ **UI Components**
- Facility icons with tooltips
- Status badges
- Responsive cards
- Search functionality

## Project Structure

```
lib/features/hall_booking/
├── models/
│   ├── hall.dart           # Hall data models
│   └── index.dart          # Model exports
├── screens/
│   └── hall_booking_screen.dart  # Main screen
├── widgets/
│   ├── hall_card.dart            # Hall list item
│   ├── hall_details_panel.dart   # Details view
│   ├── facility_icon.dart        # Facility display
│   └── index.dart                # Widget exports
└── README.md               # This file
```

## Data Models

### Hall
Represents a lecture hall with:
- `id`: Unique identifier
- `hallCode`: Hall code (e.g., LH-101)
- `hallName`: Display name
- `building`: Building name
- `capacity`: Student capacity
- `isAvailable`: Availability status
- `isFavorite`: Bookmark status
- `facilities`: List of facilities
- `location`: Location information
- `floor`: Floor number
- `seatingArrangements`: Number of seats

### Facility
Hall amenities:
- `name`: Facility name (WiFi, Projector, AC, etc.)
- `icon`: Icon identifier

### Location
Geographic information:
- `address`: Physical address
- `latitude`: GPS latitude
- `longitude`: GPS longitude
- `imageUrl`: Optional image URL

## Usage

### Basic Integration

```dart
import 'package:mobile_app/features/hall_booking/screens/hall_booking_screen.dart';

// Navigate to hall booking
Navigator.push(
  context,
  MaterialPageRoute(builder: (context) => const HallBookingScreen()),
);
```

### Customization

#### Colors
The feature uses a consistent color palette:
- Primary Blue: `#1E5AA8`
- Background: `#F4F7FB`
- Text Dark: `#1F2937`
- Text Light: `#6B7280`

Modify `HallBookingScreen` to change colors globally.

#### Mock Data
Edit `mockHalls` in `models/hall.dart` to update initial hall data.

#### Responsive Breakpoint
Mobile/tablet breakpoint: `768px` (customizable in `_buildMobileLayout()`)

## Features in Detail

### Search Functionality
- Real-time filtering by hall name, code, or building
- Case-insensitive search
- Clear button when search is active

### Favorite System
- Toggle favorites with heart icon
- Persists selection during session
- Visual feedback (red filled heart when favorited)

### Hall Details
Shows comprehensive information:
- Hall name and capacity
- Key facilities with icons
- Location with map placeholder
- Additional details (code, building, floor, etc.)
- Google Maps integration ready

### Responsive Design
- **Mobile**: Stack layout with navigation
- **Tablet+**: Side-by-side panels
- Automatic adaptation based on screen width

## API Integration Points

The following areas are ready for backend integration:

1. **Search Endpoint**: Replace mock data with API call
   ```dart
   Future<List<Hall>> searchHalls(String query) async {
     // API call to backend
   }
   ```

2. **Favorite Management**: Save preferences to backend
   ```dart
   Future<void> toggleFavorite(String hallId) async {
     // API call to backend
   }
   ```

3. **Booking**:  Implement booking workflow
   ```dart
   Future<void> bookHall(String hallId, DateTime date, TimeRange time) async {
     // API call to backend
   }
   ```

4. **Map Integration**: Open Google Maps
   ```dart
   Future<void> openGoogleMaps(double lat, double lng) async {
     // Use url_launcher package
   }
   ```

## Dependencies

Current dependencies in `pubspec.yaml`:
- `flutter`: ^3.11.1
- `flutter_lints`: ^6.0.0

Future dependencies to add:
- `url_launcher`: For Google Maps integration
- `http` or `dio`: For API calls
- `provider` or `riverpod`: For state management

## Future Enhancements

- [ ] Real-time availability updates
- [ ] Calendar-based booking
- [ ] Filters (capacity, facilities, floor)
- [ ] Sort options (by name, capacity, etc.)
- [ ] Reviews/ratings system
- [ ] Booking history
- [ ] Time slot availability
- [ ] User preferences/saved halls
- [ ] Push notifications

## Troubleshooting

### Search not working
- Ensure `_searchController` is properly initialized
- Check that hall data is loaded in `initState`

### Layout issues on mobile
- Verify screen width detection in `_buildMobileLayout()`
- Test on different device sizes

### Navigation back from details
- Mobile: Tap back button to return to list
- Tablet: Click on list item to switch selection

## File References

- Screen: [hall_booking_screen.dart](screens/hall_booking_screen.dart)
- Models: [hall.dart](models/hall.dart)
- Widgets: [hall_card.dart](widgets/hall_card.dart), [hall_details_panel.dart](widgets/hall_details_panel.dart)
- Main app: [main.dart](../../main.dart)
