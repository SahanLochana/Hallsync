import 'package:flutter/material.dart';
import '../models/hall.dart';
import 'facility_icon.dart';

class HallDetailsPanel extends StatelessWidget {
  final Hall? hall;

  const HallDetailsPanel({super.key, this.hall});

  @override
  Widget build(BuildContext context) {
    if (hall == null) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.info_outline,
              size: 48,
              color: const Color(0xFFD1D5DB),
            ),
            const SizedBox(height: 16),
            const Text(
              'Select a hall to view details',
              style: TextStyle(
                fontSize: 14,
                color: Color(0xFF9CA3AF),
              ),
            ),
          ],
        ),
      );
    }

    return SingleChildScrollView(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header with back button
            Row(
              children: [
                GestureDetector(
                  onTap: () {
                    // In mobile view, this would pop the navigation
                  },
                  child: const Icon(
                    Icons.arrow_back,
                    color: Color(0xFF1E5AA8),
                  ),
                ),
                const SizedBox(width: 12),
                Text(
                  '${hall!.hallName} Details',
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                    color: Color(0xFF1F2937),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),

            // Hall Name and Capacity
            Text(
              hall!.hallName,
              style: const TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.w700,
                color: Color(0xFF1F2937),
              ),
            ),
            const SizedBox(height: 4),
            Text(
              'Capacity: ${hall!.capacity} students',
              style: const TextStyle(
                fontSize: 14,
                color: Color(0xFF6B7280),
              ),
            ),
            const SizedBox(height: 20),

            // Key Facilities Section
            const Text(
              'KEY FACILITIES',
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: Color(0xFF6B7280),
                letterSpacing: 0.5,
              ),
            ),
            const SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: hall!.facilities
                  .map((facility) => FacilityIcon(
                        iconName: facility.icon,
                        label: facility.name,
                        size: 60,
                      ))
                  .toList(),
            ),
            const SizedBox(height: 28),

            // Location Section
            const Text(
              'LOCATION',
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: Color(0xFF6B7280),
                letterSpacing: 0.5,
              ),
            ),
            const SizedBox(height: 12),
            Container(
              width: double.infinity,
              height: 200,
              decoration: BoxDecoration(
                color: const Color(0xFFE5E7EB),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFFD1D5DB)),
              ),
              child: Stack(
                children: [
                  // Map placeholder
                  Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.location_on,
                          size: 40,
                          color: const Color(0xFF1E5AA8),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          hall!.location.address,
                          style: const TextStyle(
                            fontSize: 12,
                            color: Color(0xFF6B7280),
                          ),
                          textAlign: TextAlign.center,
                        ),
                      ],
                    ),
                  ),
                  // Map pin indicator
                  Positioned(
                    bottom: 16,
                    right: 16,
                    child: Container(
                      width: 40,
                      height: 40,
                      decoration: BoxDecoration(
                        color: const Color(0xFF1E5AA8),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Icon(
                        Icons.location_on,
                        color: Colors.white,
                        size: 20,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            Text(
              hall!.location.address,
              style: const TextStyle(
                fontSize: 12,
                color: Color(0xFF6B7280),
              ),
            ),
            const SizedBox(height: 20),

            // Open in Google Maps Button
            SizedBox(
              width: double.infinity,
              height: 44,
              child: ElevatedButton.icon(
                onPressed: () {
                  // TODO: Implement Google Maps opening
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Opening Google Maps...')),
                  );
                },
                icon: const Icon(Icons.map),
                label: const Text('Open in Google Maps'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF1E5AA8),
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
              ),
            ),
            const SizedBox(height: 28),

            // Additional Details
            _detailRow('Hall Code', hall!.hallCode),
            _detailRow('Building', hall!.building),
            _detailRow('Floor', 'Floor ${hall!.floor}'),
            _detailRow('Seating Arrangements', '${hall!.seatingArrangements} seats'),
            _detailRow(
              'Availability',
              hall!.isAvailable ? 'Available' : 'Unavailable',
            ),
            const SizedBox(height: 28),

            // Book Now Button
            SizedBox(
              width: double.infinity,
              height: 48,
              child: ElevatedButton(
                onPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Booking ${hall!.hallName}...')),
                  );
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF1E5AA8),
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
                child: const Text(
                  'Book Now',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _detailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 12),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: const TextStyle(
              fontSize: 12,
              color: Color(0xFF6B7280),
            ),
          ),
          Text(
            value,
            style: const TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: Color(0xFF1F2937),
            ),
          ),
        ],
      ),
    );
  }
}
